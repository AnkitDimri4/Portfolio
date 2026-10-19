// useApi with the page's snapshot: the API's answers when the page was built (scripts/prerender.js)
import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { setSnapshot, snapshotScript, useApi } from "./api";

const Show = ({ path }) => {
  const { data, error } = useApi(path);
  return <p>{error ? "error" : data ? data.n : "loading"}</p>;
};
const answer = (body, status = 200) => vi.stubGlobal("fetch", vi.fn(async () => ({ ok: status < 400, status, json: async () => body })));

afterEach(() => {
  setSnapshot({});
  vi.unstubAllGlobals();
});

// Each test asks for a path of its own: answers are shared for the whole page load (fetchJSON).
describe("useApi with the page's snapshot", () => {
  it("starts from the snapshot, then shows the live answer", async () => {
    setSnapshot({ "/a": { n: "from the build" } });
    answer({ n: "live" });
    render(<Show path="/a" />);
    expect(screen.getByText("from the build")).toBeInTheDocument();
    expect(await screen.findByText("live")).toBeInTheDocument();
  });

  it("keeps the snapshot when the API can't answer: older numbers rather than none", async () => {
    setSnapshot({ "/b": { n: "from the build" } });
    answer({ message: "Not found" }, 404);
    render(<Show path="/b" />);
    await act(async () => {});
    expect(fetch).toHaveBeenCalled();
    expect(screen.getByText("from the build")).toBeInTheDocument();
  });

  it("without a snapshot, waits for the API as before", async () => {
    answer({ message: "Not found" }, 404);
    render(<Show path="/c" />);
    expect(screen.getByText("loading")).toBeInTheDocument();
    expect(await screen.findByText("error")).toBeInTheDocument();
  });
});

describe("snapshotScript", () => {
  it("writes a data block that nothing inside can end, and that reads back as the same answers", () => {
    const answers = { "/a": { description: "</script><script>alert(1)</script><!--", n: 1 } };
    const html = snapshotScript(answers);
    expect(html.startsWith('<script type="application/json" id="api-snapshot">')).toBe(true);
    expect(html.match(/<\/script>/gi)).toHaveLength(1); // its own end, and no other
    expect(html).not.toContain("<!--");
    expect(JSON.parse(html.slice(html.indexOf(">") + 1, html.lastIndexOf("</script>")))).toEqual(answers);
  });
});
