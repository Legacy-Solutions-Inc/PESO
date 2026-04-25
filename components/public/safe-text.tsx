import { Fragment, type ReactNode } from "react";

/**
 * Renders a plain-text string into safe React nodes:
 *   - Each \n becomes a <br /> (caller may instead split on blank lines
 *     to wrap into paragraphs — see {@link SafeParagraphs}).
 *   - http(s):// URLs become <a target="_blank" rel="noopener noreferrer nofollow"> links.
 *   - Everything else renders as text — React handles HTML escaping
 *     because we never call dangerouslySetInnerHTML.
 *
 * Designed for caption / description fields that the system stores as
 * raw plain text (news posts, job postings). HTML, markdown, and
 * `javascript:` / `data:` URLs are all rendered as text — they never
 * become tags or links. Tests cover the linker in `safe-text.test.ts`.
 */

interface SafeTextProps {
  children: string;
  /** Optional className applied to the outermost wrapper. */
  className?: string;
}

export function SafeText({ children, className }: SafeTextProps) {
  return <span className={className}>{linkifyWithBreaks(children)}</span>;
}

/**
 * Like {@link SafeText} but treats blank lines as paragraph boundaries:
 * the input is split on `\n\s*\n`, each block becomes a <p>, and single
 * newlines inside a block become <br />.
 */
export function SafeParagraphs({
  children,
  className,
  paragraphClassName,
}: {
  children: string;
  className?: string;
  paragraphClassName?: string;
}) {
  const blocks = children.split(/\n\s*\n/);
  return (
    <div className={className}>
      {blocks.map((block, i) => (
        <p key={i} className={paragraphClassName}>
          {linkifyWithBreaks(block)}
        </p>
      ))}
    </div>
  );
}

function linkifyWithBreaks(input: string): ReactNode[] {
  if (!input) return [];
  // Split on newline first, render each chunk through linkify, and
  // intersperse <br /> for line breaks. This composes safely because
  // linkify itself returns React node arrays.
  const lines = input.split("\n");
  const nodes: ReactNode[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? "";
    nodes.push(
      <Fragment key={`line-${i}`}>{linkifyLine(line, i)}</Fragment>,
    );
    if (i < lines.length - 1) {
      nodes.push(<br key={`br-${i}`} />);
    }
  }
  return nodes;
}

/**
 * Strict URL pattern: only http(s):// followed by non-whitespace, with
 * common trailing punctuation peeled off. Anchored anywhere in the line.
 *
 * Critically does NOT match `javascript:`, `data:`, or any other scheme.
 * Anything outside the regex stays as plain text.
 */
const URL_REGEX = /https?:\/\/[^\s<>"]+/gi;
const TRAILING_PUNCTUATION = /[.,!?;:'")\]}]+$/;

interface LinkifyToken {
  type: "text" | "url";
  value: string;
}

/**
 * Tokenize one line into alternating text/url segments. Exported for
 * direct unit testing without React.
 */
export function tokenizeLinks(line: string): LinkifyToken[] {
  const tokens: LinkifyToken[] = [];
  let lastIndex = 0;
  // `replace` with a callback gives us match-start positions reliably.
  line.replace(URL_REGEX, (rawMatch, offset: number) => {
    if (offset > lastIndex) {
      tokens.push({ type: "text", value: line.slice(lastIndex, offset) });
    }
    // Strip trailing punctuation off the URL — it almost always belongs
    // to the surrounding sentence, not the link.
    const trailing = rawMatch.match(TRAILING_PUNCTUATION)?.[0] ?? "";
    const url = trailing
      ? rawMatch.slice(0, rawMatch.length - trailing.length)
      : rawMatch;
    tokens.push({ type: "url", value: url });
    if (trailing) {
      tokens.push({ type: "text", value: trailing });
    }
    lastIndex = offset + rawMatch.length;
    return rawMatch;
  });
  if (lastIndex < line.length) {
    tokens.push({ type: "text", value: line.slice(lastIndex) });
  }
  return tokens;
}

function linkifyLine(line: string, lineIndex: number): ReactNode[] {
  const tokens = tokenizeLinks(line);
  return tokens.map((tok, i) => {
    if (tok.type === "text") {
      return <Fragment key={`t-${lineIndex}-${i}`}>{tok.value}</Fragment>;
    }
    return (
      <a
        key={`u-${lineIndex}-${i}`}
        href={tok.value}
        target="_blank"
        rel="noopener noreferrer nofollow"
        className="text-primary underline-offset-4 hover:underline"
      >
        {tok.value}
      </a>
    );
  });
}
