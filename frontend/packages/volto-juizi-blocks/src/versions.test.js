/**
 * One release, one version: the frontend add-on, the backend package and the
 * repository's version.txt must agree. npm writes a pre-release as
 * `1.0.0-alpha.0`, Python as `1.0.0a0`. Bump all four together (see the
 * README, "Versions"). Skipped outside this repository (e.g. a site's copy
 * of the add-on).
 */
import fs from 'fs';
import path from 'path';

const repo = path.resolve(__dirname, '../../../..');
const read = (file) => {
  try {
    return fs.readFileSync(path.join(repo, file), 'utf8');
  } catch (e) {
    return null;
  }
};

/** npm's pre-release form in Python's (PEP 440) spelling. */
export const toPython = (version) =>
  version
    .replace(/-alpha\.(\d+)$/, 'a$1')
    .replace(/-beta\.(\d+)$/, 'b$1')
    .replace(/-rc\.(\d+)$/, 'rc$1');

const versionTxt = read('version.txt');
const backendInit = read('backend/src/juizi/blocks/__init__.py');
const inRepo = versionTxt !== null && backendInit !== null;

(inRepo ? describe : describe.skip)('release versions', () => {
  const release = (versionTxt || '').trim();
  const backend = /__version__ = "([^"]+)"/.exec(backendInit || '')?.[1];
  const addon = JSON.parse(
    read('frontend/packages/volto-juizi-blocks/package.json'),
  ).version;
  const workspace = JSON.parse(read('frontend/package.json')).version;

  it('converts npm pre-releases to Python spelling', () => {
    expect(toPython('1.0.0-alpha.0')).toBe('1.0.0a0');
    expect(toPython('2.1.0-rc.3')).toBe('2.1.0rc3');
    expect(toPython('1.2.0')).toBe('1.2.0');
  });

  it('has the same version everywhere', () => {
    expect({
      'backend/src/juizi/blocks/__init__.py': backend,
      'volto-juizi-blocks/package.json': toPython(addon),
      'frontend/package.json': toPython(workspace),
    }).toEqual({
      'backend/src/juizi/blocks/__init__.py': release,
      'volto-juizi-blocks/package.json': release,
      'frontend/package.json': release,
    });
  });
});
