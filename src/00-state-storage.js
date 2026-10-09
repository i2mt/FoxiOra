/* FoxiOra — local-first shift scheduler. Sections: STORAGE · PARSER · SCHEDULE/CONFLICTS · UI.
   Times are stored as epoch-ms segments, so old shifts keep their real times if a code is later edited. */
const $=s=>document.querySelector(s), DAY=864e5;
const DEF=[['N','Night','19:30-08:00'],['D','Morning','07:30-14:30'],['E','Evening','14:00-20:00'],['n','Short night','20:00-24:00'],['M','Leave','leave'],['S','Sick leave','leave'],['OFF','Day off','off'],['*','Day off','off'],['-','Day off','off']];
const VER='v12.15';
const bootStarted=Date.now();
const DEFAULT_COMBOS=['DE','EN','En'];
const DS=()=>({wps:[],shifts:[],events:[],mates:[],gap:120,cal:'j',theme:'auto',lang:'fa',ver:3,myname:'',h24:true,fdow:6,cross:true,same:false,fh:2,weekend:[5],holidays:true,learnOCR:true,themePlaces:true,rosterDays:{},rosterPeriods:[],ocrMemory:{version:1,glyphs:[],names:[]}});
let S=DS(),tab='today',cm=new Date(),sel='',vm='month',calendarWorkplace='',daySelected=false;

/* ---------- STORAGE (IndexedDB, one state object; swap later for per-table stores) ---------- */
const db=()=>new Promise((r,j)=>{const q=indexedDB.open('shiftfox',1);q.onupgradeneeded=()=>q.result.createObjectStore('kv');q.onsuccess=()=>r(q.result);q.onerror=j});
async function load(){const d=await db();return new Promise((resolve,reject)=>{const tx=d.transaction('kv'),q=tx.objectStore('kv').get('state');let value;q.onsuccess=()=>value=q.result;tx.oncomplete=()=>{d.close();resolve(value)};tx.onerror=tx.onabort=()=>{d.close();reject(tx.error||Error('Load failed'))}})}
async function save(){const d=await db();return new Promise((resolve,reject)=>{const tx=d.transaction('kv','readwrite');tx.objectStore('kv').put(S,'state');tx.oncomplete=()=>{d.close();resolve()};tx.onerror=tx.onabort=()=>{d.close();reject(tx.error||Error('Save failed'))}})}

