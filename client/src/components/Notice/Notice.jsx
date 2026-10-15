// The site's notice, as a line across the page (lib/notice.js says when and where it shows).
import { FiInfo } from "react-icons/fi";
import { noticeFor } from "../../lib/notice";
import "./Notice.css";

/** The notice's line for `message`: also the admin view's preview of it. */
export function NoticeLine({ message, className = "" }) {
  return (
    <aside className={`site-notice ${className}`.trim()} aria-label="Notice">
      <FiInfo aria-hidden="true" />
      <p>{message}</p>
    </aside>
  );
}

/** The notice for `place` ("builder" or "scheduler"), if it's showing now. */
export default function Notice({ place, className }) {
  const notice = noticeFor(place);
  return notice ? <NoticeLine message={notice.message} className={className} /> : null;
}
