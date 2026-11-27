import { useEffect, useState } from "react";
import { Reveal } from "../../lib/reveal";
import { STACK } from "./stackData";

// Keeps a logo's place until the logos come: the same box as one (1em square, as react-icons draws them)
const Blank = (props) => <svg width="1em" height="1em" {...props} />;

// On phones the groups are a row to swipe (Stack.css). It has no links of its own, so there it takes the
// keyboard's focus itself, and the arrow keys scroll it. Known only once the page is in the browser: the
// pre-rendered page (and so the browser's first render) has it as a plain grid.
const PHONE = "(max-width: 640px)";
const useSwipe = () => {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const list = window.matchMedia?.(PHONE);
    if (!list) return undefined;
    const update = () => setOn(list.matches);
    update();
    list.addEventListener?.("change", update);
    return () => list.removeEventListener?.("change", update);
  }, []);
  return on;
};

/** Every group and tool, at its full size from the start; each logo drawn once `icons` (stackIcons.js) has come. */
const StackGrid = ({ icons }) => {
  const swipe = useSwipe();
  return (
    <div className="stack-grid" {...(swipe && { tabIndex: 0, role: "region", "aria-label": "My stack, by group: swipe for more" })}>
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
  );
};

export default StackGrid;
