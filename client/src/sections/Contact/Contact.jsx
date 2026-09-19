import { useState } from "react";
import { FiArrowUpRight, FiCheck, FiCopy, FiMail, FiSend } from "react-icons/fi";
import { SiWhatsapp } from "../../components/brandIcons";
import { Reveal } from "../../lib/reveal";
import { postJSON } from "../../lib/api";
import { PROFILE } from "../../data/profile";
import "./Contact.css";

const EMPTY = { name: "", email: "", msg: "" };

const Contact = () => {
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState({ state: "idle", message: "" });
  const [copied, setCopied] = useState(false);

  const update = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setStatus({ state: "sending", message: "" });
    try {
      await postJSON("/api/v1/portfolio/sendEmail", form);
      setForm(EMPTY);
      setStatus({ state: "sent", message: "Thanks — your message is on its way. I'll reply soon." });
    } catch (err) {
      setStatus({ state: "error", message: err.message });
    }
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(PROFILE.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${PROFILE.email}`;
    }
  };

  const sending = status.state === "sending";

  return (
    <section className="section contact" id="contact" aria-labelledby="contact-title">
      <div className="wrap">
        <Reveal as="p" className="label sec-index">
          (06) — Contact
        </Reveal>
        <Reveal as="h2" className="contact-title" id="contact-title" delay={1}>
          Let's build something <span className="serif">remarkable.</span>
        </Reveal>

        <div className="grid-12 contact-grid">
          <Reveal className="contact-direct" delay={1}>
            <p className="lede">
              Hiring, collaborating, or need a mentor for your team? Drop a message — I'd love to hear about it.
            </p>

            <div className="contact-email">
              <FiMail className="contact-email-icon" aria-hidden="true" />
              <a href={`mailto:${PROFILE.email}`}>{PROFILE.email}</a>
              <button className="icon-btn" onClick={copyEmail} aria-label={copied ? "Email copied" : "Copy email address"}>
                {copied ? <FiCheck /> : <FiCopy />}
              </button>
              <span className="sr-only" aria-live="polite">
                {copied ? "Email address copied to clipboard" : ""}
              </span>
            </div>

            <ul className="channels">
              <li>
                <a href={PROFILE.whatsapp} target="_blank" rel="noreferrer">
                  <SiWhatsapp aria-hidden="true" /> WhatsApp <FiArrowUpRight className="channel-arrow" aria-hidden="true" />
                </a>
              </li>
              {PROFILE.socials.map(({ label, href, handle, icon: Icon }) => (
                <li key={label}>
                  <a href={href} target="_blank" rel="noreferrer">
                    <Icon aria-hidden="true" /> {label} <span className="label">{handle}</span>
                    <FiArrowUpRight className="channel-arrow" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal as="form" className="contact-form" delay={2} onSubmit={submit}>
            <div className="field">
              <label htmlFor="cf-name">Your name</label>
              <input id="cf-name" name="name" autoComplete="name" required maxLength={100} value={form.name} onChange={update} placeholder="Jane Doe" />
            </div>
            <div className="field">
              <label htmlFor="cf-email">Email</label>
              <input id="cf-email" name="email" type="email" autoComplete="email" required maxLength={254} value={form.email} onChange={update} placeholder="jane@company.com" />
            </div>
            <div className="field">
              <label htmlFor="cf-msg">Message</label>
              <textarea id="cf-msg" name="msg" required rows={5} maxLength={5000} value={form.msg} onChange={update} placeholder="Tell me about your project or role…" />
            </div>

            <div className="form-foot">
              <button className="btn btn-primary" type="submit" disabled={sending}>
                {sending ? "Sending…" : "Send message"} <FiSend size={16} />
              </button>
              <p className={`form-status is-${status.state}`} role="status" aria-live="polite">
                {status.message}
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default Contact;
