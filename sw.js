// Versioned shell. Optional OCR assets are cached on first successful use.
const C='shiftfox-v12.2';
const F=['./','index.html','style.css','app.js','calendar-data.js','ocr-memory.js','manifest.json','icon.svg','vendor/fonts/vazirmatn-arabic-wght-normal.woff2','vendor/fonts/vazirmatn-latin-wght-normal.woff2'];
self.addEventListener('install',event=>{
 event.waitUntil(caches.open(C).then(cache=>cache.addAll(F)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
 event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('shiftfox-')&&key!==C).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;
 event.respondWith(caches.open(C).then(async cache=>{
  const cached=await cache.match(event.request);if(cached)return cached;
  const response=await fetch(event.request);
  if(response.ok)await cache.put(event.request,response.clone());
  return response;
 }));
});
