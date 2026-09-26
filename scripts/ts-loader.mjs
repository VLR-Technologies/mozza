// Test-only loader: transpiles local TS using the existing TypeScript dependency.
// Does not add runtime dependencies or weaken Next.js server-only boundaries.
import fs from 'node:fs';import path from 'node:path';import ts from 'typescript';import {createRequire} from 'node:module';const nativeRequire=createRequire(import.meta.url);const cache=new Map();
function load(file){const full=path.resolve(file);if(cache.has(full))return cache.get(full).exports;const mod={exports:{}};cache.set(full,mod);const code=ts.transpileModule(fs.readFileSync(full,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText;
const localRequire=id=>{if(id==='server-only')return {};if(id.startsWith('.')||id.startsWith('@/')){let p=id.startsWith('@/')?path.resolve('src',id.slice(2)):path.resolve(path.dirname(full),id);if(!path.extname(p))p+='.ts';return load(p);}return nativeRequire(id);};new Function('require','module','exports',code)(localRequire,mod,mod.exports);return mod.exports;}
export {load};
