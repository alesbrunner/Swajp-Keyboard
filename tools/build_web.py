#!/usr/bin/env python3
"""Web Swajp: překlady stránek (gettext .po) a sestavení webu.

Šablona stránek:  en-US/*.html                  (anglický originál, jediné místo, kde se mění vzhled a obsah)
Překlady:         preklady/<jazyk>.po         (msgid = anglický odstavec nebo nadpis, msgstr = překlad)

  python3 tools/build_web.py extract           – texty z en-US/*.html → preklady/web.pot, doplní je do všech .po
  python3 tools/build_web.py build <složka>    – sestaví celý web do složky (GitHub Actions: _site)
  python3 tools/build_web.py check [jazyk]     – kontrola (HTML značky, odkazy, chybějící, fuzzy)
  python3 tools/build_web.py todo <jazyk>      – nepřeložené a „fuzzy“ odstavce
  python3 tools/build_web.py new <jazyk>       – nový jazyk (pak přidat do NAMES níže, pokud tam ještě není)

Nový jazyk nebo oprava = nahrát <jazyk>.po do složky preklady/ – web se po nahrání sestaví sám (GitHub Actions).
Odstavec se překládá celý včetně značek <strong>, <a href="…">, <br>, které musí v překladu zůstat.
"""
import re, sys, os, glob, json, shutil, difflib

HERE = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.dirname(HERE)
PO_DIR = os.path.join(SITE, 'preklady')
PAGES = ['index.html', 'languages.html', 'privacy.html', 'licenses.html']
# kód → (zkratka v nabídce, název v jazyce)
NAMES = {'cs-CZ': ('CZ', 'Čeština'), 'en-US': ('EN', 'English'), 'de-DE': ('DE', 'Deutsch'), 'fr-FR': ('FR', 'Français'), 'es-ES': ('ES', 'Español'),
         'it-IT': ('IT', 'Italiano'), 'pl-PL': ('PL', 'Polski'), 'sk-SK': ('SK', 'Slovenčina'), 'pt-PT': ('PT', 'Português'), 'nl-NL': ('NL', 'Nederlands'),
         'sv-SE': ('SV', 'Svenska'), 'da-DK': ('DA', 'Dansk'), 'nb-NO': ('NO', 'Norsk'), 'fi-FI': ('FI', 'Suomi'), 'hu-HU': ('HU', 'Magyar'),
         'ro-RO': ('RO', 'Română'), 'hr-HR': ('HR', 'Hrvatski'), 'sl-SI': ('SL', 'Slovenščina'), 'lt-LT': ('LT', 'Lietuvių'), 'lv-LV': ('LV', 'Latviešu'),
         'ca-ES': ('CA', 'Català'), 'vi-VN': ('VI', 'Tiếng Việt'), 'hi-IN': ('HI', 'हिन्दी'), 'tl-PH': ('TL', 'Tagalog'), 'sr-RS': ('SR', 'Srpski'),
         'sq-AL': ('SQ', 'Shqip'), 'et-EE': ('ET', 'Eesti'), 'is-IS': ('IS', 'Íslenska'), 'eu-ES': ('EU', 'Euskara'), 'gl-ES': ('GL', 'Galego'),
         'tr-TR': ('TR', 'Türkçe'), 'id-ID': ('ID', 'Bahasa Indonesia'), 'ms-MY': ('MS', 'Bahasa Melayu'), 'uk-UA': ('UK', 'Українська')}

# ---------- rozdělení stránky na odstavce ----------
INLINE = {'a', 'strong', 'em', 'b', 'i', 'br', 'span', 'code', 'small', 'sup', 'sub', 'u', 'mark', 'abbr', 'kbd', 's', 'wbr'}
PROTECT = re.compile(r'<script\b.*?</script>|<style\b.*?</style>|<svg\b.*?</svg>|<!--.*?-->|<link\b[^>]*?href="data:[^"]*"[^>]*>'
                     r'|<div class="lngs">.*?</div></div>|<pre\b.*?</pre>', re.S)
