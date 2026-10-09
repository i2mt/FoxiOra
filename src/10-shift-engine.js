/* ---------- SHIFT CODES ---------- */
// Text format per line: code|label|HH:MM-HH:MM  or  code|label|leave  or  code|label|off
const encCodes=cs=>cs.map(c=>`${c.code}|${c.label}|${c.type==='work'?c.start+'-'+c.end:c.type}`).join('\n');
function decCodes(t){t=nrm(t);return t.split('\n').map(l=>l.split('|').map(x=>x.trim())).filter(a=>a[0]).map(([code,label,v=''])=>{
  const m=v.match(/^(\d{1,2}:\d{2})-(\d{1,2}:\d{2})$/);return m?{code,label,type:'work',start:m[1],end:m[2]}:{code,label,type:v==='off'?'off':'leave'}})}
// Longest-match-first tokenizer: "DEn" -> D,E,n ; "N" never becomes "n" (case-sensitive).
function parse(wp,text){if(!wp?.codes||!text)return null;text=nrm(text).replace(/[–—−]/g,'-');
 const tokens=wp.codes.flatMap(c=>[{token:c.code,c},...(c.aliases||[]).map(token=>({token,c}))]).filter(x=>x.token).sort((a,b)=>b.token.length-a.token.length);
 if(/^[-]+$/.test(text)&&!wp.codes.some(c=>c.code==='-'&&c.type!=='off')){const off=wp.codes.find(c=>c.type==='off');return off?[{...off,code:offCode(wp)}]:null}
 // Explicit hospital definitions take precedence over built-in off aliases.
 if(!tokens.some(x=>x.token===text)&&/^(off|\*)$/i.test(text)){const c=wp.codes.find(c=>c.type==='off');if(c)return[{...c,code:offCode(wp)}]}
 let i=0,out=[];while(i<text.length){const matches=tokens.filter(x=>text.startsWith(x.token,i)),m=matches[0];if(!m)return null;
 if(matches.some(x=>x.token===m.token&&x.c.code!==m.c.code))return null;out.push(m.c);i+=m.token.length}return out.length?out:null}
const canonicalShift=(w,t)=>{const c=parse(w,t);return c?c.every(x=>x.type==='off')?offCode(w):c.map(x=>x.code).join(''):t};
const codeTokens=w=>[...new Set(w.codes.flatMap(c=>[c.code,...(c.aliases||[])]).join('')+'-م')].join('');
const shiftKind=(w,t)=>{const c=parse(w,t);return !c?'unknown':c.every(x=>x.type==='off')?'off':c.every(x=>x.type==='leave')?'leave':c.some(x=>x.code==='N'||x.code==='n')?'night':c.length>1?'combined':c.some(x=>x.code==='E')?'evening':'day'};
const codeStatusLabel=c=>c.type==='off'?'off':c.label==='Sick leave'||c.label==='مرخصی استعلاجی'?T2('Sick leave','استعلاجی'):c.label;
const rosterLabel=h=>(parse(wp(h.wp),h.text)||[]).map(codeStatusLabel).join(' + ')||h.label;
const shiftMark=(w,t)=>`<em class="shift-mark ${shiftKind(w,t)}">${codeHTML(canonicalShift(w,t))}</em>`;
const at=(d,t)=>{const[h,m]=t.split(':');const[y,mo,da]=d.split('-');return new Date(+y,mo-1,+da,+h,+m).getTime()};
function makeSegs(date,codes){return codes.filter(c=>c.type==='work').map(c=>{const s=at(date,c.start);let e=at(date,c.end);if(e<=s)e+=DAY;return{s,e,code:c.code}})}

/* ---------- SCHEDULE / CONFLICT ENGINE ---------- */
const segs=()=>S.shifts.flatMap(h=>h.segs.map(g=>({...g,wp:h.wp,sh:h.id}))).sort((a,b)=>a.s-b.s);
function issues(){const out=[],active=[];let latest=null;for(const g of segs()){
 for(let i=active.length-1;i>=0;i--)if(active[i].e<=g.s)active.splice(i,1);
 // A handover overlap within one workplace is continuous duty, not double booking.
 if(S.cross)for(const a of active)if(a.wp!==g.wp)out.push({t:'o',a,b:g,min:(Math.min(a.e,g.e)-g.s)/6e4});
 if(latest&&g.s>=latest.e&&(g.s-latest.e)/6e4<S.gap&&latest.sh!==g.sh)out.push({t:'g',a:latest,b:g,min:(g.s-latest.e)/6e4});
 if(!latest||g.e>latest.e)latest=g;active.push(g)}return out}
