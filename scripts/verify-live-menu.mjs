import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import ts from 'typescript';
function load(file,dependencies={}){const js=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;const scope={exports:{},require:name=>{assert.ok(dependencies[name],`Unknown module ${name}`);return dependencies[name];}};vm.runInNewContext(js,scope);return scope.exports;}
const menu=load('src/data/menu-data.ts');const visuals=load('src/data/food-visuals.ts');const data=load('src/data/menu-animation-data.ts',{'./menu-data':menu,'./food-visuals':visuals});
assert.equal(crypto.createHash('sha256').update(fs.readFileSync('src/data/menu-data.ts')).digest('hex'),'c1df68064cd277f5740cb40008b4c92b4ba24042cda98de3a8c4678f164cd0bb','Verified menu source must remain unchanged');
const ids=new Set(menu.menuItems.map(i=>i.id));for(const list of Object.values(data.animationItemGroups))for(const id of list)assert.ok(ids.has(id),`Missing menu item ${id}`);
for(const [id,feature] of Object.entries(data.animatedCategoryFeatures)){const category=menu.menuCategories.find(c=>c.id===id);assert.ok(category,`Missing category ${id}`);for(const itemId of feature.itemIds){const item=category.items.find(i=>i.id===itemId);assert.ok(item,`${itemId} must belong to ${id}`);assert.ok(data.getMenuAnimation(item));assert.ok(item.sizes[feature.sizeIndex||0]);}}
for(const group of Object.values(data.animationAssets))for(const file of Object.values(group))assert.ok(fs.existsSync('public'+file),`Missing asset ${file}`);for(const file of Object.values(data.ingredientAssets))assert.ok(fs.existsSync('public'+file));
const mapping={};for(const item of menu.menuItems){const config=data.getMenuAnimation(item);if(!config)continue;(mapping[config.animationType]??=[]).push(item.name);if(item.diet==='veg')assert.ok(!config.ingredients.includes('chicken'));}
assert.equal(Object.keys(mapping).length,7);assert.equal(mapping.pizzaAssembly.length,20);assert.deepEqual(Array.from(data.getMenuAnimation(menu.findItem('margarita')).ingredients),[]);
console.log('PASS: unchanged menu SHA256, all assignments, category membership, serving indexes, seven systems, 20 pizza recipes, vegetarian toppings, and all asset paths.');
console.log(JSON.stringify(mapping,null,2));
const resolver=load('src/lib/menu-animation-resolver.ts',{'@/data/menu-data':menu,'@/data/food-visuals':visuals,'@/data/menu-animation-data':data});
const registry=load('src/data/menu-visual-registry.ts',{'./menu-data':menu,'@/lib/menu-animation-resolver':resolver}).menuVisualRegistry;
assert.equal(Object.keys(registry).length,118);
const families={};
for(const item of menu.menuItems){const config=registry[item.id];assert.ok(config?.animationType&&config.variant&&config.family,`Unmapped ${item.name}`);assert.ok(config.cycleSeconds>=6&&config.cycleSeconds<=12);(families[config.family]??=[]).push(item.id);if(item.diet==='veg'){assert.ok(!config.ingredients.includes('chicken'));assert.ok(!config.flags?.includes('chicken'));}}
assert.equal(registry['veg-burger'].variant,'veg');assert.equal(registry['paneer-burger'].variant,'paneer');assert.equal(registry['chicken-zinger-burger'].variant,'zinger');
assert.equal(registry['cheesy-loaded-fries'].animationType,'friesAssembly');assert.ok(registry['cheesy-loaded-fries'].flags.includes('cheese'));assert.ok(!registry['cheesy-loaded-fries'].flags.includes('chicken'));
assert.equal(registry['hot-wings-bucket'].animationType,'bucketFill');assert.equal(registry['shake-cold-coffee-shake'].variant,'cold-coffee');
assert.notEqual(registry['blue-curacao'].color,registry['raspberry'].color);assert.notEqual(registry['icecream-mango'].color,registry['icecream-belgium-chocolate'].color);
assert.ok(registry['chittimutyalu-veg-ghee-pulav'].flags.includes('short-grain'));assert.ok(registry['basmathi-veg-ghee-pulav'].flags.includes('basmathi'));
assert.ok(resolver.getMenuItemAnimation({id:'future-unknown',name:'Future snack',diet:'unspecified',sizes:[{label:'Serving',price:null}]}));
console.log('PASS: complete 118/118 registry, 6–12 second cycles, dietary-safe variants, distinct burger/rice/drink/ice-cream variants and safe future fallback.');
console.log('Families:',JSON.stringify(Object.fromEntries(Object.entries(families).map(([k,v])=>[k,v.length]))));
