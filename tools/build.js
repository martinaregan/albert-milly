// Builds the app from src/.
//   src/index.html   page shell (HTML, with markers for CSS and JS)
//   src/css/*.css    styles, joined in file-name order
//   src/js/*.js      code, joined in file-name order (all inside one function)
// Output: index.html (minified, what GitHub Pages serves).
// With --dev: also dev.html (joined but not minified, for testing; not committed).
// Usage: npm i terser csso && node tools/build.js [--dev]
const fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),src=path.join(root,'src');
const join=d=>fs.readdirSync(path.join(src,d)).filter(f=>/\.(js|css)$/.test(f)).sort().map(f=>fs.readFileSync(path.join(src,d,f),'utf8')).join('');
(async()=>{
  const shell=fs.readFileSync(path.join(src,'index.html'),'utf8'),css=join('css'),js=join('js');
  const full=shell.replace('/*@@CSS@@*/',()=>css).replace('/*@@JS@@*/',()=>js);
  if(process.argv.includes('--dev'))fs.writeFileSync(path.join(root,'dev.html'),full);
  const {minify}=require(process.env.TERSER||'terser'),csso=require(process.env.CSSO||'csso');
  const out=await minify(js,{compress:{passes:2},mangle:true,format:{comments:false}});
  const h=shell.replace('/*@@CSS@@*/',()=>csso.minify(css,{restructure:false}).css).replace('/*@@JS@@*/',()=>out.code).replace(/\n\s*\n/g,'\n');
  fs.writeFileSync(path.join(root,'index.html'),'<!-- Built from src/ by tools/build.js. Edit the files in src/, then rebuild. -->\n'+h);
  console.log('index.html:',full.length,'->',h.length,'bytes');
})().catch(e=>{console.error(e);process.exit(1)});
