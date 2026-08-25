import { t, pick, esc, breadcrumb, sectionHeading } from "../lib/render.js";
import { icon } from "../lib/icons.js";
import { listAll, findBySlug } from "../lib/db.js";

export function renderBlogList(lang) {
  const posts = [...listAll("blog")].sort((a, b) => (a.date < b.date ? 1 : -1));
  return `
  <div class="page-head">
    <div class="container">
      <h1>${esc(t(lang, "blog_title"))}</h1>
      <p>${esc(t(lang, "blog_subtitle"))}</p>
    </div>
  </div>
  ${breadcrumb(lang, [{ label: t(lang, "nav_blog") }])}
  <section class="block">
    <div class="container">
      ${
        posts.length
          ? `<div class="grid-3">
        ${posts
          .map(
            (b) => `
          <a class="card" href="/blog/${esc(b.slug)}?lang=${lang}" style="color:inherit">
            <div class="card-media">${icon("design", 36)}</div>
            <div class="card-body">
              <span class="tag">${esc(b.date)}</span>
              <h3>${esc(pick(b.title, lang))}</h3>
              <p>${esc(pick(b.excerpt, lang))}</p>
              <div class="card-foot"><span>${esc(t(lang, "read_more"))} &rarr;</span></div>
            </div>
          </a>`
          )
          .join("")}
      </div>`
          : `<p>${esc(t(lang, "empty_blog"))}</p>`
      }
    </div>
  </section>
  `;
}

export function renderBlogDetail(lang, slug) {
  const post = findBySlug("blog", slug);
  if (!post) return null;
  const others = listAll("blog").filter((b) => b.slug !== slug).slice(0, 3);
  return `
  ${breadcrumb(lang, [{ label: t(lang, "nav_blog"), href: `/blog?lang=${lang}` }, { label: pick(post.title, lang) }])}
  <section class="block">
    <div class="container detail-body">
      <div class="meta-row"><span>${esc(post.date)}</span><span>${esc(post.author)}</span></div>
      <h1>${esc(pick(post.title, lang))}</h1>
      <div>${pick(post.content, lang).split("\n\n").map((p) => `<p>${esc(p)}</p>`).join("")}</div>
    </div>
  </section>
  <section class="block alt">
    <div class="container">
      ${sectionHeading(t(lang, "blog_title"))}
      <div class="grid-3">
        ${others
          .map(
            (b) => `
          <a class="card" href="/blog/${esc(b.slug)}?lang=${lang}" style="color:inherit">
            <div class="card-media">${icon("design", 30)}</div>
            <div class="card-body"><span class="tag">${esc(b.date)}</span><h3>${esc(pick(b.title, lang))}</h3></div>
          </a>`
          )
          .join("")}
      </div>
    </div>
  </section>
  `;
}
