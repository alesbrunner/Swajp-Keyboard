/* Swajp – ukázky gest na webu: malá klávesnice, prst projede gesto, cílová klávesa se rozsvítí. */
(function () {
  var box = document.getElementById('gdemo');
  if (!box) return;
  var en = document.documentElement.lang === 'en';
  var NS = 'http://www.w3.org/2000/svg';
  var G = '#9ccc65';

  // ---------- klávesnice (jednotky: klávesa 10 × 13)
  var rows = en ? ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'] : ['qwertzuiop', 'asdfghjkl', 'yxcvbnm'];
  var hints = {q: '1', w: '2', e: '3', r: '4', t: '5', z: '6', y: '6', u: '7', i: '8', o: '9', p: '0', m: '?', j: ':', h: ')'};
  if (en) { hints.y = '6'; hints.z = '*'; } else { hints.y = '*'; hints.z = '6'; }
  hints.x = '!'; hints.c = '#'; hints.v = '='; hints.b = '/'; hints.n = '+';
  var K = {};
  function key(id, x, y, w, label, special) { K[id] = {x: x, y: y, w: w, h: 13, label: label, sp: special}; }
  for (var i = 0; i < 10; i++) key(rows[0][i], i * 10, 0, 10, rows[0][i]);
  for (i = 0; i < 9; i++) key(rows[1][i], 5 + i * 10, 14, 10, rows[1][i]);
  key('shift', 0, 28, 15, '⇧', 1);
  for (i = 0; i < 7; i++) key(rows[2][i], 15 + i * 10, 28, 10, rows[2][i]);
  key('bksp', 85, 28, 15, '⌫', 1);
  key('sym', 0, 42, 12, '[I]', 1);
  key('star', 12, 42, 12, 'Swajp', 1);
  key(',', 24, 42, 9, ',', 1);
  key('space', 33, 42, 36, en ? 'English' : 'Čeština');
  key('.', 69, 42, 9, '.', 1);
  key('enter', 78, 42, 22, '⏎', 2);

  function pt(n) { // střed klávesy, „^“ = nad ní (nad klávesnicí), „<“ / „>“ = posun do strany
    var up = n.slice(-1) === '^', left = n.slice(-1) === '<';
    var k = K[up || left ? n.slice(0, -1) : n];
    var x = k.x + k.w / 2, y = k.y + k.h / 2;
    if (up) y = k.y < 20 ? -7 : k.y - 13;
    if (left) x -= 22;
    return [x, y];
  }

  // ---------- ukázky
  var S = en ? [
    {t: 'Swipe typing', d: 'Slide over the letters of the word – Swajp guesses it and adds the space by itself.', p: ['s', 'u', 'p', 'e', 'r'], f: ['', 'super ']},
    {t: 'Capital letter', d: 'From the first letter go up above the keyboard and straight on to the next letter.', p: ['p', 'p^', 'a', 'r', 'i', 's'], f: ['I was in ', 'I was in Paris ']},
    {t: 'Copy, paste, cut', d: 'Swipe from the Swajp key to C, V or X – like Ctrl on a computer.', p: ['star', 'c'], g: 'c', l: 'Copy', f: ['Hello world', 'Copied ✓']},
    {t: 'Undo and redo', d: 'Enter → space undoes the last change, Swajp → space redoes it (also Swajp → Z / Y).', p: ['enter', 'space'], g: 'space', l: 'Undo', f: ['Hello world', 'Hello ']},
    {t: 'Select all', d: 'Swajp → A selects all text, Swajp → D removes the selection.', p: ['star', 'a'], g: 'a', l: 'Select all', f: ['Hi, how are you?', '[Hi, how are you?]']},
    {t: 'UPPER / lower case', d: 'Swajp → Shift switches the word to UPPER case and back.', p: ['star', 'shift'], g: 'shift', l: 'UPPER', f: ['london', 'LONDON']},
    {t: 'Delete words', d: 'Slide left from ⌫ – words get selected one by one, lift to delete them.', p: ['bksp', 'm', 'n'], g: 'bksp', l: '2 words', f: ['I went to the shop', 'I went to ']},
    {t: 'Delete lines', d: 'Slide up from ⌫ (or to L) to delete whole lines.', p: ['bksp', 'bksp^'], g: 'bksp', l: '1 line', f: ['Shopping: bread', '']},
    {t: 'Move the cursor', d: 'Double-tap the space bar, keep your finger down and slide sideways.', tap: 1, p: ['space', 'space<'], g: 'space', l: 'Cursor', f: ['Hello world|', 'Hello| world']},
    {t: 'Join without a space', d: 'Space → ⌫ removes the space, the next word is joined: John + son = Johnson.', p: ['space', 'bksp'], g: 'bksp', l: 'No space', f: ['Call John ', 'Call John|']},
    {t: 'Character from the corner', d: 'From a letter to the space bar types its corner character: M → ?', p: ['m', 'space'], g: 'space', l: '?', f: ['How are you', 'How are you? ']},
    {t: 'Smiley', d: 'J → H types :) and the bar offers 🙂. Or type a word like beer → 🍺.', p: ['j', 'h'], g: 'h', l: ':)', f: ['Hi ', 'Hi 🙂']},
    {t: 'Hide the keyboard', d: 'Swajp → ⌫ with one hand, or a two-finger swipe down.', p: ['star', 'bksp'], g: 'bksp', l: 'Hide', f: ['', '']}
  ] : [
    {t: 'Psaní tahem', d: 'Táhni prstem přes písmena slova – Swajp ho pozná a mezeru přidá sám.', p: ['s', 'u', 'p', 'e', 'r'], f: ['', 'super ']},
    {t: 'Velké písmeno', d: 'Z prvního písmene vyjeď nad klávesnici a odtud rovnou na další písmeno.', p: ['p', 'p^', 'r', 'a', 'z', 'e'], f: ['Byl jsem v ', 'Byl jsem v Praze ']},
    {t: 'Kopírovat, vložit, vyjmout', d: 'Tah z klávesy Swajp na C, V nebo X – jako Ctrl na počítači.', p: ['star', 'c'], g: 'c', l: 'Kopírovat', f: ['Ahoj světe', 'Zkopírováno ✓']},
    {t: 'Zpět a znovu', d: 'Enter → mezerník vrátí poslední změnu, Swajp → mezerník ji udělá znovu (i Swajp → Z / Y).', p: ['enter', 'space'], g: 'space', l: 'Zpět', f: ['Ahoj světe', 'Ahoj ']},
    {t: 'Označit vše', d: 'Swajp → A označí celý text, Swajp → D označení zruší.', p: ['star', 'a'], g: 'a', l: 'Označit vše', f: ['Ahoj, jak se máš?', '[Ahoj, jak se máš?]']},
    {t: 'VELKÁ / malá', d: 'Swajp → Shift přepne slovo na VELKÁ písmena a zpět.', p: ['star', 'shift'], g: 'shift', l: 'VELKÁ', f: ['praha', 'PRAHA']},
    {t: 'Mazání slov', d: 'Táhni z ⌫ doleva – slova se postupně označují, puštěním se smažou.', p: ['bksp', 'm', 'n'], g: 'bksp', l: '2 slova', f: ['Byl jsem v obchodě', 'Byl jsem ']},
    {t: 'Mazání řádků', d: 'Tahem z ⌫ nahoru (nebo na L) smažeš celé řádky.', p: ['bksp', 'bksp^'], g: 'bksp', l: '1 řádek', f: ['Nákup: chleba', '']},
    {t: 'Posun kurzoru', d: 'Dvakrát ťukni na mezerník, podruhé prst nech dole a táhni do stran.', tap: 1, p: ['space', 'space<'], g: 'space', l: 'Kurzor', f: ['Ahoj světe|', 'Ahoj| světe']},
    {t: 'Spojení bez mezery', d: 'Mezerník → ⌫ smaže mezeru a další slovo se připojí: Petr + ovi = Petrovi.', p: ['space', 'bksp'], g: 'bksp', l: 'Bez mezery', f: ['Pošli to Petr ', 'Pošli to Petr|']},
    {t: 'Znak z rohu klávesy', d: 'Tah z písmene na mezerník napíše znak z jeho rohu: M → ?', p: ['m', 'space'], g: 'space', l: '?', f: ['Jak se máš', 'Jak se máš? ']},
    {t: 'Smajlík', d: 'J → H napíše :) a lišta nabídne 🙂. Nebo napiš slovo, třeba pivo → 🍺.', p: ['j', 'h'], g: 'h', l: ':)', f: ['Ahoj ', 'Ahoj 🙂']},
    {t: 'Skrytí klávesnice', d: 'Swajp → ⌫ jednou rukou, nebo tah dvěma prsty dolů.', p: ['star', 'bksp'], g: 'bksp', l: 'Skrýt', f: ['', '']}
  ];

  // ---------- SVG
  function el(n, a, parent) { var e = document.createElementNS(NS, n); for (var k in a) e.setAttribute(k, a[k]); (parent || svg).appendChild(e); return e; }
  var svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '-2 -34 104 92');
  svg.setAttribute('class', 'gsvg');
  box.querySelector('.gview').appendChild(svg);
  el('rect', {x: 0, y: -32, width: 100, height: 17, rx: 3, fill: '#23262a'});
  var field = el('text', {x: 4, y: -20.5, fill: '#ececec', 'font-size': 6.2});
  var keyRect = {};
  for (var id in K) {
    var k = K[id];
    keyRect[id] = el('rect', {x: k.x + 0.6, y: k.y + 0.6, width: k.w - 1.2, height: k.h - 1.2, rx: 1.8,
      fill: k.sp === 2 ? '#7cb342' : k.sp ? '#3a3f44' : '#2a2d31'});
    var lab = el('text', {x: k.x + k.w / 2, y: k.y + 8.6, fill: k.sp === 2 ? '#10140c' : '#ececec', 'font-size': k.label.length > 3 ? 3.4 : 5.2, 'text-anchor': 'middle'});
    lab.textContent = k.label;
    if (hints[id]) { var h = el('text', {x: k.x + k.w - 2.2, y: k.y + 3.8, fill: '#a4a8ad', 'font-size': 2.8, 'text-anchor': 'middle'}); h.textContent = hints[id]; }
  }
  var trail = el('polyline', {fill: 'none', stroke: G, 'stroke-width': 1.6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: 0.9});
  var finger = el('circle', {r: 3.2, fill: 'none', stroke: '#fff', 'stroke-width': 0.8, opacity: 0});
  var fdot = el('circle', {r: 1.2, fill: '#fff', opacity: 0});
  var bubble = el('g', {opacity: 0});
  var bRect = el('rect', {rx: 3.5, height: 7, fill: G}, bubble);
  var bText = el('text', {fill: '#10140c', 'font-size': 4.2, 'text-anchor': 'middle', 'font-weight': 700}, bubble);

  var titleEl = box.querySelector('.gt'), descEl = box.querySelector('.gd'), dots = box.querySelector('.gdots');
  S.forEach(function (_, i) { var b = document.createElement('button'); b.setAttribute('aria-label', (i + 1) + ''); b.onclick = function () { go(i); }; dots.appendChild(b); });

  var cur = 0, t0 = 0, raf = 0, lastT = 1e9;
  function setField(s) {
    var sel = s.charAt(0) === '[';
    field.textContent = sel ? s.slice(1, -1) : s.replace('|', '');
    field.setAttribute('fill', sel ? G : '#ececec');
  }
  function go(i) {
    cur = (i + S.length) % S.length;
    var s = S[cur];
    titleEl.textContent = s.t;
    descEl.textContent = s.d;
    [].forEach.call(dots.children, function (b, j) { b.className = j === cur ? 'on' : ''; });
    t0 = performance.now();
    lastT = 1e9;
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(frame);
  }
  function glow(id, on) { if (keyRect[id]) keyRect[id].setAttribute('stroke', on ? G : 'none'), keyRect[id].setAttribute('stroke-width', on ? 1.2 : 0); }

  function frame(now) {
    var s = S[cur], pts = s.p.map(pt);
    var pre = s.tap ? 500 : 0, segMs = 420, move = (pts.length - 1) * segMs, hold = 1700, total = 400 + pre + move + hold;
    var t = (now - t0) % total;
    if (t < lastT) { trail.setAttribute('points', ''); for (var k in keyRect) glow(k, false); bubble.setAttribute('opacity', 0); } // nové kolo
    lastT = t;
    var down = false, x = pts[0][0], y = pts[0][1], tt = t - 400;
    setField(s.f[0]);
    if (tt < 0) { down = false; }
    else if (tt < pre) { down = tt < 120 || tt > 260; } // ťuknutí a znovu dolů (dvojklik)
    else if (tt < pre + move) {
      down = true;
      var m = (tt - pre) / segMs, si = Math.floor(m), f = m - si;
      f = f * f * (3 - 2 * f);
      x = pts[si][0] + (pts[si + 1][0] - pts[si][0]) * f;
      y = pts[si][1] + (pts[si + 1][1] - pts[si][1]) * f;
      var pl = [];
      for (var j = 0; j <= si; j++) pl.push(pts[j].join(','));
      pl.push(x + ',' + y);
      trail.setAttribute('points', pl.join(' '));
      if (s.g && si === pts.length - 2) glow(s.g, true);
    } else {
      x = pts[pts.length - 1][0]; y = pts[pts.length - 1][1];
      down = tt < pre + move + 250;
      setField(s.f[1]);
      if (s.g) glow(s.g, true);
      if (s.l && s.g) {
        var k2 = K[s.g], w = Math.max(14, s.l.length * 2.5 + 6);
        var cx = Math.max(w / 2, Math.min(100 - w / 2, k2.x + k2.w / 2));
        bRect.setAttribute('x', cx - w / 2); bRect.setAttribute('y', k2.y - 8.5); bRect.setAttribute('width', w);
        bText.setAttribute('x', cx); bText.setAttribute('y', k2.y - 3.6); bText.textContent = s.l;
        bubble.setAttribute('opacity', 1);
      }
      if (!down) trail.setAttribute('points', '');
    }
    finger.setAttribute('cx', x); finger.setAttribute('cy', y); fdot.setAttribute('cx', x); fdot.setAttribute('cy', y);
    finger.setAttribute('opacity', down ? 1 : 0); fdot.setAttribute('opacity', down ? 1 : 0);
    raf = requestAnimationFrame(frame);
  }

  box.querySelector('.gprev').onclick = function () { go(cur - 1); };
  box.querySelector('.gnext').onclick = function () { go(cur + 1); };
  var sx = null;
  box.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, {passive: true});
  box.addEventListener('touchend', function (e) {
    if (sx === null) return;
    var dx = e.changedTouches[0].clientX - sx; sx = null;
    if (Math.abs(dx) > 50) go(cur + (dx < 0 ? 1 : -1));
  });
  go(0);
})();
