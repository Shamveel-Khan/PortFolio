"use client"

import Image from "next/image"
import { motion } from "framer-motion"

export default function About() {
  return (
    <section className="relative bg-black py-24 text-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h2 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">About Me</h2>
          <div className="mx-auto h-1 w-20 bg-white/20"></div>
        </motion.div>

        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-center gap-12 md:flex-row md:items-start md:gap-16">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="w-full max-w-md md:w-2/5"
            >
              <div className="relative overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/50 p-3 backdrop-blur-sm">
                <Image
                  src="/shamveel.jpg"
                  alt="Shamveel Khan"
                  width={500}
                  height={600}
                  className="h-auto w-full rounded-md object-cover transition-transform duration-500 hover:scale-105"
                  priority
                />
                <div className="absolute inset-0 rounded-lg border-4 border-transparent bg-gradient-to-tr from-zinc-800/20 to-white/5 opacity-0 transition-opacity duration-300 hover:opacity-100"></div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="w-full md:w-3/5"
            >
              <h3 className="mb-6 text-3xl font-bold">Shamveel Khan</h3>
              <p className="mb-6 leading-relaxed text-gray-100">
              I&apos;m a Computer Science student at FAST Karachi with a strong interest in cybersecurity and secure systems design. I’m drawn to understanding how software systems can be broken — and more importantly, how to defend them.
              </p>
              <p className="mb-6 leading-relaxed text-gray-300">
              My current work includes developing web applications and games using technologies like React, ENet, and Raylib, while also diving deep into web security fundamentals. I&apos;ve been actively exploring areas such as cross-site scripting (XSS), broken authentication, and input validation vulnerabilities through hands-on labs and testing environments.
              </p>
               <p className="mb-6 leading-relaxed text-gray-300">
              Outside of development, I focus on ethical hacking techniques, automation using Python, and structured reconnaissance workflows to sharpen my practical security skills. I aim to bridge the gap between building software and securing it — with an eye toward solving real-world security problems through code, research, and continuous learning.
               </p>

              <div className="mb-8">
                <h4 className="mb-4 text-xl font-semibold">Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    "JavaScript",
                    "React",
                    "C++ Game Dev",
                    "OpenCV",
                    "TypeScript",
                    "Tailwind CSS",
                    "Python",
                    "UI/UX Design",
                  ].map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-zinc-800 bg-zinc-900/70 px-4 py-2 text-sm backdrop-blur-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
