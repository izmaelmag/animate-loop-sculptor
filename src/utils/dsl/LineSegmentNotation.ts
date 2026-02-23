export type LineSegmentTokens = string[];

export type ParsedLines = LineSegmentTokens[];

export type ParseDiagnosticCode =
  | "EMPTY_INPUT_FALLBACK"
  | "UNPAIRED_BRACKET_TOLERATED"
  | "EMPTY_LINE_FALLBACK"
  | "NO_VALID_LINES_FALLBACK";

export interface ParseDiagnostic {
  code: ParseDiagnosticCode;
  message: string;
}

export interface ParsedNotation {
  lines: ParsedLines;
  diagnostics: ParseDiagnostic[];
}

export interface ResolveMatrixOptions {
  lineCount: number;
  segmentCountByLine: number | ((lineIndex: number) => number);
}

const FALLBACK_LINES: ParsedLines = [[""]];

const normalizeTokenList = (lineText: string): string[] => {
  const tokens = lineText
    .split(",")
    .map((token) => token.trim())
    .filter((token) => token.length > 0);
  return tokens.length > 0 ? tokens : [""];
};

const positiveModulo = (value: number, base: number): number => {
  if (base <= 0) {
    return 0;
  }
  return ((value % base) + base) % base;
};

export class LineSegmentNotation {
  private _rawInput = "";
  private _parsed: ParsedNotation = {
    lines: FALLBACK_LINES.map((line) => [...line]),
    diagnostics: [],
  };

  constructor(input: string) {
    this.parse(input);
  }

  public parse(input: string): ParsedNotation {
    this._rawInput = input;
    const diagnostics: ParseDiagnostic[] = [];
    const lines: ParsedLines = [];

    const trimmedInput = input.trim();
    if (trimmedInput.length === 0) {
      diagnostics.push({
        code: "EMPTY_INPUT_FALLBACK",
        message: "Input is empty. Falling back to one empty token.",
      });
      this._parsed = {
        lines: FALLBACK_LINES.map((line) => [...line]),
        diagnostics,
      };
      return this.getParsed();
    }

    let inBracket = false;
    let hasUnpaired = false;
    let current = "";

    for (let index = 0; index < input.length; index += 1) {
      const char = input[index];

      if (char === "[") {
        if (inBracket) {
          hasUnpaired = true;
          const nestedBuffer = current.trim();
          if (nestedBuffer.length > 0) {
            lines.push(normalizeTokenList(nestedBuffer));
          }
          current = "";
        }
        inBracket = true;
        current = "";
        continue;
      }

      if (char === "]") {
        if (!inBracket) {
          hasUnpaired = true;
          continue;
        }
        const lineText = current.trim();
        if (lineText.length === 0) {
          lines.push([""]);
          diagnostics.push({
            code: "EMPTY_LINE_FALLBACK",
            message: "Encountered empty line block. Falling back to one empty token.",
          });
        } else {
          lines.push(normalizeTokenList(lineText));
        }
        inBracket = false;
        current = "";
        continue;
      }

      if (inBracket) {
        current += char;
      }
    }

    if (inBracket) {
      hasUnpaired = true;
      const lineText = current.trim();
      if (lineText.length === 0) {
        lines.push([""]);
        diagnostics.push({
          code: "EMPTY_LINE_FALLBACK",
          message: "Unclosed bracket with empty content. Falling back to one empty token.",
        });
      } else {
        lines.push(normalizeTokenList(lineText));
      }
    }

    if (hasUnpaired) {
      diagnostics.push({
        code: "UNPAIRED_BRACKET_TOLERATED",
        message: "Unpaired bracket detected. Parsed using tolerant mode.",
      });
    }

    if (lines.length === 0) {
      diagnostics.push({
        code: "NO_VALID_LINES_FALLBACK",
        message: "No valid line blocks parsed. Falling back to one empty token.",
      });
      this._parsed = {
        lines: FALLBACK_LINES.map((line) => [...line]),
        diagnostics,
      };
      return this.getParsed();
    }

    this._parsed = { lines, diagnostics };
    return this.getParsed();
  }

  public getRawInput(): string {
    return this._rawInput;
  }

  public getParsed(): ParsedNotation {
    return {
      lines: this._parsed.lines.map((line) => [...line]),
      diagnostics: this._parsed.diagnostics.map((diagnostic) => ({ ...diagnostic })),
    };
  }

  public getDiagnostics(): ParseDiagnostic[] {
    return this._parsed.diagnostics.map((diagnostic) => ({ ...diagnostic }));
  }

  public resolveLine(lineIndex: number): LineSegmentTokens {
    const lines = this._parsed.lines;
    const resolvedIndex = positiveModulo(lineIndex, lines.length);
    return [...lines[resolvedIndex]];
  }

  public resolveSegment(lineIndex: number, segmentIndex: number): string {
    const lineTokens = this.resolveLine(lineIndex);
    const resolvedIndex = positiveModulo(segmentIndex, lineTokens.length);
    return lineTokens[resolvedIndex];
  }

  public resolveMatrix(options: ResolveMatrixOptions): string[][] {
    const lineCount = Math.max(0, Math.floor(options.lineCount));
    const result: string[][] = [];

    for (let lineIndex = 0; lineIndex < lineCount; lineIndex += 1) {
      const segmentCountRaw =
        typeof options.segmentCountByLine === "function"
          ? options.segmentCountByLine(lineIndex)
          : options.segmentCountByLine;
      const segmentCount = Math.max(0, Math.floor(segmentCountRaw));
      const resolvedLine: string[] = [];
      for (let segmentIndex = 0; segmentIndex < segmentCount; segmentIndex += 1) {
        resolvedLine.push(this.resolveSegment(lineIndex, segmentIndex));
      }
      result.push(resolvedLine);
    }

    return result;
  }
}
