# Johora Akter Polin, personal website

Live at **https://japolin.org** (once the domain is connected; until then
https://roboworld314.github.io/japolin.org/).

A single-page static site (plain HTML, CSS, and JavaScript, no build step), hosted on GitHub Pages.

```
index.html                         page content
assets/css/style.css               styles
assets/js/news.js                  the Recent news list (edit this to add news)
assets/js/main.js                  interactions: news, project tabs, charts, figure viewer
assets/js/chat.js                  the chat assistant (answers and message-to-email; Web3Forms key at the top)
assets/js/drive.js                 the animated self-driving car strip at the bottom of the hero
assets/img/profile.jpg             round profile photo
assets/img/research/               figures cropped from the papers
assets/news/                       photos and videos for news items
assets/Johora_Akter_Polin_CV.pdf   CV linked from the page
.nojekyll                          tells GitHub Pages to serve files as-is
CNAME                              the custom domain (added once japolin.org is connected)
```

## Preview locally

Run `python3 -m http.server` in this folder and visit http://localhost:8000.

## Change the profile photo

Replace `assets/img/profile.jpg` with a square photo (at least 600 × 600 px).

## Add a news item

1. Put any photo or video in `assets/news/`, for example `assets/news/2026-12-photo.jpg`.
2. Open `assets/js/news.js` and add an entry at the top of the list:

```js
{
  date: "Dec 2026",
  title: "What happened, in one line",
  text: "A sentence or two of detail.",
  image: "assets/news/2026-12-photo.jpg",          // optional
  video: "assets/news/demo.mp4",                    // optional, or a YouTube link
  alt: "Short description of the photo or video",  // optional
  link: { href: "https://...", label: "Read more" } // optional
},
```

The newest two items show; older ones appear under "Show all news".
Keep video files under about 25 MB, or upload to YouTube and paste the link.

## Update the CV

Rebuild the CV PDF, then copy it over `assets/Johora_Akter_Polin_CV.pdf`.

## Publish changes

After editing, commit and push to `main`; GitHub Pages updates the site within a minute or two:

```
git add -A
git commit -m "Describe the change"
git push
```

If a browser keeps showing an old version of the styles or news, raise the `?v=` number
on the `style.css`, `news.js`, `main.js`, and `drive.js` links near the top and bottom of `index.html`.

## Custom domain (japolin.org)

1. Register `japolin.org` with a domain registrar.
2. At the registrar, add these DNS records:
   - `A` records for `@`: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - `AAAA` records for `@`: `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`
   - `CNAME` record for `www`: `roboworld314.github.io`
3. Add a file named `CNAME` containing `japolin.org`, push it, and confirm the domain under
   **Settings → Pages → Custom domain**. Once the certificate is issued, tick **Enforce HTTPS**.