TOK = re.compile(r'<(/?)([a-zA-Z][a-zA-Z0-9]*)\b[^>]*?(/?)>|<![^>]*>|[^<]+|<', re.S)
ATTR = re.compile(r'\b(title|aria-label|alt|placeholder)="([^"]*)"')
META = re.compile(r'(<meta\s+name="description"\s+content=")([^"]*)(")')
# texty, které se nepřekládají (názvy jazyků, e-mail, rok…) – jsou v preklady/neprekladat.txt
def keep_set():
    f = os.path.join(PO_DIR, 'neprekladat.txt')
    return {l.rstrip('\n') for l in open(f, encoding='utf-8') if l.strip() and not l.startswith('#')} if os.path.exists(f) else set()

def norm(t): return re.sub(r'\s+', ' ', t).strip()
def plain(t): return norm(re.sub(r'<[^>]+>', ' ', t))
def has_text(t): return bool(re.search(r'[^\W\d_]', plain(t)))

def _tokens(h, a, b):
    out = []
    for m in TOK.finditer(h, a, b):
        name = (m.group(2) or '').lower()
        kind = 'text' if not m.group(0).startswith('<') or m.group(0) == '<' else ('inline' if name in INLINE else 'block')
        out.append((kind, m.start(), m.end(), name, m.group(1) == '/', m.group(3) == '/' or name in ('br', 'wbr')))
    return out

def _split(h, toks):
    """Úsek textu a inline značek → odstavce (start, end). Obal jediné značky se odloupne,
    několik značek bez volného textu (menu, štítky) se rozdělí na jednotlivé."""
    def unmatched_open(i):
        name = toks[i][3]; d = 0
        for t in toks[i:]:
            if t[0] == 'inline' and t[3] == name and not t[5]: d += -1 if t[4] else 1
            if d == 0: return False
        return True
    def unmatched_close(i):
        name = toks[i][3]; d = 0
        for t in reversed(toks[:i + 1]):
            if t[0] == 'inline' and t[3] == name and not t[5]: d += 1 if t[4] else -1
            if d == 0: return False
        return True
    changed = True
    while changed and toks:                                            # okraje: mezery a nepárové značky (např. kolem ikony <svg>)
        changed = False
        if toks[0][0] == 'text' and not h[toks[0][1]:toks[0][2]].strip(): toks = toks[1:]; changed = True
        elif toks[0][0] == 'inline' and toks[0][4]: toks = toks[1:]; changed = True
        elif toks[0][0] == 'inline' and not toks[0][5] and unmatched_open(0): toks = toks[1:]; changed = True
        if not toks: break
        if toks[-1][0] == 'text' and not h[toks[-1][1]:toks[-1][2]].strip(): toks = toks[:-1]; changed = True
        elif toks[-1][0] == 'inline' and not toks[-1][4] and not toks[-1][5]: toks = toks[:-1]; changed = True
        elif toks[-1][0] == 'inline' and toks[-1][4] and unmatched_close(len(toks) - 1): toks = toks[:-1]; changed = True
    if not toks: return []
    # prvky na nejvyšší úrovni
    top = []; depth = 0; start = None; bare = False
    for i, t in enumerate(toks):
        kind, s, e, name, close, selfc = t
        if kind == 'text':
            if depth == 0 and h[s:e].strip(): bare = True
            continue
        if selfc:
            if depth == 0: top.append((i, i))
            continue
        if not close:
            if depth == 0: start = i
            depth += 1
        else:
            depth -= 1
            if depth == 0 and start is not None: top.append((start, i)); start = None
            if depth < 0: depth = 0; bare = True
    if depth != 0: bare = True
    if not bare and len(top) == 1 and top[0] == (0, len(toks) - 1) and not toks[0][5]:
        return _split(h, toks[1:-1])                                   # <a href…>text</a> → text
    if not bare and len(top) > 1 and all(not toks[a][5] for a, b in top):
        out = []
        for a, b in top: out += _split(h, toks[a:b + 1])
        return out
    s, e = toks[0][1], toks[-1][2]
    return [(s, e)] if has_text(h[s:e]) else []

