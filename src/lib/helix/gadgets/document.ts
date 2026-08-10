/**
 * The gadget sandbox document.
 *
 * A gadget is code Helix wrote. It runs, but it runs with nothing: the host
 * renders it into an iframe carrying `sandbox="allow-scripts"` and no
 * `allow-same-origin`, which puts it on an opaque origin — no access to the
 * parent document, no cookies, no storage, no credentials of any kind. On top
 * of that the document carries its own Content-Security-Policy meta with
 * `connect-src 'none'`, so `fetch`, `XMLHttpRequest`, `WebSocket` and
 * `EventSource` are all refused by the browser.
 *
 * Those two layers are deliberately redundant. The sandbox attribute is the
 * host's guarantee and the CSP is the document's; a mistake in either one
 * still leaves the gadget unable to reach the network or the session.
 *
 * The only way out is `postMessage` to the parent, which is what the injected
 * `helix` bridge uses. Everything a gadget can see or store passes through
 * that one channel, and the parent decides what to answer.
 */

/** A gadget's source: a flat map of filename → contents. */
export type GadgetSource = Record<string, string>;

/**
 * The policy the document applies to itself. `connect-src 'none'` is the
 * load-bearing line — without a network, generated code cannot exfiltrate what
 * it reads however it was written.
 */
const CSP = [
  "default-src 'none'",
  // Inline only: there is no origin to load from, and no external host is
  // reachable in any case.
  "script-src 'unsafe-inline'",
  "style-src 'unsafe-inline'",
  "img-src data: blob:",
  "font-src data:",
  "connect-src 'none'",
  "form-action 'none'",
  "base-uri 'none'",
].join('; ');

/**
 * The bridge. Injected ahead of gadget code so `helix` exists before anything
 * runs. Requests are correlated by id because postMessage has no reply channel
 * of its own.
 */
const BRIDGE = `
(function () {
  var pending = {};
  var nextId = 1;

  function send(kind, payload) {
    return new Promise(function (resolve, reject) {
      var id = nextId++;
      pending[id] = { resolve: resolve, reject: reject };
      parent.postMessage({ source: 'helix-gadget', id: id, kind: kind, payload: payload }, '*');
    });
  }

  window.addEventListener('message', function (event) {
    var data = event.data;
    if (!data || data.source !== 'helix-host') return;
    var entry = pending[data.id];
    if (!entry) return;
    delete pending[data.id];
    if (data.error) entry.reject(new Error(data.error));
    else entry.resolve(data.result);
  });

  window.helix = {
    /** This gadget's own stored state. Persisted server-side, per gadget. */
    getState: function () { return send('getState'); },
    setState: function (next) { return send('setState', next); },
    /**
     * Read through a gatekeeper, scoped to the client this gadget belongs to.
     * Reads only — a gadget cannot change anything.
     */
    read: function (op, input) { return send('read', { op: op, input: input }); },
    /** Ask the host to resize the frame to fit the content. */
    resize: function (height) { return send('resize', height); },
  };

  // Report the document's own height once it settles, so the host frame does
  // not need a scrollbar of its own.
  window.addEventListener('load', function () {
    var report = function () {
      window.helix.resize(document.documentElement.scrollHeight);
    };
    report();
    if (window.ResizeObserver) {
      new ResizeObserver(report).observe(document.documentElement);
    }
  });

  window.addEventListener('error', function (event) {
    parent.postMessage({
      source: 'helix-gadget',
      kind: 'error',
      payload: String(event.message || 'Something went wrong in this gadget.')
    }, '*');
  });
})();
`;

/**
 * Compose the document handed to `srcdoc`.
 *
 * `index.html` is the body. `style.css` and `app.js`, when present, are inlined
 * around it — a gadget has no origin to load sibling files from, so everything
 * it needs has to be in the one document.
 */
export function buildGadgetDocument(source: GadgetSource): string {
  const body = source['index.html'] ?? '<p>This gadget has no index.html.</p>';
  const css = source['style.css'] ?? '';
  const js = source['app.js'] ?? '';

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="${CSP}">
<style>
:root { color-scheme: light dark; }
* { box-sizing: border-box; }
body {
  margin: 0;
  padding: 16px;
  font: 14px/1.5 ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  color: #171717;
  background: transparent;
}
@media (prefers-color-scheme: dark) { body { color: #ededed; } }
${css}
</style>
</head>
<body>
${body}
<script>${BRIDGE}</script>
${js ? `<script>${js}</script>` : ''}
</body>
</html>`;
}

/** The sandbox flags the host must apply. Never add `allow-same-origin`. */
export const GADGET_SANDBOX = 'allow-scripts';

/**
 * Reject source that cannot be rendered before it is stored, so a broken
 * gadget fails at the point someone can still do something about it.
 */
export function validateGadgetSource(source: unknown): string | null {
  if (typeof source !== 'object' || source === null || Array.isArray(source)) {
    return 'Gadget source must be a map of filename to contents.';
  }
  const entries = Object.entries(source as Record<string, unknown>);
  if (entries.length === 0) return 'A gadget needs at least an index.html.';
  for (const [name, contents] of entries) {
    if (typeof contents !== 'string') {
      return `"${name}" must be a string.`;
    }
    if (contents.length > 200_000) {
      return `"${name}" is too large — keep each file under 200KB.`;
    }
  }
  if (!('index.html' in (source as object))) {
    return 'A gadget needs an index.html.';
  }
  return null;
}
