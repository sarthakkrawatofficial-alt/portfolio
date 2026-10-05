# Bhavy Nigam — Portfolio

A fast, static portfolio site (plain HTML, CSS and JS: no build step, no dependencies).

## Add your YouTube videos
Open `js/content.js` and paste links into the `VIDEOS` list:

```js
{ title: "Showreel 2026", category: "Showreel", url: "https://youtu.be/XXXXXXXXXXX", featured: true },
```

- Any YouTube link (or the bare 11-character ID) works, including Shorts.
- Add `vertical: true` for 9:16 reels, `featured: true` for a full-width card.
- Add or remove lines freely. Empty `url` shows a "coming soon" card.
- Contact details and the "available" badge are at the top of the same file.
- Photos: put images in an `images/` folder and list them in `PHOTOS`. The section appears automatically.

## Preview locally
Open `index.html` in a browser, or run `python3 -m http.server` and visit http://localhost:8000.

## Deploy for free
**GitHub Pages:** push to `main`, then Settings → Pages → Source: *GitHub Actions*. The included workflow publishes the site.
**Vercel:** import the repo, framework preset *Other*, no build command, output directory `.`.
