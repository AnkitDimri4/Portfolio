import Nav from "./components/Nav/Nav";
import Marquee from "./components/Marquee/Marquee";
import Footer from "./components/Footer/Footer";
import Hero from "./sections/Hero/Hero";
import About from "./sections/About/About";
import Work from "./sections/Work/Work";
import Journey from "./sections/Journey/Journey";
import Stack from "./sections/Stack/Stack";
import Certificates from "./sections/Certificates/Certificates";
import Contact from "./sections/Contact/Contact";
import "./styles/unfold.css";

function App() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Nav />
      <main id="main">
        <Hero />
        <Marquee />
        <About />
        <Work />
        <Journey />
        <Stack />
        <Certificates />
        <Contact />
      </main>
      <Footer />
    </>
  );
}

export default App;
