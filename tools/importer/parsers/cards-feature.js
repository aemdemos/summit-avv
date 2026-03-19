/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-feature variant. Base block: cards.
 * Source: https://www.aveva.com/
 * Generated: 2026-03-17
 *
 * Source DOM structure (from captured HTML) - two card types:
 *
 * Type 1 - card-v3 (Customer Success cards):
 *   .card-v3.clickable-card
 *     > img.card-v3__img (card image)
 *     > .card-v3__body
 *       > h3.card-v3__heading (title)
 *       > .card-v3__description p (description)
 *   Sibling: .smartbutton a (CTA link, outside card div)
 *
 * Type 2 - card-v2-t1 (Icon cards):
 *   .card-v2-t1.clickable-card
 *     > img.card-v2-t1__img (icon image)
 *     > .card-v2-t1__body
 *       > h3.card-v2-t1__heading (title)
 *       > .card-v2-t1__desciption p (description - note typo in source class)
 *       > .card-v2-t1__link .smartbutton a (CTA link)
 *
 * Target block table (from block library):
 *   Each row = one card: [image | heading + description + CTA]
 */
export default function parse(element, { document }) {
  // Find all cards - both v3 and v2-t1 types
  const cards = [...element.querySelectorAll('.card-v3.clickable-card, .card-v2-t1.clickable-card')];

  if (cards.length === 0) return;

  const cells = [];

  cards.forEach((card) => {
    const isV3 = card.classList.contains('card-v3');

    // Extract image
    const img = card.querySelector(
      isV3 ? 'img.card-v3__img' : 'img.card-v2-t1__img',
    );

    // Extract heading
    const heading = card.querySelector(
      isV3 ? 'h3.card-v3__heading' : 'h3.card-v2-t1__heading',
    );

    // Extract description (note: card-v2-t1 has a typo "desciption" in source DOM)
    const descEl = card.querySelector(
      isV3 ? '.card-v3__description p' : '.card-v2-t1__desciption p',
    );

    // Extract CTA link
    let ctaLink = null;
    if (isV3) {
      // For v3 cards, CTA is a sibling .smartbutton outside the card div
      const cardContainer = card.closest('.card-images');
      if (cardContainer) {
        ctaLink = cardContainer.querySelector('.smartbutton a');
      }
    } else {
      // For v2-t1 cards, CTA is inside the card body
      ctaLink = card.querySelector('.card-v2-t1__link .smartbutton a');
    }

    // Build row: [image | text content]
    const imageCell = img ? [img] : [];
    const textCell = [];
    if (heading) textCell.push(heading);
    if (descEl) textCell.push(descEl);
    if (ctaLink && ctaLink.textContent.trim().length > 0) textCell.push(ctaLink);

    cells.push([imageCell, textCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-feature', cells });
  element.replaceWith(block);
}
