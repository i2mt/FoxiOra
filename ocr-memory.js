/* Confirmed examples only. Stored in the existing local backup, never uploaded.
   This is conservative example matching, not retraining Tesseract. */
function memoryStore() {
  if (!S.ocrMemory || S.ocrMemory.version !== 1) S.ocrMemory = {version: 1, glyphs: [], names: []};
  return S.ocrMemory;
}

// Otsu's threshold works even when a faint dash occupies less than 5% of a cell.
function inkThreshold(gray) {
  const hist = new Uint32Array(256);
  let sum = 0, low = 255, high = 0;
  for (const v of gray) { hist[v]++; sum += v; low = Math.min(low, v); high = Math.max(high, v); }
  if (high - low < 12) return null;
  let count = 0, partial = 0, best = -1, threshold = low;
  for (let t = 0; t < 255; t++) {
    count += hist[t]; partial += t * hist[t];
    if (!count || count === gray.length) continue;
    const score = count * (gray.length - count) * (partial / count - (sum - partial) / (gray.length - count)) ** 2;
    if (score > best) { best = score; threshold = t; }
  }
  return threshold + 1;
}

function visualFeature(canvas, kind = 'glyphs') {
  const w = canvas.width, h = canvas.height;
  if (!w || !h) return null;
  const pixels = canvas.getContext('2d').getImageData(0, 0, w, h).data;
  const gray = new Uint8Array(w * h);
  for (let i = 0; i < gray.length; i++) gray[i] = Math.round((pixels[i*4] + pixels[i*4+1] + pixels[i*4+2]) / 3);
  const threshold = inkThreshold(gray);
  if (threshold === null) return null;
  let left = w, right = -1, top = h, bottom = -1, count = 0;
  for (let y = 2; y < h-2; y++) for (let x = 2; x < w-2; x++) {
    if (gray[y*w+x] >= threshold) continue;
    left = Math.min(left,x); right = Math.max(right,x); top = Math.min(top,y); bottom = Math.max(bottom,y); count++;
  }
  if (count < 4 || right < left) return null;
  const bw = right-left+1, bh = bottom-top+1, cols = kind === 'names' ? 96 : 24, rows = 24;
  const cv = document.createElement('canvas'); cv.width = cols; cv.height = rows;
  const ctx = cv.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0,0,cols,rows);
  const scale = Math.min((cols-2)/bw,(rows-2)/bh), dw=bw*scale, dh=bh*scale;
  const mask = document.createElement('canvas'); mask.width=bw; mask.height=bh;
  const mx=mask.getContext('2d'), image=mx.createImageData(bw,bh);
  for(let y=0;y<bh;y++)for(let x=0;x<bw;x++){
    const p=(y*bw+x)*4,v=gray[(top+y)*w+left+x]<threshold?0:255;
    image.data[p]=image.data[p+1]=image.data[p+2]=v;image.data[p+3]=255;
  }
  mx.putImageData(image,0,0);ctx.drawImage(mask,(cols-dw)/2,(rows-dh)/2,dw,dh);
  const data=ctx.getImageData(0,0,cols,rows).data;
  let bits='';for(let i=0;i<data.length;i+=4)bits+=Math.round((255-data[i])/17).toString(16);
  return {bits, aspect: bw/bh};
}

function featureDistance(a,b) {
  if(!a || !b || a.bits.length!==b.bits.length || !a.aspect || !b.aspect) return 1;
  let difference=0,ink=0;
  for(let i=0;i<a.bits.length;i++){
    const x=parseInt(a.bits[i],16),y=parseInt(b.bits[i],16);
    difference+=Math.abs(x-y);ink+=Math.max(x,y);
  }
  return difference/Math.max(1,ink)+Math.min(.5,Math.abs(Math.log(a.aspect/b.aspect))*.15);
}

function recallExample(kind, workplace, feature, raw='') {
  if(S.learnOCR===false) return null;
  const examples=memoryStore()[kind].filter(x=>x.wp===workplace);
  if(kind==='names' && nn(raw).length>=3){
    const aliases=examples.filter(x=>nn(x.raw)===nn(raw));
    const labels=[...new Set(aliases.map(x=>x.label))];
    if(labels.length===1) return {label:labels[0],source:'alias'};
  }
  if(!feature) return null;
  const ranked=examples.map(x=>({label:x.label,d:featureDistance(feature,x.feature)})).sort((a,b)=>a.d-b.d);
  const best=ranked[0],other=ranked.find(x=>x.label!==best?.label);
  if(!best || best.d>(kind==='names'?.16:.2) || (other && other.d-best.d<.09)) return null;
  return {label:best.label,source:'visual',distance:best.d};
}

