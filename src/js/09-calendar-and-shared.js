/* 09-calendar-and-shared: Open/closed sections, fight log, cat faces (spot), the Calendar tab and day panel. */
var SEVC={'Stare / stalk':'#b8a6ff','Chase / hiss':'#8b6cff','Bite':'#e0703a','Full fight':'#d23b3b'},SEVN={'Stare / stalk':1,'Chase / hiss':2,'Bite':3,'Full fight':4};
function isOpen(k,def){ui.open=ui.open||{};return(k in ui.open?ui.open[k]:def)?' open':''}
function wkStart(d){var x=parse(d),n=(x.getDay()+6)%7;x.setDate(x.getDate()-n);return x.getFullYear()+'-'+('0'+(x.getMonth()+1)).slice(-2)+'-'+('0'+x.getDate()).slice(-2)}
function topOf(arr){var m={};arr.forEach(function(v){if(v)m[v]=(m[v]||0)+1});var k=Object.keys(m).sort(function(a,b){return m[b]-m[a]});return k.length?k[0]+(m[k[0]]>1?' ×'+m[k[0]]:''):''}
function fightLog(F){
  if(!F.length)return'<div class="card"><h2>Log</h2><span class="mute">Nothing logged yet</span></div>';
  var all=F.filter(function(f){return f.d}).slice().sort(function(a,b){return(a.d+a.m)<(b.d+b.m)?1:-1});
  var tw=wkStart(today()),lw=addDays(tw,-7),cT=0,cL=0;all.forEach(function(f){var w=wkStart(f.d);if(w===tw)cT++;else if(w===lw)cL++});
  var diff=cT-cL,trend=diff>0?'<span style="color:#e0703a">▲ '+diff+' vs last week</span>':diff<0?'<span style="color:#5cb85c">▼ '+(-diff)+' vs last week</span>':'<span class="mute">same as last week</span>';
  var groups=[],gi={};all.forEach(function(f){var w=wkStart(f.d);if(!(w in gi)){gi[w]=groups.length;groups.push({w:w,items:[]})}groups[gi[w]].items.push(f)});
  var h='<details class="card flog" data-open="flog"'+isOpen('flog',false)+'><summary><div class="row between" style="flex:1"><h2 style="margin:0">Log</h2><span class="small">'+all.length+' total</span></div><div class="small" style="margin-top:4px">This week <b>'+cT+'</b> · '+trend+'</div></summary>';
  groups.forEach(function(g,i){
    var it=g.items,worst=it.reduce(function(m,f){return Math.max(m,SEVN[f.sev]||0)},0);
    var bites=it.filter(function(f){return(SEVN[f.sev]||0)>=3}).length;
    var trig=topOf([].concat.apply([],it.map(function(f){return f.trig||[]})));
    var lbl=g.w===tw?'This week':g.w===lw?'Last week':'Week of '+short(g.w);
    h+='<details class="fwk" data-open="fwk'+g.w+'"'+isOpen('fwk'+g.w,i===0)+'><summary><div style="flex:1"><div class="row between"><b>'+lbl+'</b><span class="small">'+it.length+(it.length===1?' incident':' incidents')+'</span></div>'+
      '<div class="row between" style="margin-top:4px"><span>'+it.slice().reverse().map(function(f){return'<span class="sevdot" style="background:'+(SEVC[f.sev]||'#999')+'"></span>'}).join('')+'</span><span class="mute small">'+(bites?bites+(bites>1?' bites':' bite')+' or worse':'no bites')+'</span></div>'+
      (trig?'<div class="mute small" style="margin-top:2px">Top trigger: '+esc(trig)+'</div>':'')+'</div></summary>';
    it.forEach(function(f){
      var who=f.who==='Albert'?spot('albert'):f.who==='Milly'?spot('milly'):'<span style="width:30px;text-align:center;font-size:20px">❔</span>';
      var sub=(f.trig||[])[0]||f.where||'';
      h+='<details class="fit" data-open="fit'+f.id+'"'+isOpen('fit'+f.id,false)+'><summary><div class="fl" style="flex:1;align-items:center">'+who+'<div style="flex:1;min-width:0"><div class="row between"><b><span class="sevdot" style="background:'+(SEVC[f.sev]||'#999')+'"></span>'+esc(f.sev||'Fight')+'</b><span class="mute small">'+short(f.d)+' '+esc(f.m||'')+'</span></div>'+(sub?'<div class="mute small ell">'+esc(sub)+'</div>':'')+'</div></div></summary>'+
        '<div class="fbody"><div class="small">'+esc([f.who?'Started by '+f.who:'',(f.trig||[]).join(', '),f.where,f.sep==='Yes'?'separated':f.sep==='No'?'not separated':'',f.pher==='Yes'?'pheromones on':f.pher==='No'?'pheromones off':''].filter(Boolean).join(' · '))+'</div>'+(f.n?'<div class="small mute" style="margin-top:4px">'+esc(f.n)+'</div>':'')+((f.att||[]).length?thumbs(f.att):'')+
        '<div class="row" style="justify-content:flex-end;margin-top:6px"><button class="x" data-a="fedit" data-v="'+f.id+'">Edit</button><button class="x" data-a="delf" data-v="'+f.id+'">✕</button></div></div></details>';
    });
    h+='</details>';
  });
  return h+'</details>';
}
document.addEventListener('toggle',function(e){var k=e.target&&e.target.dataset&&e.target.dataset.open;if(k){ui.open=ui.open||{};ui.open[k]=e.target.open;if(e.target.open&&e.target.hasAttribute('data-lazy'))render()}},true);
function lazyOpen(k,dflt){ui.open=ui.open||{};return k in ui.open?ui.open[k]:!!dflt}
function spot(k){if(S&&S.cats&&S.cats[k]&&S.cats[k].photo&&GH)return'<img class="spot" data-ph="'+esc(S.cats[k].photo)+'" alt="" data-sph="'+k+'">';var c=k==='albert'?'#e8822f':'#1e1e1e',patch=k==='albert'?
  '<path d="M4.2 9.2 5 2.6 9.6 6.2Q12 5.4 14.4 6.2L19 2.6 19.8 9.2Q20.1 11.6 19.4 13.5Q18.2 12.6 16.7 11.9Q15.3 12.2 13.9 11.4L12 7.8 10.1 11.4Q8.7 12.2 7.3 11.9Q5.8 12.6 4.6 13.5Q3.9 11.6 4.2 9.2Z" fill="'+c+'"/><path d="M5.7 4.1 6.1 7.3 8.6 6.1Z" fill="#f2b29a"/><path d="M18.3 4.1 17.9 7.3 15.4 6.1Z" fill="#f2b29a"/><path d="M12 17.15Q10.9 16.95 9.9 17.9Q11.1 18.35 12 17.7Q12.9 18.35 14.1 17.9Q13.1 16.95 12 17.15Z" fill="'+c+'"/>':
  '<path d="M5.7 4.1 6.1 7.3 8.6 6.1Z" fill="#f4b9c2"/><path d="M18.3 4.1 17.9 7.3 15.4 6.1Z" fill="#f4b9c2"/><path d="M7.6 6.6 9.6 6.2Q11.2 5.7 12.4 6.0Q12.2 8.0 10.8 8.9Q9.0 9.3 7.8 8.4Q7.3 7.6 7.6 6.6Z" fill="'+c+'"/><path d="M16.0 6.9Q18.6 6.6 19.8 9.2Q20.5 11.4 20.1 13.2Q18.7 12.3 17.7 10.9Q16.5 9.3 16.0 6.9Z" fill="'+c+'"/>';
  return'<svg class="spot" viewBox="0 0 24 24" aria-label="'+k+'"><path d="M4.2 9.2 5 2.6 9.6 6.2Q12 5.4 14.4 6.2L19 2.6 19.8 9.2Q21 13.2 19 16.8 16.4 21 12 21 7.6 21 5 16.8 3 13.2 4.2 9.2Z" fill="#fff"/>'+patch+
  '<path d="M4.2 9.2 5 2.6 9.6 6.2Q12 5.4 14.4 6.2L19 2.6 19.8 9.2Q21 13.2 19 16.8 16.4 21 12 21 7.6 21 5 16.8 3 13.2 4.2 9.2Z" fill="none" stroke="#6b6560" stroke-width="1.1" stroke-linejoin="round"/>'+
  '<ellipse cx="9" cy="13.2" rx="1.1" ry="1.4" fill="'+(k==='milly'?'#9cbf6a':'#7f9686')+'"/><ellipse cx="15" cy="13.2" rx="1.1" ry="1.4" fill="'+(k==='milly'?'#9cbf6a':'#7f9686')+'"/><path d="M11.2 16h1.6l-.8 .9z" fill="#e88a9a"/></svg>'}
