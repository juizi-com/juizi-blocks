import { isSectionHeading } from './tocHeadings';

const page = (html) => {
  document.body.innerHTML = html;
  return (text) =>
    Array.from(document.querySelectorAll('h2, h3')).find(
      (h) => h.textContent.trim() === text,
    );
};

describe('Hero TOC: which headings count', () => {
  it('counts typed headings (VLT renders text blocks without a wrapper)', () => {
    const h = page(
      `<h2>About</h2><div class="block slate"><h3>Goals</h3></div>`,
    );
    expect(isSectionHeading(h('About'))).toBe(true);
    expect(isSectionHeading(h('Goals'))).toBe(true);
  });

  it('counts a carousel title but not its slides (the IRR news carousel)', () => {
    const h = page(`
      <div class="block emblaCarousel">
        <h2 class="embla__title">Latest news</h2>
        <div class="embla__container">
          <div class="embla__slide"><h3>Budget vote</h3></div>
          <div class="embla__slide"><h3>New report</h3></div>
        </div>
      </div>`);
    expect(isSectionHeading(h('Latest news'))).toBe(true);
    expect(isSectionHeading(h('Budget vote'))).toBe(false);
    expect(isSectionHeading(h('New report'))).toBe(false);
  });

  it('skips the first slide when the carousel has no title', () => {
    const h = page(`
      <div class="block emblaCarousel"><div class="embla__container">
        <div class="embla__slide"><h3>Budget vote</h3></div>
        <div class="embla__slide"><h3>New report</h3></div>
      </div></div>`);
    expect(isSectionHeading(h('Budget vote'))).toBe(false);
  });

  it('counts only the headline of listing, search and teaser blocks', () => {
    const h = page(`
      <div class="block listing"><h2 class="headline">News</h2>
        <div class="listing-item"><h2>One story</h2></div></div>
      <div class="block teaser"><h2>A teased page</h2></div>`);
    expect(isSectionHeading(h('News'))).toBe(true);
    expect(isSectionHeading(h('One story'))).toBe(false);
    expect(isSectionHeading(h('A teased page'))).toBe(false);
  });

  it('skips cards, list entries and later headings inside a block', () => {
    const h = page(`
      <div class="block contentRow"><h2 class="content-row__heading">Services</h2>
        <div class="content-row-item"><h3>Research</h3></div>
        <div class="content-row-item"><h3>Training</h3></div></div>
      <div class="block juiziMap"><h3>All places</h3><ul><li><h3>Kuruman</h3></li></ul></div>
      <div class="block callout"><h2>Note</h2><h3>Inside the note</h3></div>`);
    expect(isSectionHeading(h('Services'))).toBe(true);
    expect(isSectionHeading(h('Research'))).toBe(false);
    expect(isSectionHeading(h('Kuruman'))).toBe(false);
    expect(isSectionHeading(h('Note'))).toBe(true);
    expect(isSectionHeading(h('Inside the note'))).toBe(false);
  });

  it('skips hidden and opted-out headings', () => {
    const h = page(`
      <div class="block slate"><div aria-hidden="true"><h2>Collapsed</h2></div></div>
      <div class="block juiziMap"><h3 data-no-toc>All places</h3></div>`);
    expect(isSectionHeading(h('Collapsed'))).toBe(false);
    expect(isSectionHeading(h('All places'))).toBe(false);
  });

  it('counts text headings nested in a grid column', () => {
    const h = page(`
      <div class="block gridBlock"><div class="column"><div class="block slate"><h2>Left</h2></div></div>
      <div class="column"><div class="block slate"><h2>Right</h2></div></div></div>`);
    expect(isSectionHeading(h('Left'))).toBe(true);
    expect(isSectionHeading(h('Right'))).toBe(true);
  });
});
