/* ShiftFox — local-first shift scheduler. Sections: STORAGE · PARSER · SCHEDULE/CONFLICTS · UI.
   Times are stored as epoch-ms segments, so old shifts keep their real times if a code is later edited. */
const $=s=>document.querySelector(s), DAY=864e5;
const DEF=[['N','Night','19:30-08:00'],['D','Morning','07:30-14:30'],['E','Evening','14:00-20:00'],['n','Short night','20:00-24:00'],['M','Leave','leave'],['S','Sick leave','leave'],['OFF','Day off','off'],['*','Day off','off']];
const DS=()=>({wps:[],shifts:[],events:[],gap:120,cal:'j',theme:'auto',lang:'fa',ver:3,myname:'',h24:true,fdow:6,cross:true,same:true,fh:2});
let S=DS(),tab='today',cm=new Date(),sel='',vm='agenda';

/* ---------- STORAGE (IndexedDB, one state object; swap later for per-table stores) ---------- */
const db=()=>new Promise((r,j)=>{const q=indexedDB.open('shiftfox',1);q.onupgradeneeded=()=>q.result.createObjectStore('kv');q.onsuccess=()=>r(q.result);q.onerror=j});
async function load(){const d=await db();return new Promise(r=>{const q=d.transaction('kv').objectStore('kv').get('state');q.onsuccess=()=>r(q.result)})}
async function save(){const d=await db();d.transaction('kv','readwrite').objectStore('kv').put(S,'state')}

/* ---------- SHIFT CODES ---------- */
// Text format per line: code|label|HH:MM-HH:MM  or  code|label|leave  or  code|label|off
const encCodes=cs=>cs.map(c=>`${c.code}|${c.label}|${c.type==='work'?c.start+'-'+c.end:c.type}`).join('\n');
function decCodes(t){t=nrm(t);return t.split('\n').map(l=>l.split('|').map(x=>x.trim())).filter(a=>a[0]).map(([code,label,v=''])=>{
  const m=v.match(/^(\d{1,2}:\d{2})-(\d{1,2}:\d{2})$/);return m?{code,label,type:'work',start:m[1],end:m[2]}:{code,label,type:v==='off'?'off':'leave'}})}
// Longest-match-first tokenizer: "DEn" -> D,E,n ; "N" never becomes "n" (case-sensitive).
function parse(wp,text){const cs=[...wp.codes].sort((a,b)=>b.code.length-a.code.length);let i=0,out=[];
  while(i<text.length){const c=cs.find(c=>text.startsWith(c.code,i));if(!c)return null;out.push(c);i+=c.code.length}return out.length?out:null}
const at=(d,t)=>{const[h,m]=t.split(':');const[y,mo,da]=d.split('-');return new Date(+y,mo-1,+da,+h,+m).getTime()};
function makeSegs(date,codes){return codes.filter(c=>c.type==='work').map(c=>{const s=at(date,c.start);let e=at(date,c.end);if(e<=s)e+=DAY;return{s,e,code:c.code}})}

/* ---------- SCHEDULE / CONFLICT ENGINE ---------- */
const segs=()=>S.shifts.flatMap(h=>h.segs.map(g=>({...g,wp:h.wp,sh:h.id}))).sort((a,b)=>a.s-b.s);
function issues(){const out=[];let m=null;for(const g of segs()){if(m){
  if(g.s<m.e){if(m.wp===g.wp?S.same:S.cross)out.push({t:'o',a:m,b:g,min:(Math.min(m.e,g.e)-g.s)/6e4})}
  else if((g.s-m.e)/6e4<S.gap&&m.sh!==g.sh)out.push({t:'g',a:m,b:g,min:(g.s-m.e)/6e4})}
  if(!m||g.e>m.e)m=g}return out}
