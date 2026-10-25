/* FoxiOra's supervised symbol model. Static weights; only confirmed corrections
   enter local example memory. No network training, uploads or generated labels. */
const GLYPH_ASSET={"file":"models/foxiora-glyph-v1.json","bytes":207357,"sha256":"1e59e1f2f18da4afdb5a2e25dc6426a8ef83fed507dd8b25204b8545825db699"};
let glyphModelPromise=null,glyphModelFailed=false;
function decodeGlyphModel(data){
 const shapes={'c1.weight':[8,1,3,3],'c1.bias':[8],'c2.weight':[16,8,3,3],'c2.bias':[16],'d1.weight':[64,577],'d1.bias':[64],'out.weight':[8,64],'out.bias':[8]};
 if(data?.format!=='FoxiOraGlyph-v1'||data.architecture!=='cnn'||JSON.stringify(data.classes)!==JSON.stringify(['-','D','DE','DN','E','M','N','X'])||!Number.isFinite(data.temperature)||data.temperature<=0||!(data.threshold>=.98&&data.threshold<1))throw Error('Invalid symbol model');
 const weights={};for(const [key,shape]of Object.entries(shapes)){const entry=data.weights?.[key];if(JSON.stringify(entry?.shape)!==JSON.stringify(shape)||typeof entry?.data!=='string')throw Error('Invalid model tensor');const bytes=Uint8Array.from(atob(entry.data),c=>c.charCodeAt(0));if(bytes.length!==shape.reduce((a,b)=>a*b,1)*4)throw Error('Invalid tensor size');const view=new DataView(bytes.buffer);weights[key]=Float32Array.from({length:bytes.length/4},(_,i)=>view.getFloat32(i*4,true));if(weights[key].some(v=>!Number.isFinite(v)))throw Error('Invalid tensor value')}
 for(const code of data.classes.filter(c=>c!=='X'))if(!Number.isFinite(data.thresholds?.[code])||data.thresholds[code]<.8||data.thresholds[code]>1)throw Error('Invalid symbol threshold');
 return{weights,classes:data.classes,temperature:data.temperature,threshold:data.threshold,thresholds:data.thresholds}
}
function glyphConvPool(input,width,channels,outChannels,weights,bias){const size=width>>1,out=new Float32Array(outChannels*size*size);for(let oc=0;oc<outChannels;oc++)for(let y=0;y<size;y++)for(let x=0;x<size;x++){let best=0;for(let py=0;py<2;py++)for(let px=0;px<2;px++){let sum=bias[oc];const cy=2*y+py,cx=2*x+px;for(let ic=0;ic<channels;ic++)for(let ky=0;ky<3;ky++){const iy=cy+ky-1;if(iy<0||iy>=width)continue;for(let kx=0;kx<3;kx++){const ix=cx+kx-1;if(ix<0||ix>=width)continue;sum+=input[ic*width*width+iy*width+ix]*weights[((oc*channels+ic)*3+ky)*3+kx]}}if(sum>best)best=sum}out[oc*size*size+y*size+x]=best}return out}
function glyphDense(input,weights,bias,relu=false){return Float32Array.from(bias,(b,i)=>{let sum=b;for(let j=0;j<input.length;j++)sum+=input[j]*weights[i*input.length+j];return relu?Math.max(0,sum):sum})}
function predictGlyph(model,feature){
 if(!feature||!/[1-9a-f]/i.test(feature.bits)||!/^[\da-f]{576}$/i.test(feature.bits)||!Number.isFinite(feature.aspect)||feature.aspect<=0)return null;
 const input=Float32Array.from(feature.bits,c=>parseInt(c,16)/15),w=model.weights,a=glyphConvPool(input,24,1,8,w['c1.weight'],w['c1.bias']),b=glyphConvPool(a,12,8,16,w['c2.weight'],w['c2.bias']),flat=new Float32Array(577);flat.set(b);flat[576]=Math.max(-2.5,Math.min(2.5,Math.log(feature.aspect)))/2.5;const hidden=glyphDense(flat,w['d1.weight'],w['d1.bias'],true),logits=glyphDense(hidden,w['out.weight'],w['out.bias']),largest=Math.max(...logits),scores=Array.from(logits,v=>Math.exp((v-largest)/model.temperature)),sum=scores.reduce((a,b)=>a+b,0),probabilities=scores.map(v=>v/sum),index=probabilities.indexOf(Math.max(...probabilities));return{text:model.classes[index],confidence:probabilities[index],threshold:model.thresholds[model.classes[index]]??model.threshold,proposalThreshold:model.threshold,probabilities}
}
async function loadGlyphModel(){if(glyphModelFailed)return null;if(!glyphModelPromise)glyphModelPromise=(async()=>{try{const response=await getOCRAsset(GLYPH_ASSET);return decodeGlyphModel(await response.json())}catch{glyphModelFailed=true;return null}})();return glyphModelPromise}
function applyGlyphOpinion(w,base,opinion){
 if(!opinion||base.rememberedExact||base.blank)return base;
 const trained=['-','D','DE','DN','E','M','N'];if(base.text&&!trained.includes(base.text))return base;
 if(opinion.text==='X'&&opinion.confidence>=.8)return{...base,uncertain:true,c:Math.min(70,base.c),neural:'X'};
 if(opinion.threshold>=1||opinion.confidence<opinion.threshold||!trained.includes(opinion.text)||!parse(w,opinion.text))return base;
 if(base.text&&base.text!==opinion.text)return{...base,uncertain:true,c:Math.min(70,base.c),neural:opinion.text};
 // Keep the existing low-resolution caution and untrained short-night code.
 if(base.text===opinion.text&&base.c>=70&&base.text!=='N'&&base.expert===base.text)return{...base,c:90,uncertain:false,neural:opinion.text};
 if(!base.text&&opinion.confidence>=(opinion.proposalThreshold??.992))return{...base,text:opinion.text,c:70,uncertain:true,neural:opinion.text};
 return{...base,neural:opinion.text}
}
async function recognizeShift(w,worker,x0,y0,x1,y1){const base=await recognizeOCRShift(w,worker,x0,y0,x1,y1);if(base.rememberedExact||base.blank||!base.feature||!specialistSupports(w))return base;const model=await loadGlyphModel();return model?applyGlyphOpinion(w,base,predictGlyph(model,base.feature)):base}
function confirmedGlyphExport(){return{format:'FoxiOra-confirmed-glyphs-v1',model:'FoxiOraGlyph-v1',examples:memoryStore().glyphs.filter(x=>x.feature&&x.label).map(x=>({feature:x.feature,label:x.label,raw:x.raw||'',at:x.at}))}}
function exportGlyphCorrections(){const url=URL.createObjectURL(new Blob([JSON.stringify(confirmedGlyphExport())],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='FoxiOra-confirmed-symbols.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
