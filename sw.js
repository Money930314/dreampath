const CACHE = 'dreampath-v3';
const APP_SHELL = [
  '/',
  '/index.html','/templates.html','/method.html',
  '/manifest.json','/offline.html'
];

self.addEventListener('install', (e)=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (e)=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
  self.clients.claim();
});

// stale-while-revalidate
self.addEventListener('fetch', (e)=>{
  const req = e.request;
  if(req.method!=='GET') return;
  if(req.mode==='navigate'){
    e.respondWith(fetch(req).catch(()=>caches.match('/offline.html')));
    return;
  }
  if(new URL(req.url).origin === location.origin){
    e.respondWith(
      caches.match(req).then(cached=>{
        const fetchPromise = fetch(req).then(res=>{
          const resClone=res.clone(); caches.open(CACHE).then(c=>c.put(req,resClone)); return res;
        }).catch(()=>cached);
        return cached || fetchPromise;
      })
    );
  }
});