const wp=id=>S.wps.find(w=>w.id===id)||{name:'?',color:'#888'};
const dur=m=>{m=Math.round(m);const u=S.lang==='fa'?['س ','د']:['h ','m'];return (m>=60?Math.floor(m/60)+u[0]:'')+(m%60?m%60+u[1]:'')||'0'+u[1]};
const hm=ms=>{const d=new Date(ms);return S.h24?String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0'):d.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'})};
const iso=d=>{d=new Date(d);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const loc=()=>S.cal==='j'?'fa-IR-u-ca-persian':S.lang==='fa'?'fa-IR-u-ca-gregory':'en-GB';
const dlabel=d=>new Date(d+'T00:00').toLocaleDateString(loc(),{weekday:'short',day:'numeric',month:'short'});
const badge=(sh)=>issues().filter(i=>i.a.sh===sh||i.b.sh===sh).map(i=>`<span class="bad ${i.t}">${i.t==='o'?'Overlap '+dur(i.min):'Gap '+dur(i.min)}</span>`).join(' ');
const segTxt=g=>`${g.code} ${hm(g.s)}→${hm(g.e)}`;

/* ---------- UI ---------- */
const V={};
function go(t){tab=t;render()}
function render(){document.documentElement.dataset.ac=S.ac||'fox';document.documentElement.dataset.theme=S.theme==='auto'?'':S.theme;
  $('nav').innerHTML=NAV.map(([k,i,l])=>`<button class="${k===tab?'on':''}" onclick="go('${k}')"><i>${i}</i>${l}</button>`).join('');$('#v').innerHTML=V[tab]();document.documentElement.lang=S.lang;document.documentElement.dir=S.lang==='fa'?'rtl':'ltr';hdr();tr($('nav'));tr($('#hd'));tr($('#v'))}
const dlg=h=>{$('#dlg').innerHTML=h;tr($('#dlg'));$('#dlg').showModal()};const close=()=>$('#dlg').close();

const cLabel=g=>(wp(g.wp).codes||[]).find(c=>c.code===g.code)?.label||g.code;
function hdr(){const L=NAV.find(n=>n[0]===tab)[2];$('#hd').innerHTML=`<b>${L}</b><span class="mu">${new Date().toLocaleDateString(loc(),{weekday:'long',day:'numeric',month:'long'})}</span>`;document.querySelector('.fab').style.display=['today','agenda'].includes(tab)?'':'none'}
V.today=()=>{if(!S.wps.length)return`<div class="empty"><div class="big">Welcome</div><p class="mu">Add your first workplace to start.</p><button class="p" onclick="go('places')">Add workplace</button></div>`;
  const now=Date.now(),a=segs(),cur=a.find(g=>g.s<=now&&now<g.e),nxt=a.filter(g=>g.s>now),hero=cur||nxt[0],after=(cur?nxt:nxt.slice(1))[0],is=issues().filter(i=>i.b.s>now);
  const hv=hero?`<div class="hero" style="--w:${wp(hero.wp).color}"><div class="row"><span class="pill">${cur?'NOW':'NEXT SHIFT'}</span><span class="mu">${new Date(hero.s).toLocaleDateString(loc(),{weekday:'long',day:'numeric',month:'short'})}</span></div>
   <div class="hl">${cLabel(hero)}</div><div class="hr">${hm(hero.s)} → ${hm(hero.e)}</div><div style="opacity:.85">${wp(hero.wp).name}</div>
   <div class="cd"><span>${cur?'Ends in':'Starts in'}</span><b>${dur(((cur?cur.e:hero.s)-now)/6e4)}</b></div>${cur?`<div class="prog"><i style="width:${Math.round((now-cur.s)/(cur.e-cur.s)*100)}%"></i></div>`:''}</div>`:`<div class="c mu">No upcoming shifts.</div>`;
  const t=new Date(),bad=new Set(issues().flatMap(i=>[iso(i.a.s),iso(i.b.s)])),strip=[...Array(7)].map((_,k)=>{const d=new Date(t.getFullYear(),t.getMonth(),t.getDate()+k),ds=iso(d),hs=S.shifts.filter(h=>h.date===ds);
   return `<div class="dchip${k?'':' t'}" style="--w:${hs[0]?wp(hs[0].wp).color:'var(--mu)'}" onclick="sel='${ds}';vm='month';cm=mfirst(new Date('${ds}T00:00'));go('agenda')">${d.toLocaleDateString(loc(),{weekday:'short'})}<b>${d.toLocaleDateString(loc(),{day:'numeric'})}</b><em>${hs.map(h=>h.text).join(' ')||'·'}</em>${bad.has(ds)?'<span class="bad o">!</span>':''}</div>`}).join('');
  const wk=a.filter(g=>g.s>=now-DAY&&g.s<now+7*DAY),no=is.filter(i=>i.t==='o').length,ng=is.length-no;
  return hv+`<div class="strip">${strip}</div>`+(after?`<div class="c bar row" style="--w:${wp(after.wp).color}"><div><span class="mu">AFTER THAT</span><div><b>${cLabel(after)}</b> · ${wp(after.wp).name}</div></div><div class="mu" style="direction:ltr">${hm(after.s)}→${hm(after.e)}</div></div>`:'')
   +`<div class="c row"><span>${wk.length} shifts · ${dur(wk.reduce((x,g)=>x+(g.e-g.s)/6e4,0))}</span><span>${no?`<span class="bad o">${no} conflict</span> `:''}${ng?`<span class="bad g">${ng} tight</span>`:''}</span></div>`
   +is.slice(0,3).map(i=>`<div class="c mu">${i.t==='o'?'⚠️ Overlap':'🟠 Gap'} ${dur(i.min)}<br>${wp(i.a.wp).name} ${segTxt(i.a)}<br>${wp(i.b.wp).name} ${segTxt(i.b)}</div>`).join('')};

const listV=()=>{const from=iso(Date.now()-DAY),l=[...S.shifts].filter(h=>h.date>=from).sort((a,b)=>a.date<b.date?-1:1);
  if(!l.length)return`<h1>AGENDA</h1><div class="c mu">No shifts yet. Tap + to add one.</div>`;
  let last='';return'<h1>AGENDA</h1>'+l.map(h=>{const head=h.date!==last?`<h1>${dlabel(h.date)}</h1>`:'';last=h.date;
   return head+`<div class="c bar row" style="--w:${wp(h.wp).color}" onclick="delShift('${h.id}')"><div><b>${h.text}</b> · ${wp(h.wp).name}<div class="mu">${h.segs.map(segTxt).join(' + ')||h.label}</div></div><div>${badge(h.id)}</div></div>`}).join('')};

V.places=()=>'<h1>WORKPLACES</h1>'+S.wps.map(w=>`<div class="c bar row" style="--w:${w.color}" onclick="editWp('${w.id}')"><div><b>${w.name}</b><div class="mu">${w.codes.map(c=>c.code).join(' ')}</div></div>›</div>`).join('')+`<button class="p" onclick="editWp()">+ Add workplace</button>`;
V.scan=()=>`<h1>SCAN</h1><div class="c"><b>Roster scanner — Stage 5</b><p class="mu">Will use local Tesseract.js. Import will feed the same parse() + makeSegs() used for manual entry, so nothing here needs to change.</p></div>`;
V.set=()=>{const o=(a,c)=>a.map(([v,l])=>`<option value="${v}" ${String(c)===String(v)?'selected':''}>${l}</option>`).join(''),
 sw=(k,l)=>`<label class="row" style="margin:6px 0"><span>${l}</span><input type=checkbox style="width:auto" ${S[k]?'checked':''} onchange="S.${k}=this.checked;save();render()"></label>`;
 return `<h1>GENERAL</h1><div class="c"><label class="mu">Language</label><select onchange="S.lang=this.value;save();render()">${o([['en','English'],['fa','فارسی']],S.lang)}</select>
<label class="mu">Calendar</label><select onchange="S.cal=this.value;save();render()">${o([['g','Gregorian'],['j','Jalali']],S.cal)}</select>
<label class="mu">First day of week</label><select onchange="S.fdow=+this.value;save();render()">${o([[6,'Sat'],[0,'Sun'],[1,'Mon']],S.fdow)}</select>
<label class="mu">Theme</label><select onchange="S.theme=this.value;save();render()">${o([['auto','auto'],['light','light'],['dark','dark']],S.theme)}</select><label class="mu">Accent</label><select onchange="S.ac=this.value;save();render()">${o([['fox','Fox'],['ocean','Ocean'],['forest','Forest'],['violet','Violet']],S.ac||'fox')}</select>${sw('h24','24-hour clock')}</div>
<h1>CONFLICTS</h1><div class="c"><label class="mu">Short gap is less than</label><select onchange="S.gap=+this.value;save();render()">${o([[60,'1 h'],[120,'2 h'],[240,'4 h']],S.gap)}</select>${sw('cross','Cross-workplace conflicts')}${sw('same','Same-workplace overlaps')}</div>
<h1>DATA</h1><button class="p" onclick="exp()">Export backup</button><input type="file" accept=".json" onchange="imp(this.files[0])"><button class="p" style="background:var(--red)" onclick="if(confirm('Delete all data?')){S=DS();save();render()}">Clear data</button>`};

function editWp(id){const w=S.wps.find(x=>x.id===id)||{name:'',color:'#3b82f6',codes:decCodes(DEF.map(d=>d.join('|')).join('\n'))};
  dlg(`<h3>${id?'Edit':'New'} workplace</h3><input id=wn placeholder="Name" value="${w.name}"><input id=wc type=color value="${w.color}">
  <div class=mu>Shift codes — code|label|HH:MM-HH:MM (or leave / off). Changes affect new shifts only.</div><textarea id=wt rows=9 autocapitalize=off>${encCodes(w.codes)}</textarea>
  <button class=p onclick="saveWp('${id||''}')">Save</button>${id?`<button class=p style="background:var(--red);margin-top:8px" onclick="delWp('${id}')">Delete</button>`:''}`)}
function saveWp(id){const n=$('#wn').value.trim();if(!n)return;const o={name:n,color:$('#wc').value,codes:decCodes($('#wt').value)};
  if(id)Object.assign(S.wps.find(w=>w.id===id),o);else S.wps.push({id:'w'+Date.now(),...o});save();close();render()}
function delWp(id){if(!confirm('Delete workplace and its shifts?'))return;S.wps=S.wps.filter(w=>w.id!==id);S.shifts=S.shifts.filter(h=>h.wp!==id);save();close();render()}

function chips(){const w=S.wps.find(x=>x.id===$('#fw').value);$('#ch').innerHTML=w.codes.map(c=>`<span class=chip onclick="$('#fc').value+='${c.code}'">${c.code} ${c.label}</span>`).join('')}
function addShift(){if(!S.wps.length){go('places');return editWp()}
  dlg(`<h3>Add shift</h3><select id=fw onchange=chips()>${S.wps.map(w=>`<option value="${w.id}">${w.name}</option>`)}</select>${dField('fd',iso(Date.now()))}<input id=fc placeholder="e.g. N, DE, OFF" autocapitalize=off><div id=ch></div><button class=p onclick=saveShift()>Save</button>`);chips()}
function saveShift(){const w=S.wps.find(x=>x.id===$('#fw').value),d=dGet('fd'),t=nrm($('#fc').value.trim()),cs=parse(w,t);
  if(!d||!cs)return alert('Unknown code for this workplace');
  S.shifts=S.shifts.filter(h=>!(h.wp===w.id&&h.date===d)); // re-entering a day replaces it (no duplicates)
  S.shifts.push({id:'s'+Date.now(),wp:w.id,date:d,text:t,label:cs.map(c=>c.label).join(' + '),segs:makeSegs(d,cs)});save();close();render()}
function delShift(id){if(confirm('Delete this shift?')){S.shifts=S.shifts.filter(h=>h.id!==id);save();render()}}
function exp(){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(S)],{type:'application/json'}));a.download='shiftfox-backup.json';a.click()}
async function imp(f){if(f){S={...DS(),...JSON.parse(await f.text())};save();render()}}


