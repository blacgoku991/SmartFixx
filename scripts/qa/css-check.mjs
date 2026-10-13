// Rejoue les assertions CSS de tests/ui-components.test.mjs sur un dossier : node css-check.mjs <dossier>
import {readdir,readFile} from 'node:fs/promises';import path from 'node:path';
async function tree(d){const out=[];for(const e of await readdir(d,{withFileTypes:true})){const p=path.join(d,e.name);if(e.isDirectory())out.push(await tree(p));else if(p.endsWith('.css'))out.push(await readFile(p,'utf8'));}return out.join('\n');}
const css=await tree(path.resolve(process.argv[2]));let bad=0;
for(const re of [/--tw-enter-opacity/,/scrollbar-width:\s*thin/,/scrollbar-width:\s*none/,/scrollbar-gutter:\s*stable/,/scroll-fade-reveal-b/,/mask-image:/,/tw-shimmer/,/prefers-reduced-motion:\s*reduce/]){const ok=re.test(css);bad+=!ok;console.log(ok?'présent':'ABSENT ',re.source)}
process.exit(bad?1:0);
