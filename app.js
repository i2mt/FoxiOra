/* ShiftFox — local-first shift scheduler. Sections: STORAGE · PARSER · SCHEDULE/CONFLICTS · UI.
   Times are stored as epoch-ms segments, so old shifts keep their real times if a code is later edited. */
const $=s=>document.querySelector(s), DAY=864e5;
const DEF=[['N','Night','19:30-08:00'],['D','Morning','07:30-14:30'],['E','Evening','14:00-20:00'],['n','Short night','20:00-24:00'],['M','Leave','leave'],['S','Sick leave','leave'],['OFF','Day off','off'],['*','Day off','off'],['-','Day off','off']];
const VER='v12.2';
const DS=()=>({wps:[],shifts:[],events:[],mates:[],gap:120,cal:'j',theme:'auto',lang:'fa',ver:3,myname:'',h24:true,fdow:6,cross:true,same:true,fh:2,weekend:[5],holidays:true,learnOCR:true,themePlaces:true,ocrMemory:{version:1,glyphs:[],names:[]}});
let S=DS(),tab='today',cm=new Date(),sel='',vm='month';

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
function parse(wp,text){if(/^[-–—−]+$/.test(text)){const off=wp.codes.find(c=>c.type==='off');return off?[{...off,code:'-'}]:null}const cs=[...wp.codes].sort((a,b)=>b.code.length-a.code.length);let i=0,out=[];
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
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const bidi=(v,dir='auto')=>`<bdi dir="${dir}">${esc(v)}</bdi>`;
const codeHTML=v=>bidi(v,'ltr');
const dur=m=>{m=Math.max(0,Math.round(m));const h=Math.floor(m/60),n=m%60;return S.lang==='fa'?[h?`${h} ساعت`:'',n||!h?`${n} دقیقه`:''].filter(Boolean).join(' و '):[h?`${h} ${h===1?'hour':'hours'}`:'',n||!h?`${n} ${n===1?'minute':'minutes'}`:''].filter(Boolean).join(' ')};
const countdown=m=>{m=Math.max(0,Math.ceil(m));const days=Math.floor(m/1440);return days?`${days} ${S.lang==='fa'?'روز':days===1?'day':'days'}${m%1440?(S.lang==='fa'?' و ':' ')+dur(m%1440):''}`:dur(m)};
const placeColor=id=>S.themePlaces!==false?['var(--ac)','var(--ac-alt)','var(--ac-third)'][Math.max(0,S.wps.findIndex(w=>w.id===id))%3]:wp(id).color;
const hm=ms=>{const d=new Date(ms);return S.h24?String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0'):d.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'})};
const iso=d=>{d=new Date(d);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const loc=()=>S.lang==='fa'?(S.cal==='j'?'fa-IR-u-ca-persian':'fa-IR-u-ca-gregory'):(S.cal==='j'?'en-GB-u-ca-persian':'en-GB');
const dateText=value=>{const d=typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)?new Date(value+'T00:00'):new Date(value);const j=S.cal==='j'?jp(d):{d:d.getDate(),m:d.getMonth()+1,y:d.getFullYear()};return `${j.d}/${j.m}/${j.y}`};
const dateHTML=value=>codeHTML(dateText(value));
const dlabel=d=>new Date(d+'T00:00').toLocaleDateString(loc(),{weekday:'short'})+' · '+dateText(d);
const dayLabel=d=>`${new Date(d+'T00:00').toLocaleDateString(loc(),{weekday:'long'})} · ${dateHTML(d)}`;
const timeRange=(a,b)=>`${codeHTML(hm(a)+' – '+hm(b))}${iso(a)!==iso(b)?` <small class="mu">${T2('ends','پایان')} ${dateHTML(b)}</small>`:''}`;
const badge=(sh)=>issues().filter(i=>i.a.sh===sh||i.b.sh===sh).map(i=>`<span class="bad ${i.t}">${i.t==='o'?'Overlap '+dur(i.min):'Gap '+dur(i.min)}</span>`).join(' ');
const segTxt=g=>`${codeHTML(g.code)} ${timeRange(g.s,g.e)}`;

/* ---------- UI ---------- */
const V={};
function go(t){tab=t;render()}
function render(){document.documentElement.dataset.ac=S.ac||'fox';document.documentElement.dataset.theme=S.theme==='auto'?'':S.theme;
  $('nav').innerHTML=NAV.map(([k,i,l])=>`<button class="${k===tab?'on':''}" onclick="go('${k}')"><i>${i}</i>${l}</button>`).join('');$('#v').innerHTML=V[tab]();document.documentElement.lang=S.lang;document.documentElement.dir=S.lang==='fa'?'rtl':'ltr';hdr();tr($('nav'));tr($('#hd'));tr($('#v'));isolateMixed($('#v'));isolateMixed($('#hd'))}
const autoDir=r=>r.querySelectorAll('input:not([dir]):not([type=file]):not([type=date]):not([type=time]):not([type=color]):not([type=checkbox]),textarea:not([dir])').forEach(i=>i.dir='auto');
const dlg=h=>{$('#dlg').innerHTML=h;autoDir($('#dlg'));tr($('#dlg'));isolateMixed($('#dlg'));$('#dlg').showModal()};const close=()=>$('#dlg').close();

const cLabel=g=>(wp(g.wp).codes||[]).find(c=>c.code===g.code)?.label||g.code;
function hdr(){autoDir($('#v'));const L=NAV.find(n=>n[0]===tab)[2];$('#hd').innerHTML=`<b>${L}</b><span class="mu">${new Date().toLocaleDateString(loc(),{weekday:'long',day:'numeric',month:'long'})}</span>`;document.querySelector('.fab').style.display=['today','agenda'].includes(tab)?'':'none'}
V.today=()=>{if(!S.wps.length)return`<div class="empty"><div class="big">Welcome</div><p class="mu">Add your first workplace to start.</p><button class="p" onclick="go('places')">Add workplace</button></div>`;
  const now=Date.now(),all=segs(),current=all.filter(g=>g.s<=now&&now<g.e),cur=current[0],next=all.filter(g=>g.s>now),hero=cur||next[0],after=(cur?next:next.slice(1))[0];
  const hv=hero?`<section class="hero"><div class="row"><span class="pill">${cur?T2('ON SHIFT','در حال شیفت'):T2('NEXT SHIFT','شیفت بعدی')}</span><span class="hero-date">${dateHTML(hero.s)}</span></div>
    <div class="hero-main"><div><h2>${bidi(cLabel(hero))}</h2><div class="hero-place"><i style="background:${placeColor(hero.wp)}"></i>${bidi(wp(hero.wp).name)}</div></div><span class="hero-code">${codeHTML(hero.code)}</span></div>
    <div class="hero-time">${timeRange(hero.s,hero.e)}</div><div class="cd"><span>${cur?T2('Time remaining','تا پایان شیفت'):T2('Until your next shift','تا شیفت بعدی')}</span><strong>${countdown(((cur?cur.e:hero.s)-now)/6e4)}</strong></div>
    ${cur?`<div class="prog"><i style="width:${Math.min(100,Math.round((now-cur.s)/(cur.e-cur.s)*100))}%"></i></div>`:''}</section>`:`<div class="c empty-state"><b>${T2('Your schedule is clear','شیفت پیش‌رو ندارید')}</b><p class="mu">${T2('Add a shift or scan your next roster.','شیفت جدید اضافه کنید یا برنامه‌تان را اسکن کنید.')}</p></div>`;
  const today=new Date(),strip=Array.from({length:7},(_,i)=>{const d=new Date(today.getFullYear(),today.getMonth(),today.getDate()+i),ds=iso(d),hs=S.shifts.filter(h=>h.date===ds),hol=holidayInfo(d);return `<button class="dchip${i?'':' t'}${isWeekend(d)||hol.length?' holiday':''}" onclick="sel='${ds}';vm='month';cm=mfirst(new Date('${ds}T00:00'));go('agenda')"><span>${d.toLocaleDateString(loc(),{weekday:'short'})}</span><b>${S.cal==='j'?jp(d).d:d.getDate()}</b><em>${hs.length?hs.map(h=>codeHTML(h.text)).join(' '):'—'}</em></button>`}).join('');
  const weekEnd=new Date(today.getFullYear(),today.getMonth(),today.getDate()+7).getTime(),start=at(iso(now),'00:00'),week=all.filter(g=>g.s<weekEnd&&g.e>start),weekIssues=issues().filter(i=>i.b.s<weekEnd&&i.a.e>start),count=new Set(week.map(g=>g.sh)).size;
  return hv+`<div class="section-heading"><h1>${T2('THE NEXT 7 DAYS','هفت روز پیش‌رو')}</h1><button class="text-button" onclick="go('agenda')">${T2('View calendar','مشاهدهٔ تقویم')}</button></div><div class="week-strip">${strip}</div>`+
    `<div class="stats"><div><strong>${count}</strong><span>${T2('shifts','شیفت')}</span></div><div><strong>${dur(week.reduce((t,g)=>t+(Math.min(g.e,weekEnd)-Math.max(g.s,start))/6e4,0))}</strong><span>${T2('scheduled work','زمان کاری')}</span></div><div><strong>${weekIssues.length}</strong><span>${T2('schedule alerts','هشدار برنامه')}</span></div></div>`+
    (after?`<h1>${T2('AFTER THAT','شیفت بعد از آن')}</h1><div class="c next-card"><div class="row"><b>${bidi(cLabel(after))}</b><span class="code-tag">${codeHTML(after.code)}</span></div><p class="mu">${bidi(wp(after.wp).name)} · ${dayLabel(iso(after.s))}</p><div>${timeRange(after.s,after.e)}</div></div>`:'')+
    (current.length>1?`<div class="c alert-card">${T2('More than one shift is active now. Check the overlapping times.','هم‌زمان بیش از یک شیفت فعال است. زمان‌های تداخل را بررسی کنید.')}</div>`:'')+
    weekIssues.slice(0,3).map(i=>`<div class="c alert-card"><b>${i.t==='o'?T2('Shift overlap','تداخل شیفت‌ها'):T2('Short break','فاصلهٔ کوتاه بین شیفت‌ها')} · ${dur(i.min)}</b><div class="mu">${bidi(wp(i.a.wp).name)} ${segTxt(i.a)}<br>${bidi(wp(i.b.wp).name)} ${segTxt(i.b)}</div></div>`).join('')};

