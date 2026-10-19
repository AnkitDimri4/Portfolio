import { describe, expect, it } from "vitest";
import { webUrl } from "./webUrl";

describe("webUrl", () => {
  it("keeps web addresses", () => {
    for (const url of ["https://github.com/AnkitDimri4", "http://example.com/a?b=c#d", "https://portfolio-git-x-ankit-dimris-projects.vercel.app/"]) {
      expect(webUrl(url)).toBe(url);
    }
  });

  it("drops anything else, so it can't become a link that runs script", () => {
    for (const url of ["javascript:alert(1)", " JavaScript:alert(1)", "data:text/html,<script>alert(1)</script>", "vbscript:x", "/relative", "", null, undefined, 42, {}]) {
      expect(webUrl(url)).toBeUndefined();
    }
  });
});
