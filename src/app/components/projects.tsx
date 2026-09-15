"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, ExternalLink } from "lucide-react";

type ProjectCategory =
    | "Cybersecurity"
    | "Full Stack Development"
    | "AI"
    | "SQA";

type Project = {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    link: string;
    date: string;
    category: ProjectCategory;
};

const categories: ProjectCategory[] = [
    "Cybersecurity",
    "Full Stack Development",
    "AI",
    "SQA",
];


const projectsData: Project[] = [
    // ==================== CYBERSECURITY ====================

    {
        id: "velton-cyber",
        name: "Velton – Secure Full Stack Development",
        description:
            "Worked as a Full Stack Developer Intern at Velton, contributing to production web applications with a strong focus on secure development. Worked across frontend and backend systems while applying secure authentication, input validation, access control, and backend security practices.",
        imageUrl: "/velton.png",
        link: "https://www.linkedin.com/company/velton-ai/",
        date: "JAN 2026",
        category: "Cybersecurity",
    },
    
    {
        id: "cyber-1",
        name: "Authorization Hack – FAST Connect",
        description:
            "Identified and responsibly demonstrated an authorization vulnerability in a FAST senior project (FAST Connect). The issue allowed unauthorized access to restricted resources due to improper access control checks. Conducted structured testing, demonstrated the impact responsibly, and highlighted remediation strategies against privilege escalation and IDOR risks.",
        imageUrl: "/hack.png",
        link: "https://medium.com/@shamveelkhilji/broken-otp-why-issuing-a-full-token-at-signup-is-a-security-bug-and-how-to-fix-it-3ed99a2e18b8?postPublishedType=initial",
        date: "JAN 2026",
        category: "Cybersecurity",
    },

    {
        id: "cyber-2",
        name: "PortSwigger Labs – XSS, CSRF, IDOR, and Authentication",
        description:
            "Completed all PortSwigger labs covering XSS, CSRF, IDOR, and authentication vulnerabilities. Built practical experience in vulnerability discovery, exploitation, request manipulation, authentication testing, and understanding effective mitigations for common web security flaws.",
        imageUrl: "/labs.png",
        link: "https://portswigger.net/",
        date: "JUNE 2026",
        category: "Cybersecurity",
    },

    // ==================== FULL STACK ====================

    {
        id: "velton-fs",
        name: "Velton – Full Stack Development",
        description:
            "Worked as a Full Stack Developer Intern at Velton, contributing to production web applications across frontend and backend systems. Built and improved features using modern web technologies while focusing on clean architecture, reliable APIs, and maintainable application development.",
        imageUrl: "/velton.png",
        link: "https://www.linkedin.com/company/velton-ai/",
        date: "JAN 2026",
        category: "Full Stack Development",
    },

    {
        id: "fs-1",
        name: "ChefGPT",
        description:
            "Built a React-based AI recipe assistant powered by Mixtral, generating recipe suggestions from ingredients provided by the user. The project demonstrates API integration, responsive frontend development, state management, and practical AI-powered UX.",
        imageUrl: "/chefgpt.jpg",
        link: "https://chef-gpt-one.vercel.app/",
        date: "JAN 2025",
        category: "Full Stack Development",
    },

    {
        id: "fs-2",
        name: "Dark Mode – Google Classroom Extension",
        description:
            "Built a browser extension that adds a dark theme to Google Classroom for improved readability and usability. Implemented custom CSS overrides, DOM manipulation, browser extension functionality, and UI refinements.",
        imageUrl: "/darkmode.png",
        link: "https://github.com/Shamveel-Khan/darkModeForGoogleClassroom",
        date: "DEC 2024",
        category: "Full Stack Development",
    },


    // ==================== AI ====================

    {
        id: "velton-ai",
        name: "Velton – AI & Product Development",
        description:
            "Worked as a Full Stack Developer Intern at Velton, contributing to AI-driven web products and production application development. Combined frontend, backend, and AI-focused workflows to build practical features and improve the overall product experience.",
        imageUrl: "/velton.png",
        link: "https://www.linkedin.com/company/velton-ai/",
        date: "JAN 2026",
        category: "AI",
    },

    {
        id: "ai-1",
        name: "Image2Depth",
        description:
            "Built a Pix2Pix-based image-to-image translation system in PyTorch to estimate monocular depth maps from single-view dashboard images. Implemented a U-Net generator with skip connections and PatchGAN discriminator, achieving a 23.8% reduction in MAE over baseline CNN regressors. Automated hyperparameter tuning with Ray Tune and tracked experiments using Weights & Biases and MLflow.",
        imageUrl: "/depth.png",
        link: "https://github.com/Shamveel-Khan/Image2Depth",
        date: "2025",
        category: "AI",
    },

    {
        id: "ai-2",
        name: "DeepFaceEdit",
        description:
            "Engineered a desktop application for real-time face synthesis and semantic facial editing using StyleGAN2-ADA and PyTorch. Implemented W+ latent-space manipulation for editing attributes such as age, gender, and expression, alongside dlib-based face alignment and an image projection pipeline that achieved 18% lower L2 reconstruction error than baseline approaches.",
        imageUrl: "/face.png",
        link: "https://github.com/Shamveel-Khan/DeepFaceEdit",
        date: "2025",
        category: "AI",
    },

    {
        id: "ai-3",
        name: "Advanced Lane Detection",
        description:
            "Developed a complete computer vision pipeline for real-time lane detection using OpenCV and NumPy. Implemented camera calibration, distortion correction, bird's-eye perspective transformation, binary thresholding, and sliding-window polynomial fitting to detect straight and curved lanes. Achieved 94.2% pixel-level accuracy under challenging road conditions.",
        imageUrl: "/lane.PNG",
        link: "https://github.com/Shamveel-Khan/AdvancedLaneDetection",
        date: "2025",
        category: "AI",
    },


    // ==================== SQA ====================

    {
        id: "sqa-1",
        name: "Playwright QA Automation",
        description:
            "Built Playwright-based UI and API automation in TypeScript using Page Object Model (POM), covering login flows, smoke tests, data-driven negative scenarios, and API contract validation. Implemented flaky-test handling with retries, stable locators, expect.poll assertions, and failure diagnostics including screenshots, videos, traces, and HTML reports.",
        imageUrl: "/labs.png",
        link: "https://github.com/Shamveel-Khan/playwright-qa-auto",
        date: "2025",
        category: "SQA",
    },

    {
        id: "sqa-2",
        name: "Playwright SQA Demo",
        description:
            "Built a Playwright automation framework for login testing with reusable POM classes and common test steps to improve maintainability and test reuse. Added data parameterization using external CSV and mock data to execute repeatable login scenarios across multiple input combinations.",
        imageUrl: "/darkmode.png",
        link: "https://github.com/Shamveel-Khan/Playwirght-demo-SQA",
        date: "2025",
        category: "SQA",
    },
];

