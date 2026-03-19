/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns-highlight variant. Base block: columns.
 * Source: https://www.aveva.com/
 * Generated: 2026-03-17
 *
 * Source DOM structure (from captured HTML):
 *   section.background-container (or #getAgileSection)
 *     > .column-control .row.coltype-2
 *       > .col.col-sm-6 (text column)
 *         > .cmp-text h2 (heading - may have multiple h2s)
 *         > .cmp-text p (description)
 *         > .smartbutton a (CTA)
 *       > .col.col-sm-6 (image column)
 *         > .cmp-image__image img (image)
 *
 * Note: Column order varies - sometimes text first, sometimes image first.
 *
 * Target block table (from block library):
 *   Row 1: [text content | image] or [image | text content]
 *   Each column can contain text, images, or inline elements.
 */
export default function parse(element, { document }) {
  // element IS the .row.coltype-2 — work directly on it
  const cols = [...element.querySelectorAll(':scope > .col')];
  if (cols.length < 2) return;

  // Build cell content for each column
  const cellContents = cols.map((col) => {
    const cellItems = [];

    // Check if this column has an image
    const img = col.querySelector('.cmp-image__image, img[class*="cmp-image"]');
    if (img) {
      cellItems.push(img);
      return cellItems;
    }

    // Text content column: headings, paragraphs, CTA
    const headings = [...col.querySelectorAll('.cmp-text h2, .cmp-text h3')];
    headings.forEach((h) => cellItems.push(h));

    const paragraphs = [...col.querySelectorAll('.cmp-text p')].filter(
      (p) => p.textContent.trim().length > 0 && p.textContent.trim() !== '\u00a0',
    );
    paragraphs.forEach((p) => cellItems.push(p));

    const ctaLinks = [...col.querySelectorAll('.smartbutton a')].filter(
      (a) => a.textContent.trim().length > 0,
    );
    ctaLinks.forEach((a) => {
      // Detect button style from source classes:
      // ghost-btn → secondary (em), secondary-grey-color-btn → primary (strong)
      const isGhost = a.classList.contains('ghost-btn');
      const wrapper = document.createElement(isGhost ? 'em' : 'strong');
      wrapper.appendChild(a);
      cellItems.push(wrapper);
    });

    return cellItems;
  });

  // Build cells: one row with columns preserving source order
  const cells = [cellContents];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-highlight', cells });
  element.replaceWith(block);
}
