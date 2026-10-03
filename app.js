/* ShiftFox — local-first shift scheduler. Sections: STORAGE · PARSER · SCHEDULE/CONFLICTS · UI.
   Times are stored as epoch-ms segments, so old shifts keep their real times if a code is later edited. */
const $=s=>document.querySelector(s), DAY=864e5;
const DEF=[['N','Night','19:30-08:00'],['D','Morning','07:30-14:30'],['E','Evening','14:00-20:00'],['n','Short night','20:00-24:00'],['M','Leave','leave'],['S','Sick leave','leave'],['OFF','Day off','off'],['*','Day off','off']];
const VER='v9';
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
<h1>DATA</h1><button class="p" onclick="exp()">Export backup</button><input type="file" accept=".json" onchange="imp(this.files[0])"><button class="p" style="background:var(--red)" onclick="if(confirm('Delete all data?')){S=DS();save();render()}">Clear data</button><div class="mu" style="text-align:center;margin-top:14px">ShiftFox ${VER}</div>`};

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
const FA={'NEXT 7 DAYS':'۷ روز آینده','NEXT SHIFT':'شیفت بعدی','AFTER THAT':'پس از آن',WORKPLACES:'محل‌های کار',GENERAL:'عمومی',CONFLICTS:'تداخل‌ها',DATA:'داده‌ها',AGENDA:'برنامه',Today:'امروز',Calendar:'تقویم',Places:'محل‌ها',Scan:'اسکن',Settings:'تنظیمات',NOW:'اکنون',Welcome:'خوش آمدید','Add workplace':'افزودن محل کار','Add shift':'افزودن شیفت','Personal event':'رویداد شخصی','Free time':'زمان آزاد',Save:'ذخیره',Delete:'حذف',Overlap:'تداخل',Gap:'فاصله کم',shifts:'شیفت',conflict:'تداخل',tight:'فاصله کم','Ends in':'پایان تا','Starts in':'شروع تا','Export backup':'خروجی پشتیبان','Clear data':'پاک کردن داده‌ها',Theme:'پوسته',Language:'زبان',Gregorian:'میلادی',Jalali:'شمسی',Month:'ماه',List:'فهرست','First day of week':'اولین روز هفته','24-hour clock':'ساعت ۲۴ ساعته','Short gap is less than':'فاصله کم یعنی کمتر از','Cross-workplace conflicts':'تداخل بین محل‌ها','Same-workplace overlaps':'تداخل در یک محل','Free for at least':'آزاد برای حداقل','No shifts yet. Tap + to add one.':'هنوز شیفتی ثبت نشده. + را بزنید.',Accent:'رنگ تم','Tap your row':'ردیف خود را انتخاب کنید','Finding the table…':'در حال یافتن جدول…','Reading dates…':'در حال خواندن تاریخ‌ها…','Reading names…':'در حال خواندن نام‌ها…','Wrong row?':'ردیف اشتباه است؟',Fox:'روباه',Ocean:'اقیانوس',Forest:'جنگل',Violet:'بنفش',Camera:'دوربین',Gallery:'گالری','Needs review':'نیاز به بررسی','read':'خوانده شد','Reading the table…':'در حال خواندن جدول…','Reading cells':'در حال خواندن خانه‌ها','Preparing image…':'آماده‌سازی تصویر…','Tap a code to fix':'برای اصلاح یک کد را بزنید',Sat:'شنبه',Sun:'یکشنبه',Mon:'دوشنبه','Photograph / choose roster':'عکس برنامه شیفت / انتخاب فایل','Your name':'نام شما',Workplace:'محل کار',Import:'ثبت در برنامه',Back:'بازگشت','Search again':'جستجوی دوباره','Name not found in the photo. Check the spelling and try again':'نام در عکس پیدا نشد؛ املا را بررسی و دوباره تلاش کنید','Could not find the date row':'ردیف تاریخ‌ها پیدا نشد'};
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
const cleanCode=t=>{t=t.replace(/م/g,'M').replace(/[—–_−]/g,'-').replace(/[|!\[\]()]/g,'');return /^-+$/.test(t)?'*':/^off$/i.test(t)?'OFF':t};
const BASE=()=>new URL('vendor/',location.href).href;
const P=(t,p)=>{const e=$('#prog');if(e){e.textContent=t;tr(e)}const b=$('#pbar i');if(b&&p!=null)b.style.width=Math.round(p*100)+'%'};
function enhance(cv){const x=cv.getContext('2d'),im=x.getImageData(0,0,cv.width,cv.height),d=im.data,h=new Uint32Array(256);
  for(let i=0;i<d.length;i+=4){const g=(d[i]*.3+d[i+1]*.59+d[i+2]*.11)|0;d[i]=g;h[g]++}
  const n=d.length/4;let a=0,lo=0,hi=255;for(;lo<255&&(a+=h[lo])<n*.02;lo++);a=0;for(;hi>0&&(a+=h[hi])<n*.02;hi--);const k=255/Math.max(1,hi-lo);
  for(let i=0;i<d.length;i+=4){const g=Math.max(0,Math.min(255,(d[i]-lo)*k));d[i]=d[i+1]=d[i+2]=g}x.putImageData(im,0,0)}
function crop(cx,cy,w,h){const k=72/h,o=document.createElement('canvas');o.width=Math.round(w*k)+32;o.height=104;const x=o.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,o.width,o.height);x.drawImage(sc.cv,cx-w/2,cy-h/2,w,h,16,16,w*k,72);return o}
function gridScan(d,w,h){
 const W1=w+1,I=new Float64Array(W1*(h+1));
 for(let y=0;y<h;y++){let r=0;for(let x=0;x<w;x++){r+=d[(y*w+x)*4];I[(y+1)*W1+x+1]=I[y*W1+x+1]+r}}
 const px=[],R=12,A=(2*R+1)**2;
 for(let y=R;y<h-R;y++)for(let x=R;x<w-R;x++){const m=(I[(y+R+1)*W1+x+R+1]-I[(y-R)*W1+x+R+1]-I[(y+R+1)*W1+x-R]+I[(y-R)*W1+x-R])/A;if(d[(y*w+x)*4]<m*.8-4)px.push(x,y)}
 const n=px.length>>1,off=w;
 const score=th=>{const c=Math.cos(th),s=Math.sin(th),b=new Int32Array(h+2*w+8);for(let i=0;i<n;i+=3)b[Math.round(px[2*i+1]*c-px[2*i]*s)+off]++;let t=0;for(const v of b)t+=v*v;return t};
 let bt=0,bs=-1;for(let a=-8;a<=8.001;a+=.2){const t=a*Math.PI/180,v=score(t);if(v>bs){bs=v;bt=t}}
 const c0=bt;for(let a=-.2;a<=.201;a+=.04){const t=c0+a*Math.PI/180,v=score(t);if(v>bs){bs=v;bt=t}}
 const c=Math.cos(bt),s=Math.sin(bt);let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
 for(const [x,y] of [[0,0],[w,0],[0,h],[w,h]]){const X=x*c+y*s,Y=y*c-x*s;x0=Math.min(x0,X);x1=Math.max(x1,X);y0=Math.min(y0,Y);y1=Math.max(y1,Y)}
 const ox=Math.ceil(-x0)+4,oy=Math.ceil(-y0)+4,W2=Math.ceil(x1-x0)+8,H2=Math.ceil(y1-y0)+8,Bm=new Uint8Array(W2*H2);
 for(let i=0;i<n;i++){const x=px[2*i],y=px[2*i+1];Bm[Math.round(y*c-x*s+oy)*W2+Math.round(x*c+y*s+ox)]=1}
 // only long straight runs count as grid lines (text strokes are short)
 const prof=(N,M,get,L)=>{const P=new Float64Array(N+16);for(let i=0;i<N;i++){let st=-1,last=-9,cnt=0;const fl=()=>{if(st>=0&&last-st+1>=L)P[i]+=cnt};for(let j=0;j<M;j++)if(get(i,j)){if(st<0||j-last>3){fl();st=j;cnt=0}last=j;cnt++}fl()}return P};
 const L=Math.round(Math.min(w,h)*.03),Hy=prof(H2,W2,(i,j)=>Bm[i*W2+j],L),Vx=prof(W2,H2,(i,j)=>Bm[j*W2+i],L);
 const peaks=(P,fr)=>{const S=P.map((v,i)=>(P[i-1]||0)+v+(P[i+1]||0));let mx=0;for(const v of S)if(v>mx)mx=v;const out=[];
  for(let i=6;i<S.length-6;i++){if(S[i]<mx*fr)continue;let ok=true;for(let k=-6;k<=6;k++)if(S[i+k]>S[i]||(S[i+k]===S[i]&&k<0))ok=false;if(ok)out.push(i)}return out};
 return{th:bt,ox,oy,W2,H2,hl:peaks(Hy,.3),vl:peaks(Vx,.3),vl2:peaks(Vx,.2),n};
}

const fillGaps=(a,sk)=>{const d0=a.slice(1).map((v,i)=>v-a[i]),df=[...d0].sort((x,y)=>x-y),m=df[df.length>>1],o=[a[0]],reg=x=>x===undefined||Math.abs(x-m)<m*.25;for(let i=1;i<a.length;i++){const g=a[i]-o.at(-1),k=Math.round(g/m);if(g<m*.4)continue;if(k>=2&&k<=4&&Math.abs(g/k-m)<m*.12&&!(sk&&i===1)&&reg(d0[i-2])&&reg(d0[i]))for(let j=1;j<k;j++)o.push(o.at(-1)+g/k);o.push(a[i])}return o};
// Extend a line list toward table edges (seen in the weaker line set v2), snapping to real lines or inserting expected ones.
const extLines=(a,v2)=>{const o=[...a];for(let n=0;n<10;n++){const p=(o[4]-o[0])/4,e=o[0]-p;if(e<v2[0]-p*.5)break;o.unshift(v2.find(x=>Math.abs(x-e)<p*.2)??e)}
  for(let n=0;n<10;n++){const p=(o.at(-1)-o.at(-5))/4,e=o.at(-1)+p;if(e>v2.at(-1)+p*.5)break;o.push(v2.find(x=>Math.abs(x-e)<p*.2)??e)}return o};
// Crop a cell from the deskewed canvas, upscale, and (bin) binarize with the frame lines cleared — this is what makes single letters/digits read reliably.
const cropC=(x0,y0,x1,y1,bin,hg=64)=>{const w=x1-x0,h=y1-y0,k=hg/h,o=document.createElement('canvas'),cw=Math.round(w*k),ch=Math.round(h*k);o.width=cw+40;o.height=ch+40;const x=o.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,o.width,o.height);x.drawImage(sc.cv,x0,y0,w,h,20,20,cw,ch);
  if(bin){const im=x.getImageData(20,20,cw,ch),d=im.data,g=[];for(let i=0;i<d.length;i+=4)g.push(d[i]);const so=[...g].sort((a,b)=>a-b),t=(so[so.length*.05|0]+so[so.length>>1])/2,m=Math.round(ch*.06);
    for(let i=0;i<d.length;i+=4){const p=i/4,px=p%cw,py=(p/cw)|0,v=(d[i]<t&&px>m&&py>m&&px<cw-m&&py<ch-m)?0:255;d[i]=d[i+1]=d[i+2]=v}x.putImageData(im,20,20)}return o};
// Classifies a cell by its ink: blank, a dash (day off) or something to OCR.
function ink(x0,y0,x1,y1){const w=x1-x0,h=y1-y0,d=sc.cv.getContext('2d').getImageData(x0,y0,w,h).data,g=[];for(let i=0;i<d.length;i+=4)g.push(d[i]);
  const s=[...g].sort((a,b)=>a-b),lo=s[s.length*.05|0],hi=s[s.length>>1];if(hi-lo<40)return{blank:1};const t=(lo+hi)/2;let n=0,a=w,b=h,c=0,e=0;
  for(let i=0;i<g.length;i++)if(g[i]<t){n++;const x=i%w,y=i/w|0;a=Math.min(a,x);c=Math.max(c,x);b=Math.min(b,y);e=Math.max(e,y)}
  if(n<w*h*.012)return{blank:1};return{dash:c-a+1>=w*.3&&e-b+1<=h*.22}}
const killWk=async()=>{if(sc.wk){const k=sc.wk;sc.wk=null;await k.terminate()}};
V.scan=()=>{if(!S.wps.length)return`<h1>SCAN</h1><div class="c">Add a workplace first.</div>`;
  if(sc.busy)return`<div class="steps"><span class="on"></span><span class="on"></span><span></span></div><div class="c"><img class="pv" src="${sc.img}"><div class="pbar"><i></i></div><div id="prog" class="mu" style="margin-top:8px"></div></div>`;
  if(sc.pick)return`<h1>SCAN</h1><div class="mu" style="margin:0 6px 8px">Tap your row</div>`+sc.rows.map((r,i)=>`<div class="c cr ${r.score>=.5?'':'w'}" style="padding:8px" onclick="chooseRow(${i})"><img src="${r.img}" style="height:52px;max-width:100%"><span class="mu">${r.score>=.5?'★':''}</span></div>`).join('')+`<button class="p s" onclick="sc.pick=false;killWk();render()">Back</button>`;
  if(sc.cells)return reviewV();
  const J=S.cal==='j',n=jp(Date.now()),y=sc.y||(J?n.y:new Date().getFullYear()),m=sc.m||(J?n.m:new Date().getMonth()+1);
  sc.wp=sc.wp||S.wps[0].id;sc.name=sc.name||S.myname||'';
  const mn=i=>J?JM[i-1]:new Date(2024,i-1,1).toLocaleDateString(loc(),{month:'long'}),inp=cap=>`<input type=file accept="image/*" ${cap?'capture=environment':''} hidden onchange="scanFile(this.files[0]);this.value=''">`;
  return `<div class="steps"><span class="on"></span><span></span><span></span></div><div class="c"><label class=mu>Workplace</label><select id=sw>${S.wps.map(w=>`<option value="${w.id}" ${w.id===sc.wp?'selected':''}>${w.name}</option>`).join('')}</select>
