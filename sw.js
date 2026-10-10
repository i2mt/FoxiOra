const C='foxiora-v12.16',OCR='foxiora-ocr-v1';
const F=['./','index.html','style.css','app.js','calendar-data.js','ocr-memory.js','manifest.json','icon.svg','fox-mark.svg','vendor/fonts/vazirmatn-arabic-wght-normal.woff2','vendor/fonts/vazirmatn-latin-wght-normal.woff2'];
self.addEventListener('install',e=>e.waitUntil(caches.open(C).then(c=>c.addAll(F)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>(k.startsWith('shiftfox-')||k.startsWith('foxiora-'))&&k!==C&&k!==OCR).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==location.origin)return;
 const scanner=/\/vendor\/(?:lang\/|tesseract|worker)/.test(new URL(e.request.url).pathname);
 e.respondWith(caches.open(scanner?OCR:C).then(async c=>{const cached=await c.match(e.request);if(cached&&e.request.cache!=='reload')return cached;
 const response=await fetch(e.request);if(response.ok&&!scanner)await c.put(e.request,response.clone());return response}));
});