function catDayIcons(c,ds){var x=peek(c,ds),tt=dayTotals(c,x),ic='';
  if(c.weights.some(function(w){return w.d===ds}))ic+='⚖️';
  if(c.health.some(function(e){return e.d===ds}))ic+='🩺';
  if(c.vet.some(function(e){return e.d===ds}))ic+='🏥';
  if(x&&x.checks&&Object.keys(x.checks).some(function(k){return x.checks[k]}))ic+='💊';
  if(x&&tt.play)ic+='🧶';
  if(x&&x.photos&&x.photos.length)ic+='📷';
  var lt=S.litter.filter(function(l){return l.d===ds&&l.who===c.name});if(lt.length)ic+=lt.some(bad)?'💩⚠️':'💩';
  if(S.info.bookings.some(function(b){return b.cats.indexOf(c.name)>=0&&b.from&&ds>=b.from&&ds<=(b.to||b.from)}))ic+='🏨';
  var fdc='';if(x&&(tt.dry||tt.wet)){fdc=(c.dryAllowance&&tt.dry>c.dryAllowance)||tt.wet>c.wetAllowance||(x.treats||0)>c.treatAllowance?'r':'g'}
  return{ic:ic,fdc:fdc,any:!!(ic||fdc)}}
function calInfo(c,ds){var x=peek(c,ds),tt=dayTotals(c,x),r={any:false,food:'',warn:false,weigh:false,vet:false,hotel:false,bits:[]};
  if(x&&(tt.dry||tt.wet)){r.food=(c.dryAllowance&&tt.dry>c.dryAllowance)||tt.wet>c.wetAllowance||(x.treats||0)>c.treatAllowance?'over':'ok'}
  r.weigh=c.weights.some(function(w){return w.d===ds});r.treat=(c.treat||[]).some(function(x){return x.d===ds});r.vet=c.vet.some(function(e){return e.d===ds});
  var lt=S.litter.filter(function(l){return l.d===ds&&l.who===c.name});
  r.warn=lt.some(bad)||c.health.some(function(e){return e.d===ds});
  r.hotel=S.info.bookings.some(function(b){return b.cats.indexOf(c.name)>=0&&b.from&&ds>=b.from&&ds<=(b.to||b.from)});
  r.any=!!(x&&(tt.dry||tt.wet||tt.play||x.note||(x.photos&&x.photos.length)||Object.keys(x.checks||{}).some(function(k){return x.checks[k]})))||r.weigh||r.vet||r.warn||lt.length>0;
  return r}
