import { useRef } from "react";
import { Reveal } from "../../lib/reveal";
import usePhone from "../../lib/usePhone";
import useRail from "../../lib/useRail";
import RailFoot from "../../components/RailFoot/RailFoot";
import { STACK } from "./stackData";

// Keeps a logo's place until the logos come: the same box as one (1em square, as react-icons draws them)
const Blank = (props) => <svg width="1em" height="1em" {...props} />;

/**
 * Every group and tool, at its full size from the start; each logo drawn once `icons` (stackIcons.js) has
 * come. On phones the groups are a row to swipe (Stack.css), as Certificates' are: a mouse can drag it too,
 * and the line and count under it say where you are (lib/useRail.js, RailFoot). It has no links of its own,
 * so there it takes the keyboard's focus itself, and the arrow keys scroll it.
 */
const StackGrid = ({ icons }) => {
  const phone = usePhone();
  const row = useRef(null);
  const none = useRef(null); // laptops: a plain grid, nothing to drag
  const thumb = useRef(null);
  const current = useRail(phone ? row : none, thumb, STACK.length);
  return (
    <>
      <div ref={row} className="stack-grid" {...(phone && { tabIndex: 0, role: "region", "aria-label": "My stack, by group: swipe for more" })}>
        {STACK.map((group, gi) => (
          <Reveal className="stack-card" key={group.group} delay={gi % 3}>
            <div className="stack-card-head">
              <h3 className="stack-group">{group.group}</h3>
              <span className="label">{String(group.items.length).padStart(2, "0")}</span>
            </div>
            <ul className="stack-items">
              {group.items.map((name) => {
                const Icon = icons?.[name] ?? Blank;
                return (
                  <li key={name}>
                    <Icon aria-hidden="true" />
                    {name}
                  </li>
                );
              })}
            </ul>
          </Reveal>
        ))}
      </div>
      <RailFoot phone thumb={thumb} current={current} total={STACK.length} />
    </>
  );
};

export default StackGrid;
