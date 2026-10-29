import { FiArrowUpRight, FiChevronDown } from "react-icons/fi";
import SectionHead from "../../components/SectionHead";
import { Reveal } from "../../lib/reveal";
import { JOURNEY } from "../../data/profile";
import "./Journey.css";

// One part of a role: its heading, then its own points.
const Group = ([area, points]) => (
  <li key={area} className="jitem-group">
    <strong>{area}</strong>
    <ul className="jitem-subpoints">
      {points.map((p) => (
        <li key={p}>{p}</li>
      ))}
    </ul>
  </li>
);

// "A", "A and B", "A, B and C"
const andList = (names) => (names.length < 2 ? names.join("") : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`);

/**
 * A role's parts: the first shows, the rest fold under "Show N more", named, so the page stays short
 * and every line is still there (in the page for search engines, and opened by the browser's find).
 */
const Highlights = ({ groups }) => (
  <>
    <ul className="jitem-points">{groups.slice(0, 1).map(Group)}</ul>
    {groups.length > 1 && (
      <details className="jitem-more">
        <summary>
          <span className="jitem-more-closed">
            <b>Show {groups.length - 1} more</b>: {andList(groups.slice(1).map(([area]) => area))}
          </span>
          <b className="jitem-more-open">Show less</b>
          <FiChevronDown aria-hidden="true" />
        </summary>
        <ul className="jitem-points">{groups.slice(1).map(Group)}</ul>
      </details>
    )}
  </>
);

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
          Shipping production software as a Software Engineer, after three years mentoring thousands of developers.
        </SectionHead>
        <a className="btn btn-sm journey-map" href="/brain-map/">
          See it as a brain map <FiArrowUpRight size={16} aria-hidden="true" />
        </a>
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
              {item.roles?.length > 0 && (
                <ol className="jitem-roles">
                  {item.roles.map((r) => (
                    <li key={r.title}>
                      <p className="jitem-role">
                        <span>{r.title}</span>
                        <span className="label">{r.period}</span>
                      </p>
                      {r.summary && <p className="jitem-role-summary">{r.summary}</p>}
                      {r.highlights ? (
                        <Highlights groups={r.highlights} />
                      ) : (
                        <ul className="jitem-points">
                          {r.points.map((p) => (
                            <li key={p}>{p}</li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ol>
              )}
              {item.points.length > 0 && (
                <ul className="jitem-points">
                  {item.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              )}
              {item.skills?.length > 0 && (
                <div className="jitem-skills">
                  <p className="label">Skills gained</p>
                  <ul className="chips">
                    {item.skills.map((s) => (
                      <li className="chip" key={s}>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {item.links?.length > 0 && (
                <p className="jitem-links">
                  {item.links.map((l) => (
                    <a key={l.href} href={l.href} target="_blank" rel="noreferrer">
                      {l.label} <FiArrowUpRight aria-hidden="true" />
                    </a>
                  ))}
                </p>
              )}
            </div>
          </Reveal>
        ))}
      </ol>
    </div>
  </section>
);

export default Journey;
