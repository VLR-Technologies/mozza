import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { load } from './ts-loader.mjs';

const { getSeoConfig } = load('src/config/seo.ts');
const seo = load('src/lib/seo.ts');
const schema = load('src/lib/structured-data.ts');
const { branches } = load('src/config/restaurant.ts');
const robots = load('src/app/robots.ts').default;
const sitemap = load('src/app/sitemap.ts').default;
const keys = ['NODE_ENV', 'SEO_ENV', 'VERCEL_ENV', 'NEXT_PUBLIC_SITE_URL'];
const original = Object.fromEntries(keys.map(key => [key, process.env[key]]));
const production = { NODE_ENV: 'production', SEO_ENV: 'production', NEXT_PUBLIC_SITE_URL: 'https://www.mozzaitalia.com/' };
function setup(env = production) {
  for (const key of keys) delete process.env[key];
  Object.assign(process.env, env);
}
test.afterEach(() => {
  for (const key of keys) {
    if (original[key] === undefined) delete process.env[key];
    else process.env[key] = original[key];
  }
});

test('production requires an explicit mode and confirmed HTTPS origin', () => {
  assert.throws(() => getSeoConfig({ NODE_ENV: 'production' }), /SEO_ENV/);
  assert.throws(() => getSeoConfig({ NODE_ENV: 'production', SEO_ENV: 'production' }), /NEXT_PUBLIC_SITE_URL/);
  assert.throws(() => getSeoConfig({ NODE_ENV: 'production', VERCEL_ENV: 'production' }), /NEXT_PUBLIC_SITE_URL/);
  assert.throws(() => getSeoConfig({ ...production, VERCEL_ENV: 'production', SEO_ENV: 'preview' }), /cannot/);
  assert.throws(() => getSeoConfig({ SEO_ENV: 'typo' }), /SEO_ENV/);
  const config = getSeoConfig(production);
  assert.equal(config.origin, 'https://www.mozzaitalia.com');
  assert.equal(config.indexable, true);
  assert.equal(getSeoConfig({ ...production, NEXT_PUBLIC_SITE_URL: 'https://restaurant.example.com' }).origin, 'https://restaurant.example.com');
});

test('invalid, local, IP and hosting preview origins cannot enter canonical output', () => {
  for (const value of ['not a url', 'http://www.mozzaitalia.com', 'https://localhost', 'https://site.local', 'https://127.0.0.1', 'https://[::1]', 'https://10.1.2.3', 'https://preview.vercel.app', 'https://site.netlify.app', 'https://site.pages.dev', 'https://site.invalid', 'https://www.mozzaitalia.com/menu', 'https://www.mozzaitalia.com?index=false', 'https://www.mozzaitalia.com#home', 'https://user:password@www.mozzaitalia.com', 'https://www.mozzaitalia.com:3000']) {
    assert.throws(() => getSeoConfig({ ...production, NEXT_PUBLIC_SITE_URL: value }), /NEXT_PUBLIC_SITE_URL/, value);
  }
});

test('local and preview environments stay private even when production variables are inherited', () => {
  for (const env of [
    { NODE_ENV: 'development' },
    { NODE_ENV: 'production', SEO_ENV: 'preview' },
    { ...production, SEO_ENV: 'preview' },
    { ...production, VERCEL_ENV: 'preview' },
    { ...production, VERCEL_ENV: 'development' },
    { ...production, NODE_ENV: 'development' },
  ]) {
    setup(env);
    assert.equal(getSeoConfig().indexable, false);
    assert.deepEqual(robots(), { rules: { userAgent: '*', disallow: '/' } });
    assert.deepEqual(sitemap(), []);
    assert.deepEqual(seo.rootMetadata().robots, { index: false, follow: false });
  }
});

test('unconfigured private builds never fabricate canonical origins or schema IDs', () => {
  setup({ NODE_ENV: 'production', SEO_ENV: 'preview' });
  assert.equal(seo.rootMetadata().metadataBase, undefined);
  for (const path of seo.indexablePaths) {
    const metadata = seo.pageMetadata(path);
    assert.equal(metadata.alternates, undefined);
    assert.equal(metadata.openGraph.url, undefined);
    assert.equal(metadata.openGraph.images, undefined);
  }
  assert.equal(schema.homepageSchema(), null);
  assert.equal(schema.outletSchema(branches[0]), null);
});

test('each public route has distinct server metadata, its own canonical and supplied social asset', () => {
  setup();
  const titles = new Set(), descriptions = new Set();
  for (const path of seo.indexablePaths) {
    const metadata = seo.pageMetadata(path);
    const canonical = path === '/' ? 'https://www.mozzaitalia.com' : new URL(path, production.NEXT_PUBLIC_SITE_URL).href;
    assert.equal(metadata.alternates.canonical, canonical);
    assert.equal(metadata.openGraph.url, canonical);
    assert.equal(metadata.openGraph.siteName, 'Mozza Italia');
    assert.equal(metadata.openGraph.title, metadata.title.absolute);
    assert.equal(metadata.twitter.title, metadata.title.absolute);
    assert.equal(metadata.description, metadata.openGraph.description);
    assert.ok(metadata.description.length > 60);
    assert.ok(!titles.has(metadata.title.absolute), path);
    assert.ok(!descriptions.has(metadata.description), path);
    titles.add(metadata.title.absolute); descriptions.add(metadata.description);
    const image = new URL(metadata.openGraph.images[0].url);
    assert.equal(image.origin, 'https://www.mozzaitalia.com');
    assert.ok(existsSync(`public${image.pathname}`));
  }
  assert.equal(seo.rootMetadata().metadataBase.href, 'https://www.mozzaitalia.com/');
  assert.equal(seo.indexablePaths.length, 14);
});