/* ===== v2: i18n (fa/RTL), month view, personal events, free time ===== */
document.head.insertAdjacentHTML('beforeend','<style>.grid{display:grid;grid-template-columns:repeat(7,1fr);gap:3px;margin:8px 0}.cell{background:var(--card);border:1px solid var(--ln);border-radius:8px;min-height:50px;padding:3px;font-size:12px;text-align:center}.cell.sel{border-color:var(--ac)}.cell i{display:inline-block;width:6px;height:6px;border-radius:3px;margin:1px}.row button:not(.p){background:none;border:0;color:var(--tx);font-size:22px}</style>');
const NAV=[['today',`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>`,'Today'],['agenda',`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="5" width="16" height="15" rx="3"/><path d="M4 10h16M8 3v4M16 3v4"/></svg>`,'Calendar'],['places',`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20V8l8-4 8 4v12M9 20v-6h6v6"/></svg>`,'Places'],['scan',`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8V6a2 2 0 012-2h2M16 4h2a2 2 0 012 2v2M20 16v2a2 2 0 01-2 2h-2M8 20H6a2 2 0 01-2-2v-2M4 12h16"/></svg>`,'Scan'],['set',`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/></svg>`,'Settings']];
// UI translations: matched as text inside rendered DOM text nodes (longest key first). Add keys here to translate more.
const FA={'NEXT 7 DAYS':'۷ روز آینده','NEXT SHIFT':'شیفت بعدی','AFTER THAT':'پس از آن',WORKPLACES:'محل‌های کار',GENERAL:'عمومی',CONFLICTS:'تداخل‌ها',DATA:'داده‌ها',AGENDA:'برنامه',Today:'امروز',Calendar:'تقویم',Places:'محل‌ها',Scan:'اسکن',Settings:'تنظیمات',NOW:'اکنون',Welcome:'خوش آمدید','Add workplace':'افزودن محل کار','Add shift':'افزودن شیفت','Personal event':'رویداد شخصی','Free time':'زمان آزاد',Save:'ذخیره',Delete:'حذف',Overlap:'تداخل',Gap:'فاصله کم',shifts:'شیفت',conflict:'تداخل',tight:'فاصله کم','Ends in':'پایان تا','Starts in':'شروع تا','Export backup':'خروجی پشتیبان','Clear data':'پاک کردن داده‌ها',Theme:'پوسته',Language:'زبان',Gregorian:'میلادی',Jalali:'شمسی',Month:'ماه',List:'فهرست','First day of week':'اولین روز هفته','24-hour clock':'ساعت ۲۴ ساعته','Short gap is less than':'فاصله کم یعنی کمتر از','Cross-workplace conflicts':'تداخل بین محل‌ها','Same-workplace overlaps':'تداخل در یک محل','Free for at least':'آزاد برای حداقل','No shifts yet. Tap + to add one.':'هنوز شیفتی ثبت نشده. + را بزنید.',Accent:'رنگ تم',Fox:'روباه',Ocean:'اقیانوس',Forest:'جنگل',Violet:'بنفش',Camera:'دوربین',Gallery:'گالری','Needs review':'نیاز به بررسی','read':'خوانده شد','Reading the table…':'در حال خواندن جدول…','Reading cells':'در حال خواندن خانه‌ها','Preparing image…':'آماده‌سازی تصویر…','Tap a code to fix':'برای اصلاح یک کد را بزنید',Sat:'شنبه',Sun:'یکشنبه',Mon:'دوشنبه','Photograph / choose roster':'عکس برنامه شیفت / انتخاب فایل','Your name':'نام شما',Workplace:'محل کار',Import:'ثبت در برنامه',Back:'بازگشت','Search again':'جستجوی دوباره','Name not found in the photo. Check the spelling and try again':'نام در عکس پیدا نشد؛ املا را بررسی و دوباره تلاش کنید','Could not find the date row':'ردیف تاریخ‌ها پیدا نشد'};
const KEYS=Object.keys(FA).sort((a,b)=>b.length-a.length), PD='۰۱۲۳۴۵۶۷۸۹';
const AD='٠١٢٣٤٥٦٧٨٩',nrm=t=>t.replace(/[۰-۹٠-٩]/g,d=>PD.indexOf(d)>=0?PD.indexOf(d):AD.indexOf(d));
function tr(root){if(S.lang!=='fa')return;const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let n;
  while(n=w.nextNode()){if(n.parentNode.tagName==='TEXTAREA')continue;let v=n.nodeValue;for(const k of KEYS)v=v.split(k).join(FA[k]);n.nodeValue=v.replace(/\d/g,d=>PD[d])}}