function rememberExample(kind, workplace, feature, raw, label) {
  if(S.learnOCR===false || !label || (!feature && (kind!=='names'||nn(raw).length<3))) return;
  const memory=memoryStore(),list=memory[kind];
  // A corrected identical example supersedes its old label. Distinct conflicting
  // examples remain distinct and therefore abstain during ambiguous matching.
  const same=list.find(x=>x.wp===workplace && ((feature && featureDistance(feature,x.feature)<.025) || (!feature&&!x.feature&&x.raw===raw)));
  if(same) Object.assign(same,{label,raw,feature,at:Date.now()});
  else list.push({id:'ocr-'+Date.now()+'-'+Math.random().toString(36).slice(2,8),wp:workplace,feature,raw,label,at:Date.now()});
  memory[kind]=list.sort((a,b)=>b.at-a.at).slice(0,kind==='names'?200:300);
}

function memoryDialog() {
  const m=memoryStore();
  dlg(`<h3>${T2('Saved scan corrections','اصلاحات ذخیره‌شدهٔ اسکن')}</h3><p class="mu">${T2('Confirmed examples stay on this device and are included in your backup. Similar scans are suggested for review.','اصلاحات شما به خواندن اسکن بعدی کمک می‌کند. برای حذف هر مورد، × را بزنید.')}</p>`+
    ['names','glyphs'].map(kind=>`<h1>${kind==='names'?T2('Names','نام‌ها'):T2('Shift symbols','علامت‌های شیفت')}</h1>`+
      (m[kind].map((x,i)=>`<div class="pk"><span>${bidi(x.label)} <small class="mu">${esc(wp(x.wp).name)}</small></span><button class="x" aria-label="${T2('Forget example','حذف نمونه')}" onclick="forgetExample('${kind}',${i})">×</button></div>`).join('')||`<p class="mu">${T2('No examples yet.','هنوز نمونه‌ای ذخیره نشده.')}</p>`)).join('')+
    `<button class="p s" onclick="closeDialog()">${T2('Close','بستن')}</button>`);
}
async function forgetExample(kind,index){const change=beginChange('Scan correction removal','حذف اصلاح اسکن',['ocrMemory']);memoryStore()[kind].splice(index,1);if(!await commitChange(change))return;closeDialog();render();memoryDialog()}

