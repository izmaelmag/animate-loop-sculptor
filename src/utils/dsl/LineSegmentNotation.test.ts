import { describe, expect, it } from "vitest";
import { LineSegmentNotation } from "./LineSegmentNotation";

describe("LineSegmentNotation", () => {
  it("parses multiple lines with comma-separated segments", () => {
    const notation = new LineSegmentNotation("[this is a line,hello][foo,bar,baz]");
    const parsed = notation.getParsed();

    expect(parsed.lines).toEqual([
      ["this is a line", "hello"],
      ["foo", "bar", "baz"],
    ]);
    expect(parsed.diagnostics.length).toBe(0);
  });

  it("applies cyclic line repeat and cyclic segment repeat", () => {
    const notation = new LineSegmentNotation("[A,B][X]");

    expect(notation.resolveLine(0)).toEqual(["A", "B"]);
    expect(notation.resolveLine(2)).toEqual(["A", "B"]);
    expect(notation.resolveSegment(0, 3)).toBe("B");
    expect(notation.resolveSegment(1, 4)).toBe("X");
  });

  it("builds matrix using constant segment count", () => {
    const notation = new LineSegmentNotation("[hello,world]");
    const matrix = notation.resolveMatrix({
      lineCount: 3,
      segmentCountByLine: 5,
    });

    expect(matrix).toEqual([
      ["hello", "world", "hello", "world", "hello"],
      ["hello", "world", "hello", "world", "hello"],
      ["hello", "world", "hello", "world", "hello"],
    ]);
  });

  it("builds matrix using per-line segment count function", () => {
    const notation = new LineSegmentNotation("[a,b][x,y,z]");
    const matrix = notation.resolveMatrix({
      lineCount: 2,
      segmentCountByLine: (lineIndex) => (lineIndex === 0 ? 3 : 4),
    });

    expect(matrix).toEqual([
      ["a", "b", "a"],
      ["x", "y", "z", "x"],
    ]);
  });

  it("normalizes whitespace and removes empty segment tokens", () => {
    const notation = new LineSegmentNotation("[  hello  , , world   ,   ]");
    expect(notation.getParsed().lines).toEqual([["hello", "world"]]);
  });

  it("falls back for empty input", () => {
    const notation = new LineSegmentNotation("   ");
    const parsed = notation.getParsed();
    expect(parsed.lines).toEqual([[""]]);
    expect(parsed.diagnostics.some((d) => d.code === "EMPTY_INPUT_FALLBACK")).toBe(true);
  });

  it("tolerates unpaired brackets and parses trailing unclosed block", () => {
    const notation = new LineSegmentNotation("[foo,bar][baz");
    const parsed = notation.getParsed();
    expect(parsed.lines).toEqual([
      ["foo", "bar"],
      ["baz"],
    ]);
    expect(
      parsed.diagnostics.some((d) => d.code === "UNPAIRED_BRACKET_TOLERATED"),
    ).toBe(true);
  });

  it("falls back to empty token for empty line blocks", () => {
    const notation = new LineSegmentNotation("[][hello]");
    const parsed = notation.getParsed();
    expect(parsed.lines).toEqual([[""], ["hello"]]);
    expect(parsed.diagnostics.some((d) => d.code === "EMPTY_LINE_FALLBACK")).toBe(true);
  });
});
