import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Carousel } from "./Carousel";

const SLIDES = ["Slide 1", "Slide 2", "Slide 3", "Slide 4", "Slide 5"].map((label) => <div key={label}>{label}</div>);

describe("Carousel", () => {
  it("starts on the first slide, with the previous arrow disabled and one dot per slide", () => {
    render(<Carousel slides={SLIDES} />);
    expect(screen.getByRole("button", { name: "Previous slide" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next slide" })).toBeEnabled();
    expect(screen.getAllByRole("button", { name: /Go to slide/ })).toHaveLength(5);
    expect(screen.getByRole("button", { name: "Go to slide 1" })).toHaveAttribute("aria-current", "true");
  });

  it("advances one slide per click on the next arrow, and disables it at the end without loop", async () => {
    const user = userEvent.setup();
    render(<Carousel slides={SLIDES.slice(0, 2)} />);
    const next = screen.getByRole("button", { name: "Next slide" });

    await user.click(next);
    expect(screen.getByRole("button", { name: "Go to slide 2" })).toHaveAttribute("aria-current", "true");
    expect(next).toBeDisabled();
    expect(screen.getByRole("button", { name: "Previous slide" })).toBeEnabled();
  });

  it("wraps at both ends when loop is set", async () => {
    const user = userEvent.setup();
    render(<Carousel slides={SLIDES.slice(0, 2)} loop />);
    const next = screen.getByRole("button", { name: "Next slide" });

    expect(next).toBeEnabled();
    await user.click(next);
    await user.click(next);
    // Wrapped back to the first slide instead of disabling at the end.
    expect(screen.getByRole("button", { name: "Go to slide 1" })).toHaveAttribute("aria-current", "true");
  });

  it("clicking a dot jumps straight to that slide", async () => {
    const user = userEvent.setup();
    render(<Carousel slides={SLIDES} />);
    await user.click(screen.getByRole("button", { name: "Go to slide 4" }));
    expect(screen.getByRole("button", { name: "Go to slide 4" })).toHaveAttribute("aria-current", "true");
  });

  it("itemsPerView shrinks the valid index range so the window never scrolls past the last slide", () => {
    // 5 slides at itemsPerView=2 can only start at index 0..3 (4 positions),
    // not one dot per raw slide.
    render(<Carousel slides={SLIDES} itemsPerView={2} />);
    expect(screen.getAllByRole("button", { name: /Go to slide/ })).toHaveLength(4);
  });

  it("hides the arrow buttons when showButtons is false, without removing swipe/keyboard navigation", () => {
    render(<Carousel slides={SLIDES} showButtons={false} />);
    expect(screen.queryByRole("button", { name: "Previous slide" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Next slide" })).not.toBeInTheDocument();
    expect(screen.getByRole("region")).toBeInTheDocument();
  });

  it("is a controlled component when index/onIndexChange are given", async () => {
    const user = userEvent.setup();
    let controlledIndex = 0;
    const handleChange = (next: number) => {
      controlledIndex = next;
    };
    const { rerender } = render(<Carousel slides={SLIDES} index={controlledIndex} onIndexChange={handleChange} />);

    await user.click(screen.getByRole("button", { name: "Next slide" }));
    // The prop hasn't been updated by the parent yet, so the rendered index
    // should NOT have advanced on its own — a controlled component never
    // manages its own displayed state.
    expect(screen.getByRole("button", { name: "Go to slide 1" })).toHaveAttribute("aria-current", "true");
    expect(controlledIndex).toBe(1);

    rerender(<Carousel slides={SLIDES} index={controlledIndex} onIndexChange={handleChange} />);
    expect(screen.getByRole("button", { name: "Go to slide 2" })).toHaveAttribute("aria-current", "true");
  });
});