function offCode(w){const cs=w?.codes||[],off=cs.find(c=>c.code==='-'&&c.type==='off')||cs.find(c=>c.type==='off');return off?cs.some(c=>c.code==='-'&&c.type!=='off')||!['OFF','*','-'].includes(off.code)?off.code:'-':''}
function normalizeOCR(w,text){
  text=cleanCode(nrm(text).replace(/\s/g,''));
  if(text==='*'&&!w.codes.some(c=>c.code==='*'&&c.type!=='off'))return offCode(w)||'*';
  if(text&&!parse(w,text)&&parse(w,text.toUpperCase()))return text.toUpperCase();
  return text;
}
// Preserve the letter area at low resolution; a fixed 6 px margin erased it.
function cellBounds(x0,y0,x1,y1){const mx=Math.min(6,Math.max(1,Math.round((x1-x0)*.19))),my=Math.min(6,Math.max(1,Math.round((y1-y0)*.19)));return [x0+mx,y0+my,x1-mx,y1-my]}
const smoothedPages=new WeakMap();
function smoothPage(cv){if(!smoothedPages.has(cv)){const out=document.createElement('canvas');out.width=cv.width;out.height=cv.height;const ctx=out.getContext('2d');ctx.filter='blur(0.65px)';ctx.drawImage(cv,0,0);smoothedPages.set(cv,out)}return smoothedPages.get(cv)}
// Persian leave marker: use the existing Persian model only when Latin OCR abstains.
async function recognizePersianLeave(w,canvas){
  if(!canvas||!w.codes.some(c=>c.code==='M')||typeof Tesseract==='undefined')return null;
  if(!sc.fasWk){const B=BASE();sc.fasWk=await Tesseract.createWorker('fas',1,{workerPath:B+'worker.min.js',corePath:B,langPath:B+'lang',gzip:true});}
  await sc.fasWk.setParameters({tessedit_pageseg_mode:'7',tessedit_char_whitelist:''});
  const result=await sc.fasWk.recognize(canvas),raw=result.data.text.trim();
  if(!/^م$/.test(raw)||result.data.confidence<45)return null;
  await sc.fasWk.setParameters({tessedit_char_whitelist:'م'});
  const check=await sc.fasWk.recognize(canvas);
  return check.data.text.trim()==='م'?{text:'M',c:Math.min(65,result.data.confidence,check.data.confidence),raw}:null;
}
// Shared by the personal-row and colleague scans. Never globally map O/0 to D.
async function recognizeShift(w,wk,x0,y0,x1,y1){
  const source=cropC(x0,y0,x1,y1,false,80),modern=glyph(x0,y0,x1,y1),legacy=legacyGlyph(x0,y0,x1,y1);
  const feature=visualFeature(modern.canvas||source),preview=cropC(x0,y0,x1,y1,false,44).toDataURL('image/jpeg',.8);
  let text='',confidence=0,raw='',uncertain=false;
  if(modern.dash){text=parse(w,'-')?canonicalShift(w,'-'):'';confidence=text?90:0}
  else if(modern.blank&&legacy.blank){uncertain=true;confidence=0}
  else{
    const candidates=[];
    const read=async(canvas,psm,nc)=>{
      await wk.setParameters({tessedit_pageseg_mode:psm});
      const result=await wk.recognize(canvas);let value=normalizeOCR(w,result.data.text);
      if(nc===1&&!w.codes.some(code=>code.code===value))value=value.replace(/(.)\1+/g,'$1');
      const parsed=value?parse(w,value):null,unsafeOff=parsed?.every(c=>c.type==='off')&&(value==='-'||value==='*')&&!modern.dash;
      const mixedOff=parsed&&parsed.length>1&&parsed.some(c=>c.type==='off')&&parsed.some(c=>c.type!=='off');
      const implausibleCombo=mixedOff||(parsed&&parsed.length>1&&modern.shape&&modern.shape.bw/modern.shape.bh<1.05);
      const candidate={text:value,c:result.data.confidence||0,raw:result.data.text,valid:!!parsed&&!unsafeOff&&!implausibleCombo};
      candidates.push(candidate);return candidate;
    };
    const first=await read(legacy.canvas||modern.canvas||source,'7',legacy.canvas?legacy.nc:modern.nc);
    if(!first.valid||first.c<85){
      if(legacy.canvas)await read(legacy.canvas,'3',legacy.nc);
      if(!candidates.some(x=>x.valid&&x.c>=85)&&legacy.canvas)await read(legacy.canvas,'8',legacy.nc);
      if(!candidates.some(x=>x.valid&&x.c>=85)&&modern.canvas)await read(modern.canvas,'7',modern.nc);
      if(!candidates.some(x=>x.valid&&x.c>=85))await read(source,'8',modern.nc);
      if(!candidates.some(x=>x.valid&&x.c>=85)){const soft=legacyGlyph(x0,y0,x1,y1,80,smoothPage(sc.cv));if(soft.canvas)await read(soft.canvas,'7',soft.nc)}
    }
    // Prefer valid, well-supported readings. A disagreement always needs review.
    const valid=candidates.filter(x=>x.valid).sort((a,b)=>b.c-a.c),best=valid[0]||first;
    text=best.valid?best.text:'';confidence=best.valid?best.c:0;raw=first.raw;
    uncertain=!best.valid||candidates.some(x=>x.valid&&x.text!==best.text);
    if(uncertain)confidence=Math.min(72,confidence);
    await wk.setParameters({tessedit_pageseg_mode:'7'});
  }
  if(!text&&modern.canvas&&!sc.fallbackError){try{const persian=await recognizePersianLeave(w,modern.canvas);if(persian){text=persian.text;confidence=persian.c;raw=persian.raw;uncertain=true;}}catch(e){sc.fallbackError=e.message;uncertain=true;confidence=0}}
  if(y1-y0<10||(!modern.dash&&modern.shape&&modern.shape.bh<8)){uncertain=true;confidence=Math.min(65,confidence)}
  const remembered=recallExample('glyphs',w.id,feature);
  const suggestion=remembered&&parse(w,remembered.label)?remembered.label:'';
  if(suggestion&&suggestion!==text){text=suggestion;confidence=70;uncertain=true}
  return {text,c:confidence,raw,feature,img:preview,suggestion,uncertain,confirmed:false};
}
