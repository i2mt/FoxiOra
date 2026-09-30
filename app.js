/* ShiftFox — local-first shift scheduler. Sections: STORAGE · PARSER · SCHEDULE/CONFLICTS · UI.
   Times are stored as epoch-ms segments, so old shifts keep their real times if a code is later edited. */
const $=s=>document.querySelector(s), DAY=864e5;
const DEF=[['N','Night','19:30-08:00'],['D','Morning','07:30-14:30'],['E','Evening','14:00-20:00'],['n','Short night','20:00-24:00'],['M','Leave','leave'],['S','Sick leave','leave'],['OFF','Day off','off'],['*','Day off','off']];
const DS=()=>({wps:[],shifts:[],events:[],gap:120,cal:'g',theme:'auto',lang:'en',h24:true,fdow:6,cross:true,same:true,fh:2});
let S=DS(),tab='today',cm=new Date(),sel=new Date().toISOString().slice(0,10),vm='agenda';cm.setDate(1);

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
function render(){document.documentElement.dataset.theme=S.theme==='auto'?'':S.theme;
  $('nav').innerHTML=NAV.map(([k,i,l])=>`<button class="${k===tab?'on':''}" onclick="go('${k}')"><i>${i}</i>${l}</button>`).join('');$('#v').innerHTML=V[tab]();document.documentElement.lang=S.lang;document.documentElement.dir=S.lang==='fa'?'rtl':'ltr';tr($('nav'));tr($('#v'))}
const dlg=h=>{$('#dlg').innerHTML=h;tr($('#dlg'));$('#dlg').showModal()};const close=()=>$('#dlg').close();

V.today=()=>{if(!S.wps.length)return`<div class="c"><div class="big">Welcome</div><p class="mu">Create your first workplace to start adding shifts.</p><button class="p" onclick="go('places')">Add workplace</button></div>`;
  const now=Date.now(),a=segs(),cur=a.find(g=>g.s<=now&&now<g.e),nxt=a.filter(g=>g.s>now);
  const hero=cur||nxt[0],after=(cur?nxt:nxt.slice(1))[0];
  const card=(g,l)=>`<h1>${l}</h1><div class="c bar" style="--w:${wp(g.wp).color}"><div class="big">${segTxt(g)}</div><div>${wp(g.wp).name}</div><div class="mu">${new Date(g.s).toLocaleDateString(loc(),{weekday:'long',day:'numeric',month:'short'})}</div></div>`;
  const wk=a.filter(g=>g.s>=now-DAY&&g.s<now+7*DAY),is=issues().filter(i=>i.b.s>now);
  return (hero?card(hero,cur?'NOW':'NEXT SHIFT')+`<div class="c row"><span class="mu">${cur?'Ends in':'Starts in'}</span><span class="big">${dur(((cur?cur.e:hero.s)-now)/6e4)}</span></div>`:`<div class="c">No upcoming shifts.</div>`)
   +(after?card(after,'AFTER THAT'):'')
   +`<h1>NEXT 7 DAYS</h1><div class="c row"><span>${wk.length} shifts · ${dur(wk.reduce((t,g)=>t+(g.e-g.s)/6e4,0))}</span><span>${is.filter(i=>i.t==='o').length?`<span class="bad o">${is.filter(i=>i.t==='o').length} conflict</span> `:''}${is.filter(i=>i.t==='g').length?`<span class="bad g">${is.filter(i=>i.t==='g').length} tight</span>`:''}</span></div>`
   +is.slice(0,3).map(i=>`<div class="c mu">${i.t==='o'?'⚠️ Overlap':'🟠 Tight turnaround'} ${dur(i.min)}<br>${wp(i.a.wp).name} ${segTxt(i.a)}<br>${wp(i.b.wp).name} ${segTxt(i.b)}</div>`).join('')};

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
<label class="mu">Theme</label><select onchange="S.theme=this.value;save();render()">${o([['auto','auto'],['light','light'],['dark','dark']],S.theme)}</select>${sw('h24','24-hour clock')}</div>
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
  dlg(`<h3>Add shift</h3><select id=fw onchange=chips()>${S.wps.map(w=>`<option value="${w.id}">${w.name}</option>`)}</select><input id=fd type=date value="${iso(Date.now())}"><input id=fc placeholder="e.g. N, DE, OFF" autocapitalize=off><div id=ch></div><button class=p onclick=saveShift()>Save</button>`);chips()}