// The Today card follows a continuous combined duty until its final end time.
function displaySegs(){return S.shifts.flatMap(h=>{const sorted=h.segs.map(g=>({...g,wp:h.wp,sh:h.id})).sort((a,b)=>a.s-b.s),out=[];for(const g of sorted){const last=out.at(-1);if(last&&g.s<=last.e){last.e=Math.max(last.e,g.e);last.code=canonicalShift(wp(h.wp),h.text);last.aggregate=true}else out.push({...g})}return out}).sort((a,b)=>a.s-b.s)}
const wp=id=>S.wps.find(w=>w.id===id)||{name:'?',color:'#888'};
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// Attribute-safe JavaScript arguments keep imported identifiers out of executable markup.
const jsArg=v=>esc(JSON.stringify(String(v??'')));
const safeColor=v=>/^#[0-9a-f]{3}(?:[0-9a-f]{3})?$/i.test(String(v))?v:'#888888';
const imageSrc=v=>/^data:image\/(?:jpeg|png|webp|gif);base64,[a-z0-9+/=\s]+$/i.test(String(v))?esc(v):'';
const bidi=(v,dir='auto')=>`<bdi dir="${dir}">${esc(v)}</bdi>`;
const codeHTML=v=>bidi(v,'ltr');
const dur=m=>{m=Math.max(0,Math.round(m));const h=Math.floor(m/60),n=m%60;return S.lang==='fa'?[h?`${h} ساعت`:'',n||!h?`${n} دقیقه`:''].filter(Boolean).join(' و '):[h?`${h} ${h===1?'hour':'hours'}`:'',n||!h?`${n} ${n===1?'minute':'minutes'}`:''].filter(Boolean).join(' ')};
const countdown=m=>{m=Math.max(0,Math.ceil(m));const days=Math.floor(m/1440);return days?`${days} ${S.lang==='fa'?'روز':days===1?'day':'days'}${m%1440?(S.lang==='fa'?' و ':' ')+dur(m%1440):''}`:dur(m)};
const placeColor=id=>S.themePlaces!==false?['var(--ac)','var(--ac-alt)','var(--ac-third)'][Math.max(0,S.wps.findIndex(w=>w.id===id))%3]:safeColor(wp(id).color);
const hm=ms=>{const d=new Date(ms);return S.h24?String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0'):d.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'})};
const iso=d=>{d=new Date(d);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const loc=()=>S.lang==='fa'?(S.cal==='j'?'fa-IR-u-ca-persian':'fa-IR-u-ca-gregory'):(S.cal==='j'?'en-GB-u-ca-persian':'en-GB');
const weekdayShort=d=>S.lang==='fa'?['یک','دو','سه','چهار','پنج','جمعه','شنبه'][d.getDay()]:d.toLocaleDateString(loc(),{weekday:'short'});
const dateText=value=>{const d=typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)?new Date(value+'T00:00'):new Date(value);const j=S.cal==='j'?jp(d):{d:d.getDate(),m:d.getMonth()+1,y:d.getFullYear()};return `${j.y}/${j.m}/${j.d}`};
const dateHTML=value=>codeHTML(dateText(value));
const dlabel=d=>new Date(d+'T00:00').toLocaleDateString(loc(),{weekday:'short'})+' · '+dateText(d);
const dayLabel=d=>`${new Date(d+'T00:00').toLocaleDateString(loc(),{weekday:'long'})} · ${dateHTML(d)}`;
const timeRange=(a,b)=>`${codeHTML(hm(a)+' – '+hm(b))}${iso(a)!==iso(b)?` <small class="mu">${T2('ends','پایان')} ${dateHTML(b)}</small>`:''}`;
const badge=sh=>{const review=S.shifts.find(h=>h.id===sh)?.review?'<span class="bad g">Needs review</span>':'';const matches=issues().filter(i=>i.a.sh===sh||i.b.sh===sh);return review+['o','g'].map(type=>{const items=matches.filter(i=>i.t===type);if(!items.length)return '';return `<span class="bad ${type}">${type==='o'?'Overlap ':'Gap '}${dur(Math.max(...items.map(i=>i.min)))}${items.length>1?` · ${items.length}`:''}</span>`}).join(' ')};

const segTxt=g=>`${codeHTML(g.code)} ${timeRange(g.s,g.e)}`;