_KEEP = None
def _textsegs(h, run):
    """Odstavce z úseku; „Název jazyka<br><small>popis</small>“ se rozdělí, když se název nepřekládá."""
    global _KEEP
    if _KEEP is None: _KEEP = keep_set()
    out = []
    for s, e in _split(h, run):
        m = re.search(r'<br\s*/?>', h[s:e])
        if m and plain(h[s:s + m.start()]) in _KEEP:
            out += _split(h, _tokens(h, s + m.end(), e))
        else:
            out.append((s, e))
    return [(s, e, 'text') for s, e in out]

def segments(html):
    """Vrací seznam (start, end, druh) – druh 'text' (odstavec) nebo 'attr'."""
    out = []; pos = 0
    parts = []
    for m in PROTECT.finditer(html): parts.append((pos, m.start())); pos = m.end()
    parts.append((pos, len(html)))
    for a, b in parts:
        toks = _tokens(html, a, b); run = []
        for t in toks:
            if t[0] == 'block':
                if run: out += _textsegs(html, run); run = []
                tag = html[t[1]:t[2]]
                for m in ATTR.finditer(tag):
                    if has_text(m.group(2)): out.append((t[1] + m.start(2), t[1] + m.end(2), 'attr'))
                for m in META.finditer(tag):
                    out.append((t[1] + m.start(2), t[1] + m.end(2), 'attr'))
            else:
                if t[0] == 'inline':
                    tag = html[t[1]:t[2]]
                    for m in ATTR.finditer(tag):
                        if has_text(m.group(2)): out.append((t[1] + m.start(2), t[1] + m.end(2), 'attr'))
                run.append(t)
        if run: out += _textsegs(html, run)
    return sorted(out)

def page_texts(html, keep):
    return [norm(html[s:e]) for s, e, k in segments(html) if plain(html[s:e]) not in keep and norm(html[s:e]) not in keep]

def translate(html, d, keep):
    res = []; pos = 0
    for s, e, k in segments(html):
        t = norm(html[s:e])
        if t in keep or plain(t) in keep or t not in d: continue
        res.append(html[pos:s]); res.append(d[t] if k == 'text' else d[t].replace('"', '&quot;')); pos = e
    res.append(html[pos:])
    return ''.join(res)

# ---------- PO ----------
def po_esc(s): return s.replace('\\', '\\\\').replace('"', '\\"').replace('\t', '\\t').replace('\n', '\\n')
def po_unesc(s):
    out = []; i = 0
    while i < len(s):
        c = s[i]
        if c == '\\' and i + 1 < len(s): out.append({'n': '\n', 't': '\t', '"': '"', '\\': '\\'}.get(s[i + 1], s[i + 1])); i += 2; continue
        out.append(c); i += 1
    return ''.join(out)
def po_str(kw, s):
    if len(s) > 70: return f'{kw} ""\n"{po_esc(s)}"\n'
    return f'{kw} "{po_esc(s)}"\n'
def read_po(path):
    entries = {}; cur = None; last = None
    def flush():
        nonlocal cur
        if cur and cur['id']: entries[cur['id']] = cur
        cur = None
    for raw in open(path, encoding='utf-8'):
        l = raw.rstrip('\n')
        if not l.strip(): flush(); continue
        if l.startswith('#~'): continue
        if cur is None: cur = {'id': None, 'str': '', 'fuzzy': False, 'tcom': []}
        if l.startswith('#,'): cur['fuzzy'] = cur['fuzzy'] or 'fuzzy' in l
        elif l.startswith('# ') or l == '#': cur['tcom'].append(l[2:])
        elif l.startswith('#'): pass
        elif l.startswith('msgid '):
            if cur['id'] is not None: flush(); cur = {'id': None, 'str': '', 'fuzzy': False, 'tcom': []}
            cur['id'] = po_unesc(l[7:-1]); last = 'id'
        elif l.startswith('msgstr '): cur['str'] = po_unesc(l[8:-1]); last = 'str'
        elif l.startswith('"'):
            if last == 'id': cur['id'] += po_unesc(l[1:-1])
            else: cur['str'] += po_unesc(l[1:-1])
    flush()
    return entries

