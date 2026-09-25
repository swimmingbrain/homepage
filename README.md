# swimmingbrain.dev

My personal site, built as a small Ubuntu desktop in plain HTML, CSS and JavaScript. No build step, no framework, no server.

## Pages

| file | what it is |
| --- | --- |
| `index.html` | the desktop: top panel, dock, activities overview and windows for the terminal, files, about, linkedin, the resume and the legal texts |
| `about.html` | the same facts as plain text, for search engines and browsers without JavaScript |
| `wogsi-game.html` | Wo gsi?, a Street View guessing game about Vorarlberg |

## Layout

```
assets/css   one stylesheet per page
assets/js    one script per page
assets/      images, icons and the resume
```

## Run it

Any static server works, for example

```
python -m http.server 8000
```

then open http://localhost:8000.

## Outside services

- The files window and `ls ~/projects/github` in the terminal read the public repo list from api.github.com.
- The linkedin feed (Elfsight) loads only after you press the button in that window.
- Wo gsi? finds random panoramas through the Street View metadata endpoint, shows them with the Maps JavaScript API, names the place through Nominatim and keeps the leaderboard in a jsonbin.io bin.
- Fonts come from Google Fonts, map tiles from OpenStreetMap.

## License

The code is MIT. The photos, the resume and the texts about me are not, please leave them where they are.