const listV=()=>{const from=iso(Date.now()-DAY),l=[...S.shifts].filter(h=>h.date>=from).sort((a,b)=>a.date<b.date?-1:1);
  if(!l.length)return`<h1>AGENDA</h1><div class="c mu">No shifts yet. Tap + to add one.</div>`;
  let last='';return'<h1>AGENDA</h1>'+l.map(h=>{const head=h.date!==last?`<h1>${dlabel(h.date)}</h1>`:'';last=h.date;
   return head+`<div class="c bar row" style="--w:${placeColor(h.wp)}" onclick="delShift('${h.id}')"><div><b>${esc(h.text)}</b> · ${wp(h.wp).name}<div class="mu">${h.segs.map(segTxt).join(' + ')||h.label}</div></div><div>${badge(h.id)}</div></div>`}).join('')};

V.places=()=>'<h1>WORKPLACES</h1>'+S.wps.map(w=>`<div class="c bar row" style="--w:${placeColor(w.id)}" onclick="editWp('${w.id}')"><div><b>${esc(w.name)}</b><div class="mu">${w.codes.map(c=>c.code).join(' ')}</div></div><span class="flip mu">›</span></div>`).join('')+`<button class="p" onclick="editWp()">+ Add workplace</button>`;
V.scan=()=>`<h1>SCAN</h1><div class="c"><b>Roster scanner — Stage 5</b><p class="mu">Will use local Tesseract.js. Import will feed the same parse() + makeSegs() used for manual entry, so nothing here needs to change.</p></div>`;
V.set=()=>{const o=(a,c)=>a.map(([v,l])=>`<option value="${v}" ${String(c)===String(v)?'selected':''}>${l}</option>`).join(''),
 sw=(k,l)=>`<label class="row" style="margin:6px 0"><span>${l}</span><input type=checkbox style="width:auto" ${S[k]?'checked':''} onchange="S.${k}=this.checked;save();render()"></label>`;
 return `<h1>GENERAL</h1><div class="c"><label class="mu">Language</label><select onchange="S.lang=this.value;save();render()">${o([['en','English'],['fa','فارسی']],S.lang)}</select>
<label class="mu">Calendar</label><select onchange="S.cal=this.value;save();render()">${o([['g','Gregorian'],['j','Jalali']],S.cal)}</select>
<label class="mu">First day of week</label><select onchange="S.fdow=+this.value;save();render()">${o([[6,'Sat'],[0,'Sun'],[1,'Mon']],S.fdow)}</select>
<label class="mu">Theme</label><select onchange="S.theme=this.value;save();render()">${o([['auto',T2('System','سیستم')],['light',T2('Light','روشن')],['dark',T2('Dark','تیره')]],S.theme)}</select><label class="mu">Accent</label><select onchange="S.ac=this.value;save();render()">${o([['fox','Fox'],['ocean','Ocean'],['forest','Forest'],['violet','Violet']],S.ac||'fox')}</select>${sw('h24','24-hour clock')}${sw('themePlaces',T2('Use theme colors for workplaces','هماهنگی رنگ محل‌های کار با پوسته'))}</div>
<h1>${T2('CALENDAR','تقویم و تعطیلات')}</h1><div class="c">${sw('holidays',T2('Iranian public holidays','نمایش تعطیلات رسمی ایران'))}<label class="mu">${T2('Weekend','پایان هفته')}</label><select onchange="S.weekend=this.value.split(',').filter(Boolean).map(Number);save();render()">${o([['5',T2('Friday','جمعه')],['4,5',T2('Thursday and Friday','پنجشنبه و جمعه')],['6,0',T2('Saturday and Sunday','شنبه و یکشنبه')]],(S.weekend||[5]).join(','))}</select><p class="mu">${T2('Full holiday dates: Persian year 1405. Other years show fixed solar holidays only.','تعطیلات کامل سال ۱۴۰۵؛ برای سال‌های دیگر فعلاً فقط تعطیلات ثابت شمسی نمایش داده می‌شود.')}</p></div>
<h1>${T2('SCAN MEMORY','حافظهٔ اسکن')}</h1><div class="c">${sw('learnOCR',T2('Remember confirmed corrections','یادآوری اصلاحات تأییدشده'))}<p class="mu">${T2('Corrections stay on this device and travel with your backup.','اصلاحات روی همین دستگاه می‌مانند و در نسخهٔ پشتیبان ذخیره می‌شوند.')}</p><button class="p s" onclick="memoryDialog()">${T2('Manage saved examples','مدیریت نمونه‌های ذخیره‌شده')}</button></div>
<h1>CONFLICTS</h1><div class="c"><label class="mu">Short gap is less than</label><select onchange="S.gap=+this.value;save();render()">${o([60,120,240].map(x=>[x,dur(x)]),S.gap)}</select>${sw('cross','Cross-workplace conflicts')}${sw('same','Same-workplace overlaps')}</div>
<h1>DATA</h1><button class="p" onclick="exp()">Export backup</button><input type="file" accept=".json" onchange="imp(this.files[0])"><button class="p" style="background:var(--red)" onclick="if(confirm('Delete all data?')){S=DS();save();render()}">Clear data</button><div class="mu" style="text-align:center;margin-top:14px">ShiftFox ${VER}</div>`};

function editWp(id){const w=S.wps.find(x=>x.id===id)||{name:'',color:'#bd541b',codes:decCodes(DEF.map(d=>d.join('|')).join('\n'))};
  dlg(`<h3>${id?'Edit':'New'} workplace</h3><input id=wn placeholder="Name" value="${esc(w.name)}"><input id=wc type=color value="${w.color}">
  <div class=mu>Shift codes — code|label|HH:MM-HH:MM (or leave / off). Changes affect new shifts only.</div><textarea id=wt rows=9 dir=ltr autocapitalize=off>${encCodes(w.codes)}</textarea><label class=mu>Allowed double shifts (e.g. DE, En)</label><input id=wcm dir=ltr value="${(w.combos||['DE']).join(', ')}">
  <button class=p onclick="saveWp('${id||''}')">Save</button>${id?`<button class=p style="background:var(--red);margin-top:8px" onclick="delWp('${id}')">Delete</button>`:''}`)}
function saveWp(id){const n=$('#wn').value.trim();if(!n)return;const o={name:n,color:$('#wc').value,codes:decCodes($('#wt').value)};o.combos=nrm($('#wcm').value).split(/[,\s،]+/).filter(Boolean);const bd=o.combos.filter(x=>!parse(o,x));if(bd.length)return alert('Unknown codes: '+bd.join(', '));
  if(id)Object.assign(S.wps.find(w=>w.id===id),o);else S.wps.push({id:'w'+Date.now(),...o});save();close();render()}
function delWp(id){if(!confirm('Delete workplace and its shifts?'))return;S.wps=S.wps.filter(w=>w.id!==id);S.shifts=S.shifts.filter(h=>h.wp!==id);save();close();render()}

function chips(){const w=S.wps.find(x=>x.id===$('#fw').value);$('#ch').innerHTML=w.codes.map(c=>`<span class=chip onclick="$('#fc').value+='${c.code}'">${c.code} ${c.label}</span>`).join('')}
function addShift(){if(!S.wps.length){go('places');return editWp()}
  dlg(`<h3>Add shift</h3><select id=fw onchange=chips()>${S.wps.map(w=>`<option value="${w.id}">${esc(w.name)}</option>`)}</select>${dField('fd',iso(Date.now()))}<input id=fc placeholder="e.g. N, DE, OFF" autocapitalize=off><div id=ch></div><button class=p onclick=saveShift()>Save</button>`);chips()}
function saveShift(){const w=S.wps.find(x=>x.id===$('#fw').value),d=dGet('fd'),t=nrm($('#fc').value.trim()),cs=parse(w,t);
  if(!d||!cs)return alert('Unknown code for this workplace');
  S.shifts=S.shifts.filter(h=>!(h.wp===w.id&&h.date===d)); // re-entering a day replaces it (no duplicates)
  S.shifts.push({id:'s'+Date.now(),wp:w.id,date:d,text:t,label:cs.map(c=>c.label).join(' + '),segs:makeSegs(d,cs)});save();close();render()}
function delShift(id){if(confirm('Delete this shift?')){S.shifts=S.shifts.filter(h=>h.id!==id);save();render()}}
function exp(){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(S)],{type:'application/json'}));a.download='shiftfox-backup.json';a.click()}
async function imp(f){if(f){S={...DS(),...JSON.parse(await f.text())};save();render()}}


/* ===== v2: i18n (fa/RTL), month view, personal events, free time ===== */

