import { useEffect, useState } from "react";

// Phone-sized (up to 640 px): where Stack's groups and Work's cards are rows to swipe (their CSS).
const PHONE = "(max-width: 640px)";

/**
 * Whether the window is phone-sized, following it as it's resized. Known only once the page is in the
 * browser: the pre-rendered page (and so the browser's first render, which must match it) says no.
 */
const usePhone = () => {
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

export default usePhone;