INTRO = """# Překlad webu Swajp – {name}.  Translation of the Swajp website – {name}.
#
# msgid = anglický originál (celý odstavec / nadpis / tlačítko), msgstr = překlad.
# msgid = English original (a whole paragraph / heading / button), msgstr = translation.
#  • Značky jako <strong>, <em>, <br>, <a href="…">…</a>, <span …> musí v překladu zůstat (text uvnitř se překládá).
#    Keep HTML tags such as <strong>, <br>, <a href="…">…</a>; translate the text inside them.
#  • „#, fuzzy“ = nejisté, web to nepoužije (ukáže angličtinu), dokud řádek „#, fuzzy“ nesmažeš.
#  • Upravovat jde v programu Poedit (zdarma) nebo v textovém editoru. Po nahrání do preklady/ se web sestaví sám.
msgid ""
msgstr ""
"Language: {lang}\\n"
"MIME-Version: 1.0\\n"
"Content-Type: text/plain; charset=UTF-8\\n"
"Content-Transfer-Encoding: 8bit\\n"

"""
def template():
    keep = keep_set(); items = []; seen = {}
    for p in PAGES:
        html = open(f'{SITE}/en-US/{p}', encoding='utf-8').read()
        for s, e, k in segments(html):
            t = norm(html[s:e])
            if not t or t in keep or plain(t) in keep: continue
            where = p.replace('.html', '') + (' (atribut / attribute)' if k == 'attr' else '')
            if t in seen:
                if where not in seen[t]['where']: seen[t]['where'].append(where)
                continue
            seen[t] = {'id': t, 'where': [where]}; items.append(seen[t])
    return items
def write_po(path, lang, items, entries, name):
    s = INTRO.format(name=name, lang=lang)
    for it in items:
        e = entries.get(it['id'])
        if e and e.get('tcom'): s += ''.join(f'# {c}\n' for c in e['tcom'])
        s += '#: ' + ' '.join(it['where']) + '\n'
        if e and e['fuzzy']: s += '#, fuzzy\n'
        s += po_str('msgid', it['id']) + po_str('msgstr', e['str'] if e else '') + '\n'
    open(path, 'w', encoding='utf-8').write(s)
def langs(): return sorted(os.path.basename(f)[:-3] for f in glob.glob(PO_DIR + '/*.po'))
def extract():
    items = template(); ids = {i['id'] for i in items}
    write_po(f'{PO_DIR}/web.pot', 'xx', items, {}, 'šablona / template')
    for lang in langs():
        entries = read_po(f'{PO_DIR}/{lang}.po')
        old = {k: v for k, v in entries.items() if k not in ids and v['str']}
        for it in items:
            if it['id'] in entries: continue
            b = difflib.get_close_matches(it['id'], list(old), n=1, cutoff=0.8)
            if b: entries[it['id']] = dict(old[b[0]], id=it['id'], fuzzy=True)
        write_po(f'{PO_DIR}/{lang}.po', lang, items, entries, NAMES.get(lang, (lang, lang))[1])
    print(len(items), 'textů,', len(langs()), 'jazyků')
def new(lang):
    write_po(f'{PO_DIR}/{lang}.po', lang, template(), {}, NAMES.get(lang, (lang, lang))[1]); print('vytvořeno', lang + '.po')

TAGS = re.compile(r'<(/?[a-zA-Z0-9]+)|href="([^"]*)"')
def problems(entries, items):
    out = []
    for it in items:
        e = entries.get(it['id'])
        if not e or not e['str'] or e['fuzzy']: continue
        a = sorted(m.group(0) for m in TAGS.finditer(it['id'])); b = sorted(m.group(0) for m in TAGS.finditer(e['str']))
        if a != b: out.append((it['id'], 'HTML značky nebo odkazy nesedí: ' + ' '.join(sorted(set(a) ^ set(b)))[:120]))
    return out
