#!/usr/bin/env python3
"""
generate_portrait_cosmos.py  v2
Transforms a user portrait into the 3D halftone pointillism cosmos.json format.

Key improvements in v2:
- Face-focused crop: excludes torso/clothing which drowns out facial features
- CLAHE-style local contrast enhancement for visible eye sockets, nose, lips
- Zone-specific luminance tuning: hair dark, skin visible, features sharp
- Aggressive sharpening with unsharp mask
- Tight floater band (1 erosion layer) for clean silhouette
- Piecewise gamma curve spreads midtone hs values for better halftone gradation
"""

import os
import sys
import json
import random
import math
import numpy as np
from PIL import Image, ImageEnhance, ImageFilter

# ─────────────────────────── helpers ────────────────────────────

def erode(mask):
    """4-connected binary erosion without scipy."""
    eroded = mask.copy()
    eroded[1:,  :] &= mask[:-1, :]
    eroded[:-1, :] &= mask[1:,  :]
    eroded[:,  1:] &= mask[:, :-1]
    eroded[:, :-1] &= mask[:, 1:]
    return eroded

def dilate(mask):
    """4-connected binary dilation without scipy."""
    dilated = mask.copy()
    dilated[1:,  :] |= mask[:-1, :]
    dilated[:-1, :] |= mask[1:,  :]
    dilated[:,  1:] |= mask[:, :-1]
    dilated[:, :-1] |= mask[:, 1:]
    return dilated

def clahe_numpy(gray_f32, tile_rows=8, tile_cols=8, clip_limit=3.0):
    """
    Approximate CLAHE (Contrast Limited Adaptive Histogram Equalisation).
    Operates on a float32 image in [0, 1] range.
    Returns float32 image in [0, 1] range with locally boosted contrast.
    """
    h, w = gray_f32.shape
    out = np.zeros_like(gray_f32)
    tile_h = math.ceil(h / tile_rows)
    tile_w = math.ceil(w / tile_cols)

    # Build per-tile equalization maps
    eq_maps = []
    for tr in range(tile_rows):
        row_maps = []
        for tc in range(tile_cols):
            r0 = tr * tile_h
            r1 = min(r0 + tile_h, h)
            c0 = tc * tile_w
            c1 = min(c0 + tile_w, w)
            tile = gray_f32[r0:r1, c0:c1]

            # Build histogram
            hist, bin_edges = np.histogram(tile.ravel(), bins=256, range=(0.0, 1.0))
            # Clip histogram
            clip = clip_limit * tile.size / 256
            excess = np.sum(np.maximum(hist - clip, 0))
            hist = np.minimum(hist, clip)
            hist += excess / 256  # redistribute excess uniformly

            # Cumulative distribution
            cdf = np.cumsum(hist)
            cdf = (cdf - cdf.min()) / (cdf.max() - cdf.min() + 1e-10)
            row_maps.append(cdf)
        eq_maps.append(row_maps)

    def apply_eq(val, cdf):
        idx = int(np.clip(val * 255, 0, 255))
        return float(cdf[idx])

    # Bilinear interpolation between tile maps
    for r in range(h):
        for c in range(w):
            # Fractional tile position
            tf_r = (r / max(h - 1, 1)) * (tile_rows - 1)
            tf_c = (c / max(w - 1, 1)) * (tile_cols - 1)
            tr0 = int(tf_r); tr1 = min(tr0 + 1, tile_rows - 1)
            tc0 = int(tf_c); tc1 = min(tc0 + 1, tile_cols - 1)
            ar = tf_r - tr0
            ac = tf_c - tc0

            v = gray_f32[r, c]
            v00 = apply_eq(v, eq_maps[tr0][tc0])
            v01 = apply_eq(v, eq_maps[tr0][tc1])
            v10 = apply_eq(v, eq_maps[tr1][tc0])
            v11 = apply_eq(v, eq_maps[tr1][tc1])

            out[r, c] = ((1 - ar) * (1 - ac) * v00 +
                         (1 - ar) *       ac  * v01 +
                               ar * (1 - ac) * v10 +
                               ar *       ac  * v11)
    return out