function saveShift(){const w=S.wps.find(x=>x.id===$('#fw').value),d=$('#fd').value,t=nrm($('#fc').value.trim()),cs=parse(w,t);
  if(!d||!cs)return alert('Unknown code for this workplace');
  S.shifts=S.shifts.filter(h=>!(h.wp===w.id&&h.date===d)); // re-entering a day replaces it (no duplicates)
  S.shifts.push({id:'s'+Date.now(),wp:w.id,date:d,text:t,label:cs.map(c=>c.label).join(' + '),segs:makeSegs(d,cs)});save();close();render()}
function delShift(id){if(confirm('Delete this shift?')){S.shifts=S.shifts.filter(h=>h.id!==id);save();render()}}
function exp(){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(S)],{type:'application/json'}));a.download='shiftfox-backup.json';a.click()}
async function imp(f){if(f){S={...DS(),...JSON.parse(await f.text())};save();render()}}


/* ===== v2: i18n (fa/RTL), month view, personal events, free time ===== */
document.head.insertAdjacentHTML('beforeend','<style>.grid{display:grid;grid-template-columns:repeat(7,1fr);gap:3px;margin:8px 0}.cell{background:var(--card);border:1px solid var(--ln);border-radius:8px;min-height:50px;padding:3px;font-size:12px;text-align:center}.cell.sel{border-color:var(--ac)}.cell i{display:inline-block;width:6px;height:6px;border-radius:3px;margin:1px}.row button:not(.p){background:none;border:0;color:var(--tx);font-size:22px}</style>');
const NAV=[['today','◷','Today'],['agenda','☰','Calendar'],['places','⌂','Places'],['scan','⌗','Scan'],['set','⚙','Settings']];
// UI translations: matched as text inside rendered DOM text nodes (longest key first). Add keys here to translate more.
const FA={'NEXT 7 DAYS':'۷ روز آینده','NEXT SHIFT':'شیفت بعدی','AFTER THAT':'پس از آن',WORKPLACES:'محل‌های کار',GENERAL:'عمومی',CONFLICTS:'تداخل‌ها',DATA:'داده‌ها',AGENDA:'برنامه',Today:'امروز',Calendar:'تقویم',Places:'محل‌ها',Scan:'اسکن',Settings:'تنظیمات',NOW:'اکنون',Welcome:'خوش آمدید','Add workplace':'افزودن محل کار','Add shift':'افزودن شیفت','Personal event':'رویداد شخصی','Free time':'زمان آزاد',Save:'ذخیره',Delete:'حذف',Overlap:'تداخل',Gap:'فاصله کم',shifts:'شیفت',conflict:'تداخل',tight:'فاصله کم','Ends in':'پایان تا','Starts in':'شروع تا','Export backup':'خروجی پشتیبان','Clear data':'پاک کردن داده‌ها',Theme:'پوسته',Language:'زبان',Gregorian:'میلادی',Jalali:'شمسی',Month:'ماه',List:'فهرست','First day of week':'اولین روز هفته','24-hour clock':'ساعت ۲۴ ساعته','Short gap is less than':'فاصله کم یعنی کمتر از','Cross-workplace conflicts':'تداخل بین محل‌ها','Same-workplace overlaps':'تداخل در یک محل','Free for at least':'آزاد برای حداقل','No shifts yet. Tap + to add one.':'هنوز شیفتی ثبت نشده. + را بزنید.',Sat:'شنبه',Sun:'یکشنبه',Mon:'دوشنبه'};
const KEYS=Object.keys(FA).sort((a,b)=>b.length-a.length), PD='۰۱۲۳۴۵۶۷۸۹';
const nrm=t=>t.replace(/[۰-۹]/g,d=>PD.indexOf(d));
function tr(root){if(S.lang!=='fa')return;const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let n;
  while(n=w.nextNode()){if(n.parentNode.tagName==='TEXTAREA')continue;let v=n.nodeValue;for(const k of KEYS)v=v.split(k).join(FA[k]);n.nodeValue=v.replace(/\d/g,d=>PD[d])}}
