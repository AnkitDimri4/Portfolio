import { useEffect, useRef, useState } from "react";
import SectionHead from "../../components/SectionHead";
import { useInView } from "../../lib/reveal";
import StackGrid from "./StackGrid";
import "./Stack.css";

// The grid is in the page from the start, at its full size; only its logos (one file, ~37 kB compressed)
// come later, as the section approaches. When the whole grid came then, the section grew by ~2,200 px on
// a phone, and a long scroll past it (the nav's links to Certificates and Contact) ended short.
const Stack = () => {
  const ref = useRef(null);
  const near = useInView(ref, "1200px 0px");
  const [icons, setIcons] = useState(null);

  useEffect(() => {
    if (!near) return;
    // In a tab opened before a deploy their file is gone: the grid stays as it is, without logos
    import("./stackIcons").then(({ ICONS }) => setIcons(ICONS), () => {});
  }, [near]);

  return (
    <section className="section stack" id="stack" aria-labelledby="stack-title">
      <div className="wrap">
        <SectionHead
          index={4}
          label="Stack"
          id="stack-title"
          title={
            <>
              The stack I <span className="serif">build</span> with.
            </>
          }
        >
          Languages, frameworks, databases, mobile, ML, cloud, DevOps and monitoring — the toolkit behind everything above.
        </SectionHead>

        <div ref={ref}>
          <StackGrid icons={icons} />
        </div>
      </div>
    </section>
  );
};

export default Stack;
