// Restoring data must not advance the launch artwork before its first paint.
function loadingProgress(value,text){if(text&&$('#loading-status'))$('#loading-status').textContent=text}
function loadingArtworkReady(screen){
 const background=getComputedStyle(screen.querySelector('.loading-fox')).backgroundImage;
 const urls=[...background.matchAll(/url\(["']?([^"')]+)["']?\)/g)].map(match=>match[1]);
 urls.push('assets/foxiora-orange-area.svg');
 const assets=urls.map(url=>new Promise(resolve=>{const image=new Image();image.onload=()=>{if(image.decode)image.decode().catch(()=>{}).then(resolve);else resolve()};image.onerror=resolve;image.src=url}));
 if(document.fonts)assets.push(document.fonts.ready);
 // A missing or stalled asset must not prevent access to the saved schedule.
 return new Promise(resolve=>{const timeout=setTimeout(resolve,4000);Promise.all(assets).then(()=>{clearTimeout(timeout);resolve()})})
}
function loadingVisibleFrames(screen,duration,paint){
 return new Promise(resolve=>{
  let elapsed=0,last=null,paintedFrames=0;
  const visibility=()=>{last=null;paintedFrames=0};
  document.addEventListener('visibilitychange',visibility);
  const frame=now=>{
   if(!screen.isConnected){document.removeEventListener('visibilitychange',visibility);resolve();return}
   if(document.visibilityState!=='hidden'){
    // Two visible frames at zero let the empty mark paint before filling.
    if(last!==null&&paintedFrames>=2)elapsed+=now-last;
    last=now;paintedFrames++;if(paint)paint(Math.min(1,elapsed/duration));
    if(elapsed>=duration){document.removeEventListener('visibilitychange',visibility);resolve();return}
   }else last=null;
   requestAnimationFrame(frame)
  };
  requestAnimationFrame(frame)
 })
}
async function finishLoading(){
 const screen=$('#loading-screen');if(!screen)return;
 await loadingArtworkReady(screen);
 const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
 if(reduced)screen.style.setProperty('--loading-progress','100%');
 else await loadingVisibleFrames(screen,1200,progress=>screen.style.setProperty('--loading-progress',(progress*100)+'%'));
 loadingProgress(100,'برنامه‌ات آماده‌ست');
 await loadingVisibleFrames(screen,160);
 screen.classList.add('ready');
 setTimeout(()=>{screen.remove();startAppExperience()},reduced?0:300)
}

(async()=>{try{loadingProgress(12,'داریم برنامه‌ات رو باز می‌کنیم…');const L=await load()||{};if(L.wps&&!L.ver){L.lang='fa';L.cal='j';L.ver=3}S={...S,...L};loadingProgress(70,'برنامه‌ات تقریباً آماده‌ست…');normalizeSavedOff();await loadImportDrafts();sel=iso(Date.now());cm=mfirst(new Date());render();registerAppWorker();await finishLoading()}catch(e){const screen=$('#loading-screen');if(screen){$('#loading-status').textContent='برنامهٔ ذخیره‌شده باز نشد. دوباره تلاش کنید.';screen.querySelector('.loading-retry').hidden=false;screen.classList.add('load-error')}}})();
setInterval(()=>tab==='today'&&!$('#dlg').open&&render(),60000);