def check(only=None):
    items = template(); ok = True
    for lang in ([only] if only else langs()):
        entries = read_po(f'{PO_DIR}/{lang}.po')
        done = sum(1 for i in items if entries.get(i['id']) and entries[i['id']]['str'] and not entries[i['id']]['fuzzy'])
        fz = sum(1 for i in items if entries.get(i['id']) and entries[i['id']]['fuzzy'])
        pr = problems(entries, items)
        print(f'{lang}: přeloženo {done}/{len(items)}, fuzzy {fz}, chyb {len(pr)}')
        for k, m in pr[:20]: print('   ', m, '|', k[:80])
        ok = ok and not pr
    return ok
def todo(lang):
    entries = read_po(f'{PO_DIR}/{lang}.po')
    for it in template():
        e = entries.get(it['id'])
        if not e or not e['str'] or e['fuzzy']: print(('FUZZY ' if e and e['fuzzy'] else 'NEW   ') + it['id'][:160])

# ---------- přepínač jazyků ----------
GLOBE = ('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="12" cy="12" r="9"/>'
         '<path d="M3 12h18M12 3c2.6 2.6 3.9 5.6 3.9 9s-1.3 6.4-3.9 9M12 3c-2.6 2.6-3.9 5.6-3.9 9s1.3 6.4 3.9 9"/></svg>')
CHEV = '<svg class="chev" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4.5l3 3 3-3"/></svg>'
def switcher(cur, page, ls):
    item = lambda c: (f'<a class="{"on" if c == cur else ""}" href="../{c}/{page}" lang="{c}" '
                      f'onclick="try{{localStorage.lang=\'{c}\'}}catch(e){{}}swLang(this)"><b>{NAMES[c][0]}</b>{NAMES[c][1]}</a>')
    items = ''.join(item(c) for c in sorted(ls, key=lambda c: NAMES[c][0]))
    return (f'<div class="lngs"><button class="lcap" type="button" aria-haspopup="true" aria-label="{NAMES[cur][1]}" '
            f'onclick="this.parentNode.classList.toggle(\'open\');event.stopPropagation()">{GLOBE}<span>{NAMES[cur][0]}</span>{CHEV}</button>'
            f'<div class="lmenu">{items}</div></div>')
SW = re.compile(r'<div class="lngs">.*?</div></div>', re.S)
CLOSE = "<script>document.addEventListener('click',function(){var o=document.querySelector('.lngs.open');if(o)o.classList.remove('open')});</script>"
HREFLANG = re.compile(r'(<link rel="alternate" hreflang="[^"]*" href="[^"]*">\s*)+')

