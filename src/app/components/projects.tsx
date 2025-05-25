"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { ChevronDown, ChevronUp, ExternalLink } from "lucide-react"

type Project = {
  id: string
  name: string
  description: string
  imageUrl: string
  link: string
  date: string
}

const projectsData: Project[] = [
  {
    id: "1",
    name: "CHEFGPT",
    description:
      "ChefGPT is a web application built with React that leverages Mixtral AI to generate recipe suggestions based on the ingredients you have on hand. It offers an intuitive interface where users can input available ingredients, and the AI responds with creative and practical meal ideas. The project focuses on convenience, helping users reduce food waste and discover new dishes without the need for constant grocery runs.",
    imageUrl: "/chefgpt.jpg",
    link: "https://chef-gpt-one.vercel.app/",
    date: "January 2025",
  },
  {
    id: "2",
    name: "PONG IN RAYLIB+ENET",
    description:
      "This project is a modern take on the classic Pong game, developed using Raylib for 2D graphics and ENet, a reliable UDP networking library, to enable real-time multiplayer gameplay over the internet. The game supports smooth online matches, allowing players to compete remotely with low-latency interactions. It was a hands-on exercise in both game development and network programming fundamentals.",
    imageUrl: "/pong.jpg",
    link: "https://github.com/Shamveel-Khan/Pong-OOP",
    date: "May 2025",
  },
  {
    id: "3",
    name: "DARKMODE-Google Classroom Extension",
    description:
      "This browser extension introduces a dark mode theme for GCR (Google Classroom Review), designed to reduce eye strain during extended usage, especially in low-light environments. By applying custom styles, it transforms the bright default interface into a more visually comfortable experience. The project demonstrates attention to user experience and front-end customization.",
    imageUrl: "/darkmode.png",
    link: "https://github.com/Shamveel-Khan/darkModeForGoogleClassroom",
    date: "December 2024",
  },
  {
    id: "4",
    name: "TENZIES",
    description:
      "Tenzies is a simple yet engaging game built in React, where players roll ten dice and try to get all of them to show the same number. The game includes logic to hold certain dice between rolls and tracks the number of rolls it takes to win. It’s a fun way to explore state management and component-based design in React while offering a smooth, interactive gameplay experience.",
    imageUrl: "/tenzies.jpg",
    link: "https://tenzies-shamveelkhan.vercel.app/",
    date: "February 2025",
  },
]

interface ProjectsProps {
  initialProjectCount?: number
  showMoreOption?: boolean
}

export default function Projects({ initialProjectCount = 3, showMoreOption = true }: ProjectsProps) {
  const [showAll, setShowAll] = useState(false)

  const displayedProjects = showAll ? projectsData : projectsData.slice(0, initialProjectCount)

  return (
    <section className="relative bg-black py-24 text-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <h2 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">Projects</h2>
          <p className="mx-auto max-w-2xl text-gray-400">A collection of my work and personal projects</p>
        </motion.div>

        <div className="relative mx-auto max-w-6xl">
          <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-zinc-800 md:block" />

          {displayedProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative mb-16"
            >
              <div className="absolute left-1/2 top-8 z-10 hidden h-4 w-4 -translate-x-1/2 rounded-full bg-white md:block" />

              <div className="flex flex-col rounded-lg border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm md:flex-row md:items-center md:border-0 md:bg-transparent">
                {index % 2 === 0 ? (
                  <>
                    <div className="w-full overflow-hidden rounded-t-lg md:w-1/2 md:rounded-lg md:border md:border-zinc-800 md:bg-zinc-900/50 md:p-3 md:backdrop-blur-sm">
                      <Image
                        src={project.imageUrl || "/placeholder.svg"}
                        alt={project.name}
                        width={500}
                        height={300}
                        className="h-auto w-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    </div>

                    <div className="w-full p-6 md:w-1/2 md:p-8">
                      <span className="mb-2 inline-block text-sm text-gray-400">{project.date}</span>
                      <h3 className="mb-3 text-2xl font-bold">{project.name}</h3>
                      <p className="mb-4 text-gray-400">{project.description}</p>
                      <Link
                        href={project.link}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-white hover:text-gray-300"
                      >
                        View Project <ExternalLink size={16} />
                      </Link>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="order-2 w-full p-6 md:order-1 md:w-1/2 md:p-8">
                      <span className="mb-2 inline-block text-sm text-gray-400">{project.date}</span>
                      <h3 className="mb-3 text-2xl font-bold">{project.name}</h3>
                      <p className="mb-4 text-gray-400">{project.description}</p>
                      <Link
                        href={project.link}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-white hover:text-gray-300"
                      >
                        View Project <ExternalLink size={16} />
                      </Link>
                    </div>

                    <div className="order-1 w-full overflow-hidden rounded-t-lg md:order-2 md:w-1/2 md:rounded-lg md:border md:border-zinc-800 md:bg-zinc-900/50 md:p-3 md:backdrop-blur-sm">
                      <Image
                        src={project.imageUrl || "/placeholder.svg"}
                        alt={project.name}
                        width={500}
                        height={300}
                        className="h-auto w-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {showMoreOption && projectsData.length > initialProjectCount && (
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
                  Show Less <ChevronUp className="h-4 w-4 transition-transform group-hover:-translate-y-1" />
                </>
              ) : (
                <>
                  See More <ChevronDown className="h-4 w-4 transition-transform group-hover:translate-y-1" />
                </>
              )}
            </button>
          </motion.div>
        )}
      </div>
    </section>
  )
}