const vbtn=(k,l)=>`<button class="p" style="${vm===k?'':'opacity:.5'}" onclick="vm='${k}';render()">${l}</button>`;
const mv=n=>{cm=new Date(cm.getFullYear(),cm.getMonth()+n,1);render()}, pick=d=>{sel=d;render()};
const monthV=()=>{const y=cm.getFullYear(),m=cm.getMonth(),off=(new Date(y,m,1).getDay()-S.fdow+7)%7,n=new Date(y,m+1,0).getDate(),bad=new Set(issues().flatMap(i=>[iso(i.a.s),iso(i.b.s)]));
  const wd=[...Array(7)].map((_,i)=>`<div class="mu" style="text-align:center">${new Date(2024,0,7+(i+S.fdow)%7).toLocaleDateString(loc(),{weekday:'narrow'})}</div>`).join('');
  let c='<div></div>'.repeat(off);
  for(let d=1;d<=n;d++){const ds=iso(new Date(y,m,d));c+=`<div class="cell${ds===sel?' sel':''}" onclick="pick('${ds}')">${new Date(y,m,d).toLocaleDateString(loc(),{day:'numeric'})}<div>${S.shifts.filter(h=>h.date===ds).map(h=>`<i style="background:${wp(h.wp).color}"></i>`).join('')}${bad.has(ds)?'<i style="background:var(--red)"></i>':''}</div></div>`}
  return `<div class="row"><button onclick="mv(-1)">‹</button><b>${cm.toLocaleDateString(loc(),{month:'long',year:'numeric'})}</b><button onclick="mv(1)">›</button></div><div class="grid">${wd}${c}</div>`+dayV()};
const dayV=()=>{const hs=S.shifts.filter(h=>h.date===sel),ev=S.events.filter(e=>iso(e.s)===sel);
  return `<h1>${dlabel(sel)}</h1>`+hs.map(h=>`<div class="c bar row" style="--w:${wp(h.wp).color}" onclick="delShift('${h.id}')"><div><b>${h.text}</b> · ${wp(h.wp).name}<div class="mu">${h.segs.map(segTxt).join(' + ')||h.label}</div></div><div>${badge(h.id)}</div></div>`).join('')
   +ev.map(e=>`<div class="c" onclick="delEvent('${e.id}')"><b>${e.title}</b><div class="mu">${hm(e.s)}→${hm(e.e)}</div></div>`).join('')+`<button class="p" onclick="addEvent()">+ Personal event</button>`};
// Free time: waking window 08:00–22:00 each day for 7 days, minus shifts and personal events.
function free(min){const b=[...segs(),...S.events].sort((x,y)=>x.s-y.s),out=[],t=new Date();
  for(let i=0;i<7;i++){const d=iso(new Date(t.getFullYear(),t.getMonth(),t.getDate()+i)),we=at(d,'22:00');let p=Math.max(at(d,'08:00'),Date.now());
    for(const g of b){if(g.e<=p||g.s>=we)continue;if(g.s>p&&(g.s-p)/6e4>=min)out.push([p,g.s]);p=Math.max(p,g.e)}
    if(we>p&&(we-p)/6e4>=min)out.push([p,we])}return out}
const freeV=()=>`<h1>Free time</h1><div class="c"><div class="row"><span class="mu">Free for at least</span><select style="width:auto;margin:0" onchange="S.fh=+this.value;save();render()">${[1,2,3,4].map(h=>`<option value="${h}" ${S.fh===h?'selected':''}>${h} h</option>`).join('')}</select></div>${free(S.fh*60).slice(0,8).map(([a,b])=>`<div>${new Date(a).toLocaleDateString(loc(),{weekday:'short',day:'numeric'})} ${hm(a)}→${hm(b)} <span class="mu">${dur((b-a)/6e4)}</span></div>`).join('')||'<span class="mu">—</span>'}</div>`;
function addEvent(){dlg(`<h3>Personal event</h3><input id=et placeholder="Title"><select id=ety>${['appointment','gym','university','trip','task','custom'].map(x=>`<option>${x}</option>`).join('')}</select><input id=ed type=date value="${sel}"><input id=es type=time value="10:00"><input id=ee type=time value="11:00"><button class=p onclick=saveEvent()>Save</button>`)}
function saveEvent(){const d=$('#ed').value;if(!d)return;const s=at(d,$('#es').value);let e=at(d,$('#ee').value);if(e<=s)e+=DAY;
  S.events.push({id:'e'+Date.now(),title:$('#et').value||$('#ety').value,type:$('#ety').value,s,e});save();close();render()}
function delEvent(id){if(confirm('Delete?')){S.events=S.events.filter(e=>e.id!==id);save();render()}}
V.agenda=()=>`<div class="row" style="gap:6px;margin-bottom:8px">${vbtn('agenda','List')}${vbtn('month','Month')}</div>`+(vm==='month'?monthV():listV())+freeV();

(async()=>{S={...S,...(await load()||{})};render();if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js')})();
setInterval(()=>tab==='today'&&render(),60000);