const NAV=[['today',`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>`,'Today'],['agenda',`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="5" width="16" height="15" rx="3"/><path d="M4 10h16M8 3v4M16 3v4"/></svg>`,'Calendar'],['team',`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M16 5a3 3 0 010 6M18 14c2 .6 3 2.5 3 5"/></svg>`,'Team'],['places',`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20V8l8-4 8 4v12M9 20v-6h6v6"/></svg>`,'Places'],['scan',`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8V6a2 2 0 012-2h2M16 4h2a2 2 0 012 2v2M20 16v2a2 2 0 01-2 2h-2M8 20H6a2 2 0 01-2-2v-2M4 12h16"/></svg>`,'Scan'],['set',`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/></svg>`,'Settings']];
// UI translations: matched as text inside rendered DOM text nodes (longest key first). Add keys here to translate more.
const FA={'SCAN':'اسکن برنامه','Morning':'صبح','Evening':'عصر','Night':'شب','Short night':'شب کوتاه','Leave':'مرخصی','Sick leave':'مرخصی استعلاجی','Day off':'تعطیل','Edit workplace':'ویرایش محل کار','New workplace':'محل کار جدید','Name':'نام','Title':'عنوان','NEXT 7 DAYS':'این هفته','NEXT SHIFT':'شیفت بعدی','AFTER THAT':'شیفت بعد از آن','NOW':'در حال شیفت','WORKPLACES':'محل‌های کار','GENERAL':'عمومی','CONFLICTS':'تداخل شیفت‌ها','DATA':'اطلاعات و پشتیبان','AGENDA':'برنامه','Today':'امروز','Team':'همکاران','Import and read colleagues':'ثبت + خوندن همکارها','Allowed double shifts (e.g. DE, En)':'ترکیب‌های مجاز (مثل DE ، En)','Calendar':'تقویم','Places':'محل کار','Scan':'اسکن','Settings':'تنظیمات','Welcome':'به FoxiOra خوش آمدید','Add your first workplace to start.':'اول یه محل کار اضافه کن تا شروع کنیم.','Add workplace':'محل کار جدید','Add shift':'شیفت جدید','Personal event':'برنامه شخصی','Free time':'وقت‌های آزاد','Save':'ذخیره','Delete':'حذف','Overlap':'تداخل','Gap':'فاصله کم','shifts':'شیفت','conflict':'تداخل','tight':'فاصله کم','Starts in':'تا شروع شیفت','Ends in':'تا پایان شیفت','No upcoming shifts.':'هنوز شیفتی برای آینده ثبت نشده.','Export backup':'گرفتن نسخه پشتیبان','Clear data':'پاک کردن همه اطلاعات','Theme':'حالت نمایش','Language':'زبان','Accent':'رنگ اصلی','Fox':'روباهی','Ocean':'دریایی','Forest':'جنگلی','Violet':'بنفش','Gregorian':'میلادی','Jalali':'شمسی','Month':'ماه','Week':'هفته','List':'فهرست','First day of week':'شروع هفته','24-hour clock':'ساعت ۲۴ ساعته','Short gap is less than':'هشدار فاصله کم، وقتی کمتر از','Cross-workplace conflicts':'تداخل بین محل‌های کار','Same-workplace overlaps':'تداخل توی یه محل کار','Free for at least':'حداقل آزاد برای','No shifts yet. Tap + to add one.':'هنوز شیفتی ثبت نکردی. با + اضافه کن.','Sat':'شنبه','Sun':'یکشنبه','Mon':'دوشنبه','Photograph / choose roster':'عکس برنامه شیفت','Your name':'نام شما (مطابق برنامه)','Workplace':'محل کار','Import':'ثبت شیفت‌ها','Back':'برگشت','Search again':'دوباره جستجو کن','Camera':'دوربین','Gallery':'گالری','Needs review':'مورد نیاز به بررسی','Tap your row':'ردیف خودت رو بزن','Wrong row?':'ردیف اشتباهه؟','Add another page':'صفحه بعدیِ برنامه','Page':'صفحه','Name not found in the photo. Check the spelling and try again':'اسمت توی عکس پیدا نشد. املاش رو چک کن و دوباره امتحان کن','Could not find the date row':'ردیف تاریخ‌ها پیدا نشد؛ عکس رو صاف‌تر و کامل‌تر بگیر','Preparing image…':'آماده‌سازی عکس…','Finding the table…':'پیدا کردن جدول…','Reading the table…':'خوندن جدول…','Reading dates…':'خوندن تاریخ‌ها…','Reading names…':'در حال خواندن نام‌ها…','Reading cells':'خوندن خونه‌ها','Dates were guessed. Check the first and last day.':'تاریخ‌ها حدسی خونده شدن؛ روز اول و آخر رو یه نگاه بنداز.','Add a workplace first.':'اول یه محل کار اضافه کن.'};
const KEYS=Object.keys(FA).sort((a,b)=>b.length-a.length), PD='۰۱۲۳۴۵۶۷۸۹';
const AD='٠١٢٣٤٥٦٧٨٩',nrm=t=>t.replace(/[۰-۹٠-٩]/g,d=>PD.indexOf(d)>=0?PD.indexOf(d):AD.indexOf(d));
function tr(root){if(S.lang!=='fa')return;const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let n;
  while(n=w.nextNode()){if(n.parentNode.tagName==='TEXTAREA')continue;let v=n.nodeValue;for(const k of KEYS)v=v.split(k).join(FA[k]);n.nodeValue=v.replace(/\d/g,d=>PD[d])}}
function isolateMixed(root){
  if(!root)return;const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),nodes=[];let node;
  while(node=walker.nextNode())if(!node.parentElement.closest('bdi,textarea,option,script,style,input,[dir=ltr],.ltr'))nodes.push(node);
  for(const n of nodes){const text=n.nodeValue,re=/[A-Za-z][A-Za-z0-9۰-۹]*(?:[+/_-][A-Za-z0-9۰-۹]+)*|[0-9۰-۹]+(?:[/:][0-9۰-۹]+)+(?:\s*[–—-]\s*[0-9۰-۹]+(?::[0-9۰-۹]+)*)?/g;let match,last=0,fragment=document.createDocumentFragment(),found=false;
    while(match=re.exec(text)){found=true;fragment.append(document.createTextNode(text.slice(last,match.index)));const b=document.createElement('bdi');b.dir='ltr';b.textContent=match[0];fragment.append(b);last=re.lastIndex}
    if(found){fragment.append(document.createTextNode(text.slice(last)));n.replaceWith(fragment)}
  }
}
const vbtn=(k,l)=>`<button class="${vm===k?'on':''}" onclick="vm='${k}';render()">${l}</button>`;
const mfirst=d=>{d=new Date(d);return new Date(d.getFullYear(),d.getMonth(),d.getDate()-(S.cal==='j'?jp(d).d-1:d.getDate()-1))};
const mv=n=>{const d=mfirst(cm);cm=mfirst(n>0?new Date(d.getFullYear(),d.getMonth(),d.getDate()+32):new Date(d.getFullYear(),d.getMonth(),d.getDate()-1));sel=iso(cm);render()}, pick=d=>{sel=d;render()};
// Month grid follows the chosen calendar: a Jalali month is built from real Jalali day boundaries (via Intl).
const monthV=()=>{const first=mfirst(cm),J=S.cal==='j',key=d=>J?jp(d).m:d.getMonth(),days=[];
  for(let d=first;key(d)===key(first);d=new Date(d.getFullYear(),d.getMonth(),d.getDate()+1))days.push(d);
  const off=(first.getDay()-S.fdow+7)%7,bad=new Set(issues().flatMap(i=>[iso(i.a.s),iso(i.b.s)])),td=iso(Date.now());
  const wd=Array.from({length:7},(_,i)=>{const d=new Date(2024,0,7+(i+S.fdow)%7);return `<div class="weekday${isWeekend(d)?' holiday':''}">${d.toLocaleDateString(loc(),{weekday:'short'})}</div>`}).join('');
  let cells='<div></div>'.repeat(off);
  for(const d of days){const ds=iso(d),hs=S.shifts.filter(h=>h.date===ds),hol=holidayInfo(d),events=S.events.filter(e=>iso(e.s)===ds);cells+=`<button class="cell${ds===sel?' sel':''}${ds===td?' t':''}${isWeekend(d)||hol.length?' holiday':''}" onclick="pick('${ds}')" aria-pressed="${ds===sel}" aria-label="${esc(dlabel(ds)+' '+hol.join('، '))}"><b>${J?jp(d).d:d.getDate()}</b>${hol.length?'<span class="holiday-dot" aria-hidden="true"></span>':''}${hs.slice(0,2).map(h=>`<em style="--w:${placeColor(h.wp)}">${codeHTML(h.text)}</em>`).join('')}${hs.length>2?`<small>+${hs.length-2}</small>`:''}${events.length?'<span class="event-dot">•</span>':''}${bad.has(ds)?'<u></u>':''}</button>`}
  return `<section class="calendar-panel"><div class="row month-heading"><button class="flip" onclick="mv(-1)" aria-label="${T2('Previous month','ماه قبل')}">‹</button><b>${first.toLocaleDateString(loc(),{month:'long',year:'numeric'})}</b><button class="flip" onclick="mv(1)" aria-label="${T2('Next month','ماه بعد')}">›</button></div><button class="text-button calendar-today" onclick="sel=iso(Date.now());cm=mfirst(new Date());render()">${T2('Go to today','رفتن به امروز')}</button><div class="grid">${wd}${cells}</div><div class="calendar-legend"><span class="holiday">● ${T2('Weekend / holiday','پایان هفته / تعطیل')}</span><span>• ${T2('Personal event','برنامهٔ شخصی')}</span></div>${S.holidays!==false&&jp(first).y!==1405?`<p class="mu">${T2('Lunar holidays have not been loaded for this year.','تعطیلات قمری این سال هنوز بارگذاری نشده است.')}</p>`:''}</section>`+dayV()};
