import React from 'react';
import { colors } from '../styles/theme';

// RichText renders plain AI text in a clean, readable way. It understands a
// few simple patterns so explanations do not look "weird" with raw markdown:
//   - "Label:" lines (like "Definition:") become small subheadings
//   - lines starting with "- " or "* " become a bullet list
//   - lines starting with "1." become a numbered list
//   - inline **bold** and `code` are rendered properly
// Anything left over is shown as a normal paragraph.

// Render the inline pieces of a single line: **bold** and `code`.
function renderInline(text, keyPrefix) {
  const parts = [];
  const pattern = /(\*\*[^*]+\*\*|`[^`]+`)/g;

  String(text)
    .split(pattern)
    .forEach((segment, index) => {
      if (!segment) return;

      if (segment.startsWith('**') && segment.endsWith('**')) {
        parts.push(<strong key={`${keyPrefix}-b-${index}`}>{segment.slice(2, -2)}</strong>);
        return;
      }

      if (segment.startsWith('`') && segment.endsWith('`')) {
        parts.push(
          <code
            key={`${keyPrefix}-c-${index}`}
            style={{
              background: '#eef2f7',
              padding: '2px 6px',
              borderRadius: 6,
              fontFamily: "'Consolas', 'Courier New', monospace",
              fontSize: '0.92em',
            }}
          >
            {segment.slice(1, -1)}
          </code>
        );
        return;
      }

      parts.push(<React.Fragment key={`${keyPrefix}-t-${index}`}>{segment}</React.Fragment>);
    });

  return parts;
}

function RichText({ text }) {
  const lines = String(text || '').replace(/\r\n/g, '\n').split('\n');
  const blocks = [];

  // Buffer used to collect consecutive list items before flushing them.
  let listItems = [];
  let listType = null; // 'ul' or 'ol'

  // Turn any buffered list items into a real <ul> or <ol> and reset.
  const flushList = () => {
    if (listItems.length === 0) return;

    const items = listItems.map((item, index) => (
      <li key={`li-${blocks.length}-${index}`} style={{ marginBottom: 6 }}>
        {renderInline(item, `li-${blocks.length}-${index}`)}
      </li>
    ));

    const listStyle = { margin: '0 0 12px 22px', color: colors.body, lineHeight: 1.7 };

    if (listType === 'ol') {
      blocks.push(<ol key={`ol-${blocks.length}`} style={listStyle}>{items}</ol>);
    } else {
      blocks.push(<ul key={`ul-${blocks.length}`} style={listStyle}>{items}</ul>);
    }

    listItems = [];
    listType = null;
  };

  lines.forEach((rawLine) => {
    const line = rawLine.trim();

    // A blank line ends any current list and adds spacing.
    if (!line) {
      flushList();
      return;
    }

    // Remove any leading markdown heading hashes the model may have added.
    const cleaned = line.replace(/^#+\s*/, '');

    const bulletMatch = /^[-*•]\s+(.*)/.exec(cleaned);
    const numberMatch = /^\d+\.\s+(.*)/.exec(cleaned);

    // Bullet list item.
    if (bulletMatch) {
      if (listType === 'ol') flushList();
      listType = 'ul';
      listItems.push(bulletMatch[1]);
      return;
    }

    // Numbered list item.
    if (numberMatch) {
      if (listType === 'ul') flushList();
      listType = 'ol';
      listItems.push(numberMatch[1]);
      return;
    }

    // Any other line ends a list first.
    flushList();

    // A short "Label:" line (e.g. "Definition:") becomes a subheading.
    const isLabelHeading = /^[A-Za-z][\w \-/]{0,28}:$/.test(cleaned);
    if (isLabelHeading) {
      blocks.push(
        <h4
          key={`h-${blocks.length}`}
          style={{ margin: '14px 0 6px', color: colors.heading, fontSize: '1rem' }}
        >
          {cleaned.replace(/:$/, '')}
        </h4>
      );
      return;
    }

    // Everything else is a normal paragraph.
    blocks.push(
      <p
        key={`p-${blocks.length}`}
        style={{ margin: '0 0 10px', lineHeight: 1.7, color: colors.body }}
      >
        {renderInline(cleaned, `p-${blocks.length}`)}
      </p>
    );
  });

  // Flush any list left at the very end.
  flushList();

  return <div>{blocks}</div>;
}

export default RichText;
