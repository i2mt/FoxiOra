const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const path=require('node:path');
const {parseHTML}=require('linkedom');
const {createCanvas}=require('@napi-rs/canvas');
const root=path.resolve(__dirname,'..');
function app(options={}){
 const {document}=parseHTML(fs.readFileSync(path.join(root,'index.html'),'utf8'));
 const create=document.createElement.bind(document);
 document.createElement=(tag)=>tag==='canvas'?createCanvas(1,1):create(tag);
 const dlg=document.querySelector('#dlg');dlg.open=false;dlg.showModal=()=>dlg.open=true;dlg.close=()=>dlg.open=false;
 const context=vm.createContext({document,NodeFilter:{SHOW_TEXT:4},Intl,Date,console,setTimeout,clearTimeout,URL,Uint8Array,Uint32Array,Int32Array,Float64Array,Math,Map,Set,indexedDB:options.indexedDB,navigator:{},location:{href:'http://localhost/'},window:{},alert:()=>{},confirm:()=>true,prompt:()=>null});
 for(const file of ['calendar-data.js','ocr-memory.js','app.js']){
  let source=fs.readFileSync(file==='app.js'&&options.source?options.source:path.join(root,file),'utf8');
  if(file==='app.js')source=source.slice(0,source.indexOf('(async()=>{try{loadingProgress(12,'));
  vm.runInContext(source,context,{filename:file});
 }
 const run=code=>vm.runInContext(code,context);
 run(`S.wps=[{id:'w1',name:'مرکز درمانی A',color:'#3b82f6',codes:decCodes(DEF.map(d=>d.join('|')).join('\\n'))}];sel='2026-10-04';cm=new Date(sel+'T00:00');`);
 if(!options.indexedDB)run('save=async()=>{}');
 const runAsync=code=>vm.runInContext('(async()=>{'+code+'})()',context);return {run,runAsync,document,context};
}
function fixture(text,{faint=false,dash=false,blank=false,grid=false}={}){
 const cv=createCanvas(120,80),ctx=cv.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,120,80);
 if(grid){ctx.strokeStyle='#111';ctx.lineWidth=2;ctx.strokeRect(10,10,100,60)}
 ctx.fillStyle=faint?'#c8c8c8':'#111';
 if(dash)ctx.fillRect(48,40,22,2);
 else if(!blank){ctx.font='bold 30px sans-serif';ctx.fillText(text,47,52)}
 return cv;
}
module.exports={app,fixture};
