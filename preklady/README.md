# Překlady webu Swajp

Každý jazyk je jeden soubor `<kód>.po`. `msgid` = anglický odstavec ze stránek `en-US/*.html`, `msgstr` = překlad.
Značky jako `<strong>`, `<br>`, `<a href="…">` musí v překladu zůstat. Řádek `#, fuzzy` = nejisté, web to nepoužije.

**Oprava nebo nový jazyk:** nahraj `<kód>.po` do této složky (kód jazyk-ZEMĚ, např. `cs-CZ.po`). Web se po nahrání sestaví a zveřejní sám (GitHub Actions).
Texty, které se nepřekládají (názvy jazyků, e-mail…), jsou v `neprekladat.txt`.
