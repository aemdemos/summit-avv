/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hero-banner variant. Base block: hero.
 * Source: https://www.aveva.com/
 * Generated: 2026-03-17
 *
 * Source DOM structure (from captured HTML):
 *   section.hero-banner
 *     > img (background image)
 *     > .container-md.hero-banner__wrapper
 *       > .hero-banner-left-section
 *         > .hero-banner-content
 *           > .heading h1|h2 (heading)
 *           > .description.rte-content p (subheading)
 *           > .hero-banner-btn-wrapper .smartbutton a (CTA)
 *
 * Target block table (from block library):
 *   Row 1: [background image]
 *   Row 2: [heading, subheading, CTA link]
 *   Row 3: [announcement text] (optional — only on main hero)
 */
export default function parse(element, { document }) {
  // Extract background image — check multiple sources:
  // 1. Direct child <img> (from scraped HTML)
  // 2. Direct child <picture> (from transformBackgroundImages or live DOM)
  // 3. Any <img> inside a direct child <picture>
  const bgImage = element.querySelector(':scope > img')
    || element.querySelector(':scope > picture')
    || element.querySelector(':scope > picture img');

  // Extract heading (h1 or h2 inside .heading)
  const heading = element.querySelector('.heading h1, .heading h2');

  // Extract description/subheading (p inside .description.rte-content)
  const description = element.querySelector('.description.rte-content p');

  // Extract CTA links (a elements inside .smartbutton, filter out empty containers)
  // Wrap in <strong> so EDS decorateButtons() applies the .button.primary class
  const ctaLinks = [...element.querySelectorAll('.hero-banner-btn-wrapper .smartbutton a')].filter(
    (a) => a.textContent.trim().length > 0,
  ).map((a) => {
    const strong = document.createElement('strong');
    strong.appendChild(a);
    return strong;
  });

  // Check for announcement bar in the document (only on main hero with h1)
  // Use document-level search since the announcement is a sibling in the DOM
  const root = element.ownerDocument || document;
  const announcementEl = heading && heading.tagName === 'H1'
    ? root.querySelector('.announcement .cmp-text p')
    : null;

  // Build cells to match hero block library structure
  const cells = [];

  // Row 1: Background image (optional)
  if (bgImage) {
    cells.push([bgImage]);
  }

  // Row 2: Content (heading + description + CTAs)
  const contentCell = [];
  if (heading) contentCell.push(heading);
  if (description) contentCell.push(description);
  contentCell.push(...ctaLinks);
  cells.push(contentCell);

  // Row 3: Announcement text (optional)
  if (announcementEl) {
    cells.push([announcementEl]);
    // Remove the announcement element and any empty parent containers
    const announcementBlock = announcementEl.closest('.announcement');
    if (announcementBlock) {
      const parent = announcementBlock.parentElement;
      announcementBlock.remove();
      if (parent && parent.children.length === 0 && parent.textContent.trim() === '') {
        parent.remove();
      }
    }
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-banner', cells });
  element.replaceWith(block);
}
