import { test } from 'node:test';
import assert from 'node:assert/strict';
/* lib/measured-paths.ts recopie les slugs (sans contenu éditorial) pour alléger le JS de chaque page :
   ses listes doivent rester égales aux sources éditoriales. Node lit ces modules TypeScript directement
   (suppression des types, Node ≥ 22.18). */
const load = (f) => import(new URL(`../lib/${f}`, import.meta.url));
test('measured paths mirror services, locations, guides and service labels', async () => {
  const [{ services, serviceLabels }, { locations }, { guides }, mp] = await Promise.all(['services.ts', 'locations.ts', 'guides.ts', 'measured-paths.ts'].map(load));
  assert.deepEqual([...mp.serviceSlugs].sort(), services.map((s) => s.slug).sort());
  assert.deepEqual([...mp.locationSlugs].sort(), locations.map((l) => l.slug).sort());
  assert.deepEqual([...mp.guideSlugs].sort(), guides.map((g) => g.slug).sort());
  assert.deepEqual([...mp.serviceIds].sort(), Object.keys(serviceLabels).sort());
  for (const s of services) assert.ok(mp.isMeasuredPath(`/${s.slug}`), s.slug);
  for (const l of locations) assert.ok(mp.isMeasuredPath(`/${l.slug}`), l.slug);
  for (const g of guides) assert.ok(mp.isMeasuredPath(`/conseils/${g.slug}`), g.slug);
  assert.ok(!mp.isMeasuredPath('/admin'));
  assert.ok(mp.isServiceId('creation') && !mp.isServiceId('toString') && !mp.isServiceId(undefined));
});
