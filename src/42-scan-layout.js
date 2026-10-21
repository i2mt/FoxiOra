/* Layout evidence is kept separate from OCR confidence. A missing label never removes a row. */
async function scanWorker(language='eng'){
 if(sc.wk&&(sc.wkLang||'eng')!==language){
  if(sc.wk.reinitialize){try{await sc.wk.reinitialize(language,1)}catch(error){await killWk();throw error}}
  else{await sc.wk.terminate();sc.wk=null}
 }
 if(!sc.wk){const base=BASE();await loadScript(base+'tesseract.min.js');sc.wk=await Tesseract.createWorker(language,1,{workerPath:base+'worker.min.js',corePath:base,langPath:base+'lang',gzip:true})}
 sc.wkLang=language;await sc.wk.setParameters({tessedit_pageseg_mode:'7',tessedit_char_whitelist:''});return sc.wk
}
function scanMedian(values){const a=values.filter(v=>Number.isFinite(v)&&v>0).sort((a,b)=>a-b);return a[a.length>>1]||0}
function recoverRowLines(strong,weak=[]){
 const lines=[...strong].sort((a,b)=>a-b),step=scanMedian(lines.slice(1).map((v,i)=>v-lines[i]));if(!step)return lines;
 // Only observed weaker lines close to the established row spacing are added.
 for(const y of weak){if(lines.some(v=>Math.abs(v-y)<step*.28))continue;const anchor=strong.reduce((a,b)=>Math.abs(b-y)<Math.abs(a-y)?b:a,strong[0]),distance=Math.abs(y-anchor),count=Math.round(distance/step);if(count>=1&&Math.abs(distance-count*step)<step*.22)lines.push(y)}
 return lines.sort((a,b)=>a-b)
}
function fitDateSequence(values){
 const votes=new Map();values.forEach((v,i)=>{if(v>=1&&v<=31)for(const direction of [1,-1]){const offset=v-direction*i,key=direction+':'+offset;if(!votes.has(key))votes.set(key,{direction,offset,matches:[]});votes.get(key).matches.push(i)}});
 return [...votes.values()].map(v=>({...v,count:v.matches.length,span:v.matches.at(-1)-v.matches[0]})).sort((a,b)=>b.count-a.count||b.span-a.span)[0]||{direction:-1,offset:0,count:0,span:0,matches:[]}
}
async function locateDateHeader(){
 const H=sc.hl,V=sc.vl,wk=await scanWorker('eng'),count=V.length-1;
 await wk.setParameters({tessedit_char_whitelist:'0123456789',tessedit_pageseg_mode:'7'});
 const probes=[...new Set(Array.from({length:Math.min(9,count)},(_,i)=>Math.round(i*(count-1)/Math.max(1,Math.min(9,count)-1))))];let best=null;
 for(let row=0;row<Math.min(4,H.length-1);row++){
  const values=Array(count).fill(0),read=async i=>{const gl=glyph(...cellBounds(V[i],H[row],V[i+1],H[row+1]),70);if(!gl.canvas)return;const result=await wk.recognize(gl.canvas),text=nrm(result.data.text||'').trim();const v=/^\d{1,2}$/.test(text)?+text:0;values[i]=v>=1&&v<=31?v:0};
  for(const i of probes)await read(i);
  let fit=fitDateSequence(values);if(!best||fit.count>best.fit.count||fit.count===best.fit.count&&fit.span>best.fit.span)best={row,values,fit,read};
  if(fit.count>=4&&fit.span>=6){for(let i=0;i<count;i++)if(!probes.includes(i))await read(i);fit=fitDateSequence(values);best={row,values,fit};if(fit.count>=4&&fit.span>=6)break}
 }
 const fit=best.fit;sc.headerVotes=fit.count;sc.headerRow=fit.count>=3?best.row:-1;sc.headerValues=best.values;sc.guess=fit.count<4||fit.span<6;sc.dr=sc.guess?-1:fit.direction;sc.dayOffset=sc.guess?V.length-5:fit.offset;
 const offset=sc.dayOffset,direction=sc.dr;sc.dayAt=i=>offset+direction*i
}
function nameColumnCandidates(){
 const raw=sc.rawV||sc.vl,V=sc.vl,dayCount=scanDateCount();
 const days=V.slice(0,-1).flatMap((v,i)=>!sc.guess&&sc.dayAt(i)>=1&&sc.dayAt(i)<=dayCount?[i]:[]),lo=Math.min(...days),hi=Math.max(...days);
 const widths=raw.slice(1).map((v,i)=>v-raw[i]),typical=scanMedian(widths),out=[];
 for(let i=0;i<widths.length;i++){
  let x0=raw[i],x1=raw[i+1];
  if(days.length>=4){if(x0<V[lo]&&x1>V[lo])x1=V[lo];else if(x0<V[hi+1]&&x1>V[hi+1])x0=V[hi+1];else if(x0>=V[lo]&&x1<=V[hi+1])continue}
  if(x1-x0<Math.max(10,typical*.6))continue;
  const mid=(x0+x1)/2,index=V.slice(0,-1).findIndex((v,j)=>v<=mid&&V[j+1]>=mid),outside=days.length>=4&&(x1<=V[lo]+2||x0>=V[hi+1]-2),edge=i<Math.max(3,widths.length*.22)||i>=widths.length-Math.max(3,widths.length*.22);
  if(!edge&&!outside)continue;
  out.push({bounds:[x0,x1],index,width:x1-x0,score:Math.min(4,(x1-x0)/Math.max(1,typical))+(outside?3:0),outside})
 }
 return out.sort((a,b)=>b.score-a.score).slice(0,4)
}
function usableName(value,w=wp(sc.wp)){
 const text=cleanName(value).replace(/^[\d۰-۹٠-٩\s.،:؛()\-]+/,'').trim(),key=nn(text);
 if(!key||/^(نام|نامخانوادگی|نامونامخانوادگی|ردیف|جمع|مجموع|امضا|توضیحات|name|names|total|signature)$/i.test(key))return '';
 const letters=text.match(/[A-Za-z\u0621-\u063a\u0641-\u064a\u067e\u0686\u0698\u06a9\u06af\u06cc]/g)||[];
 if(letters.length<2||/\d/.test(nrm(text)))return '';
 const codes=new Set(['d','e','n','m','s','dn','de','en','off',...(w?.codes||[]).map(c=>nn(c.code))]);
 if(text.split(/\s+/).every(t=>codes.has(nn(t))||!/[A-Za-z\u0600-\u06ff]/.test(t)))return '';
 return text
}
function scanDateCount(){return sc.y>0&&sc.m>=1&&sc.m<=12?scanMonthLength():31}
function rowHasInk(x0,y0,x1,y1){
 if(!sc.cv||x1<=x0||y1<=y0)return false;
 const x=Math.max(0,Math.round(x0+(x1-x0)*.2)),y=Math.max(0,Math.round(y0+(y1-y0)*.22)),w=Math.max(1,Math.floor((x1-x0)*.6)),h=Math.max(1,Math.floor((y1-y0)*.56));
 if(x+w>sc.cv.width||y+h>sc.cv.height)return false;
 const pixels=sc.cv.getContext('2d').getImageData(x,y,w,h).data;let lo=255,hi=0;
 for(let i=0;i<pixels.length;i+=4){lo=Math.min(lo,pixels[i]);hi=Math.max(hi,pixels[i])}if(hi-lo<30)return false;
 let dark=0;for(let i=0;i<pixels.length;i+=4)if(pixels[i]<(lo+hi)/2)dark++;
 return dark>=Math.max(3,w*h*.005)
}
function occupiedRosterRow(y0,y1){
 if(!sc.nameBounds||!rowHasInk(sc.nameBounds[0],y0,sc.nameBounds[1],y1))return false;
 const cols=sc.vl.slice(0,-1).flatMap((_,i)=>!scanNameOverlap(sc,i)&&sc.dayAt(i)>=1&&sc.dayAt(i)<=31?[i]:[]);
 const samples=[...new Set([cols[Math.floor(cols.length*.2)],cols[Math.floor(cols.length*.5)],cols[Math.floor(cols.length*.8)]])].filter(i=>i!==undefined);
 return samples.filter(i=>rowHasInk(sc.vl[i],y0,sc.vl[i+1],y1)).length>=Math.min(2,samples.length)&&samples.length>0
}
function scanBodyBands(){
 const H=sc.hl,start=Math.max(0,(sc.headerRow??0)+1),step=scanMedian(H.slice(start+1).map((y,i)=>y-H[start+i])),bands=[];
 for(let i=start;i<H.length-1;i++){
  const y0=H[i],y1=H[i+1],height=y1-y0,count=Math.round(height/step);
  if(height<Math.max(3,step*.28))continue;
  const pieces=Array.from({length:Math.min(6,Math.max(1,count))},(_,j)=>[y0+height*j/count,y0+height*(j+1)/count]);
  // Recover an erased separator only when names AND shift cells support each row.
  if(count>=2&&count<=6&&Math.abs(height/count-step)<step*.2&&pieces.every(([a,b])=>occupiedRosterRow(a,b)))bands.push(...pieces);else bands.push([y0,y1])
 }
 // Faint lower borders must not cut the roster in half. Extend only over actual row content.
 if(step&&sc.nameBounds&&sc.cv){let misses=0;for(let y=H.at(-1);y+step<=sc.cv.height&&misses<2;y+=step){if(occupiedRosterRow(y,y+step)){bands.push([y,y+step]);misses=0}else misses++}}
 return bands
}
function setNameBounds(bounds){
 sc.nameBounds=[...bounds];const mid=(bounds[0]+bounds[1])/2;sc.nameCol=sc.vl.slice(0,-1).findIndex((v,i)=>v<=mid&&sc.vl[i+1]>=mid)
}
function scanNameOverlap(page,index){
 const bounds=page.nameBounds;if(!bounds)return index===page.nameCol;
 return page.vl[index]<bounds[1]-1&&page.vl[index+1]>bounds[0]+1
}
function scanNameCrop(bounds,y0,y1,binary=0){return cropC(...cellBounds(bounds[0],y0,bounds[1],y1),binary,110)}
async function locateNameColumn(){
 sc.nameBounds=null;const candidates=nameColumnCandidates(),bands=scanBodyBands();if(!candidates.length){const raw=sc.rawV||sc.vl;candidates.push({bounds:raw.slice(-2),index:raw.length-2,score:0})}
 // Geometry proposes columns; text sampled at the top, middle and bottom validates them.
 const sample=[...new Set([0,Math.floor(bands.length/2),bands.length-1])].filter(i=>bands[i]);let worker;
 try{worker=await scanWorker('fas+eng')}catch(e){sc.nameWarning='ocr';sc.nameLayoutUncertain=true;setNameBounds(candidates[0].bounds);return}
 for(const candidate of candidates){candidate.samples=new Map();candidate.names=0;
  for(const i of sample){try{const result=await worker.recognize(scanNameCrop(candidate.bounds,...bands[i]));const text=usableName(result.data.text);candidate.samples.set(i,result);if(text)candidate.names++}catch{sc.nameWarning='ocr';break}}
  candidate.total=candidate.score+candidate.names*5;
 }
 candidates.sort((a,b)=>(b.total??b.score)-(a.total??a.score));const best=candidates[0],other=candidates[1];setNameBounds(best.bounds);sc.nameSamples=null;const texts=[...(best.samples?.values()||[])].map(r=>usableName(r.data.text)).filter(Boolean);sc.nameLanguage=texts.some(t=>/[\u0621-\u06ff]/.test(t))?'fas':texts.length?'eng':'fas+eng';
 sc.nameLayoutUncertain=best.names<Math.min(2,sample.length)||(other&&other.total>=best.total-2&&other.names>=best.names);sc.nameCandidates=candidates
}
function nameMatchScore(name){const tokens=(sc.name||'').split(/\s+/).map(nn).filter(Boolean),words=name.split(/\s+/).map(nn).filter(Boolean);return tokens.filter(t=>words.some(w=>w===t||t.length>3&&lev(w,t)<=(t.length>5?2:1))).length/(tokens.length||1)}
async function readNameRows(){
 const bands=scanBodyBands(),bounds=sc.nameBounds;
 // Build every photo row first: a slow/failed OCR worker cannot truncate this list.
 sc.rows=bands.map(([y0,y1],index)=>{const crop=scanNameCrop(bounds,y0,y1);return {y0,y1,index,score:0,nm:'',rawName:'',img:crop.toDataURL('image/jpeg',.85),nameFeature:visualFeature(crop,'names')}});
 let worker;try{worker=await scanWorker(sc.nameLanguage||'fas+eng')}catch{sc.nameWarning='ocr';return}
 for(let i=0;i<sc.rows.length;i++){
  const row=sc.rows[i];P('Reading names…',.45+.3*i/sc.rows.length);
  try{
   let result=await worker.recognize(scanNameCrop(bounds,row.y0,row.y1)),raw=usableName(result.data.text);
   if(!raw||result.data.confidence<65){const retry=await worker.recognize(scanNameCrop(bounds,row.y0,row.y1,1)),text=usableName(retry.data.text);if(text&&(!raw||retry.data.confidence>result.data.confidence)){result=retry;raw=text}}
   const memory=recallExample('names',sc.wp,row.nameFeature,raw),staff=!memory&&raw&&staffNameSuggestion(wp(sc.wp),raw),name=usableName(memory?.label||staff?.label||raw);
   Object.assign(row,{nm:name,rawName:raw,score:sc.nameLayoutUncertain?0:nameMatchScore(name),remembered:!!memory,suggested:!!staff,nameConfidence:result.data.confidence||0})
  }catch{sc.nameWarning='ocr';await killWk();break}
 }
}
function rebuildScanRows(){sc.rows=sc.pages.flatMap((p,pi)=>p.rows.map(r=>({...r,pi,page:pi+1})))}
function rowPickerV(){
 const pages=sc.pages||[];
 return `${isSettingUp()?setupSteps(2):''}${scanError()}<div class="scan-tools"><button class="text-button" onclick="startAlignment(0)">${T2('Straighten / rotate','صاف کردن / چرخاندن')}</button></div><h1>${T2('Choose your row from the photo','ردیف خودت رو از عکس انتخاب کن')}</h1><div class="scan-row-list">`+sc.rows.map((r,i)=>`<button class="c scan-row-choice" onclick="chooseRow(${i})"><img src="${imageSrc(r.img)}" alt="${T2('Name from row ','نام در ردیف ')}${r.index+1}"><span><b>${bidi(usableName(r.nm)||T2('Row '+(r.index+1),'ردیف '+PDg(r.index+1)))}</b>${pages.length>1?`<small>${T2('Page ','صفحه ')}${r.page}</small>`:''}</span></button>`).join('')+`</div><div class="scan-page-tools">${pages.map((p,i)=>`<button class="text-button" onclick="openNameColumn(${i})">${T2('Fix names column','اصلاح ستون نام‌ها')}${pages.length>1?' · '+(i+1):''}</button><button class="text-button" onclick="openPhotoRow(${i})">${T2('Choose from the full photo','انتخاب از تمام عکس')}${pages.length>1?' · '+(i+1):''}</button>`).join('')}</div><div class="row"><button class="p s" onclick="sc.pick=false;killWk();render()">${T2('Back','بازگشت')}</button><label class="p s"><input type="file" accept="image/*" multiple hidden onchange="scanFile(this.files,true);this.value=''">${T2('Add another page','افزودن صفحه')}</label></div>`
}
function openNameColumn(pi){const page=sc.pages?.[pi];if(!page)return;sc.columnPick={pi,bounds:[...(page.nameBounds||page.vl.slice(-2))]};sc.pick=false;sc.cells=null;render()}
function nameColumnV(){const pick=sc.columnPick,p=sc.pages[pick.pi],bounds=pick.bounds;return `<section class="c name-column-picker"><h2>${T2('Tap the names column','ستون نام‌ها رو بزن')}</h2><div class="name-column-photo" onclick="pickNameColumn(event)"><img src="${imageSrc(p.img||sc.img)}" alt="${T2('Roster: choose the names column','جدول برنامه: انتخاب ستون نام‌ها')}"><span style="left:${bounds[0]/p.cv.width*100}%;width:${(bounds[1]-bounds[0])/p.cv.width*100}%"></span></div><div class="dialog-actions"><button class="p" onclick="applyNameColumn()">${T2('Read this column','خواندن این ستون')}</button><button class="p s" onclick="sc.columnPick=null;sc.pick=true;render()">${T2('Back','بازگشت')}</button></div></section>`}
function pickNameColumn(event){const pick=sc.columnPick,p=sc.pages[pick.pi],box=event.currentTarget.getBoundingClientRect(),x=(event.clientX-box.left)/box.width*p.cv.width,lines=p.rawV||p.vl;const i=lines.slice(0,-1).findIndex((v,i)=>v<=x&&lines[i+1]>=x);if(i<0)return;pick.bounds=[lines[i],lines[i+1]];render()}
async function applyNameColumn(){const pick=sc.columnPick;if(!pick||sc.busy)return;const p=sc.pages[pick.pi];usePage(pick.pi);setNameBounds(pick.bounds);sc.nameSamples=null;sc.nameLanguage=null;sc.nameLayoutUncertain=false;sc.columnPick=null;sc.busy=true;sc.nameWarning='';render();try{await readNameRows();Object.assign(p,{nameBounds:sc.nameBounds,nameCol:sc.nameCol,nameLanguage:sc.nameLanguage,nameLayoutUncertain:false,rows:sc.rows});rebuildScanRows();sc.pick=true}catch(e){sc.msg=e.message;sc.pick=true}finally{sc.busy=false;render()}if(sc.colleaguesOnly&&!sc.msg)await pickAuto()}
function openPhotoRow(pi){if(!sc.pages?.[pi])return;sc.columnPick=null;sc.photoRowPick={pi,bounds:null};sc.pick=false;sc.cells=null;render()}
function photoRowV(){const pick=sc.photoRowPick,p=sc.pages[pick.pi],x=p.nameBounds||p.vl.slice(-2);return `<section class="c photo-row-picker"><h2>${T2('Tap your name in the photo','نام خودت رو در عکس بزن')}</h2><div class="photo-row-column" onclick="pickPhotoRow(event)"><img src="${scanPreview(p.cv,x[0],0,x[1],p.cv.height,1000)}" alt="${T2('Full names column','تمام ستون نام‌ها')}">${pick.bounds?`<span style="top:${pick.bounds[0]/p.cv.height*100}%;height:${(pick.bounds[1]-pick.bounds[0])/p.cv.height*100}%"></span>`:''}</div><div class="photo-row-actions"><button class="p" ${pick.bounds?'':'disabled'} onclick="confirmPhotoRow()">${T2('Read this row','خواندن همین ردیف')}</button><button class="p s" onclick="sc.photoRowPick=null;sc.pick=true;render()">${T2('Back','بازگشت')}</button></div></section>`}
function pickPhotoRow(event){const pick=sc.photoRowPick,p=sc.pages[pick.pi],box=event.currentTarget.getBoundingClientRect(),y=(event.clientY-box.top)/box.height*p.cv.height,H=p.hl,step=scanMedian(H.slice(1).map((v,i)=>v-H[i])),i=H.slice(0,-1).findIndex((v,i)=>v<=y&&H[i+1]>=y);pick.bounds=i>=0&&H[i+1]-H[i]<step*1.5?[H[i],H[i+1]]:[Math.max(0,y-step/2),Math.min(p.cv.height,y+step/2)];render()}
async function confirmPhotoRow(){const pick=sc.photoRowPick;if(!pick?.bounds||sc.busy)return;const p=sc.pages[pick.pi];usePage(pick.pi);const [y0,y1]=pick.bounds,crop=scanNameCrop(sc.nameBounds,y0,y1),old=p.rows.findIndex(r=>Math.min(r.y1,y1)-Math.max(r.y0,y0)>Math.min(r.y1-r.y0,y1-y0)*.6),row={y0,y1,nm:old>=0?p.rows[old].nm:'',score:0,img:crop.toDataURL('image/jpeg',.85),nameFeature:visualFeature(crop,'names'),manualRow:true};if(old>=0)p.rows[old]=row;else p.rows.push(row);p.rows.sort((a,b)=>a.y0-b.y0);p.rows.forEach((r,i)=>r.index=i);rebuildScanRows();const i=sc.rows.findIndex(r=>r.pi===pick.pi&&r.y0===y0&&r.manualRow);sc.photoRowPick=null;sc.pick=true;await chooseRow(i)}
