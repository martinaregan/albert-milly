/* 02-weight-maths: Weight statistics and status (rate of loss, on track or not). */
/* weight maths */
function stats(c){var w=sorted(c);if(!w.length)return null;
  var first=w[0],last=w[w.length-1],r={first:first,last:last,lost:first.kg-last.kg,pct:(first.kg-last.kg)/first.kg*100,toGo:last.kg-c.target};
  var ref=null;for(var i=w.length-2;i>=0;i--){if(daysBetween(w[i].d,last.d)>=5){ref=w[i];break}}
  if(ref){var days=daysBetween(ref.d,last.d);r.rate=(ref.kg-last.kg)/ref.kg*100/days*7;r.kgWeek=(ref.kg-last.kg)/days*7}
  if(r.kgWeek>0&&r.toGo>0){r.eta=addDays(last.d,Math.round(r.toGo/r.kgWeek*7))}
  return r}
function status(r,c){if(!r)return['neutral','No weigh-ins yet'];
  if(r.last.kg<=c.target)return['ok','Target reached'];
  if(r.rate==null)return['neutral','Need 2 weigh-ins 5+ days apart'];
  if(r.rate>1.5)return['bad','Too fast ('+r.rate.toFixed(1)+'%/wk), check with vet'];
  if(r.rate>=0.5)return['ok','On track ('+r.rate.toFixed(1)+'%/wk)'];
  if(r.rate>0)return['warn','Slow ('+r.rate.toFixed(1)+'%/wk)'];
  return daysBetween(r.first.d,r.last.d)<21?['neutral','No change yet, give it a few weeks']:['warn','Not losing yet']}

/* feeding suggestion */
function feed(c){var r=stats(c),dry=firstOf(c,'dry'),wet=firstOf(c,'wet');
  var rer=70*Math.pow(c.target,0.75),lo=0.8*rer,hi=rer;if(c.kcalLo&&c.kcalHi){lo=+c.kcalLo;hi=+c.kcalHi}
  var wetK=wet?c.wetAllowance*wet.kcal:0,dryK=dry?c.dryAllowance*dry.kcal/100:0;
  var o={lo:lo,hi:hi,wetK:wetK,plan:wetK+dryK,dry:dry,wet:wet};
  if(dry){o.dLo=Math.max(0,(lo-wetK)/(dry.kcal/100));o.dHi=Math.max(0,(hi-wetK)/(dry.kcal/100))}
  var st=r&&r.rate!=null&&r.last.kg>c.target?r.rate:null,cur=c.dryAllowance;
  if(st==null)o.step='Keep the current amounts until there are 2 weigh-ins at least 5 days apart. The scale tells you more than any formula.';
  else if(st>1.5){o.next=Math.ceil(cur*1.1/5)*5;o.step='Losing too fast. Go up to about '+o.next+' g dry a day and ring the vet.'}
  else if(st>=0.5)o.step='Rate is good. Keep feeding exactly this.';
  else{o.next=Math.max(Math.floor(cur*0.9/5)*5,o.dLo?Math.ceil(o.dLo/5)*5:0);
    o.step=o.plan<=lo?'Loss is slow but the plan is already at the low end. Check for extra food before cutting, and ask the vet.':'Loss is slow. If it stays like this for 2 weeks, drop dry to about '+o.next+' g a day (roughly 10% less), after checking for extras.'}
  return o}