interface ProjectsProps {
    initialProjectCount?: number;
    showMoreOption?: boolean;
}

export default function Projects({
    initialProjectCount = 3,
    showMoreOption = true,
}: ProjectsProps) {
    const [selectedCategory, setSelectedCategory] =
        useState<ProjectCategory>("Cybersecurity");
    const [showAll, setShowAll] = useState(false);

    const filteredProjects = useMemo(
        () =>
            projectsData.filter((project) => project.category === selectedCategory),
        [selectedCategory],
    );

    const displayedProjects = showAll
        ? filteredProjects
        : filteredProjects.slice(0, initialProjectCount);

    const handleCategoryChange = (category: ProjectCategory) => {
        setSelectedCategory(category);
        setShowAll(false);
    };

    return (
        <section className="relative bg-black py-24 text-white">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-12 text-center"
                >
                    <h2 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
                        Experience & Projects
                    </h2>
                    <p className="mx-auto max-w-2xl text-gray-400">
                        A focused track of work spanning security, engineering, AI,
                        and quality assurance.
                    </p>
                </motion.div>

                <div className="mx-auto mb-12 max-w-5xl">
                    <div className="flex flex-wrap items-center justify-center gap-3 rounded-full border border-zinc-800 bg-zinc-950/80 p-3 shadow-[0_0_30px_rgba(17,24,39,0.7)] backdrop-blur-sm">
                        {categories.map((category) => {
                            const isActive = selectedCategory === category;

                            return (
                                <button
                                    key={category}
                                    type="button"
                                    onClick={() => handleCategoryChange(category)}
                                    className={`rounded-full border px-5 py-2.5 text-sm font-medium tracking-[0.12em] transition-all duration-200 ${
                                        isActive
                                            ? "border-cyan-400/60 bg-cyan-500/10 text-cyan-200 shadow-[0_0_20px_rgba(34,211,238,0.15)]"
                                            : "border-zinc-800 bg-zinc-900/70 text-zinc-300 hover:border-zinc-700 hover:text-white"
                                    }`}
                                >
                                    {category}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="relative mx-auto max-w-6xl">
                    <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-zinc-800 md:block" />

                    {displayedProjects.length > 0 ? (
                        displayedProjects.map((project, index) => (
                            <motion.div
                                key={project.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                className="relative mb-16"
                            >
                                <div className="absolute left-1/2 top-8 z-10 hidden h-4 w-4 -translate-x-1/2 rounded-full bg-cyan-400 shadow-[0_0_18px_rgba(34,211,238,0.8)] md:block" />

                                <div className="flex flex-col rounded-lg border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm md:flex-row md:items-center md:border-0 md:bg-transparent">
                                    {index % 2 === 0 ? (
                                        <>
                                            <div className="w-full overflow-hidden rounded-t-lg md:w-1/2 md:rounded-lg md:border md:border-zinc-800 md:bg-zinc-900/60 md:p-3 md:backdrop-blur-sm">
                                                <div className="relative h-56 w-full overflow-hidden md:h-64">
                                                    <Image
                                                        src={project.imageUrl || "/file.svg"}
                                                        alt={project.name}
                                                        fill
                                                        sizes="(min-width: 768px) 50vw, 100vw"
                                                        className="object-cover transition-transform duration-300 hover:scale-105"
                                                    />
                                                </div>
                                            </div>

                                            <div className="w-full p-6 md:w-1/2 md:p-8">
                                                <div className="mb-3 flex items-center gap-3">
                                                    <span className="inline-block text-sm text-zinc-400">
                                                        {project.date}
                                                    </span>
                                                    <span className="inline-flex rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-200">
                                                        {project.category}
                                                    </span>
                                                </div>
                                                <h3 className="mb-3 text-2xl font-bold">
                                                    {project.name}
                                                </h3>
                                                <p className="mb-4 text-gray-400">
                                                    {project.description}
                                                </p>
                                                <Link
                                                    href={project.link}
                                                    target="_blank"
                                                    className="inline-flex items-center gap-1 text-white transition-colors hover:text-cyan-300"
                                                >
                                                    View Project <ExternalLink size={16} />
                                                </Link>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="order-2 w-full p-6 md:order-1 md:w-1/2 md:p-8">
                                                <div className="mb-3 flex items-center gap-3">
                                                    <span className="inline-block text-sm text-zinc-400">
                                                        {project.date}
                                                    </span>
                                                    <span className="inline-flex rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-200">
                                                        {project.category}
                                                    </span>
                                                </div>
                                                <h3 className="mb-3 text-2xl font-bold">
                                                    {project.name}
                                                </h3>
                                                <p className="mb-4 text-gray-400">
                                                    {project.description}
                                                </p>
                                                <Link
                                                    href={project.link}
                                                    target="_blank"
                                                    className="inline-flex items-center gap-1 text-white transition-colors hover:text-cyan-300"
                                                >
                                                    View Project <ExternalLink size={16} />
                                                </Link>
                                            </div>

                                            <div className="order-1 w-full overflow-hidden rounded-t-lg md:order-2 md:w-1/2 md:rounded-lg md:border md:border-zinc-800 md:bg-zinc-900/60 md:p-3 md:backdrop-blur-sm">
                                                <div className="relative h-56 w-full overflow-hidden md:h-64">
                                                    <Image
                                                        src={project.imageUrl || "/file.svg"}
                                                        alt={project.name}
                                                        fill
                                                        sizes="(min-width: 768px) 50vw, 100vw"
                                                        className="object-cover transition-transform duration-300 hover:scale-105"
                                                    />
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-10 text-center text-zinc-400">
                            No projects available in this category yet.
                        </div>
                    )}
                </div>

                {showMoreOption && filteredProjects.length > initialProjectCount && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="mt-8 text-center"
                    >
                        <button
                            onClick={() => setShowAll(!showAll)}
                            className="group inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/50 px-6 py-3 text-white backdrop-blur-sm transition-colors hover:bg-zinc-800"
                        >
                            {showAll ? (
                                <>
                                    Show Less{" "}
                                    <ChevronUp className="h-4 w-4 transition-transform group-hover:-translate-y-1" />
                                </>
                            ) : (
                                <>
                                    See More{" "}
                                    <ChevronDown className="h-4 w-4 transition-transform group-hover:translate-y-1" />
                                </>
                            )}
                        </button>
                    </motion.div>
                )}
            </div>
        </section>
    );
}
