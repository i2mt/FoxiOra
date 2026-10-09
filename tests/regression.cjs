const {test}=require('node:test');
const assert=require('node:assert/strict');
const {app,fixture}=require('./support.cjs');
test('full Persian durations, year/month/day, overnight date and case-sensitive codes',async()=>{
 const {run,runAsync}=app();
 assert.equal(run('dur(2484)'),'41 ساعت و 24 دقیقه');
 assert.equal(run('countdown(2484)'),'1 روز و 17 ساعت و 24 دقیقه');
 assert.equal(run("dateText('2026-10-04')"),'1405/7/12');
 assert.equal(run('vm'),'month');
 assert.equal(run("parse(S.wps[0],'N')[0].code"),'N');
 assert.equal(run("parse(S.wps[0],'n')[0].code"),'n');
 assert.equal(run("makeSegs('2026-10-04',parse(S.wps[0],'N'))[0].e-at('2026-10-04','19:30')"),12.5*3600000);
 assert.match(run("timeRange(at('2026-10-04','19:30'),at('2026-10-05','08:00'))"),/1405\/7\/13/);
});
test('Friday weekends, 1405 lunar holiday boundary and 1406 no reused lunar data',async()=>{
 const {run,runAsync}=app();
 assert.equal(run("isWeekend(new Date('2026-10-09T12:00'))"),true);
 assert.equal(run("holidayInfo(fromJ(1405,4,3))[0]"),'تاسوعا');
 assert.equal(run("holidayInfo(fromJ(1406,4,3)).length"),0);
 assert.equal(run("holidayInfo(fromJ(1405,1,1)).length"),2);
 assert.equal(run("S.holidays=false;holidayInfo(fromJ(1405,1,1)).length"),0);
});
test('name aliases are workplace-scoped, ambiguous aliases abstain, memory survives JSON backup',async()=>{
 const {run,runAsync}=app();
 run("rememberExample('names','w1',null,'علي رضايي','علی رضایی')");
 assert.equal(run("recallExample('names','w1',null,'علي رضايي').label"),'علی رضایی');
 assert.equal(run("recallExample('names','w2',null,'علي رضايي')"),null);
 run("S=JSON.parse(JSON.stringify(S))");
 assert.equal(run("recallExample('names','w1',null,'علي رضايي').label"),'علی رضایی');
 run("memoryStore().names.push({wp:'w1',raw:'علي رضايي',label:'علی رستمی',feature:null})");
 assert.equal(run("recallExample('names','w1',null,'علي رضايي')"),null);
 run('S.learnOCR=false');
 assert.equal(run("recallExample('names','w1',null,'علي رضايي')"),null);
});
test('faint dash is off, blank stays blank and D survives the glyph extraction',async()=>{
 const {run,runAsync,context}=app();
 for(const faint of [false,true]){
  context.cv=fixture('',{dash:true,faint});
  assert.equal(run('sc.cv=cv;glyph(20,20,100,60).dash'),1);
 }
 context.cv=fixture('',{blank:true});assert.equal(run('sc.cv=cv;glyph(20,20,100,60).blank'),1);
 for(const grid of [false,true]){
  context.cv=fixture('D',{faint:true,grid});assert.equal(run('sc.cv=cv;!!glyph(20,20,100,60).canvas'),true);
 }
});
test('visual examples match rescaled D, reject N and do not learn suggestions automatically',async()=>{
 const {run,runAsync,context}=app();
 context.cv=fixture('D');run("sc.cv=cv;var feature=visualFeature(glyph(20,20,100,60).canvas);rememberExample('glyphs','w1',feature,'O','D')");
 assert.equal(run("recallExample('glyphs','w1',feature).label"),'D');
 context.cv=fixture('N');assert.equal(run("sc.cv=cv;recallExample('glyphs','w1',visualFeature(glyph(20,20,100,60).canvas))"),null);
 context.cv=fixture('D');
 context.mock={setParameters:async()=>{},recognize:async()=>({data:{text:'O',confidence:65}})};
 const result=await run('sc.cv=cv;recognizeShift(S.wps[0],mock,20,20,100,60)');
 assert.equal(result.text,'D');assert.equal(result.uncertain,true);assert.equal(result.confirmed,false);assert.equal(result.c,70);
 assert.equal(run('memoryStore().glyphs.length'),1);
});
test('manual confirmation is idempotent and explicit blank is separate from off',async()=>{
 const {run,runAsync}=app();
 run("render=()=>{};sc.cells=[{text:'D',c:60,uncertain:true}];setCell(0,'D')");
 assert.equal(run('sc.cells[0].text'),'D');assert.equal(run('sc.cells[0].confirmed'),true);
 run("setCell(0,'')");assert.equal(run('sc.cells[0].text'),'');
 assert.equal(run("offCode(S.wps[0])"),'-');
});
test('all main views render for Persian/English and full month boundaries',async()=>{
 const {run,runAsync,document}=app();
 run("S.shifts=[{id:'s1',wp:'w1',date:iso(Date.now()+86400000),text:'D',segs:makeSegs(iso(Date.now()+86400000),parse(S.wps[0],'D'))}]");
 for(const lang of ['fa','en'])for(const view of ['today','agenda','places','team','scan','set']){
  run(`S.lang='${lang}';tab='${view}';render()`);
  assert.ok(document.querySelector('#v').textContent.length>20,`${lang}/${view}`);
  assert.equal(document.querySelectorAll('script').length,3);
 }
 run("S.lang='fa';S.cal='j';cm=fromJ(1405,7,1);tab='agenda';vm='month';render()");
 assert.equal(document.querySelectorAll('.cell').length,30);
 assert.equal(document.querySelectorAll('.holiday').length>3,true);
 assert.ok(document.querySelector('.free-window bdi[dir=ltr]'));
 run("cm=fromJ(1404,12,1);mv(1)");assert.equal(run('jp(cm).m'),1);assert.equal(run('jp(cm).y'),1405);
 run("S.cal='g';cm=new Date(2026,1,1);render()");assert.equal(document.querySelectorAll('.cell').length,28);
});
test('free slots never intersect saved work or personal events, including overnight work',async()=>{
 const {run,runAsync}=app();
 run("var tomorrow=iso(Date.now()+DAY);S.shifts=[{id:'s2',wp:'w1',date:tomorrow,text:'N',segs:makeSegs(tomorrow,parse(S.wps[0],'N'))}];S.events=[{s:at(tomorrow,'10:00'),e:at(tomorrow,'12:00')}]");
 assert.equal(run("free(60).every(([a,b])=>b>a&&[...segs(),...S.events].every(g=>g.e<=a||g.s>=b))"),true);
});
test('old state gains defaults without replacing saved shifts, and example conflicts abstain',async()=>{
 const {run,runAsync}=app();
 assert.equal(run("var previous={shifts:[{id:'old'}],lang:'fa',ver:3};S={...DS(),...previous};S.shifts[0].id"),'old');
 assert.equal(run('S.themePlaces'),true);
 run("rememberExample('glyphs','w1',{bits:'ffff0000',aspect:1},'','D');rememberExample('glyphs','w1',{bits:'ffef0000',aspect:1},'','O')");
 assert.equal(run("recallExample('glyphs','w1',{bits:'ffee0000',aspect:1}).label"),'O');
});

