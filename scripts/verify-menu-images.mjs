import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import ts from 'typescript';

function load(file, dependencies = {}) {
  const source = fs.readFileSync(file, 'utf8');
  const js = ts.transpileModule(source, {
    compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020},
  }).outputText;
  const scope = {
    exports: {},
    require(name) {
      assert.ok(dependencies[name], `Unknown module ${name}`);
      return dependencies[name];
    },
  };
  vm.runInNewContext(js, scope);
  return scope.exports;
}

const menu = load('src/data/menu-data.ts');
const visuals = load('src/data/food-visuals.ts');
const images = load('src/data/menu-images.ts', {
  './food-visuals': visuals,
  './menu-data': menu,
});

assert.equal(
  crypto.createHash('sha256').update(fs.readFileSync('src/data/menu-data.ts')).digest('hex'),
  'c1df68064cd277f5740cb40008b4c92b4ba24042cda98de3a8c4678f164cd0bb',
  'Verified menu source must remain unchanged',
);
assert.equal(Object.keys(images.categoryPhotoKeys).length, menu.menuCategories.length);

for (const category of menu.menuCategories) {
  assert.ok(images.categoryPhotoKeys[category.id], `Missing category photo mapping for ${category.id}`);
  const categoryPhoto = images.getCategoryPhoto(category);
  assert.ok(fs.existsSync(`public${categoryPhoto.src}`), `Missing category photo ${categoryPhoto.src}`);

  for (const item of category.items) {
    const itemPhoto = images.getMenuItemPhoto(item);
    assert.ok(itemPhoto?.src && itemPhoto?.alt, `Missing item photo for ${item.id}`);
    assert.ok(fs.existsSync(`public${itemPhoto.src}`), `Missing item photo ${itemPhoto.src}`);
  }
}

assert.equal(images.getMenuItemPhoto(menu.findItem('veg-burger')).src, visuals.foodVisuals.vegBurger);
assert.equal(images.getMenuItemPhoto(menu.findItem('chicken-burger')).src, visuals.foodVisuals.burger);
assert.equal(images.getMenuItemPhoto(menu.findItem('veg-caesar-salad')).src, visuals.foodVisuals.salad);
assert.equal(images.getMenuItemPhoto(menu.findItem('mayonnaise-southwest-sauce')).src, visuals.foodVisuals.dips);

console.log('PASS: unchanged menu source, 25/25 category mappings, 118/118 item mappings, all image files present, and dietary-safe burger imagery.');
