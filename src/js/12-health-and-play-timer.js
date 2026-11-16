/* 12-health-and-play-timer: The Health tab, vet notes, and the play timer. */
/* health and vet */
function vHealth(){var c=cat(),since=addDays(today(),-30),hf=ui.hf||(ui.hf={});
  var h=!ui.hedit?'<button class="b w" style="margin-bottom:10px;padding:12px" data-a="vrep">📋 Vet summary for '+esc(c.name)+'</button><button class="symbtn fbtn" data-a="hnew">🩺 Log a symptom</button>':'<details class="card flog" id="hform" data-open="hform" open><summary><span class="symbtn">✎ Edit symptom</span></summary><div style="margin-top:6px"><label class="l">Which cat?</label><div class="seg" style="grid-template-columns:1fr 1fr;margin:0">'+['albert','milly'].map(function(k){return'<button data-a="cat" data-v="'+k+'" class="'+(ui.cat===k?'on':'')+'">'+spot(k).replace('class="spot"','class="spot" style="width:22px;height:22px;vertical-align:middle"')+' '+esc(S.cats[k].name)+'</button>'}).join('')+'</div><label class="l">What</label><select id="ht" data-hf="t">'+HT.map(function(t){return'<option'+(hf.t===t?' selected':'')+'>'+t+'</option>'}).join('')+'</select>'+
    '<div class="grid2"><div><label class="l">Date</label><input type="date" id="hd" data-hf="d" value="'+(hf.d||today())+'" max="'+today()+'"></div><div><label class="l">Time</label><input type="time" id="hm" data-hf="m" value="'+(hf.m||new Date().toTimeString().slice(0,5))+'"></div></div>'+
    '<label class="l">Details</label><textarea id="hn" data-hf="n" rows="2" placeholder="How long, after eating, at rest…">'+esc(hf.n||'')+'</textarea>'+
    (ui.pendFor==='health'&&ui.pend.length?thumbs(ui.pend,'pend'):'')+'<div class="row" style="margin-top:10px">'+upBtn('pend','health','📷 Photo / video','image/*,video/*')+'<button class="b p" data-a="addh">'+(ui.hedit?'Update':'Save')+'</button>'+(ui.hedit?'<button class="b" data-a="hcancel">Cancel</button>':'')+'</div></div></details>'+'';
  h+=['albert','milly'].map(function(k){var c=S.cats[k],h='',P={today:'',trends:'',vet:''};
  var recent=c.health.filter(function(e){return e.d>=since}),counts={};recent.forEach(function(e){counts[e.t]=(counts[e.t]||0)+1});
  P.trends+='<div class="hsec"><h2>Last 30 days</h2>'+(recent.length?hbars(counts):'<span class="mute">Nothing logged</span>')+'<button class="b w" style="margin-top:10px" data-a="vet">📋 Summary to send the vet</button></div>';
  P.trends+='<div class="hsec list"><h2>Symptom history</h2>'+(c.health.length?c.health.slice().sort(function(a,b){return(a.d+a.m)<(b.d+b.m)?1:-1}).map(function(e){return'<div class="it"><div class="row between"><b>'+esc(e.t)+'</b><span class="mute small">'+short(e.d)+' '+esc(e.m||'')+'<button class="x" data-a="hedit" data-v="'+e.id+'">Edit</button><button class="x" data-a="delh" data-v="'+e.id+'">✕</button></span></div>'+(e.n?'<div class="small">'+esc(e.n)+'</div>':'')+(e.att.length?thumbs(e.att):'')+'</div>'}).join(''):'<span class="mute">Nothing yet</span>')+'</div>';
  var lt=S.litter.filter(function(x){return x.d===today()&&x.who===c.name});
  P.today+='<div class="hsec"><h2>Poo &amp; pee today · 💩 '+lt.filter(function(x){return x.type==='Poo'}).length+' · 💧 '+lt.filter(function(x){return x.type==='Pee'}).length+'</h2>'+
    (lt.length?'<div class="list">'+lt.map(litterLine).join('')+'</div>':'')+
    '<div class="row" style="margin-top:8px"><button class="b" data-a="lnew" data-v="Poo" data-k="today">💩 Log poo</button><button class="b" data-a="lnew" data-v="Pee" data-k="today">💧 Log pee</button></div><div class="note">Tap Log poo, then 📷 Take a photo.</div></div>';
  var ls=litterSummary(c);
  P.trends+='<div class="hsec"><h2>Poo &amp; pee, last 30 days</h2>'+(ls?'<div class="grid2"><div class="stat"><span class="mute">Poos</span><b>'+ls.poo+'</b><span class="mute small">'+fmt(ls.poo/ls.days)+' per logged day</span></div><div class="stat"><span class="mute">Pees</span><b>'+ls.pee+'</b><span class="mute small">'+fmt(ls.pee/ls.days)+' per logged day</span></div></div>'+
    (Object.keys(ls.cs).length?'<h3>Poo consistency</h3>'+hbars(ls.cs):'')+(Object.keys(ls.sm).length?'<h3>Smell</h3>'+hbars(ls.sm):'')+(Object.keys(ls.fl).length?'<h3>⚠️ Unusual</h3>'+hbars(ls.fl):'<p class="small mute">Nothing unusual logged.</p>'):'<span class="mute small">Nothing logged yet.</span>')+
    '<details style="margin-top:8px" data-open="lall-'+k+'" data-lazy'+isOpen('lall-'+k,false)+'><summary class="mute small">All entries</summary>'+(lazyOpen('lall-'+k)?'<div class="list">'+S.litter.filter(function(x){return x.who===c.name}).sort(function(a,b){return(a.d+a.m)<(b.d+b.m)?1:-1}).slice(0,60).map(function(x){return'<div class="mute small" style="margin-top:6px">'+short(x.d)+'</div>'+litterLine(x)}).join('')+'</div>':'')+'</details></div>';
  P.today+=rrSection(k);P.trends+=pooFood(k);P.vet+=vqSection(k);
    P.vet+='<div class="hsec"><div class="row between"><h2 style="margin:0">Vet notes &amp; files</h2><button class="b s p" data-a="vnew">+ Add</button></div>';
  P.vet+='<div style="margin-top:6px">'+(c.vet.length?c.vet.slice().sort(function(a,b){return(a.d||'0')<(b.d||'0')?1:-1}).map(function(v){return'<details class="fit" data-open="vet'+v.id+'"'+isOpen('vet'+v.id,false)+'><summary><div class="row between" style="flex-wrap:nowrap;gap:8px"><b class="ell">'+esc(v.reason||'Vet note')+'</b><span class="mute small" style="flex:none">'+(v.d?short(v.d)+' '+parse(v.d).getFullYear():'No date')+'</span></div>'+(v.next?'<div class="small" style="margin-top:2px">Follow-up '+short(v.next)+'</div>':'')+'</summary><div style="padding-top:6px">'+
    (v.clinic?'<div class="small mute">'+esc(v.clinic)+'</div>':'')+(v.notes?'<div class="small" style="white-space:pre-wrap">'+esc(v.notes)+'</div>':'')+
    (v.email?'<details><summary class="small mute">Email</summary><div class="small" style="white-space:pre-wrap">'+esc(v.email)+'</div></details>':'')+(v.att.length?thumbs(v.att):'')+
    '<div class="row" style="justify-content:flex-end;margin-top:6px"><button class="x" data-a="vedit" data-v="'+v.id+'">Edit</button></div></div></details>'}).join(''):'<span class="mute">No vet notes yet</span>')+'</div></div>';
    var htb=(ui.htab&&ui.htab[k])||'today';h='<div class="seg htabs">'+[['today','Today'],['trends','Trends'],['vet','Vet']].map(function(o){return'<button class="'+(htb===o[0]?'on':'')+'" data-a="htab" data-v="'+o[0]+'">'+o[1]+'</button>'}).join('')+'</div>'+P[htb];
    var lt0=S.litter.filter(function(x){return x.d===today()&&x.who===c.name}),hs=c.health.filter(function(e){return e.d>=since}).length;
    return'<details class="catcard catd" data-open="hc-'+k+'"'+isOpen('hc-'+k,false)+'><summary class="head" style="--g:var(--g-'+k+')">'+spot(k)+'<div><b>'+esc(c.name)+'</b><span>Today 💩 '+lt0.filter(function(x){return x.type==='Poo'}).length+' · 💧 '+lt0.filter(function(x){return x.type==='Pee'}).length+' · '+hs+' symptom'+(hs===1?'':'s')+' in 30 days</span></div></summary>'+h.replace(/data-a="/g,'data-cat="'+k+'" data-a="')+'</details>'}).join('');
  h+=healthIssues();h+=treatJoint();
  return h}
function vetSheet(){var v=ui.v;
  return'<div class="modal" data-a="close"><div class="sheet" data-stop="1"><h2 style="margin-top:0">'+(v.isNew?'New vet note':'Edit vet note')+'</h2>'+
    '<div class="grid2"><div><label class="l">Date</label><input type="date" data-vf="d" value="'+esc(v.d)+'"></div><div><label class="l">Follow-up</label><input type="date" data-vf="next" value="'+esc(v.next)+'"></div></div>'+
    '<label class="l">Reason / title</label><input data-vf="reason" value="'+esc(v.reason)+'" placeholder="Weight check, cough…">'+
    '<label class="l">Vet / clinic</label><input data-vf="clinic" value="'+esc(v.clinic)+'">'+
    '<label class="l">What the vet said</label><textarea rows="4" data-vf="notes">'+esc(v.notes)+'</textarea>'+
    '<label class="l">Email (paste it here)</label><textarea rows="4" data-vf="email" placeholder="Paste the vet\'s email">'+esc(v.email)+'</textarea>'+
    '<label class="l">Files</label>'+(v.att.length?thumbs(v.att,'v'):'')+'<div class="row" style="margin-top:8px">'+upBtn('vet','','📎 PDF, photo or screenshot','image/*,application/pdf')+'</div>'+
    '<div class="note">For an email with attachments: save the PDFs to Files on your iPhone and add them here, or screenshot the email.</div>'+
    '<div class="row" style="margin-top:14px"><button class="b p" data-a="vsave">Save</button><button class="b" data-a="close">Cancel</button>'+(v.isNew?'':'<button class="b" style="background:var(--bad);color:#fff" data-a="vdel">Delete</button>')+'</div></div></div>'}

function vetText(){var c=cat(),r=stats(c),since=addDays(today(),-30),L=[];
  L.push(c.name+' – summary for the vet ('+short(since)+' to '+short(today())+')','');
  if(r){L.push('Weight: '+r.first.kg.toFixed(2)+' kg ('+short(r.first.d)+') → '+r.last.kg.toFixed(2)+' kg ('+short(r.last.d)+'), '+r.pct.toFixed(1)+'% lost. Target '+c.target+' kg.');
    if(r.rate!=null)L.push('Recent rate: '+r.rate.toFixed(2)+'% per week ('+Math.round(r.kgWeek*1000)+' g/week).')}
  L.push('Plan: '+c.foods.map(function(f){return f.name}).join(', ')+'. Daily allowance '+c.dryAllowance+' g dry + '+c.wetAllowance+' wet.');
  var ds=Object.keys(c.days).filter(function(d){return d>=since}),n=ds.length;
  if(n){var t={dry:0,wet:0,kcal:0,play:0},tr=0;ds.forEach(function(d){var x=dayTotals(c,c.days[d]);for(var k in t)t[k]+=x[k];tr+=c.days[d].treats||0});
    L.push('Logged intake (avg over '+n+' days): '+Math.round(t.dry/n)+' g dry, '+fmt(t.wet/n)+' wet, '+fmt(tr/n)+' treats, about '+Math.round(t.kcal/n)+' kcal. Play avg '+Math.round(t.play/n)+' min/day.')}
  var hs=c.health.filter(function(e){return e.d>=since}).sort(function(a,b){return a.d<b.d?-1:1});
  L.push('','Symptoms:');L.push(hs.length?hs.map(function(e){return'- '+short(e.d)+' '+(e.m||'')+': '+e.t+(e.n?' ('+e.n+')':'')}).join('\n'):'- nothing logged');
  ['Worming','Flea'].forEach(function(ty){var l=lastTreat(c,ty);if(l)L.push((ty==='Flea'?'Flea treatment':'Worming')+': last '+short(l.d)+(l.product?' ('+l.product+(l.dose?', '+l.dose:'')+')':'')+(l.next?', next due '+short(l.next):'')+'.')});
  var ls=litterSummary(c);if(ls){L.push('','Poo and pee (30 days, '+ls.days+' days logged): '+ls.poo+' poos, '+ls.pee+' pees.'+(Object.keys(ls.cs).length?' Poo: '+Object.keys(ls.cs).map(function(k){return k.toLowerCase()+' x'+ls.cs[k]}).join(', ')+'.':'')+(Object.keys(ls.fl).length?' Unusual: '+Object.keys(ls.fl).map(function(k){return k.toLowerCase()+' x'+ls.fl[k]}).join(', ')+'.':''))}
  var fs=S.fights.filter(function(f){return f.d>=since});if(fs.length)L.push('','Fights between Albert and Milly: '+fs.length+' in 30 days.');
  return L.join('\n')}

/* play timer (kept on this phone so it survives the page reloading after a save) */
function tGet(){try{return JSON.parse(localStorage.getItem(LS+'-timer')||'null')}catch(e){return null}}
function tSet(o){try{if(o)localStorage.setItem(LS+'-timer',JSON.stringify(o));else localStorage.removeItem(LS+'-timer')}catch(e){}}
function mmss(ms){ms=Math.max(0,ms);var s2=Math.floor(ms/1000);return String(Math.floor(s2/60)).padStart(2,'0')+':'+String(s2%60).padStart(2,'0')}
function timerBanner(){var T=tGet();if(!T)return'';var el=Date.now()-T.start,txt=T.dur?mmss(T.dur*60000-el)+' left':mmss(el);
  return'<div class="card" style="border:2px solid var(--accent);position:sticky;top:calc(env(safe-area-inset-top) + 34px);z-index:4"><div class="row between"><div>'+spot(T.cat)+' <b>'+esc(T.type)+'</b><div class="big" id="tmr" style="font-variant-numeric:tabular-nums">'+txt+'</div><div class="mute small">'+(T.dur?T.dur+' min timer':'Playing… tap Stop when done')+'</div></div><div class="row" style="flex-direction:column;align-items:stretch"><button class="b p" data-a="tstop">Stop &amp; log</button><button class="b s" data-a="tcancel">Cancel</button></div></div></div>'}
function playSheet(){var P=ui.pl,c=cat();
  return'<div class="modal" data-a="close"><div class="sheet" data-stop="1"><h2 style="margin-top:0">🧶 Log play for '+esc(c.name)+'</h2>'+
    '<label class="l">1. What did you play?</label><div class="wizc">'+S.playTypes.map(function(p){return'<button class="wizb'+(P.type===p?' on':'')+'" data-a="plt" data-v="'+esc(p)+'">'+esc(p)+(P.type===p?' <span>✓</span>':'')+'</button>'}).join('')+'</div>'+
    (P.type?'<label class="l" style="margin-top:14px">2. How long?</label><div class="grid3">'+[5,10,15,20,30].map(function(m){return'<button class="b'+(P.min===m?' p':'')+'" data-a="plm" data-v="'+m+'">'+m+' min</button>'}).join('')+(tGet()?'':'<button class="b" data-a="plstart">⏱ Timer</button>')+'</div>':'')+
    (P.type&&P.min?'<button class="b p w" style="margin-top:14px;padding:16px;font-size:17px" data-a="plsave">Add '+P.min+' min of '+esc(P.type)+'</button>':'')+
    '<button class="b w" style="margin-top:10px" data-a="close">Cancel</button></div></div>'}
function timerSheet(){var i=ui.tk,p=S.playTypes[i];
  return'<div class="modal" data-a="close"><div class="sheet" data-stop="1"><h2 style="margin-top:0">⏱ '+esc(p)+' timer for '+esc(cat().name)+'</h2><p class="mute small">Pick a length. You\'ll get a beep when time\'s up (keep the page open), and the minutes are added to today automatically.</p>'+
    '<div class="grid3">'+[5,10,15,20,30].map(function(m){return'<button class="b" data-a="tstart" data-v="'+m+'">'+m+' min</button>'}).join('')+'<button class="b" data-a="tstart" data-v="0">Stopwatch</button></div>'+
    '<button class="b w" style="margin-top:12px" data-a="close">Cancel</button></div></div>'}
var actx=null;
function beep(){try{if(!actx)return;[0,0.35,0.7].forEach(function(t0){var o=actx.createOscillator(),g=actx.createGain();o.frequency.value=880;o.connect(g);g.connect(actx.destination);g.gain.setValueAtTime(0.25,actx.currentTime+t0);g.gain.exponentialRampToValueAtTime(0.001,actx.currentTime+t0+0.3);o.start(actx.currentTime+t0);o.stop(actx.currentTime+t0+0.3)})}catch(e){}}
function tLog(T,mins){var c=S.cats[T.cat],ds=iso(new Date(T.start)),d=day(c,ds);d.play[T.type]=(d.play[T.type]||0)+mins;tSet(null);change()}
setInterval(function(){var T=tGet();if(!T)return;var el=Date.now()-T.start,e=document.getElementById('tmr');
  if(T.dur&&el>=T.dur*60000){beep();if(e)e.textContent='Done!';tLog(T,T.dur);return}
  if(e)e.textContent=T.dur?mmss(T.dur*60000-el)+' left':mmss(el)},1000);

