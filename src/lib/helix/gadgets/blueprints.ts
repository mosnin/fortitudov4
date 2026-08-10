/**
 * Built-in blueprints.
 *
 * A blueprint is a gadget's source without its data: install one and you get
 * your own copy, which you (or Helix) are then free to change. That is the
 * whole departure from SaaS — nobody files a feature request against a
 * blueprint, they edit their instance.
 *
 * These three ship with the product because they are the shapes an agency
 * actually needs, and because they double as worked examples of the bridge:
 * one reads, one stores, one does both. Helix reads them when asked to build
 * something similar, so they are written the way a gadget should be written —
 * plain, no dependencies, no network.
 */

import type { GadgetSource } from './document';

export interface Blueprint {
  slug: string;
  name: string;
  summary: string;
  category: string;
  source: GadgetSource;
}

const SHARED_CSS = `
h1 { font: 600 15px/1.3 inherit; margin: 0 0 2px; }
p.sub { margin: 0 0 16px; font-size: 12px; opacity: .6; }
.row { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; padding: 8px 0; border-bottom: 1px solid rgba(128,128,128,.18); }
.row:last-child { border-bottom: 0; }
.label { font-size: 13px; }
.value { font-size: 13px; font-variant-numeric: tabular-nums; opacity: .75; }
.done { opacity: .45; text-decoration: line-through; }
.bar { height: 4px; border-radius: 2px; background: rgba(128,128,128,.2); overflow: hidden; margin: 4px 0 14px; }
.bar > span { display: block; height: 100%; background: currentColor; opacity: .75; }
.empty { font-size: 13px; opacity: .6; }
.err { font-size: 12px; color: #b4341f; }
`;

/**
 * Reads the client's delivery checklist. The clearest demonstration of
 * `helix.read` — the same gatekeeper op the agent calls, through the same
 * introduction checks.
 */
const DELIVERY_TRACKER: Blueprint = {
  slug: 'delivery-tracker',
  name: 'Delivery tracker',
  summary:
    "A client's build checklist with a progress bar — what is done, what is next.",
  category: 'delivery',
  source: {
    'index.html': [
      '<h1 id="title">Delivery</h1>',
      '<p class="sub" id="sub">Loading…</p>',
      '<div class="bar"><span id="fill" style="width:0%"></span></div>',
      '<div id="rows"></div>',
    ].join('\n'),
    'style.css': SHARED_CSS,
    'app.js': [
      "(async function () {",
      "  var rows = document.getElementById('rows');",
      "  var sub = document.getElementById('sub');",
      "  try {",
      "    var ctx = await helix.context();",
      "    document.getElementById('title').textContent =",
      "      (ctx.clientName || 'Client') + ' — delivery';",
      "    var tasks = await helix.read('listClientTasks', { clientId: ctx.clientId });",
      "    if (!tasks || tasks.length === 0) {",
      "      sub.textContent = '';",
      "      rows.innerHTML = '<p class=\"empty\">No checklist yet.</p>';",
      "      return;",
      "    }",
      "    var done = tasks.filter(function (t) { return t.status === 'completed'; }).length;",
      "    sub.textContent = done + ' of ' + tasks.length + ' complete';",
      "    document.getElementById('fill').style.width =",
      "      Math.round((done / tasks.length) * 100) + '%';",
      "    rows.innerHTML = '';",
      "    tasks.forEach(function (task) {",
      "      var row = document.createElement('div');",
      "      row.className = 'row';",
      "      var label = document.createElement('span');",
      "      label.className = 'label' + (task.status === 'completed' ? ' done' : '');",
      "      label.textContent = task.title;",
      "      var value = document.createElement('span');",
      "      value.className = 'value';",
      "      value.textContent = task.status.replace('_', ' ');",
      "      row.appendChild(label);",
      "      row.appendChild(value);",
      "      rows.appendChild(row);",
      "    });",
      "  } catch (error) {",
      "    sub.textContent = '';",
      "    rows.innerHTML = '<p class=\"err\"></p>';",
      "    rows.firstChild.textContent = error.message;",
      "  }",
      "})();",
    ].join('\n'),
  },
};

/**
 * Pure state — no reads at all. The simplest thing that is still genuinely
 * useful, and the example to copy when a gadget only needs to remember.
 */
