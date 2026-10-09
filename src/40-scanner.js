/* ===== v3: Jalali helpers + roster scanner ===== */
const JF=new Intl.DateTimeFormat('en-US-u-ca-persian-nu-latn',{year:'numeric',month:'numeric',day:'numeric'});
const jp=d=>{const o={};JF.formatToParts(new Date(d)).forEach(p=>o[p.type]=p.value);return{y:+o.year,m:+o.month,d:+o.day}};
const fromJ=(y,m,d)=>{let t=new Date(y+621,2,10);for(let i=0;i<420;i++){const j=jp(t);if(j.y===y&&j.m===m&&j.d===d)return t;t=new Date(t.getFullYear(),t.getMonth(),t.getDate()+1)}return null};
const PDg=x=>String(x).replace(/\d/g,d=>PD[d]);
const jstr=v=>{const j=jp(new Date(v+'T00:00'));return j.y+'/'+String(j.m).padStart(2,'0')+'/'+String(j.d).padStart(2,'0')};
const dField=(id,v)=>S.cal==='j'?`<input id="${esc(id)}" inputmode="numeric" dir="ltr" value="${PDg(jstr(v))}">`:`<input id="${esc(id)}" type=date value="${esc(v)}">`;
const dGet=id=>{const v=document.getElementById(id).value;if(S.cal!=='j')return v;const p=nrm(v).split(/[\/\-.]/).map(Number);if(p.length!==3||p.some(isNaN))return'';const t=fromJ(...p);return t?iso(t):''};
const JM=['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'];

