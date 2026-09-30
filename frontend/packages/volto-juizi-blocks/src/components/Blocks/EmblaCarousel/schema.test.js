// The sidebar for each display style, with the Reviews style's own fields.
import emblaCarouselSchema from './schema';

const fieldset = (schema, id) =>
  schema.fieldsets.find((entry) => entry.id === id)?.fields;

describe('Carousel schema', () => {
  it('shows only the display style until one is chosen', () => {
    const schema = emblaCarouselSchema({ formData: {} });
    expect(schema.fieldsets.map((entry) => entry.id)).toEqual(['default']);
    expect(fieldset(schema, 'default')).toEqual(['displayMode']);
  });

  it('offers Reviews in the same place as the start screen lists it', () => {
    const schema = emblaCarouselSchema({ formData: {} });
    expect(schema.properties.displayMode.choices).toEqual([
      ['full', 'Image with text overlay'],
      ['image-only', 'Image only'],
      ['image-top', 'Image above content'],
      ['reviews', 'Reviews'],
      ['logo-marquee', 'Scrolling logo strip'],
    ]);
  });

  it('keeps the slide fields for the other styles', () => {
    const schema = emblaCarouselSchema({
      formData: { displayMode: 'image-top' },
    });
    expect(fieldset(schema, 'default')).toEqual([
      'displayMode',
      'title',
      'description',
      'useListing',
      'slides',
    ]);
    expect(schema.properties.slides.title).toBe('Slides');
    expect(schema.properties.slides.schema.fieldsets[0].fields).toEqual([
      'heading',
      'content',
      'image',
      'link',
      'buttonText',
      'buttonArrow',
    ]);
    expect(schema.properties.slides.schema.properties.heading.title).toBe(
      'Heading',
    );
    expect(fieldset(schema, 'card')).toEqual([
      'slideButtonStyle',
      'slideButtonLinkStyle',
      'dateDisplay',
      'hideDescription',
      'hideButtons',
      'hideCardImage',
      'imageAspectRatio',
      'clickableSlides',
      'equalHeight',
    ]);
  });

  describe('Reviews style', () => {
    const schema = emblaCarouselSchema({
      formData: { displayMode: 'reviews' },
    });
    const review = schema.properties.slides.schema;

    it('lists reviews, with the fields a review needs', () => {
      expect(schema.properties.slides.title).toBe('Reviews');
      expect(review.title).toBe('Review');
      expect(review.fieldsets[0].fields).toEqual([
        'content',
        'rating',
        'heading',
        'organisation',
        'image',
        'link',
      ]);
      expect(review.properties.content.title).toBe('Review text');
      expect(review.properties.heading.title).toBe('Name');
      expect(review.properties.organisation.title).toBe('Organisation or role');
      expect(review.properties.image.title).toBe('Picture');
    });

    it('offers the rating as named choices, stored as strings', () => {
      expect(review.properties.rating.choices).toEqual([
        ['0', 'No stars'],
        ['1', '1 star'],
        ['2', '2 stars'],
        ['3', '3 stars'],
        ['4', '4 stars'],
        ['5', '5 stars'],
      ]);
      // No default: a new review has no stars until the editor chooses.
      expect(review.properties.rating.default).toBeUndefined();
      // "No stars" is the only empty choice (no extra "No value").
      expect(review.properties.rating.noValueOption).toBe(false);
    });

    it('has no automatic fill, filter buttons or slide buttons', () => {
      expect(fieldset(schema, 'default')).toEqual([
        'displayMode',
        'title',
        'description',
        'slides',
      ]);
      expect(fieldset(schema, 'card')).toEqual([
        'clickableSlides',
        'equalHeight',
      ]);
    });

    it('shows the review list even when the carousel was filled automatically before', () => {
      const switched = emblaCarouselSchema({
        formData: {
          displayMode: 'reviews',
          useListing: true,
          filterTags: 'News',
          query: { query: [] },
        },
      });
      expect(fieldset(switched, 'default')).toEqual([
        'displayMode',
        'title',
        'description',
        'slides',
      ]);
    });

    it('keeps the scrolling, navigation and background options', () => {
      expect(schema.fieldsets.map((entry) => entry.id)).toEqual([
        'default',
        'card',
        'behaviour',
        'navigation',
        'appearance',
        'background',
        'advanced',
      ]);
      expect(schema.properties.slideBackgroundColor.title).toBe(
        'Review background colour',
      );
    });

    it('calls them reviews, not cards or slides', () => {
      const card = schema.fieldsets.find((entry) => entry.id === 'card');
      expect(card.title).toBe('Review layout');
      expect(schema.properties.clickableSlides.title).toBe(
        'Make entire review clickable',
      );
      expect(schema.properties.equalHeight.title).toBe('Equal height reviews');
      expect(schema.properties.slidesToShow.title).toBe(
        'Reviews visible at once',
      );
      expect(schema.properties.minSlidesOnMobile.title).toBe(
        'Reviews visible on mobile',
      );
    });
  });
});