// Week view: one 24-hour bar per day, shifts as colored blocks (overlaps outlined red, personal events grey).
const shiftSel=n=>{const d=new Date(sel+'T00:00');sel=iso(new Date(d.getFullYear(),d.getMonth(),d.getDate()+n));render()};
const weekV=()=>{const d0=new Date(sel+'T00:00'),st=new Date(d0.getFullYear(),d0.getMonth(),d0.getDate()-((d0.getDay()-S.fdow+7)%7)),en=new Date(st.getFullYear(),st.getMonth(),st.getDate()+6),sg=segs(),td=iso(Date.now()),
  bad=new Set(issues().filter(i=>i.t==='o').flatMap(i=>[i.a.sh+':'+i.a.s,i.b.sh+':'+i.b.s])),sh=d=>d.toLocaleDateString(loc(),{day:'numeric',month:'short'});
  const rows=[...Array(7)].map((_,k)=>{const d=new Date(st.getFullYear(),st.getMonth(),st.getDate()+k),a=d.getTime(),b=a+DAY,ds=iso(d);
    const blk=[...sg.filter(g=>g.s<b&&g.e>a).map(g=>({s:g.s,e:g.e,t:g.code,c:placeColor(g.wp),bad:bad.has(g.sh+':'+g.s)})),...S.events.filter(e=>e.s<b&&e.e>a).map(e=>({s:e.s,e:e.e,t:e.title,c:'#8b95a1'}))].map(x=>{const l=Math.max(x.s,a),r=Math.min(x.e,b),w=(r-l)/DAY*100;return `<i class="blk${x.bad?' bad':''}" style="left:${(l-a)/DAY*100}%;width:${w}%;background:${x.c}">${w>9?x.t:''}</i>`}).join('');
    const off=S.shifts.filter(h=>h.date===ds&&!h.segs.length).map(h=>h.text).join(' ');
    return `<div class="wk${isWeekend(d)||holidayInfo(d).length?' holiday':''}${ds===td?' t':''}${ds===sel?' s':''}" onclick="sel='${ds}';render()"><div class="wd"><b>${d.toLocaleDateString(loc(),{day:'numeric'})}</b><span class="mu">${d.toLocaleDateString(loc(),{weekday:'short'})}</span></div><div class="trk">${blk}${off?`<span class="off">${off}</span>`:''}</div></div>`}).join('');
  return `<div class="row"><button class="flip" onclick="shiftSel(-7)">‹</button><b>${sh(st)} – ${sh(en)}</b><button class="flip" onclick="shiftSel(7)">›</button></div><div class="wk hd"><div></div><div class="trk ax"><span style="left:0">00</span><span style="left:25%">06</span><span style="left:50%">12</span><span style="left:75%">18</span></div></div>${rows}`+dayV()};
const dayV=()=>{const hs=S.shifts.filter(h=>h.date===sel),ev=S.events.filter(e=>iso(e.s)===sel);
  return `<h1>${dayLabel(sel)}</h1>`+holidayInfo(new Date(sel+'T00:00')).map(t=>`<div class="holiday-note">${esc(t)}</div>`).join('')+hs.map(h=>`<div class="c bar row" style="--w:${placeColor(h.wp)}" onclick="delShift('${h.id}')"><div><b>${esc(h.text)}</b> · ${wp(h.wp).name}<div class="mu">${h.segs.map(segTxt).join(' + ')||h.label}</div></div><div>${badge(h.id)}</div></div>`).join('')
   +ev.map(e=>`<div class="c" onclick="delEvent('${e.id}')"><b>${esc(e.title)}</b><div class="mu"><span class="ltr">${hm(e.s)}–${hm(e.e)}</span></div></div>`).join('')+`<button class="p" onclick="addEvent()">+ Personal event</button>`};
// Free time: waking window 08:00–22:00 each day for 7 days, minus shifts and personal events.
function free(min){const b=[...segs(),...S.events].sort((x,y)=>x.s-y.s),out=[],t=new Date();
  for(let i=0;i<7;i++){const d=iso(new Date(t.getFullYear(),t.getMonth(),t.getDate()+i)),we=at(d,'22:00');let p=Math.max(at(d,'08:00'),Math.ceil(Date.now()/6e4)*6e4);
    for(const g of b){if(g.e<=p||g.s>=we)continue;if(g.s>p&&(g.s-p)/6e4>=min)out.push([p,g.s]);p=Math.max(p,g.e)}
    if(we>p&&(we-p)/6e4>=min)out.push([p,we])}return out}
const freeV=()=>{const slots=free(S.fh*60),groups=new Map();for(const slot of slots){const day=iso(slot[0]);if(!groups.has(day))groups.set(day,[]);groups.get(day).push(slot)}
  return `<h1>Free time</h1><section class="c free-panel"><div class="row"><label for="free-minimum" class="mu">Free for at least</label><select id="free-minimum" onchange="S.fh=+this.value;save();render()">${[1,2,3,4].map(h=>`<option value="${h}" ${S.fh===h?'selected':''}>${dur(h*60)}</option>`).join('')}</select></div><p class="mu free-help">${T2('Next 7 days · between 08:00 and 22:00 · based on saved shifts and events','هفت روز پیش‌رو · از ساعت ۰۸:۰۰ تا ۲۲:۰۰ · بر اساس شیفت‌ها و برنامه‌های ثبت‌شده')}</p>`+
    ([...groups].map(([d,items])=>`<div class="free-day"><div class="row"><b>${new Date(d+'T00:00').toLocaleDateString(loc(),{weekday:'long'})}</b>${dateHTML(d)}</div>${items.map(([a,b])=>`<div class="free-slot"><span>${T2('From','از')} ${codeHTML(hm(a))} ${T2('to','تا')} ${codeHTML(hm(b))}</span><span class="duration-pill">${dur((b-a)/6e4)}</span></div>`).join('')}</div>`).join('')||`<p class="empty-state mu">${T2('No free window matches this duration.','در این بازه، وقت آزادی با این مدت پیدا نشد.')}</p>`)+`</section>`};
function addEvent(){dlg(`<h3>Personal event</h3><input id=et placeholder="Title"><select id=ety>${['appointment','gym','university','trip','task','custom'].map(x=>`<option>${x}</option>`).join('')}</select>${dField('ed',sel)}<input id=es type=time value="10:00"><input id=ee type=time value="11:00"><button class=p onclick=saveEvent()>Save</button>`)}
function saveEvent(){const d=dGet('ed');if(!d)return;const s=at(d,$('#es').value);let e=at(d,$('#ee').value);if(e<=s)e+=DAY;
  S.events.push({id:'e'+Date.now(),title:$('#et').value||$('#ety').value,type:$('#ety').value,s,e});save();close();render()}
function delEvent(id){if(confirm('Delete?')){S.events=S.events.filter(e=>e.id!==id);save();render()}}
V.agenda=()=>`<div class="seg">${vbtn('month','Month')}${vbtn('week','Week')}${vbtn('agenda','List')}</div>`+(vm==='month'?monthV():vm==='week'?weekV():listV())+freeV();


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
  for(const f of OCR_FILES){const r=await fetch(B+f,{cache:'force-cache'}).catch(()=>null);if(!r||!r.ok)miss.push('vendor/'+f+(r?' ('+r.status+')':''))}
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
  if(bin){const im=x.getImageData(20,20,cw,ch),d=im.data,g=[];for(let i=0;i<d.length;i+=4)g.push(d[i]);const t=inkThreshold(g)??0,m=Math.round(ch*.04);
    for(let i=0;i<d.length;i+=4){const p=i/4,px=p%cw,py=(p/cw)|0,v=(d[i]<t&&px>m&&py>m&&px<cw-m&&py<ch-m)?0:255;d[i]=d[i+1]=d[i+2]=v}x.putImageData(im,20,20)}return o};
// Classifies a cell by its ink: blank, a dash (day off) or something to OCR.
function ink(x0,y0,x1,y1){const w=x1-x0,h=y1-y0,d=sc.cv.getContext('2d').getImageData(x0,y0,w,h).data,g=[];for(let i=0;i<d.length;i+=4)g.push(d[i]);
  const s=[...g].sort((a,b)=>a-b),lo=s[s.length*.05|0],hi=s[s.length>>1];if(hi-lo<40)return{blank:1};const t=(lo+hi)/2;let n=0,a=w,b=h,c=0,e=0;
  for(let i=0;i<g.length;i++)if(g[i]<t){n++;const x=i%w,y=i/w|0;a=Math.min(a,x);c=Math.max(c,x);b=Math.min(b,y);e=Math.max(e,y)}
  if(n<w*h*.012)return{blank:1};return{dash:c-a+1>=w*.3&&e-b+1<=h*.22}}
// Reads one cell robustly: grabs a slightly wider area, erases full-length grid lines, then crops tightly around the ink.
function glyph(x0,y0,x1,y1,hg=80,source=sc.cv){const w=x1-x0,h=y1-y0,mx=Math.round(w*.22),my=Math.round(h*.08),X=Math.max(0,Math.round(x0-mx)),Y=Math.max(0,Math.round(y0-my)),W=Math.round(w+2*mx),H=Math.round(h+2*my);
  const d=source.getContext('2d').getImageData(X,Y,W,H).data,g=new Uint8Array(W*H);for(let i=0;i<g.length;i++)g[i]=d[i*4];
  const interior=[];for(let yy=my;yy<H-my;yy++)for(let xx=mx;xx<W-mx;xx++)interior.push(g[yy*W+xx]);const t=inkThreshold(interior);if(t===null)return{blank:1};
  const m=new Uint8Array(W*H);for(let i=0;i<m.length;i++)m[i]=g[i]<t?1:0;
  for(let x=0;x<W;x++){let c=0;for(let y=0;y<H;y++)c+=m[y*W+x];if(c>H*.6&&(x<mx*.55||x>W-mx*.55)&&(m[x]||m[W+x])&&(m[(H-1)*W+x]||m[(H-2)*W+x]))for(let k=-1;k<=1;k++)if(x+k>=0&&x+k<W)for(let y=0;y<H;y++)m[y*W+x+k]=0}
  for(let y=0;y<H;y++){let c=0;for(let x=0;x<W;x++)c+=m[y*W+x];if(c>W*.6&&(y<my||y>H-my)&&(m[y*W]||m[y*W+1])&&(m[y*W+W-1]||m[y*W+W-2]))for(let k=-1;k<=1;k++)if(y+k>=0&&y+k<H)for(let x=0;x<W;x++)m[(y+k)*W+x]=0}
  // keep only real glyph strokes: drop thin full-height/width line fragments and tiny specks
  const lab=new Int32Array(W*H),cp=[],st=[];let id=0;
  for(let i=0;i<W*H;i++)if(m[i]&&!lab[i]){id++;let ar=0,x0=W,x1=0,y0=H,y1=0;st.push(i);lab[i]=id;while(st.length){const p=st.pop(),x=p%W,y=(p/W)|0;ar++;if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const nx=x+dx,ny=y+dy;if(nx>=0&&ny>=0&&nx<W&&ny<H){const q=ny*W+nx;if(m[q]&&!lab[q]){lab[q]=id;st.push(q)}}}}
    const cw=x1-x0+1,ch=y1-y0+1,line=(ch>H*.85&&cw<W*.12&&(x0<2||x1>W-3))||(cw>W*.85&&ch<H*.12&&(y0<2||y1>H-3));cp.push({id,ar,ok:!line,x0,x1,y0,y1})}
  const big=Math.max(0,...cp.filter(c=>c.ok).map(c=>c.ar)),keep=new Set(cp.filter(c=>c.ok&&c.ar>=big*.12&&c.ar>=Math.max(2,W*H*.001)&&(c.x0+c.x1)/2>=mx&&(c.x0+c.x1)/2<W-mx&&(c.y0+c.y1)/2>=my&&(c.y0+c.y1)/2<H-my).map(c=>c.id));
  for(let i=0;i<m.length;i++)if(m[i]&&!keep.has(lab[i]))m[i]=0;
  const cs=new Int32Array(W),rs=new Int32Array(H);let n=0;for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(m[y*W+x]){cs[x]++;rs[y]++;n++}
  let a=0,b=W-1,c=0,e=H-1;while(a<W&&cs[a]<1)a++;while(b>=0&&cs[b]<1)b--;while(c<H&&rs[c]<1)c++;while(e>=0&&rs[e]<1)e--;
  if(a>b||c>e||n<Math.max(3,W*H*.0015))return{blank:1};const bw=b-a+1,bh=e-c+1;
  if(bw>=Math.max(3,w*.1)&&bw/bh>=1.4&&bh<=h*.3)return{dash:1};
  const p=Math.round(bh*.35)+2,sm=document.createElement('canvas');sm.width=bw+2*p;sm.height=bh+2*p;const sx=sm.getContext('2d');sx.fillStyle='#fff';sx.fillRect(0,0,sm.width,sm.height);
  const im=sx.getImageData(0,0,sm.width,sm.height);for(let y=0;y<bh;y++)for(let x=0;x<bw;x++)if(m[(c+y)*W+a+x]){const q=((y+p)*sm.width+x+p)*4;im.data[q]=im.data[q+1]=im.data[q+2]=0}sx.putImageData(im,0,0);
  const k=hg/sm.height,o=document.createElement('canvas');o.width=Math.round(sm.width*k)+40;o.height=Math.round(hg)+40;const ox=o.getContext('2d');ox.fillStyle='#fff';ox.fillRect(0,0,o.width,o.height);ox.drawImage(sm,20,20,Math.round(sm.width*k),Math.round(hg));return{canvas:o,nc:keep.size,shape:{bw,bh,w,h}}}
