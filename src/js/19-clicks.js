/* 19-clicks: Every button: one click handler routes data-a="action" to what it does. */
/* clicks */
document.addEventListener('click',function(e){
  var t=e.target.closest('[data-a]');if(!t)return;
  if(t.classList.contains('modal')&&e.target.closest('[data-stop]'))return;var a=t.dataset.a,v=t.dataset.v;if(S&&t.dataset.cat&&S.cats[t.dataset.cat])ui.cat=t.dataset.cat;var c=S?cat():null;
  if(a==='view'||a==='pick')e.preventDefault();
  if(a==='cat'){ui.cat=v;render()}
  else if(a==='hnew'){ui.pend=[];ui.pendFor='health';ui.sy={step:0,cat:'',t:'',d:today(),m:new Date().toTimeString().slice(0,5),n:''};ui.modal=symWiz;render()}
  else if(a==='syx'){ui.sy[t.dataset.k]=v;ui.sy.step++;render()}
  else if(a==='syback'){ui.sy.step--;render()}
  else if(a==='sygo'){ui.sy.step=+v;render()}
  else if(a==='sysave'){var y=ui.sy;if(!y.cat||!y.t)return;S.cats[y.cat].health.push({id:uid(),t:y.t,d:y.d||today(),m:y.m,n:(y.n||'').trim(),att:ui.pend||[]});ui.cat=y.cat;ui.pend=[];ui.pendFor=null;ui.sy=null;ui.modal=null;change()}
  else if(a==='cmback'){ui.cm.step--;render()}
  else if(a==='cmgo'){ui.cm.step=+v;render()}
  else if(a==='cnext'){var am0=parseFloat(String(ui.cs.amount).replace(',','.'));if(isNaN(am0)){var ai0=document.querySelector('[data-cs=amount]');if(ai0)ai0.style.borderColor='var(--bad)';return}ui.cs.step++;render()}
  else if(a==='cback'){ui.cs.step--;render()}
  else if(a==='cgo'){ui.cs.step=+v;render()}
  else if(a==='plopen'){ui.pl={type:'',min:0};ui.modal=playSheet;render()}
  else if(a==='plt'){ui.pl.type=v;render()}
  else if(a==='plm'){ui.pl.min=+v;render()}
  else if(a==='plsave'){var dp=day();dp.play[ui.pl.type]=(dp.play[ui.pl.type]||0)+ui.pl.min;ui.modal=null;ui.pl=null;change()}
  else if(a==='plstart'){if(tGet()){ui.modal=null;ui.pl=null;render();return}tSet({cat:ui.cat,type:ui.pl.type,start:Date.now(),dur:0});ui.modal=null;ui.pl=null;ui.open=ui.open||{};ui.open.tplayc=true;render()}
  else if(a==='pldel'){ui.modal=function(){return confirmBox('Remove today\'s '+v+' minutes?','pldel2',esc(v))};render()}
  else if(a==='pldel2'){var dq=day();delete dq.play[v];ui.modal=null;change()}
  else if(a==='xundo'){var xu=S.extraStock[+v];if(xu&&xu.prev){xu.qty=xu.prev.qty;xu.on=xu.prev.on;xu.need=xu.prev.need;delete xu.prev;change()}}
  else if(a==='xbought'){var xb=S.extraStock[+v];if(xb){xb.prev={qty:xb.qty,on:xb.on,need:!!xb.need,at:today()};xb.need=false;if(!xb.check&&(+xb.qty||0)<=0){xb.qty=1;xb.on=today()}change()}}
  else if(a==='xneed'){var xs=S.extraStock[+v];if(xs){xs.need=!xs.need;change()}}
  else if(a==='phdel'){ui.phd={k:t.dataset.k,v:v};ui.phPrev=ui.modal||null;ui.modal=function(){return'<div class="modal" data-a="phcancel"><div class="sheet" data-stop="2"><p style="font-weight:800;font-size:17px">Remove this photo or file?</p><div class="row"><button class="b" style="background:var(--bad);color:#fff" data-a="phdel2">Remove</button><button class="b" data-a="phcancel">Keep it</button></div></div></div>'};render()}
  else if(a==='phcancel'){ui.modal=ui.phPrev;ui.phPrev=null;ui.phd=null;render()}
  else if(a==='phdel2'){var P=ui.phd,keep=function(arr){return(arr||[]).filter(function(x){return(x.path||x.id)!==P.v})};
    if(P.k==='day'){var dd=day();dd.photos=keep(dd.photos)}else if(P.k==='pend')ui.pend=keep(ui.pend);else if(P.k==='v')ui.v.att=keep(ui.v.att);else if(P.k==='b')ui.b.att=keep(ui.b.att);else if(P.k.indexOf('info-')===0){var sc=P.k.slice(5);S.info[sc].att=keep(S.info[sc].att)}
    ui.modal=ui.phPrev;ui.phPrev=null;ui.phd=null;if(P.k==='day'||P.k.indexOf('info-')===0)change();else render()}
  else if(a==='calview'){ui.calView=v;render();window.scrollTo(0,0)}
  else if(a==='agall'){ui.agAll=!ui.agAll;render()}
  else if(a==='fper'){ui.fper=v;render()}
  else if(a==='qcat'){ui.qcat=v;ui.cat=v;render()}
  else if(a==='qsym'){ui.tab='health';ui.open=ui.open||{};ui.open.hform=true;render();var hf=document.getElementById('hform');if(hf)hf.scrollIntoView({block:'start'})}
  else if(a==='tab'){ui.tab=v;ui.modal=null;render();window.scrollTo(0,0)}
  else if(a==='day'){var nd=addDays(ui.day,+v);if(nd<=today()){ui.day=nd;render()}}
  else if(a==='mon'){var p=parse(ui.month+'-01');p.setMonth(p.getMonth()+(+v));ui.month=iso(p).slice(0,7);render()}
  else if(a==='open'){ui.calSel=v;ui.open=ui.open||{};ui.open.daypan=true;render()}
  else if(a==='openday'){ui.cat=t.dataset.k;ui.day=v;ui.tab='today';ui.modal=null;render();window.scrollTo(0,0)}
  else if(a==='calwho'){ui.calWho=v;render()}
  else if(a==='food'){var d=day();d.f[t.dataset.k]=Math.max(0,fmt((d.f[t.dataset.k]||0)+parseFloat(v)));change()}
  else if(a==='treat'){var d1=day();d1.treats=Math.max(0,(d1.treats||0)+(+v));change()}
  else if(a==='psel'){ui.psel=+v;render()}
  else if(a==='play'){var d2=day(),pt=S.playTypes[+t.dataset.k];d2.play[pt]=Math.max(0,(d2.play[pt]||0)+(+v));change()}
  else if(a==='morefoods'){ui.moreFoods=!ui.moreFoods;render()}
  else if(a==='mopen'){ui.mealKind=v;ui.meal={cat:ui.cat,fid:'',amt:'',rx:'all'};var ms=c.foods.filter(function(f){return f.main&&(v==='dry'?f.kind==='dry':f.kind!=='dry')});if(ms.length===1){ui.meal.fid=ms[0].id;if(v!=='dry')ui.meal.amt=1}ui.modal=mealSheet;render()}
  else if(a==='mfood'){ui.meal={cat:ui.cat,fid:v,amt:'',rx:'all'};var mf2=c.foods.filter(function(f){return f.id===v})[0];if(mf2&&mf2.kind!=='dry')ui.meal.amt=1;render()}
  else if(a==='mamt'){ui.meal.amt=parseFloat(v);render()}
  else if(a==='madd'){var ai3=document.getElementById('mamt');if(ai3)ui.meal.amt=ai3.value;var A3=ui.meal.add=ui.meal.add||[],ix=A3.indexOf(v);if(ix>=0)A3.splice(ix,1);else A3.push(v);render()}
  else if(a==='mrx'){var ai=document.getElementById('mamt');if(ai)ui.meal.amt=ai.value;ui.meal.rx=v;render()}
  else if(a==='usual'){var pv=String(v).split('|');logUsual(pv[0],pv[1])}
  else if(a==='vqadd'){var qi=document.getElementById('vq-'+ui.cat),qt=qi&&qi.value.trim();if(!qt){if(qi)qi.focus();return}var cq=S.cats[ui.cat];cq.vq=cq.vq||[];cq.vq.push({id:uid(),t:qt,d:today(),by:whoAmI()});change();toast('Added to '+cq.name+'\'s vet questions')}
  else if(a==='vqdone'){var cq2=S.cats[ui.cat];(cq2.vq||[]).forEach(function(x){if(x.id===v)x.done=!x.done});change()}
  else if(a==='vqdel'){var cq3=S.cats[ui.cat];cq3.vq=(cq3.vq||[]).filter(function(x){return x.id!==v});change()}
  else if(a==='rrnew'){if(ui.rrT)clearInterval(ui.rrT);ui.rr={k:ui.cat,taps:0,start:0,done:false};ui.modal=rrSheet;render()}
  else if(a==='rrtap'){var R=ui.rr;if(!R||R.done)return;if(!R.start){R.start=Date.now();ui.rrT=setInterval(function(){var left=30-Math.floor((Date.now()-R.start)/1000),el=document.getElementById('rrt');if(left<=0){clearInterval(ui.rrT);R.done=true;render();return}if(el)el.textContent=left+'s left'},250)}R.taps++;var ce=document.getElementById('rrc');if(ce)ce.textContent=R.taps}
  else if(a==='rrman'){var mv2=parseInt((document.getElementById('rrman')||{}).value,10);if(!(mv2>3&&mv2<150)){flash('rrman');return}if(ui.rrT)clearInterval(ui.rrT);ui.rr.taps=mv2/2;ui.rr.done=true;render()}
  else if(a==='rrx'){if(ui.rrT)clearInterval(ui.rrT);ui.rr=null;ui.modal=null;render()}
  else if(a==='rrsave'){var R2=ui.rr,cr=S.cats[R2.k];cr.rr=cr.rr||[];cr.rr.push({id:uid(),d:today(),m:nowHM(),bpm:Math.round(R2.taps*2),by:whoAmI()});ui.rr=null;ui.modal=null;change();celebrate()}
  else if(a==='rrdel'){['albert','milly'].forEach(function(k){var cr2=S.cats[k];if(cr2.rr)cr2.rr=cr2.rr.filter(function(x){return x.id!==v})});change()}
  else if(a==='bedok'){S.bed=S.bed||{};S.bed[nightOf()]=nowHM();change();celebrate();toast('Bedtime routine done',function(){delete S.bed[nightOf()];change()})}
  else if(a==='backup'){backup()}
  else if(a==='cidone'){try{localStorage.setItem(LS+'-ci',today())}catch(e){}render()}
  else if(a==='wsdone'){try{localStorage.setItem(LS+'-ws',today())}catch(e){}render()}
  else if(a==='ciapply'){var kk=t.dataset.k,old0=S.cats[kk].dryAllowance;setDry(kk,+v);change();toast(S.cats[kk].name+': dry now '+v+' g a day',function(){setDry(kk,old0);S.cats[kk].vet.pop();S.cats[kk].vet.pop();change()})}
  else if(a==='htab'){ui.htab=ui.htab||{};ui.htab[ui.cat]=v;render()}
  else if(a==='quick'){ui.modal=quickSheet;render()}
  else if(a==='qcat2'){ui.cat=v;render()}
  else if(a==='qmeal'){ui.modal=null;render();logUsual('both',v)}
  else if(a==='srch'){ui.modal=searchSheet;render();setTimeout(function(){var q=document.getElementById('qsrch');if(q)q.focus()},50)}
  else if(a==='badgeon'){if(window.Notification&&Notification.requestPermission)Notification.requestPermission().then(function(p){saveState=p==='granted'?'Badge on':'Badge needs notification permission';badge();render()});else{saveState='Not supported here';render()}}
  else if(a==='rmphoto'){delete S.cats[v].photo;change()}
  else if(a==='vrep'){ui.vrper=30;ui.modal=vetReport;render()}
  else if(a==='vrper'){ui.vrper=+v;render()}
  else if(a==='vrprint'){window.print()}
  else if(a==='vrshare'){var tx2=ui.vrtext||'';if(navigator.share)navigator.share({title:'Vet summary',text:tx2}).catch(function(){});else if(navigator.clipboard)navigator.clipboard.writeText(tx2).then(function(){alert('Copied')})}
  else if(a==='mlog'){
var ai2=document.getElementById('mamt'),M2=ui.meal,am=parseFloat(String(ai2?ai2.value:M2.amt).replace(',','.'));if(!M2||!M2.fid)return;if(!(am>0)){if(ai2){ai2.focus();ai2.style.borderColor='var(--bad)'}return}
    ui.modal=null;var d5=day();if(!d5.meals)d5.meals=[];var now=new Date(),tm=ui.day===today()?String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0'):'';
    d5.meals.push({id:uid(),f:M2.fid,a:am,rx:M2.rx,t:tm,who:(GH&&GH.who)||'',add:(M2.add||[]).slice()});(M2.add||[]).forEach(function(k){d5.checks[k]=true});
    if(M2.rx==='no'){if(!d5.waste)d5.waste={};d5.waste[M2.fid]=fmt((d5.waste[M2.fid]||0)+am)}else d5.f[M2.fid]=fmt((d5.f[M2.fid]||0)+am);
    if(!d5.react)d5.react={};d5.react[M2.fid]=M2.rx;ui.meal={cat:ui.cat,fid:'',amt:'',rx:'all'};change();celebrate()}
  else if(a==='mdel'){var d6=day(),m6=(d6.meals||[]).filter(function(m){return m.id===v})[0];if(!m6)return;d6.meals=d6.meals.filter(function(m){return m.id!==v});(m6.add||[]).forEach(function(k){if(!d6.meals.some(function(m){return(m.add||[]).indexOf(k)>=0}))d6.checks[k]=false});
    if(m6.rx==='no'){if(d6.waste)d6.waste[m6.f]=Math.max(0,fmt((d6.waste[m6.f]||0)-m6.a))}else d6.f[m6.f]=Math.max(0,fmt((d6.f[m6.f]||0)-m6.a));change()}
  else if(a==='chk'){var k=c.checks[+v],d3=day();d3.checks[k]=!d3.checks[k];change()}
  else if(a==='calc'){var A=num('wa'),B=num('wb');if(A&&B&&A>B)document.getElementById('wk').value=(A-B).toFixed(2)}
  else if(a==='wopen'){ui.modal=weighSheet;render()}
  else if(a==='addw2'){var W=ui.w,me=parseFloat(String(W.me).replace(',','.')),saved=0,bad=false;
    ['albert','milly'].forEach(function(k){var tot=parseFloat(String(W[k]).replace(',','.'));if(isNaN(tot))return;var cw=Math.round((tot-me)*100)/100;
      if(isNaN(me)||cw<1||cw>20){bad=true;return}var cc=S.cats[k];cc.weights=cc.weights.filter(function(x){return x.d!==W.d});cc.weights.push({d:W.d,kg:cw});saved++});
    if(bad){saveState='Check the numbers';render();return}if(!saved){flash(isNaN(me)?'me':'albert');return}
    ui.w={d:today(),me:'',albert:'',milly:'',direct:''};ui.modal=null;change()}
  else if(a==='addw'){var wkid=document.getElementById('wk-'+ui.cat)?'wk-'+ui.cat:'wk',kg=num(wkid),dd=(ui.w&&ui.w.d)||today();if(!kg||kg<1||kg>20){flash(wkid);return}
    c.weights=c.weights.filter(function(w){return w.d!==dd});c.weights.push({d:dd,kg:kg});ui.modal=null;change()}
  else if(a==='wedit'){var wo=c.weights.filter(function(x){return x.d===v})[0];ui.we={old:v,d:v,kg:String(wo.kg)};
    ui.modal=function(){return'<div class="modal" data-a="close"><div class="sheet" data-stop="1"><h2 style="margin-top:0">Edit '+esc(c.name)+'\'s weigh-in</h2><div class="grid2"><div><label class="l">Date</label><input type="date" data-we="d" value="'+ui.we.d+'" max="'+today()+'"></div><div><label class="l">Weight (kg)</label><input data-we="kg" inputmode="decimal" value="'+esc(ui.we.kg)+'"></div></div><div class="row" style="margin-top:14px"><button class="b p" data-a="wsave">Save</button><button class="b" data-a="close">Cancel</button></div></div></div>'};render()}
  else if(a==='wsave'){var we=ui.we,nk=parseFloat(String(we.kg).replace(',','.'));if(isNaN(nk)||nk<1||nk>20){var ki=document.querySelector('[data-we=kg]');if(ki)ki.style.borderColor='var(--bad)';return}
    c.weights=c.weights.filter(function(x){return x.d!==we.old&&x.d!==we.d});c.weights.push({d:we.d||we.old,kg:nk});ui.we=null;ui.modal=null;change()}
  else if(a==='delw'){ui.modal=function(){return confirmBox('Delete the weigh-in on '+short(v)+'?','delw2',v)};render()}
  else if(a==='delw2'){c.weights=c.weights.filter(function(w){return w.d!==v});ui.modal=null;change()}
  else if(a==='hedit'){var ho=c.health.filter(function(x){return x.id===v})[0];ui.hedit=v;ui.hf={t:ho.t,d:ho.d,m:ho.m,n:ho.n};ui.pend=ho.att||[];ui.pendFor='health';render();window.scrollTo(0,0)}
  else if(a==='hcancel'){ui.hedit=null;ui.hf={};ui.pend=[];ui.pendFor=null;render()}
  else if(a==='addh'){if(ui.hedit)c.health=c.health.filter(function(x){return x.id!==ui.hedit});c.health.push({id:ui.hedit||uid(),t:document.getElementById('ht').value,d:document.getElementById('hd').value||today(),m:document.getElementById('hm').value,n:document.getElementById('hn').value.trim(),att:ui.pendFor==='health'?ui.pend:[]});ui.pend=[];ui.pendFor=null;ui.hf={};ui.hedit=null;change()}
  else if(a==='delh'){ui.modal=function(){return confirmBox('Delete this symptom entry?','delh2',v)};render()}
  else if(a==='delh2'){c.health=c.health.filter(function(x){return x.id!==v});ui.modal=null;change()}
  else if(a==='fnew'){ui.pend=[];ui.pendFor='fight';var lastF=S.fights.slice().sort(function(a,b){return(a.d+a.m)<(b.d+b.m)?1:-1})[0];ui.f={d:today(),m:new Date().toTimeString().slice(0,5),sev:'',trig:[],where:'',who:'',sep:'',pher:lastF&&lastF.pher?lastF.pher:'',n:'',step:0};ui.modal=fightSheet;render()}
  else if(a==='fc'){var key=t.dataset.k,wz=ui.f.step!=null&&!ui.f.id;if(key==='trig'){var ix=ui.f.trig.indexOf(v);if(ix>=0)ui.f.trig.splice(ix,1);else ui.f.trig.push(v)}else ui.f[key]=wz?v:(ui.f[key]===v?'':v);if(wz&&key!=='trig')ui.f.step++;render()}
  else if(a==='fnext'){ui.f.step++;render()}
  else if(a==='fback'){ui.f.step--;render()}
  else if(a==='fgo'){ui.f.step=+v;render()}
  else if(a==='fedit'){var fo=S.fights.filter(function(x){return x.id===v})[0];ui.f=JSON.parse(JSON.stringify(fo));ui.f.trig=ui.f.trig||[];ui.f.n=ui.f.n||'';ui.pend=ui.f.att||[];ui.pendFor='fight';ui.modal=fightSheet;render()}
  else if(a==='fsave'){var f=ui.f;if(f.id)S.fights=S.fights.filter(function(x){return x.id!==f.id});S.fights.push({id:f.id||uid(),by:f.by||whoAmI(),d:f.d||today(),m:f.m,sev:f.sev,trig:f.trig,where:f.where,who:f.who,sep:f.sep,pher:f.pher,n:(f.n||'').trim(),att:ui.pend});ui.pend=[];ui.pendFor=null;ui.modal=null;ui.f=null;change()}
  else if(a==='delf'){ui.modal=function(){return confirmBox('Delete this fight entry?','delf2',v)};render()}
  else if(a==='delf2'){S.fights=S.fights.filter(function(x){return x.id!==v});ui.modal=null;change()}
  else if(a==='vnew'){ui.v={isNew:true,id:uid(),d:today(),clinic:'',reason:'',notes:'',next:'',email:'',att:[]};ui.modal=vetSheet;render()}
  else if(a==='vedit'){var o=c.vet.filter(function(x){return x.id===v})[0];ui.v=JSON.parse(JSON.stringify(o));ui.modal=vetSheet;render()}
  else if(a==='vsave'){var vv=ui.v,isNew=vv.isNew;delete vv.isNew;c.vet=c.vet.filter(function(x){return x.id!==vv.id});c.vet.push(vv);ui.v=null;ui.modal=null;change()}
  else if(a==='vdel'){var id=ui.v.id;ui.modal=function(){return confirmBox('Delete this vet note and its files?','vdel2',id)};render()}
  else if(a==='vdel2'){c.vet=c.vet.filter(function(x){return x.id!==v});ui.v=null;ui.modal=null;change()}
  else if(a==='vet'){ui.modal=function(){return'<div class="modal" data-a="close"><div class="sheet" data-stop="1"><h2 style="margin-top:0">Vet summary</h2><textarea id="vt" rows="12" readonly>'+esc(vetText())+'</textarea><div class="row" style="margin-top:10px"><button class="b p" data-a="copy">Copy</button><button class="b" data-a="close">Close</button></div></div></div>'};render()}
  else if(a==='copy'){var txt=vetText();(navigator.clipboard?navigator.clipboard.writeText(txt):Promise.reject()).then(function(){t.textContent='Copied ✓'}).catch(function(){var ta=document.getElementById('vt');ta.focus();ta.select();t.textContent='Selected, use Copy'})}
  else if(a==='view'){var isV=t.dataset.k==='video';ui.vprev=ui.modal||null;ui.modal=function(){return'<div class="modal pview" data-a="vclose"><div class="sheet viewer" data-stop="2">'+(isV?'<video data-phv="'+esc(v)+'" controls playsinline autoplay></video>':'<img data-ph="'+esc(v)+'" alt="">')+'<button class="b w" style="margin-top:12px" data-a="vclose">Close</button></div></div>'};render()}
  else if(a==='vclose'){ui.modal=ui.vprev||null;ui.vprev=null;render()}
  else if(a==='pick'){upTarget={kind:t.dataset.k,ref:t.dataset.v};var fi=document.getElementById('fileIn');fi.accept=t.dataset.acc||'image/*';fi.multiple=!t.dataset.cap;if(t.dataset.cap)fi.setAttribute('capture','environment');else fi.removeAttribute('capture');fi.value='';fi.click()}
  else if(a==='addfood2'){ui.cat=t.dataset.k;S.cats[ui.cat].foods.push({id:uid(),name:'New food',kind:'dry',kcal:370});change();ui.tab='settings';ui.modal=null;render();var fc=document.getElementById('foodscard');if(fc){var ins=fc.querySelectorAll('input[data-fk=name]');fc.scrollIntoView();var li=ins[ins.length-1];if(li){li.select&&li.select()}}}
  else if(a==='addfood'){c.foods.push({id:uid(),name:'New food',kind:'dry',kcal:370});change()}
  else if(a==='delfood'){if(c.foods.length>1){c.foods.splice(+v,1);change()}}
  else if(a==='lnew'){ui.pend=[];ui.pendFor='litter';var lday=(t.dataset.k==='today')?today():ui.day;ui.l={who:c.name,type:v,d:lday,m:lday===today()?new Date().toTimeString().slice(0,5):'',cons:'',amt:'Normal',smell:'Normal',extra:[],n:'',step:0};var recL=S.litter.filter(function(x){return x.type===v&&x.who===c.name}).sort(function(a,b){return(a.d+(a.m||''))<(b.d+(b.m||''))?1:-1}).slice(0,5),prevL=recL[0];function modeL(f,dflt){var m={},best=dflt,bn=0;recL.forEach(function(x){var q=x[f]||dflt;if(!q)return;m[q]=(m[q]||0)+1;if(m[q]>bn){bn=m[q];best=q}});return best}if(prevL){ui.l.cons=modeL('cons','');ui.l.amt=modeL('amt','Normal');ui.l.smell=modeL('smell','Normal');if(v!=='Poo'||ui.l.cons){ui.l.step=99;ui.l.pre=1}}ui.modal=litterSheet;render()}
  else if(a==='lc'){var lk=t.dataset.k;if(lk==='extra'){var li=ui.l.extra.indexOf(v);if(li>=0)ui.l.extra.splice(li,1);else ui.l.extra.push(v)}else if(lk==='type'||lk==='who')ui.l[lk]=v;else ui.l[lk]=(ui.l.step!=null&&!ui.l.id)?v:(ui.l[lk]===v?'':v);if(lk==='type'&&v==='Pee')ui.l.cons='';if(ui.l.step!=null&&!ui.l.id&&lk!=='extra'&&ui.l[lk])ui.l.step++;render()}
  else if(a==='lnext'){ui.l.step++;render()}
  else if(a==='lback'){ui.l.step--;render()}
  else if(a==='lgo'){ui.l.step=+v;render()}
  else if(a==='ledit'){var lo=S.litter.filter(function(x){return x.id===v})[0];ui.l=JSON.parse(JSON.stringify(lo));ui.l.extra=ui.l.extra||[];ui.pend=ui.l.att||[];ui.pendFor='litter';ui.modal=litterSheet;render()}
  else if(a==='lsave'){var l=ui.l;if(l.id)S.litter=S.litter.filter(function(x){return x.id!==l.id});S.litter.push({id:l.id||uid(),by:l.by||whoAmI(),who:l.who,type:l.type,d:l.d||today(),m:l.m,cons:l.cons,amt:l.amt,smell:l.smell,extra:l.extra,n:(l.n||'').trim(),att:ui.pend});ui.pend=[];ui.pendFor=null;ui.l=null;ui.modal=null;change();celebrate()}
  else if(a==='ldel'){ui.modal=function(){return confirmBox('Delete this entry?','ldel2',v)};render()}
  else if(a==='ldel2'){S.litter=S.litter.filter(function(x){return x.id!==v});ui.modal=null;change()}
  else if(a==='bnew'){ui.b={isNew:true,id:uid(),cats:['Albert','Milly'],from:'',to:'',place:'',cost:'',status:'',notes:'',att:[]};ui.modal=bookSheet;render()}
  else if(a==='bedit'){var bk0=S.info.bookings.filter(function(x){return x.id===v})[0];if(!bk0)return;ui.b=JSON.parse(JSON.stringify(bk0));if(!Array.isArray(ui.b.att))ui.b.att=[];ui.modal=bookSheet;render()}
  else if(a==='bcat'){var bi=ui.b.cats.indexOf(v);if(bi>=0)ui.b.cats.splice(bi,1);else ui.b.cats.push(v);render()}
  else if(a==='bsave'){var bb=ui.b;if(!bb.from){var fi2=document.querySelector('[data-bf=from]');if(fi2)fi2.style.borderColor='var(--bad)';return}if(!bb.to)bb.to=bb.from;delete bb.isNew;S.info.bookings=S.info.bookings.filter(function(x){return x.id!==bb.id});S.info.bookings.push(bb);ui.b=null;ui.modal=null;change()}
  else if(a==='bdel'){ui.modal=function(){return confirmBox('Delete this booking?','bdel2',v)};render()}
  else if(a==='bdel2'){S.info.bookings=S.info.bookings.filter(function(x){return x.id!==v});ui.modal=null;change()}
  else if(a==='tnew'){if(tGet()){return}tSet({cat:ui.cat,type:S.playTypes[+t.dataset.k],start:Date.now(),dur:0});render()}
  else if(a==='tstart'){try{actx=actx||new (window.AudioContext||window.webkitAudioContext)();actx.resume()}catch(er){}tSet({cat:ui.cat,type:S.playTypes[ui.tk],start:Date.now(),dur:+v});ui.modal=null;render()}
  else if(a==='tstop'){var T=tGet();if(T){var mins=Math.max(1,Math.round((Date.now()-T.start)/60000));if(T.dur)mins=Math.min(mins,T.dur);tLog(T,mins)}}
  else if(a==='tcancel'){tSet(null);render()}
  else if(a==='tedit'){ui.edit=ui.edit||{};var ae=document.activeElement;if(ae&&ae.blur)ae.blur();ui.edit[v]=!ui.edit[v];render()}
  else if(a==='tadd'){var tx=document.getElementById('tdtext').value.trim();if(!tx){flash('tdtext');return}S.todos.push({id:uid(),text:tx,done:false,due:document.getElementById('tddue').value||''});change()}
  else if(a==='tdone'){S.todos.forEach(function(x){if(x.id===v)x.done=!x.done});change()}
  else if(a==='tdel'){S.todos=S.todos.filter(function(x){return x.id!==v});change()}
  else if(a==='gobuy'){var bs=document.getElementById('buysoon');if(bs){bs.scrollIntoView({behavior:'smooth',block:'start'});bs.style.transition='box-shadow .3s';bs.style.boxShadow='0 0 0 3px var(--bad)';setTimeout(function(){bs.style.boxShadow=''},1500)}}
  else if(a==='restock'){var rp=v.split('|');ui.rs={k:rp[0],id:rp[1]};ui.modal=restockSheet;render()}
  else if(a==='rsq'){document.getElementById('rsamt').value=v}
  else if(a==='rssave'){var add=parseFloat(String(document.getElementById('rsamt').value).replace(',','.'));if(isNaN(add)||add<=0){flash('rsamt');return}var ff=S.cats[ui.rs.k].foods.filter(function(x){return x.id===ui.rs.id})[0],cur=stockOf(ui.rs.k,ff);setStock(ui.rs.k,ui.rs.id,(cur?cur.rem:0)+add);var pr=parseFloat(String(document.getElementById('rsprice').value).replace(',','.'));if(!isNaN(pr)&&pr>0)S.costs.push({id:uid(),d:today(),who:ui.rs.k,cat:'Food',amount:pr,reimb:0,desc:ff.name+(ff.kind==='dry'?' '+(add>=1000?add/1000+' kg':add+' g'):' ×'+add),n:''});ui.modal=null;change()}
  else if(a==='trnew'){var lt0=lastTreat(c,v);ui.tr={type:v,product:lt0?lt0.product:'',dose:lt0?lt0.dose:'',d:today(),next:TT[v].days?addDays(today(),TT[v].days):'',n:''};ui.modal=treatSheet;render()}
  else if(a==='tredit'){ui.tr=JSON.parse(JSON.stringify(c.treat.filter(function(x){return x.id===v})[0]));ui.modal=treatSheet;render()}
  else if(a==='trint'){if(ui.tr){ui.tr.next=addDays(ui.tr.d||today(),+v);render()}}
  else if(a==='trsave'){var tr=ui.tr;if(tr.id)c.treat=c.treat.filter(function(x){return x.id!==tr.id});c.treat.push({id:tr.id||uid(),type:tr.type,product:(tr.product||'').trim(),dose:(tr.dose||'').trim(),d:tr.d||today(),next:tr.next||'',n:(tr.n||'').trim()});ui.tr=null;ui.modal=null;change()}
  else if(a==='trdel'){ui.modal=function(){return confirmBox('Delete this treatment?','trdel2',v)};render()}
  else if(a==='trdel2'){c.treat=c.treat.filter(function(x){return x.id!==v});ui.modal=null;change()}
  else if(a==='fwho'){ui.fwho=v;render()}
  else if(a==='fmon'){var fp=parse((ui.fmonth||today().slice(0,7))+'-01');fp.setMonth(fp.getMonth()+(+v));ui.fmonth=iso(fp).slice(0,7);if(ui.fmonth>today().slice(0,7))ui.fmonth=today().slice(0,7);render()}
  else if(a==='cnew'){ui.cs={step:0,amount:'',d:today(),desc:'',cat:'',who:ui.fwho&&ui.fwho!=='both'?ui.fwho:'both',reimb:'',n:'',planned:false};ui.modal=costSheet;render()}
  else if(a==='cedit'){v=String(v).split('@')[0];ui.cs=JSON.parse(JSON.stringify(S.costs.filter(function(x){return x.id===v})[0]));ui.modal=costSheet;render()}
  else if(a==='ccx'){if(t.dataset.k==='planned')ui.cs.planned=!ui.cs.planned;else if(t.dataset.k==='rep')ui.cs.rep=ui.cs.rep==='monthly'?'':'monthly';else{ui.cs[t.dataset.k]=v;if(!ui.cs.id&&ui.cs.step!=null&&(t.dataset.k==='cat'||t.dataset.k==='who'))ui.cs.step++}render()}
  else if(a==='csave'){var cx=ui.cs,am=parseFloat(String(cx.amount).replace(',','.'));if(isNaN(am)){var ai=document.querySelector('[data-cs=amount]');if(ai)ai.style.borderColor='var(--bad)';return}var rb=parseFloat(String(cx.reimb||'').replace(',','.'));
    if(cx.id)S.costs=S.costs.filter(function(x){return x.id!==cx.id});S.costs.push({id:cx.id||uid(),d:cx.d||today(),who:cx.who,cat:cx.cat,amount:am,reimb:isNaN(rb)?0:rb,desc:(cx.desc||'').trim(),n:(cx.n||'').trim(),planned:cx.rep==='monthly'?false:!!cx.planned,claim:cx.claim||undefined,rep:cx.rep==='monthly'?'monthly':undefined,until:cx.rep==='monthly'?cx.until:undefined});ui.cs=null;ui.modal=null;change()}
  else if(a==='cdel'){if(String(v).indexOf('@')>0){var tv=String(v).split('@')[0];ui.modal=function(){return confirmBox('Stop this monthly cost from today? Past months stay in the totals.','cstop',tv)};render()}else{ui.modal=function(){return confirmBox('Delete this cost?','cdel2',v)};render()}}
  else if(a==='cstop'){S.costs.forEach(function(x){if(x.id===v)x.until=today()});ui.modal=null;change()}
  else if(a==='cdel2'){S.costs=S.costs.filter(function(x){return x.id!==v});ui.modal=null;change()}
  else if(a==='calmnew'){ui.pend=[];ui.pendFor='calm';ui.cm={step:0,d:today(),m:new Date().toTimeString().slice(0,5),what:'',n:''};ui.modal=calmSheet;render()}
  else if(a==='cmx'){ui.cm.what=v;if(ui.cm.step!=null&&ui.cm.step===0)ui.cm.step++;render()}
  else if(a==='cmsave'){var cm=ui.cm;S.calm.push({id:uid(),by:whoAmI(),d:cm.d||today(),m:cm.m,what:cm.what,n:(cm.n||'').trim(),att:ui.pend||[]});ui.cm=null;ui.modal=null;change();celebrate()}
  else if(a==='ghwho'){ui.who=v;var tk=document.getElementById('ghtok').value;render();document.getElementById('ghtok').value=tk}
  else if(a==='ghconnect'){var tok=document.getElementById('ghtok').value.trim(),rp=(document.getElementById('ghrepo')?document.getElementById('ghrepo').value:'martinaregan/albert-milly-data').trim().split('/');
    if(!tok){ui.gherr='Paste your access key first.';render();return}var cand={token:tok,owner:rp[0],repo:rp[1],who:ui.who||'Me'};var keep=GH;GH=cand;document.getElementById('gherr').textContent='Connecting…';
    pull().then(function(p){try{localStorage.setItem(LS+'-gh',JSON.stringify(GH))}catch(e){}ui.gherr='';S=null;BASE=null;SHA=null;dirty=false;if(p){S=p.data;migrate();BASE=p.data;SHA=p.sha;dirty=!eq(S,BASE);persist()}setStatus('Synced');render();if(dirty)push()})
    .catch(function(e){GH=keep;ui.gherr=keyErr(e);render()})}
  else if(a==='syncnow'){setStatus('Syncing…');sync().then(function(){if(dirty)push()})}
  else if(a==='ghout'){ui.modal=function(){return confirmBox('Disconnect this phone? Your data stays safe in GitHub; you\'ll need the access key to reconnect.','ghout2','x')};render()}
  else if(a==='ghout2'){try{localStorage.removeItem(LS+'-gh');localStorage.removeItem(LS+'-cache')}catch(e){}GH=null;S=null;ui.modal=null;render()}
  else if(a==='close'){ui.modal=null;ui.f=null;render()}
});
function confirmBox(msg,act,v){var lab=act==='ghout2'?'Disconnect':act==='cstop'?'Stop':'Delete';return'<div class="modal" data-a="close"><div class="sheet" data-stop="1"><p>'+esc(msg)+'</p><div class="row"><button class="b" style="background:var(--bad);color:#fff" data-a="'+act+'" data-v="'+v+'">'+lab+'</button><button class="b" data-a="close">Cancel</button></div></div></div>'}
function num(id){var x=parseFloat(String(document.getElementById(id).value).replace(',','.'));return isNaN(x)?null:x}
function flash(id){var el=document.getElementById(id)||document.querySelector('[data-w="'+id+'"]');if(!el)return;el.style.borderColor='var(--bad)';el.focus()}

