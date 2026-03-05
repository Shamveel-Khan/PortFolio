"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import shamveelImage from "../../../public/shamveel.jpg";

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
                    <h2 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
                        About Me
                    </h2>
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
                                <div className="relative h-[420px] w-full overflow-hidden rounded-md">
                                    <Image
                                        src={shamveelImage}
                                        alt="Shamveel Khan"
                                        fill
                                        sizes="(min-width: 768px) 40vw, 100vw"
                                        className="object-cover transition-transform duration-500 hover:scale-105"
                                        priority
                                    />
                                </div>
                                <div className="absolute inset-0 rounded-lg border-4 border-transparent bg-gradient-to-tr from-zinc-800/20 to-white/5 opacity-0 transition-opacity duration-300 hover:opacity-100"></div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="w-full md:w-3/5"
                        >
                            <h3 className="mb-6 text-3xl font-bold">
                                Shamveel Khan
                            </h3>
                            <p className="mb-6 leading-relaxed text-gray-100">
                                I`m a Computer Science student at FAST Karachi
                                with a strong focus on cybersecurity and secure
                                systems design. I&aposm passionate about
                                understanding how software and web applications
                                can be exploited — and more importantly, how to
                                defend them against real-world threats. My goal
                                is to bridge the gap between development and
                                security while continuously advancing my
                                practical expertise.
                            </p>
                            <p className="mb-6 leading-relaxed text-gray-300">
                                I`m currently interning at Velton as a
                                full-stack developer with a security-focused
                                role, where I contribute to building robust and
                                secure applications. My work involves ethical
                                hacking, automated testing with Python, and
                                structured reconnaissance workflows, allowing me
                                to apply security principles directly to
                                real-world projects.{" "}
                            </p>
                            <p className="mb-6 leading-relaxed text-gray-300">
                                I`ve also completed all PortSwigger labs
                                covering XSS, authentication flaws, CSRF, and
                                IDOR, gaining hands-on experience in discovering
                                and exploiting web vulnerabilities. Recently, I
                                successfully identified security issues in a
                                FAST senior project, putting my offensive skills
                                to the test in realistic scenarios.
                            </p>

                            <div className="mb-8">
                                <h4 className="mb-4 text-xl font-semibold">
                                    Skills
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {[
                                        "JavaScript",
                                        "React",
                                        "C++ Game Dev",
                                        "OpenCV",
                                        "TypeScript",
                                        "Tailwind CSS",
                                        "Python",
                                        "Web Security Testing",
                                        "Ethical Hacking",
                                        "Penetration Testing",
                                        "Reconnaissance",
                                        "Vulnerability Assessment",
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
    );
}
