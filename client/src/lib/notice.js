// The site's notice (src/data/notice.json, set in the admin view: Admin → Notice): a line at the top
// of the resume builder's pages and in "Schedule a call", for when something's down or paused. It's
// built into the site, so it shows even while the API is down. It shows between `from` and `until`
// (UTC times; empty means no limit), and only in the places `where` lists.
import NOTICE from "../data/notice.json";

/** Where it can show, as the admin view names them. */
export const PLACES = { builder: "The resume builder's pages", scheduler: "Schedule a call" };

/** The notice if it shows at `place` at `now`, else null. */
export const noticeFor = (place, { notice = NOTICE, now = Date.now() } = {}) => {
  const message = notice?.message?.trim();
  if (!message || !notice.where?.includes(place)) return null;
  if (notice.from && now < Date.parse(notice.from)) return null;
  if (notice.until && now >= Date.parse(notice.until)) return null;
  return { ...notice, message };
};
