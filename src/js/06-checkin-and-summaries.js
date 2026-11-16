/* 06-checkin-and-summaries: Weekly weigh-in check-in, food changes, the 7-day summary, emoji-to-icon swap, both-cats weight chart. */
function intervals(c){var w=sorted(c),out=[];var j=w.length-1;while(j>0){var i=j-1;while(i>=0&&daysBetween(w[i].d,w[j].d)<5)i--;if(i<0)break;var dd=daysBetween(w[i].d,w[j].d);out.push({from:w[i],to:w[j],rate:(w[i].kg-w[j].kg)/w[i].kg*100/dd*7,g:Math.round((w[i].kg-w[j].kg)*1000)});j=i}return out}
function checkin(k){var c=S.cats[k],w=sorted(c);if(!w.length)return null;var last=w[w.length-1],iv=intervals(c),fd=feed(c),vet=!!(c.kcalLo&&c.kcalHi),cur=c.dryAllowance;
  if(last.kg<=c.target)return{tone:'ok',head:c.name+' has reached '+c.target+' kg',tx:'Ask the vet about switching to maintenance amounts. Keep weighing weekly.'};
  if(!iv.length)return{tone:'neutral',head:c.name+': first weigh-in logged',tx:'Keep feeding exactly '+cur+' g dry. Next Saturday\'s weigh-in gives the first real number.'};
  var pf=c.planFrom||'',ivp=iv.filter(function(x){return!pf||x.from.d>=pf});if(!ivp.length){var r0=iv[0];return{tone:'neutral',head:c.name+': new amount, first week',tx:(r0.g>=0?'Down '+r0.g+' g':'Up '+(-r0.g)+' g')+' since '+short(r0.from.d)+', mostly before the change to '+cur+' g on '+short(pf)+'. Stay at '+cur+' g; next weigh-in shows how it\'s working.'}}iv=ivp;
  var r=iv[0],slow=0;for(var i=0;i<iv.length&&iv[i].rate<0.5;i++)slow++;
  var ch=(r.g>=0?'Down '+r.g+' g':'Up '+(-r.g)+' g')+' since '+short(r.from.d)+' ('+(r.rate>=0?'':'+')+Math.abs(r.rate).toFixed(1)+'% a week)';
  if(r.rate>1.5){var up=Math.ceil(cur*1.1/5)*5;return{tone:'warn',head:c.name+' is losing too fast',tx:ch+'. Go up to '+up+' g dry and ring the vet.',apply:vet?null:up}}
  if(r.rate>=0.5)return{tone:'ok',head:c.name+' is on track',tx:ch+'. Keep feeding exactly '+cur+' g dry.'};
  if(slow<2)return{tone:'neutral',head:c.name+': slow week',tx:ch+'. One slow week is normal scale noise. Stay at '+cur+' g and check nothing extra is being eaten.'};
  if(vet)return{tone:'warn',head:c.name+': slow '+slow+' weeks running',tx:ch+'. '+c.name+'\'s amounts are set with the vet, so mention it to them before changing anything.'};
  var nx=fd.next||Math.floor(cur*0.9/5)*5;if(nx>=cur)return{tone:'warn',head:c.name+': slow '+slow+' weeks running',tx:ch+'. The plan is already at the lowest safe amount. Check for extra food, then ask the vet.'};
  return{tone:'warn',head:c.name+': slow '+slow+' weeks running',tx:ch+'. Time to drop dry from '+cur+' g to '+nx+' g a day.',apply:nx}}
function checkinCard(force){var t=today(),ks=['albert','milly'].filter(function(k){var w=sorted(S.cats[k]);return w.length&&daysBetween(w[w.length-1].d,t)<=2});
  if(!force){if(!ks.length)return'';try{if(localStorage.getItem(LS+'-ci')===t)return''}catch(e){}}else ks=['albert','milly'];
  return'<div class="card ci2"><div class="row between" style="flex-wrap:nowrap"><h2 style="margin:0">⚖️ Weekly check-in</h2>'+(force?'':'<button class="x" data-a="cidone" aria-label="Hide">✕</button>')+'</div>'+ks.map(function(k){var o=checkin(k);if(!o)return'';return'<div class="cir '+o.tone+'">'+spot(k).replace('class="spot"','class="spot" style="width:34px;height:34px;flex:none"')+'<div style="flex:1"><b>'+esc(o.head)+'</b><div class="small">'+esc(o.tx)+'</div>'+(o.apply?'<button class="b s p" style="margin-top:8px" data-a="ciapply" data-k="'+k+'" data-v="'+o.apply+'">Change to '+o.apply+' g</button>':'')+'</div></div>'}).join('')+'</div>'}