def build(out):
    keep = keep_set(); items = template()
    ls = ['en-US'] + [l for l in langs() if l in NAMES and l != 'en-US']
    report = []
    if os.path.abspath(out) != os.path.abspath(SITE):
        if os.path.exists(out): shutil.rmtree(out)
        skip = set(NAMES) | {c.split('-')[0] for c in NAMES} | {'preklady', 'tools', '.github', '.git', os.path.basename(os.path.abspath(out))}
        shutil.copytree(SITE, out, ignore=lambda d, names: [n for n in names if os.path.abspath(d) == SITE and n in skip])
    for lang in ls:
        d = {}
        if lang != 'en-US':
            entries = read_po(f'{PO_DIR}/{lang}.po'); bad = {k for k, _ in problems(entries, items)}
            d = {k: v['str'] for k, v in entries.items() if v['str'] and not v['fuzzy'] and k not in bad}
            report.append(f'{lang}: {sum(1 for i in items if i["id"] in d)}/{len(items)}')
        for page in PAGES:
            html = open(f'{SITE}/en-US/{page}', encoding='utf-8').read()
            html = translate(html, d, keep)
            html = re.sub(r'<html lang="[^"]*"', f'<html lang="{lang}"', html, count=1)
            alt = ''.join(f'<link rel="alternate" hreflang="{c}" href="../{c}/{page}">' for c in ls)
            html = HREFLANG.sub(alt + '\n', html, count=1) if HREFLANG.search(html) else html.replace('</title>', '</title>' + alt, 1)
            html = SW.sub(lambda m: switcher(lang, page, ls), html, count=1)
            if CLOSE not in html: html = html.replace('</body>', CLOSE + '</body>')
            os.makedirs(f'{out}/{lang}', exist_ok=True)
            open(f'{out}/{lang}/{page}', 'w', encoding='utf-8').write(html)
    # úvodní stránka: přesměrování podle jazyka prohlížeče
    idx = f'{out}/index.html'
    s = open(f'{SITE}/index.html', encoding='utf-8').read()
    # jazyk prohlížeče „cs-CZ“ i jen „cs“ → složka cs-CZ; dřívější uložená volba „cs“ taky
    js = ('(function(){var L=' + json.dumps(ls) + ',l="en-US";function f(c){if(!c)return null;c=c.replace("_","-");'
          'for(var i=0;i<L.length;i++)if(L[i].toLowerCase()===c.toLowerCase())return L[i];var b=c.toLowerCase().split("-")[0];'
          'if(b==="no"||b==="nn")b="nb";if(b==="in")b="id";if(b==="fil")b="tl";'
          'for(var j=0;j<L.length;j++)if(L[j].split("-")[0]===b)return L[j];if(b==="sk")return "cs-CZ";return null}'
          'try{var s=f(localStorage.getItem("lang"));if(s)l=s;else{var a=navigator.languages&&navigator.languages.length?navigator.languages:[navigator.language||""];'
          'for(var i=0;i<a.length;i++){var c=f(a[i]);if(c){l=c;break}}}}catch(e){}location.replace(l+"/")})();')
    s = re.sub(r'<script>\s*\(function\(\)\{.*?\}\)\(\);\s*</script>', '<script>\n' + js + '\n</script>', s, count=1, flags=re.S)
    links = ''.join(f'<a href="{c}/" onclick="try{{localStorage.setItem(\'lang\',\'{c}\')}}catch(e){{}}">{NAMES[c][1]}</a>' for c in sorted(ls, key=lambda c: NAMES[c][1]))
    s = re.sub(r'<div class="b">.*?</div>', '<div class="b">' + links + '</div>', s, count=1, flags=re.S)
    open(idx, 'w', encoding='utf-8').write(s)
    # staré adresy (…/cs/index.html) přesměrovat na nové (…/cs-CZ/index.html), ať fungují dřív sdílené odkazy
    for lang in ls:
        old = lang.split('-')[0]
        if old == lang or old in ls: continue
        os.makedirs(f'{out}/{old}', exist_ok=True)
        for page in PAGES:
            open(f'{out}/{old}/{page}', 'w', encoding='utf-8').write(
                f'<!DOCTYPE html><html><head><meta charset="utf-8"><link rel="canonical" href="../{lang}/{page}">'
                f'<meta http-equiv="refresh" content="0; url=../{lang}/{page}"></head><body><a href="../{lang}/{page}">{NAMES[lang][1]}</a></body></html>')
    print('jazyky webu:', ' '.join(ls)); print('  '.join(report))

if __name__ == '__main__':
    cmd = sys.argv[1] if len(sys.argv) > 1 else ''
    if cmd == 'extract': extract()
    elif cmd == 'build': build(sys.argv[2] if len(sys.argv) > 2 else '_site')
    elif cmd == 'check': sys.exit(0 if check(sys.argv[2] if len(sys.argv) > 2 else None) else 1)
    elif cmd == 'todo': todo(sys.argv[2])
    elif cmd == 'new': new(sys.argv[2])
    else: print(__doc__)
