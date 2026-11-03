/**
 * Shows a rich text field's saved value (Volto's `richtext` widget): HTML
 * ({ data: '<p>…' }), Slate nodes (an array, or { data: [...] }) or a plain
 * HTML string. Empty values ("<p></p>", nodes without text) render nothing.
 * Shared by the Content Row and Pricing tiers blocks.
 *
 *   <RichText data={item.text} className="content-row-item__text" />
 *   hasRichText(item.text) // true when there's something to show
 *
 * Also `plainTextToRichText`, for moving a plain-text field to the
 * rich-text widget (below).
 */
import React from 'react';

// Hook-free slate node renderer
// serializeNodesToHtml uses hooks internally so we render nodes directly.
const SlateLeaf = ({ leaf }) => {
  let el = <>{typeof leaf.text === 'string' ? leaf.text : ''}</>;
  if (leaf.bold) el = <strong>{el}</strong>;
  if (leaf.italic) el = <em>{el}</em>;
  if (leaf.underline) el = <u>{el}</u>;
  if (leaf.strikethrough) el = <s>{el}</s>;
  if (leaf.code) el = <code>{el}</code>;
  return el;
};

const SlateNode = ({ node }) => {
  if (!node) return null;
  // Leaf (text node)
  if (node.text !== undefined)
    return (
      <SlateLeaf
        leaf={{ ...node, text: typeof node.text === 'string' ? node.text : '' }}
      />
    );
  const children = (node.children || []).map((child, i) => (
    <SlateNode key={i} node={child} />
  ));
  switch (node.type) {
    case 'p':
      return <p>{children}</p>;
    case 'h1':
      return <h1>{children}</h1>;
    case 'h2':
      return <h2>{children}</h2>;
    case 'h3':
      return <h3>{children}</h3>;
    case 'h4':
      return <h4>{children}</h4>;
    case 'ul':
      return <ul>{children}</ul>;
    case 'ol':
      return <ol>{children}</ol>;
    case 'li':
      return <li>{children}</li>;
    case 'blockquote':
      return <blockquote>{children}</blockquote>;
    case 'a':
      return <a href={node.url || node.href || '#'}>{children}</a>;
    case 'strong':
      return <strong>{children}</strong>;
    case 'em':
      return <em>{children}</em>;
    default:
      return <>{children}</>;
  }
};

// A description an editor has touched but left empty is still saved: as
// HTML ("<p></p>", "<p><br></p>") or as Slate nodes without text. It counts
// as no description, so the item doesn't get an empty paragraph (and the
// spacing that comes with it).
const htmlHasContent = (html) =>
  /<(img|iframe|video|audio|embed|object|hr)\b/i.test(html) ||
  html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;|&#160;|\u00a0/gi, '')
    .trim() !== '';

const slateHasContent = (nodes) =>
  nodes.some((node) =>
    typeof node?.text === 'string'
      ? node.text.trim() !== ''
      : Array.isArray(node?.children) && slateHasContent(node.children),
  );

export const hasRichText = (data) => {
  if (!data) return false;
  if (typeof data === 'string') return htmlHasContent(data);
  if (Array.isArray(data)) return slateHasContent(data);
  if (typeof data.data === 'string') return htmlHasContent(data.data);
  if (Array.isArray(data.data)) return slateHasContent(data.data);
  return false;
};

const RichText = ({ data, className }) => {
  if (!hasRichText(data)) return null;
  // Draftjs format: { data: "<p>html string</p>" }
  if (data?.data !== undefined) {
    if (typeof data.data === 'string') {
      /* eslint-disable-next-line react/no-danger */
      return (
        <div
          className={className}
          dangerouslySetInnerHTML={{ __html: data.data }}
        />
      );
    }
    // Slate array nested under data key
    if (Array.isArray(data.data)) {
      return (
        <div className={className}>
          {data.data.map((node, i) => (
            <SlateNode key={i} node={node} />
          ))}
        </div>
      );
    }
  }
  // Slate format: top-level array
  if (Array.isArray(data)) {
    return (
      <div className={className}>
        {data.map((node, i) => (
          <SlateNode key={i} node={node} />
        ))}
      </div>
    );
  }
  // Plain string
  if (typeof data === 'string') {
    /* eslint-disable-next-line react/no-danger */
    return (
      <div className={className} dangerouslySetInnerHTML={{ __html: data }} />
    );
  }
  return null;
};

// ── Plain text → rich text ─────────────────────────────────────────────────
/*
 * Moving a plain-text field to the rich-text widget without losing saved
 * text. The widget stores `{ data: '<p>…</p>', 'content-type': 'text/html' }`
 * and shows a plain string as empty, so a block hands the form its saved
 * text already wrapped (in `getFormData`) and keeps rendering plain strings
 * as text. Nothing is saved until the editor changes something.
 */
const escapeHtml = (text) =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/**
 * Plain text as the rich-text widget's value: a paragraph per blank-line
 * break, single line breaks as spaces (as plain text in a <p> shows them).
 * Anything that isn't a string (already rich text, or empty) is returned
 * unchanged.
 */
export const plainTextToRichText = (value) => {
  if (typeof value !== 'string') return value;
  const paragraphs = value
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s*\n\s*/g, ' ').trim())
    .filter(Boolean);
  if (!paragraphs.length) return undefined;
  return {
    'content-type': 'text/html',
    data: paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join(''),
    encoding: 'utf8',
  };
};

export default RichText;