// The original letter crop is retained as an independent recognition candidate.
function legacyGlyph(x0,y0,x1,y1,hg=80,source=sc.cv){const w=x1-x0,h=y1-y0,mx=Math.round(w*.22),my=Math.round(h*.08),X=Math.max(0,Math.round(x0-mx)),Y=Math.max(0,Math.round(y0-my)),W=Math.round(w+2*mx),H=Math.round(h+2*my);
  const d=source.getContext('2d').getImageData(X,Y,W,H).data,g=new Uint8Array(W*H);for(let i=0;i<g.length;i++)g[i]=d[i*4];
  const so=[...g].sort((a,b)=>a-b),lo=so[W*H*.05|0],hi=so[W*H>>1];if(hi-lo<40)return{blank:1};
  const t=(lo+hi)/2,m=new Uint8Array(W*H);for(let i=0;i<m.length;i++)m[i]=g[i]<t?1:0;
  for(let x=0;x<W;x++){let c=0;for(let y=0;y<H;y++)c+=m[y*W+x];if(c>H*.6&&(m[x]||m[W+x])&&(m[(H-1)*W+x]||m[(H-2)*W+x]))for(let k=-1;k<=1;k++)if(x+k>=0&&x+k<W)for(let y=0;y<H;y++)m[y*W+x+k]=0}
  for(let y=0;y<H;y++){let c=0;for(let x=0;x<W;x++)c+=m[y*W+x];if(c>W*.6&&(m[y*W]||m[y*W+1])&&(m[y*W+W-1]||m[y*W+W-2]))for(let k=-1;k<=1;k++)if(y+k>=0&&y+k<H)for(let x=0;x<W;x++)m[(y+k)*W+x]=0}
  // keep only real glyph strokes: drop thin full-height/width line fragments and tiny specks
  const lab=new Int32Array(W*H),cp=[],st=[];let id=0;
  for(let i=0;i<W*H;i++)if(m[i]&&!lab[i]){id++;let ar=0,x0=W,x1=0,y0=H,y1=0;st.push(i);lab[i]=id;while(st.length){const p=st.pop(),x=p%W,y=(p/W)|0;ar++;if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const nx=x+dx,ny=y+dy;if(nx>=0&&ny>=0&&nx<W&&ny<H){const q=ny*W+nx;if(m[q]&&!lab[q]){lab[q]=id;st.push(q)}}}}
    const cw=x1-x0+1,ch=y1-y0+1,line=(ch>H*.7&&cw<W*.2)||(cw>W*.7&&ch<H*.2);cp.push({id,ar,ok:!line})}
  const big=Math.max(0,...cp.filter(c=>c.ok).map(c=>c.ar)),keep=new Set(cp.filter(c=>c.ok&&c.ar>=big*.12&&c.ar>=W*H*.003).map(c=>c.id));
  for(let i=0;i<m.length;i++)if(m[i]&&!keep.has(lab[i]))m[i]=0;
  const cs=new Int32Array(W),rs=new Int32Array(H);let n=0;for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(m[y*W+x]){cs[x]++;rs[y]++;n++}
  let a=0,b=W-1,c=0,e=H-1;while(a<W&&cs[a]<2)a++;while(b>=0&&cs[b]<2)b--;while(c<H&&rs[c]<2)c++;while(e>=0&&rs[e]<2)e--;
  if(a>b||c>e||n<W*H*.006)return{blank:1};const bw=b-a+1,bh=e-c+1;
  if(bw>=w*.28&&bh<=h*.25)return{dash:1};
  const p=Math.round(bh*.35)+2,sm=document.createElement('canvas');sm.width=bw+2*p;sm.height=bh+2*p;const sx=sm.getContext('2d');sx.fillStyle='#fff';sx.fillRect(0,0,sm.width,sm.height);
  const im=sx.getImageData(0,0,sm.width,sm.height);for(let y=0;y<bh;y++)for(let x=0;x<bw;x++)if(m[(c+y)*W+a+x]){const q=((y+p)*sm.width+x+p)*4;im.data[q]=im.data[q+1]=im.data[q+2]=0}sx.putImageData(im,0,0);
  const k=hg/sm.height,o=document.createElement('canvas');o.width=Math.round(sm.width*k)+40;o.height=Math.round(hg)+40;const ox=o.getContext('2d');ox.fillStyle='#fff';ox.fillRect(0,0,o.width,o.height);ox.drawImage(sm,20,20,Math.round(sm.width*k),Math.round(hg));return{canvas:o,nc:keep.size}}
const killWk=async()=>{if(sc.wk){const k=sc.wk;sc.wk=null;await k.terminate()}};
V.scan=()=>{if(!S.wps.length)return`<h1>SCAN</h1><div class="c">Add a workplace first.</div>`;
  if(sc.busy)return`<div class="steps"><span class="on"></span><span class="on"></span><span></span></div><div class="c"><img class="pv" src="${sc.img}"><div class="pbar"><i></i></div><div id="prog" class="mu" style="margin-top:8px"></div></div>`;
  if(sc.pick)return`<h1>SCAN</h1><div class="mu" style="margin:0 6px 8px">Tap your row</div>`+sc.rows.map((r,i)=>`<div class="c cr ${r.score>=.5?'':'w'}" style="padding:8px" onclick="chooseRow(${i})"><img src="${r.img}" style="height:52px;max-width:100%"><span class="mu">${esc(r.nm||T2('Unreadable name','نام ناخوانا'))}${r.remembered?' · '+T2('Remembered','یادآوری‌شده'):''}${sc.pages.length>1?' · '+T2('Page','صفحه')+' '+r.page:''}</span></div>`).join('')+`<div class="row" style="gap:6px"><button class="p s" onclick="sc.pick=false;killWk();render()">Back</button><label class="p s"><input type=file accept="image/*" multiple hidden onchange="scanFile(this.files,true);this.value=''">Add another page</label></div>`;
  if(sc.cells)return reviewV();
  const J=S.cal==='j',n=jp(Date.now()),y=sc.y||(J?n.y:new Date().getFullYear()),m=sc.m||(J?n.m:new Date().getMonth()+1);
  sc.wp=sc.wp||S.wps[0].id;sc.name=sc.name||S.myname||'';
  const mn=i=>J?JM[i-1]:new Date(2024,i-1,1).toLocaleDateString(loc(),{month:'long'}),inp=cap=>`<input type=file accept="image/*" ${cap?'capture=environment':''} hidden ${cap?'':'multiple'} onchange="scanFile(this.files);this.value=''">`;
  return `<div class="steps"><span class="on"></span><span></span><span></span></div><div class="c"><label class=mu>Workplace</label><select id=sw>${S.wps.map(w=>`<option value="${w.id}" ${w.id===sc.wp?'selected':''}>${esc(w.name)}</option>`).join('')}</select>
<label class=mu>Your name</label><input id=sn value="${esc(sc.name)}"><div class=row style="gap:8px"><select id=sm>${[...Array(12)].map((_,i)=>`<option value=${i+1} ${i+1===m?'selected':''}>${mn(i+1)}</option>`).join('')}</select><input id=sy inputmode=numeric dir=ltr value="${PDg(y)}" style="width:100px"></div>
<p class="mu">${T2('Include the full table and date header. Avoid glare and use the original photo; tiny or obscured text needs manual review.','جدول و ردیف تاریخ‌ها کامل در عکس باشند. از بازتاب نور پرهیز کنید و عکس اصلی را انتخاب کنید؛ متن ریز یا پوشیده نیاز به بررسی دستی دارد.')}</p><div class=row style="gap:8px"><label class=p>${inp(1)}Camera</label><label class="p s">${inp(0)}Gallery</label></div><div id=prog class=mu style="margin-top:8px;color:var(--red)">${sc.msg}</div></div>`};
function readForm(){sc.wp=$('#sw').value;sc.name=$('#sn').value.trim();sc.m=+$('#sm').value;sc.y=+nrm($('#sy').value);S.myname=sc.name;save()}
const turn=(cv,deg)=>{const q=deg%180?[cv.height,cv.width]:[cv.width,cv.height],n=document.createElement('canvas');n.width=q[0];n.height=q[1];const x=n.getContext('2d');x.translate(q[0]/2,q[1]/2);x.rotate(deg*Math.PI/180);x.drawImage(cv,-cv.width/2,-cv.height/2);return n};
const gridOf=cv=>gridScan(cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data,cv.width,cv.height);
// Straightens the photo by the measured tilt and stores the grid lines (in straightened coordinates).
function setLayout(cv,G){const c=Math.cos(G.th),s=Math.sin(G.th),n=document.createElement('canvas');n.width=G.W2;n.height=G.H2;const x=n.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,n.width,n.height);x.setTransform(c,-s,s,c,G.ox,G.oy);x.drawImage(cv,0,0);sc.cv=n;
  const sm=document.createElement('canvas');sm.width=1200;sm.height=1200*n.height/n.width;sm.getContext('2d').drawImage(n,0,0,sm.width,sm.height);sc.img=sm.toDataURL('image/jpeg',.7);
  sc.dbg=cv.width+'×'+cv.height+' '+(G.th*57.3).toFixed(1)+'° H'+G.hl.length+' V'+G.vl.length;
  if(G.hl.length<5||G.vl.length<8)throw Error('Table lines not found. Retake the photo flat and fully in view.');
  sc.hl=fillGaps(G.hl,1);sc.vl=extLines(fillGaps(G.vl),G.vl2)}
