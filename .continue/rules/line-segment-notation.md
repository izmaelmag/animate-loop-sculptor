# Line/Segment Notation DSL

## Purpose

A compact notation to describe text (or any token) assignment for:

- line-level selection
- segment-level selection inside a selected line

The DSL is renderer-agnostic and intended for reuse across straight lines, polylines, curves, and arbitrary path shapes.

## Syntax

- One line definition is enclosed in square brackets: `[ ... ]`
- Content inside one bracket is a comma-separated segment token list.
- Whitespace around tokens is trimmed.

Examples:

- `[this is a line,hello]`
- `[foo,bar,baz][lorem ipsum,dolor]`

## Parsing Rules

- Each bracket block creates one line entry.
- Commas inside one block split segment tokens.
- Empty tokens are removed after trimming.
- If a line becomes empty after normalization, it falls back to one empty token (`""`).
- If no valid line is parsed, the full notation falls back to one line with one empty token.

## Resolution Rules

- `lineIndex` uses cyclic repeat:
  - `resolvedLine = lines[lineIndex % lines.length]`
- `segmentIndex` inside resolved line uses cyclic repeat:
  - `resolvedToken = lineTokens[segmentIndex % lineTokens.length]`

## Fault Tolerance

- Unpaired brackets are tolerated:
  - parser keeps valid closed blocks
  - unterminated trailing block is parsed as a line
- Diagnostics are produced for:
  - empty input fallback
  - malformed bracket structure
  - normalization/fallback events

## Determinism

For the same input and normalization options, parse and resolution results are deterministic.

## Integration Guidance (Animation Adapters)

This DSL should stay independent from rendering engines.

Recommended adapter shape:

1. Parse once when parameter string changes.
2. For each frame:
   - resolve line token sets by `lineIndex`
   - resolve per-segment token by `segmentIndex`
3. Pass resolved token to renderer-specific drawing code.

Generic adapter pseudo-flow:

- Input params: `notationText`
- Runtime indexes: `lineIndex`, `segmentIndex`
- Core call: `resolver.resolveSegment(lineIndex, segmentIndex)`
- Output: token string to paint as text/color/material key/etc.

This model is compatible with:

- straight lines
- polylines
- bezier paths
- arbitrary closed/open shapes

Only index mapping changes by renderer/path type; DSL core stays unchanged.
