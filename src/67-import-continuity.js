/* Import checkpoints live beside, never inside, the saved roster. No OCR runs on resume. */
const importDrafts={records:{},pending:new Set(),signatures:{},queue:Promise.resolve(),restoring:false,error:'',loaded:false};
const IMPORT_DRAFT_KEYS={photo:'import-draft-photo-v1',file:'import-draft-file-v1'};
const draftCanvases=new WeakMap();let draftCanvasSequence=0;
const SC_DRAFT_FIELDS=['wp','name','nameConfirmed','y','m','method','colleaguesOnly','entryDate','cells','rows','ri','pick','guess','reviewIndex','reviewFinish','reviewEditing','cellUndo','correctionMessage','importMates','strip','dateCheck','columnPick','photoRowPick','continueReadRow','continueReadAll','continueImportAll'];
function draftFields(obj,keys){return copyJSON(Object.fromEntries(keys.filter(k=>obj[k]!==undefined).map(k=>[k,obj[k]])))}
function draftCanvas(cv){if(!cv?.toDataURL)return null;let item=draftCanvases.get(cv);if(!item){item={id:++draftCanvasSequence,image:cv.toDataURL('image/png')};draftCanvases.set(cv,item)}return item}
function importDraftSnapshot(kind){
 if(tour.active||tour.finishing||importDrafts.restoring||typeof indexedDB==='undefined')return null;
 if(kind==='file'){
  if(fi.busy||!fi.book)return null;
  const data=draftFields(fi,['wp','book','sheet','rows','header','own','mapping','year','month','monthConfirmed','name','colleaguesOnly','sourceKey','dateOverride']);
  return{schema:1,kind,calendar:fi.draftCalendar||S.cal,data};
 }
 if(sc.busy||tc.busy||!sc.pages?.length||!(sc.cells||sc.pick||sc.dateCheck||sc.columnPick||sc.photoRowPick||sc.colleaguesOnly))return null;
 const data=draftFields(sc,SC_DRAFT_FIELDS);
 data.pages=sc.pages.map(p=>({...draftFields(p,['sourceKey','img','hl','vl','nameCol','dr','guess','dbg','rows','rawV','nameBounds','headerRow','headerValues','dayOffset','nameLayoutUncertain','nameLanguage','datesConfirmed']),dayMap:(p.vl||[]).slice(0,-1).map((_,i)=>p.dayAt?.(i)||0),canvas:draftCanvas(p.cv),source:draftCanvas(p.source)}));
 return{schema:1,kind,calendar:sc.draftCalendar||S.cal,data};
}
async function draftTransaction(action){const d=await db();return new Promise((resolve,reject)=>{const tx=d.transaction('kv','readwrite');try{action(tx.objectStore('kv'))}catch(e){d.close();reject(e);return}tx.oncomplete=()=>{d.close();resolve()};tx.onerror=tx.onabort=()=>{d.close();reject(tx.error||Error('Draft storage failed'))}})}
function queueImportDrafts(){
 if(changeSaving||undoBusy||importDrafts.restoring||tour.active||tour.finishing)return importDrafts.queue;
 for(const kind of ['photo','file']){
  if(importDrafts.pending.has(kind))continue;
  let record,signature;try{record=importDraftSnapshot(kind);if(!record)continue;signature=JSON.stringify(record,(key,value)=>key==='canvas'||key==='source'?value?.id||null:value)}catch{importDrafts.error='save';renderImportRecovery();continue}
  if(signature===importDrafts.signatures[kind])continue;
  importDrafts.signatures[kind]=signature;record.savedAt=Date.now();
  importDrafts.queue=importDrafts.queue.then(async()=>{try{await draftTransaction(store=>store.put(record,IMPORT_DRAFT_KEYS[kind]));importDrafts.records[kind]=record;importDrafts.error=''}catch{delete importDrafts.signatures[kind];importDrafts.error='save'}renderImportRecovery()});
 }
 return importDrafts.queue;
}
async function loadImportDrafts(){
 try{const d=await db();const records=await new Promise((resolve,reject)=>{const tx=d.transaction('kv'),out={};for(const [kind,key]of Object.entries(IMPORT_DRAFT_KEYS)){const q=tx.objectStore('kv').get(key);q.onsuccess=()=>{if(q.result)out[kind]=q.result}}tx.oncomplete=()=>{d.close();resolve(out)};tx.onerror=tx.onabort=()=>{d.close();reject(tx.error)}});
  for(const [kind,record]of Object.entries(records)){if(record.schema===1&&record.kind===kind&&record.data&&S.wps.some(w=>w.id===record.data.wp)){importDrafts.records[kind]=record;importDrafts.pending.add(kind)}}
 }catch{importDrafts.error='load'}importDrafts.loaded=true;
}
function forgetImportDraft(kind){delete importDrafts.records[kind];delete importDrafts.signatures[kind];importDrafts.pending.delete(kind);renderImportRecovery()}
async function removeImportDraft(kind){await importDrafts.queue;try{if(typeof indexedDB!=='undefined')await draftTransaction(store=>store.delete(IMPORT_DRAFT_KEYS[kind]));forgetImportDraft(kind);return true}catch{importDrafts.error='save';renderImportRecovery();return false}}
async function discardRecoveredImport(kind){if(!confirm(T2('Discard this unfinished import? Saved rosters will stay.','این برنامهٔ نیمه‌کاره کنار گذاشته شود؟ برنامه‌های ثبت‌شده باقی می‌مانند.')))return;if(await removeImportDraft(kind))render()}
function restoreDraftCanvas(value){if(!value?.image)return Promise.resolve(null);return new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>{const cv=document.createElement('canvas');cv.width=image.naturalWidth||image.width;cv.height=image.naturalHeight||image.height;cv.getContext('2d').drawImage(image,0,0);draftCanvases.set(cv,{id:++draftCanvasSequence,image:value.image});resolve(cv)};image.onerror=()=>reject(Error('Draft photo could not be opened'));image.src=value.image})}
async function resumeImportDraft(kind){
 if(importDrafts.restoring||sc.busy||tc.busy||fi.busy||changeSaving||tour.active)return;
 const record=importDrafts.records[kind];if(!record||!S.wps.some(w=>w.id===record.data.wp))return;
 if(record.calendar!==S.cal&&!confirm(T2('Continue with the calendar used for this draft?','برای ادامه، تقویم را به همان تقویم زمان افزودن این برنامه برگردانیم؟')))return;
 importDrafts.restoring=true;renderImportRecovery();
 try{const data=copyJSON(record.data);if(kind==='photo'){
   for(const page of data.pages){const map=page.dayMap;page.cv=await restoreDraftCanvas(page.canvas);page.source=await restoreDraftCanvas(page.source);page.dayAt=i=>map?.[i]||0;delete page.canvas;delete page.dayMap}
   if(record.calendar!==S.cal&&!await saveSettings({cal:record.calendar}))return;
   sc={...data,draftCalendar:record.calendar,busy:false,msg:'',wk:null,fasWk:null,expertWk:null};const pi=sc.dateCheck?.pi??sc.columnPick?.pi??sc.photoRowPick?.pi??sc.rows?.[sc.ri]?.pi??0;if(sc.pages[pi])usePage(pi);sc.pick=!sc.cells&&!sc.dateCheck&&!sc.columnPick&&!sc.photoRowPick;
  }else{if(record.calendar!==S.cal&&!await saveSettings({cal:record.calendar}))return;Object.assign(fi,data,{draftCalendar:record.calendar,busy:false,error:''})}
  importDrafts.pending.delete(kind);importDrafts.error='';rosterImportChoice=null;tab=kind==='photo'?'scan':'file';
 }catch{importDrafts.error='resume'}finally{importDrafts.restoring=false;render();window.scrollTo?.(0,0)}
}
function renderImportRecovery(){
 document.querySelector('#import-recovery')?.remove();document.querySelector('#import-draft-warning')?.remove();if(tour.active||tour.finishing)return;
 const relevant=['today','scan','file'].includes(tab);if(!relevant)return;
 if(importDrafts.error){const e=document.createElement('p');e.id='import-draft-warning';e.className='scan-notice';e.setAttribute('role','status');e.textContent=importDrafts.error==='save'?T2('This review could not be kept for reopening. Keep this page open and try again.','بررسی برای باز کردن دوباره ذخیره نشد؛ این صفحه را باز نگه دار و دوباره تلاش کن.'):T2('Could not reopen the unfinished roster. Your saved schedule is safe. Try again.','برنامهٔ نیمه‌کاره باز نشد؛ برنامهٔ ثبت‌شده محفوظ است. دوباره تلاش کن.');const retry=document.createElement('button');retry.className='text-button';retry.textContent=T2('Try again','تلاش دوباره');retry.onclick=()=>retryImportDrafts();e.append(retry);$('#v').prepend(e)}
 const pending=[...importDrafts.pending].filter(k=>S.wps.some(w=>w.id===importDrafts.records[k]?.data.wp));if(!pending.length)return;
 const node=document.createElement('section');node.id='import-recovery';node.className='c import-recovery';node.innerHTML=`<b>${T2('Your roster review is unfinished. Continue?','بررسی برنامه‌ات نیمه‌کاره مونده؛ ادامه بدیم؟')}</b>${pending.map(kind=>`<div class="import-recovery-row"><span>${bidi(wp(importDrafts.records[kind].data.wp).name)} · ${kind==='photo'?T2('Photo','عکس'):T2('File','فایل')}</span><button class="p s" onclick="resumeImportDraft('${kind}')" ${importDrafts.restoring?'disabled':''}>${importDrafts.restoring?T2('Opening…','در حال باز کردن…'):T2('Continue review','ادامهٔ بررسی')}</button><details><summary aria-label="${T2('Draft options','گزینه‌های برنامهٔ نیمه‌کاره')}">···</summary><button class="text-button" onclick="discardRecoveredImport('${kind}')">${T2('Discard draft','کنار گذاشتن')}</button></details></div>`).join('')}`;tr(node);$('#v').prepend(node);
}
async function retryImportDrafts(){if(importDrafts.error==='load')await loadImportDrafts();else if(importDrafts.error==='resume'){const kind=[...importDrafts.pending][0];if(kind)return resumeImportDraft(kind)}else await queueImportDrafts();renderImportRecovery()}
function importProgressStep(){if(tab==='file')return fi.book?(fileSaveHint(filePlan())?2:3):1;if(tc.readingRoster)return 3;if(sc.cells)return ((!sc.reviewFinish&&scanPendingIndices().length)||sc.reviewEditing)?2:3;return sc.busy||sc.pick||sc.dateCheck||sc.columnPick||sc.photoRowPick||sc.align?2:1}
function renderImportProgress(){
 document.querySelector('#import-progress')?.remove();if(!['scan','file'].includes(tab)||!S.wps.length)return;
 $('#v').querySelectorAll(':scope > .steps,:scope > .setup-steps').forEach(n=>n.remove());const step=importProgressStep(),node=document.createElement('ol');node.id='import-progress';node.className='import-progress';node.setAttribute('aria-label',T2('Add roster progress','مراحل افزودن برنامه'));node.innerHTML=[T2('Choose roster','انتخاب برنامه'),T2('Check shifts','بررسی شیفت‌ها'),T2('Save roster','ثبت برنامه')].map((label,i)=>`<li class="${i+1<step?'done':i+1===step?'current':''}" ${i+1===step?'aria-current="step"':''}><span aria-hidden="true">${i+1<step?'✓':i+1}</span>${label}</li>`).join('');tr(node);$('#v').prepend(node);
}
function importSavedMessage(dates){const first=dates?.[0];if(!first)return T2('Roster saved','برنامه ثبت شد');const dt=new Date(first+'T00:00'),month=S.cal==='j'?JM[jp(dt).m-1]:dt.toLocaleDateString(loc(),{month:'long'});return T2(month+' roster saved','برنامهٔ '+month+' ثبت شد')}
function finishRosterImport(kind,workplace,dates){forgetImportDraft(kind);cm=mfirst(new Date(dates[0]+'T00:00'));sel=dates[0];vm='month';calendarWorkplace=workplace;daySelected=false;go('agenda');showChangeFeedback(importSavedMessage(dates),true)}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')queueImportDrafts()});
window.addEventListener?.('pagehide',()=>queueImportDrafts());

let gentleScrollFrame=0;
function gentleScrollTo(node){if(!node)return;const scroll=()=>{if(node.isConnected===false)return;node.scrollIntoView?.({block:'start',behavior:window.matchMedia?.('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})};if(typeof requestAnimationFrame==='function'){cancelAnimationFrame(gentleScrollFrame);gentleScrollFrame=requestAnimationFrame(scroll)}else scroll()}
function returnToMonth(){const node=$('.month-grid');gentleScrollTo(node);const date=node?.querySelector('.cell[aria-pressed="true"]')||node;date?.focus?.({preventScroll:true})}
