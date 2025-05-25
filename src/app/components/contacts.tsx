"use client"

import type React from "react"

import { motion } from "framer-motion"
import { Instagram, Github, Linkedin } from "lucide-react"

interface SocialLinkProps {
  icon: React.ReactNode
  label: string
  href: string
}

function SocialLink({ icon, label, href }: SocialLinkProps) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col items-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.05 }}
    >
      <div className="relative mb-3 flex h-16 w-16 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900/70 transition-all duration-300 group-hover:-translate-y-2 sm:h-20 sm:w-20">
        <div className="absolute inset-0 rounded-full bg-white/5 opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-100"></div>

        <div className="relative z-10 text-white transition-transform duration-300">{icon}</div>
      </div>

      <span className="text-sm font-medium text-gray-400 transition-colors duration-300 group-hover:text-white sm:text-base">
        {label}
      </span>
    </motion.a>
  )
}

export default function Contacts() {
  const socialLinks = [
    {
      icon: <Instagram size={32} />,
      label: "Instagram",
      href: "https://www.instagram.com/shamveel.khan.982/",
    },
    {
      icon: <Github size={32} />,
      label: "GitHub",
      href: "https://github.com/Shamveel-Khan",
    },
    {
      icon: <Linkedin size={32} />,
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/shamveel-khan",
    },
  ]

  return (
    <section className="relative bg-black py-24 text-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <h2 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">Get In Touch</h2>
          <p className="mx-auto max-w-2xl text-gray-400">Connect with me on social media or send me a message</p>
        </motion.div>

        <div className="mx-auto max-w-4xl">
          <div className="mb-16 flex flex-wrap items-center justify-center gap-12 sm:gap-16 md:gap-24">
            {socialLinks.map((link, index) => (
              <SocialLink key={index} icon={link.icon} label={link.label} href={link.href} />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mx-auto max-w-md text-center"
          >
            <p className="mb-4 text-gray-400">Prefer email?</p>
            <a
              href="mailto:shamveelkhilji@gmail.com"
              className="group inline-block text-xl font-medium text-white sm:text-2xl"
            >
              <span className="relative">
                shamveelkhilji@gmail.com
                <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-white transition-all duration-300 group-hover:w-full"></span>
              </span>
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
