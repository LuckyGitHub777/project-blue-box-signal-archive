import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');
const js = readFileSync(new URL('../app.js', import.meta.url), 'utf8');

test('offline same-origin defensive preview', () => {
  for (const rule of ["default-src 'none'", "script-src 'self'", "style-src 'self'", "connect-src 'none'", "form-action 'none'"]) {
    assert.ok(html.includes(rule), rule);
  }
  assert.match(html, /href="\.\/styles\.css"/);
  assert.match(html, /src="\.\/app\.js"/);
  assert.doesNotMatch(html, /<script(?![^>]*src=)[^>]*>/);
  assert.doesNotMatch(html, /(?:src|href)="https?:\/\//i);
  assert.match(html, /Entirely fictional/);
});

test('JS has no unsafe sink or network or persistent browser API', () => {
  for (const pattern of [/\binnerHTML\b/, /\bouterHTML\b/, /\binsertAdjacentHTML\b/, /\beval\s*\(/, /\bfetch\s*\(/, /\bXMLHttpRequest\b/, /\blocalStorage\b/, /\bsessionStorage\b/, /\bWebSocket\b/]) {
    assert.doesNotMatch(js, pattern);
  }
  assert.match(js, /new Set\(\)/);
  assert.match(js, /\.textContent\s*=/);
});

test('native accessibility controls and reduced motion', () => {
  assert.match(html, /class="skip"/);
  assert.match(html, /aria-pressed="true"/);
  assert.match(html, /role="status" aria-live="polite"/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /prefers-reduced-motion:reduce/);
  assert.match(css, /max-width:760px/);
});

test('three signal choices, collecting, removing and clearing work', () => {
  class E {
    constructor(dataset = {}) { this.dataset = dataset; this.textContent=''; this.style={}; this.listeners={}; this.attr={}; }
    addEventListener(event,fn) { this.listeners[event]=fn; }
    setAttribute(key,val) { this.attr[key]=val; }
    fire(event) { assert.equal(typeof this.listeners[event],'function'); this.listeners[event](); }
  }
  const keys=['#signal-coordinate','#signal-kicker','#signal-title','#signal-story','#collected-count','#collect','#clear','#status-note'];
  const els=Object.fromEntries(keys.map(k=>[k,new E()]));
  const buttons=['pulse','echo','horizon'].map(k=>new E({signal:k}));
  const bars=Array.from({length:24},()=>new E());
  const document={
    querySelector:k=>{assert.ok(els[k]);return els[k];},
    querySelectorAll:k=>k==='[data-signal]'?buttons:k==='#wave i'?bars:[]
  };
  runInNewContext(js,{document},{timeout:1000});
  assert.equal(els['#collected-count'].textContent,'00 / 03');
  assert.match(els['#signal-title'].textContent,/beginning/);
  els['#collect'].fire('click');
  assert.equal(els['#collected-count'].textContent,'01 / 03');
  buttons[1].fire('click');
  assert.match(els['#signal-title'].textContent,/quiet/);
  assert.equal(buttons[1].attr['aria-pressed'],'true');
  assert.equal(buttons[0].attr['aria-pressed'],'false');
  els['#collect'].fire('click');
  assert.equal(els['#collected-count'].textContent,'02 / 03');
  els['#collect'].fire('click');
  assert.equal(els['#collected-count'].textContent,'01 / 03');
  buttons[2].fire('click');
  assert.equal(els['#signal-coordinate'].textContent,'SIGNAL // 003');
  assert.equal(bars.length,24);
  assert.ok(bars.every(b=>/\d+%/.test(b.style.height)));
  els['#clear'].fire('click');
  assert.equal(els['#collected-count'].textContent,'00 / 03');
});
