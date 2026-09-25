# swimmingbrain.dev

My personal site, built as a small Ubuntu desktop in plain HTML, CSS and JavaScript. No build step, no framework, no server.

## Pages

| file | what it is |
| --- | --- |
| `src/index.html` | the desktop: top panel, dock, activities overview and windows for the terminal, files, about, linkedin, the resume and the legal texts |
| `src/about.html` | the same facts as plain text, for search engines and browsers without JavaScript |
| `src/wogsi-game.html` | Wo gsi?, a Street View guessing game about Vorarlberg |

## Layout

```
src/          the site, deployed as it is by .github/workflows/deploy.yml
  css/        one stylesheet per page
  js/         one script per page
  img/        pictures and icons
api/          the wo gsi leaderboard: one python file and its compose file
```

## Run it

Any static server works, for example

```
python -m http.server 8000 -d src
```

then open http://localhost:8000. Pushes to main deploy `src/` to GitHub Pages.

## Outside services

- The files window and `ls ~/projects/github` in the terminal read the public repo list from api.github.com.
- The linkedin feed (Elfsight) loads only after you press the button in that window.
- Wo gsi? finds random panoramas through the Street View metadata endpoint, shows them with the Maps JavaScript API and names the place through Nominatim. Scores go to `api/server.py`, which runs in docker on my jetson behind a cloudflared tunnel as wogsi.swimmingbrain.dev. It keeps one entry per name, checks the numbers and rate limits by ip, so no key sits in the browser.
- Fonts come from Google Fonts, map tiles from OpenStreetMap.

## License

The code is MIT. The photos, the resume and the texts about me are not, please leave them where they are.
