// Cultivate Eden — blog rendering
//
// Posts live as markdown files in content/posts/ (managed via /admin). These
// functions fetch that folder straight from GitHub's public API and render it
// client-side — no build step, no server. Used by blog.html and post.html.

(function () {
  "use strict";

  var cfg = window.CULTIVATE_EDEN_REPO || {};
  var API_BASE = "https://api.github.com/repos/" + cfg.owner + "/" + cfg.repo;
  var RAW_BASE = "https://raw.githubusercontent.com/" + cfg.owner + "/" + cfg.repo + "/" + (cfg.branch || "main");

  function isConfigured() {
    return cfg.owner && cfg.owner !== "YOUR-GITHUB-USERNAME" && cfg.repo;
  }

  // Minimal YAML front-matter parser — handles the flat key: value pairs Decap
  // CMS writes (strings, quoted strings, and plain dates). Good enough for our
  // fixed set of fields (title, date, excerpt) without pulling in a YAML library.
  function parseFrontMatter(raw) {
    var match = /^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/.exec(raw);
    if (!match) return { data: {}, body: raw };

    var data = {};
    match[1].split("\n").forEach(function (line) {
      var idx = line.indexOf(":");
      if (idx === -1) return;
      var key = line.slice(0, idx).trim();
      var value = line.slice(idx + 1).trim();
      value = value.replace(/^["']|["']$/g, "");
      if (key) data[key] = value;
    });

    return { data: data, body: match[2].trim() };
  }

  function formatDate(dateStr) {
    if (!dateStr) return "";
    var d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  }

  function slugFromFilename(filename) {
    return filename.replace(/\.md$/, "");
  }

  function excerptFromBody(body, len) {
    var text = body.replace(/[#*_>`\-]/g, "").replace(/\s+/g, " ").trim();
    return text.length > len ? text.slice(0, len).trim() + "…" : text;
  }

  function renderMarkdown(md) {
    if (window.marked) return window.marked.parse(md);
    // Fallback if the markdown library hasn't loaded: preserve paragraphs at least.
    return md
      .split(/\n{2,}/)
      .map(function (p) { return "<p>" + p.replace(/\n/g, "<br>") + "</p>"; })
      .join("");
  }

  // Fetches every post in content/posts, parsed and sorted newest-first.
  function fetchAllPosts() {
    if (!isConfigured()) return Promise.reject(new Error("not-configured"));

    return fetch(API_BASE + "/contents/content/posts?ref=" + (cfg.branch || "main"))
      .then(function (res) {
        if (!res.ok) throw new Error("Could not list posts (HTTP " + res.status + ")");
        return res.json();
      })
      .then(function (files) {
        var mdFiles = files.filter(function (f) { return f.type === "file" && /\.md$/.test(f.name); });
        return Promise.all(
          mdFiles.map(function (f) {
            return fetch(RAW_BASE + "/content/posts/" + f.name)
              .then(function (res) { return res.text(); })
              .then(function (raw) {
                var parsed = parseFrontMatter(raw);
                return {
                  slug: slugFromFilename(f.name),
                  title: parsed.data.title || f.name,
                  date: parsed.data.date || "",
                  excerpt: parsed.data.excerpt || excerptFromBody(parsed.body, 160),
                  body: parsed.body
                };
              });
          })
        );
      })
      .then(function (posts) {
        posts.sort(function (a, b) { return new Date(b.date) - new Date(a.date); });
        return posts;
      });
  }

  function fetchPost(slug) {
    if (!isConfigured()) return Promise.reject(new Error("not-configured"));

    return fetch(RAW_BASE + "/content/posts/" + slug + ".md")
      .then(function (res) {
        if (!res.ok) throw new Error("Post not found (HTTP " + res.status + ")");
        return res.text();
      })
      .then(function (raw) {
        var parsed = parseFrontMatter(raw);
        return {
          slug: slug,
          title: parsed.data.title || slug,
          date: parsed.data.date || "",
          excerpt: parsed.data.excerpt || "",
          body: parsed.body
        };
      });
  }

  window.CultivateBlog = {
    isConfigured: isConfigured,
    fetchAllPosts: fetchAllPosts,
    fetchPost: fetchPost,
    formatDate: formatDate,
    renderMarkdown: renderMarkdown
  };
})();
