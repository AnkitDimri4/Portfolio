import SectionHead from "../../components/SectionHead";
import { Reveal } from "../../lib/reveal";
import { JOURNEY } from "../../data/profile";
import "./Journey.css";

const Journey = () => (
  <section className="section journey" id="journey" aria-labelledby="journey-title">
    <div className="wrap grid-12">
      <div className="journey-head">
        <SectionHead
          index={3}
          label="Journey"
          id="journey-title"
          title={
            <>
              Experience <span className="serif">&amp; learning.</span>
            </>
          }
        >
          Mentoring thousands of developers while building my own products — the two feed each other.
        </SectionHead>
      </div>

      <ol className="journey-list">
        {JOURNEY.map((item, i) => (
          <Reveal as="li" className="jitem" key={item.title} delay={i % 2}>
            <div className="jitem-side">
              <p className="label">{item.period}</p>
              <span className="jitem-tag">{item.tag}</span>
            </div>
            <div className="jitem-body">
              <h3 className="jitem-title">{item.title}</h3>
              <p className="jitem-org">{item.org}</p>
              {item.points.length > 0 && (
                <ul className="jitem-points">
                  {item.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              )}
            </div>
          </Reveal>
        ))}
      </ol>
    </div>
  </section>
);

export default Journey;