<label class=mu>Your name</label><input id=sn value="${sc.name}"><div class=row style="gap:8px"><select id=sm>${[...Array(12)].map((_,i)=>`<option value=${i+1} ${i+1===m?'selected':''}>${mn(i+1)}</option>`).join('')}</select><input id=sy inputmode=numeric dir=ltr value="${PDg(y)}" style="width:100px"></div>
<div class=row style="gap:8px"><label class=p>${inp(1)}Camera</label><label class="p s">${inp(0)}Gallery</label></div><div id=prog class=mu style="margin-top:8px;color:var(--red)">${sc.msg}</div></div>`};
function readForm(){sc.wp=$('#sw').value;sc.name=$('#sn').value.trim();sc.m=+$('#sm').value;sc.y=+nrm($('#sy').value);S.myname=sc.name;save()}
const turn=(cv,deg)=>{const q=deg%180?[cv.height,cv.width]:[cv.width,cv.height],n=document.createElement('canvas');n.width=q[0];n.height=q[1];const x=n.getContext('2d');x.translate(q[0]/2,q[1]/2);x.rotate(deg*Math.PI/180);x.drawImage(cv,-cv.width/2,-cv.height/2);return n};
const gridOf=cv=>gridScan(cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data,cv.width,cv.height);
// Straightens the photo by the measured tilt and stores the grid lines (in straightened coordinates).
function setLayout(cv,G){const c=Math.cos(G.th),s=Math.sin(G.th),n=document.createElement('canvas');n.width=G.W2;n.height=G.H2;const x=n.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,n.width,n.height);x.setTransform(c,-s,s,c,G.ox,G.oy);x.drawImage(cv,0,0);sc.cv=n;
  const sm=document.createElement('canvas');sm.width=1200;sm.height=1200*n.height/n.width;sm.getContext('2d').drawImage(n,0,0,sm.width,sm.height);sc.img=sm.toDataURL('image/jpeg',.7);
  sc.dbg=cv.width+'×'+cv.height+' '+(G.th*57.3).toFixed(1)+'° H'+G.hl.length+' V'+G.vl.length;
  if(G.hl.length<5||G.vl.length<8)throw Error('Table lines not found. Retake the photo flat and fully in view.');
  sc.hl=fillGaps(G.hl,1);sc.vl=extLines(fillGaps(G.vl),G.vl2)}
async function scanFile(f){if(!f)return;readForm();sc.msg='';sc.cells=null;sc.pick=false;sc.dr=null;sc.dbg='';await killWk();
  try{let img;try{img=await createImageBitmap(f,{imageOrientation:'from-image'})}catch(e){img=await createImageBitmap(f)}
    const k=Math.min(1,2400/Math.max(img.width,img.height));let cv=document.createElement('canvas');cv.width=Math.round(img.width*k);cv.height=Math.round(img.height*k);cv.getContext('2d').drawImage(img,0,0,cv.width,cv.height);
    sc.img=cv.toDataURL('image/jpeg',.5);sc.busy=true;render();P('Preparing image…',.05);await new Promise(r=>setTimeout(r,30));enhance(cv);
    P('Finding the table…',.1);await new Promise(r=>setTimeout(r,30));let G=gridOf(cv);
    if(G.hl.length>G.vl.length){cv=turn(cv,90);G=gridOf(cv)} // the sheet has more day columns than staff rows; if not, the photo is sideways
    const B=BASE();await loadScript(B+'tesseract.min.js');P('Reading the table…',.2);
    sc.wk=await Tesseract.createWorker('eng',1,{workerPath:B+'worker.min.js',corePath:B,langPath:B+'lang',gzip:true});await sc.wk.setParameters({tessedit_pageseg_mode:'7'});
    setLayout(cv,G);await structure();
    if(sc.guess){const c2=turn(cv,180),g2=gridOf(c2);setLayout(c2,g2);await structure();if(sc.guess){setLayout(cv,G);await structure()}} // maybe upside down
    pickAuto()}catch(e){sc.busy=false;sc.msg='Scan failed: '+e.message+(sc.dbg?' ['+sc.dbg+']':'');await killWk();render()}}
// Header OCR gives each column its day number (and the direction); the name column sits at the day-1 end.
async function structure(){const H=sc.hl,V=sc.vl,wk=sc.wk,vals=[];await wk.setParameters({tessedit_char_whitelist:'0123456789'});
  for(let i=0;i<V.length-1;i++){P('Reading dates…',.25+.2*i/V.length);const r=await wk.recognize(cropC(V[i]+6,H[0]+6,V[i+1]-6,H[1]-6,1)),v=+nrm(r.data.text.replace(/\D/g,''));vals.push(v>=1&&v<=31?v:0)}
  const votes={};vals.forEach((v,i)=>{if(v)for(const d of [1,-1]){const k=d+':'+(v-d*i);votes[k]=(votes[k]||0)+1}});
  const [k,n]=Object.entries(votes).sort((a,b)=>b[1]-a[1])[0]||['',0];let dr,a0;sc.guess=n<4;if(sc.guess){dr=-1;a0=V.length-5}else[dr,a0]=k.split(':').map(Number);sc.dr=dr;sc.dayAt=i=>a0+dr*i;
  sc.nameCol=dr<0?V.length-2:0;const hs=H.slice(1).map((v,i)=>v-H[i+1-1]).slice(1),rows=[];const med=[...hs].sort((a,b)=>a-b)[hs.length>>1];
  for(let j=1;j<H.length-1;j++){const h=H[j+1]-H[j];if(h>med*.6&&h<med*1.5)rows.push([H[j],H[j+1]])}
  const wn=await Tesseract.createWorker('fas',1,{workerPath:BASE()+'worker.min.js',corePath:BASE(),langPath:BASE()+'lang',gzip:true});await wn.setParameters({tessedit_pageseg_mode:'7'});sc.rows=[];const toks=sc.name.split(/\s+/).map(nn).filter(Boolean);
  for(let j=0;j<rows.length;j++){P('Reading names…',.45+.3*j/rows.length);const[y0,y1]=rows[j],cr=cropC(V[sc.nameCol]+4,y0+4,V[sc.nameCol+1]-4,y1-4,1,110),r=await wn.recognize(cr),ws=r.data.text.split(/\s+/).map(nn).filter(Boolean);
    const sc_=toks.filter(t=>ws.some(w=>w===t||(t.length>3&&lev(w,t)<=(t.length>5?2:1)))).length/(toks.length||1);sc.rows.push({y0,y1,score:sc_,img:cr.toDataURL('image/jpeg',.6)})}await wn.terminate()}
function pickAuto(){const sr=sc.rows.map(r=>r.score),b=sr.indexOf(Math.max(...sr)),o=[...sr].sort((x,y)=>y-x);if(sr[b]>=.6&&(o[1]===undefined||o[1]<sr[b]-.2))return readCells(b);sc.busy=false;sc.pick=true;render()}
async function chooseRow(i){sc.pick=false;sc.busy=true;render();await readCells(i)}
async function readCells(ri){try{const w=S.wps.find(x=>x.id===sc.wp),wk=sc.wk,V=sc.vl,r=sc.rows[ri],J=S.cal==='j',b0=J?fromJ(sc.y,sc.m,1):new Date(sc.y,sc.m-1,1),list=[];
  await wk.setParameters({tessedit_char_whitelist:[...new Set(w.codes.map(c=>c.code).join('')+'-م')].join('')});
  for(let i=0;i<V.length-1;i++){const day=sc.dayAt(i);if(day<1||day>31||i===sc.nameCol)continue;const d=new Date(b0.getFullYear(),b0.getMonth(),b0.getDate()+day-1);if(!(J?jp(d).m===sc.m:d.getMonth()===sc.m-1))continue;list.push({i,day,date:iso(d)})}
  list.sort((a,b)=>a.day-b.day);sc.cells=[];
  for(let q=0;q<list.length;q++){const{i,day,date}=list[q];P('Reading cells '+(q+1)+'/'+list.length,.75+.25*q/list.length);const x0=V[i]+6,x1=V[i+1]-6,y0=r.y0+6,y1=r.y1-6,k=ink(x0,y0,x1,y1),cr=cropC(x0,y0,x1,y1,1,80);let text='',c=0;
    if(k.dash){text='*';c=95}else if(!k.blank){const o=await wk.recognize(cr);text=cleanCode(o.data.text.replace(/\s/g,''));if(text&&!parse(w,text)&&parse(w,text.toUpperCase()))text=text.toUpperCase();c=text?o.data.confidence:0}else c=90;
    sc.cells.push({day,date,text,c,img:cr.toDataURL('image/jpeg',.7)})}
  sc.hdrY=(sc.hl[0]+sc.hl[1])/2;sc.row=(r.y0+r.y1)/2;sc.mh=(r.y1-r.y0)/2}catch(e){sc.msg='Scan failed: '+e.message;sc.cells=null}
  sc.busy=false;render()}
const cState=(w,c)=>!c.text?'empty':!parse(w,c.text)?'bad':c.c<80?'low':'ok';
const setCell=(i,v)=>{sc.cells[i].text=v;sc.cells[i].c=100;render()};
const reviewV=()=>{const w=S.wps.find(x=>x.id===sc.wp),st=sc.cells.map(c=>cState(w,c)),chk=st.filter(x=>x!=='ok').length,n=st.filter(x=>x!=='empty').length;
  const ov=`<svg viewBox="0 0 ${sc.cv.width} ${sc.cv.height}" class="pv"><image href="${sc.img}" width="${sc.cv.width}" height="${sc.cv.height}"/><rect x="0" y="${sc.hdrY-sc.mh}" width="${sc.cv.width}" height="${sc.mh*2}" fill="#2b7be4" opacity=".3"/><rect x="0" y="${sc.row-sc.mh}" width="${sc.cv.width}" height="${sc.mh*2}" fill="#ec6a1c" opacity=".35"/></svg>`;
  return `<div class="steps"><span class="on"></span><span class="on"></span><span class="on"></span></div>${sc.guess?'<div class="c mu" style="border-color:var(--org)">Dates were guessed. Check the first and last day.</div>':''}${ov}<div class="mu" style="margin:0 6px 4px;direction:ltr">${sc.dbg||''}</div><div class="row" style="margin:0 4px 10px"><b>${sc.name} · ${w.name}</b><span class="bad ${chk?'g':''}" style="${chk?'':'background:var(--ok)'}">${chk?chk+' Needs review':n+' ✓'}</span></div>`
   +sc.cells.map((c,i)=>{const k=st[i];return `<div class="c cr ${k==='ok'?'':'w'}" style="padding:8px 10px"><img src="${c.img}"><div style="flex:1"><div class="mu">${dlabel(c.date)}</div><input dir=ltr style="margin:2px 0;text-align:center" value="${c.text}" onchange="setCell(${i},nrm(this.value.trim()))">${k==='ok'||k==='empty'?'':`<div>${w.codes.map(x=>`<span class=chip onclick="setCell(${i},'${x.code}')">${x.code}</span>`).join('')}</div>`}</div></div>`}).join('')
   +`<div class="sticky"><button class=p onclick=doImport()>Import ${n}</button><button class="p s" style="margin-top:6px" onclick="sc.cells=null;sc.pick=true;render()">Wrong row?</button></div>`};
function doImport(){const w=S.wps.find(x=>x.id===sc.wp),L=sc.cells.filter(c=>c.text);
  const bad=L.filter(c=>!parse(w,c.text)).length,unsure=L.filter(c=>c.c<80).length;
  if(bad)return alert(bad+' ⚠️ unknown codes. Fix them first.');
  if(unsure&&!confirm(unsure+' uncertain cells. Import anyway?'))return;
  L.forEach((c,n)=>{const cs=parse(w,c.text);S.shifts=S.shifts.filter(h=>!(h.wp===w.id&&h.date===c.date));
    S.shifts.push({id:'s'+Date.now()+n,wp:w.id,date:c.date,text:c.text,label:cs.map(x=>x.label).join(' + '),segs:makeSegs(c.date,cs)})});
  sc.cells=null;killWk();save();go('agenda')}

(async()=>{const L=await load()||{};if(L.wps&&!L.ver){L.lang='fa';L.cal='j';L.ver=3}S={...S,...L};sel=iso(Date.now());cm=mfirst(new Date());render();if('serviceWorker'in navigator){navigator.serviceWorker.register('sw.js');if(navigator.serviceWorker.controller)navigator.serviceWorker.addEventListener('controllerchange',()=>location.reload())}})();
setInterval(()=>tab==='today'&&render(),60000);