// Scanner pipeline: enhance photo -> OCR #1 (layout: dates + names) -> locate header row & your row -> OCR #2 per cell (single-line, code whitelist) -> review with crops.
let sc={wp:'',name:'',y:0,m:0,words:null,cells:null,msg:'',busy:false,img:'',cv:null};
const OCR_CACHE='foxiora-ocr-v1';
const OCR_ASSETS=[{"file":"tesseract.min.js","bytes":66695,"sha256":"a8e29918d098b2b06e1012bdaeffb4aec0445c5d5654709023e0bd1f442a80e8"},{"file":"worker.min.js","bytes":123724,"sha256":"aca1229639fc9907d86f96e825955a2b7c5716d17f3bc3acd71f9c7ab66181fc"},{"file":"tesseract-core-simd-lstm.wasm.js","bytes":3938657,"sha256":"ce20eda9533cbed1e6c2b4276fbae1e0adc61b6754b5513084be601787b457cf"},{"file":"tesseract-core-lstm.wasm.js","bytes":3938277,"sha256":"8f04aa0cc81e7bde33f80e92fa01a7a665f0b4884d098acf5de9c7104a11dfaa"},{"file":"lang/eng.traineddata.gz","bytes":2952873,"sha256":"45b4cb346724ac1774f1c36f42f182b887bcdb28ebe63e6fff90ac41f3fcff91"},{"file":"lang/fas.traineddata.gz","bytes":424507,"sha256":"b5847360e25f646c55449f1fe93eee57d53e406a265ead2374e7320bf0b82025"}];
let scannerOffline={busy:false,ready:false,checked:false,done:0,error:''};
function offlineScannerV(){return `<section class="offline-scanner"><b>${T2('Scan without internet','اسکن بدون اینترنت')}</b><p>${T2('Download the scanner once (about 11 MB). Your photos stay on this device.','اسکنر را یک‌بار آماده کنید (حدود ۱۱ مگابایت). عکس‌ها روی همین دستگاه می‌مانند.')}</p><p id="scanner-offline-status" class="scanner-status${scannerOffline.ready?' ready':''}" role="status" aria-live="polite">${scannerOfflineText()}</p><button id="scanner-offline-button" class="p s" onclick="prepareOfflineScanner()" ${scannerOffline.busy?'disabled':''}>${scannerOffline.busy?T2('Preparing…','در حال آماده‌سازی…'):scannerOffline.ready?T2('Check offline scanner','بررسی اسکنر آفلاین'):T2('Prepare offline scanner','آماده‌سازی اسکن آفلاین')}</button></section>`}
function scannerOfflineText(){if(scannerOffline.busy)return T2('Preparing scanner · ','آماده‌سازی اسکنر · ')+scannerOffline.done+'/'+OCR_ASSETS.length;if(scannerOffline.error)return esc(T2('Preparation did not finish. Your schedule is safe; retry when connected.','آماده‌سازی کامل نشد؛ برنامه‌تان محفوظ است. با اتصال اینترنت دوباره امتحان کنید.'));return scannerOffline.ready?T2('Ready to scan offline on this device.','اسکن آفلاین روی این دستگاه آماده است.'):scannerOffline.checked?T2('The scanner still needs preparation.','اسکنر هنوز نیاز به آماده‌سازی دارد.'):T2('Check or prepare the scanner before going offline.','قبل از قطع اینترنت، اسکنر را آماده کنید.')}
function updateScannerOffline(){const status=$('#scanner-offline-status'),button=$('#scanner-offline-button');if(status){status.innerHTML=scannerOfflineText();status.classList.toggle('ready',scannerOffline.ready);tr(status)}if(button){button.disabled=scannerOffline.busy;button.textContent=scannerOffline.busy?T2('Preparing…','در حال آماده‌سازی…'):scannerOffline.ready?T2('Check offline scanner','بررسی اسکنر آفلاین'):T2('Prepare offline scanner','آماده‌سازی اسکن آفلاین')}}
async function validOCRAsset(response,asset){if(!response?.ok)return false;const bytes=await response.clone().arrayBuffer();if(bytes.byteLength!==asset.bytes)return false;const hash=await crypto.subtle.digest('SHA-256',bytes);return Array.from(new Uint8Array(hash),b=>b.toString(16).padStart(2,'0')).join('')===asset.sha256}
async function getOCRAsset(asset,download=true){const url=new URL(asset.file,BASE()).href,cache=await caches.open(OCR_CACHE),cached=await cache.match(url);if(await validOCRAsset(cached,asset))return cached;if(cached)await cache.delete(url);if(!download)return null;const response=await fetch(url,{cache:'reload'});if(!await validOCRAsset(response,asset))throw Error('Scanner file is missing or damaged: vendor/'+asset.file);await cache.put(url,response.clone());return response}
async function prepareOfflineScanner(){if(scannerOffline.busy)return;scannerOffline={busy:true,ready:false,checked:true,done:0,error:''};updateScannerOffline();try{for(const asset of OCR_ASSETS){await getOCRAsset(asset);scannerOffline.done++;updateScannerOffline()}scannerOffline.ready=true}catch(e){scannerOffline.error=e.message;scannerOffline.ready=false}finally{scannerOffline.busy=false;updateScannerOffline()}}
const loadScript=async u=>{for(const asset of OCR_ASSETS)await getOCRAsset(asset);scannerOffline.ready=true;scannerOffline.checked=true;if(window.Tesseract)return;await new Promise((ok,no)=>{const e=document.createElement('script');e.src=u;e.onload=ok;e.onerror=()=>no(Error('Could not run vendor/tesseract.min.js'));document.head.append(e)})};
const nn=t=>nrm(t).replace(/ي/g,'ی').replace(/ك/g,'ک').replace(/[\u200c\s]/g,'').toLowerCase();
const lev=(a,b)=>{const d=[...Array(b.length+1).keys()];for(let i=1;i<=a.length;i++){let p=d[0];d[0]=i;for(let j=1;j<=b.length;j++){const t=d[j];d[j]=Math.min(d[j]+1,d[j-1]+1,p+(a[i-1]===b[j-1]?0:1));p=t}}return d[b.length]};
const cleanCode=t=>{t=t.replace(/م/g,'M').replace(/[—–_−]/g,'-').replace(/[|!\[\]()]/g,'');return /^-+$/.test(t)?'-':/^off$/i.test(t)?'OFF':t};
const BASE=()=>new URL('vendor/',location.href).href;
const P=(t,p)=>{sc.status=t;if(p!=null)sc.progress=Math.max(0,Math.min(100,Math.round(p*100)));const e=$('#prog');if(e){e.textContent=t;tr(e)}const b=$('#pbar');if(b){b.setAttribute('aria-valuenow',sc.progress||0);b.querySelector('i').style.width=(sc.progress||0)+'%'}const fox=$('.scan-fox');if(fox)fox.style.setProperty('--loading-progress',(sc.progress||0)+'%')};
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
  for(let y=0;y<H;y++){let c=0;for(let x=0;x<W;x++)c+=m[y*W+x];if(c>W*.6&&(y<H*.24||y>H*.76)&&true)for(let k=-1;k<=1;k++)if(y+k>=0&&y+k<H)for(let x=0;x<W;x++)m[(y+k)*W+x]=0}
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
  for(let y=0;y<H;y++){let c=0;for(let x=0;x<W;x++)c+=m[y*W+x];if(c>W*.6&&true)for(let k=-1;k<=1;k++)if(y+k>=0&&y+k<H)for(let x=0;x<W;x++)m[(y+k)*W+x]=0}
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
const killWk=async()=>{for(const key of ['wk','fasWk'])if(sc[key]){const k=sc[key];sc[key]=null;try{await k.terminate()}catch{}}};
const scanError=()=>sc.msg?`<div class="c scan-error" role="alert"><b>${T2('Let’s try that row again','این ردیف را دوباره امتحان کنیم')}</b><p>${T2('Your photo is still here. Choose your row again, or go back to change the photo.','عکستان هنوز اینجاست. ردیف خودتان را دوباره انتخاب کنید، یا برای تغییر عکس برگردید.')}</p><details><summary>${T2('Error details','جزئیات خطا')}</summary><p dir="auto">${esc(sc.msg)}</p></details></div>`:'';
V.scan=()=>{if(!S.wps.length)return V.setup();
  if(sc.busy)return`<div class="steps"><span class="on"></span><span class="on"></span><span></span></div><section class="c scan-loading"><div class="scan-progress-head">${foxFill('scan-fox',sc.progress||0)}<div><b>${T2('Reading your schedule','در حال خواندن برنامهٔ شما')}</b><p class="mu">${T2('We’ll check unclear symbols together.','علامت‌های نامشخص را با هم بررسی می‌کنیم.')}</p></div></div><img class="pv" src="${imageSrc(sc.img)}" alt="${T2('Your roster photo','عکس برنامهٔ شما')}"><div id="pbar" class="pbar" role="progressbar" aria-label="${T2('Reading progress','پیشرفت خواندن')}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${sc.progress||0}"><i style="width:${sc.progress||0}%"></i></div><div id="prog" class="mu">${esc(sc.status||T2('Preparing your photo…','عکستان را آماده می‌کنیم…'))}</div></section>`;
  if(sc.pick)return`${isSettingUp()?setupSteps(2):''}${scanError()}<h1>${T2('Which row is yours?','کدام ردیف برای شماست؟')}</h1><p class="mu">${T2('These names came from your photo. Tap your row; the photo helps if a name is unclear.','ردیف خودتان را انتخاب کنید؛ عکس کنار نام کمک می‌کند درست انتخاب کنید.')}</p>`+sc.rows.map((r,i)=>`<div class="c cr ${r.score>=.5?'':'w'}" role="button" tabindex="0" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();chooseRow(${i})}" style="padding:8px" onclick="chooseRow(${i})"><img src="${imageSrc(r.img)}" style="height:52px;max-width:100%"><span class="mu">${esc(r.nm||T2('Unreadable name','نام ناخوانا'))}${r.remembered?' · '+T2('Remembered','یادآوری‌شده'):''}${sc.pages.length>1?' · '+T2('Page','صفحه')+' '+r.page:''}</span></div>`).join('')+`<div class="row" style="gap:6px"><button class="p s" onclick="sc.pick=false;killWk();render()">Back</button><label class="p s"><input type=file accept="image/*" multiple hidden onchange="scanFile(this.files,true);this.value=''">Add another page</label></div>`;
  if(sc.cells)return reviewV();
  const setup=isSettingUp(),J=S.cal==='j',n=jp(Date.now()),y=sc.y||(J?n.y:new Date().getFullYear()),m=sc.m||(J?n.m:new Date().getMonth()+1);
  sc.wp=sc.wp||S.wps[0].id;sc.name=sc.name||S.myname||'';
  const mn=i=>J?JM[i-1]:new Date(2024,i-1,1).toLocaleDateString(loc(),{month:'long'}),inp=cap=>`<input type=file accept="image/*" ${cap?'capture=environment':''} hidden ${cap?'':'multiple'} onchange="scanFile(this.files);this.value=''">`;
  return `${isSettingUp()?setupSteps(2):'<div class="steps"><span class="on"></span><span></span><span></span></div>'}<div class="c scan-form"><h2>${T2('Let’s add your schedule','نوبت برنامهٔ شماست')}</h2>${setup&&S.wps.length===1?`<input type="hidden" id="sw" value="${esc(sc.wp)}"><p class="scan-workplace">${bidi(wp(sc.wp).name)}</p>`:`<label class=mu>Workplace</label><select id=sw>${S.wps.map(w=>`<option value="${esc(w.id)}" ${w.id===sc.wp?'selected':''}>${esc(w.name)}</option>`).join('')}</select>`}
${setup?`<details class="optional-name"><summary>${sc.name?bidi(sc.name)+' · '+T2('Edit name','ویرایش نام'):T2('Add your name (optional)','افزودن نام شما (اختیاری)')}</summary>`:''}<label class=mu>${T2('Your name (optional)','نام شما (اختیاری)')}</label><input id=sn autocomplete="name" placeholder="${T2('Or choose your row from the photo','یا ردیفتان را از عکس انتخاب کنید')}" value="${esc(sc.name)}">${setup?'</details>':''}<div class=row style="gap:8px"><select id=sm>${[...Array(12)].map((_,i)=>`<option value=${i+1} ${i+1===m?'selected':''}>${mn(i+1)}</option>`).join('')}</select><input id=sy inputmode=numeric dir=ltr value="${PDg(y)}" style="width:100px"></div>
<p class="mu">${T2('Include the full table and date header. Avoid glare and use the original photo; tiny or obscured text needs manual review.','عکس اصلی و واضح برنامه را انتخاب کنید؛ همهٔ جدول و تاریخ‌ها داخل عکس باشند. علامت‌های نامشخص را قبل از ثبت بررسی می‌کنیم.')}</p><div class=row style="gap:8px"><label class=p>${inp(1)}Camera</label><label class="p s">${inp(0)}Gallery</label></div><button class="text-button symbol-help" onclick="sc.wp=$('#sw').value;editWp(sc.wp,true)">${T2('Symbols & shift hours','معنی علامت‌ها و ساعت شیفت‌ها')}</button><button class="text-button" onclick="readForm();addShift()">${T2('Prefer to enter shifts manually?','ثبت دستی شیفت‌ها را ترجیح می‌دهید؟')}</button>${sc.msg?`<p class="scan-error" role="alert">${T2('We couldn’t read this photo. Try a clearer photo with the whole table in view.','این عکس خوانده نشد. یک عکس واضح‌تر از تمام جدول امتحان کنید.')}</p><details><summary>${T2('Error details','جزئیات خطا')}</summary><p>${esc(sc.msg)}</p></details>`:''}</div>`};
function readForm(){sc.wp=$('#sw').value;sc.name=$('#sn').value.trim();sc.m=+$('#sm').value;sc.y=+nrm($('#sy').value);S.myname=sc.name;saveQuietly()}
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
async function scanFile(files,add){files=[...(files||[])];if(!files.length)return;if($('#sw'))readForm();sc.msg='';sc.status='';sc.progress=0;sc.fallbackError='';sc.cells=null;sc.pick=false;if(!add||!sc.pages){sc.pages=[];sc.img='';await killWk()}
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
async function chooseRow(i){if(sc.busy||!sc.rows[i])return;sc.msg='';if(!sc.name){sc.name=sc.rows[i].nm||'';S.myname=sc.name;saveQuietly()}sc.pick=false;sc.busy=true;render();await readCells(i)}
async function readCells(ri){try{const r=sc.rows[ri];if(!r||!sc.pages?.[r.pi])throw Error('Selected row is no longer available.');usePage(r.pi);sc.ri=ri;const w=S.wps.find(x=>x.id===sc.wp);if(!w)throw Error('Workplace is no longer available.');if(!Number.isInteger(sc.y)||!Number.isInteger(sc.m)||sc.m<1||sc.m>12)throw Error('Check the roster month and year.');if(!sc.wk){const B=BASE();await loadScript(B+'tesseract.min.js');sc.wk=await Tesseract.createWorker('eng',1,{workerPath:B+'worker.min.js',corePath:B,langPath:B+'lang',gzip:true})}const wk=sc.wk,V=sc.vl,J=S.cal==='j',b0=J?fromJ(sc.y,sc.m,1):new Date(sc.y,sc.m-1,1),list=[];
  await wk.setParameters({tessedit_char_whitelist:codeTokens(w)});
  for(let i=0;i<V.length-1;i++){const day=sc.dayAt(i);if(day<1||day>31||i===sc.nameCol)continue;const d=new Date(b0.getFullYear(),b0.getMonth(),b0.getDate()+day-1);if(!(J?jp(d).m===sc.m:d.getMonth()===sc.m-1))continue;list.push({i,day,date:iso(d)})}
  list.sort((a,b)=>a.day-b.day);sc.cells=[];sc.reviewAll=false;sc.reviewPage=0;
  for(let q=0;q<list.length;q++){const{i,day,date}=list[q];P('Reading cells '+(q+1)+'/'+list.length,.75+.25*q/list.length);const [x0,y0,x1,y1]=cellBounds(V[i],r.y0,V[i+1],r.y1);
    const result=await recognizeShift(w,wk,x0,y0,x1,y1);
    if(sc.guess){result.uncertain=true;result.c=Math.min(65,result.c)}sc.cells.push({day,date,...result})}

  sc.strip=cropC(V[0],r.y0+2,V[V.length-1],r.y1-2,0,56).toDataURL('image/jpeg',.6)}catch(e){sc.msg=e.message;sc.cells=null;sc.pick=!!sc.rows?.length;await killWk()}
  sc.busy=false;render()}
const cState=(w,c)=>c.uncertain&&!c.confirmed?'low':!c.text?'empty':!parse(w,c.text)?'bad':c.c<80?'low':'ok';
const setCell=(i,v)=>{const c=sc.cells[i];c.text=canonicalShift(wp(sc.wp),v);c.c=100;c.confirmed=true;c.uncertain=false;render()};
const reviewV=()=>{const w=S.wps.find(x=>x.id===sc.wp),st=sc.cells.map(c=>cState(w,c)),chk=st.filter(x=>x!=='ok'&&x!=='empty').length,n=sc.cells.filter(c=>c.text).length,cur=sc.rows[sc.ri];
  const ids=sc.cells.map((c,i)=>i).filter(i=>sc.reviewAll||sc.guess||!['ok','empty'].includes(st[i]));sc.reviewPage=Math.max(0,Math.min(sc.reviewPage||0,ids.length-1));const shown=ids.slice(sc.reviewPage,sc.reviewPage+1);
  return `${isSettingUp()?setupSteps(3):'<div class="steps"><span class="on"></span><span class="on"></span><span class="on"></span></div>'}${sc.guess?'<div class="c mu" style="border-color:var(--org)">Dates were guessed. Check the first and last day.</div>':''}
<div class="row" style="margin:0 2px 8px"><b>${esc(sc.name)} · ${esc(w.name)}${sc.pages.length>1?' · Page '+cur.page:''}</b><span class="bad ${chk?'g':''}" style="${chk?'':'background:var(--ok)'}">${chk?chk+' Needs review':n+' ✓'}</span></div>
<button class="text-button symbol-help" onclick="editWp(sc.wp,true)">${T2('Define roster symbols','معنی علامت‌ها و ساعت شیفت‌ها')}</button><div class="review-toolbar"><span>${ids.length?sc.reviewPage+1:0} / ${ids.length}</span><button class="text-button" onclick="sc.reviewAll=!sc.reviewAll;sc.reviewPage=0;render()">${sc.reviewAll?T2('Uncertain only','فقط نیازمند بررسی'):T2('Show all dates','نمایش همهٔ تاریخ‌ها')}</button></div><p class="mu review-help">${T2('Tap a symbol to confirm. ∅ = blank; − = off.','علامت درست را با عکس تطبیق دهید و بزنید. ∅ یعنی خانهٔ خالی.')}</p>`
   +shown.map(i=>{const c=sc.cells[i],k=st[i];return `<div class="rv ${k==='ok'||k==='empty'?'':'w'}"><div class="rd"><small>${dateHTML(c.date)}</small><b>${new Date(c.date+'T00:00').toLocaleDateString(loc(),{day:'numeric'})}</b><span class="mu">${new Date(c.date+'T00:00').toLocaleDateString(loc(),{weekday:'short'})}</span></div><img src="${imageSrc(c.img)}" alt="${T2('Shift from photo','شیفت در عکس')}"><div class="review-options"><div class="keys">${[...w.codes.filter(x=>x.type!=='off'),...(offCode(w)?[{code:offCode(w)}]:[])].map(x=>`<button aria-pressed="${c.text===x.code}" class="k${c.text===x.code?' on':''}" onclick="setCell(${i},${esc(JSON.stringify(x.code))})">${esc(x.code)}</button>`).join('')}<button class="k" onclick="setCell(${i},'')" aria-label="${T2('Leave blank','خالی')}" title="${T2('Leave blank','خالی')}">${T2('Blank','خالی')}</button></div><details class="review-custom"><summary>${T2('Other symbol','علامت دیگر')}</summary><label>${T2('Custom shift code','علامت دلخواه')}<input class="ki" aria-label="${T2('Custom shift code','کد دلخواه شیفت')}" placeholder="${T2('Code','کد')}" dir="ltr" value="${esc(c.text)}" onchange="setCell(${i},nrm(this.value.trim()))"></label></details>${c.suggestion?`<small class="memory-note">${T2('Suggested from your corrections','پیشنهاد از اصلاحات شما')}</small>`:''}</div></div>`}).join('')
   +`<div class="review-pagination"><button class="p s" ${sc.reviewPage?'':'disabled'} onclick="sc.reviewPage--;render()">${T2('Previous','قبلی')}</button><span class="mu" aria-live="polite">${ids.length?T2('Compare with photo','با عکس مطابقت دهید'):T2('Review complete','بررسی کامل شد')}</span><button class="p s" ${sc.reviewPage<ids.length-1?'':'disabled'} onclick="sc.reviewPage++;render()">${T2('Next','بعدی')}</button></div><div class="sticky review-actions"><button class=p onclick="doImport(sc.importMates===true)">${T2('Save '+n+' shifts','ثبت '+n+' شیفت')}</button><label class="review-mates"><input type="checkbox" ${sc.importMates?'checked':''} onchange="sc.importMates=this.checked">${T2('Also read colleague shifts','شیفت‌های همکاران هم خوانده شوند')}</label><details><summary>${T2('More scan options','گزینه‌های بیشتر اسکن')}</summary><div class="row" style="gap:6px;margin-top:6px"><button class="p s" onclick="sc.cells=null;sc.pick=true;render()">Wrong row?</button><label class="p s"><input type=file accept="image/*" multiple hidden onchange="scanFile(this.files,true);this.value=''">Add another page</label></div></details></div>`};
async function doImport(all){const w=S.wps.find(x=>x.id===sc.wp),L=sc.cells.filter(c=>c.text);
  const bad=L.filter(c=>!parse(w,c.text)).length,unsure=sc.cells.filter(c=>cState(w,c)==='low').length;
  if(bad)return alert(T2(bad+' unknown codes. Fix them first.',bad+' علامت ناشناخته است. ابتدا آن‌ها را اصلاح کنید.'));
  if(sc.guess&&!confirm(T2('Dates were estimated. Have you verified every date against the photo?', 'تاریخ‌ها تخمینی هستند. آیا همهٔ تاریخ‌ها را با عکس مطابقت داده‌اید؟')))return;
  if(unsure&&!confirm(T2(`${unsure} uncertain cells (including possible blank cells). Import anyway?`,`${unsure} خانه نیاز به بررسی دارد (شامل خانه‌های احتمالاً خالی). ثبت شود؟`)))return;
  const change=beginChange('Roster import','برنامهٔ شیفت‌ها',['shifts','rosterDays','rosterPeriods','onboarding','ocrMemory']);const row=sc.rows[sc.ri];rememberExample('names',w.id,row.nameFeature,row.rawName||row.nm,sc.name);
  sc.cells.filter(c=>c.confirmed&&c.text&&parse(w,c.text)).forEach(c=>rememberExample('glyphs',w.id,c.feature,c.raw,c.text));
  const dates=sc.cells.map(c=>c.date).sort();if(dates.length){S.rosterPeriods=S.rosterPeriods||[];let start=dates[0],end=dates.at(-1);const overlapping=S.rosterPeriods.filter(p=>p.wp===w.id&&p.start<=end&&p.end>=start);for(const p of overlapping){start=start<p.start?start:p.start;end=end>p.end?end:p.end}S.rosterPeriods=S.rosterPeriods.filter(p=>!overlapping.includes(p));S.rosterPeriods.push({wp:w.id,start,end})}
  S.rosterDays=S.rosterDays||{};sc.cells.forEach(c=>S.rosterDays[w.id+'|'+c.date]=!sc.guess&&!['low','bad'].includes(cState(w,c))&&(!!c.text||c.confirmed===true));
  L.forEach((c,n)=>{const cs=parse(w,c.text);S.shifts=S.shifts.filter(h=>!(h.wp===w.id&&h.date===c.date));
    S.shifts.push({id:'s'+Date.now()+n,wp:w.id,date:c.date,text:c.text,review:sc.guess||cState(w,c)==='low',label:cs.map(x=>x.label).join(' + '),segs:makeSegs(c.date,cs)})});
  finishSetup(w.id);normalizeSavedOff();if(!await commitChange(change))return;sc.cells=null;if(all)readAll();else{killWk();go('agenda')}}

