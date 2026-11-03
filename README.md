# M. A. Trading Corporation Agencies Ltd. — demo website

A static, mobile-first demo site for a customs C&F agent in Agrabad, Chattogram (est. 1985), and its sister concern, Alliance Transport International.
It uses plain HTML, CSS and JavaScript, with no build step and no dependencies.

## Pages

| File | What it is |
|---|---|
| `index.html` | Home page. Has an animated port scene (a crane loads a container onto a truck, with a matching "consignment status" card), a 6-step clearance process, an interactive Bangladesh coverage map, a document-checklist tool and an FAQ. |
| `services.html` | Details for the six services, plus the process and the industries served. |
| `coverage.html` | The interactive map, the gateway cards and the delivery network. |
| `transport.html` | Alliance Transport International: vehicle types, how a delivery works, and routes. |
| `about.html` | Company story, milestones, a facts table and values. |
| `contact.html` | Office details, a Google map, and a quote form that sends by WhatsApp or email. |
| `404.html` | "Page not found" page. Vercel serves it automatically. |

Assets: `assets/css/styles.css`, `assets/js/main.js` (all interactions), `assets/js/port-scene.js` (hero animation) and `assets/js/bd-map.js` (map). The map outline comes from Natural Earth, which is public domain.

## Deploy on Vercel

1. Push this repo to GitHub. This is already done if you're reading it there.
2. On vercel.com, click **Add New → Project**, import the repo, and set **Framework preset: Other**. Leave the build command and output directory empty.
3. Click **Deploy**. You will get a `*.vercel.app` URL to show the client.

To preview locally, run `python3 -m http.server` in this folder and open http://localhost:8000.

## Before showing the client: replace placeholders

Use your editor's search and replace across the whole project:

| Find | Replace with |
|---|---|
| `+880 1XXX-XXXXXX` / `+8801XXXXXXXXX` | Mobile 1, as displayed / as a `tel:` number (from their Odoo contact page) |
| `+880 1YYY-YYYYYY` / `+8801YYYYYYYYY` | Mobile 2 |
| `8801XXXXXXXXX` | WhatsApp number, digits only. It also appears in `assets/js/main.js` → `SITE.whatsapp`. |
| `info@matrading-bd.com` | The email address to show. This is the *proposed* domain email. Until the domain exists, use `matradingctg@yahoo.com` so the form works. |
| `Sat – Thu · 9:30 am – 6:30 pm` | Their real office hours |
| `Dhaka, Bangladesh` (Dhaka office card and footer) | The Dhaka office address |

## Facts to confirm with the client

The research confirmed these: the company name, C&F agent, Chattogram, since 1985, 74 SK Mujib Road in Agrabad, a Dhaka office, and Alliance Transport International.
The items below are reasonable, standard industry content, but they are **not verified**. Check them before launch:

- The air-cargo work at Shah Amanat Airport and the Dhaka (HSIA) coordination.
- That Mongla and Benapole clearance is available "on request".
- The vehicle types Alliance Transport actually runs (low-bed, covered van and so on).
- The postcode 4100 for Agrabad.
- The milestone wording on the About page. The years of Alliance Transport and the Dhaka office are unknown, so they are written without dates.
- The document checklist is marked on the page as indicative. Have the client review it.

## At launch (after the client approves)

The demo is deliberately hidden from search engines, so the client's name doesn't compete with their current listing before they agree. To make the site public:

1. Remove `<meta name="robots" content="noindex, nofollow">` from every `.html` file.
2. Remove the `X-Robots-Tag` header from `vercel.json`.
3. Connect the client's domain in Vercel (Project → Settings → Domains). Then make `og:image` an absolute URL, for example `https://matrading-bd.com/assets/img/og-image.png`.
4. Optional: wire the form to a form backend such as Formspree or Web3Forms, so enquiries arrive by email without the visitor's mail app.
