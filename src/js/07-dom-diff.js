/* 07-dom-diff: morphKids/morphNode: update the existing page to match the new one instead of rebuilding it. */
function morphKids(a,b){var bk=[].slice.call(b.childNodes),i;for(i=0;i<bk.length;i++){var bn=bk[i],an=a.childNodes[i];if(!an){a.appendChild(bn);continue}morphNode(a,an,bn)}while(a.childNodes.length>bk.length)a.removeChild(a.lastChild)}
function morphNode(parent,a,b){if(a.nodeType!==b.nodeType||a.nodeName!==b.nodeName||(a.nodeType===1&&((a.id||'')!==(b.id||'')||a.getAttribute('data-id')!==b.getAttribute('data-id')))){parent.replaceChild(b,a);return}
  if(a.nodeType===3||a.nodeType===8){if(a.nodeValue!==b.nodeValue)a.nodeValue=b.nodeValue;return}if(a.nodeType!==1)return;
  var ba=b.attributes,aa=a.attributes,j,n;for(j=0;j<ba.length;j++){n=ba[j];if(a.getAttribute(n.name)!==n.value)a.setAttribute(n.name,n.value)}
  for(j=aa.length-1;j>=0;j--){n=aa[j].name;if(!b.hasAttribute(n)){if((n==='src'&&a.hasAttribute('data-ph'))||(n==='href'&&a.hasAttribute('data-phl'))||(n==='style'&&a.closest&&a.closest('.swr')))continue;a.removeAttribute(n)}}
  var tg=a.nodeName;if(tg==='INPUT'){if(document.activeElement!==a){var nv=b.getAttribute('value')||'';if(a.type==='checkbox'||a.type==='radio')a.checked=b.hasAttribute('checked');else if(a.value!==nv)a.value=nv}return}
  if(tg==='TEXTAREA'){if(document.activeElement!==a&&a.value!==b.value)a.value=b.value;return}
  if(tg==='SELECT'){morphKids(a,b);if(document.activeElement!==a){var so=b.querySelector('option[selected]');if(so)a.value=so.value}return}
  if(tg==='DETAILS'){var op=b.hasAttribute('open');if(a.open!==op)a.open=op}
  morphKids(a,b)}