const vbtn=(k,l)=>`<button class="${vm===k?'on':''}" onclick="vm='${k}';render()">${l}</button>`;
const mfirst=d=>{d=new Date(d);return new Date(d.getFullYear(),d.getMonth(),d.getDate()-(S.cal==='j'?jp(d).d-1:d.getDate()-1))};
const mv=n=>{const d=mfirst(cm);cm=mfirst(n>0?new Date(d.getFullYear(),d.getMonth(),d.getDate()+32):new Date(d.getFullYear(),d.getMonth(),d.getDate()-1));render()}, pick=d=>{sel=d;render()};
// Month grid follows the chosen calendar: a Jalali month is built from real Jalali day boundaries (via Intl).
const monthV=()=>{const first=mfirst(cm),J=S.cal==='j',key=d=>J?jp(d).m:d.getMonth(),days=[];
  for(let d=first;key(d)===key(first);d=new Date(d.getFullYear(),d.getMonth(),d.getDate()+1))days.push(d);
  const off=(first.getDay()-S.fdow+7)%7,bad=new Set(issues().flatMap(i=>[iso(i.a.s),iso(i.b.s)]));
  const wd=[...Array(7)].map((_,i)=>`<div class="mu" style="text-align:center">${new Date(2024,0,7+(i+S.fdow)%7).toLocaleDateString(loc(),{weekday:'narrow'})}</div>`).join('');
  let c='<div></div>'.repeat(off);
  for(const d of days){const ds=iso(d);c+=`<div class="cell${ds===sel?' sel':''}" onclick="pick('${ds}')">${d.toLocaleDateString(loc(),{day:'numeric'})}<div>${S.shifts.filter(h=>h.date===ds).map(h=>`<i style="background:${wp(h.wp).color}"></i>`).join('')}${bad.has(ds)?'<i style="background:var(--red)"></i>':''}</div></div>`}
  return `<div class="row"><button onclick="mv(-1)">‹</button><b>${first.toLocaleDateString(loc(),{month:'long',year:'numeric'})}</b><button onclick="mv(1)">›</button></div><div class="grid">${wd}${c}</div>`+dayV()};
