import { canDimText } from './colors';
import { setRuntimeSettings } from '../settings/runtime';

describe('canDimText', () => {
  beforeAll(() => {
    setRuntimeSettings({
      color_config: {
        colors: [
          { name: 'green', label: 'Green', value: '#0a7d3c', dark: true },
          { name: 'navy', label: 'Navy', value: '#14213d', dark: true },
          { name: 'sand', label: 'Sand', value: '#f4efe6', dark: false },
        ],
        themes: [],
        blocks: {},
      },
    });
  });

  it('keeps dimming where it still reads', () => {
    expect(canDimText('var(--navy)', 0.75)).toBe(true);
    expect(canDimText('var(--sand)', 0.7)).toBe(true);
  });

  it('refuses dimming on mid-tone colours', () => {
    // White at 75% on this green is 3.67:1 (the audit's finding).
    expect(canDimText('var(--green)', 0.75)).toBe(false);
  });

  it('judges plain hex colours too, and lets unknown ones be', () => {
    expect(canDimText('#0a7d3c', 0.75)).toBe(false);
    expect(canDimText('var(--nope)', 0.75)).toBe(true);
    expect(canDimText('transparent', 0.75)).toBe(true);
  });
});
