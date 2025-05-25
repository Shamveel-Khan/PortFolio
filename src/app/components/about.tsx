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
              I&#39;m a computer science student at FAST Karachi, passionate about building intelligent and efficient software solutions.
              With a strong foundation in programming and a curiosity-driven mindset,
              I enjoy working on projects that blend creativity with problem-solving
              </p>
              <p className="mb-6 leading-relaxed text-gray-300">
              My current work spans game development and web applications, with projects built using Raylib for graphics, ENet for networking, and React for dynamic user interfaces.
              I&#39;m especially interested in Artificial Intelligence and Computer Vision,
               and I&#39;m actively learning how to apply these technologies to real-world problems.
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
