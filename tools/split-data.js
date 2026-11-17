// Splits a data.json into one file per area (or joins them back), using the app's own code in src/js/01a-split.js.
//   node tools/split-data.js split <data.json> <output folder>
//   node tools/split-data.js join <folder> <data.json>
//   node tools/split-data.js check <data.json>      (splits, joins, and checks nothing was lost)
const fs=require('fs'),path=require('path');
const src=fs.readFileSync(path.join(__dirname,'..','src','js','01a-split.js'),'utf8');
const {splitData,joinData}=new Function(src+'\nreturn {splitData:splitData,joinData:joinData};')();
// Same content whatever order the keys are in.
const canon=x=>Array.isArray(x)?x.map(canon):x&&typeof x==='object'?Object.keys(x).sort().reduce((o,k)=>(o[k]=canon(x[k]),o),{}):x;
const same=(a,b)=>JSON.stringify(canon(a))===JSON.stringify(canon(b));
const [mode,a,b]=process.argv.slice(2);
if(mode==='split'||mode==='check'){
  const data=JSON.parse(fs.readFileSync(a,'utf8')),files=splitData(data);
  if(!same(joinData(JSON.parse(JSON.stringify(files))),data)){console.error('Split then join does not give the same data back');process.exit(1);}
  if(mode==='check'){console.log('ok:',Object.keys(files).sort().join(', '));process.exit(0);}
  fs.mkdirSync(b,{recursive:true});
  for(const f of Object.keys(files)){fs.writeFileSync(path.join(b,f),JSON.stringify(files[f],null,1));console.log(f,fs.statSync(path.join(b,f)).size,'bytes');}
}else if(mode==='join'){
  const files={};
  for(const f of fs.readdirSync(a))if(/\.json$/.test(f)&&f!=='data.json')files[f]=JSON.parse(fs.readFileSync(path.join(a,f),'utf8'));
  fs.writeFileSync(b,JSON.stringify(joinData(files),null,1));console.log('wrote',b);
}else{console.error('usage: split <data.json> <folder> | join <folder> <data.json> | check <data.json>');process.exit(1);}