function calBits(ds,cats){var out=[],both=cats.length>1;
  (S.todos||[]).filter(function(x){return x.due===ds}).forEach(function(x){out.push(['✅',(x.done?'Done: ':'To do: ')+x.text])});
  S.fights.filter(function(f){return f.d===ds}).forEach(function(f){out.push(['😾',(f.sev||'Fight')+(f.who?', started by '+f.who:'')+(f.m?' ('+f.m+')':'')])});
  cats.forEach(function(k){var c=S.cats[k],nm=both?c.name+': ':'',x=peek(c,ds),tt=dayTotals(c,x);
    c.weights.filter(function(w){return w.d===ds}).forEach(function(w){out.push(['⚖️',nm+'weighed '+w.kg.toFixed(2)+' kg'])});
    c.vet.filter(function(e){return e.d===ds}).forEach(function(e){out.push(['🏥',nm+'vet'+(e.reason?', '+e.reason:'')])});
    c.health.filter(function(e){return e.d===ds}).forEach(function(e){out.push(['🩺',nm+e.t])});
    S.litter.filter(function(l){return l.d===ds&&l.who===c.name&&bad(l)}).forEach(function(l){out.push(['⚠️',nm+l.type.toLowerCase()+(l.cons?', '+l.cons.toLowerCase():'')])});
    (c.treat||[]).filter(function(e){return e.d===ds}).forEach(function(e){out.push([TT[e.type].ic,nm+(e.product||e.type)])});
    if(x&&(tt.dry||tt.wet)&&((c.dryAllowance&&tt.dry>c.dryAllowance)||tt.wet>c.wetAllowance||(x.treats||0)>c.treatAllowance))out.push(['🍽️',nm+'ate over plan']);
    if(x&&x.note)out.push(['📝',nm+x.note])});
  S.info.bookings.filter(function(b){return b.from&&(ds===b.from||ds===(b.to||b.from))&&cats.some(function(k){return b.cats.indexOf(S.cats[k].name)>=0})}).forEach(function(b){out.push(['🏨',(ds===b.from?'Drop-off at ':'Pick-up from ')+(b.place||S.info.hotel.name)])});
  return out}
