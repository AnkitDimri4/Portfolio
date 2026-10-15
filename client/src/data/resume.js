// The single source for the resume PDF and the portfolio's experience timeline. The content itself
// is in resume-data.js (plain JSON in a module, so Node and Vite both read it, and the admin view's
// "My resume" editor can rewrite it); this file names its parts and explains them.
//
// To update: edit resume-data.js. Every build prints the PDF the site links to from it
// (scripts/resume-build.js), and fails if it no longer fits one page; `npm run resume` prints the
// same PDF locally to look at. Check the private resume too: `npm run resume:private`.
// Dates are "Mon YYYY"; use "Present" for a current role. [text](url) in a point becomes a link.
//
// CONTACT: the resume's header. `links` is its link row, on one line: short labels with icons
//   (`icon`: github, linkedin, leetcode, web, brain, or any other in src/resume/parts.js LINK_ICONS),
//   all clickable. The portfolio keeps its address, as the hub that links to everything else.
// BOOKING: "Schedule a call", the site's own scheduler (/#schedule), booked into my Google Calendar
//   with a Google Meet link by the API. `enabled` shows the site's buttons and the resume's link; the
//   brain map keeps its own switch (SCHEDULE_URL in public/brain-map/index.html). `minutes` is what
//   the buttons say; the API's MEET_MINUTES decides the actual length.
// EXPERIENCE: one entry per employer. `roles` newest first; a promotion is two roles under one
//   employer, each with its own `points`, so the resume and the site show the progression. On a
//   role, the site's Journey shows `summary` and `highlights` (LinkedIn's sections, each a heading
//   and its points); the resume keeps `points`. `github.contributions` counts my work account's
//   contributions in private repositories, which the site adds to the live GitHub count; `skills`
//   shows under the job on the site; `links` sit on the company's line (`short` is the resume's label;
//   a link's `icon` names its icon, or "none", where its label's isn't the one: parts.js LABEL_ICONS).
// PROJECTS: a one-line `summary` each, and `points` for the main projects, most important first
//   (the detailed private resume keeps only the first). Keep each to one line: one that wraps can
//   push the resume onto a second page. The facts come from each project's README.
// GITHUB, PROBLEM_SOLVING: one line each, rounded down so they stay true as the counts grow. The
//   GitHub line counts the last year, including my work in private repositories.
// CERTIFICATIONS: one line per issuer. Where the issuer can verify a certificate, it links there;
//   Tutedude has no public check, so its line links to the certificates on my portfolio.
// STYLE (only once a colour is picked in the admin view): `icons`, the colour of every icon on the
//   resume: "brand" (each brand's own), or one from the palette (parts.js ICON_COLOURS). Without it,
//   icons are the colour of the text they sit in.
import DATA from "./resume-data.js";

export const { CONTACT, BOOKING, SUMMARY, EXPERIENCE, PROJECTS, GITHUB, PROBLEM_SOLVING, EDUCATION, SKILLS, LANGUAGES, CERTIFICATIONS, STYLE } = DATA;

// The date helpers (period, showType, tenure, monthsAt, duration) live with the resume template,
// which needs them for any resume; re-exported here for the site.
export { duration, monthsAt, period, showType, tenure } from "../resume/format.js";
