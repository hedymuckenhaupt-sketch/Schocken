/* Schocken – Offline-Speicher. Die App funktioniert danach auch im Flugmodus (Modus „Ein Handy“). */
const CACHE='schocken-v1';
const FILES=['./schocken.html','./manifest.json','./icon-180.png','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;
  const url=new URL(req.url);if(url.origin!==location.origin)return;
  // Netz zuerst (damit Updates ankommen), sonst die gespeicherte Version
  e.respondWith((async()=>{
    const cache=await caches.open(CACHE);
    try{
      const ctl=new AbortController();const t=setTimeout(()=>ctl.abort(),4000);
      const res=await fetch(req,{signal:ctl.signal});clearTimeout(t);
      if(res&&res.ok){const key=url.pathname.endsWith('/')||url.pathname.endsWith('.html')?new Request(url.origin+url.pathname):req;cache.put(key,res.clone())}
      return res;
    }catch(err){
      const hit=await cache.match(req,{ignoreSearch:true});
      if(hit)return hit;
      if(req.mode==='navigate'){const html=await cache.match('./schocken.html');if(html)return html}
      throw err;
    }
  })());
});
