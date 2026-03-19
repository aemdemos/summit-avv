/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroBannerParser from './parsers/hero-banner.js';
import promoBannerParser from './parsers/promo-banner.js';
import columnsHighlightParser from './parsers/columns-highlight.js';
import cardsFeatureParser from './parsers/cards-feature.js';

// TRANSFORMER IMPORTS
import avevaCleanupTransformer from './transformers/aveva-cleanup.js';
import avevaSectionsTransformer from './transformers/aveva-sections.js';

// PARSER REGISTRY - Map parser names to functions
const parsers = {
  'hero-banner': heroBannerParser,
  'promo-banner': promoBannerParser,
  'columns-highlight': columnsHighlightParser,
  'cards-feature': cardsFeatureParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'homepage',
  description: 'AVEVA corporate homepage with hero, product highlights, and call-to-action sections',
  urls: [
    'https://www.aveva.com/',
  ],
  blocks: [
    {
      name: 'hero-banner',
      instances: [
        'section.hero-banner.u-hero-height-large',
      ],
    },
    {
      name: 'promo-banner',
      instances: [
        'section.hero-banner.u-hero-height-small',
      ],
    },
    {
      name: 'columns-highlight',
      instances: [
        '#getAgileSection .column-control .row.coltype-2',
        'section.background-container .column-control .row.coltype-2',
      ],
    },
    {
      name: 'cards-feature',
      instances: [
        '.row.coltype-21:has(.card-v3)',
        '.row.coltype-3:has(.card-v2-t1)',
      ],
    },
  ],
  sections: [
    { id: 'section-1', name: 'Hero', selector: 'section.hero-banner.u-hero-height-large', style: null, blocks: ['hero-banner'], defaultContent: [] },
    { id: 'section-3', name: 'Get Agile', selector: '#getAgileSection', style: null, blocks: ['columns-highlight'], defaultContent: [] },
    { id: 'section-4', name: 'Expand Collaboration', selector: ['section.background-container:has(.cmp-text h2:first-child)', '#getAgileSection ~ .background-container .column-control'], style: 'light-gray', blocks: ['columns-highlight'], defaultContent: [] },
    { id: 'section-5', name: 'Gartner Recognition', selector: 'section.hero-banner.u-hero-height-small:nth-of-type(1)', style: null, blocks: ['promo-banner'], defaultContent: [] },
    { id: 'section-6', name: 'Advance Sustainability', selector: 'section.background-container:has(h2:first-child)', style: null, blocks: ['columns-highlight'], defaultContent: [] },
    { id: 'section-7', name: 'CONNECT Effect Banner', selector: ".image.aem-GridColumn .cmp-image__link[href*='connect-effect']", style: 'full-bleed', blocks: [], defaultContent: [".cmp-image__link[href*='connect-effect']"] },
    { id: 'section-8', name: 'Customer Success', selector: 'section.background-container:has(.background-container__heading:first-child)', style: 'light-gray', blocks: ['cards-feature'], defaultContent: ['.background-container__heading'] },
    { id: 'section-9', name: 'Our Industrial Life', selector: 'section.hero-banner:has(h2)', style: null, blocks: ['promo-banner'], defaultContent: [] },
    { id: 'section-10', name: 'Industrial Ingenuity', selector: 'section.background-container:has(.card-v2-t1)', style: 'light-gray', blocks: ['cards-feature'], defaultContent: ['.background-container__heading'] },
    { id: 'section-11', name: 'Speak with Expert', selector: 'section.hero-banner:last-of-type', style: null, blocks: ['promo-banner'], defaultContent: [] },
  ],
};

// TRANSFORMER REGISTRY
const transformers = [
  avevaCleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [avevaSectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 * @param {string} hookName - 'beforeTransform' or 'afterTransform'
 * @param {Element} element - The DOM element to transform
 * @param {Object} payload - { document, url, html, params }
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };

  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 * @param {Document} document - The DOM document
 * @param {Object} template - The embedded PAGE_TEMPLATE object
 * @returns {Array} Array of block instances found on the page
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];

  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      try {
        const elements = document.querySelectorAll(selector);
        elements.forEach((element) => {
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
          });
        });
      } catch (e) {
        console.warn(`Invalid selector for block "${blockDef.name}": ${selector}`);
      }
    });
  });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

// EXPORT DEFAULT CONFIGURATION
export default {
  transform: (payload) => {
    const { document, url, html, params } = payload;
    const main = document.body;

    // 1. Execute beforeTransform transformers (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 1b. Convert CSS background-images to <img> elements BEFORE parsing
    // Hero banners on AVEVA use CSS background-image, not <img> elements
    WebImporter.rules.transformBackgroundImages(main, document);

    // 2. Find blocks on page using embedded template
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block using registered parsers
    pageBlocks.forEach((block) => {
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. Execute afterTransform transformers (final cleanup + section breaks/metadata)
    executeTransformers('afterTransform', main, payload);

    // 4b. Remove consecutive <hr> elements that create empty sections
    [...main.querySelectorAll('hr')].forEach((h) => {
      let next = h.nextElementSibling;
      while (next && next.tagName === 'HR') {
        const toRemove = next;
        next = next.nextElementSibling;
        toRemove.remove();
      }
    });

    // 5. Apply WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path
    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, '') || '/index',
    );

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
