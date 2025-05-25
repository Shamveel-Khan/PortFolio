import Hero from "./components/hero"
import About from "./components/about"
import Projects from "./components/projects"
import Contacts from "./components/contacts"

export default function Page() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Hero />
      <About />
      <Projects initialProjectCount={3} showMoreOption={true} />
      <Contacts />
    </main>
  )
}
