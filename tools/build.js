// Builds ../index.html (minified) from ../src/index.html (readable source).
// Usage: node tools/build.js   (needs: npm i terser csso)
const fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..');
const {minify}=require(process.env.TERSER||'terser');
const csso=require(process.env.CSSO||'csso');
(async()=>{
  let h=fs.readFileSync(path.join(root,'src/index.html'),'utf8');
  const before=h.length;
  // CSS
  h=h.replace(/(<style[^>]*>)([\s\S]*?)(<\/style>)/g,(m,a,css,b)=>a+csso.minify(css,{restructure:false}).css+b);
  // JS
  const parts=[];h=h.replace(/(<script id="app">)([\s\S]*?)(<\/script>)/,(m,a,js,b)=>{parts.push(js);return a+'@@JS@@'+b});
  const out=await minify(parts[0],{compress:{passes:2},mangle:true,format:{comments:false}});
  h=h.replace('@@JS@@',()=>out.code);
  h=h.replace(/\n\s*\n/g,'\n');
  fs.writeFileSync(path.join(root,'index.html'),'<!-- Built from src/index.html by tools/build.js. Edit the source, then rebuild. -->\n'+h);
  console.log('index.html',before,'->',h.length,'bytes');
})().catch(e=>{console.error(e);process.exit(1)});
