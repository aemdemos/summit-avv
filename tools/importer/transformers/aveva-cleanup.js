/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: AVEVA cleanup. Selectors from captured DOM of www.aveva.com.
 * Removes non-authorable content: header, footer, accessibility widgets,
 * cookie consent, image modals, and other site chrome.
 */
const H = { before: 'beforeTransform', after: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === H.before) {
    // UserWay accessibility widget and skip links (from captured DOM: .uw-sl, .uwy.userway_p5, .uwif)
    WebImporter.DOMUtils.remove(element, [
      '.uw-sl',
      '.uwy.userway_p5',
      '.uwif',
      '.uwaw-dictionary-tooltip',
      '.uw-s10-bottom-ruler-guide',
      '.uw-s10-right-ruler-guide',
      '.uw-s10-left-ruler-guide',
      '.uw-s10-reading-guide',
      '.uw-s12-tooltip',
    ]);

    // Cookie consent bar (from captured DOM: #consent_blackbar)
    WebImporter.DOMUtils.remove(element, ['#consent_blackbar']);

    // Image popup modals that may interfere with parsing (from captured DOM: .modal.fade.image-popup-modal)
    WebImporter.DOMUtils.remove(element, ['.modal.fade.image-popup-modal']);

    // Empty interactive-content divs (from captured DOM: .interactive-content)
    WebImporter.DOMUtils.remove(element, ['.interactive-content']);
  }

  if (hookName === H.after) {
    // Global header (from captured DOM: .cmp-experiencefragment--header-3, header.global-header-container)
    WebImporter.DOMUtils.remove(element, [
      '.cmp-experiencefragment--header-3',
      'header.global-header-container',
    ]);

    // Global footer (from captured DOM: .cmp-experiencefragment--footer, footer.global-footer)
    WebImporter.DOMUtils.remove(element, [
      '.cmp-experiencefragment--footer',
      'footer.global-footer',
    ]);

    // Skip to main content link (from captured DOM: a.skip)
    WebImporter.DOMUtils.remove(element, ['a.skip']);

    // Remove leftover announcement container (text already extracted by hero-banner parser)
    WebImporter.DOMUtils.remove(element, ['.announcement']);

    // Safe element removal
    WebImporter.DOMUtils.remove(element, ['iframe', 'link', 'noscript']);

  }
}
