import { Suspense } from "react";
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
import SchedulerHost from "./components/Scheduler/SchedulerHost";
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
        {/* React takes over the pre-rendered nav and hero at once, as the page loads. What's below the
            first screen, inside these boundaries, it takes over afterwards in short slices between
            frames, rather than in the same long task (nothing suspends: the boundaries only split the
            work). A click down there first finishes its part at once. */}
        <Suspense>
          <Marquee />
          <About />
          <Work />
          <Journey />
          <Stack />
          <Certificates />
          <Contact />
        </Suspense>
      </main>
      <Suspense>
        <Footer />
      </Suspense>
      {/* With the hero: its Schedule a call button opens the scheduler through this, from the start */}
      <SchedulerHost />
    </>
  );
}

export default App;
