// Builds the app from src/.
//   src/index.html   page shell (HTML, with markers for CSS and JS)
//   src/css/*.css    styles, joined in file-name order
//   src/js/*.js      code, joined in file-name order (all inside one function)
// Output: index.html (minified, what GitHub Pages serves).
// With --dev: also dev.html (joined but not minified, for testing; not committed).
// Usage: npm i terser csso && node tools/build.js [--dev]
const fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),src=path.join(root,'src');
// Light/dark setting: each "@media (prefers-color-scheme: dark)" block is kept for Automatic
// (but switched off when <html> has class "light") and copied once for <html class="dark">.
// :where() keeps the selectors' weight the same, so the cascade doesn't change.
function themeCss(css){
  const sel=(list,cond)=>list.split(',').map(s=>{s=s.trim();
    if(s.startsWith(':root'))return ':root:where('+cond+')'+s.slice(5);
    if(/^html\b/.test(s))return 'html:where('+cond+')'+s.slice(4);
    return ':where(html'+cond+') '+s;}).join(',');
  const rules=(inner,cond)=>inner.replace(/([^{}]+)\{([^{}]*)\}/g,(m,a,b)=>sel(a,cond)+'{'+b+'}');
  let out='',i=0;const re=/@media \(prefers-color-scheme: dark\) \{/g;let m;
  while((m=re.exec(css))){
    let j=m.index+m[0].length,d=1,k=j;while(d){if(css[k]==='{')d++;else if(css[k]==='}')d--;k++;}
    const inner=css.slice(j,k-1);
    out+=css.slice(i,m.index)+'@media (prefers-color-scheme: dark){'+rules(inner,':not(.light)')+'}\n'+rules(inner,'.dark');
    i=k;re.lastIndex=k;
  }
  return out+css.slice(i);
}
const join=d=>fs.readdirSync(path.join(src,d)).filter(f=>/\.(js|css)$/.test(f)).sort().map(f=>fs.readFileSync(path.join(src,d,f),'utf8')).join('');
(async()=>{
  const shell=fs.readFileSync(path.join(src,'index.html'),'utf8'),css=themeCss(join('css')),js=join('js');
  const full=shell.replace('/*@@CSS@@*/',()=>css).replace('/*@@JS@@*/',()=>js);
  if(process.argv.includes('--dev'))fs.writeFileSync(path.join(root,'dev.html'),full);
  const {minify}=require(process.env.TERSER||'terser'),csso=require(process.env.CSSO||'csso');
  const out=await minify(js,{compress:{passes:2},mangle:true,format:{comments:false}});
  const h=shell.replace('/*@@CSS@@*/',()=>csso.minify(css,{restructure:false}).css).replace('/*@@JS@@*/',()=>out.code).replace(/\n\s*\n/g,'\n');
  fs.writeFileSync(path.join(root,'index.html'),'<!-- Built from src/ by tools/build.js. Edit the files in src/, then rebuild. -->\n'+h);
  console.log('index.html:',full.length,'->',h.length,'bytes');
})().catch(e=>{console.error(e);process.exit(1)});
