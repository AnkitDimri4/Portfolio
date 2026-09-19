import { lazy, Suspense, useRef } from "react";
import SectionHead from "../../components/SectionHead";
import { useInView } from "../../lib/reveal";
import "./Stack.css";

// The grid carries ~40 brand icons; fetch it only as the section approaches.
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
          Languages, frameworks, databases, mobile, ML, cloud and DevOps — the toolkit behind everything above.
        </SectionHead>

        <div ref={ref} className="stack-slot">
          {near && (
            <Suspense fallback={null}>
              <StackGrid />
            </Suspense>
          )}
        </div>
      </div>
    </section>
  );
};

export default Stack;
