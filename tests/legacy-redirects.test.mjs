import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
/* Garde de lib/legacy-redirects.ts (plan « redirections ») : jamais vers l'accueil, aucune source servie
   aujourd'hui (route, page du sitemap ou chemin mesuré), aucune chaîne, 308 et liste branchée dans les deux
   next.config. Node lit le module TypeScript directement (suppression des types, Node ≥ 22.18). */
const root = new URL('../', import.meta.url);
const load = (f) => import(new URL(`lib/${f}`, root));
test('legacy redirects: targeted 308s, never to the home page, no chain, no live source', async () => {
  const [{ legacyRedirects, nextRedirects }, mp] = await Promise.all([load('legacy-redirects.ts'), load('measured-paths.ts')]);
  assert.ok(legacyRedirects.length >= 1);
  const sources = legacyRedirects.map((r) => r.source);
  assert.equal(new Set(sources).size, sources.length, 'source en double');
  for (const r of legacyRedirects) {
    assert.match(r.source, /^\/[a-z0-9-]+$/, r.source);
    assert.match(r.destination, /^\/[a-z0-9-]+$/, r.destination);
    assert.notEqual(r.destination, '/', r.source);
    assert.notEqual(r.destination, r.source);
    assert.ok(r.note.length > 10, `note manquante : ${r.source}`);
    // Aucune chaîne : la destination n'est la source d'aucune entrée.
    assert.ok(!sources.includes(r.destination), `chaîne ${r.source} → ${r.destination}`);
    // Aucune source n'est une page servie : ni chemin mesuré (= pages du sitemap), ni dossier de route.
    assert.ok(!mp.isMeasuredPath(r.source), `source servie : ${r.source}`);
    assert.ok(!existsSync(new URL(`app${r.source}`, root)), `route existante : ${r.source}`);
    // La destination est une page réelle du site.
    assert.ok(mp.isMeasuredPath(r.destination), `destination inconnue : ${r.destination}`);
  }
  assert.deepEqual(nextRedirects(), legacyRedirects.map((r) => ({ source: r.source, destination: r.destination, permanent: true })));
  // Les deux configurations (Sites/vinext et VPS) lisent cette liste.
  for (const f of ['next.config.ts', 'vps/overlay/next.config.ts']) {
    const text = readFileSync(new URL(f, root), 'utf8');
    assert.match(text, /from ['"]\.\/lib\/legacy-redirects['"]/, f);
    assert.match(text, /redirects\(\)\s*\{\s*return nextRedirects\(\)/, f);
  }
});
