/**
 * The gadget sandbox.
 *
 * These are the tests that matter most in the repository. A gadget is code the
 * agent generated; the sandbox attribute and the CSP are the only two things
 * standing between it and the session. Both are one careless edit away from
 * being weakened in a way nothing else would surface — so they are asserted
 * literally, including the flag that must never appear.
 */

import { describe, expect, it } from 'vitest';
import {
  buildGadgetDocument,
  GADGET_SANDBOX,
  validateGadgetSource,
} from './document';

describe('sandbox flags', () => {
  it('allows scripts and nothing else', () => {
    expect(GADGET_SANDBOX).toBe('allow-scripts');
  });

  it('never grants same-origin', () => {
    // With allow-same-origin the gadget shares this document's origin and can
    // reach cookies, storage and the parent DOM. There is no version of this
    // product where that is acceptable.
    expect(GADGET_SANDBOX).not.toContain('allow-same-origin');
  });
});

describe('content security policy', () => {
  const doc = buildGadgetDocument({ 'index.html': '<p>hi</p>' });

  it('emits a CSP meta tag', () => {
    expect(doc).toContain('http-equiv="Content-Security-Policy"');
  });

  it("denies all network egress with connect-src 'none'", () => {
    // Without a network, generated code cannot exfiltrate what it reads
    // however it was written. This is the load-bearing directive.
    expect(doc).toContain("connect-src 'none'");
  });

  it("defaults to 'none' rather than allowing anything unlisted", () => {
    expect(doc).toContain("default-src 'none'");
  });

  it('blocks form submission and base-tag rewriting', () => {
    expect(doc).toContain("form-action 'none'");
    expect(doc).toContain("base-uri 'none'");
  });

  it('permits no remote image or font origins', () => {
    expect(doc).toContain('img-src data: blob:');
    expect(doc).toContain('font-src data:');
    expect(doc).not.toMatch(/img-src[^;]*https?:/);
  });
});

describe('bridge injection', () => {
  const doc = buildGadgetDocument({ 'index.html': '<p>hi</p>' });

  it('exposes exactly the intended surface', () => {
    for (const method of ['context', 'getState', 'setState', 'read', 'resize']) {
      expect(doc).toContain(`${method}:`);
    }
  });

  it('offers no write method', () => {
    // A gadget that could queue actions would flood the approval queue faster
    // than a person reads it.
    expect(doc).not.toMatch(/\bwrite:\s*function/);
  });

  it('injects the bridge before gadget script', () => {
    const withApp = buildGadgetDocument({
      'index.html': '<p>hi</p>',
      'app.js': 'window.__ran = true;',
    });
    expect(withApp.indexOf('window.helix')).toBeLessThan(
      withApp.indexOf('window.__ran')
    );
  });
});

describe('document composition', () => {
  it('inlines css and js, since a gadget has no origin to load them from', () => {
    const doc = buildGadgetDocument({
      'index.html': '<p id="x">hi</p>',
      'style.css': '#x { color: red; }',
      'app.js': 'console.log(1);',
    });
    expect(doc).toContain('#x { color: red; }');
    expect(doc).toContain('console.log(1);');
    expect(doc).toContain('<p id="x">hi</p>');
  });

  it('renders something legible when index.html is missing', () => {
    expect(buildGadgetDocument({})).toContain('no index.html');
  });

  it('omits the script tag entirely when there is no app.js', () => {
    const doc = buildGadgetDocument({ 'index.html': '<p>hi</p>' });
    // One script tag: the bridge.
    expect(doc.match(/<script>/g)?.length).toBe(1);
  });
});

describe('validateGadgetSource', () => {
  it('accepts a minimal gadget', () => {
    expect(validateGadgetSource({ 'index.html': '<p>hi</p>' })).toBeNull();
  });

  it('requires an index.html', () => {
    expect(validateGadgetSource({ 'app.js': 'x' })).toMatch(/index\.html/);
  });

  it('rejects an empty source map', () => {
    expect(validateGadgetSource({})).toMatch(/index\.html/);
  });

  it('rejects non-object source', () => {
    expect(validateGadgetSource(null)).toMatch(/map of filename/);
    expect(validateGadgetSource([])).toMatch(/map of filename/);
    expect(validateGadgetSource('<p>hi</p>')).toMatch(/map of filename/);
  });

  it('rejects a non-string file', () => {
    expect(
      validateGadgetSource({ 'index.html': '<p>hi</p>', 'app.js': 42 })
    ).toMatch(/app\.js/);
  });

  it('rejects a file over the size ceiling', () => {
    expect(
      validateGadgetSource({ 'index.html': 'x'.repeat(200_001) })
    ).toMatch(/too large/);
  });
});
