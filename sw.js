// Offline cache: cache-first for the app shell.
const C='shiftfox-v7',F=['./','index.html','style.css','vendor/fonts/vazirmatn-arabic-wght-normal.woff2','vendor/fonts/vazirmatn-latin-wght-normal.woff2','app.js','manifest.json','icon.svg','vendor/tesseract.min.js','vendor/worker.min.js','vendor/tesseract-core-simd-lstm.wasm.js','vendor/tesseract-core-lstm.wasm.js','vendor/lang/eng.traineddata.gz','vendor/lang/fas.traineddata.gz'];
self.addEventListener('install',e=>e.waitUntil(caches.open(C).then(c=>c.addAll(F))));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x))))));
self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));
