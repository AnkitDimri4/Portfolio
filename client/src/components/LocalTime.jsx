import { useEffect, useState } from "react";
import { PROFILE } from "../data/profile";

const formatter = new Intl.DateTimeFormat("en-US", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
  timeZone: PROFILE.timezone,
});

// e.g. "02:19 PM": AM and PM in capitals, as the hero's label and Schedule a call's times show them
const format = () => formatter.format(new Date());

/** Live clock in Ankit's timezone (IST), 12-hour format. */
const LocalTime = () => {
  // Filled in after mount: the pre-rendered HTML is built ahead of time, so a time in it would be stale.
  const [time, setTime] = useState(null);
  useEffect(() => {
    setTime(format());
    const id = setInterval(() => setTime(format()), 15000);
    return () => clearInterval(id);
  }, []);
  return <time>{time ?? "--:-- --"} IST</time>;
};

export default LocalTime;