const SCRATCHPAD: Blueprint = {
  slug: 'scratchpad',
  name: 'Scratchpad',
  summary: 'A shared notes pad that saves as you type. No data leaves it.',
  category: 'general',
  source: {
    'index.html': [
      '<h1>Notes</h1>',
      '<p class="sub" id="status">Loading…</p>',
      '<textarea id="pad" rows="10" placeholder="Type here…"></textarea>',
    ].join('\n'),
    'style.css': [
      SHARED_CSS,
      'textarea { width: 100%; padding: 10px; font: inherit; line-height: 1.55;',
      '  border: 1px solid rgba(128,128,128,.28); border-radius: 8px;',
      '  background: transparent; color: inherit; resize: vertical; }',
      'textarea:focus { outline: 2px solid rgba(128,128,128,.35); outline-offset: 1px; }',
    ].join('\n'),
    'app.js': [
      "(async function () {",
      "  var pad = document.getElementById('pad');",
      "  var status = document.getElementById('status');",
      "  var timer = null;",
      "  try {",
      "    var state = await helix.getState();",
      "    pad.value = (state && state.text) || '';",
      "    status.textContent = 'Saved';",
      "  } catch (error) {",
      "    status.textContent = 'Could not load: ' + error.message;",
      "  }",
      "  pad.addEventListener('input', function () {",
      "    status.textContent = 'Saving…';",
      "    if (timer) clearTimeout(timer);",
      // Debounced: a keystroke-per-write would be a request per character.
      "    timer = setTimeout(async function () {",
      "      try {",
      "        await helix.setState({ text: pad.value });",
      "        status.textContent = 'Saved';",
      "      } catch (error) {",
      "        status.textContent = 'Not saved: ' + error.message;",
      "      }",
      "    }, 600);",
      "  });",
      "})();",
    ].join('\n'),
  },
};

/**
 * Reads and computes. Marketing-only by nature — the underlying op refuses on
 * any other engagement, so the gadget shows that refusal rather than an empty
 * state that would read as "no results".
 */
const PERFORMANCE_CARD: Blueprint = {
  slug: 'performance-card',
  name: 'Performance card',
  summary:
    'Weekly leads, cost per lead and true ROAS. Digital-marketing clients only.',
  category: 'marketing',
  source: {
    'index.html': [
      '<h1 id="title">Performance</h1>',
      '<p class="sub" id="sub">Loading…</p>',
      '<div id="rows"></div>',
    ].join('\n'),
    'style.css': SHARED_CSS,
    'app.js': [
      "(async function () {",
      "  var rows = document.getElementById('rows');",
      "  var sub = document.getElementById('sub');",
      "  function money(cents) {",
      "    return '$' + (cents / 100).toLocaleString('en-US', { maximumFractionDigits: 0 });",
      "  }",
      "  try {",
      "    var ctx = await helix.context();",
      "    document.getElementById('title').textContent =",
      "      (ctx.clientName || 'Client') + ' — performance';",
      "    var reports = await helix.read('listWeeklyReports', { clientId: ctx.clientId });",
      "    if (!reports || reports.length === 0) {",
      "      sub.textContent = '';",
      "      rows.innerHTML = '<p class=\"empty\">No weeks reported yet.</p>';",
      "      return;",
      "    }",
      "    sub.textContent = reports.length + ' week' + (reports.length === 1 ? '' : 's') + ' reported';",
      "    rows.innerHTML = '';",
      "    reports.slice(0, 12).forEach(function (report) {",
      "      var row = document.createElement('div');",
      "      row.className = 'row';",
      "      var label = document.createElement('span');",
      "      label.className = 'label';",
      "      label.textContent = new Date(report.weekStart).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });",
      "      var value = document.createElement('span');",
      "      value.className = 'value';",
      "      var parts = [report.leads + ' leads', money(report.cpl) + ' CPL'];",
      // ROAS only once the client has filled in their side — showing it before
      // then would be a made-up number.
      "      if (report.revenue != null && report.totalSpend > 0) {",
      "        parts.push((report.revenue / report.totalSpend).toFixed(1) + 'x ROAS');",
      "      }",
      "      value.textContent = parts.join(' · ');",
      "      row.appendChild(label);",
      "      row.appendChild(value);",
      "      rows.appendChild(row);",
      "    });",
      "  } catch (error) {",
      "    sub.textContent = '';",
      "    rows.innerHTML = '<p class=\"err\"></p>';",
      "    rows.firstChild.textContent = error.message;",
      "  }",
      "})();",
    ].join('\n'),
  },
};

export const BUILT_IN_BLUEPRINTS: Blueprint[] = [
  DELIVERY_TRACKER,
  PERFORMANCE_CARD,
  SCRATCHPAD,
];

export function findBuiltIn(slug: string): Blueprint | null {
  return BUILT_IN_BLUEPRINTS.find((bp) => bp.slug === slug) ?? null;
}
