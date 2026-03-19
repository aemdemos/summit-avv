export default function decorate(block) {
  const rows = [...block.children];

  // If first row contains only an image (picture or img), treat it as the background image row
  const firstRow = rows[0];
  const hasImage = firstRow.querySelector('picture, img');
  if (hasImage && firstRow.querySelectorAll('h1, h2, h3, p > a').length === 0) {
    firstRow.classList.add('promo-banner-bg');
  }
}