const dayV=()=>{const hs=S.shifts.filter(h=>h.date===sel),ev=S.events.filter(e=>iso(e.s)===sel);
  return `<h1>${dlabel(sel)}</h1>`+hs.map(h=>`<div class="c bar row" style="--w:${wp(h.wp).color}" onclick="delShift('${h.id}')"><div><b>${h.text}</b> · ${wp(h.wp).name}<div class="mu">${h.segs.map(segTxt).join(' + ')||h.label}</div></div><div>${badge(h.id)}</div></div>`).join('')
   +ev.map(e=>`<div class="c" onclick="delEvent('${e.id}')"><b>${e.title}</b><div class="mu">${hm(e.s)}→${hm(e.e)}</div></div>`).join('')+`<button class="p" onclick="addEvent()">+ Personal event</button>`};
// Free time: waking window 08:00–22:00 each day for 7 days, minus shifts and personal events.
function free(min){const b=[...segs(),...S.events].sort((x,y)=>x.s-y.s),out=[],t=new Date();
  for(let i=0;i<7;i++){const d=iso(new Date(t.getFullYear(),t.getMonth(),t.getDate()+i)),we=at(d,'22:00');let p=Math.max(at(d,'08:00'),Date.now());
    for(const g of b){if(g.e<=p||g.s>=we)continue;if(g.s>p&&(g.s-p)/6e4>=min)out.push([p,g.s]);p=Math.max(p,g.e)}
    if(we>p&&(we-p)/6e4>=min)out.push([p,we])}return out}
const freeV=()=>`<h1>Free time</h1><div class="c"><div class="row"><span class="mu">Free for at least</span><select style="width:auto;margin:0" onchange="S.fh=+this.value;save();render()">${[1,2,3,4].map(h=>`<option value="${h}" ${S.fh===h?'selected':''}>${h} h</option>`).join('')}</select></div>${free(S.fh*60).slice(0,8).map(([a,b])=>`<div>${new Date(a).toLocaleDateString(loc(),{weekday:'short',day:'numeric'})} ${hm(a)}→${hm(b)} <span class="mu">${dur((b-a)/6e4)}</span></div>`).join('')||'<span class="mu">—</span>'}</div>`;
function addEvent(){dlg(`<h3>Personal event</h3><input id=et placeholder="Title"><select id=ety>${['appointment','gym','university','trip','task','custom'].map(x=>`<option>${x}</option>`).join('')}</select>${dField('ed',sel)}<input id=es type=time value="10:00"><input id=ee type=time value="11:00"><button class=p onclick=saveEvent()>Save</button>`)}
function saveEvent(){const d=dGet('ed');if(!d)return;const s=at(d,$('#es').value);let e=at(d,$('#ee').value);if(e<=s)e+=DAY;
  S.events.push({id:'e'+Date.now(),title:$('#et').value||$('#ety').value,type:$('#ety').value,s,e});save();close();render()}
function delEvent(id){if(confirm('Delete?')){S.events=S.events.filter(e=>e.id!==id);save();render()}}
V.agenda=()=>`<div class="seg">${vbtn('agenda','List')}${vbtn('month','Month')}</div>`+(vm==='month'?monthV():listV())+freeV();


