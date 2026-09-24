# swimmingbrain.dev

Personal site of Braian Plaku, built as a small Ubuntu desktop in plain HTML, CSS and JavaScript. No build step, no framework.

- `index.html` – the desktop: top panel, dock, activities overview and the windows (terminal, files, about, linkedin, resume, legal)
- `about.html` – plain text version of the same facts, for search engines and visitors without JavaScript
- `assets/css/desktop.css`, `assets/js/desktop.js` – shell, window manager, virtual filesystem, terminal
- `wogsi-game.html`, `jass-game.html` – older side projects that live here too

Run it locally with any static server, for example

    python -m http.server 8000

and open http://localhost:8000. The `github` folder in Files and `ls ~/projects/github` in the terminal fetch from api.github.com; everything else is static. The LinkedIn feed (Elfsight) only loads after you press the button in the LinkedIn window.

Colours follow the Yaru dark palette, fonts are Ubuntu and Ubuntu Mono.