function vCal(){ui.calWho='both';var m=ui.month,first=parse(m+'-01'),y=first.getFullYear(),mo=first.getMonth(),who='both';
  var dim=new Date(y,mo+1,0).getDate(),off=(first.getDay()+6)%7,t=today(),cats=who==='both'?['albert','milly']:[who],sel=ui.calSel||t;
  var h='';
  h+='<div class="card calcard"><div class="calhead"><button class="rnd" data-a="mon" data-v="-1">‹</button><div><div class="mname">'+first.toLocaleDateString('en-GB',{month:'long'})+'</div><div class="yname">'+y+'</div></div><button class="rnd" data-a="mon" data-v="1">›</button></div>';
  h+='<div class="cal">'+['M','T','W','T','F','S','S'].map(function(x){return'<div class="h">'+x+'</div>'}).join('');
  for(var i=0;i<off;i++)h+='<div></div>';
  var month=[];
  for(var dd=1;dd<=dim;dd++){var ds=m+'-'+String(dd).padStart(2,'0'),hotel=cats.some(function(k){return calInfo(S.cats[k],ds).hotel}),bits=calBits(ds,cats);
    if(bits.length)month.push([ds,bits]);
    var em=[];bits.forEach(function(b){if(em.indexOf(b[0])<0)em.push(b[0])});
    h+='<div class="d'+(ds===t?' today':'')+(ds===sel?' sel':'')+(ds>t?' fut':'')+(hotel?' hotel':'')+'" data-a="open" data-v="'+ds+'"><span class="n">'+dd+'</span>'+(em.length?'<span class="ics2">'+em.slice(0,2).join('')+(em.length>2?'<small>+'+(em.length-2)+'</small>':'')+'</span>':'')+'</div>'}
  h+='</div><details class="legend2"><summary class="mute small">What the icons mean</summary><div class="small mute" style="margin-top:6px;line-height:1.8">😾 fight · ⚖️ weigh-in · 🏥 vet · 🩺 symptom · ⚠️ poo/pee to check · 🐛🛡️ worm/flea · 🍽️ ate over plan · ✅ to do · 📝 note · 🏨 hotel drop-off/pick-up · striped day = at the cat hotel</div></details></div>';
  h+=dayPanel(sel);
  var tdn=(S.todos||[]).filter(function(x){return!x.done}).length;h+='<details class="nf tdnf" data-open="caltodo"'+isOpen('caltodo',false)+' style="margin:0 0 12px"><summary><span>✅ To do &amp; coming up'+(tdn?' <span class="nfc">'+tdn+'</span>':'')+'</span></summary>'+calList()+'</details>';
  h+='<details class="nf" data-open="wsall"'+isOpen('wsall',false)+'><summary><span>📊 Last 7 days summary</span></summary><div class="card" style="margin:0">'+weekSummary()+'</div></details>';
  h+='<details class="nf" data-open="mrecap"'+isOpen('mrecap',false)+'><summary><span>📖 What happened in '+first.toLocaleDateString('en-GB',{month:'long'})+(month.length?' <span class="nfc">'+month.length+'</span>':'')+'</span></summary><div class="card" style="margin:0">'+(month.length?month.reverse().map(function(r){var dt=parse(r[0]);return'<div class="mrow" data-a="open" data-v="'+r[0]+'"><div class="mdate"><b>'+dt.getDate()+'</b><span>'+dt.toLocaleDateString('en-GB',{weekday:'short'})+'</span></div><div class="mitems">'+r[1].map(function(b){return'<div>'+b[0]+' '+esc(b[1])+'</div>'}).join('')+'</div></div>'}).join(''):emptyState('','A quiet month','No fights, vet visits or anything worrying logged.',''))+'</div></details>';
  return h}
