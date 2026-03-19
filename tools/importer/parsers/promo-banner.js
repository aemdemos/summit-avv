/* eslint-disable */
/* global WebImporter */

/**
 * Parser for promo-banner variant. Custom block (no base).
 * Source: https://www.aveva.com/
 * Generated: 2026-03-19
 *
 * Source DOM structure (from captured HTML):
 *   section.hero-banner.u-hero-height-small
 *     > img (background image, converted from CSS by transformBackgroundImages)
 *     > .container-md.hero-banner__wrapper
 *       > .hero-banner-left-section
 *         > .hero-banner-content
 *           > .heading h2 (heading)
 *           > .description.rte-content p (description, optional)
 *           > .hero-banner-btn-wrapper .smartbutton a (CTA)
 *
 * Target block table:
 *   With background image:
 *     Row 1: [background image]
 *     Row 2: [heading, description (optional), CTA]
 *   Without background image (dark variant):
 *     Row 1: [heading, description, CTA]
 *
 * Variant detection:
 *   - No background image + dark background-color → 'promo-banner dark'
 *   - Has background image → 'promo-banner'
 */
export default function parse(element, { document }) {
  // Extract background image (converted from CSS by transformBackgroundImages)
  const bgImage = element.querySelector(':scope > img')
    || element.querySelector(':scope > picture')
    || element.querySelector(':scope > picture img');

  // Extract heading (h2 inside .heading)
  const heading = element.querySelector('.heading h2');

  // Extract description (p inside .description.rte-content)
  const description = element.querySelector('.description.rte-content p');

  // Extract CTA links wrapped in <strong> for EDS primary button styling
  const ctaLinks = [...element.querySelectorAll('.hero-banner-btn-wrapper .smartbutton a')].filter(
    (a) => a.textContent.trim().length > 0,
  ).map((a) => {
    const strong = document.createElement('strong');
    strong.appendChild(a);
    return strong;
  });

  // Build content cell (heading + optional description + CTAs)
  const contentCell = [];
  if (heading) contentCell.push(heading);
  if (description) contentCell.push(description);
  contentCell.push(...ctaLinks);

  // Build cells based on whether there's a background image
  const cells = [];
  if (bgImage) {
    cells.push([bgImage]);
  }
  cells.push(contentCell);

  // Determine variant: no background image → dark variant
  const blockName = bgImage ? 'promo-banner' : 'promo-banner dark';

  const block = WebImporter.Blocks.createBlock(document, { name: blockName, cells });
  element.replaceWith(block);
}