/* Reversible roster changes: small field patches, persisted with the same state. */
const UNDO_KEYS=['wps','shifts','mates','events','rosterDays','onboarding','swapHistory','ocrMemory','rosterPeriods','myname'];
const UNDO_ARRAYS=['wps','shifts','mates','events','swapHistory'];
const own=(o,k)=>o!=null&&Object.prototype.hasOwnProperty.call(o,k);
const copyJSON=v=>v===undefined?undefined:JSON.parse(JSON.stringify(v));
const sameJSON=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function beginChange(en,fa,keys){return{label:{en,fa},keys,history:copyJSON(S.undoHistory),before:Object.fromEntries(keys.map(k=>[k,copyJSON(S[k])]))}}
function finishChange(change){const patches=[],value=(exists,v)=>exists?{exists:true,value:copyJSON(v)}:{exists:false};
 const diff=(a,b,aExists,bExists,base,path=[])=>{if(aExists===bExists&&sameJSON(a,b))return;
  if(aExists&&bExists&&a&&b&&typeof a==='object'&&typeof b==='object'&&!Array.isArray(a)&&!Array.isArray(b)){for(const k of new Set([...Object.keys(a),...Object.keys(b)]))diff(a[k],b[k],own(a,k),own(b,k),base,[...path,k]);return}
  patches.push({...base,path,before:value(aExists,a),after:value(bExists,b)});
 };
 for(const key of change.keys){const a=change.before[key],b=S[key];if(UNDO_ARRAYS.includes(key)&&Array.isArray(a)&&Array.isArray(b)){const prev=new Map((a||[]).map((x,i)=>[x.id,{x,i}])),next=new Map((b||[]).map(x=>[x.id,x]));for(const id of new Set([...prev.keys(),...next.keys()]))diff(prev.get(id)?.x,next.get(id),prev.has(id),next.has(id),{key,id,index:prev.get(id)?.i??(b||[]).findIndex(x=>x.id===id)})}else diff(a,b,a!==undefined,b!==undefined,{key})}
 if(!patches.length)return false;
 S.undoHistory=Array.isArray(S.undoHistory)?S.undoHistory:[];S.undoHistory.push({id:'change'+Date.now()+Math.random().toString(36).slice(2,6),at:Date.now(),label:change.label,patches});S.undoHistory=S.undoHistory.slice(-20);
 while(S.undoHistory.length>1&&JSON.stringify(S.undoHistory).length>1500000)S.undoHistory.shift();return true;
}
let changeSaving=false;
async function commitChange(change){
 if(changeSaving){for(const key of change.keys)if(change.before[key]===undefined)delete S[key];else S[key]=change.before[key];return false}
 changeSaving=true;const editor=inlineEditor,buttons=[...document.querySelectorAll('button')].filter(b=>!b.disabled);buttons.forEach(b=>b.disabled=true);
 finishChange(change);
 try{await save();showChangeFeedback(T2(enLabel(change.label)+' saved',faLabel(change.label).startsWith('حذف ')?faLabel(change.label).slice(4)+' حذف شد':faLabel(change.label)+' ثبت شد'),true);return true}
 catch{for(const key of change.keys)if(change.before[key]===undefined)delete S[key];else S[key]=copyJSON(change.before[key]);if(change.history===undefined)delete S.undoHistory;else S.undoHistory=change.history;
  showChangeFeedback(T2('Could not save. Your draft is still here; try again.','ذخیره نشد؛ نوشته‌هایتان اینجاست. دوباره امتحان کنید.'));render();if(editor&&editor.view===inlineView())mountInline(editor);return false}
 finally{changeSaving=false;buttons.forEach(b=>b.disabled=false)}
}
async function saveSettings(patch){if(changeSaving||undoBusy)return false;const fields=[...document.querySelectorAll('#v input[id],#v select[id],#v textarea[id]')].map(e=>({id:e.id,value:e.value,checked:e.checked})),before=Object.fromEntries(Object.keys(patch).map(k=>[k,copyJSON(S[k])]));changeSaving=true;Object.assign(S,patch);try{await save();render();return true}catch{for(const [key,value]of Object.entries(before))if(value===undefined)delete S[key];else S[key]=value;render();for(const field of fields){const input=document.getElementById(field.id);if(input){input.value=field.value;if(input.type==='checkbox')input.checked=field.checked}}showChangeFeedback(T2('Could not save this setting. Please try again.','این تنظیم ذخیره نشد؛ دوباره امتحان کنید.'));return false}finally{changeSaving=false}}
function saveQuietly(){return save().catch(()=>showChangeFeedback(T2('Could not save yet. Please try again.','هنوز ذخیره نشد؛ دوباره امتحان کنید.')))}
async function clearData(){if(changeSaving||!confirm(T2('Delete all schedules and settings?','همهٔ برنامه‌ها و تنظیمات حذف شوند؟')))return;const previous=S;S=DS();try{await save();inlineDrafts.clear();inlineEditor=null;render()}catch{S=previous;render();showChangeFeedback(T2('Could not save. Your data is still here.','ذخیره نشد؛ اطلاعاتتان هنوز اینجاست.'))}}
const enLabel=label=>label?.en||'Change',faLabel=label=>label?.fa||'تغییر';
const undoLabel=record=>T2(enLabel(record?.label),faLabel(record?.label));
function undoRecord(){return Array.isArray(S.undoHistory)?S.undoHistory.at(-1):null}
function readUndoPatch(p){let v=p.id==null?S[p.key]:(S[p.key]||[]).find(x=>x.id===p.id),exists=p.id==null?own(S,p.key):v!==undefined;
 for(const k of p.path){exists=exists&&own(v,k);v=exists?v[k]:undefined}return exists?{exists:true,value:v}:{exists:false};}
