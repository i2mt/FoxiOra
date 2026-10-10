/* Monthly roster accounting. Derived from current records: edits, swaps and Undo
   need no second total to save or synchronize. Whole duties belong to their roster
   date, including an overnight duty on the last day of the month. */
function hoursRole(c){
 if(c.type==='off')return 'none';
 if(c.type==='work')return ['day','night'].includes(c.hoursRole)?c.hoursRole:
  c.code==='N'||c.code==='n'||/night|شب/i.test(c.label||'')||c.end<=c.start?'night':'day';
 if(['leave','none'].includes(c.hoursRole))return c.hoursRole;
 return c.code==='M'||/^(Leave|مرخصی)$/i.test((c.label||'').trim())?'leave':'unknown';
}
function hoursRoleEditor(c){const options=c.type==='off'?[['auto',T2('Off · no hours','off · بدون ساعت')]]:
 c.type==='work'?[['auto',T2('Automatic','خودکار')],['day',T2('Daytime · 1× / 1.5× holidays','روز · ۱× / تعطیل رسمی ۱٫۵×')],['night',T2('Night · always 1.5×','شب · همیشه ۱٫۵×')]]:
 [['auto',T2('Automatic','خودکار')],['leave',T2('Credit one D shift','معادل یک شیفت D')],['none',T2('Do not credit hours','بدون ساعت')]];
 return `<label>${T2('Productivity hours','محاسبهٔ بهره‌وری')}<select class="code-hours">${options.map(([value,label])=>`<option value="${value}" ${value===(c.hoursRole||'auto')?'selected':''}>${esc(label)}</option>`).join('')}</select></label>`;
}
function refreshHoursRole(el){const label=el.closest('.code-editor').querySelector('.code-hours').parentElement;label.outerHTML=hoursRoleEditor({type:el.value});syncHoursDayCodes()}
function hoursWorkplaceOptions(w){return `<details class="hours-workplace"><summary>${T2('Monthly hours & productivity','ساعت کار و بهره‌وری')}</summary><p class="settings-note">${T2('D/E: 1× normally, 1.5× on Fridays and official holidays. N/n: always 1.5×. Leave follows D. Combined duties add each shift; actual presence counts overlap once.','D و E در روز عادی ۱× و در جمعه و تعطیل رسمی ۱٫۵×؛ N و n همیشه ۱٫۵×. مرخصی مثل D حساب می‌شود. بهره‌وری شیفت ترکیبی، مجموع هر شیفت است؛ حضور هم‌پوشان یک بار حساب می‌شود.')}</p><label>${T2('D shift used for leave hours','شیفت مبنای ساعت مرخصی')}<select id="whday"><option value="">${T2('Choose the D shift','شیفت مبنای D را انتخاب کنید')}</option>${(w.codes||[]).filter(c=>c.type==='work').map(c=>`<option value="${esc(c.code)}" ${c.code===(w.hoursDayCode||'D')?'selected':''}>${esc(c.code+' · '+c.label)}</option>`).join('')}</select></label><p class="settings-note">${T2('Other symbols, including sick leave, can be assigned a rule under Symbol meanings.','برای علامت‌های دیگر، از جمله استعلاجی، روش محاسبه را در معنی علامت‌ها مشخص کنید.')}</p></details>`}
function syncHoursDayCodes(){const el=$('#whday');if(!el)return;const selected=el.value,codes=collectCodes().filter(c=>c.type==='work');el.innerHTML=`<option value="">${T2('Choose the D shift','شیفت مبنای D را انتخاب کنید')}</option>`+codes.map(c=>`<option value="${esc(c.code)}" ${c.code===selected?'selected':''}>${esc(c.code+' · '+c.label)}</option>`).join('')}
function hoursHoliday(date){const d=new Date(date+'T00:00'),j=jp(d),key=j.m+'/'+j.d;
 // Payroll is independent of holiday visibility and the display weekend setting.
 return d.getDay()===5||!!SOLAR_HOLIDAYS[key]||!!LUNAR_HOLIDAYS[j.y]?.[key];
}
function leaveBaseMinutes(w,date){const c=w.codes?.find(c=>c.code===(w.hoursDayCode||'D')&&c.type==='work');
 return c?presenceIntervals(makeSegs(date,[c])).reduce((n,g)=>n+(g.e-g.s)/6e4,0):null;
}
function monthlyHours(first,{workplace='',person='self'}={}){
 const dates=calendarDays(mfirst(first)).filter(Boolean).map(iso),dateSet=new Set(dates),mate=person==='self'?null:S.mates.find(m=>m.id===person&&(!workplace||m.wp===workplace));
 const places=person==='self'?S.wps.filter(w=>!workplace||w.id===workplace):mate?S.wps.filter(w=>w.id===mate.wp):[];
 const rows={regular:{base:0,factor:1},holiday:{base:0,factor:1.5},night:{base:0,factor:1.5},leaveRegular:{base:0,factor:1},leaveHoliday:{base:0,factor:1.5}},groups=new Map(),leaves=new Map(),actual=[],pending=new Set(),missing=new Set(),ruleCodes=new Set(),holidayYears=new Set();let entries=0;
 for(const w of places){const ownRows=person==='self'?S.shifts.filter(h=>h.wp===w.id&&dateSet.has(h.date)):[];
  for(const date of dates){const key=w.id+'|'+date,records=person==='self'?ownRows.filter(h=>h.date===date):mate.cells?.[date]?[{date,text:mate.cells[date],review:(mate.uns||[]).includes(date)}]:[];
   if(!records.length){if(person!=='self'&&(mate.uns||[]).includes(date))pending.add(key);else missing.add(key);continue}
   for(const h of records){if(h.review){pending.add(key);continue}const cs=parse(w,h.text);
    if(!cs||cs.some(c=>c.type==='work')&&cs.some(c=>c.type!=='work')||cs.some(c=>c.type==='leave')&&cs.some(c=>c.type==='off')){pending.add(key);continue}
    entries++;
    for(const c of cs){const role=hoursRole(c);if(role==='none')continue;
     if(role==='unknown'){ruleCodes.add(w.id+'|'+c.code);pending.add(key);continue}
     const holiday=hoursHoliday(date),kind=role==='night'?'night':role==='leave'?holiday?'leaveHoliday':'leaveRegular':holiday?'holiday':'regular';
     if(role==='leave'){const minutes=leaveBaseMinutes(w,date);if(!Number.isFinite(minutes)||minutes<=0){ruleCodes.add(w.id+'|'+c.code);pending.add(key);continue}leaves.set(key,{kind,minutes});}
     else{const segments=Array.isArray(h.segs)?h.segs.filter(g=>g.code===c.code):makeSegs(date,[c]),valid=segments.filter(g=>Number.isFinite(g.s)&&Number.isFinite(g.e)&&g.e>g.s);
      if(!valid.length||valid.length!==segments.length){pending.add(key);continue}
      actual.push(...valid);const groupKey=key+'|'+c.code+'|'+kind,group=groups.get(groupKey)||{kind,segments:[]};group.segments.push(...valid);groups.set(groupKey,group);
     }
     // Missing lunar tables must never look like a complete payroll calculation.
     if(role!=='night'&&new Date(date+'T00:00').getDay()!==5&&!SOLAR_HOLIDAYS[jp(new Date(date+'T00:00')).m+'/'+jp(new Date(date+'T00:00')).d]&&!LUNAR_HOLIDAYS[jp(new Date(date+'T00:00')).y])holidayYears.add(jp(new Date(date+'T00:00')).y);
    }
   }
  }
 }
 for(const group of groups.values())rows[group.kind].base+=presenceIntervals(group.segments).reduce((n,g)=>n+(g.e-g.s)/6e4,0);
 for(const {kind,minutes} of leaves.values())rows[kind].base+=minutes;
 const actualMinutes=presenceIntervals(actual).reduce((n,g)=>n+(g.e-g.s)/6e4,0),creditedMinutes=Object.values(rows).reduce((n,r)=>n+r.base*r.factor,0);
 return {actualMinutes,creditedMinutes,rows,entries,missing:missing.size,pending:pending.size,ruleCodes:[...ruleCodes],holidayYears:[...holidayYears],partial:!!(missing.size||pending.size||holidayYears.size),dates,places};
}
const hoursNumber=minutes=>new Intl.NumberFormat(S.lang==='fa'?'fa-IR':'en-GB',{maximumFractionDigits:3}).format(minutes/60);
function hoursMetrics(total){return `<div class="hours-metrics"><span><small>${T2('Actual presence','ساعت حضور')}</small><b class="hours-actual">${hoursNumber(total.actualMinutes)} <small>${T2('hours','ساعت')}</small></b></span><span><small>${T2('With productivity','با بهره‌وری')}</small><b class="hours-credit">${hoursNumber(total.creditedMinutes)} <small>${T2('hours','ساعت')}</small></b></span></div>`}
function hoursStatus(total){const n=total.missing+total.pending;return `<span class="hours-status">${n?T2(n+' days not counted',n+' روز محاسبه نشده'):total.holidayYears.length?T2('Estimate','برآورد'):T2('Complete roster','برنامهٔ کامل')}</span>`}
function hoursBreakdown(total){const labels={regular:T2('D/E · regular days','روز · عادی'),holiday:T2('D/E · Fridays & holidays','روز · جمعه و تعطیل رسمی'),night:T2('Night · every day','شب · همهٔ روزها'),leaveRegular:T2('Leave · regular days','مرخصی · عادی'),leaveHoliday:T2('Leave · Fridays & holidays','مرخصی · جمعه و تعطیل رسمی')};
 return `<div class="hours-breakdown"><table><caption>${T2('How your hours are calculated','ساعت‌ها چطور حساب شدند؟')}</caption><thead><tr><th scope="col">${T2('Duty','نوع')}</th><th scope="col">${T2('Base hours','ساعت پایه')}</th><th scope="col">${T2('Credited hours','با بهره‌وری')}</th></tr></thead><tbody>${Object.entries(total.rows).filter(([,r])=>r.base).map(([kind,r])=>`<tr><th scope="row">${labels[kind]} <bdi dir="ltr">×${r.factor}</bdi></th><td>${hoursNumber(r.base)}</td><td>${hoursNumber(r.base*r.factor)}</td></tr>`).join('')||`<tr><td colspan="3">${T2('No counted hours yet.','هنوز ساعتی برای محاسبه نداریم.')}</td></tr>`}</tbody></table>${total.missing||total.pending?`<p>${T2('Only determined shifts are counted. '+total.missing+' missing days and '+total.pending+' unclear days remain.','فقط شیفت‌های مشخص حساب شده‌اند؛ '+total.missing+' روز بدون برنامه و '+total.pending+' روز نامشخص باقی مانده.')}</p>`:''}${total.ruleCodes.length?`<p>${T2('Choose a calculation rule for these symbols in workplace settings: ','روش محاسبهٔ این علامت‌ها را در تنظیمات محل کار مشخص کنید: ')}${total.ruleCodes.map(key=>{const i=key.lastIndexOf('|');return bidi(wp(key.slice(0,i)).name)+' · '+codeHTML(key.slice(i+1))}).join('، ')}</p>`:''}${total.holidayYears.length?`<p class="hours-calendar-warning">${T2('Lunar public holidays are unavailable for '+total.holidayYears.join(', ')+'. Productivity hours are an estimate.','تعطیل‌های قمری سال '+total.holidayYears.join('، ')+' در دسترس نیست؛ ساعت بهره‌وری فعلاً برآورد است.')}</p>`:''}<p>${T2('Whole night shifts belong to their start-date month. Leave adds credit, not presence. Combined duties add each shift; overlapping presence is counted once.','شیفت شب کامل در ماه تاریخ شروع حساب می‌شود. مرخصی به بهره‌وری اضافه می‌شود، نه ساعت حضور. بهره‌وری شیفت ترکیبی، مجموع هر شیفت است؛ حضور هم‌پوشان یک بار حساب می‌شود.')}</p></div>`;
}
function personalHoursV(first,id=''){const total=monthlyHours(first,{workplace:id});if(!total.entries&&!total.pending)return '';
 return `<details class="monthly-hours" ${personalHoursOpen?'open':''} ontoggle="personalHoursOpen=this.open"><summary><span class="hours-title">${T2('Your monthly hours','ساعت کار شما در این ماه')}${hoursStatus(total)}</span>${hoursMetrics(total)}<span class="hours-chevron" aria-hidden="true">⌄</span></summary>${hoursBreakdown(total)}</details>`;
}
let personalHoursOpen=false,rosterHoursOpen=false;
function rosterHoursV(w,days){const people=[{id:'self',name:S.myname||T2('You','شما')},...mates(w.id)],selected=people.find(p=>p.id===roster.hoursPerson)||people.find(p=>p.id==='self'&&S.shifts.some(h=>h.wp===w.id&&days.some(d=>iso(d)===h.date)))||people[1]||people[0];roster.hoursPerson=selected.id;
 const total=monthlyHours(days[0],{workplace:w.id,person:selected.id});return `<details class="roster-hours monthly-hours" ${rosterHoursOpen?'open':''} ontoggle="rosterHoursOpen=this.open"><summary><span class="hours-title">${T2('Monthly hours','ساعت کار این ماه')}<small>${bidi(selected.name)}</small></span><span class="roster-hours-total">${hoursNumber(total.creditedMinutes)} <small>${T2('credited hours','ساعت با بهره‌وری')}</small>${hoursStatus(total)}</span><span class="hours-chevron" aria-hidden="true">⌄</span></summary><label class="hours-person-label">${T2('Whose schedule?','برنامهٔ چه کسی؟')}<select id="hours-person" onchange="selectHoursPerson(this.value)">${people.map(p=>`<option value="${esc(p.id)}" ${p.id===selected.id?'selected':''}>${esc(p.name)}</option>`).join('')}</select></label>${hoursMetrics(total)}${hoursBreakdown(total)}</details>`;
}
function selectHoursPerson(id){if(id!=='self'&&!mates(roster.wp).some(m=>m.id===id))return;roster.hoursPerson=id;rosterHoursOpen=true;render()}
