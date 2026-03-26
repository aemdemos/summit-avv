export default function decorate(block) {
  const rows = [...block.children];

  if (!block.querySelector(':scope > div:first-child picture')) {
    block.classList.add('no-image');
  }

  // If 3 rows: image, content, announcement — move announcement after the block
  if (rows.length === 3) {
    rows[2].classList.add('hero-banner-announcement');
    block.after(rows[2]);
  }
}
