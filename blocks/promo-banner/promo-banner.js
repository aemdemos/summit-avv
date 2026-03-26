function picIn(row) {
  return row.querySelector('picture');
}

/** First table row: block name only (no image). Strips legacy suffix like "(dark)" after the label. */
function isTitleRow(row) {
  if (picIn(row)) return false;
  const t = row.textContent.replace(/\u00a0/g, ' ').trim();
  if (t.length > 100) return false;
  const n = t.toLowerCase().replace(/\s+/g, ' ').split('(')[0].trim();
  return n === 'promo-banner' || n === 'promo banner';
}

/** Headline, body, or CTA link (not the cell that only wraps the image). */
function hasCopyBesideImage(row) {
  return Boolean(
    row.querySelector('h1, h2, h3')
      || [...row.querySelectorAll('p')].some((p) => !p.querySelector('picture') && p.textContent.trim())
      || row.querySelector('a[href]'),
  );
}

function dataRows(block) {
  return [...block.children].filter(
    (r) => !r.classList.contains('promo-banner-block-name') && !isTitleRow(r),
  );
}

/**
 * One DA row with image + copy → split into background row + content row (matches existing CSS).
 * @param {Element} combined
 */
function splitCombinedRow(combined) {
  const picture = combined.querySelector('picture');
  const cells = [...combined.children].filter((el) => el.tagName === 'DIV');
  if (!picture || cells.length === 0) return;

  const bg = document.createElement('div');
  bg.className = 'promo-banner-bg';
  const inner = document.createElement('div');
  picture.remove();
  inner.append(picture);
  bg.append(inner);
  cells.forEach((cell) => {
    cell.querySelectorAll('p:empty').forEach((p) => p.remove());
  });
  const content = document.createElement('div');
  cells.forEach((cell) => {
    content.append(...cell.childNodes);
  });
  combined.replaceWith(bg, content);
}

function removeGhostRows(block) {
  [...block.children].forEach((row) => {
    if (row.classList.contains('promo-banner-block-name')) return;
    if (picIn(row)) return;
    if (row.querySelector('h1, h2, h3, p, a[href]')) return;
    if (!row.textContent.replace(/\u00a0/g, ' ').trim()) row.remove();
  });
}

function tagBackgroundRow(block) {
  const bgRow = dataRows(block).find((r) => picIn(r));
  if (bgRow) bgRow.classList.add('promo-banner-bg');
}

/**
 * @param {Element} block
 */
export default function decorate(block) {
  [...block.children].forEach((row) => {
    if (isTitleRow(row)) row.classList.add('promo-banner-block-name');
  });

  const layout = dataRows(block);
  const combined = layout.find((r) => picIn(r) && hasCopyBesideImage(r));
  if (combined) splitCombinedRow(combined);
  removeGhostRows(block);
  tagBackgroundRow(block);
}
