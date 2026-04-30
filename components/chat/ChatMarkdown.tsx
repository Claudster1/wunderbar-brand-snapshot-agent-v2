"use client";

import React, { Fragment } from "react";

/**
 * Markdown-lite for Wundy chat bubbles — aligned with `public/wundy-widget.js` `renderMarkdown`:
 * - [label](https://...) links
 * - **bold**
 * - *italic*
 * - Double newlines → paragraphs; single newlines → <br />
 */

const INLINE_RE =
  /(\[([^\]]+)\]\((https?:\/\/[^)]+)\))|(\*\*([^*]+)\*\*)|(\*([^*]+)\*)/g;

export function renderChatMarkdownInline(text: string): React.ReactNode {
  if (!text) return null;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  const re = new RegExp(INLINE_RE.source, "g");
  while ((m = re.exec(text)) !== null) {
    if (m.index > lastIndex) {
      parts.push(text.slice(lastIndex, m.index));
    }
    if (m[1] !== undefined) {
      parts.push(
        <a
          key={key++}
          href={m[3]}
          target="_blank"
          rel="noopener noreferrer"
          className="chat-md-link"
        >
          {m[2]}
        </a>,
      );
    } else if (m[5] !== undefined) {
      parts.push(<strong key={key++}>{m[5]}</strong>);
    } else if (m[7] !== undefined) {
      parts.push(<em key={key++}>{m[7]}</em>);
    }
    lastIndex = re.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  if (parts.length === 0) return null;
  return parts.length === 1 ? parts[0] : <>{parts}</>;
}

function renderParagraphLines(para: string): React.ReactNode {
  const lines = para.split("\n");
  return lines.map((line, i) => (
    <Fragment key={i}>
      {i > 0 && <br />}
      {renderChatMarkdownInline(line)}
    </Fragment>
  ));
}

type ChatMarkdownProps = {
  text: string;
  /** Optional class on the wrapper (e.g. parent uses `.wundy-msg-user .chat-md-link`) */
  className?: string;
};

/**
 * Block message: split on blank lines into <p>, single newlines inside a block become <br />.
 * Style links via parent: `.chat-bubble-user .chat-md-link`, `.wundy-msg-user .chat-md-link`, etc.
 */
export function ChatMarkdown({ text, className }: ChatMarkdownProps) {
  const paragraphs = text
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
  if (paragraphs.length === 0) return null;

  return (
    <div className={className ? `chat-md ${className}` : "chat-md"}>
      {paragraphs.map((para, i) => (
        <p key={i}>{renderParagraphLines(para)}</p>
      ))}
    </div>
  );
}
