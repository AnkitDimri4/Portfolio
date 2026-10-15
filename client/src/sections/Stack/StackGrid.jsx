import { Reveal } from "../../lib/reveal";
import { STACK } from "./stackData";

const StackGrid = () => (
  <div className="stack-grid">
    {STACK.map((group, gi) => (
      <Reveal className="stack-card" key={group.group} delay={gi % 3}>
        <div className="stack-card-head">
          <h3 className="stack-group">{group.group}</h3>
          <span className="label">{String(group.items.length).padStart(2, "0")}</span>
        </div>
        <ul className="stack-items">
          {group.items.map(([name, Icon]) => (
            <li key={name}>
              <Icon aria-hidden="true" />
              {name}
            </li>
          ))}
        </ul>
      </Reveal>
    ))}
  </div>
);

export default StackGrid;