function todoRow(x){var t0=today(),late=x.due&&!x.done&&x.due<t0;return'<div class="todo'+(x.done?' done':'')+'"><button class="tick" data-a="tdone" data-v="'+x.id+'">'+(x.done?'✓':'')+'</button><div class="tt2"><div class="tx">'+esc(x.text)+'</div>'+(x.due?'<div class="due'+(late?' late':'')+'">'+(late?'Overdue · ':x.due===t0?'Today · ':'Due ')+short(x.due)+'</div>':'')+'</div></div>'}
function calList(){var t=today(),it=[],all=S.todos||[],open=all.filter(function(x){return!x.done}),done=all.filter(function(x){return x.done});
  open.forEach(function(x){it.push({d:x.due||'',ic:'✅',tx:x.text,id:x.id})});
  (S.info.bookings||[]).forEach(function(b){var nm=b.place||S.info.hotel.name||'cat hotel';if(b.from&&b.from>=t)it.push({d:b.from,ic:'🏨',tx:'Drop-off at '+nm});if(b.to&&b.to>=t)it.push({d:b.to,ic:'🏠',tx:'Pick-up from '+nm})});
  ['albert','milly'].forEach(function(k){var c=S.cats[k],last={};(c.treat||[]).forEach(function(e){if(!last[e.type]||e.d>last[e.type].d)last[e.type]=e});Object.keys(last).forEach(function(ty){var e=last[ty];if(e.next)it.push({d:e.next,ic:TT[ty]?TT[ty].ic:'💊',tx:c.name+': '+ty.toLowerCase()+' due'})})});
  var dow=parse(t).getDay();it.push({d:addDays(t,(6-dow+7)%7),ic:'⚖️',tx:'Weigh-in for both'});
  var G=[['late','Overdue',function(d){return d&&d<t}],['today','Today',function(d){return d===t}],['tmrw','Tomorrow',function(d){return d===addDays(t,1)}],['week','Next 7 days',function(d){return d>addDays(t,1)&&d<=addDays(t,7)}],['later','Later',function(d){return d>addDays(t,7)}],['any','Any time',function(d){return!d}]];
  it.sort(function(a,b){return(a.d||'9')<(b.d||'9')?-1:1});
  var h='<details class="nf tdadd" data-open="tdadd"'+isOpen('tdadd',false)+' style="margin:0 0 12px"><summary><span>➕ Add a to-do</span></summary><div class="addrow" style="margin-top:0"><input id="tdtext" placeholder="What needs doing?"><input id="tddue" type="date" title="Due date (optional)"><button class="b p" data-a="tadd">Add</button></div></details>';
  G.forEach(function(g){var xs=it.filter(function(x){return g[2](x.d)});if(!xs.length)return;
    h+='<div class="card cgrp cg-'+g[0]+'"><div class="row between" style="flex-wrap:nowrap"><h2 style="margin:0">'+g[1]+'</h2><span class="mute small">'+xs.length+'</span></div>'+xs.map(function(x){var dt=x.d?parse(x.d):null,sub=dt&&(g[0]==='week'||g[0]==='later'||g[0]==='late')?dt.toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'}):'';
      return'<div class="agr">'+(x.id?'<button class="tick" data-a="tdone" data-v="'+x.id+'"></button>':'<span class="agi">'+x.ic+'</span>')+'<span class="agt">'+esc(x.tx)+(sub?'<small>'+sub+'</small>':'')+'</span>'+(x.id?'<button class="x" data-a="tdel" data-v="'+x.id+'">✕</button>':'')+'</div>'}).join('')+'</div>'});
  if(done.length)h+='<details class="nf" data-open="tddone"'+isOpen('tddone',false)+'><summary><span>✓ Done <span class="nfc">'+done.length+'</span></span></summary><div class="card" style="margin:0">'+done.map(todoRow).join('')+'</div></details>';
  return h}
