function picIn(row) {
  return row.querySelector('picture');
}

/** Block title row from DA (no image). */
function isTitleRow(row) {
  if (picIn(row)) return false;
  const t = row.textContent.replace(/\u00a0/g, ' ').trim();
  if (t.length > 80) return false;
  const n = t.toLowerCase().replace(/\s+/g, ' ');
  return n === 'hero-banner' || n === 'hero banner' || /^hero[-\s]?banner$/i.test(t);
}

/** Copy beyond the image wrapper (headings, text paras, links). */
function hasCopyBesideImage(row) {
  if (row.querySelector('h1, h2, h3')) return true;
  if ([...row.querySelectorAll('p')].some((p) => !p.querySelector('picture') && p.textContent.trim())) {
    return true;
  }
  return Boolean(row.querySelector('a[href]'));
}

function dataRows(block) {
  return [...block.children].filter(
    (r) => !r.classList.contains('hero-banner-block-name') && !isTitleRow(r),
  );
}

/**
 * One DA row with picture + copy → two rows for CSS (same idea as simple `hero`: bg picture + flow content).
 * @param {Element} combined
 */
function splitCombinedRow(combined) {
  const picture = combined.querySelector('picture');
  const cells = [...combined.children].filter((el) => el.tagName === 'DIV');
  if (!picture || cells.length === 0) return;

  const media = document.createElement('div');
  media.className = 'hero-banner-media';
  const inner = document.createElement('div');
  picture.remove();
  inner.append(picture);
  media.append(inner);
  cells.forEach((cell) => {
    cell.querySelectorAll('p:empty').forEach((p) => p.remove());
  });
  const content = document.createElement('div');
  content.className = 'hero-banner-content';
  cells.forEach((cell) => {
    content.append(...cell.childNodes);
  });
  combined.replaceWith(media, content);
}

function removeGhostRows(block) {
  [...block.children].forEach((row) => {
    if (row.classList.contains('hero-banner-block-name')) return;
    if (picIn(row)) return;
    if (row.querySelector('h1, h2, h3, p, a[href]')) return;
    if (!row.textContent.replace(/\u00a0/g, ' ').trim()) row.remove();
  });
}

/** When several rows have no picture, pick the real copy row (not the block label). */
function pickContentRow(candidates) {
  if (!candidates.length) return undefined;
  if (candidates.length === 1) return candidates[0];
  const headed = candidates.filter((r) => r.querySelector('h1, h2, h3'));
  if (headed.length === 1) return headed[0];
  if (headed.length > 1) return headed.at(-1);
  return candidates.reduce((best, r) => (
    r.textContent.trim().length > best.textContent.trim().length ? r : best
  ));
}

function tagMediaAndContent(block) {
  const body = dataRows(block);
  const mediaRow = body.find((r) => picIn(r));
  const contentRow = pickContentRow(body.filter((r) => r !== mediaRow && !picIn(r)));
  if (mediaRow) mediaRow.classList.add('hero-banner-media');
  if (contentRow) contentRow.classList.add('hero-banner-content');
}

/**
 * @param {Element} block
 */
export default function decorate(block) {
  let rows = [...block.children];

  if (rows.length === 3 && picIn(rows[0]) && !picIn(rows[2])) {
    rows[2].classList.add('hero-banner-announcement');
    block.after(rows[2]);
    rows = [...block.children];
  }
  if (rows.length === 4 && picIn(rows[1]) && !picIn(rows[3])) {
    rows[3].classList.add('hero-banner-announcement');
    block.after(rows[3]);
    rows = [...block.children];
  }

  rows.forEach((row) => {
    if (isTitleRow(row)) row.classList.add('hero-banner-block-name');
  });

  const combined = dataRows(block).find((r) => picIn(r) && hasCopyBesideImage(r));
  if (combined) splitCombinedRow(combined);
  removeGhostRows(block);
  tagMediaAndContent(block);

  if (!block.querySelector('.hero-banner-media picture')) {
    block.classList.add('no-image');
  }
}
