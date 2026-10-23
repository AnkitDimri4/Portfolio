import { lazy, Suspense, useRef } from "react";
import PartFailed from "../../components/PartFailed/PartFailed";
import SectionHead from "../../components/SectionHead";
import { useInView } from "../../lib/reveal";
import "./Stack.css";

// The grid carries ~40 brand icons; fetch it only as the section approaches. In a tab opened before a
// deploy, its file is gone: a note says so, with a reload (not by itself, while someone's reading).
const StackGrid = lazy(() => import("./StackGrid"));

const Stack = () => {
  const ref = useRef(null);
  const near = useInView(ref, "1200px 0px");

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

        <div ref={ref} className="stack-slot">
          {near && (
            <PartFailed what="The stack didn't load." hash="#stack">
              <Suspense fallback={null}>
                <StackGrid />
              </Suspense>
            </PartFailed>
          )}
        </div>
      </div>
    </section>
  );
};

export default Stack;
