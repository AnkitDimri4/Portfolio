import { render } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import Marquee from "./Marquee";

describe("the two moving lanes (repositories, and the tech I use)", () => {
  it("has one copy of each lane in the page the build writes, and the three the loop needs once it runs", () => {
    const html = renderToString(<Marquee />);
    expect(html.match(/class="lane-group"/g)).toHaveLength(2); // one a lane
    const { container } = render(<Marquee />);
    const tracks = container.querySelectorAll(".lane-track");
    expect(tracks).toHaveLength(2);
    for (const track of tracks) {
      expect(track.children).toHaveLength(3);
      expect(track.children[1].innerHTML).toBe(track.children[0].innerHTML);
    }
  });
});