function dayPanel(ds){var cats=(ui.calWho&&ui.calWho!=='both')?[ui.calWho]:['albert','milly'];
  var nb=calBits(ds,['albert','milly']).length;
  var h='<details class="card daydd" data-open="daypan"'+isOpen('daypan',false)+'><summary class="dayttl"><div class="dnum">'+parse(ds).getDate()+'</div><div style="flex:1"><div class="dw">'+parse(ds).toLocaleDateString('en-GB',{weekday:'long'})+'</div><div class="mute small">'+parse(ds).toLocaleDateString('en-GB',{month:'long'})+(nb?' · '+nb+' thing'+(nb>1?'s':'')+' logged':' · tap to see the day')+'</div></div></summary>';
  cats.forEach(function(k){var c=S.cats[k],x=peek(c,ds),tt=dayTotals(c,x),rows=[];
    if(x&&(tt.dry||tt.wet))rows.push(['🍽️',fmt(tt.dry)+' g dry · '+fmt(tt.wet)+' wet'+(x.treats?' · '+x.treats+' treats':''),'about '+Math.round(tt.kcal)+' kcal']);
    if(x&&tt.play)rows.push(['🧶',tt.play+' min play',Object.keys(x.play).filter(function(p){return x.play[p]}).map(function(p){return p+' '+x.play[p]}).join(', ')]);
    var ck=x?Object.keys(x.checks||{}).filter(function(q){return x.checks[q]}):[];if(ck.length)rows.push(['✅',ck.join(', '),'']);
    c.weights.filter(function(w){return w.d===ds}).forEach(function(w){rows.push(['⚖️',w.kg.toFixed(2)+' kg','weigh-in'])});
    S.litter.filter(function(l){return l.d===ds&&l.who===c.name}).forEach(function(l){rows.push([l.type==='Poo'?'💩':'💧',l.type+(l.cons?' · '+l.cons:''),[l.m,l.amt,l.smell&&l.smell!=='Normal'?l.smell.toLowerCase()+' smell':'',(l.extra||[]).join(', ')].filter(Boolean).join(' · ')])});
    c.health.filter(function(e){return e.d===ds}).forEach(function(e){rows.push(['🩺',e.t,[e.m,e.n].filter(Boolean).join(' · ')])});
    c.vet.filter(function(e){return e.d===ds}).forEach(function(e){rows.push(['🏥',e.reason||'Vet',e.clinic||''])});
    (c.treat||[]).filter(function(e){return e.d===ds}).forEach(function(e){rows.push([TT[e.type].ic,(e.product||e.type)+(e.dose?' · '+e.dose:''),e.type+(e.next?' · next '+short(e.next):'')])});
    S.info.bookings.filter(function(b){return b.cats.indexOf(c.name)>=0&&b.from&&ds>=b.from&&ds<=(b.to||b.from)}).forEach(function(b){rows.push(['🏨',b.place||S.info.hotel.name,ds===b.from?'drop-off':ds===b.to?'pick-up':'staying'])});
    if(x&&x.note)rows.push(['📝',x.note,'']);
    h+='<div class="dcat"><div class="dch dch-'+k+'" style="--g:var(--g-'+k+')">'+spot(k)+'<b>'+esc(c.name)+'</b><button class="b s" data-a="openday" data-k="'+k+'" data-v="'+ds+'">Open day ›</button></div>'+
      (rows.length?rows.map(function(r){return'<div class="ci"><span class="ic">'+r[0]+'</span><span><span class="val">'+esc(r[1])+'</span>'+(r[2]?'<br><span class="small mute">'+esc(r[2])+'</span>':'')+'</span></div>'}).join(''):emptyState(bowlArt(),'A blank day','Nothing was logged on this one.','<button class="b s p" data-a="openday" data-k="'+ui.cat+'" data-v="'+ds+'">Open this day to add</button>'))+
      (x&&x.photos&&x.photos.length?thumbs(x.photos):'')+'</div>'});
  var td=(S.todos||[]).filter(function(x){return x.due===ds});
  if(0&&td.length)h+='<div class="dcat"><div class="dch" style="--g:linear-gradient(135deg,#52525b,#18181b)"><span style="font-size:22px">✅</span><b>To do</b></div>'+td.map(todoRow).join('')+'</div>';
  var fs=S.fights.filter(function(f){return f.d===ds});
  if(fs.length)h+='<div class="dcat"><div class="dch" style="--g:linear-gradient(135deg,#e05a4f,#a8322a)"><span style="font-size:22px">😾</span><b>'+fs.length+' fight'+(fs.length>1?'s':'')+'</b></div>'+fs.map(function(f){return'<div class="ci"><span class="ic">'+(f.sev==='Full fight'?'💥':f.sev==='Bite'?'🦷':'💨')+'</span><span><span class="val">'+esc((f.m?f.m+' · ':'')+(f.sev||'Fight'))+'</span><br><span class="small mute">'+esc([f.who?'started by '+f.who:'',(f.trig||[]).join(', '),f.where].filter(Boolean).join(' · '))+'</span></span></div>'}).join('')+'</div>';
  return h+'</details>'}