function setDry(k,g){var c=S.cats[k],old=c.dryAllowance;c.dryAllowance=g;c.planFrom=today();var dry=firstOf(c,'dry'),wet=firstOf(c,'wet');
  c.plan=String(c.plan||'').split('\n').map(function(l){if(/drop to|below|go up|without asking/i.test(l))return l;l=l.replace(new RegExp('\\b'+old+' g\\b','g'),g+' g');if(/kcal/.test(l)&&dry){var kc=Math.round(g*dry.kcal/100+(wet?c.wetAllowance*wet.kcal:0));l=l.replace(/About \d+ kcal/,'About '+kc+' kcal')}return l}).join('\n');
  c.vet=c.vet||[];c.vet.push({id:uid(),d:today(),clinic:'',reason:'Food change: '+old+' g → '+g+' g dry',notes:'Changed from the weekly check-in.',next:'',email:'',att:[]})}
function weekSummary(){var t=today(),s0=addDays(t,-6),p0=addDays(t,-13),ks=['albert','milly'];function inW(d,a,b){return d>=a&&d<=b}
  var rows=[];
  ks.forEach(function(k){var c=S.cats[k],w=sorted(c),wk=w.filter(function(x){return inW(x.d,s0,t)}),prev=w.filter(function(x){return x.d<s0}),lw=wk[wk.length-1],pw=prev[prev.length-1];
    var meals=0,kc=0,kn=0,pl=0;for(var i=0;i<7;i++){var d=addDays(s0,i),x=peek(c,d);if(!x)continue;var tt=dayTotals(c,x);if(tt.dry>0&&tt.wet>0)meals++;if(tt.kcal>0){kc+=tt.kcal;kn++}pl+=tt.play}
    var poo=(S.litter||[]).filter(function(x){return x.who===c.name&&x.type==='Poo'&&inW(x.d,s0,t)}),soft=poo.filter(function(x){return/mushy|liquid|soft/i.test(x.cons||'')}).length;
    var rr=(c.rr||[]).filter(function(x){return inW(x.d,s0,t)}),ra=rr.length?Math.round(rr.reduce(function(m,x){return m+x.bpm},0)/rr.length):null;
    rows.push('<div class="wsum"><div class="wsh2">'+spot(k).replace('class="spot"','class="spot" style="width:26px;height:26px"')+'<b>'+esc(c.name)+'</b></div><ul>'+
      '<li>Weight: '+(lw?(+lw.kg).toFixed(2)+' kg'+(pw?' ('+(lw.kg<=pw.kg?'−':'+')+Math.abs(Math.round((lw.kg-pw.kg)*1000))+' g)':''):'no weigh-in this week')+'</li>'+
      '<li>Both meals logged on '+meals+' of 7 days'+(kn?', about '+Math.round(kc/kn)+' kcal a day':'')+'</li>'+
      '<li>Play: '+(pl?Math.round(pl/7)+' min a day on average':'none logged')+'</li>'+
      '<li>Poo: '+(poo.length?poo.length+' logged, '+soft+' soft':'none logged')+'</li>'+(ra!=null?'<li>Sleeping breathing: '+ra+'/min average ('+rr.length+' counts)</li>':'')+'</ul></div>')});
  var fw=S.fights.filter(function(f){return inW(f.d,s0,t)}).length,fp=S.fights.filter(function(f){return inW(f.d,p0,addDays(s0,-1))}).length,cm=(S.calm||[]).filter(function(x){return inW(x.d,s0,t)}).length,bn=Object.keys(S.bed||{}).filter(function(d){return inW(d,s0,t)}).length;
  rows.push('<div class="wsum"><div class="wsh2"><b>Together</b></div><ul><li>'+fw+' fight'+(fw!==1?'s':'')+' this week, '+(fw<fp?'down from ':fw>fp?'up from ':'same as ')+fp+'</li><li>'+cm+' calm moment'+(cm!==1?'s':'')+' logged</li><li>Bedtime routine on '+bn+' of 7 nights</li></ul></div>');
  var nx=[],e7=addDays(t,7);ks.forEach(function(k){['Worming','Flea'].forEach(function(ty){var du=treatDue(S.cats[k],ty);if(du&&du.next<=e7)nx.push(ty+' for '+S.cats[k].name+' '+short(du.next))});S.cats[k].foods.filter(function(f){return f.main}).forEach(function(f){var o=orderBy(k,f);if(o&&o.by<=e7)nx.push('Order '+f.name.split(' (')[0]+' by '+short(o.by))});var q=(S.cats[k].vq||[]).filter(function(x){return!x.done}).length;if(q)nx.push(q+' question'+(q>1?'s':'')+' for the vet about '+S.cats[k].name)});
  ((S.info&&S.info.bookings)||[]).forEach(function(b){if(b.from&&b.from>=t&&b.from<=e7)nx.push((b.place||'Booking')+' drop-off '+short(b.from))});(S.todos||[]).forEach(function(x){if(!x.done&&x.due&&x.due<=e7)nx.push(x.text+(x.due<t?' (overdue)':' by '+short(x.due)))});
  rows.push('<div class="wsum"><div class="wsh2"><b>Next 7 days</b></div>'+(nx.length?'<ul>'+nx.map(function(x){return'<li>'+esc(x)+'</li>'}).join('')+'</ul>':'<div class="small mute">Nothing due.</div>')+'</div>');
  return rows.join('')}
