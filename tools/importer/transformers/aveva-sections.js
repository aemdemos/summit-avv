/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: AVEVA sections. Adds section breaks (<hr>) and section-metadata
 * blocks based on template sections from page-templates.json.
 * Runs in afterTransform only. Selectors from captured DOM of www.aveva.com.
 */
const H = { after: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === H.after) {
    const { document } = element.ownerDocument ? { document: element.ownerDocument } : { document: element.getRootNode() };
    const sections = payload && payload.template && payload.template.sections;
    if (!sections || sections.length < 2) return;

    // Process sections in reverse order to avoid position shifts
    const reversedSections = [...sections].reverse();

    for (const section of reversedSections) {
      // Find the first element matching the section selector
      const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];
      let sectionEl = null;
      for (const sel of selectors) {
        try {
          sectionEl = element.querySelector(sel);
        } catch (e) {
          // Selector may be invalid, skip
        }
        if (sectionEl) break;
      }

      if (!sectionEl) continue;

      // Add section-metadata block if section has a style
      if (section.style) {
        const metaBlock = WebImporter.Blocks.createBlock(document, {
          name: 'Section Metadata',
          cells: { style: section.style },
        });
        sectionEl.after(metaBlock);
      }

      // Add <hr> before section (except first section)
      if (section.id !== 'section-1') {
        const hr = document.createElement('hr');
        sectionEl.before(hr);
      }
    }
  }
}