test('OCR cannot turn a letter-shaped cell into a confident off day, and blank needs review',async()=>{
 const {run,runAsync,context}=app();context.cv=fixture('D');context.mock={setParameters:async()=>{},recognize:async()=>({data:{text:'*',confidence:99}})};
 const result=await run('sc.cv=cv;recognizeShift(S.wps[0],mock,20,20,100,60)');assert.equal(result.text,'');assert.equal(result.uncertain,true);
 context.cv=fixture('',{blank:true});const blank=await run('sc.cv=cv;recognizeShift(S.wps[0],mock,20,20,100,60)');assert.equal(blank.text,'');assert.equal(blank.uncertain,true);
});
test('dash is accepted for existing workplace definitions without adding a code',async()=>{
 const{run,runAsync}=app();run("S.wps[0].codes=S.wps[0].codes.filter(c=>c.code!=='-')");assert.equal(run("parse(S.wps[0],'-')[0].type"),'off');assert.equal(run("makeSegs('2026-10-04',parse(S.wps[0],'-')).length"),0);
});
test('cell margins preserve a readable interior in a reduced-resolution table',async()=>{
 const{run,runAsync}=app();const bounds=run('cellBounds(0,0,15,15)');assert.equal(bounds[2]-bounds[0],9);assert.equal(bounds[3]-bounds[1],9);
});

