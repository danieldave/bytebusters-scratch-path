(function(){
'use strict';
var APP=document.getElementById('app'),TOAST=document.getElementById('toast');
var C=null,ME=null,PR={p:{},z:{},c:{}},F={kind:'all',level:0,show:false};
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function ls(k,v){try{if(v===undefined)return localStorage.getItem(k);if(v===null)localStorage.removeItem(k);else localStorage.setItem(k,v)}catch(e){}return null}
function lsj(k,v){if(v===undefined){try{return JSON.parse(ls(k))}catch(e){return null}}ls(k,v===null?null:JSON.stringify(v))}
function toast(m){TOAST.textContent=m;TOAST.className='toast on';clearTimeout(toast.t);toast.t=setTimeout(function(){TOAST.className='toast'},2600)}
function post(u,b){return fetch(u,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b)}).then(function(r){return r.json().then(function(j){if(!r.ok){var e=new Error(j.error||'x');e.http=r.status;throw e}return j})})}
var KIND={scratch:'Scratch',web:'Website',ai:'Gen AI'},KICON={scratch:'🐱',web:'🌐',ai:'🤖'};
var THEME={'naija-world':'Nigeria meets the world','real-world':'Real-world problem',fun:'Creative & fun'};
/* ---------- data ---------- */
function loadContent(){
  return fetch('/api/content').then(function(r){if(!r.ok)throw 0;return r.json()}).catch(function(){return fetch('/data/content.json').then(function(r){return r.json()})}).then(function(j){lsj('bbs_content',j);return j}).catch(function(){var c=lsj('bbs_content');if(c)return c;throw new Error('offline')});
}
function loadProgress(){
  var id=ls('bb_id');
  if(!id){ME=null;PR=lsj('bbs_guest')||{p:{},z:{}};return Promise.resolve()}
  return post('/api/studio',{id:id,action:'get'}).then(function(j){ME={id:id};PR=merge(j,lsj('bbs_c_'+id));lsj('bbs_c_'+id,PR)}).catch(function(e){
    if(e.http===403){ls('bb_id',null);ME=null;PR=lsj('bbs_guest')||{p:{},z:{}};return}
    ME={id:id};PR=lsj('bbs_c_'+id)||{p:{},z:{}}});
}
function merge(a,b){b=b||{p:{},z:{},c:{}};var o={p:{},z:{},c:{}};['p','z','c'].forEach(function(k){for(var x in b[k])o[k][x]=b[k][x];for(var y in a[k])o[k][y]=a[k][y]});return o}
function persist(){if(ME)lsj('bbs_c_'+ME.id,PR);else lsj('bbs_guest',PR)}
function savePrj(pid){persist();stars();if(!ME)return;post('/api/studio',{id:ME.id,action:'set',pid:pid,s:PR.p[pid].s,m:PR.p[pid].m,lab:PR.p[pid].l?{passed:PR.p[pid].l[0],total:PR.p[pid].l[1]}:undefined}).catch(function(){toast('Saved on this phone.')})}
function saveZ(zid,ok){var was=PR.z[zid];PR.z[zid]=ok||was===true;persist();stars();if(ME)post('/api/studio',{id:ME.id,action:'z',zid:zid,ok:ok?1:0}).catch(function(){})}
/* ---------- stars ---------- */
function pstars(p){var d=PR.p[p.id]||{s:[],m:[]};if(p.lab||p.ai){var l=d.l||[0,p.lab?p.lab.missions.length:p.ai.checks.length],n0=0;if(l[0]>=1)n0=1;if(l[0]>=Math.ceil(l[1]/2))n0=2;if(l[1]&&l[0]>=l[1])n0=3;return n0}var s=(d.s||[]).length,m=(d.m||[]).length,n=0;if(s>=1)n=1;if(s>=p.steps.length)n=2;if(n===2&&(!p.missions.length||m>=p.missions.length))n=3;return n}
function total(){var t=0;(C.projects||[]).forEach(function(p){t+=pstars(p)});(C.puzzles||[]).forEach(function(z){if(PR.z[z.id])t++});return t}
function stars(){var e=document.getElementById('stars');if(e&&C)e.textContent='⭐ '+total()}
function starTxt(n){return '⭐'.repeat(n)+'☆'.repeat(3-n)}
/* ---------- scratchblocks ---------- */
function sbRender(root){
  var go=function(){try{window.scratchblocks.renderMatching('#'+root.id+' pre.blocks',{style:'scratch3',languages:['en'],scale:.8})}catch(e){}};
  if(window.scratchblocks)go();else{var t=0,iv=setInterval(function(){if(window.scratchblocks||++t>40){clearInterval(iv);if(window.scratchblocks)go()}},250)}
}
/* ---------- router ---------- */
function route(){
  var h=location.hash.replace(/^#\/?/,'').split('/');window.scrollTo(0,0);
  if(h[0]==='p'&&h[1])return project(h[1]);
  if(h[0]==='puzzles')return puzzles(h[1]||'all');
  if(h[0]==='me')return me();
  home();
}
function tabs(on){return '<div class="tabs"><button class="'+(on==='home'?'on':'')+'" onclick="location.hash=\'#/\'">🏠 Projects</button><button class="'+(on==='puz'?'on':'')+'" onclick="location.hash=\'#/puzzles\'">🧩 Puzzles</button><button class="'+(on==='me'?'on':'')+'" onclick="location.hash=\'#/me\'">⭐ Me</button></div>'}
/* ---------- home ---------- */
function home(){
  var list=C.projects.filter(function(p){return(F.kind==='all'||p.kind===F.kind)&&(!F.level||p.level===F.level)&&(!F.show||p.showcase)});
  var next=C.projects.filter(function(p){return p.level===1&&pstars(p)<3}).concat(C.projects.filter(function(p){return pstars(p)<3}))[0];
  var h=tabs('home')+'<div class="hero"><h1>Pick something. Build it. ⭐</h1><p>Games, animations, websites and AI helpers. Small steps. No pressure.</p>'+(next?'<a class="btn" href="#/p/'+next.id+'">▶ Start: '+esc(next.title)+'</a>':'')+'</div>';
  h+=daily();
  h+='<div class="filters" id="fk">'+chip('kind','all','All')+chip('kind','scratch','🐱 Scratch')+chip('kind','web','🌐 Websites')+chip('kind','ai','🤖 Gen AI')+'</div>';
  h+='<div class="filters" id="fl">'+chip('level',0,'Any level')+chip('level',1,'⭐ Starter')+chip('level',2,'⭐⭐ Builder')+chip('level',3,'⭐⭐⭐ Pro')+'<button class="fchip '+(F.show?'on':'')+'" data-k="show">🏆 Showcase projects</button></div>';
  h+='<div class="grid">'+(list.length?list.map(card).join(''):'<p>Nothing here yet. Try another filter.</p>')+'</div>';
  APP.innerHTML=h;
  [].forEach.call(APP.querySelectorAll('.fchip'),function(b){b.onclick=function(){var k=b.dataset.k;if(k==='show')F.show=!F.show;else F[k]=k==='level'?+b.dataset.v:b.dataset.v;home()}});
  var dz=document.getElementById('dz');if(dz)dz.onclick=function(){location.hash='#/puzzles/daily'};
  stars();
}
function chip(k,v,t){var on=String(F[k])===String(v);return '<button class="fchip '+(on?'on':'')+'" data-k="'+k+'" data-v="'+v+'">'+t+'</button>'}
function card(p){var n=pstars(p),d=PR.p[p.id]||{s:[]},pc=Math.round(100*(d.s||[]).length/Math.max(1,p.steps.length));
  return '<a class="pcard" href="#/p/'+p.id+'"><span class="st">'+(n?'⭐'.repeat(n):'')+'</span><div class="em">'+esc(p.emoji)+'</div><h3>'+esc(p.title)+'</h3><p>'+esc(p.hook)+'</p><div class="meta"><span class="tag '+p.kind+'">'+KIND[p.kind]+'</span>'+(p.showcase?'<span class="tag show">🏆 Showcase</span>':'')+((p.lab||p.ai)?'<span class="tag">'+(p.ai?'🧪 Prompt Lab':'🛠 Build here')+'</span>':'')+'<span>Level '+p.level+'</span></div><div class="prog"><i style="width:'+pc+'%"></i></div></a>'}
function dayIndex(n){var d=new Date();return (Math.floor(d.getTime()/864e5)+7*0)%Math.max(1,n)}
function daily(){if(!C.puzzles.length)return '';var z=C.puzzles[dayIndex(C.puzzles.length)];var done=PR.z[z.id];
  return '<div class="daily" id="dz" style="cursor:pointer"><b>🎯 Today\'s puzzle</b> '+(done?'✅':'')+'<br><span style="color:var(--mut)">One small puzzle a day. Takes one minute.</span></div>'}
/* ---------- project ---------- */
function project(id){
  var p=C.projects.filter(function(x){return x.id===id})[0];
  if(!p){APP.innerHTML=tabs('home')+'<p>That project is not here. <a href="#/">Go back</a></p>';return}
  var d=PR.p[id]=PR.p[id]||{s:[],m:[]};d.s=d.s||[];d.m=d.m||[];
  var h='<p><a href="#/">← All projects</a></p><div style="font-size:48px">'+esc(p.emoji)+'</div><h1>'+esc(p.title)+'</h1><p>'+esc(p.hook)+'</p>';
  h+='<div><span class="tag '+p.kind+'">'+KICON[p.kind]+' '+KIND[p.kind]+'</span> '+(p.showcase?'<span class="tag show">🏆 Showcase project</span> ':'')+'<span class="tag">Level '+p.level+'</span> '+(p.themes||[]).map(function(t){return '<span class="tag">'+esc(THEME[t]||t)+'</span>'}).join(' ')+'</div>';
  h+='<div class="bigstars" id="ps">'+starTxt(pstars(p))+'</div>';
  if(p.problem)h+='<div class="card"><b>🌍 Why this matters</b><p>'+esc(p.problem)+'</p></div>';
  if(p.learn&&p.learn.length)h+='<div class="learnrow"><b>You will learn:</b><br>'+p.learn.map(function(l){return '<span>'+esc(l)+'</span>'}).join('')+'</div>';
  if(p.link)h+='<p><a class="btn" href="'+esc(p.link)+'" target="_blank" rel="noopener">🔗 Open the live '+esc(p.title)+'</a></p>';
  h+='<h2 class="sec">Read first</h2><div id="steps"></div>';
  if(p.ai)h+='<h2 class="sec">🧪 Prompt Lab</h2><div id="labroot"></div>';
  if(p.lab)h+='<h2 class="sec">🧪 Build it here</h2><p style="color:var(--mut);margin-top:0">Type in the editor. Press Run. Missions turn green when they work. It saves as you go.</p><div id="labroot"></div>';
  if(p.missions.length&&!p.lab&&!p.ai){h+='<h2 class="sec">Missions</h2><div id="mis"></div>';
    if(p.kind==='scratch'&&p.missions.some(function(m){return m.rule}))h+='<div class="upl"><b>🔍 Check my Scratch project</b><p style="color:var(--mut);font-size:15px;margin:4px 0">On a PC: in Scratch choose File → Save to your computer. Then pick the .sb3 file here. Nothing is uploaded; it is checked on your device.</p><input type="file" id="sb3" accept=".sb3"><div id="chk" class="res"></div></div>'}
  if(p.ask)h+='<div class="ask"><b>🔎 Go and ask</b><br>'+esc(p.ask)+'</div>';
  if(p.remix)h+='<div class="remix"><b>🎨 Make it yours</b><br>'+esc(p.remix)+'</div>';
  APP.innerHTML=h;
  var S=document.getElementById('steps');
  S.innerHTML=p.steps.map(function(s,i){var on=d.s.indexOf(i)>=0;return '<button class="step '+(on?'done':'')+'" data-i="'+i+'"><span class="box">'+(on?'✓':'')+'</span><span><b>'+(i+1)+'. '+esc(s.t)+'</b><span>'+esc(s.b)+'</span></span></button>'}).join('');
  [].forEach.call(S.querySelectorAll('.step'),function(b){b.onclick=function(){tog(d.s,+b.dataset.i);savePrj(id);afterTick(p,d,'steps');project(id)}});
  var M=document.getElementById('mis');
  if(M){M.innerHTML=p.missions.map(function(m,i){var on=d.m.indexOf(i)>=0;return '<button class="step '+(on?'done':'')+'" data-i="'+i+'"><span class="box">'+(on?'✓':'')+'</span><span class="mis"><span><b>'+esc(m.t)+'</b></span></span></button>'}).join('');
    [].forEach.call(M.querySelectorAll('.step'),function(b){b.onclick=function(){tog(d.m,+b.dataset.i);savePrj(id);afterTick(p,d,'m');project(id)}})}
  if(p.lab)mountLab(p,d);
  if(p.ai)mountPrompt(p,d);
  var f=document.getElementById('sb3');if(f)f.onchange=function(){if(f.files[0])check(p,d,f.files[0])};
}
function mountPrompt(p,d){
  var root=document.getElementById('labroot');PR.c=PR.c||{};var saved=PR.c[p.id]&&PR.c[p.id].code,winToast=false;
  if(!window.PromptLab){root.innerHTML='<p>Loading…</p>';return}
  window.PromptLab.mount(root,p.ai,{text:saved,
    onChange:function(text,sc){PR.c[p.id]={code:text,t:Date.now()};var o=PR.p[p.id]=PR.p[p.id]||{s:[],m:[]},prev=o.l?o.l[0]:0;
      if(sc.passed>prev||!o.l){o.l=[Math.max(prev,sc.passed),sc.total];o.m=[];for(var i=0;i<o.l[0];i++)o.m.push(i);savePrj(p.id)}else persist();
      var e=document.getElementById('ps');if(e)e.textContent=starTxt(pstars(p));
      if(ME)post('/api/studio',{id:ME.id,action:'code',pid:p.id,code:text}).catch(function(){})},
    onWin:function(){if(!winToast){winToast=true;toast('🏆 Brilliant prompt!')}}});
}
var LABTH={SHOP:'',TAG:'',CLR:'',items:[]};
function mountLab(p,d){
  var root=document.getElementById('labroot');if(!window.BBLab){setTimeout(function(){window.BBLab?mountLab(p,d):root.innerHTML='<p>The editor is loading…</p>'},800);return}
  var L=JSON.parse(JSON.stringify(p.lab));L.week=1;PR.c=PR.c||{};
  window.BBLab.renderLab(root,'wc-'+p.id,L,LABTH,{id:ME?ME.id:'guest',progress:function(){return {}},
    loadServer:function(){return Promise.resolve(PR.c[p.id]||null)},
    saveServer:function(k,code){PR.c[p.id]={code:code,t:Date.now()};persist();if(ME)post('/api/studio',{id:ME.id,action:'code',pid:p.id,code:code}).catch(function(){})},
    onLab:function(lab,won){var o=PR.p[p.id]=PR.p[p.id]||{s:[],m:[]};o.l=[lab.passed,lab.total];o.m=[];for(var i=0;i<lab.passed;i++)o.m.push(i);savePrj(p.id);var e=document.getElementById('ps');if(e)e.textContent=starTxt(pstars(p));if(won)toast('🏆 Every mission is green!')}});
}
function tog(a,i){var k=a.indexOf(i);if(k>=0)a.splice(k,1);else a.push(i)}
function afterTick(p,d,w){var n=pstars(p);if(w==='steps'&&d.s.length===p.steps.length)toast('🎉 All steps done!');if(n===3)toast('🏆 3 stars! You finished '+p.title)}
function check(p,d,file){
  var out=document.getElementById('chk');out.innerHTML='<p>Checking…</p>';
  var go=function(){window.JSZip.loadAsync(file).then(function(z){var f=z.file('project.json');if(!f)throw 0;return f.async('string')}).then(function(t){
    var st=window.SRules.stats(JSON.parse(t)),h='<ul>',got=0,tot=0;
    p.missions.forEach(function(m,i){if(!m.rule)return;tot++;var ok=window.SRules.evalRule(m.rule,st);if(ok){got++;if(d.m.indexOf(i)<0)d.m.push(i)}h+='<li><span class="'+(ok?'yes':'no')+'">'+(ok?'✅ Found':'⬜ Not yet')+'</span> '+esc(m.t)+'</li>'});
    h+='</ul><p><b>'+got+' of '+tot+' found.</b> '+(got===tot?'🎉 Great build!':'Keep going. You can check again any time.')+'</p>';out.innerHTML=h;savePrj(p.id);[].forEach.call(document.querySelectorAll('#mis .step'),function(b){var on=d.m.indexOf(+b.dataset.i)>=0;b.className='step'+(on?' done':'');b.querySelector('.box').textContent=on?'✓':''});document.getElementById('ps').textContent=starTxt(pstars(p))
  }).catch(function(){out.innerHTML='<p style="color:var(--red)">I could not read that file. In Scratch use File → Save to your computer and pick the .sb3 file.</p>'})};
  if(window.JSZip)go();else setTimeout(function(){window.JSZip?go():out.innerHTML='<p>The checker is still loading. Try again in a moment.</p>'},1500);
}
/* ---------- puzzles ---------- */
var Q=null;
function puzzles(track){
  var h=tabs('puz')+'<h1>🧩 Puzzles</h1><p>Pick a topic. 5 puzzles. Learn from every answer.</p><div class="filters">'+[['all','All'],['scratch','🐱 Scratch'],['web','🌐 Websites'],['ai','🤖 Gen AI'],['daily','🎯 Today']].map(function(x){return '<button class="fchip '+(track===x[0]?'on':'')+'" data-t="'+x[0]+'">'+x[1]+'</button>'}).join('')+'</div>';
  APP.innerHTML=h+'<div id="pz"></div>';
  [].forEach.call(APP.querySelectorAll('.fchip'),function(b){b.onclick=function(){location.hash='#/puzzles/'+b.dataset.t}});
  var pool=C.puzzles.filter(function(z){return track==='all'||track==='daily'||z.track===track});
  if(!pool.length){document.getElementById('pz').innerHTML='<p>No puzzles yet.</p>';return}
  var pick;
  if(track==='daily')pick=[C.puzzles[dayIndex(C.puzzles.length)]];
  else{var un=pool.filter(function(z){return !PR.z[z.id]}),dn=pool.filter(function(z){return PR.z[z.id]});pick=shuffle(un).concat(shuffle(dn)).slice(0,5)}
  Q={list:pick,i:0,score:0,res:[]};runQ();
}
function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=a[i];a[i]=a[j];a[j]=t}return a}
function runQ(){
  var box=document.getElementById('pz');
  if(Q.i>=Q.list.length){box.innerHTML='<div class="zbox"><h2 style="margin-top:0">You got '+Q.score+' of '+Q.list.length+'! '+(Q.score===Q.list.length?'🎉':'')+'</h2><div class="dots">'+Q.res.map(function(r){return '<i class="'+(r?'good':'bad')+'"></i>'}).join('')+'</div><p>Every puzzle you solve gives you a ⭐.</p><div class="rowbtn"><button class="btn" id="again">Play again</button><a class="btn alt" href="#/">Back to projects</a></div></div>';document.getElementById('again').onclick=function(){puzzles(location.hash.split('/')[2]||'all')};return}
  var z=Q.list[Q.i],id='zb'+Q.i;
  var h='<div class="zbox" id="'+id+'"><div class="dots">'+Q.list.map(function(_,k){return '<i class="'+(k<Q.i?(Q.res[k]?'good':'bad'):(k===Q.i?'on':''))+'"></i>'}).join('')+'</div><span class="tag '+z.track+'">'+KIND[z.track]+'</span> <span class="tag">Level '+z.level+'</span>';
  if(z.type==='quiz'||z.type==='read'){
    h+=(z.type==='read'?'<p><b>Read the blocks. What will happen?</b></p><div class="sbq"><pre class="blocks">'+esc(z.script)+'</pre></div>':'')+'<p><b>'+esc(z.q)+'</b></p>'+z.o.map(function(o,k){return '<button class="opt" data-k="'+k+'">'+esc(o)+'</button>'}).join('')+'<div id="fb"></div></div>';
    box.innerHTML=h;sbRender(box);
    [].forEach.call(box.querySelectorAll('.opt'),function(b){b.onclick=function(){var k=+b.dataset.k,ok=k===z.a;[].forEach.call(box.querySelectorAll('.opt'),function(x){x.disabled=true;if(+x.dataset.k===z.a)x.className+=' ok'});if(!ok)b.className+=' no';done(z,ok)}});
  }else if(z.type==='fix'){
    h+='<p><b>'+esc(z.title)+'</b></p><div id="rows">'+z.blocks.map(function(b,k){return '<button class="zrow" data-k="'+k+'">'+(z.track==='scratch'?'<pre class="blocks">'+esc(b)+'</pre>':'<span>'+esc(b)+'</span>')+'</button>'}).join('')+'</div><div id="fb"></div></div>';
    box.innerHTML=h;sbRender(box);
    [].forEach.call(box.querySelectorAll('.zrow'),function(b){b.onclick=function(){var k=+b.dataset.k,ok=k===z.bad;[].forEach.call(box.querySelectorAll('.zrow'),function(x){x.disabled=true;if(+x.dataset.k===z.bad)x.className+=' no'});if(ok)b.className+=' ok';done(z,ok)}});
  }else{ // order
    var order=shuffle(z.blocks.map(function(_,k){return k})),got=[];
    var draw=function(){
      box.innerHTML='<div class="zbox" id="'+id+'"><span class="tag scratch">Scratch</span> <span class="tag">Level '+z.level+'</span><p><b>'+esc(z.title)+'</b></p><p style="color:var(--mut);margin:0">Tap the blocks in the right order, from the top.</p><div id="ans" style="margin:8px 0;min-height:30px">'+got.map(function(k,n){return '<div class="zrow"><span class="n">'+(n+1)+'</span><pre class="blocks" style="display:inline-block;vertical-align:middle">'+esc(z.blocks[k])+'</pre></div>'}).join('')+'</div><div id="rows">'+order.filter(function(k){return got.indexOf(k)<0}).map(function(k){return '<button class="zrow" data-k="'+k+'"><pre class="blocks">'+esc(z.blocks[k])+'</pre></button>'}).join('')+'</div><div class="rowbtn">'+(got.length&&got.length<z.blocks.length?'<button class="btn alt" id="undo">↩ Undo</button>':'')+'</div><div id="fb"></div></div>';
      sbRender(box);
      [].forEach.call(box.querySelectorAll('#rows .zrow'),function(b){b.onclick=function(){got.push(+b.dataset.k);if(got.length===z.blocks.length){var ok=got.every(function(k,n){return k===n});draw();[].forEach.call(box.querySelectorAll('#ans .zrow'),function(r,n){r.className+=got[n]===n?' ok':' no'});done(z,ok)}else draw()}});
      var u=document.getElementById('undo');if(u)u.onclick=function(){got.pop();draw()};
    };draw();
  }
}
function done(z,ok){
  if(ok)Q.score++;Q.res.push(ok);saveZ(z.id,ok);
  var fb=document.getElementById('fb');
  fb.innerHTML='<div class="why"><b>'+(ok?'✅ Yes!':'Not quite.')+'</b> '+esc(z.why||'')+'</div><div class="rowbtn"><button class="btn" id="nx">'+(Q.i+1>=Q.list.length?'See my score':'Next →')+'</button></div>';
  document.getElementById('nx').onclick=function(){Q.i++;runQ()};
}
/* ---------- me ---------- */
function me(){
  var t=total(),sp=C.projects.filter(function(p){return pstars(p)===3}).length,pz=C.puzzles.filter(function(z){return PR.z[z.id]}).length;
  var h=tabs('me')+'<h1>⭐ '+t+' stars</h1><div class="card"><p>🏆 Projects finished: <b>'+sp+'</b> of '+C.projects.length+'</p><p>🧩 Puzzles solved: <b>'+pz+'</b> of '+C.puzzles.length+'</p></div>';
  if(ME)h+='<div class="card"><b>You are signed in.</b><p style="color:var(--mut)">Your stars are saved to your ByteBusters ID, so you can use any phone.</p><button class="btn alt" id="out">Sign out</button></div>';
  else h+='<div class="card"><b>Have a ByteBusters ID?</b><p style="color:var(--mut)">Type it so your stars follow you to any phone. No ID? You can still play. Your stars stay on this phone.</p><input id="idin" placeholder="Example: YWS-ABC4" style="width:100%;padding:12px;font:inherit;border-radius:10px;border:2px solid var(--line);text-transform:uppercase"><p id="ide" style="color:var(--red)"></p><button class="btn" id="inb">Save my stars</button></div>';
  var done=C.projects.filter(function(p){return pstars(p)===3});
  if(done.length)h+='<h2 class="sec">My finished projects</h2><div class="grid">'+done.map(card).join('')+'</div>';
  APP.innerHTML=h;
  var o=document.getElementById('out');if(o)o.onclick=function(){ls('bb_id',null);ME=null;PR=lsj('bbs_guest')||{p:{},z:{}};me();stars()};
  var b=document.getElementById('inb');if(b)b.onclick=function(){var v=document.getElementById('idin').value.toUpperCase().replace(/\s/g,'');post('/api/studio',{id:v,action:'get'}).then(function(j){ls('bb_id',v);var g=PR;ME={id:v};PR=merge(j,g);lsj('bbs_c_'+v,PR);
    // push local guest progress up
    Object.keys(g.p||{}).forEach(function(k){if(!j.p[k])post('/api/studio',{id:v,action:'set',pid:k,s:g.p[k].s||[],m:g.p[k].m||[]}).catch(function(){})});
    Object.keys(g.z||{}).forEach(function(k){if(g.z[k]&&!j.z[k])post('/api/studio',{id:v,action:'z',zid:k,ok:1}).catch(function(){})});
    lsj('bbs_guest',null);toast('Signed in!');me();stars()}).catch(function(){document.getElementById('ide').textContent='That ID was not found. Check it and try again.'})};
}
/* ---------- boot ---------- */
window.addEventListener('hashchange',function(){if(C)route()});
Promise.all([loadContent(),loadProgress()]).then(function(r){C=r[0];stars();route()}).catch(function(){APP.innerHTML='<div class="card"><b>I could not load the Studio.</b><p>Check your internet and try again.</p></div>'});
})();