const tick=()=>new Promise(r=>setTimeout(r,30));
const usePage=pi=>{const p=sc.pages[pi];Object.assign(sc,{cv:p.cv,hl:p.hl,vl:p.vl,dayAt:p.dayAt,nameCol:p.nameCol,dr:p.dr,guess:p.guess,dbg:p.dbg})};
async function readPage(f){let img;try{img=await createImageBitmap(f,{imageOrientation:'from-image'})}catch(e){img=await createImageBitmap(f)}
  const k=Math.min(1,2400/Math.max(img.width,img.height));let cv=document.createElement('canvas');cv.width=Math.round(img.width*k);cv.height=Math.round(img.height*k);cv.getContext('2d').drawImage(img,0,0,cv.width,cv.height);
  sc.img=cv.toDataURL('image/jpeg',.5);const pv=$('.pv');if(pv)pv.src=sc.img;P('Preparing image…',.05);await tick();enhance(cv);P('Finding the table…',.1);await tick();let G=gridOf(cv);
  if(G.hl.length>G.vl.length){cv=turn(cv,90);G=gridOf(cv)}
  if(!sc.wk){const B=BASE();await loadScript(B+'tesseract.min.js');P('Reading the table…',.2);sc.wk=await Tesseract.createWorker('eng',1,{workerPath:B+'worker.min.js',corePath:B,langPath:B+'lang',gzip:true});await sc.wk.setParameters({tessedit_pageseg_mode:'7'})}
  setLayout(cv,G);await structure();
  if(sc.guess){const c2=turn(cv,180),g2=gridOf(c2);setLayout(c2,g2);await structure();if(sc.guess){setLayout(cv,G);await structure()}}
  sc.pages.push({cv:sc.cv,hl:sc.hl,vl:sc.vl,dayAt:sc.dayAt,nameCol:sc.nameCol,dr:sc.dr,guess:sc.guess,dbg:sc.dbg,rows:sc.rows})}
async function scanFile(files,add){files=[...(files||[])];if(!files.length)return;if($('#sw'))readForm();sc.msg='';sc.cells=null;sc.pick=false;if(!add||!sc.pages){sc.pages=[];sc.img='';await killWk()}
  try{sc.busy=true;render();for(const f of files)await readPage(f);
    sc.rows=sc.pages.flatMap((p,pi)=>p.rows.map(r=>({...r,pi,page:pi+1})));await pickAuto()}catch(e){sc.busy=false;sc.msg='Scan failed: '+e.message+(sc.dbg?' ['+sc.dbg+']':'');await killWk();render()}}
// Header OCR gives each column its day number (and the direction); the name column sits at the day-1 end.
async function structure(){const H=sc.hl,V=sc.vl,wk=sc.wk,vals=[];await wk.setParameters({tessedit_char_whitelist:'0123456789'});
  for(let i=0;i<V.length-1;i++){P('Reading dates…',.25+.2*i/V.length);const gl=glyph(V[i]+6,H[0]+6,V[i+1]-6,H[1]-6,70),r=gl.canvas?await wk.recognize(gl.canvas):{data:{text:''}},v=+nrm(r.data.text.replace(/\D/g,''));vals.push(v>=1&&v<=31?v:0)}
  const votes={};vals.forEach((v,i)=>{if(v)for(const d of [1,-1]){const k=d+':'+(v-d*i);votes[k]=(votes[k]||0)+1}});
  const [k,n]=Object.entries(votes).sort((a,b)=>b[1]-a[1])[0]||['',0];let dr,a0;sc.guess=n<4;if(sc.guess){dr=-1;a0=V.length-5}else[dr,a0]=k.split(':').map(Number);sc.dr=dr;sc.dayAt=i=>a0+dr*i;
  sc.nameCol=dr<0?V.length-2:0;const hs=H.slice(1).map((v,i)=>v-H[i+1-1]).slice(1),rows=[];const med=[...hs].sort((a,b)=>a-b)[hs.length>>1];
  for(let j=1;j<H.length-1;j++){const h=H[j+1]-H[j];if(h>med*.6&&h<med*1.5)rows.push([H[j],H[j+1]])}
  const wn=await Tesseract.createWorker('fas',1,{workerPath:BASE()+'worker.min.js',corePath:BASE(),langPath:BASE()+'lang',gzip:true});await wn.setParameters({tessedit_pageseg_mode:'7'});sc.rows=[];const toks=sc.name.split(/\s+/).map(nn).filter(Boolean);
  try{for(let j=0;j<rows.length;j++){P('Reading names…',.45+.3*j/rows.length);const[y0,y1]=rows[j],cr=cropC(V[sc.nameCol]+4,y0+4,V[sc.nameCol+1]-4,y1-4,0,110);let r=await wn.recognize(cr);
    if(r.data.confidence<65){const second=await wn.recognize(cropC(V[sc.nameCol]+4,y0+4,V[sc.nameCol+1]-4,y1-4,1,110));if(second.data.confidence>r.data.confidence)r=second}
    const feature=visualFeature(cr,'names'),raw=cleanName(r.data.text),memory=recallExample('names',sc.wp,feature,raw),name=memory?memory.label:raw,ws=name.split(/\s+/).map(nn).filter(Boolean);
    const score=toks.filter(t=>ws.some(w=>w===t||(t.length>3&&lev(w,t)<=(t.length>5?2:1)))).length/(toks.length||1);sc.rows.push({y0,y1,score,nm:name,rawName:raw,nameFeature:feature,remembered:!!memory,img:cr.toDataURL('image/jpeg',.8)})}}finally{await wn.terminate()}}
function pickAuto(){const sr=sc.rows.map(r=>r.score),b=sr.indexOf(Math.max(...sr)),o=[...sr].sort((x,y)=>y-x);if(sr[b]>=.6&&(o[1]===undefined||o[1]<sr[b]-.2))return readCells(b);sc.busy=false;sc.pick=true;render()}
async function chooseRow(i){sc.pick=false;sc.busy=true;render();await readCells(i)}
async function readCells(ri){try{const r=sc.rows[ri];usePage(r.pi);sc.ri=ri;const w=S.wps.find(x=>x.id===sc.wp),wk=sc.wk,V=sc.vl,J=S.cal==='j',b0=J?fromJ(sc.y,sc.m,1):new Date(sc.y,sc.m-1,1),list=[];
  await wk.setParameters({tessedit_char_whitelist:[...new Set(w.codes.map(c=>c.code).join('')+'-م')].join('')});
  for(let i=0;i<V.length-1;i++){const day=sc.dayAt(i);if(day<1||day>31||i===sc.nameCol)continue;const d=new Date(b0.getFullYear(),b0.getMonth(),b0.getDate()+day-1);if(!(J?jp(d).m===sc.m:d.getMonth()===sc.m-1))continue;list.push({i,day,date:iso(d)})}
  list.sort((a,b)=>a.day-b.day);sc.cells=[];
  for(let q=0;q<list.length;q++){const{i,day,date}=list[q];P('Reading cells '+(q+1)+'/'+list.length,.75+.25*q/list.length);const [x0,y0,x1,y1]=cellBounds(V[i],r.y0,V[i+1],r.y1);
    const result=await recognizeShift(w,wk,x0,y0,x1,y1);
    if(sc.guess){result.uncertain=true;result.c=Math.min(65,result.c)}sc.cells.push({day,date,...result})}

  sc.strip=cropC(V[0],r.y0+2,V[V.length-1],r.y1-2,0,56).toDataURL('image/jpeg',.6)}catch(e){sc.msg='Scan failed: '+e.message;sc.cells=null}
  sc.busy=false;render()}