test('explicit OFF codes remain supported by OCR',async()=>{
 const{run,runAsync,context}=app();context.cv=fixture('D');context.mock={setParameters:async()=>{},recognize:async()=>({data:{text:'OFF',confidence:97}})};
 const result=await run('sc.cv=cv;recognizeShift(S.wps[0],mock,20,20,100,60)');assert.equal(result.text,'OFF');assert.equal(result.uncertain,false);
});
test('import replaces matching dates only and learns only explicitly confirmed symbols',async()=>{
 const{run,runAsync}=app();await runAsync(`render=()=>{};globalThis.saved=null;save=async()=>{saved=JSON.parse(JSON.stringify(S))};
 S.shifts=[{id:'replace',wp:'w1',date:'2026-10-04',text:'D',segs:[]},{id:'other-workplace',wp:'w2',date:'2026-10-04',text:'N',segs:[]},{id:'blank-must-stay',wp:'w1',date:'2026-10-05',text:'D',segs:[]},{id:'outside-range',wp:'w1',date:'2026-11-01',text:'D',segs:[]}];
 sc.wp='w1';sc.name='نام تأییدشده';sc.nameConfirmed=true;sc.ri=0;sc.guess=false;sc.rows=[{nm:'نام اسکن',rawName:'نام اسکن',nameFeature:null}];
 sc.cells=[{date:'2026-10-04',text:'E',c:100,confirmed:true,feature:{bits:'ffff0000',aspect:1},raw:'D'},{date:'2026-10-05',text:'',c:100,confirmed:true},{date:'2026-10-06',text:'N',c:95,confirmed:false,feature:{bits:'0000ffff',aspect:1}}];await doImport();`);
 assert.equal(run("S.shifts.find(x=>x.date==='2026-10-04'&&x.wp==='w1').text"),'E');
 for(const id of ['other-workplace','outside-range'])assert.equal(run(`S.shifts.some(x=>x.id==='${id}')`),true);
 assert.equal(run("S.shifts.filter(x=>x.date==='2026-10-04'&&x.wp==='w1').length"),1);
 assert.equal(run('S.ocrMemory.glyphs.length'),1);assert.equal(run('S.ocrMemory.glyphs[0].label'),'E');
 assert.equal(run('saved.ocrMemory.names[0].label'),'نام تأییدشده');assert.equal(run('sc.cells'),null);
});
test('cancelled or invalid imports preserve schedules and do not learn',async()=>{
 const{run,runAsync,context}=app();context.confirm=()=>false;
 await runAsync(`S.shifts=[{id:'untouched',wp:'w1',date:'2026-10-04',text:'D',segs:[]}];sc.wp='w1';sc.name='نام';sc.ri=0;sc.rows=[{nm:'نام'}];sc.cells=[{date:'2026-10-04',text:'E',c:30,uncertain:true,confirmed:false}];await doImport()`);
 assert.equal(run('S.shifts[0].id'),'untouched');assert.equal(run('S.ocrMemory.names.length'),0);assert.equal(run('sc.cells.length'),1);
 await runAsync("sc.cells[0]={date:'2026-10-04',text:'UNKNOWN',c:100,confirmed:true};await doImport()");assert.equal(run('S.shifts[0].id'),'untouched');assert.equal(run('S.ocrMemory.glyphs.length'),0);
});
test('IndexedDB round-trip retains schedules and correction memory across a fresh app context',async()=>{
 const {IDBFactory}=require('fake-indexeddb'),indexedDB=new IDBFactory();const first=app({indexedDB});
 first.run("S.shifts=[{id:'persisted',wp:'w1',date:'2026-10-04',text:'D',segs:[]}];rememberExample('names','w1',null,'علي رضايي','علی رضایی')");
 await first.run('save()');
 const second=app({indexedDB});await second.run('(async()=>{S={...DS(),...await load()}})()');
 assert.equal(second.run('S.shifts[0].id'),'persisted');assert.equal(second.run("recallExample('names','w1',null,'علي رضايي').label"),'علی رضایی');
});
test('OCR rejects a grid dash appended to a working code without rejecting explicit custom codes',async()=>{
 const {run,runAsync,context}=app();context.cv=fixture('E');
 context.mock={setParameters:async()=>{},recognize:async()=>({data:{text:'E-',confidence:98}})};
 const result=await run('sc.cv=cv;recognizeShift(S.wps[0],mock,20,20,100,60)');
 assert.equal(result.uncertain,true);assert.equal(result.text,'');
 run("S.wps[0].codes.push({code:'E-',label:'Custom',type:'work',start:'14:00',end:'20:00'})");
 const custom=await run('recognizeShift(S.wps[0],mock,20,20,100,60)');
 assert.equal(custom.text,'E-');
});
test('cover suggestions exclude uncertain off days and previous-night overlaps',async()=>{
 const {run,runAsync}=app();
 run(`S.shifts=[{id:'mine',wp:'w1',date:'2026-10-04',text:'D',segs:makeSegs('2026-10-04',parse(S.wps[0],'D'))}];
 S.mates=[{id:'a',wp:'w1',name:'Uncertain',cells:{'2026-10-04':'-'},uns:['2026-10-04']},{id:'b',wp:'w1',name:'Overnight',cells:{'2026-10-03':'N','2026-10-04':'-'},uns:[]},{id:'c',wp:'w1',name:'Off',cells:{'2026-10-03':'-','2026-10-04':'-'},uns:[]}];tc.wp='w1';tc.dates=['mine'];var result=coverCalc()`);
 assert.equal(run("result.rows[0].free.map(x=>x.m.id).join(',')"),'c');
 assert.equal(run("result.rows[0].unk.map(x=>x.m.id).join(',')"),'a');
 assert.equal(run("result.all.map(x=>x.id).join(',')"),'c');
});
test('colleague re-scan clears stale unreadable values and pauses for guessed dates',async()=>{
 const {run,runAsync,context}=app();context.mock={setParameters:async()=>{},terminate:async()=>{}};
 run(`render=()=>{};recognizeShift=async()=>({text:'',c:0,uncertain:true});
 sc.wp='w1';sc.wk=mock;sc.y=1405;sc.m=7;sc.ri=-1;sc.rows=[{pi:0,y0:10,y1:30,nm:'همکار'}];
 sc.pages=[{cv:null,hl:[0,10,30],vl:[0,50],dayAt:()=>1,nameCol:-1,dr:-1,guess:false}];
 S.mates=[{id:'mate',wp:'w1',name:'همکار',cells:{'2026-09-23':'-'},uns:[]}];`);
 await run('readAll()');
 assert.equal(run("S.mates[0].cells['2026-09-23']"),undefined);
 assert.equal(run("S.mates[0].uns.includes('2026-09-23')"),true);
 run("sc.wk=mock;sc.pages[0].guess=true;recognizeShift=async()=>({text:'D',c:99,uncertain:false})");await run('readAll()');
 assert.equal(run("S.mates[0].uns.includes('2026-09-23')"),true);
});
test('cover flow stays visible without colleagues and supports several selected dates',async()=>{
 const {run,runAsync}=app();
 run("S.shifts=['2099-10-04','2099-10-06'].map((date,i)=>({id:'h'+i,wp:'w1',date,text:'D',segs:makeSegs(date,parse(S.wps[0],'D'))}));openCover()");
 assert.equal(run('tab'),'team');assert.equal(run('tc.v'),'cover');
 assert.match(run('V.team()'),/toggleCoverDay/);assert.match(run('V.team()'),/افزودن برنامهٔ همکاران/);
 run("togD('h0');togD('h1');S.mates=[{id:'both',wp:'w1',name:'Both',cells:{'2099-10-04':'-','2099-10-06':'-'},uns:[]},{id:'one',wp:'w1',name:'One',cells:{'2099-10-04':'-'},uns:[]}];coverGo()");
 assert.equal(run('tc.res.rows.length'),2);assert.equal(run("tc.res.all.map(m=>m.id).join(',')"),'both');
 assert.equal(run('tc.res.rows[1].unk[0].m.id'),'one');
 run("tc.wp='other';S.wps.push({id:'other',codes:S.wps[0].codes});");assert.equal(run('coverCalc().rows.length'),0);
});
test('uncertain neighboring overnight dates cannot produce a cover recommendation',async()=>{
 const {run,runAsync}=app();run("tc.wp='w1';S.shifts=[{id:'h',wp:'w1',date:'2099-10-04',text:'N',segs:makeSegs('2099-10-04',parse(S.wps[0],'N'))}];tc.dates=['h'];S.mates=[{id:'m',wp:'w1',name:'M',cells:{'2099-10-04':'-'},uns:['2099-10-05']}]");
 assert.equal(run('coverCalc().rows[0].free.length'),0);assert.equal(run('coverCalc().rows[0].unk.length'),1);
});
test('swap navigation has the requested label and always opens date selection',async()=>{
 const {run,runAsync,document}=app();run("tc.v='list';go('team')");
 assert.equal(run('tc.v'),'cover');assert.match(document.querySelector('nav').textContent,/تعویض شیفت/);
 run("go('today')");assert.match(document.querySelector('nav').textContent,/تعویض شیفت/);assert.equal(run("dateText('2026-10-05')"),'1405/7/13');
});
test('three tabs retain setup routes, English palettes and entry choices',async()=>{
 const {run,runAsync,document}=app();run("S.shifts=[{id:'s1',segs:[],date:'2026-10-04'}];go('today');addSchedule()");
 assert.equal(document.querySelectorAll('nav button').length,3);
 assert.match(document.querySelector('#inline-editor').textContent,/ثبت دستی شیفت/);
 run("closeDialog();go('set')");assert.equal(document.querySelectorAll('.settings-group').length,5);
 for(const name of ['Fox','Siren','Hedo','Forest'])assert.ok(document.querySelector('#v').textContent.includes(name));
 run("go('places');editWp('w1')");assert.equal(document.querySelectorAll('.code-editor').length,7);assert.ok(document.querySelector('#dlg details'));
});
test('month review shows every date and edits the selected source cell',()=>{
 const {run,document}=app();run(`sc.wp='w1';sc.name='Test';sc.rows=[{page:1}];sc.ri=0;sc.pages=[{}];sc.cells=Array.from({length:30},(_,i)=>({day:i+1,date:'2026-10-'+String(i+1).padStart(2,'0'),text:'D',c:i===12?60:100,uncertain:i===12,img:''}));sc.reviewIndex=12;tab='scan';render()`);
 assert.equal(document.querySelectorAll('.scan-day').length,30);assert.match(document.querySelector('.scan-focus .k').getAttribute('onclick'),/setCell\(12,/);
 run("setCell(12,'E')");assert.equal(run('sc.cells[12].text'),'E');assert.equal(run('sc.cells[11].text'),'D');
 run('sc.reviewIndex=29;render()');assert.match(document.querySelector('.scan-focus .k').getAttribute('onclick'),/setCell\(29,/);assert.equal(document.querySelectorAll('.review-pagination').length,0);
});
test('additional swap dates and selected result remain reachable',async()=>{
 const {run,runAsync,document}=app();run(`S.shifts=Array.from({length:12},(_,i)=>({id:'s'+i,wp:'w1',date:'2099-10-'+String(i+1).padStart(2,'0'),text:'D',segs:makeSegs('2099-10-'+String(i+1).padStart(2,'0'),parse(S.wps[0],'D'))}));go('team')`);
 assert.equal(run('tc.mode'),'month');assert.equal(document.querySelectorAll('.cover-day:not([disabled])').length,12);run("tc.mode='list';render()");assert.equal(document.querySelectorAll('.cover-dates button').length,12);assert.equal(document.querySelectorAll('.more-dates').length,0);
 run("togD('s10');coverGo()");assert.equal(run('tc.res.rows[0].h.id'),'s10');assert.ok(document.querySelector('.cover-picker').closest('details'));
});

test('calendar exposes current date separately from selection and settings switches retain their state',async()=>{
 const {run,runAsync,document}=app();run("sel=iso(Date.now()+DAY);cm=mfirst(new Date());go('agenda')");
 const today=document.querySelector('[aria-current=date]');assert.ok(today);assert.equal(today.getAttribute('aria-pressed'),'false');assert.ok(document.querySelector('.cell.sel'));
 run("go('set');document.querySelector('.settings-group').setAttribute('open','');S.h24=false;render()");
 assert.ok(document.querySelector('.settings-group').open);const clock=document.querySelector('.clock-choices button');assert.equal(clock.getAttribute('aria-pressed'),'true');assert.equal(run("hm(at('2026-10-05','19:30'))"),'7:30 PM');
});
test('editing an existing shift moves its date and workplace without leaving the old shift',async()=>{
 const {run,runAsync,document}=app();run("S.cal='g';S.wps.push({id:'w2',name:'Second',color:'#a33',codes:S.wps[0].codes});S.shifts=[{id:'old',wp:'w1',date:'2026-10-05',text:'D',segs:makeSegs('2026-10-05',parse(S.wps[0],'D'))}];editShift('old')");
 assert.equal(document.querySelector('#fc').value,'D');assert.ok(document.querySelector('[onclick*=deleteEditedShift]'));
 // linkedom does not implement assigning select.value; select the option instead.
 document.querySelector('#fw option[value=w1]').removeAttribute('selected');document.querySelector('#fw option[value=w2]').setAttribute('selected','');
 await runAsync("$('#fd').value='2026-10-06';$('#fc').value='N';await saveShift()");
 assert.equal(run('S.shifts.length'),1);assert.equal(run('S.shifts[0].date'),'2026-10-06');assert.equal(run('S.shifts[0].wp'),'w2');assert.equal(run('S.shifts[0].text'),'N');assert.equal(run("iso(S.shifts[0].segs[0].e)"),'2026-10-07');
});
test('Persian fallback requires independent evidence and always remains reviewable',async()=>{
 const {run,runAsync,context}=app();let value='م',confidence=52,calls=0;
 const worker={setParameters:async()=>{},recognize:async()=>{calls++;return {data:{text:value,confidence}}},terminate:async()=>{}};
 context.Tesseract={createWorker:async()=>worker};context.cv=fixture('M');
 const r=await run('recognizePersianLeave(S.wps[0],cv)');assert.equal(r.text,'M');assert.equal(r.c,52);assert.equal(calls,2);
 value='۶';assert.equal(await run('recognizePersianLeave(S.wps[0],cv)'),null);
 value='م';confidence=20;assert.equal(await run('recognizePersianLeave(S.wps[0],cv)'),null);
 value='م';confidence=52;context.latin={setParameters:async()=>{},recognize:async()=>({data:{text:'?',confidence:0}})};const uncertain=await run('sc.cv=cv;recognizeShift(S.wps[0],latin,20,20,100,60)');assert.equal(uncertain.text,'M');assert.equal(uncertain.uncertain,true);assert.equal(run('cState(S.wps[0],'+JSON.stringify({text:'M',c:52,uncertain:true,confirmed:false})+')'),'low');
 await run('killWk()');
});

test('free periods cross nights, respect events and stop at the last known roster date',async()=>{
 const {run,runAsync}=app();run("S.shifts=['D','-','N','-'].map((text,i)=>{const date='2099-10-0'+(i+1);return{id:'h'+i,wp:'w1',date,text,segs:makeSegs(date,parse(S.wps[0],text))}});var gaps=freeWindows(48*60,{start:at('2099-10-01','00:00')})");
 assert.equal(run('gaps.slots.length'),1);assert.equal(run('gaps.slots[0][0]'),run("at('2099-10-01','14:30')"));assert.equal(run('gaps.slots[0][1]'),run("at('2099-10-03','19:30')"));assert.equal(run('gaps.end'),run("at('2099-10-05','00:00')"));
 run("S.events=[{s:at('2099-10-02','12:00'),e:at('2099-10-02','13:00')}]");assert.equal(run("freeWindows(48*60,{start:at('2099-10-01','00:00')}).slots.length"),0);
});
test('trip planner can turn a shorter gap into four days by handing over one shift, with named colleagues',async()=>{
 const {run,runAsync}=app();run("S.shifts=['D','-','D','-','-','D','-'].map((text,i)=>{const date='2099-10-0'+(i+1);return{id:'h'+i,wp:'w1',date,text,segs:makeSegs(date,parse(S.wps[0],text))}});S.mates=[{id:'m',wp:'w1',name:'Available',cells:{'2099-10-02':'-','2099-10-03':'-'},uns:[]}];var plan=tripCalc({days:4,from:'2099-10-01'})");
 assert.equal(run('plan.ready.length'),0);assert.ok(run('plan.swaps.length')>=1);assert.equal(run('plan.swaps[0].h.id'),'h2');assert.equal(run('plan.swaps[0].people[0].m.id'),'m');assert.ok(run('plan.swaps[0].gap[1]-plan.swaps[0].gap[0]>=4*DAY'));
 assert.equal(run('S.shifts.length'),7);assert.equal(run('S.shifts[2].text'),'D');
 run("S.mates[0].uns=['2099-10-03'];plan=tripCalc({days:4,from:'2099-10-01'})");assert.equal(run("plan.swaps.find(x=>x.h.id==='h2').people.length"),0);
 run("S.events=[{s:at('2099-10-04','10:00'),e:at('2099-10-04','11:00')}]");assert.equal(run("tripCalc({days:4,from:'2099-10-01'}).swaps.length"),0);
});
test('missing, uncertain and other-workplace roster days cannot become a trip',async()=>{
 const {run,runAsync}=app();run("S.shifts=['D','-','D','-','-','D','-'].map((text,i)=>{const date='2099-10-0'+(i+1);return{id:'h'+i,wp:'w1',date,text,segs:makeSegs(date,parse(S.wps[0],text))}});S.shifts=S.shifts.filter(h=>h.id!=='h3')");
 assert.equal(run("tripCalc({days:4,from:'2099-10-01'}).swaps.length"),0);
 run("S.rosterDays['w1|2099-10-04']=true;S.shifts[2].review=true");assert.equal(run("tripCalc({days:4,from:'2099-10-01'}).swaps.some(x=>x.h.id==='h2')"),false);
 run("S.shifts[2].review=false;S.wps.push({id:'w2',name:'Second',codes:S.wps[0].codes});S.shifts.push(...['-','-','N','-','-','-','-'].map((text,i)=>{const date='2099-10-0'+(i+1);return{id:'x'+i,wp:'w2',date,text,segs:makeSegs(date,parse(S.wps[1],text))}}))");
 assert.equal(run("tripCalc({days:4,from:'2099-10-01'}).swaps.length"),0);
});
test('an expired second workplace blocks travel until its roster is updated or explicitly excluded',async()=>{
 const {run,runAsync}=app();run("S.shifts=['-','-','-','-','-','-','-'].map((text,i)=>{const date='2099-10-0'+(i+1);return{id:'h'+i,wp:'w1',date,text,segs:[]}});S.wps.push({id:'oldjob',name:'Second job',codes:S.wps[0].codes});S.shifts.push({id:'old',wp:'oldjob',date:'2099-09-30',text:'-',segs:[]})");
 assert.equal(run("tripCalc({days:2,from:'2099-10-01'}).ready.length"),0);
 run('S.wps[1].active=false');assert.equal(run("tripCalc({days:2,from:'2099-10-01'}).ready.length"),1);
});

test('D cover includes an E colleague as DE despite the approved handover overlap',async()=>{
 const {run,runAsync}=app();run(`S.shifts=[{id:'d',wp:'w1',date:'2026-10-06',text:'D',segs:makeSegs('2026-10-06',parse(S.wps[0],'D'))}];S.mates=[{id:'e',wp:'w1',name:'Evening',cells:{'2026-10-06':'E'},uns:[]},{id:'off',wp:'w1',name:'Off',cells:{'2026-10-06':'OFF'},uns:[]}];var r=coverCalc(S.wps[0],['d'])`);
 assert.equal(run('r.rows[0].free[0].m.id'),'off');assert.equal(run('r.rows[0].ext[0].m.id'),'e');assert.equal(run('r.rows[0].ext[0].combo'),'DE');
 run("S.wps[0].combos=[];r=coverCalc(S.wps[0],['d'])");assert.equal(run('r.rows[0].ext.length'),0);
 run("S.wps[0].combos=['DE'];S.mates[0].cells['2026-10-05']='N';r=coverCalc(S.wps[0],['d'])");assert.equal(run('r.rows[0].ext.length'),0);
 run("delete S.mates[0].cells['2026-10-05'];S.mates[0].uns=['2026-10-06'];r=coverCalc(S.wps[0],['d'])");assert.equal(run('r.rows[0].ext.length'),0);assert.equal(run('r.rows[0].unk[0].m.id'),'e');
});
test('combined cover compares canonical aliases and accepts only defined working combinations',async()=>{
 const {run,runAsync}=app();run("S.wps[0].codes.find(c=>c.code==='D').aliases=['صبح'];S.wps[0].codes.find(c=>c.code==='E').aliases=['عصر']");
 assert.equal(run("combinedCode(S.wps[0],'عصر','صبح')"),'DE');assert.equal(run("combinedCode(S.wps[0],'N','D')"),'');assert.equal(run("combinedCode(S.wps[0],'-','D')"),'');
});
test('legacy off aliases normalize together without changing saved shift times or unknown dates',async()=>{
 const{run,runAsync}=app();run("S.shifts=[{wp:'w1',date:'2026-10-06',text:'OFF',segs:[]},{wp:'w1',date:'2026-10-07',text:'*',segs:[]},{wp:'w1',date:'2026-10-08',text:'D',segs:[{s:123,e:456,code:'D'}]}];S.mates=[{wp:'w1',cells:{'2026-10-06':'off','2026-10-07':'*'},uns:[]}];normalizeSavedOff()");
 assert.equal(run("S.shifts.map(h=>h.text).join(',')"),'-,-,D');assert.equal(run('S.shifts[2].segs[0].s'),123);assert.equal(run("Object.values(S.mates[0].cells).join(',')"),'-,-');assert.equal(run("'2026-10-08' in S.mates[0].cells"),false);
});
test('custom hospital symbols retain explicit meanings, case, hours and overnight endings',async()=>{
 const {run,runAsync}=app();run("S.wps[0].codes=[{code:'A',label:'Morning',type:'work',start:'08:00',end:'16:00',aliases:['صبح']},{code:'-',label:'Duty',type:'work',start:'20:00',end:'06:00',aliases:[]},{code:'O',label:'Off',type:'off',aliases:['OFF','*']}]");
 assert.equal(run("parse(S.wps[0],'-')[0].type"),'work');assert.equal(run("offCode(S.wps[0])"),'O');assert.equal(run("canonicalShift(S.wps[0],'OFF')"),'O');assert.equal(run("parse(S.wps[0],'صبح')[0].code"),'A');assert.equal(run("makeSegs('2026-10-06',parse(S.wps[0],'-'))[0].e-at('2026-10-06','20:00')"),10*3600000);
});
test('ambiguous hospital aliases abstain and are not accepted as a known shift',async()=>{
 const{run,runAsync}=app();run("S.wps[0].codes.find(c=>c.code==='D').aliases=['A'];S.wps[0].codes.find(c=>c.code==='E').aliases=['A']");assert.equal(run("parse(S.wps[0],'A')"),null);
});
test('digital roster distinguishes off from missing and keeps uncertain dates reviewable',async()=>{
 const {run,runAsync,document}=app();run("roster.cm=fromJ(1405,7,1);roster.page=0;S.mates=[{id:'m',wp:'w1',name:'Colleague',cells:{'2026-09-23':'OFF','2026-09-24':'D'},uns:['2026-09-24']}];go('roster')");
 assert.equal(document.querySelectorAll('.roster-table thead th').length,8);assert.equal(document.querySelectorAll('.roster-table tbody tr').length,2);assert.equal(document.querySelectorAll('.uncertain-cell').length,1);assert.ok(document.querySelector('.shift-mark.off'));assert.ok(document.querySelector('.unknown-mark'));
 run('roster.wide=true;render()');assert.equal(document.querySelectorAll('.roster-table thead th').length,31);
 run("roster.search='Nobody';render()");assert.equal(document.querySelectorAll('.roster-table tbody tr').length,1);
});
test('digital colleague corrections clear uncertainty and affect cover suggestions',async()=>{
 const{run,runAsync}=app();await runAsync("S.shifts=[{id:'h',wp:'w1',date:'2026-10-06',text:'D',segs:makeSegs('2026-10-06',parse(S.wps[0],'D'))}];S.mates=[{id:'m',wp:'w1',name:'M',cells:{'2026-10-06':'E'},uns:['2026-10-06']}];editMateCell('m','2026-10-06');$('#mate-code').value='E';await saveMateCell('m','2026-10-06')");
 assert.equal(run('S.mates[0].uns.length'),0);assert.equal(run("coverCalc(S.wps[0],['h']).rows[0].ext.length"),1);await runAsync("await clearMateCell('m','2026-10-06')");assert.equal(run("coverCalc(S.wps[0],['h']).rows[0].ext.length"),0);assert.equal(run("coverCalc(S.wps[0],['h']).rows[0].unk.length"),1);
});

test('DE, EN and En handovers in the same workplace are not conflicts',async()=>{
 const {run,runAsync}=app();for(const text of ['DE','EN','En']){
 run(`S.shifts=[{id:'combined',wp:'w1',date:'2026-10-06',text:'${text}',segs:makeSegs('2026-10-06',parse(S.wps[0],'${text}'))}];S.same=true`);
 assert.equal(run("issues().filter(i=>i.t==='o').length"),0,text);assert.equal(run("issues().filter(i=>i.t==='g').length"),0,text);
 assert.equal(run('displaySegs().length'),1,text);assert.equal(run('displaySegs()[0].e'),run('Math.max(...S.shifts[0].segs.map(g=>g.e))'),text);
 assert.equal(run('displaySegs()[0].code'),text);
 }
 // Legacy separate rows at the same workplace follow the same handover rule.
 run("S.shifts=['D','E'].map((text,i)=>({id:'h'+i,wp:'w1',date:'2026-10-06',text,segs:makeSegs('2026-10-06',parse(S.wps[0],text))}))");assert.equal(run("issues().filter(i=>i.t==='o').length"),0);
});
test('cross-workplace clashes remain visible even inside a same-place combined duty',async()=>{
 const {run,runAsync}=app();run("S.wps.push({id:'w2',name:'Other',codes:S.wps[0].codes});S.shifts=[{id:'a',wp:'w1',date:'2026-10-06',text:'EN',segs:makeSegs('2026-10-06',parse(S.wps[0],'EN'))},{id:'b',wp:'w2',date:'2026-10-06',text:'E',segs:makeSegs('2026-10-06',parse(S.wps[1],'E'))}]");
 assert.equal(run("issues().filter(i=>i.t==='o').length"),2);assert.equal(run("issues().filter(i=>i.t==='o').every(i=>i.a.wp!==i.b.wp)"),true);
 run('S.cross=false');assert.equal(run("issues().filter(i=>i.t==='o').length"),0);
});

test('OCR respects an explicit custom work meaning for an asterisk',async()=>{
 const{run,runAsync,context}=app();context.cv=fixture('D');context.mock={setParameters:async()=>{},recognize:async()=>({data:{text:'*',confidence:98}})};
 run("S.wps[0].codes=S.wps[0].codes.filter(c=>c.code!=='*');S.wps[0].codes.push({code:'*',label:'Custom duty',type:'work',start:'09:00',end:'17:00'})");
 const result=await run('sc.cv=cv;recognizeShift(S.wps[0],mock,20,20,100,60)');assert.equal(result.text,'*');assert.equal(result.uncertain,false);
});
test('empty OCR output never crashes and optional Persian failure stays reviewable',async()=>{
 const {run,runAsync,context}=app();context.cv=fixture('M');context.mock={setParameters:async()=>{},recognize:async()=>({data:{text:'',confidence:0}})};
 context.Tesseract={createWorker:async()=>{throw Error('optional model unavailable')}};
 const result=await run('sc.cv=cv;recognizeShift(S.wps[0],mock,20,20,100,60)');
 assert.equal(result.text,'');assert.equal(result.uncertain,true);assert.equal(result.c,0);
 assert.equal(run('sc.fallbackError'),'optional model unavailable');
 const again=await run('recognizeShift(S.wps[0],mock,20,20,100,60)');assert.equal(again.uncertain,true);
});
test('failed row reading preserves photo and picker for a retry, without importing partial shifts',async()=>{
 const {run,runAsync}=app();run("render=()=>{};sc.wp='w1';sc.rows=[{pi:0,nm:'Name'}];sc.pages=[{cv:{},vl:[0,1],dayAt:()=>1}];sc.y=1405;sc.m=7;sc.wk={setParameters:async()=>{throw Error('worker lost')},terminate:async()=>{}};sc.busy=true");
 await run('readCells(0)');assert.equal(run('sc.pick'),true);assert.equal(run('sc.busy'),false);assert.equal(run('sc.cells'),null);assert.equal(run('sc.pages.length'),1);assert.equal(run('S.shifts.length'),0);assert.equal(run('sc.wk'),null);
});
test('guided setup creates one workplace and continues directly to roster entry',async()=>{
 const {run,runAsync,document}=app();run("S=DS();go('today')");assert.match(document.querySelector('#v').textContent,/شروع کنیم/);run("go('setup')");document.querySelector('#setup-workplace').value='بخش داخلی';document.querySelector('#setup-name').value='علی رضایی';await run('completeSetup()');
 assert.equal(run('S.wps.length'),1);assert.equal(run('tab'),'scan');assert.equal(run('sc.wp'),run('S.wps[0].id'));assert.equal(run('S.myname'),'علی رضایی');assert.equal(document.querySelector('[aria-current=step]').textContent,'۲برنامه');assert.match(document.querySelector('#v').textContent,/ثبت دستی شیفت/);
 await runAsync("go('today');await resumeSetup()");assert.equal(run('S.wps.length'),1);assert.equal(run('tab'),'scan');run('finishSetup(sc.wp)');assert.equal(run('S.onboarding.stage'),'done');
});