def hs_from_lum(lum):
    """
    Piecewise gamma curve for halftone scale.
    - Shadows (lum < 0.25):  gamma 0.60 → spreads low-lum range so dark features are visible
    - Midtones (0.25-0.65):  gamma 0.80 → smooth transition
    - Highlights (> 0.65):   gamma 1.00 → keep bright areas naturally large
    Clamp to [0.065, 1.0] matching original schema.
    """
    if lum < 0.25:
        hs = (lum / 0.25) ** 0.60 * 0.25
    elif lum < 0.65:
        t = (lum - 0.25) / 0.40
        hs = 0.25 + t ** 0.80 * 0.40
    else:
        t = (lum - 0.65) / 0.35
        hs = 0.65 + t * 0.35

    # Scale to [0.065, 1.0]
    hs = 0.065 + hs * (1.0 - 0.065)
    return float(np.clip(hs, 0.065, 1.0))

# ─────────────────────────── main ────────────────────────────────

def generate_cosmos(image_path, backup_json_path, output_json_path):
    print(f"Loading base data from {backup_json_path}...")
    with open(backup_json_path, "r") as f:
        data = json.load(f)

    cols = data["cols"]          # 110
    rows = data["rows"]          # 157
    cell_w, cell_h = data["cell"]  # [0.84926, 0.63694]
    target_aspect = (cols * cell_w) / (rows * cell_h)   # ~0.934186
    num_images = len(data["images"])                      # 1067

    print(f"Grid: {cols}×{rows}, aspect {target_aspect:.4f}, {num_images} images")

    # ─── 1. Load & crop to face region ───────────────────────────
    print(f"Loading portrait from {image_path}...")
    orig_pil = Image.open(image_path).convert("RGB")
    orig_arr = np.array(orig_pil).astype(np.float32)
    orig_h, orig_w = orig_arr.shape[:2]

    # Convert to grayscale for analysis
    gray_orig = (0.299 * orig_arr[:, :, 0] +
                 0.587 * orig_arr[:, :, 1] +
                 0.114 * orig_arr[:, :, 2])

    # Find content bounding box (non-black pixels)
    threshold_px = 12.0
    rows_active = np.where(gray_orig.max(axis=1) > threshold_px)[0]
    cols_active = np.where(gray_orig.max(axis=0) > threshold_px)[0]
    if len(rows_active) == 0 or len(cols_active) == 0:
        raise ValueError("Image appears to be entirely black — check image path.")

    content_top    = int(rows_active[0])
    content_bottom = int(rows_active[-1])
    content_left   = int(cols_active[0])
    content_right  = int(cols_active[-1])
    content_h      = content_bottom - content_top
    content_w      = content_right  - content_left

    print(f"Content region: rows {content_top}-{content_bottom}, cols {content_left}-{content_right}")
    print(f"Content size: {content_w}×{content_h}px")

    # ─── 2. Face-focused crop ─────────────────────────────────────
    # The face (hair top → lower chin) is roughly the top 45% of content height.
    # Keeping only the face+neck avoids bright torso/clothing flooding the halftone.
    # We scan from the top to find where brightness drops after the face.
    face_top_abs    = content_top  # include hair
    face_height_pct = 0.52         # keep top 52% of content = head + short neck
    face_bot_abs    = content_top + int(content_h * face_height_pct)
    face_bot_abs    = min(face_bot_abs, content_bottom)

    # Width: center-crop to match grid aspect ratio
    face_h_px = face_bot_abs - face_top_abs
    target_crop_w = int(round(face_h_px * target_aspect))

    # Center within content width
    content_center_x = (content_left + content_right) // 2
    crop_left  = max(0, content_center_x - target_crop_w // 2)
    crop_right = crop_left + target_crop_w
    if crop_right > orig_w:
        crop_right = orig_w
        crop_left  = max(0, crop_right - target_crop_w)

    print(f"Face crop: [{crop_left}:{crop_right}, {face_top_abs}:{face_bot_abs}]"
          f"  = {crop_right - crop_left}×{face_h_px}px")

    # Crop
    cropped_pil = orig_pil.crop((crop_left, face_top_abs, crop_right, face_bot_abs))

    # ─── 3. Resize to grid ───────────────────────────────────────
    grid_pil = cropped_pil.resize((cols, rows), Image.Resampling.LANCZOS)
    grid_arr = np.array(grid_pil).astype(np.float32)

    # ─── 4. Grayscale ─────────────────────────────────────────────
    lum_raw = (0.299 * grid_arr[:, :, 0] +
               0.587 * grid_arr[:, :, 1] +
               0.114 * grid_arr[:, :, 2]) / 255.0

    print(f"Grid lum stats: min={lum_raw.min():.3f}, max={lum_raw.max():.3f}, "
          f"mean={lum_raw.mean():.3f}")

    # ─── 5. CLAHE local contrast enhancement ──────────────────────
    # Divide grid into 6×6 tiles and equalise each locally.
    # clip_limit=2.5 boosts contrast without over-amplifying noise.
    print("Applying CLAHE...")
    lum_clahe = clahe_numpy(lum_raw, tile_rows=6, tile_cols=6, clip_limit=2.5)
    print(f"Post-CLAHE lum: min={lum_clahe.min():.3f}, max={lum_clahe.max():.3f}, "
          f"mean={lum_clahe.mean():.3f}")

    # ─── 6. Blend CLAHE with original (70/30) ─────────────────────
    # Pure CLAHE can over-equalise; blending keeps global structure
    blend = 0.70
    lum_blended = blend * lum_clahe + (1.0 - blend) * lum_raw
    lum_blended = np.clip(lum_blended, 0.0, 1.0)

    # ─── 7. Convert back to PIL for unsharp mask ─────────────────
    lum_uint8 = (lum_blended * 255).astype(np.uint8)
    lum_pil   = Image.fromarray(lum_uint8, mode='L')

    # Aggressive unsharp mask: radius=2, 200% strength, threshold=1
    sharpened = lum_pil.filter(ImageFilter.UnsharpMask(radius=2, percent=200, threshold=1))

    # Additional global contrast boost
    sharpened = ImageEnhance.Contrast(sharpened).enhance(1.55)

    lum = np.array(sharpened).astype(float) / 255.0
    print(f"Final lum: min={lum.min():.3f}, max={lum.max():.3f}, mean={lum.mean():.3f}")

    # ─── 8. Zone-specific luminance modulation ────────────────────
    # The face has vertical structure: hair (dark), eyes/nose (medium), mouth (brighter).
    # We want all zones to contribute meaningfully without over-brightening anything.
    for r in range(rows):
        frac = r / rows  # 0=top(hair), 1=bottom(neck)
        if frac < 0.15:
            # Hair zone: keep as-is (already dark, defines silhouette)
            factor = 1.0
        elif frac < 0.35:
            # Forehead: slight boost
            factor = 1.10
        elif frac < 0.65:
            # Eye-nose-cheek zone: strongest boost for feature visibility
            t = (frac - 0.35) / 0.30
            factor = 1.25 - 0.05 * t  # 1.25 → 1.20
        elif frac < 0.80:
            # Mouth-chin: moderate boost
            factor = 1.15
        else:
            # Neck bottom: gentle suppression to focus on face
            factor = 0.90
        lum[r, :] = np.clip(lum[r, :] * factor, 0.0, 1.0)

    # ─── 9. Active mask ───────────────────────────────────────────
    # Threshold: cells with luminance > 0.06 are "lit" (part of face/hair).
    # This keeps dark hair and shadow zones while discarding pure black background.
    threshold = 0.06
    active_mask = lum > threshold

    # Compute erosion layers
    e1 = erode(active_mask)   # one erosion → removes outermost ring
    e2 = erode(e1)            # two erosions → removes next ring too
    e3 = erode(e2)            # three erosions → solid core

    layer_outer = active_mask & ~e1   # outermost ring  → floaters (dim 0.15–0.60)
    layer_mid   = e1 & ~e2            # second ring     → near-solid (dim 0.85–1.0)
    layer_core  = e2                  # everything else → solid (dim = 1.0)

    n_outer = int(layer_outer.sum())
    n_mid   = int(layer_mid.sum())
    n_core  = int(layer_core.sum())
    n_total = int(active_mask.sum())
    print(f"Active cells: {n_total} total  "
          f"({n_core} core, {n_mid} mid, {n_outer} outer)")
    print(f"Coverage: {100 * n_total / (cols * rows):.1f}% of grid"
          f"  Floater target ≈ {n_outer} (outer only)")

    # ─── 10. Build cell list ──────────────────────────────────────
    active_coords = []
    rng_jitter = random.Random(1337)

    for r in range(rows):
        for c in range(cols):
            if not active_mask[r, c]:
                continue

            l_val = float(lum[r, c])
            hs    = round(hs_from_lum(l_val), 3)

            if layer_core[r, c]:
                dim = 1.0
            elif layer_mid[r, c]:
                # Second ring — solid, not floating
                dim = 1.0
            else:
                # Outer perimeter: subtle halo floaters
                dim = round(0.42 + 0.28 * rng_jitter.random(), 3)

            col_f = float(c)
            row_f = float(r)
            if dim < 0.99:
                # Micro-jitter for organic edge
                col_f += round((rng_jitter.random() - 0.5) * 0.35, 3)
                row_f += round((rng_jitter.random() - 0.5) * 0.35, 3)

            active_coords.append({
                "col": col_f,
                "row": row_f,
                "hs":  hs,
                "dim": dim,
            })

    N = len(active_coords)
    if N < num_images:
        raise ValueError(f"Only {N} active cells — need at least {num_images}. "
                         f"Lower the threshold or use a brighter image.")

    print(f"Total cells to place: {N}")

    # ─── 11. Assign reals / fillers ───────────────────────────────
    rng_assign = random.Random(42)
    indices    = list(range(N))
    rng_assign.shuffle(indices)

    real_indices = set(indices[:num_images])
    real_img_ids = list(range(num_images))
    rng_assign.shuffle(real_img_ids)

    # ─── 12. Assign depths ────────────────────────────────────────
    depth_min = 56.0
    depth_max = 56.0 + data.get("period", 1384.0)
    all_depths = np.linspace(depth_min, depth_max, N).tolist()
    rng_assign.shuffle(all_depths)

    # ─── 13. Build final cells array ─────────────────────────────
    cells        = []
    real_counter = 0
    filler_counter = 0

    for i, item in enumerate(active_coords):
        is_real = i in real_indices
        if is_real:
            img_id = real_img_ids[real_counter]
            real_counter += 1
            is_filler = 0
        else:
            img_id    = filler_counter % num_images
            filler_counter += 1
            is_filler = 1

        depth = round(float(all_depths[i]), 2)
        # [img_id, r_shift, g_shift, b_shift, depth, col, row, hs, dim, isFiller]
        cells.append([img_id, 0, 0, 0, depth, item["col"], item["row"],
                      item["hs"], item["dim"], is_filler])

    # ─── 14. Verify ───────────────────────────────────────────────
    n_reals   = sum(1 for c in cells if c[9] == 0)
    n_fillers = sum(1 for c in cells if c[9] == 1)
    n_halos   = sum(1 for c in cells if c[8] < 1.0)
    n_unique  = len(set(c[0] for c in cells if c[9] == 0))

    print(f"\nVerification:")
    print(f"  Total cells  : {len(cells)}")
    print(f"  Reals        : {n_reals}  (expected {num_images})")
    print(f"  Fillers      : {n_fillers}")
    print(f"  Halo floaters: {n_halos}")
    print(f"  Unique images: {n_unique}  (expected {num_images})")

    if n_reals != num_images:
        raise RuntimeError(f"Real count mismatch: {n_reals} != {num_images}")
    if n_unique != num_images:
        raise RuntimeError(f"Unique image count mismatch: {n_unique} != {num_images}")

    # ─── 15. Write output ─────────────────────────────────────────
    data["cells"] = cells
    print(f"\nWriting {output_json_path}...")
    with open(output_json_path, "w") as f:
        json.dump(data, f, separators=(",", ":"))

    print("Done! cosmos.json written successfully.")
    return cells


if __name__ == "__main__":
    image_file   = "/home/shamveelkhan/Downloads/vadim-portfolio/profile2.png"
    backup_json  = "/home/shamveelkhan/Downloads/vadim-portfolio/data/cosmos.backup.json"
    output_json  = "/home/shamveelkhan/Downloads/vadim-portfolio/data/cosmos.json"
    generate_cosmos(image_file, backup_json, output_json)
