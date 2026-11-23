/* Swajp – animované ukázky na webu: malá klávesnice jako v aplikaci, prst přehraje gesto,
   v poli nahoře je vidět výsledek (text, označení, kurzor). Okénka: #gdemo (gesta), #cdemo (číselník a kalkulačka). */
(function () {
  var en = document.documentElement.lang === 'en';
  var NS = 'http://www.w3.org/2000/svg';
  var G = '#9ccc65', KEY = '#2a2d31', SPEC = '#3a3f44', TX = '#ececec', MUT = '#a4a8ad', OP = '#34402b';
  function L(cs, e) { return en ? e : cs; }

  // ------------------------------------------------------------ rozložení (šířky v klávesách, řada = 10)
  var R0 = en ? 'qwertyuiop' : 'qwertzuiop', R2 = en ? 'zxcvbnm' : 'yxcvbnm';
  var HINT = {q: '1', w: '2', e: '3', r: '4', t: '5', u: '7', i: '8', o: '9', p: '0', j: ':', h: ')',
    x: '!', c: '#', v: '=', b: '/', n: '+', m: '?'};
  HINT[en ? 'y' : 'z'] = '6'; HINT[en ? 'z' : 'y'] = '*';
  function k(id, w, lab, kind, sub) { return {id: id, w: w, lab: lab, kind: kind || 0, sub: sub}; }
  var EL = {X: ['✂', L('Vyjmout', 'Cut')], U: ['↑', L('Nahoru', 'Up')], V: ['⎘', L('Vložit', 'Paste')], H: ['⇤', L('Začátek', 'Start')],
    L: ['←', L('Doleva', 'Left')], S: ['[ ]', L('Označit', 'Select')], R: ['→', L('Doprava', 'Right')], E: ['⇥', L('Konec', 'End')],
    C: ['⧉', L('Kopírovat', 'Copy')], D: ['↓', L('Dolů', 'Down')], A: ['[≡]', L('Označit vše', 'Select all')], Z: ['↶', ''], Y: ['↷', '']};
  function ek(c) { return k('e:' + c, c === 'Z' || c === 'Y' ? 1.25 : 2.5, EL[c][0], 1, EL[c][1]); }
  var LAYERS = {
    letters: [
      R0.split('').map(function (c) { return k(c, 1, c); }),
      [k('_pad', 0.5, '')].concat('asdfghjkl'.split('').map(function (c) { return k(c, 1, c); })),
      [k('shift', 1.5, '⇧', 1)].concat(R2.split('').map(function (c) { return k(c, 1, c); })).concat([k('bksp', 1.5, '⌫', 1)]),
      [k('star', 1.1, '', 3), k('sym', 1.4, '[I]', 1), k(',', 1, ',', 1), k('space', 4, en ? 'English' : 'Čeština'), k('.', 1, '.', 1), k('enter', 1.5, '⏎', 2)]
    ],
    edit: [
      ['X', 'U', 'V', 'H'].map(ek), ['L', 'S', 'R', 'E'].map(ek), ['C', 'D', 'A'].map(ek).concat([k('enter', 2.5, '⏎', 2)]),
      [k('abc', 2.5, 'ABC', 1), k('space', 2.5, '␣'), ek('Z'), ek('Y'), k('bksp', 2.5, '⌫', 1)]
    ],
    numpad: [
      [k('n:+', 2, '+', 1, '±'), k('n:1', 2, '1', 0, '¹'), k('n:2', 2, '2', 0, '²'), k('n:3', 2, '3', 0, '³'), k('n:=', 2, '=', 1, '#')],
      [k('n:-', 2, '-', 1, '–'), k('n:4', 2, '4', 0, '⁴'), k('n:5', 2, '5', 0, '⁵'), k('n:6', 2, '6', 0, '⁶'), k('n:(', 2, '(', 1, ')')],
      [k('n:*', 2, '*', 1, '×'), k('n:7', 2, '7', 0, '⁷'), k('n:8', 2, '8', 0, '⁸'), k('n:9', 2, '9', 0, '⁹'), k('n:%', 2, '%', 1, '‰')],
      [k('n:/', 2, '/', 1, '÷'), k('n:,', 2, ',', 1, ';'), k('n:0', 2, '0', 0, '⁰'), k('n:.', 2, '.', 1, ':'), k('bksp', 2, '⌫', 1)],
      [k('abc', 2, 'ABC', 1), k('n:a', 1, 'a', 0, 'α'), k('n:b', 1, 'b', 0, 'η'), k('space', 2, '␣'), k('n:x', 1, 'x', 0, 'ν'), k('n:y', 1, 'y', 0, 'τ'), k('enter', 2, '⏎', 2)]
    ],
    calc: [
      [k('c:+', 2, '+', 4), k('c:1', 2, '1'), k('c:2', 2, '2'), k('c:3', 2, '3'), k('c:C', 2, 'C', 4)],
      [k('c:-', 2, '−', 4), k('c:4', 2, '4'), k('c:5', 2, '5'), k('c:6', 2, '6'), k('c:P', 2, '( )', 4)],
      [k('c:*', 2, '×', 4), k('c:7', 2, '7'), k('c:8', 2, '8'), k('c:9', 2, '9'), k('c:%', 2, '%', 4)],
      [k('c:/', 2, '÷', 4), k('c:,', 2, ',', 4), k('c:0', 2, '0'), k('c:.', 2, '.', 4), k('c:B', 2, '⌫', 4)],
      [k('abc', 2, 'ABC', 1), k('c:W', 3, L('→ Vše', '→ All'), 2), k('c:=', 3, L('→ Výsledek', '→ Result'), 2), k('c:S', 2, 'f(x)', 1)]
    ],
    sci: [
      [k('s:p', 2, 'π', 4), k('s:e', 2, 'e', 4), k('s:x', 2, 'eˣ', 4), k('s:k', 2, '10ˣ', 4), k('c:C', 2, 'C', 4)],
      [k('s:!', 2, 'n!', 4), k('s:q', 2, 'x²', 4), k('s:^', 2, 'xʸ', 4), k('s:i', 2, '1/x', 4), k('s:r', 2, '√', 4)],
      [k('s:s', 2, 'sin', 4), k('s:c', 2, 'cos', 4), k('s:t', 2, 'tan', 4), k('s:l', 2, 'ln', 4), k('s:g', 2, 'log', 4)],
      [k('s:a', 2, 'asin', 4), k('s:o', 2, 'acos', 4), k('s:n', 2, 'atan', 4), k('s:D', 2, 'DEG', 4), k('c:B', 2, '⌫', 4)],
      [k('abc', 2, 'ABC', 1), k('c:W', 3, L('→ Vše', '→ All'), 2), k('c:=', 3, L('→ Výsledek', '→ Result'), 2), k('c:N', 2, '123', 1)]
    ]
  };
  var RH = 14; // výška řady

  // ------------------------------------------------------------ přehrávač
  function Demo(box, slides, rows) {
    var self = this;
    var FY = -50, FH = 27, BY = -19, BH = 9; // pole s textem, lišta
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '-2 ' + (FY - 2) + ' 104 ' + (rows * RH - FY + 3));
    svg.setAttribute('class', 'gsvg');
    box.querySelector('.gview').appendChild(svg);
    function el(n, a, p) { var e = document.createElementNS(NS, n); for (var q in a) e.setAttribute(q, a[q]); (p || svg).appendChild(e); return e; }
    el('rect', {x: 0, y: FY, width: 100, height: FH, rx: 3, fill: '#23262a'});
    var fieldG = el('g', {});
    var barG = el('g', {});
    var kbG = el('g', {});
    var popG = el('g', {});
    var trail = el('polyline', {fill: 'none', stroke: G, 'stroke-width': 1.6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: 0.9});
    var finger = el('circle', {r: 3.2, fill: 'none', stroke: '#fff', 'stroke-width': 0.8});
    var fdot = el('circle', {r: 1.2, fill: '#fff'});
    var bubble = el('g', {});
    var bRect = el('rect', {rx: 3.5, height: 7, fill: G}, bubble);
    var bText = el('text', {fill: '#10140c', 'font-size': 4.2, 'text-anchor': 'middle', 'font-weight': 700}, bubble);

    var K = {}, rects = {}, layer = null;
    function drawLayer(name) {
      layer = name;
      while (kbG.firstChild) kbG.removeChild(kbG.firstChild);
      K = {}; rects = {};
      LAYERS[name].forEach(function (row, ri) {
        var x = 0, y = ri * RH;
        row.forEach(function (q) {
          var w = q.w * 10;
          if (q.id !== '_pad') {
            K[q.id] = {x: x, y: y, w: w, h: RH - 1};
            var fill = q.kind === 2 ? '#7cb342' : q.kind === 4 ? OP : q.kind ? SPEC : KEY;
            rects[q.id] = el('rect', {x: x + 0.6, y: y + 0.6, width: w - 1.2, height: RH - 2.2, rx: 1.8, fill: fill}, kbG);
            if (q.kind === 3) dragonfly(x + w / 2, y + 6.5);
            var two = name === 'edit' && q.sub;
            var t = el('text', {x: x + w / 2, y: y + (two ? 6.2 : 8.4), fill: q.kind === 2 ? '#10140c' : TX, 'text-anchor': 'middle',
              'font-size': q.lab.length > 4 ? 3.4 : two ? 4.6 : 5.2}, kbG);
            t.textContent = q.lab;
            if (two) { var s = el('text', {x: x + w / 2, y: y + 10.8, fill: MUT, 'text-anchor': 'middle', 'font-size': 2.8}, kbG); s.textContent = q.sub; }
            var h = name === 'letters' ? HINT[q.id] : (name === 'numpad' ? q.sub : null);
            if (h) { var hh = el('text', {x: x + w - 2.3, y: y + 3.9, fill: MUT, 'font-size': 2.8, 'text-anchor': 'middle'}, kbG); hh.textContent = h; }
          }
          x += w;
        });
      });
    }
    function dragonfly(cx, cy) { // malá vážka na klávese Swajp (jako v aplikaci)
      var g = el('g', {transform: 'translate(' + cx + ' ' + cy + ') rotate(-35) scale(.8)', fill: 'none', stroke: G, 'stroke-width': 0.55, 'stroke-linecap': 'round'}, kbG);
      el('path', {d: 'M-5 0 L4 0'}, g);
      el('circle', {cx: 4.6, cy: 0, r: 1, fill: G, stroke: 'none'}, g);
      el('path', {d: 'M2 0 C 0 -4.2, -3 -4.4, -3.6 -3 C -3 -1.6, -0.5 -0.6, 2 0 Z M2 0 C 0 4.2, -3 4.4, -3.6 3 C -3 1.6, -0.5 0.6, 2 0 Z', fill: 'rgba(156,204,101,.25)'}, g);
      el('path', {d: 'M1 0 C 2.5 -3.6, 5 -3.8, 5.2 -2.6 C 4.6 -1.4, 2.6 -0.6, 1 0 Z M1 0 C 2.5 3.6, 5 3.8, 5.2 2.6 C 4.6 1.4, 2.6 0.6, 1 0 Z', fill: 'rgba(156,204,101,.25)'}, g);
    }

    // pole s textem: řádky, označení (a–b), blikající kurzor
    var st = {};
    function drawField() {
      while (fieldG.firstChild) fieldG.removeChild(fieldG.firstChild);
      var lines = st.text.split('\n'), off = 0, lh = 7.4, y0 = FY + 7.6;
      var cur = st.cur < 0 ? st.text.length : st.cur;
      lines.forEach(function (ln, i) {
        var y = y0 + i * lh;
        var t = el('text', {x: 4, y: y, fill: TX, 'font-size': 5.4}, fieldG);
        t.textContent = ln || '\u200b';
        function xAt(n) { if (n <= 0 || !ln) return 4; try { return 4 + t.getSubStringLength(0, Math.min(n, ln.length)); } catch (e) { return 4 + n * 2.6; } }
        if (st.selA >= 0) {
          var a = Math.max(st.selA, off), b = Math.min(st.selB, off + ln.length);
          if (b > a || (st.selA <= off && st.selB > off + ln.length)) {
            var r = el('rect', {x: xAt(a - off), y: y - 5, width: Math.max(1.5, xAt(b - off) - xAt(a - off)), height: 6.6, fill: '#2f5e8c'}, fieldG);
            fieldG.insertBefore(r, t);
          }
        } else if (cur >= off && cur <= off + ln.length && Math.floor(performance.now() / 450) % 2 === 0) {
          el('rect', {x: xAt(cur - off) + 0.2, y: y - 5, width: 0.7, height: 6.4, fill: G}, fieldG);
        }
        off += ln.length + 1;
      });
    }
    // lišta: návrhy, kalkulačka nebo krátké hlášení
    var barPos = [];
    function drawBar() {
      while (barG.firstChild) barG.removeChild(barG.firstChild);
      barPos = [];
      if (st.flash && performance.now() < st.flashUntil) {
        var f = el('text', {x: 50, y: BY + 6.2, fill: G, 'font-size': 4.6, 'text-anchor': 'middle', 'font-weight': 700}, barG); f.textContent = st.flash; return;
      }
      if (st.calc != null) {
        var c = el('text', {x: 4, y: BY + 6.2, fill: TX, 'font-size': 5}, barG); c.textContent = st.calc;
        if (st.res) { var r = el('text', {x: 96, y: BY + 6.2, fill: G, 'font-size': 5, 'text-anchor': 'end', 'font-weight': 700}, barG); r.textContent = '= ' + st.res; }
        return;
      }
      if (!st.bar) return;
      var w = 100 / st.bar.length;
      st.bar.forEach(function (s, i) {
        barPos.push([w * i + w / 2, BY + BH / 2]);
        var t = el('text', {x: w * i + w / 2, y: BY + 6.2, fill: i === 0 ? G : TX, 'font-size': 4.6, 'text-anchor': 'middle'}, barG); t.textContent = s;
        if (i > 0) el('rect', {x: w * i, y: BY + 1.5, width: 0.3, height: BH - 3, fill: '#4a4f55'}, barG);
      });
    }
    function drawPop() {
      while (popG.firstChild) popG.removeChild(popG.firstChild);
      if (!st.pop) return;
      var cw = st.pop.cw, x0 = st.pop.x0, y = st.pop.y, n = st.pop.items.length;
      el('rect', {x: x0, y: y, width: n * cw, height: RH - 1, rx: 2, fill: '#44494f'}, popG);
      st.pop.items.forEach(function (s, i) {
        if (i === st.pop.sel) el('rect', {x: x0 + i * cw + 0.8, y: y + 0.8, width: cw - 1.6, height: RH - 2.6, rx: 1.6, fill: G}, popG);
        var t = el('text', {x: x0 + i * cw + cw / 2, y: y + 8.2, fill: i === st.pop.sel ? '#10140c' : TX, 'font-size': s.length > 2 ? 3.2 : 5, 'text-anchor': 'middle'}, popG); t.textContent = s;
      });
    }

    function pt(name) { // cíl prstu: klávesa, „bar1“, „pop2“, posun „@dx,dy“ v klávesách
      var dx = 0, dy = 0, at = name.indexOf('@');
      if (at > 0) { var d = name.slice(at + 1).split(','); dx = +d[0]; dy = +(d[1] || 0); name = name.slice(0, at); }
      var x = 50, y = 20;
      if (/^bar\d/.test(name)) { var b = barPos[+name.slice(3)] || [50, BY + 4]; x = b[0]; y = b[1]; }
      else if (/^pop\d/.test(name) && st.pop) { x = st.pop.x0 + (+name.slice(3) + 0.5) * st.pop.cw; y = st.pop.y + RH / 2; }
      else if (K[name]) { x = K[name].x + K[name].w / 2; y = K[name].y + RH / 2; }
      return [x + dx * 10, y + dy * RH];
    }

    // ---- průběh
    var cur = 0, steps, idx, t0, fx, fy, down, from, to, moving, pts, glowKey, upAt, raf, endAt;
    function reset() {
      st = {text: '', cur: -1, selA: -1, selB: -1, bar: null, calc: null, res: '', flash: null, flashUntil: 0, pop: null};
      drawLayer(slides[cur].layer || 'letters');
      idx = 0; t0 = performance.now(); down = false; moving = false; pts = []; glowKey = null; upAt = 0; endAt = 0;
      var p0 = pt('space'); fx = p0[0]; fy = p0[1];
      for (var q in rects) rects[q].setAttribute('stroke', 'none');
      bubble.setAttribute('opacity', 0);
    }
    function glow(id, label) {
      if (glowKey && rects[glowKey]) rects[glowKey].setAttribute('stroke', 'none');
      glowKey = id;
      if (!id || !rects[id]) { bubble.setAttribute('opacity', 0); return; }
      rects[id].setAttribute('stroke', G); rects[id].setAttribute('stroke-width', 1.2);
      if (!label) { bubble.setAttribute('opacity', 0); return; }
      var kk = K[id], w = Math.max(14, label.length * 2.5 + 6), cx = Math.max(w / 2, Math.min(100 - w / 2, kk.x + kk.w / 2));
      bRect.setAttribute('x', cx - w / 2); bRect.setAttribute('y', kk.y - 8.5); bRect.setAttribute('width', w);
      bText.setAttribute('x', cx); bText.setAttribute('y', kk.y - 3.6); bText.textContent = label;
      bubble.setAttribute('opacity', 1);
    }
    function tick(now) {
      var s = slides[cur].s;
      while (idx < s.length) {
        var op = s[idx], el2 = now - t0;
        if (op[0] === 'W') { if (el2 < op[1]) break; t0 += op[1]; idx++; continue; }
        if (op[0] === 'M') {
          if (!moving) { from = [fx, fy]; to = pt(op[1]); moving = true; }
          var ms = op[2] || 380, f = Math.min(1, el2 / ms), e = f * f * (3 - 2 * f);
          fx = from[0] + (to[0] - from[0]) * e; fy = from[1] + (to[1] - from[1]) * e;
          if (down) pts.push(fx.toFixed(2) + ',' + fy.toFixed(2));
          if (st.pop) { var pi = Math.floor((fx - st.pop.x0) / st.pop.cw); st.pop.sel = fy < st.pop.y + RH && pi >= 0 && pi < st.pop.items.length ? pi : -1; }
          if (f < 1) break;
          moving = false; t0 += ms; idx++; continue;
        }
        apply(op, now); idx++;
      }
      if (idx >= s.length) { if (!endAt) endAt = now; if (now - endAt > 2200) reset(); }
    }
    function apply(op, now) {
      switch (op[0]) {
        case 'D': var p = pt(op[1]); fx = p[0]; fy = p[1]; down = true; pts = [fx + ',' + fy]; break;
        case 'U': down = false; upAt = now; glow(null); st.pop = null; break;
        case 'T': st.text = op[1]; st.cur = -1; st.selA = st.selB = -1; break;
        case 'C': st.cur = op[1]; st.selA = st.selB = -1; break;
        case 'S': st.selA = op[1]; st.selB = op[2] == null ? st.text.length : op[2]; break;
        case 'N': st.selA = st.selB = -1; break;
        case 'B': st.bar = op[1]; break;
        case 'K': st.calc = op[1]; st.res = op[2] || ''; break;
        case 'F': st.flash = op[1]; st.flashUntil = now + 1100; break;
        case 'G': glow(op[1], op[2]); break;
        case 'L': drawLayer(op[1]); st.bar = null; if (op[1] === 'letters') st.calc = null; break;
        case 'O': // nabídka podržení nad klávesou (geometrie hned, ať na ni prst může mířit)
          var pk = K[op[1]], pn = op[2].length, pcw = 11;
          st.pop = {key: op[1], items: op[2], sel: -1, cw: pcw, y: pk.y - RH, x0: Math.max(0, Math.min(100 - pn * pcw, pk.x + pk.w / 2 - pn * pcw / 2))};
          break;
        case 'H': if (rects[op[1]]) rects[op[1]].setAttribute('fill', op[2] ? '#4e6b2f' : SPEC); break;
      }
    }
    function frame(now) {
      tick(now);
      drawField(); drawBar(); drawPop();
      trail.setAttribute('points', down || now - upAt < 250 ? pts.join(' ') : '');
      finger.setAttribute('cx', fx); finger.setAttribute('cy', fy); fdot.setAttribute('cx', fx); fdot.setAttribute('cy', fy);
      finger.setAttribute('opacity', down ? 1 : 0); fdot.setAttribute('opacity', down ? 1 : 0);
      raf = requestAnimationFrame(frame);
    }

    var titleEl = box.querySelector('.gt'), descEl = box.querySelector('.gd'), dots = box.querySelector('.gdots');
    slides.forEach(function (_, i) { var b = document.createElement('button'); b.setAttribute('aria-label', (i + 1) + ''); b.onclick = function () { go(i); }; dots.appendChild(b); });
    function go(i) {
      cur = (i + slides.length) % slides.length;
      titleEl.textContent = slides[cur].t; descEl.textContent = slides[cur].d;
      [].forEach.call(dots.children, function (b, j) { b.className = j === cur ? 'on' : ''; });
      reset();
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
    raf = requestAnimationFrame(frame);
  }

  // ------------------------------------------------------------ scénáře
  function swipe(word, ms) { var a = [['D', word[0]]]; for (var i = 1; i < word.length; i++) a.push(['M', word[i], ms || 330]); a.push(['U']); return a; }
  function tap(key) { return [['D', key], ['W', 130], ['U'], ['W', 120]]; }
  function cat() { var a = []; for (var i = 0; i < arguments.length; i++) a = a.concat(arguments[i]); return a; }

  var lines2 = L('Nákup: chleba, mléko\nByl jsem v obchodě a koupil', 'Shopping: bread, milk\nI went to the shop and bought');
  var l2s = lines2.indexOf('\n') + 1;
  var t3 = L('Ahoj Petře,\njak se máš?\nUvidíme se zítra.', 'Hi Peter,\nhow are you?\nSee you tomorrow.');
  var t3c = t3.indexOf('?') + 1;               // kurzor za otazníkem
  var t3w = t3.lastIndexOf(' ', t3c - 1) + 1;  // začátek posledního slova 2. řádku
  var t3l = t3.indexOf('\n') + 1;              // začátek 2. řádku
  var t3p = en ? 3 : 5;                        // „Petře“ / „Peter“ v 1. řádku
  var t4 = L('Ahoj Petře,\nDnes je venku hezky,\npůjdeme ven?', 'Hi Peter,\nThe weather is nice,\nshall we go out?');
  var t4c = t4.indexOf(L('venku', 'is')) + L('venku', 'is').length, t4l = t4.indexOf('\n') + 1, t4e = t4.indexOf('\n', t4l);
  var hello = L('Ahoj světe', 'Hello world'), hw = L('Ahoj ', 'Hello ');

  var GEST = [
    {t: L('Psaní tahem', 'Swipe typing'), d: L('Táhni prstem přes písmena slova – Swajp ho pozná a mezeru přidá sám. Podobná slova nabídne v liště.', 'Slide over the letters of the word – Swajp recognises it and adds the space. Similar words are offered in the bar.'),
      s: cat([['T', ''], ['W', 600]], swipe('super', 380), [['T', 'super '], ['B', en ? ['super', 'supper', 'superb'] : ['super', 'supr', 'superb']], ['W', 1600]])},
    {t: L('Jiné slovo z lišty', 'Another word from the bar'), d: L('Slova s podobným tahem (mám / nám / nás) najdeš v liště – klepnutím nahradíš vložené.', 'Words with a similar swipe (our / out / or) are in the bar – a tap replaces the inserted one.'),
      s: cat([['T', L('Řekni ', "Let's go ")], ['W', 500]], swipe(en ? 'our' : 'mam', 420), [['T', L('Řekni mám ', "Let's go our ")], ['B', en ? ['our', 'out', 'or', 'pour'] : ['mám', 'nám', 'nás', 'mam']], ['W', 1100]],
        tap('bar1'), [['T', L('Řekni nám ', "Let's go out ")], ['B', null], ['W', 1500]])},
    {t: L('Velké písmeno', 'Capital letter'), d: L('Z prvního písmene vyjeď nad klávesnici a odtud rovnou na další písmeno (nevracej se zpět).', 'From the first letter go up above the keyboard and straight on to the next letter (don\'t go back).'),
      s: cat([['T', L('Byl jsem v ', 'I was in ')], ['W', 500], ['D', 'p'], ['M', 'p@0,-1.1', 360]], (en ? 'aris' : 'raze').split('').map(function (c) { return ['M', c, 380]; }),
        [['U'], ['T', L('Byl jsem v Praze ', 'I was in Paris ')], ['W', 1800]])},
    {t: L('Kopírovat a vložit', 'Copy and paste'), d: L('Klepnutí na Swajp označí slovo. Tah ze Swajp na C zkopíruje, na V vloží, na X vyjme – jako Ctrl na počítači.', 'A tap on Swajp selects the word. Swajp → C copies, → V pastes, → X cuts – like Ctrl on a computer.'),
      s: cat([['T', hello], ['W', 500]], tap('star'), [['S', hw.length], ['W', 700], ['D', 'star'], ['G', 'c', L('Kopírovat', 'Copy')], ['M', 'c', 480], ['W', 200], ['U'], ['F', L('Zkopírováno', 'Copied')],
        ['W', 500], ['T', hello + ' '], ['W', 600], ['D', 'star'], ['G', 'v', L('Vložit', 'Paste')], ['M', 'v', 480], ['W', 200], ['U'], ['T', hello + ' ' + hello.split(' ')[1]], ['W', 1600]])},
    {t: L('Zpět a znovu', 'Undo and redo'), d: L('Enter → mezerník vrátí poslední změnu, Swajp → mezerník ji vrátí zpět. Až 60 kroků (i Swajp → Z / Y).', 'Enter → space undoes the last change, Swajp → space redoes it. Up to 60 steps (also Swajp → Z / Y).'),
      s: [['T', hello], ['W', 600], ['D', 'enter'], ['G', 'space', L('Zpět', 'Undo')], ['M', 'space', 520], ['W', 200], ['U'], ['T', hw], ['F', '↶'], ['W', 1100],
        ['D', 'star'], ['G', 'space', L('Znovu', 'Redo')], ['M', 'space', 520], ['W', 200], ['U'], ['T', hello], ['F', '↷'], ['W', 1600]]},
    {t: L('Označit vše a odznačit', 'Select all and deselect'), d: L('Swajp → A označí celý text, Swajp → D označení zruší.', 'Swajp → A selects all text, Swajp → D removes the selection.'),
      s: [['T', L('Ahoj, jak se máš?', 'Hi, how are you?')], ['W', 600], ['D', 'star'], ['G', 'a', L('Označit vše', 'Select all')], ['M', 'a', 500], ['W', 200], ['U'], ['S', 0], ['W', 1300],
        ['D', 'star'], ['G', 'd', L('Odznačit', 'Deselect')], ['M', 'd', 500], ['W', 200], ['U'], ['N'], ['W', 1600]]},
    {t: L('VELKÁ / malá', 'UPPER / lower case'), d: L('Swajp → Shift přepne slovo na VELKÁ písmena, Swajp → Shift → zpět na Swajp na První velké.', 'Swajp → Shift switches the word to UPPER case, Swajp → Shift → back to Swajp to First capital.'),
      s: [['T', L('praha', 'london')], ['W', 600], ['D', 'star'], ['G', 'shift', L('VELKÁ', 'UPPER')], ['M', 'shift', 520], ['W', 200], ['U'], ['T', L('PRAHA', 'LONDON')], ['W', 1100],
        ['D', 'star'], ['M', 'shift', 450], ['G', 'star', L('První velké', 'First capital')], ['M', 'star', 450], ['W', 200], ['U'], ['T', L('Praha', 'London')], ['W', 1600]]},
    {t: L('Mazání slov a řádků', 'Deleting words and lines'), d: L('Táhni z ⌫ doleva – slova se označují jedno po druhém, tahem nahoru celé řádky. Puštěním se smažou.', 'Slide left from ⌫ – words get selected one by one, slide up for whole lines. Lift to delete.'),
      s: [['T', lines2], ['W', 600], ['D', 'bksp'], ['M', 'm', 420], ['G', 'm', L('1 slovo', '1 word')], ['S', lines2.lastIndexOf(' ') + 1], ['W', 400],
        ['M', 'n', 380], ['G', 'bksp', L('2 slova', '2 words')], ['S', lines2.lastIndexOf(' ', lines2.lastIndexOf(' ') - 1) + 1], ['W', 400],
        ['M', 'b', 380], ['G', 'bksp', L('3 slova', '3 words')], ['S', lines2.lastIndexOf(' ', lines2.lastIndexOf(' ', lines2.lastIndexOf(' ') - 1) - 1) + 1], ['W', 600],
        ['M', 'bksp@0,-1', 420], ['G', 'bksp', L('1 řádek', '1 line')], ['S', l2s], ['W', 900], ['U'], ['T', lines2.slice(0, l2s)], ['W', 1600]]},
    {t: L('Posun kurzoru', 'Moving the cursor'), d: L('Dvakrát ťukni na mezerník, podruhé prst nech dole a táhni: do stran po písmenech, nahoru po řádcích.', 'Double-tap the space bar, keep your finger down the second time and slide: sideways by letters, up by lines.'),
      s: (function () {
        var tx = L('Ahoj\nJak se máš', 'Hi\nHow are you'), n = tx.length, a = [['T', tx], ['W', 600], ['D', 'space'], ['W', 120], ['U'], ['W', 100], ['D', 'space'], ['G', 'space', L('Kurzor', 'Cursor')], ['W', 300]];
        for (var i = 1; i <= 4; i++) a.push(['M', 'space@-' + (0.6 * i).toFixed(1), 220], ['C', n - i]);
        a.push(['W', 300], ['M', 'space@-2.4,-1', 400], ['C', Math.min(n - 4 - tx.indexOf('\n') - 1, tx.indexOf('\n'))], ['W', 700], ['M', 'space@-2.4', 400], ['C', n - 4], ['W', 600], ['U'], ['W', 1200]);
        return a;
      })()},
    {t: L('Znak z rohu klávesy', 'Character from the key corner'), d: L('Tah z písmene na mezerník napíše znak z jeho rohu: M → ?, X → !', 'A swipe from a letter to the space bar types its corner character: M → ?, X → !'),
      s: [['T', L('Jak se máš', 'How are you')], ['W', 600], ['D', 'm'], ['G', 'space', '?'], ['M', 'space', 480], ['W', 200], ['U'], ['T', L('Jak se máš? ', 'How are you? ')], ['W', 1000],
        ['D', 'x'], ['G', 'space', '!'], ['M', 'space', 520], ['W', 200], ['U'], ['T', L('Jak se máš?! ', 'How are you?! ')], ['W', 1600]]},
    {t: L('Smajlíci', 'Emoji'), d: L('J → H napíše :) a lišta nabídne 🙂. Napiš slovo jako pivo, srdce nebo smutný – smajlík se nabídne taky.', 'J → H types :) and the bar offers 🙂. Type a word like beer, heart or sad – an emoji is offered too.'),
      s: cat([['T', L('Ahoj ', 'Hi ')], ['W', 500], ['D', 'j'], ['G', 'h', ':)'], ['M', 'h', 480], ['W', 200], ['U'], ['T', L('Ahoj :)', 'Hi :)')], ['B', [':)', '🙂', '😊', '😉']], ['W', 1000]],
        tap('bar1'), [['T', L('Ahoj 🙂 ', 'Hi 🙂 ')], ['B', null], ['W', 700]], swipe(en ? 'beer' : 'pivo', 360),
        [['T', L('Ahoj 🙂 pivo', 'Hi 🙂 beer')], ['B', en ? ['beer', '🍺', '🍻', 'been'] : ['pivo', '🍺', '🍻', 'piva']], ['W', 1000]], tap('bar1'), [['T', L('Ahoj 🙂 🍺', 'Hi 🙂 🍺')], ['B', null], ['W', 1600]])},
    {t: L('Úpravy textu – klávesa [I]', 'Text editing – the [I] key'), d: L('Klepnutí na [I] otevře úpravy: šipky, Označit (šipky pak označují), Kopírovat, Vyjmout, Vložit, Zpět a Znovu.', 'Tapping [I] opens editing: arrows, Select (the arrows then select), Copy, Cut, Paste, Undo and Redo.'),
      s: cat([['T', hello], ['W', 500]], tap('sym'), [['L', 'edit'], ['W', 600]], tap('e:L'), [['C', hello.length - 1]], tap('e:L'), [['C', hello.length - 2]], tap('e:R'), [['C', hello.length - 1]], tap('e:R'), [['C', hello.length], ['W', 300]],
        tap('e:S'), [['H', 'e:S', 1]], tap('e:L'), [['S', hello.length - 1, hello.length]], tap('e:L'), [['S', hello.length - 2, hello.length]], tap('e:L'), [['S', hello.length - 3, hello.length], ['W', 400]],
        tap('e:C'), [['F', L('Zkopírováno', 'Copied')], ['W', 900]], tap('abc'), [['L', 'letters'], ['N'], ['W', 1200]])},
    {t: L('Označení víc řádků', 'Selecting several lines'), d: L('V úpravách podrž Označit a táhni prstem – text se označuje do stran po písmenech a nahoru či dolů po celých řádcích.', 'In editing, hold Select and slide – the text is selected sideways by letters and up or down by whole lines.'),
      s: cat([['T', t3], ['C', t3c], ['W', 500]], tap('sym'), [['L', 'edit'], ['W', 600], ['D', 'e:S'], ['H', 'e:S', 1], ['W', 300],
        ['M', 'e:S@-0.6', 420], ['S', t3w, t3c], ['W', 300], ['M', 'e:S@-0.6,-1', 480], ['S', t3p, t3c], ['W', 500], ['M', 'e:S@-0.9,-1.6', 480], ['S', 0, t3c], ['W', 900], ['U'], ['H', 'e:S', 0], ['W', 400]],
        tap('e:C'), [['F', L('Zkopírováno', 'Copied')], ['W', 900]], tap('abc'), [['L', 'letters'], ['N'], ['W', 1000]])},
    {t: L('Začátek a konec', 'Start and end'), d: L('Se zapnutým Označit: Začátek označí k začátku řádku, dalším ťuknutím k začátku textu. Konec pak označení prodlouží do konce řádku a textu.', 'With Select on: Start selects to the start of the line, another tap to the start of the text. End then extends it to the end of the line and text.'),
      s: cat([['T', t4], ['C', t4c], ['W', 500]], tap('sym'), [['L', 'edit'], ['W', 500]], tap('e:S'), [['H', 'e:S', 1]],
        tap('e:H'), [['S', t4l, t4c], ['F', L('Začátek řádku', 'Start of line')], ['W', 700]], tap('e:H'), [['S', 0, t4c], ['F', L('Začátek textu', 'Start of text')], ['W', 800]],
        tap('e:E'), [['S', 0, t4e], ['F', L('Konec řádku', 'End of line')], ['W', 700]], tap('e:E'), [['S', 0], ['F', L('Konec textu', 'End of text')], ['W', 1200]],
        tap('abc'), [['L', 'letters'], ['N'], ['W', 900]])}
  ];

  var CALC = [
    {t: L('Číselník', 'Number pad'), d: L('Podrž [I] a vyber číselník – velká čísla jako při volání, v rozích další znaky (podržením).', 'Hold [I] and choose the number pad – big digits like a phone dialer, more characters in the corners (hold a key).'),
      s: cat([['T', L('Tel: ', 'Phone: ')], ['W', 500], ['D', 'sym'], ['W', 500], ['O', 'sym', ['123', '±×÷', 'π@']], ['M', 'pop0', 300], ['W', 400], ['U'], ['L', 'numpad'], ['W', 500]],
        tap('n:7'), [['T', L('Tel: 7', 'Phone: 7')]], tap('n:7'), [['T', L('Tel: 77', 'Phone: 77')]], tap('n:7'), [['T', L('Tel: 777', 'Phone: 777')]],
        tap('n:1'), [['T', L('Tel: 7771', 'Phone: 7771')]], tap('n:2'), [['T', L('Tel: 77712', 'Phone: 77712')]], tap('n:3'), [['T', L('Tel: 777123', 'Phone: 777123')], ['W', 500]],
        [['D', 'n:5'], ['W', 500], ['O', 'n:5', ['⁵', '⅕', '⅚', '⅝']], ['M', 'pop0', 250], ['W', 400], ['U'], ['T', L('Tel: 777123⁵', 'Phone: 777123⁵')], ['W', 1300]])},
    {t: L('Kalkulačka', 'Calculator'), d: L('Příklad se píše do lišty a výsledek se počítá hned. „→ Výsledek“ ho vloží do textu.', 'The expression goes into the bar and the result is calculated right away. "→ Result" inserts it into the text.'),
      s: cat([['T', L('Celkem: ', 'Total: ')], ['W', 500], ['D', 'sym'], ['W', 500], ['O', 'sym', ['123', '±×÷', 'π@']], ['M', 'pop1', 300], ['W', 400], ['U'], ['L', 'calc'], ['K', '', ''], ['W', 500]],
        tap('c:1'), [['K', '1', '1']], tap('c:2'), [['K', '12', '12']], tap('c:*'), [['K', '12×', '']], tap('c:3'), [['K', '12×3', '36'], ['W', 700]],
        tap('c:='), [['T', L('Celkem: 36', 'Total: 36')], ['W', 1600]])},
    {t: L('Procenta a závorky', 'Percent and brackets'), d: L('200 + 10 % = 220. Klávesa ( ) sama pozná, jestli závorku otevřít, nebo zavřít.', '200 + 10 % = 220. The ( ) key knows whether to open or close a bracket.'),
      s: cat([['L', 'calc'], ['K', '', ''], ['W', 500]], tap('c:2'), [['K', '2', '2']], tap('c:0'), [['K', '20', '20']], tap('c:0'), [['K', '200', '200']], tap('c:+'), [['K', '200+', '']],
        tap('c:1'), [['K', '200+1', '201']], tap('c:0'), [['K', '200+10', '210']], tap('c:%'), [['K', '200+10%', '220'], ['W', 1000]],
        tap('c:C'), [['K', '', '']], tap('c:P'), [['K', '(', '']], tap('c:2'), [['K', '(2', '']], tap('c:+'), [['K', '(2+', '']], tap('c:3'), [['K', '(2+3', '']], tap('c:P'), [['K', '(2+3)', '5']],
        tap('c:*'), [['K', '(2+3)×', '']], tap('c:4'), [['K', '(2+3)×4', '20'], ['W', 1600]])},
    {t: L('Vědecká kalkulačka', 'Scientific calculator'), d: L('f(x) přepne na funkce: odmocnina, mocniny, sin, cos, log… DEG / RAD přepíná stupně a radiány.', 'f(x) switches to functions: square root, powers, sin, cos, log… DEG / RAD switches degrees and radians.'),
      s: cat([['L', 'calc'], ['K', '', ''], ['W', 500]], tap('c:8'), [['K', '8', '8']], tap('c:1'), [['K', '81', '81'], ['W', 400]], tap('c:S'), [['L', 'sci'], ['K', '81', '81'], ['W', 600]],
        tap('s:r'), [['K', '√81', '9'], ['W', 900]], tap('s:q'), [['K', '(√81)²', '81'], ['W', 1000]], tap('c:N'), [['L', 'calc'], ['K', '(√81)²', '81'], ['W', 1400]])}
  ];

  var g = document.getElementById('gdemo'); if (g) new Demo(g, GEST, 4);
  var c = document.getElementById('cdemo'); if (c) new Demo(c, CALC, 5);
})();
