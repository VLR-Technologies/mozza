// Run against a built application on localhost. No browser rendering is used:
// every content assertion checks the HTML delivered before JavaScript executes.
import test from 'node:test';
import assert from 'node:assert/strict';
import { load } from './ts-loader.mjs';

const { branches, branchDirectionsUrl } = load('src/config/restaurant.ts');
const { indexablePaths, publicPages, outletContent } = load('src/lib/seo.ts');
const base = process.env.SEO_TEST_URL || 'http://127.0.0.1:3000';
const origin = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, '') || null;
const indexable = process.env.SEO_EXPECT_INDEXABLE === 'true';
assert.ok(['localhost', '127.0.0.1', '[::1]'].includes(new URL(base).hostname), 'Only a local validation server is supported.');
if (indexable) assert.ok(origin, 'Set NEXT_PUBLIC_SITE_URL to the origin used by the build.');

function decode(value) {
  return value.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
}
function attr(tag, name) { return decode(tag.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1] || ''); }
function meta(html, name) {
  const tag = [...html.matchAll(/<meta\b[^>]*>/g)].map(match => match[0]).find(tag => attr(tag, 'name') === name || attr(tag, 'property') === name);
  return tag ? attr(tag, 'content') : null;
}
function canonical(html) {
  const tag = [...html.matchAll(/<link\b[^>]*>/g)].map(match => match[0]).find(tag => attr(tag, 'rel') === 'canonical');
  return tag ? attr(tag, 'href') : null;
}
function entities(html) {
  return [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .flatMap(match => { const data = JSON.parse(match[1]); return data['@graph'] || [data]; });
}
function content(html) { return decode(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '').replace(/<!--.*?-->/g, '')); }
async function page(path) {
  const response = await fetch(new URL(path, base), { signal: AbortSignal.timeout(15000) });
  assert.equal(response.status, 200, path);
  return { response, html: await response.text() };
}

test('all public routes serve unique metadata, canonical URLs and one H1 in initial HTML', async () => {
  const titles = new Set();
  for (const path of indexablePaths) {
    const { response, html } = await page(path);
    const title = decode(html.match(/<title>(.*?)<\/title>/)?.[1] || '');
    assert.ok(title.includes('Mozza Italia'), path);
    assert.ok(!titles.has(title), path); titles.add(title);
    assert.equal(meta(html, 'description'), publicPages[path].description, path);
    const url = origin ? (path === '/' ? origin : new URL(path, origin).href) : null;
    assert.equal(canonical(html), url, path);
    assert.equal(meta(html, 'og:url'), url, path);
    assert.equal(meta(html, 'og:site_name'), 'Mozza Italia', path);
    assert.equal(meta(html, 'twitter:title'), title, path);
    assert.equal((content(html).match(/<h1\b/g) || []).length, 1, path);
    assert.equal(meta(html, 'robots'), indexable ? 'index, follow' : 'noindex, nofollow', path);
    assert.equal(response.headers.get('x-robots-tag'), indexable ? null : 'noindex, nofollow', path);
    for (const branch of branches) assert.ok(content(html).includes(`href="/locations/${branch.id}"`), `Footer link on ${path}`);
  }
});

test('menu and order query variants keep their route canonical and server-render menu entries', async () => {
  for (const path of ['/menu?q=Margarita&branch=guntur', '/order?group=Pizza&branch=hyderabad&item=margarita']) {
    const { html } = await page(path);
    assert.equal(canonical(html), origin ? new URL(path.split('?')[0], origin).href : null);
    assert.ok(content(html).includes('Margarita'));
  }
});

test('every outlet serves its own verified address, contact, directions, copy and breadcrumb schema', async () => {
  for (const branch of branches) {
    const { html } = await page(`/locations/${branch.id}`);
    const visible = content(html);
    assert.ok(visible.includes(`Mozza Italia ${branch.name}`));
    assert.ok(visible.includes(branch.address));
    assert.ok(visible.includes(outletContent[branch.id].introduction));
    assert.ok(visible.includes(outletContent[branch.id].visit));
    assert.ok(visible.includes(`href="tel:+${branch.whatsapp}"`));
    assert.ok(visible.includes(`https://wa.me/${branch.whatsapp}?`));
    assert.ok(visible.includes(branchDirectionsUrl(branch)));
    assert.ok(visible.includes(`href="/order?branch=${branch.id}"`));
    assert.ok(visible.includes('aria-label="Breadcrumb"'));
    const data = entities(html);
    if (origin) {
      const restaurant = data.find(entity => entity['@type'] === 'Restaurant');
      assert.equal(restaurant.telephone, `+${branch.whatsapp}`);
      assert.equal(restaurant.address.postalCode, branch.postalAddress.postalCode);
      const trail = data.find(entity => entity['@type'] === 'BreadcrumbList');
      assert.deepEqual(trail.itemListElement.map(item => item.name), ['Home', 'Locations', branch.name]);
      assert.equal(data.filter(entity => entity['@type'] === 'Restaurant').length, 1);
    } else assert.equal(data.length, 0);
  }
  const response = await fetch(new URL('/locations/unknown-outlet', base));
  assert.equal(response.status, 404);
});

test('home alone defines the brand and WebSite; private pages have no business schema or canonical', async () => {
  const home = entities((await page('/')).html);
  if (origin) {
    assert.deepEqual(home.map(entity => entity['@type']), ['Organization', 'WebSite']);
    assert.equal(home.find(entity => entity['@type'] === 'WebSite').url, origin);
  } else assert.equal(home.length, 0);
  const staff = await page('/admin/orders');
  assert.equal(meta(staff.html, 'robots'), 'noindex, nofollow');
  assert.equal(staff.response.headers.get('x-robots-tag'), 'noindex, nofollow');
  assert.equal(entities(staff.html).length, 0);
  assert.equal(canonical(staff.html), null);
  const api = await fetch(new URL('/api/admin/dashboard', base));
  assert.equal(api.status, 401);
  assert.equal(api.headers.get('x-robots-tag'), 'noindex, nofollow');
});

test('actual robots and XML sitemap match the deployment indexing policy', async () => {
  const robots = (await page('/robots.txt')).html;
  const sitemap = (await page('/sitemap.xml')).html;
  const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => decode(match[1]));
  if (indexable) {
    assert.ok(robots.includes('Allow: /'));
    assert.ok(robots.includes('Disallow: /admin'));
    assert.ok(robots.includes('Disallow: /api/'));
    assert.ok(robots.includes(`Sitemap: ${origin}/sitemap.xml`));
    assert.deepEqual(urls.sort(), indexablePaths.map(path => path === '/' ? origin : new URL(path, origin).href).sort());
  } else {
    assert.ok(robots.includes('Disallow: /'));
    assert.ok(!robots.includes('Sitemap:'));
    assert.deepEqual(urls, []);
  }
  assert.doesNotMatch(sitemap, /<lastmod>|localhost|127\.0\.0\.1|\/admin|\/api\//);
});
