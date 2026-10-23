import { Component } from "react";
import { reloadAt } from "../../lib/reload";
import "./PartFailed.css";

/**
 * Around a part the page loads on demand. If it can't be drawn (its file didn't arrive), a note takes its
 * place: `what` happened, and a button that loads the page again at `hash`. The rest of the page stays:
 * without this, React drops the whole page and leaves it blank. `floating` puts the note over the page, at
 * the foot of the screen, for a part with no place in it (the scheduler), and `onClose` gives it a Close.
 */
export default class PartFailed extends Component {
  state = { failed: false };
  // Where focus was as the part was asked for: a floating note takes it, and gives it back as it closes
  before = typeof document === "undefined" ? null : document.activeElement;

  static getDerivedStateFromError() {
    return { failed: true };
  }

  close = () => {
    this.before?.focus?.();
    this.props.onClose();
  };

  render() {
    const { what, hash, floating = false, onClose, children } = this.props;
    if (!this.state.failed) return children;
    return (
      <div className={`part-failed${floating ? " is-floating" : ""}`}>
        <p role="alert">{what} The connection may have dropped, or the site has changed since this page opened.</p>
        <div className="part-failed-actions">
          <button type="button" className="btn btn-primary btn-sm" onClick={() => reloadAt(hash)} autoFocus={floating}>
            Load the page again
          </button>
          {onClose && (
            <button type="button" className="btn btn-sm" onClick={this.close}>
              Close
            </button>
          )}
        </div>
      </div>
    );
  }
}
