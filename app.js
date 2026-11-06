'use strict';

// Original fictional art concept. All signals are fictional and entirely local.
const signals = Object.freeze({
  pulse: Object.freeze({
    number: 'SIGNAL // 001',
    kicker: 'TRANSMISSION 01 / THE FIRST LIGHT',
    title: 'A beginning is a form of courage.',
    story: 'The station catches a slow pulse. Nothing answers it. Still, the pulse continues, and somewhere in that rhythm is the memory of a first step.',
    wave: [8,16,28,44,69,88,60,35,19,7,19,35,60,88,69,44,28,16,8,10,24,44,16,8]
  }),
  echo: Object.freeze({
    number: 'SIGNAL // 002',
    kicker: 'TRANSMISSION 02 / THE DISTANT ECHO',
    title: 'Even the quiet remembers.',
    story: 'Across an imagined distance, an old note returns softer than before. It asks no question. It simply makes room for the space between sounds.',
    wave: [12,52,19,72,13,58,18,39,20,12,54,18,69,11,55,17,36,20,10,46,14,37,11,9]
  }),
  horizon: Object.freeze({
    number: 'SIGNAL // 003',
    kicker: 'TRANSMISSION 03 / THE OPEN HORIZON',
    title: 'There is more than one way forward.',
    story: 'The last pattern is a widening arc, too gentle to be a warning and too uncertain to be a map. Perhaps possibility is enough for now.',
    wave: [4,7,12,17,26,40,56,71,84,94,88,73,58,45,35,26,19,16,13,19,25,32,39,47]
  })
});
const buttons = Array.from(document.querySelectorAll('[data-signal]'));
const bars = Array.from(document.querySelectorAll('#wave i'));
const coordinate = document.querySelector('#signal-coordinate');
const kicker = document.querySelector('#signal-kicker');
const title = document.querySelector('#signal-title');
const story = document.querySelector('#signal-story');
const count = document.querySelector('#collected-count');
const collect = document.querySelector('#collect');
const clear = document.querySelector('#clear');
const status = document.querySelector('#status-note');

let selected = 'pulse';
const collection = new Set();

function refresh() {
  const item = signals[selected];
  if (!item) return;
  coordinate.textContent = item.number;
  kicker.textContent = item.kicker;
  title.textContent = item.title;
  story.textContent = item.story;
  bars.forEach((bar, i) => { bar.style.height = item.wave[i] + '%'; });
  buttons.forEach(button => {
    button.setAttribute('aria-pressed', String(button.dataset.signal === selected));
  });
  count.textContent = String(collection.size).padStart(2, '0') + ' / 03';
  collect.textContent = collection.has(selected) ? 'Remove from collection −' : 'Keep this signal +';
}

buttons.forEach(button => button.addEventListener('click', () => {
  const key = button.dataset.signal;
  if (!Object.prototype.hasOwnProperty.call(signals, key)) return;
  selected = key;
  refresh();
  status.textContent = 'Now exploring ' + selected + '.';
}));

collect.addEventListener('click', () => {
  const held = collection.has(selected);
  if (held) collection.delete(selected);
  else collection.add(selected);
  refresh();
  status.textContent = held ? 'Signal removed from this tab’s collection.' : 'Signal saved in this tab’s memory only.';
});

clear.addEventListener('click', () => {
  collection.clear();
  refresh();
  status.textContent = 'Collection cleared. Nothing was stored outside this tab.';
});

refresh();