function validUndoPatch(p){if(!p||!UNDO_KEYS.includes(p.key)||!Array.isArray(p.path)||!p.path.every(k=>typeof k==='string'&&!['__proto__','constructor','prototype'].includes(k))||!p.before||!p.after||typeof p.before.exists!=='boolean'||typeof p.after.exists!=='boolean'||(p.id!=null&&(!UNDO_ARRAYS.includes(p.key)||!Array.isArray(S[p.key]))))return false;
 if(p.path.length){let parent=p.id==null?S[p.key]:(S[p.key]||[]).find(x=>x.id===p.id);for(const k of p.path.slice(0,-1))parent=parent?.[k];if(!parent||typeof parent!=='object')return false}return true;
}
function applyUndoPatch(p){const b=p.before;if(!p.path.length){if(p.id!=null){const list=S[p.key],i=list.findIndex(x=>x.id===p.id);if(i>=0)list.splice(i,1);if(b.exists)list.splice(Math.min(Math.max(p.index||0,0),list.length),0,copyJSON(b.value));}else if(b.exists)S[p.key]=copyJSON(b.value);else delete S[p.key];return}
 let v=p.id==null?S[p.key]:S[p.key].find(x=>x.id===p.id);for(const k of p.path.slice(0,-1))v=v[k];const key=p.path.at(-1);if(b.exists)v[key]=copyJSON(b.value);else delete v[key];
}
let undoBusy=false,feedbackTimer;
async function undoLastChange(){const record=undoRecord();if(!record||undoBusy||changeSaving||sc.busy||tc.busy)return false;
 if(!Array.isArray(record.patches)||!record.patches.every(p=>validUndoPatch(p)&&sameJSON(readUndoPatch(p),p.after))){alert(T2('This part of the schedule has changed again. It cannot be restored safely.','این بخش از برنامه دوباره تغییر کرده؛ امکان برگرداندن این تغییر نیست.'));return false}
 const rollback=Object.fromEntries([...new Set(record.patches.map(p=>p.key)),'undoHistory'].map(k=>[k,copyJSON(S[k])]));undoBusy=true;try{const removed=record.patches.filter(p=>p.id!=null&&!p.path.length&&p.before.exists&&!p.after.exists);for(const p of [...record.patches].reverse().filter(p=>!removed.includes(p)))applyUndoPatch(p);for(const p of removed.sort((a,b)=>a.key.localeCompare(b.key)||a.index-b.index))applyUndoPatch(p);S.undoHistory.pop();tc.res=null;tc.dates=tc.dates.filter(id=>S.shifts.some(h=>h.id===id));tc.notice='';await save();closeDialog();render();showChangeFeedback(T2('Change undone','تغییر برگردانده شد'));return true}catch{for(const [key,value]of Object.entries(rollback))if(value===undefined)delete S[key];else S[key]=value;render();showChangeFeedback(T2('Could not save the undo. Please try again.','تغییر ذخیره نشد؛ دوباره برگرداندن را بزنید.'));return false}finally{undoBusy=false}
}
function showChangeFeedback(message,canUndo=false){const el=$('#change-feedback');if(!el)return;clearTimeout(feedbackTimer);el.innerHTML=`<span>${bidi(message)}</span>${canUndo?`<button onclick="undoLastChange()">${T2('Undo','برگرداندن')}</button>`:''}`;tr(el);isolateMixed(el);el.hidden=false;feedbackTimer=setTimeout(()=>{el.hidden=true},5000)}
const undoButton=()=>undoRecord()?`<button class="icon-button undo-button" onclick="undoLastChange()" ${sc.busy||tc.busy?'disabled':''} aria-label="${T2('Undo last change','برگرداندن آخرین تغییر')}" title="${esc(undoLabel(undoRecord()))}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5 4 10l5 5M4 10h10a6 6 0 0 1 0 12"/></svg></button>`:'';