function weekCard(force){var dow=new Date().getDay(),t=today();if(!force){if(!(dow===0||(dow===1&&new Date().getHours()<14)))return'';try{if(localStorage.getItem(LS+'-ws')===t)return''}catch(e){}}
  return'<details class="card wkc" data-open="wkc"'+(force?'':isOpen('wkc',true))+'><summary><h2 style="display:inline">📊 Your week · '+short(addDays(t,-6))+' to '+short(t)+'</h2></summary>'+weekSummary()+(force?'':'<button class="b s ghost" style="margin-top:8px" data-a="wsdone">Hide until next Sunday</button>')+'</details>'}

function iconizeHTML(h){var keep=[];h=h.replace(/<(textarea|select|nav|svg)\b[\s\S]*?<\/\1>/g,function(m){keep.push(m);return'\u0000'+(keep.length-1)+'\u0000'});
  h=h.replace(/>([^<]+)</g,function(m,t){EMRE.lastIndex=0;if(!EMRE.test(t))return m;EMRE.lastIndex=0;return'>'+t.replace(EMRE,function(x,k){var key=EMI[k]||EMI[k.replace('️','')];return key?ico(key):x})+'<'});
  return h.replace(/\u0000(\d+)\u0000/g,function(m,i){return keep[+i]})}

function bothChart(){var ks=['albert','milly'],L=ks.map(function(k){var c=S.cats[k],w=sorted(c);return{k:k,c:c,w:w,f:w[0]}}).filter(function(x){return x.w.length});if(!L.length)return emptyState('','No weigh-ins yet','','');
  var all=[].concat.apply([],L.map(function(x){return x.w.map(function(p){return p.d})})).sort(),d0=all[0],d1=all[all.length-1],span=Math.max(7,daysBetween(d0,d1));
  function pct(x,kg){return(kg-x.f.kg)/x.f.kg*100}var tg=L.map(function(x){return pct(x,x.c.target)}),vals=[].concat.apply([],L.map(function(x){return x.w.map(function(p){return pct(x,p.kg)})})).concat(tg,[0]);
  var mn=Math.floor(Math.min.apply(0,vals)/5)*5-2,mx=Math.max(4,Math.ceil(Math.max.apply(0,vals)));var W=520,H=210,P=40;function X(d){return P+daysBetween(d0,d)/span*(W-P-14)}function Y(v){return 10+(mx-v)/(mx-mn)*(H-34)}
  var s='<svg viewBox="0 0 '+W+' '+H+'" width="100%">';for(var v=Math.ceil(mn/5)*5;v<=mx;v+=5)s+='<line x1="'+P+'" x2="'+(W-10)+'" y1="'+Y(v)+'" y2="'+Y(v)+'" stroke="var(--line)"/><text x="2" y="'+(Y(v)+4)+'">'+(v>0?'+':'')+v+'%</text>';
  L.forEach(function(x,i){var col=x.k==='albert'?'#e07a2e':'var(--ink)';s+='<line x1="'+P+'" x2="'+(W-10)+'" y1="'+Y(tg[i])+'" y2="'+Y(tg[i])+'" stroke="'+col+'" stroke-dasharray="4 5" opacity=".55"/>'+'<polyline fill="none" stroke="'+col+'" stroke-width="3" stroke-linejoin="round" points="'+x.w.map(function(p){return X(p.d)+','+Y(pct(x,p.kg))}).join(' ')+'"/>'+x.w.map(function(p){return'<circle cx="'+X(p.d)+'" cy="'+Y(pct(x,p.kg))+'" r="4" fill="'+col+'"/>'}).join('')});
  s+='<text x="'+P+'" y="'+(H-4)+'">'+short(d0)+'</text><text x="'+(W-12)+'" y="'+(H-4)+'" text-anchor="end">'+short(d1)+'</text></svg>';
  return s+'<div class="small mute" style="display:flex;gap:14px;flex-wrap:wrap;margin-top:4px">'+L.map(function(x,i){return'<span><b style="color:'+(x.k==='albert'?'#e07a2e':'var(--ink)')+'">━</b> '+esc(x.c.name)+' '+(pct(x,x.w[x.w.length-1].kg)<=0?'':'+')+pct(x,x.w[x.w.length-1].kg).toFixed(1)+'% · goal '+tg[i].toFixed(0)+'%</span>'}).join('')+'</div><div class="note">Change from each cat\'s first weigh-in, so both fit on one scale. Dashed lines are their goals.</div>'}