/* ===== v3: Jalali helpers + roster scanner ===== */
const JF=new Intl.DateTimeFormat('en-US-u-ca-persian-nu-latn',{year:'numeric',month:'numeric',day:'numeric'});
const jp=d=>{const o={};JF.formatToParts(new Date(d)).forEach(p=>o[p.type]=p.value);return{y:+o.year,m:+o.month,d:+o.day}};
const fromJ=(y,m,d)=>{let t=new Date(y+621,2,10);for(let i=0;i<420;i++){const j=jp(t);if(j.y===y&&j.m===m&&j.d===d)return t;t=new Date(t.getFullYear(),t.getMonth(),t.getDate()+1)}return null};
const PDg=x=>String(x).replace(/\d/g,d=>PD[d]);
const jstr=v=>{const j=jp(new Date(v+'T00:00'));return j.y+'/'+String(j.m).padStart(2,'0')+'/'+String(j.d).padStart(2,'0')};
const dField=(id,v)=>S.cal==='j'?`<input id=${id} inputmode="numeric" dir="ltr" value="${PDg(jstr(v))}">`:`<input id=${id} type=date value="${v}">`;
const dGet=id=>{const v=$('#'+id).value;if(S.cal!=='j')return v;const p=nrm(v).split(/[\/\-.]/).map(Number);if(p.length!==3||p.some(isNaN))return'';const t=fromJ(...p);return t?iso(t):''};
const JM=['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'];

// Scanner pipeline: enhance photo -> OCR #1 (layout: dates + names) -> locate header row & your row -> OCR #2 per cell (single-line, code whitelist) -> review with crops.
let sc={wp:'',name:'',y:0,m:0,words:null,cells:null,msg:'',busy:false,img:'',cv:null};
const OCR_FILES=['tesseract.min.js','worker.min.js','tesseract-core-simd-lstm.wasm.js','tesseract-core-lstm.wasm.js','lang/eng.traineddata.gz','lang/fas.traineddata.gz'];
// Checks every OCR file is reachable and names the missing ones, then loads the library.
const loadScript=async u=>{if(window.Tesseract)return;const B=BASE(),miss=[];
  for(const f of OCR_FILES){const r=await fetch(B+f,{method:'HEAD',cache:'no-store'}).catch(()=>null);if(!r||!r.ok)miss.push('vendor/'+f+(r?' ('+r.status+')':''))}
  if(miss.length)throw Error('Missing on the server: '+miss.join(', '));
  await new Promise((ok,no)=>{const e=document.createElement('script');e.src=u;e.onload=ok;e.onerror=()=>no(Error('Could not run vendor/tesseract.min.js'));document.head.append(e)})};
const nn=t=>nrm(t).replace(/ي/g,'ی').replace(/ك/g,'ک').replace(/[\u200c\s]/g,'').toLowerCase();
const lev=(a,b)=>{const d=[...Array(b.length+1).keys()];for(let i=1;i<=a.length;i++){let p=d[0];d[0]=i;for(let j=1;j<=b.length;j++){const t=d[j];d[j]=Math.min(d[j]+1,d[j-1]+1,p+(a[i-1]===b[j-1]?0:1));p=t}}return d[b.length]};
const cleanCode=t=>{t=t.replace(/[—–_−]/g,'-').replace(/[|!\[\]()]/g,'');return /^-+$/.test(t)?'*':/^off$/i.test(t)?'OFF':t};
const BASE=()=>new URL('vendor/',location.href).href;
const P=(t,p)=>{const e=$('#prog');if(e){e.textContent=t;tr(e)}const b=$('#pbar i');if(b&&p!=null)b.style.width=Math.round(p*100)+'%'};
function enhance(cv){const x=cv.getContext('2d'),im=x.getImageData(0,0,cv.width,cv.height),d=im.data,h=new Uint32Array(256);
  for(let i=0;i<d.length;i+=4){const g=(d[i]*.3+d[i+1]*.59+d[i+2]*.11)|0;d[i]=g;h[g]++}
  const n=d.length/4;let a=0,lo=0,hi=255;for(;lo<255&&(a+=h[lo])<n*.02;lo++);a=0;for(;hi>0&&(a+=h[hi])<n*.02;hi--);const k=255/Math.max(1,hi-lo);
  for(let i=0;i<d.length;i+=4){const g=Math.max(0,Math.min(255,(d[i]-lo)*k));d[i]=d[i+1]=d[i+2]=g}x.putImageData(im,0,0)}
