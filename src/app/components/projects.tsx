"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, ExternalLink } from "lucide-react";

type Project = {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    link: string;
    date: string;
};

const projectsData: Project[] = [
    {
        id: "1",
        name: "Internship @ Velton (Security-Focused Full Stack)",
        description:
            "Worked as a Full Stack Developer Intern with a strong emphasis on secure application development. Contributed to building and maintaining production-grade web applications while implementing secure authentication flows, input validation, and backend security best practices. Actively applied ethical hacking knowledge to identify potential vulnerabilities, strengthen system defenses, and improve overall application security.",
        imageUrl: "/velton.png",
        link: "https://www.linkedin.com/company/velton-ai/",
        date: "JAN 2026",
    },
    {
        id: "2",
        name: "Authorization Hack – FAST Connect",
        description:
            "Identified and exploited an authorization vulnerability in a FAST senior project (FAST Connect). The issue allowed unauthorized access to restricted resources due to improper access control checks. Conducted structured testing, demonstrated the impact responsibly, and highlighted remediation strategies to prevent privilege escalation and insecure direct object reference (IDOR) risks.",
        imageUrl: "/hack.png",
        link: "https://medium.com/@shamveelkhilji/broken-otp-why-issuing-a-full-token-at-signup-is-a-security-bug-and-how-to-fix-it-3ed99a2e18b8?postPublishedType=initial",
        date: "JAN 2026",
    },
    {
        id: "3",
        name: "ChefGPT",
        description:
            "ChefGPT is a React-based web application powered by Mixtral AI that generates recipe suggestions based on available ingredients. The project demonstrates API integration, state management, and responsive UI design while focusing on delivering a smooth and interactive user experience.",
        imageUrl: "/chefgpt.jpg",
        link: "https://chef-gpt-one.vercel.app/",
        date: "January 2025",
    },
    {
        id: "4",
        name: "Pong (Raylib + ENet)",
        description:
            "A multiplayer Pong game developed using Raylib for 2D rendering and ENet for reliable UDP-based networking. The project focused on real-time communication, low-latency gameplay, and network synchronization, providing hands-on experience with game development and networking fundamentals.",
        imageUrl: "/pong.jpg",
        link: "https://github.com/Shamveel-Khan/Pong-OOP",
        date: "May 2025",
    },
    {
        id: "5",
        name: "Dark Mode – Google Classroom Extension",
        description:
            "A browser extension that introduces a dark theme for Google Classroom to improve visual comfort during prolonged use. Implemented custom CSS overrides and DOM manipulation techniques to enhance usability while maintaining compatibility with the existing interface.",
        imageUrl: "/darkmode.png",
        link: "https://github.com/Shamveel-Khan/darkModeForGoogleClassroom",
        date: "December 2024",
    },
    {
        id: "6",
        name: "Tenzies",
        description:
            "A React-based dice game where players aim to roll all dice to the same number. Built to explore component-based architecture, state management, and interactive UI logic while delivering a clean and responsive user experience.",
        imageUrl: "/tenzies.jpg",
        link: "https://tenzies-shamveelkhan.vercel.app/",
        date: "February 2025",
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
    const [showAll, setShowAll] = useState(false);

    const displayedProjects = showAll
        ? projectsData
        : projectsData.slice(0, initialProjectCount);

    return (
        <section className="relative bg-black py-24 text-white">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-16 text-center"
                >
                    <h2 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
                        Experience & Projects
                    </h2>
                    <p className="mx-auto max-w-2xl text-gray-400">
                        A collection of my work and personal projects
                    </p>
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
                                            <div className="relative h-56 w-full overflow-hidden md:h-64">
                                                <Image
                                                    src={
                                                        project.imageUrl ||
                                                        "/placeholder.svg"
                                                    }
                                                    alt={project.name}
                                                    fill
                                                    sizes="(min-width: 768px) 50vw, 100vw"
                                                    className="object-cover transition-transform duration-300 hover:scale-105"
                                                />
                                            </div>
                                        </div>

                                        <div className="w-full p-6 md:w-1/2 md:p-8">
                                            <span className="mb-2 inline-block text-sm text-gray-400">
                                                {project.date}
                                            </span>
                                            <h3 className="mb-3 text-2xl font-bold">
                                                {project.name}
                                            </h3>
                                            <p className="mb-4 text-gray-400">
                                                {project.description}
                                            </p>
                                            <Link
                                                href={project.link}
                                                target="_blank"
                                                className="inline-flex items-center gap-1 text-white hover:text-gray-300"
                                            >
                                                View Project{" "}
                                                <ExternalLink size={16} />
                                            </Link>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="order-2 w-full p-6 md:order-1 md:w-1/2 md:p-8">
                                            <span className="mb-2 inline-block text-sm text-gray-400">
                                                {project.date}
                                            </span>
                                            <h3 className="mb-3 text-2xl font-bold">
                                                {project.name}
                                            </h3>
                                            <p className="mb-4 text-gray-400">
                                                {project.description}
                                            </p>
                                            <Link
                                                href={project.link}
                                                target="_blank"
                                                className="inline-flex items-center gap-1 text-white hover:text-gray-300"
                                            >
                                                View Project{" "}
                                                <ExternalLink size={16} />
                                            </Link>
                                        </div>

                                        <div className="order-1 w-full overflow-hidden rounded-t-lg md:order-2 md:w-1/2 md:rounded-lg md:border md:border-zinc-800 md:bg-zinc-900/50 md:p-3 md:backdrop-blur-sm">
                                            <div className="relative h-56 w-full overflow-hidden md:h-64">
                                                <Image
                                                    src={
                                                        project.imageUrl ||
                                                        "/placeholder.svg"
                                                    }
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
                    ))}
                </div>

                {showMoreOption &&
                    projectsData.length > initialProjectCount && (
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
