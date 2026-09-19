import { Reveal } from "../lib/reveal";
import ScrambleText from "./ScrambleText";

/** "(0N) — Label" eyebrow (decodes on scroll-in) + big display title. `title` may contain JSX. */
const SectionHead = ({ index, label, title, children, id }) => (
  <header className="sec-head">
    <Reveal as="p" className="label sec-index">
      <ScrambleText text={`(${String(index).padStart(2, "0")}) — ${label}`} speed={28} />
    </Reveal>
    <Reveal as="h2" className="sec-title" delay={1} id={id}>
      {title}
    </Reveal>
    {children && (
      <Reveal delay={2} className="lede">
        {children}
      </Reveal>
    )}
  </header>
);

export default SectionHead;