const cState=(w,c)=>c.uncertain&&!c.confirmed?'low':!c.text?'empty':!parse(w,c.text)?'bad':c.c<80?'low':'ok';
const setCell=(i,v)=>{const c=sc.cells[i];c.text=v;c.c=100;c.confirmed=true;c.uncertain=false;render()};
const reviewV=()=>{const w=S.wps.find(x=>x.id===sc.wp),st=sc.cells.map(c=>cState(w,c)),chk=st.filter(x=>x!=='ok'&&x!=='empty').length,n=sc.cells.filter(c=>c.text).length,cur=sc.rows[sc.ri];
  return `<div class="steps"><span class="on"></span><span class="on"></span><span class="on"></span></div>${sc.guess?'<div class="c mu" style="border-color:var(--org)">Dates were guessed. Check the first and last day.</div>':''}
<div class="row" style="margin:0 2px 8px"><b>${esc(sc.name)} · ${esc(w.name)}${sc.pages.length>1?' · Page '+cur.page:''}</b><span class="bad ${chk?'g':''}" style="${chk?'':'background:var(--ok)'}">${chk?chk+' Needs review':n+' ✓'}</span></div>
${sc.cells.some(c=>c.uncertain)?`<div class="c scan-notice">${T2('Check highlighted cells against the photo. Blank, blurry and conflicting readings need confirmation.','خانه‌های مشخص‌شده را با عکس مقایسه کنید. خانه‌های خالی، تار یا دارای نتیجهٔ متناقض نیاز به تأیید دارند.')}</div>`:''}<p class="mu">${T2('Tap the correct symbol to confirm it. Confirmed corrections are remembered when you import. ∅ means blank; − means off.','برای تأیید، علامت درست را بزنید. اصلاحات پس از ثبت به خاطر سپرده می‌شوند. ∅ یعنی خالی؛ − یعنی تعطیل.')}</p><img class="scan-strip" src="${sc.strip}">`
   +sc.cells.map((c,i)=>{const k=st[i];return `<div class="rv ${k==='ok'||k==='empty'?'':'w'}"><div class="rd"><b>${new Date(c.date+'T00:00').toLocaleDateString(loc(),{day:'numeric'})}</b><span class="mu">${new Date(c.date+'T00:00').toLocaleDateString(loc(),{weekday:'short'})}</span></div><img src="${c.img}"><div><div class="keys">${[...w.codes,...(!w.codes.some(x=>x.code==='-')&&w.codes.some(x=>x.type==='off')?[{code:'-'}]:[])].map(x=>`<button class="k${c.text===x.code?' on':''}" onclick="setCell(${i},${esc(JSON.stringify(x.code))})">${esc(x.code)}</button>`).join('')}<button class="k" onclick="setCell(${i},'')" aria-label="${T2('Leave blank','خالی')}" title="${T2('Leave blank','خالی')}">∅</button><input class="ki" dir="ltr" value="${esc(c.text)}" onchange="setCell(${i},nrm(this.value.trim()))"></div>${c.suggestion?`<small class="memory-note">${T2('Suggested from your corrections','پیشنهاد از اصلاحات شما')}</small>`:''}</div></div>`}).join('')
   +`<div class="sticky"><button class=p onclick=doImport()>Import ${n}</button><button class="p s" style="margin-top:6px" onclick="doImport(1)">Import and read colleagues</button><div class="row" style="gap:6px;margin-top:6px"><button class="p s" onclick="sc.cells=null;sc.pick=true;render()">Wrong row?</button><label class="p s"><input type=file accept="image/*" multiple hidden onchange="scanFile(this.files,true);this.value=''">Add another page</label></div></div>`};
function doImport(all){const w=S.wps.find(x=>x.id===sc.wp),L=sc.cells.filter(c=>c.text);
  const bad=L.filter(c=>!parse(w,c.text)).length,unsure=sc.cells.filter(c=>cState(w,c)==='low').length;
  if(bad)return alert(T2(bad+' unknown codes. Fix them first.',bad+' علامت ناشناخته است. ابتدا آن‌ها را اصلاح کنید.'));
  if(sc.guess&&!confirm(T2('Dates were estimated. Have you verified every date against the photo?', 'تاریخ‌ها تخمینی هستند. آیا همهٔ تاریخ‌ها را با عکس مطابقت داده‌اید؟')))return;
  if(unsure&&!confirm(T2(`${unsure} uncertain cells (including possible blank cells). Import anyway?`,`${unsure} خانه نیاز به بررسی دارد (شامل خانه‌های احتمالاً خالی). ثبت شود؟`)))return;
  const row=sc.rows[sc.ri];rememberExample('names',w.id,row.nameFeature,row.rawName||row.nm,sc.name);
  sc.cells.filter(c=>c.confirmed&&c.text&&parse(w,c.text)).forEach(c=>rememberExample('glyphs',w.id,c.feature,c.raw,c.text));
  L.forEach((c,n)=>{const cs=parse(w,c.text);S.shifts=S.shifts.filter(h=>!(h.wp===w.id&&h.date===c.date));
    S.shifts.push({id:'s'+Date.now()+n,wp:w.id,date:c.date,text:c.text,label:cs.map(x=>x.label).join(' + '),segs:makeSegs(c.date,cs)})});
  sc.cells=null;save();if(all)readAll();else{killWk();go('agenda')}}

/* ===== v11 Team: colleagues, cover finder, compare ===== */
const T2=(en,fa)=>S.lang==='fa'?fa:en;
const mates=id=>(S.mates||[]).filter(m=>m.wp===id);
let tc={v:'list',wp:'',dates:[],res:null,mate:'',busy:false};
const curWp=()=>S.wps.find(x=>x.id===tc.wp)||S.wps.find(w=>mates(w.id).length)||S.wps[0];
const isWork=(w,t)=>{const c=t&&parse(w,t);return !!c&&c.some(x=>x.type==='work')};
const isOff=(w,t)=>{const c=t&&parse(w,t);return !!c&&c.every(x=>x.type==='off')};
const mateSegs=(w,m)=>Object.entries(m.cells).flatMap(([d,t])=>{const c=parse(w,t);return c?makeSegs(d,c):[]}).sort((a,b)=>a.s-b.s);
// Facts about a colleague around a shift (their previous/next shift and the gap) — information only, no advice.
function facts(w,m,h){const ss=mateSegs(w,m),s0=Math.min(...h.segs.map(g=>g.s)),e0=Math.max(...h.segs.map(g=>g.e)),p=[...ss].reverse().find(g=>g.e<=s0),n=ss.find(g=>g.s>=e0);return{p:p&&{c:p.code,g:(s0-p.e)/6e4},n:n&&{c:n.code,g:(n.s-e0)/6e4}}}
const factTxt=f=>[f.p&&`${T2('before','قبلش')}: ${f.p.c} <span class="${f.p.g<S.gap?'tight':''}">(${dur(f.p.g)})</span>`,f.n&&`${T2('after','بعدش')}: ${f.n.c} <span class="${f.n.g<S.gap?'tight':''}">(${dur(f.n.g)})</span>`].filter(Boolean).join(' · ');
// For each shift I want to hand over: colleagues who are off that day, or whose own shift + mine is an allowed combination.
function coverCalc(){const w=curWp(),ms=mates(w.id),combos=w.combos||[],rows=[];
  for(const id of tc.dates){const h=S.shifts.find(x=>x.id===id);if(!h)continue;const row={h,free:[],ext:[],unk:[]};
    for(const m of ms){const t=m.cells[h.date]||'';if(!t){row.unk.push({m});continue}const cs=parse(w,t);if(!cs||cs.some(c=>c.type==='leave'))continue;
      const u=(m.uns||[]).includes(h.date);if(u){row.unk.push({m});continue}
      if(mateSegs(w,m).some(g=>h.segs.some(hg=>g.s<hg.e&&hg.s<g.e)))continue;
      const f=facts(w,m,h);
      if(cs.every(c=>c.type==='off'))row.free.push({m,f,u});else{const combo=combos.find(c=>c===t+h.text||c===h.text+t);if(combo)row.ext.push({m,f,u,combo})}}
    rows.push(row)}
  return{rows,all:ms.filter(m=>rows.length&&rows.every(r=>r.free.some(x=>x.m===m)||r.ext.some(x=>x.m===m)))}}
const togD=id=>{tc.dates=tc.dates.includes(id)?tc.dates.filter(x=>x!==id):[...tc.dates,id];tc.res=null;render()};
const coverGo=()=>{tc.res=coverCalc();render()};
function shareReq(){const l=tc.res.rows.map(x=>dlabel(x.h.date)+' ('+x.h.text+')').join(T2(', ','، ')),t=T2(`Hi! I can't make these shifts: ${l}. Could you cover for me?`,`سلام! این شیفت‌ها رو نمی‌تونم بیام: ${l}. می‌تونی جام بیای؟`);
  if(navigator.share)navigator.share({text:t}).catch(()=>{});else{navigator.clipboard&&navigator.clipboard.writeText(t);alert(T2('Message copied','پیام کپی شد'))}}
function renMate(id){const m=S.mates.find(x=>x.id===id);if(!m)return;
  dlg(`<h3>${T2('Correct colleague name','اصلاح نام همکار')}</h3>${m.img?`<img class="name-preview" src="${m.img}" alt="${T2('Name from the roster','نام در تصویر برنامه')}">`:''}<label for="mate-name" class="mu">${T2('Correct name','نام صحیح')}</label><input id="mate-name" dir="auto" value="${esc(m.name)}"><p class="mu">${T2('This correction will help recognize the same name in future scans on this device.','این اصلاح به تشخیص همین نام در اسکن‌های بعدی روی این دستگاه کمک می‌کند.')}</p><button class="p" onclick="saveMateName('${id}')">Save</button><button class="p s" style="margin-top:8px" onclick="close()">${T2('Cancel','لغو')}</button>`)}