function crop(cx,cy,w,h){const k=72/h,o=document.createElement('canvas');o.width=Math.round(w*k)+32;o.height=104;const x=o.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,o.width,o.height);x.drawImage(sc.cv,cx-w/2,cy-h/2,w,h,16,16,w*k,72);return o}
V.scan=()=>{if(!S.wps.length)return`<h1>SCAN</h1><div class="c">Add a workplace first.</div>`;
  if(sc.busy)return`<div class="steps"><span class="on"></span><span class="on"></span><span></span></div><div class="c"><img class="pv" src="${sc.img}"><div class="pbar"><i></i></div><div id="prog" class="mu" style="margin-top:8px"></div></div>`;
  if(sc.cells)return reviewV();
  const J=S.cal==='j',n=jp(Date.now()),y=sc.y||(J?n.y:new Date().getFullYear()),m=sc.m||(J?n.m:new Date().getMonth()+1);
  sc.wp=sc.wp||S.wps[0].id;sc.name=sc.name||S.myname||'';
  const mn=i=>J?JM[i-1]:new Date(2024,i-1,1).toLocaleDateString(loc(),{month:'long'}),inp=(cap)=>`<input type=file accept="image/*" ${cap?'capture=environment':''} hidden onchange="scanFile(this.files[0]);this.value=''">`;
  return `<div class="steps"><span class="on"></span><span></span><span></span></div><div class="c"><label class=mu>Workplace</label><select id=sw>${S.wps.map(w=>`<option value="${w.id}" ${w.id===sc.wp?'selected':''}>${w.name}</option>`).join('')}</select>
<label class=mu>Your name</label><input id=sn value="${sc.name}"><div class=row style="gap:8px"><select id=sm>${[...Array(12)].map((_,i)=>`<option value=${i+1} ${i+1===m?'selected':''}>${mn(i+1)}</option>`).join('')}</select><input id=sy inputmode=numeric dir=ltr value="${PDg(y)}" style="width:100px"></div>
<div class=row style="gap:8px"><label class=p>${inp(1)}Camera</label><label class="p s">${inp(0)}Gallery</label></div>
${sc.words?'<button class="p s" style="margin-top:8px" onclick="rematch()">Search again</button>':''}<div id=prog class=mu style="margin-top:8px;color:var(--red)">${sc.msg}</div></div>`};
function readForm(){sc.wp=$('#sw').value;sc.name=$('#sn').value.trim();sc.m=+$('#sm').value;sc.y=+nrm($('#sy').value);S.myname=sc.name;save()}
async function rematch(){readForm();sc.busy=true;sc.msg='';render();await finish()}
async function scanFile(f){if(!f)return;readForm();sc.msg='';sc.cells=null;
  try{const img=await createImageBitmap(f),k=Math.min(1,2400/Math.max(img.width,img.height)),cv=document.createElement('canvas');cv.width=img.width*k;cv.height=img.height*k;cv.getContext('2d').drawImage(img,0,0,cv.width,cv.height);
    sc.cv=cv;sc.busy=true;const sm=document.createElement('canvas');sm.width=1200;sm.height=1200*cv.height/cv.width;sm.getContext('2d').drawImage(cv,0,0,sm.width,sm.height);sc.img=sm.toDataURL('image/jpeg',.7);render();
    P('Preparing image…',.05);enhance(cv);const B=BASE();await loadScript(B+'tesseract.min.js');P('Reading the table…',.1);
    const wk=await Tesseract.createWorker('eng+fas',1,{workerPath:B+'worker.min.js',corePath:B,langPath:B+'lang',gzip:true,logger:m=>m.status==='recognizing text'&&P('Reading the table…',.1+m.progress*.4)});
    await wk.setParameters({tessedit_pageseg_mode:'11'});const r=await wk.recognize(cv);await wk.terminate();
    sc.words=r.data.words.filter(w=>w.text.trim()).map(w=>({t:nrm(w.text.trim()),x:(w.bbox.x0+w.bbox.x1)/2,y:(w.bbox.y0+w.bbox.y1)/2,h:w.bbox.y1-w.bbox.y0,c:w.confidence}));
    await finish()}catch(e){sc.busy=false;sc.msg='Scan failed: '+e.message;render()}}
async function finish(){try{if(!findRow()){sc.busy=false;return render()}await readCells()}catch(e){sc.msg='Scan failed: '+e.message;sc.cells=null}sc.busy=false;render()}
function findRow(){const W=sc.words,hs=W.map(w=>w.h).sort((a,b)=>a-b),mh=hs[hs.length>>1],tol=mh*.7,rows=[];
  [...W].sort((a,b)=>a.y-b.y).forEach(w=>{const r=rows.find(r=>Math.abs(r.y-w.y)<tol);if(r){r.y=(r.y*r.w.length+w.y)/(r.w.length+1);r.w.push(w)}else rows.push({y:w.y,w:[w]})});
  const isD=w=>/^\d{1,2}$/.test(w.t)&&+w.t>=1&&+w.t<=31,cnt=r=>r.w.filter(isD).length,hdr=rows.reduce((b,r)=>!b||cnt(r)>cnt(b)?r:b,null);
  let cols=hdr?hdr.w.filter(isD).sort((a,b)=>a.x-b.x):[];cols=[...new Map(cols.map(c=>[c.t,c])).values()];
  if(cols.length<5){sc.msg='Could not find the date row';sc.words=null;return false}
  const gaps=cols.slice(1).map((c,i)=>Math.abs(c.x-cols[i].x)).sort((a,b)=>a-b),pitch=gaps[gaps.length>>1];
  const toks=sc.name.split(/\s+/).map(nn).filter(Boolean),score=r=>toks.filter(k=>r.w.some(w=>{const t=nn(w.t);return t===k||(k.length>3&&lev(t,k)<=1)})).length/(toks.length||1);
  const best=rows.filter(r=>r!==hdr).reduce((b,r)=>!b||score(r)>score(b)?r:b,null);
  if(!best||!toks.length||score(best)<.5){sc.msg='Name not found in the photo. Check the spelling and try again';return false}
  const J=S.cal==='j',b0=J?fromJ(sc.y,sc.m,1):new Date(sc.y,sc.m-1,1);sc.pitch=pitch;sc.mh=mh;sc.row=best.y;sc.hdrY=hdr.y;
  sc.cells=cols.map(c=>{const ws=best.w.filter(w=>Math.abs(w.x-c.x)<pitch*.55&&!cols.includes(w)).sort((a,b)=>a.x-b.x),d=new Date(b0.getFullYear(),b0.getMonth(),b0.getDate()+ +c.t-1),ok=J?jp(d).m===sc.m:d.getMonth()===sc.m-1;
    return ok&&{day:+c.t,x:c.x,date:iso(d),text:cleanCode(ws.map(w=>w.t).join('')),c:ws.length?Math.min(...ws.map(w=>w.c)):0}}).filter(Boolean);
  return true}
