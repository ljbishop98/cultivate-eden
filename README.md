# Cultivate Eden — Website

A static site for the Cultivate Eden ministry: home page, about/message, Cultivate Nights, the Shabbat Series, contact, and a blog you can write and publish yourself from `/admin`.

No build step, no framework — plain HTML/CSS/JS, plus a small content-management panel (Decap CMS) for the blog.

## File structure

```
index.html               Home page (pinned/stacking hero)
about.html                Full founding message
cultivate-nights.html     Cultivate Nights gathering info + sign-up
shabbat-series.html       Shabbat Series info + sign-up
blog.html                 Blog list (loads posts dynamically — see below)
post.html                 Single blog post template (loads dynamically)
contact.html              Contact info
styles.css                All shared styles

admin/
  index.html               The CMS itself — open yoursite.com/admin to write posts
  config.yml               Tells the CMS where posts live and what fields they have

content/
  posts/                   One markdown file per blog post — the CMS writes here

assets/
  blog.js                  Fetches posts from GitHub and renders blog.html / post.html
  site-config.js           Your GitHub username/repo — the blog reads posts from here
```

## How the blog works (no build step)

Blog posts are markdown files in `content/posts/`. `blog.html` and `post.html` fetch
that folder straight from GitHub's public API at page-load time and render it in the
browser — so there's nothing to "rebuild" when you publish a post. Netlify just serves
the static files, and the blog pages do the rest.

This means **`assets/site-config.js` must have your real GitHub username and repo name**
before the blog will show anything. It's a placeholder right now — fill it in during
setup (see below).

## Deploying

1. **Push this folder to a GitHub repository.** (We did this together — see the repo
   at the URL noted during setup.)
2. **Connect the repo to Netlify** → New site from Git → pick the repo → leave the
   build command blank and set the publish directory to `.` (this is already set in
   `netlify.toml`, so Netlify should pick it up automatically).
3. **Turn on Identity** (Site settings → Identity → Enable Identity). This is what lets
   you log into `/admin` — no separate account system to manage.
4. **Turn on Git Gateway** (Site settings → Identity → Services → Git Gateway → Enable).
   This is what lets the CMS commit new posts to your GitHub repo on your behalf.
5. **Invite yourself as a user** (Site settings → Identity → Invite users → your email).
   You'll get an email with a link to set a password.
6. **Update `assets/site-config.js`** with your GitHub username and repo name, commit,
   and push (or edit it directly on GitHub's website — Edit → Commit).

Once that's done, `yourdomain.com/admin` is your blog editor.

## Writing a post

1. Go to `yourdomain.com/admin` and log in.
2. Click **New Blog Posts**.
3. Fill in the title, date, an optional short excerpt, and the body (this is a rich
   text / markdown editor — no HTML needed).
4. Click **Publish**. It commits a new markdown file to `content/posts/` in your GitHub
   repo, Netlify picks up the change, and the post appears on `/blog.html` — usually
   within a minute or two.

## Things to update by hand

A few spots were left as placeholders since they depend on details only you have:

- **Email address** — `hello@cultivateeden.org` appears on `contact.html`,
  `cultivate-nights.html`, and `shabbat-series.html`. Replace with your real address
  (find-and-replace across files, or ask Claude to do it).
- **"Spots available" counter** — on `shabbat-series.html`, inside the
  `.spots-badge` element. Update by hand as people sign up.
- **Cultivate Nights / Shabbat Series details** — date, time, and location are marked
  "coming soon" in both pages' `.info-box` sections.
- **Hero background videos** — the rotating clips on the home page are listed in the
  `heroClips` array near the bottom of `index.html`, if you ever want to swap them.

## Local preview

Since the blog fetches from GitHub over the network, opening `index.html` directly by
double-clicking it works fine for every page except the blog (browsers block that kind
of fetch from a `file://` page). To preview the blog locally, run a tiny local server
from this folder, e.g. `python3 -m http.server 8000`, then visit
`http://localhost:8000`.