function saveMateName(id){const m=S.mates.find(x=>x.id===id),name=$('#mate-name').value.trim();if(!m||!name)return;rememberExample('names',m.wp,m.nameFeature,m.rawName||m.name,name);m.name=name;save();close();render()}
const delMate=id=>{if(confirm(T2('Remove this colleague?','این همکار حذف بشه؟'))){S.mates=S.mates.filter(m=>m.id!==id);save();render()}};
const noMates=()=>`<div class="c"><b>${T2('No colleagues yet','هنوز همکاری ثبت نشده')}</b><p class="mu">${T2('Scan the roster and choose “Import and read colleagues”. Their shifts stay on this phone.','برنامه رو اسکن کن و «ثبت + خوندن همکارها» رو بزن. شیفت همکارها فقط روی همین گوشی می‌مونه.')}</p>${sc.pages&&sc.pages.length?`<button class="p" onclick="readAll()">${T2('Read colleagues from the last scan','خوندن همکارها از آخرین اسکن')}</button>`:''}</div>`;
const mateList=(w,ms)=>`<p class="mu">${T2('Tap a name to correct it and remember it for future scans.','برای اصلاح و یادآوری در اسکن‌های بعدی، روی نام همکار بزنید.')}</p>`+ms.map(m=>`<div class="pk"><span style="display:flex;gap:8px;align-items:center">${m.img?`<img class="nm" src="${m.img}">`:''}<button class="name-edit" onclick="renMate('${m.id}')">${bidi(m.name||'?')} <span aria-hidden="true">✎</span></button></span><span class="mu">${Object.values(m.cells).filter(t=>isWork(w,t)).length} ${T2('shifts','شیفت')} <button class="x" onclick="delMate('${m.id}')">✕</button></span></div>`).join('')+(sc.pages&&sc.pages.length?`<button class="p s" style="margin-top:6px" onclick="readAll()">${T2('Read colleagues from the last scan','خوندن همکارها از آخرین اسکن')}</button>`:'');
const covV=w=>{const R=tc.res,my=S.shifts.filter(h=>h.wp===w.id&&h.date>=iso(Date.now())&&h.segs.length).sort((a,b)=>a.date<b.date?-1:1);
  const pick=`<div class="mu" style="margin:0 4px 6px">${T2('Tap the shifts you want to hand over','شیفت‌هایی که می‌خوای واگذار کنی رو بزن')}</div>`+(my.length?my.map(h=>`<div class="pk${tc.dates.includes(h.id)?' on':''}" onclick="togD('${h.id}')"><span>${dlabel(h.date)}</span><b>${esc(h.text)}</b></div>`).join(''):`<div class="c mu">${T2('No upcoming shifts here.','شیفت آینده‌ای اینجا نداری.')}</div>`);
  const btn=`<button class="p" style="margin:6px 0 10px" onclick="coverGo()" ${tc.dates.length?'':'disabled'}>${T2('Who can take these?','چه کسی می‌تونه بیاد؟')}</button>`;
  if(!R)return pick+btn;
  const g=(t,a,f)=>a.length?`<div class="mu" style="margin:6px 2px 3px">${t}</div>`+a.map(f).join(''):'';
  return pick+btn+(R.rows.length>1?`<div class="c"><b>${T2('Can take all of them','همه‌شون رو می‌تونه')}</b><div class="mu">${R.all.length?R.all.map(m=>bidi(m.name)).join('، '):'—'}</div></div>`:'')
   +R.rows.map(r=>`<div class="c"><b>${dlabel(r.h.date)} · ${r.h.text}</b>`
     +g(T2('Free that day','اون روز آزاده'),r.free,x=>`<div class="mrow"><b>${esc(x.m.name)}${x.u?' ⚠️':''}</b><span class="mu">${factTxt(x.f)}</span></div>`)
     +g(T2('Could add it to their shift','می‌تونه کنار شیفتش بیاد'),r.ext,x=>`<div class="mrow"><b>${esc(x.m.name)}${x.u?' ⚠️':''}</b> <span class="bad g" style="background:var(--ac)">${x.combo}</span><span class="mu">${factTxt(x.f)}</span></div>`)
     +(r.unk.length?`<div class="mu" style="margin-top:6px">${T2('Unknown or needs review','نامشخص یا نیازمند بررسی')}: ${r.unk.map(x=>bidi(x.m.name)).join('، ')}</div>`:'')
     +(r.free.length||r.ext.length?'':`<div class="mu">${T2('Nobody found for this day.','برای این روز کسی پیدا نشد.')}</div>`)+'</div>').join('')
   +`<button class="p s" onclick="shareReq()">${T2('Share a request message','ارسال پیام درخواست')}</button>`};
const cmpV=w=>{const ms=mates(w.id),m=ms.find(x=>x.id===tc.mate),sel=`<select onchange="tc.mate=this.value;render()"><option value="">${T2('Choose a colleague','یه همکار انتخاب کن')}</option>${ms.map(x=>`<option value="${x.id}" ${x.id===tc.mate?'selected':''}>${esc(x.name)}</option>`).join('')}</select>`;
  if(!m)return sel;const mine={};S.shifts.filter(h=>h.wp===w.id).forEach(h=>mine[h.date]=h.text);
  const both=[],a=[],b=[];for(const d of [...new Set([...Object.keys(mine),...Object.keys(m.cells)])].sort()){if((m.uns||[]).includes(d))continue;const x=mine[d]||'',y=m.cells[d]||'',xw=isWork(w,x),yw=isWork(w,y);if(xw&&yw)both.push([d,x,y]);else if(xw&&isOff(w,y))a.push([d,x]);else if(yw&&isOff(w,x))b.push([d,y])}
  const L=(t,arr,f)=>`<h1>${t} (${arr.length})</h1>`+(arr.length?`<div class="c">${arr.map(f).join('<br>')}</div>`:`<div class="c mu">—</div>`);
  return sel+((m.uns||[]).length?`<p class="c scan-notice">${T2('Dates needing scan review are excluded from this comparison.','تاریخ‌های نیازمند بررسی اسکن در این مقایسه نمایش داده نمی‌شوند.')}</p>`:'')+L(T2('Working together','با هم شیفت'),both,([d,x,y])=>`${dlabel(d)} · ${x} / ${y}`)+L(T2('I work, they are off','من شیفتم، همکارم آزاده'),a,([d,x])=>`${dlabel(d)} · ${x}`)+L(T2('They work, I am off','همکارم شیفته، من آزادم'),b,([d,y])=>`${dlabel(d)} · ${y}`)};
V.team=()=>{if(!S.wps.length)return`<div class="empty"><p class="mu">${T2('Add a workplace first.','اول یه محل کار اضافه کن.')}</p><button class="p" onclick="go('places')">Add workplace</button></div>`;
  const w=curWp();tc.wp=w.id;const ms=mates(w.id);
  if(tc.busy)return`<div class="c"><div class="pbar"><i></i></div><div id="prog" class="mu" style="margin-top:8px"></div><button class="p s" style="margin-top:10px" onclick="tc.cancel=1">${T2('Cancel','لغو')}</button></div>`;
  const wsel=S.wps.length>1?`<select onchange="tc.wp=this.value;tc.res=null;tc.dates=[];tc.mate='';render()">${S.wps.map(x=>`<option value="${x.id}" ${x.id===w.id?'selected':''}>${esc(x.name)}</option>`).join('')}</select>`:'';
  const tabs=[['list',T2('Colleagues','همکارها')],['cover',T2('Find cover','جایگزین')],['cmp',T2('Compare','مقایسه')]].map(([k,l])=>`<button class="${tc.v===k?'on':''}" onclick="tc.v='${k}';render()">${l}</button>`).join('');
  return wsel+`<div class="seg">${tabs}</div>`+(!ms.length?noMates():tc.v==='cover'?covV(w):tc.v==='cmp'?cmpV(w):mateList(w,ms))};
// Reads every other row of the last scanned sheet and stores them as colleagues (device only).
const cleanName=s=>(s||'').replace(/[\u200c\u200e\u200f|\[\]_]/g,' ').replace(/\s+/g,' ').trim();
async function readAll(){const w=S.wps.find(x=>x.id===sc.wp);if(!w||!sc.pages)return;tc.busy=true;tc.cancel=false;tc.v='list';tab='team';render();
  try{if(!sc.wk){const B=BASE();await loadScript(B+'tesseract.min.js');sc.wk=await Tesseract.createWorker('eng',1,{workerPath:B+'worker.min.js',corePath:B,langPath:B+'lang',gzip:true})}
    const wk=sc.wk,J=S.cal==='j',b0=J?fromJ(sc.y,sc.m,1):new Date(sc.y,sc.m-1,1),rows=sc.rows.filter((r,i)=>i!==sc.ri);
    await wk.setParameters({tessedit_pageseg_mode:'7',tessedit_char_whitelist:[...new Set(w.codes.map(c=>c.code).join('')+'-م')].join('')});
    for(let q=0;q<rows.length&&!tc.cancel;q++){const r=rows[q];usePage(r.pi);const V=sc.vl,cells={},uns=[];P(T2('Reading colleague ','خوندن همکار ')+(q+1)+'/'+rows.length,q/rows.length);
      for(let i=0;i<V.length-1;i++){const day=sc.dayAt(i);if(day<1||day>31||i===sc.nameCol)continue;const d=new Date(b0.getFullYear(),b0.getMonth(),b0.getDate()+day-1);if(!(J?jp(d).m===sc.m:d.getMonth()===sc.m-1))continue;
        const result=await recognizeShift(w,wk,...cellBounds(V[i],r.y0,V[i+1],r.y1)),t=result.text;
        if(sc.guess||result.c<80||result.uncertain||!t||!parse(w,t))uns.push(iso(d));
        if(t&&parse(w,t))cells[iso(d)]=t;}
      const name=cleanName(r.nm),matches=(S.mates||[]).filter(m=>m.wp===w.id&&nn(m.name)===nn(name)),ex=name&&matches.length===1?matches[0]:null;
      const meta={img:r.img,rawName:r.rawName||r.nm,nameFeature:r.nameFeature};
      if(ex){Object.assign(ex.cells,cells);ex.uns=[...(ex.uns||[]).filter(x=>!(x in cells)),...uns];Object.assign(ex,meta)}else(S.mates=S.mates||[]).push({id:'m'+Date.now()+q,wp:w.id,name:name||'#'+(q+1),...meta,cells,uns})}

    save()}catch(e){alert('Error: '+e.message)}
  tc.busy=false;await killWk();render()}

(async()=>{const L=await load()||{};if(L.wps&&!L.ver){L.lang='fa';L.cal='j';L.ver=3}S={...S,...L};sel=iso(Date.now());cm=mfirst(new Date());render();if('serviceWorker'in navigator){navigator.serviceWorker.register('sw.js');if(navigator.serviceWorker.controller)navigator.serviceWorker.addEventListener('controllerchange',()=>location.reload())}})();
setInterval(()=>tab==='today'&&!$('#dlg').open&&render(),60000);
