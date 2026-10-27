import { Reveal } from "../../lib/reveal";
import { STACK } from "./stackData";

// Keeps a logo's place until the logos come: the same box as one (1em square, as react-icons draws them)
const Blank = (props) => <svg width="1em" height="1em" {...props} />;

/** Every group and tool, at its full size from the start; each logo drawn once `icons` (stackIcons.js) has come. */
const StackGrid = ({ icons }) => (
  <div className="stack-grid">
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

export default StackGrid;