async function readCells(){const w=S.wps.find(x=>x.id===sc.wp),B=BASE(),n=sc.cells.length;
  const wk=await Tesseract.createWorker('eng',1,{workerPath:B+'worker.min.js',corePath:B,langPath:B+'lang',gzip:true});
  await wk.setParameters({tessedit_pageseg_mode:'7',tessedit_char_whitelist:[...new Set(w.codes.map(c=>c.code).join('')+'-')].join('')});
  for(let i=0;i<n;i++){const c=sc.cells[i];P('Reading cells '+(i+1)+'/'+n,.5+.5*i/n);const cr=crop(c.x,sc.row,sc.pitch*.9,sc.mh*1.8);c.img=cr.toDataURL('image/jpeg',.7);
    const r=await wk.recognize(cr),t=cleanCode(r.data.text.replace(/\s/g,''));if(t&&(!c.text||r.data.confidence>=c.c)){c.text=t;c.c=r.data.confidence}}
  await wk.terminate()}
const cState=(w,c)=>!c.text?'empty':!parse(w,c.text)?'bad':c.c<80?'low':'ok';
const setCell=(i,v)=>{sc.cells[i].text=v;sc.cells[i].c=100;render()};
const reviewV=()=>{const w=S.wps.find(x=>x.id===sc.wp),st=sc.cells.map(c=>cState(w,c)),chk=st.filter(x=>x!=='ok').length,n=st.filter(x=>x!=='empty').length;
  const ov=`<svg viewBox="0 0 ${sc.cv.width} ${sc.cv.height}" class="pv"><image href="${sc.img}" width="${sc.cv.width}" height="${sc.cv.height}"/><rect x="0" y="${sc.hdrY-sc.mh}" width="${sc.cv.width}" height="${sc.mh*2}" fill="#2b7be4" opacity=".3"/><rect x="0" y="${sc.row-sc.mh}" width="${sc.cv.width}" height="${sc.mh*2}" fill="#ec6a1c" opacity=".35"/></svg>`;
  return `<div class="steps"><span class="on"></span><span class="on"></span><span class="on"></span></div>${ov}<div class="row" style="margin:0 4px 10px"><b>${sc.name} · ${w.name}</b><span class="bad ${chk?'g':''}" style="${chk?'':'background:var(--ok)'}">${chk?chk+' Needs review':n+' ✓'}</span></div>`
   +sc.cells.map((c,i)=>{const k=st[i];return `<div class="c cr ${k==='ok'?'':'w'}" style="padding:8px 10px"><img src="${c.img}"><div style="flex:1"><div class="mu">${dlabel(c.date)}</div><input dir=ltr style="margin:2px 0;text-align:center" value="${c.text}" onchange="setCell(${i},nrm(this.value.trim()))">${k==='ok'||k==='empty'?'':`<div>${w.codes.map(x=>`<span class=chip onclick="setCell(${i},'${x.code}')">${x.code}</span>`).join('')}</div>`}</div></div>`}).join('')
   +`<div class="sticky"><button class=p onclick=doImport()>Import ${n}</button><button class="p s" style="margin-top:6px" onclick="sc.cells=null;sc.words=null;render()">Back</button></div>`};
function doImport(){const w=S.wps.find(x=>x.id===sc.wp),L=sc.cells.filter(c=>c.text);
  const bad=L.filter(c=>!parse(w,c.text)).length,unsure=L.filter(c=>c.c<80).length;
  if(bad)return alert(bad+' ⚠️ unknown codes. Fix them first.');
  if(unsure&&!confirm(unsure+' uncertain cells. Import anyway?'))return;
  L.forEach((c,n)=>{const cs=parse(w,c.text);S.shifts=S.shifts.filter(h=>!(h.wp===w.id&&h.date===c.date));
    S.shifts.push({id:'s'+Date.now()+n,wp:w.id,date:c.date,text:c.text,label:cs.map(x=>x.label).join(' + '),segs:makeSegs(c.date,cs)})});
  sc.cells=null;sc.words=null;save();go('agenda')}

(async()=>{const L=await load()||{};if(L.wps&&!L.ver){L.lang='fa';L.cal='j';L.ver=3}S={...S,...L};sel=iso(Date.now());cm=mfirst(new Date());render();if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js')})();
setInterval(()=>tab==='today'&&render(),60000);