test('filter/order/tracking variants canonicalize to their own unfiltered page', () => {
  setup();
  for (const route of ['/menu', '/order']) {
    for (const query of ['?q=pizza&group=Pizza', '?branch=guntur&item=margarita', '?utm_source=search', '/?q=burger#results']) {
      assert.equal(seo.canonicalUrl(route + query), `https://www.mozzaitalia.com${route}`);
      assert.equal(seo.pageMetadata(route + query).alternates.canonical, `https://www.mozzaitalia.com${route}`);
    }
  }
  assert.throws(() => seo.canonicalUrl('/admin/orders'), /Unknown/);
  assert.throws(() => seo.canonicalUrl('//other.example.com'), /Unknown/);
});

test('production sitemap includes all 14 canonical pages and excludes private/query URLs and invented dates', () => {
  setup();
  const urls = sitemap();
  assert.equal(urls.length, 14);
  assert.equal(new Set(urls.map(entry => entry.url)).size, urls.length);
  for (const entry of urls) {
    assert.equal(new URL(entry.url).origin, 'https://www.mozzaitalia.com');
    assert.doesNotMatch(entry.url, /admin|api\/|localhost|[?#]/);
    assert.equal(entry.lastModified, undefined);
  }
  for (const branch of branches) assert.ok(urls.some(entry => entry.url.endsWith(`/locations/${branch.id}`)));
  assert.equal(robots().sitemap, 'https://www.mozzaitalia.com/sitemap.xml');
  assert.equal(robots().rules.allow, '/');
  assert.ok(robots().rules.disallow.includes('/admin'));
  assert.ok(robots().rules.disallow.includes('/api/'));
  setup({ NODE_ENV: 'production', SEO_ENV: 'production' });
  assert.throws(() => sitemap(), /NEXT_PUBLIC_SITE_URL/);
  assert.throws(() => robots(), /NEXT_PUBLIC_SITE_URL/);
});

test('brand, website and restaurant identities are stable and do not combine outlet contacts', () => {
  setup();
  const graph = schema.homepageSchema()['@graph'];
  assert.deepEqual(graph.map(entity => entity['@type']), ['Organization', 'WebSite']);
  const [organization, website] = graph;
  assert.equal(website.name, 'Mozza Italia');
  assert.equal(website.url, 'https://www.mozzaitalia.com');
  assert.equal(website['@id'], 'https://www.mozzaitalia.com/#website');
  assert.equal(website.publisher['@id'], organization['@id']);
  assert.equal(organization.telephone, undefined);
  const ids = new Set();
  for (const branch of branches) {
    const entity = schema.outletSchema(branch);
    assert.equal(entity['@type'], 'Restaurant');
    assert.equal(entity.name, `Mozza Italia ${branch.name}`);
    assert.equal(entity.telephone, `+${branch.whatsapp}`);
    assert.equal(entity.parentOrganization['@id'], organization['@id']);
    assert.equal(entity.address.addressCountry, 'IN');
    for (const field of ['streetAddress', 'addressLocality', 'addressRegion', 'postalCode']) assert.ok(branch.address.includes(entity.address[field]));
    for (const unsupported of ['aggregateRating', 'review', 'image', 'geo', 'openingHours', 'openingHoursSpecification', 'hasMap', 'sameAs', 'priceRange']) assert.equal(entity[unsupported], undefined);
    assert.ok(organization.subOrganization.some(ref => ref['@id'] === entity['@id']));
    assert.ok(!ids.has(entity['@id'])); ids.add(entity['@id']);
    assert.equal(schema.outletSchema({ ...branch, phone: null, postalAddress: undefined }).address, undefined);
    assert.equal(schema.outletSchema({ ...branch, phone: null }).telephone, undefined);
  }
  assert.equal(new Set(Object.values(seo.outletContent).map(content => content.introduction)).size, 4);
  assert.equal(new Set(Object.values(seo.outletContent).map(content => content.visit)).size, 4);
});

test('breadcrumb hierarchy matches actual Home, Locations and outlet destinations', () => {
  setup();
  for (const branch of branches) {
    const items = [{ name: 'Home', path: '/' }, { name: 'Locations', path: '/locations' }, { name: branch.name, path: `/locations/${branch.id}` }];
    const breadcrumb = schema.breadcrumbSchema(items);
    assert.equal(breadcrumb['@type'], 'BreadcrumbList');
    assert.deepEqual(breadcrumb.itemListElement.map(item => item.position), [1, 2, 3]);
    assert.deepEqual(breadcrumb.itemListElement.map(item => item.name), ['Home', 'Locations', branch.name]);
    assert.equal(breadcrumb.itemListElement.at(-1).item, schema.outletSchema(branch).url);
  }
});

test('JSON-LD escapes script breakout text and preserves legitimate values', () => {
  const data = { name: '</script><script>alert("x")</script> & > \u2028\u2029' };
  const encoded = schema.serializeJsonLd(data);
  assert.doesNotMatch(encoded, /[<>&\u2028\u2029]/);
  assert.deepEqual(JSON.parse(encoded), data);
});
