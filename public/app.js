(function(){
'use strict';
var app=document.getElementById('app'),who=document.getElementById('who'),DATA=null,MAN=null,ME=null,OFFLINE=false;
var CN={blue:'Variables',red:'Conditionals',green:'Loops',purple:'Events'};
var BADGE_TXT={blue:'Variable Builder',red:'If Master',green:'Loop Legend',purple:'Event Hero',builder:'Builder'};
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function toast(t){var e=document.getElementById('toast');e.textContent=t;e.className='toast on';setTimeout(function(){e.className='toast'},2200)}
function ls(k,v){try{if(v===undefined)return localStorage.getItem(k);if(v===null)localStorage.removeItem(k);else localStorage.setItem(k,v)}catch(e){}return null}
function lsj(k,v){if(v===undefined){try{return JSON.parse(ls(k)||'null')}catch(e){return null}}ls(k,JSON.stringify(v))}
function post(u,b){return fetch(u,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b)}).then(function(r){return r.json().then(function(j){if(!r.ok){var e=new Error(j.error||'Error');e.http=true;throw e}return j})})}
function chips(c){return (c||[]).map(function(x){return '<span class="chip '+x+'">'+CN[x]+'</span>'}).join('')}
function school(){return DATA.schools[ME.school]}
function wkey(w,term){return (!term||term==='t1'?'w':term+'w')+w}
function prog(w,term){return (ME.progress[wkey(w,term)])||{}}
function doneCount(term){var n=0;for(var w=1;w<=10;w++)if(prog(w,term).done)n++;return n}
function labCount(term){var n=0;for(var w=1;w<=10;w++){var l=prog(w,term).lab;if(l&&l.total&&l.passed>=l.total)n++}return n}
var CFG=lsj('bb_cfg')||{t1:true,t2:false,t3:false},WEB=null;
function termOpen(t){return t==='t1'||!!CFG[t]}
function has(b){return (ME.badges||[]).indexOf(b)>=0}

/* ---- offline queue: progress is never lost, it syncs when the phone is online ---- */
function cacheMe(){lsj('bb_prof',{id:ME.id,name:ME.name,school:ME.school,progress:ME.progress,badges:ME.badges,share:ME.share})}
function queue(o){var q=lsj('bb_q')||[];q.push(o);lsj('bb_q',q)}
function flush(){var q=lsj('bb_q')||[];if(!q.length||!navigator.onLine)return Promise.resolve();lsj('bb_q',[]);
  return q.reduce(function(p,o){return p.then(function(){return post('/api/progress',o).catch(function(e){if(!e.http)queue(o)})})},Promise.resolve())}
window.addEventListener('online',function(){OFFLINE=false;banner();flush().then(function(){toast('Back online. Saved ✓')})});
window.addEventListener('offline',function(){OFFLINE=true;banner()});
function banner(){var b=document.getElementById('off');if(!b){b=document.createElement('div');b.id='off';b.className='offbar';document.body.insertBefore(b,document.body.children[1])}
  b.textContent=(OFFLINE||!navigator.onLine)?'📴 Offline: your work is saved on this phone and will sync later.':'';b.style.display=b.textContent?'block':'none'}

function login(msg){
  who.textContent='';
  app.innerHTML='<div class="login o-in"><div class="mark" aria-hidden="true"></div><h1>Welcome, game maker!</h1><p class="lead">Type your access ID from your ID card.</p><div class="card"><label for="id" class="o-eyebrow" style="display:block;margin-bottom:8px">Access ID</label><input id="id" type="text" inputmode="text" autocapitalize="characters" autocomplete="off" spellcheck="false" placeholder="UHS-4K7M" maxlength="9"><p class="err" id="err" role="alert">'+(msg||'')+'</p><button class="btn" id="go" style="width:100%;min-height:54px;font-size:1.08rem">Let me in</button></div><p style="color:var(--mut);font-size:15px;text-align:center">Lost your card? Ask your ByteBusters trainer. Your stars and lessons are saved on your ID, so you can continue on any phone.</p></div>';
  var inp=document.getElementById('id');inp.value=ls('bb_id')||'';
  function go(){var b=document.getElementById('go');b.disabled=true;b.textContent='Checking...';
    doLogin(inp.value).then(function(){route()}).catch(function(e){document.getElementById('err').textContent=e.message;b.disabled=false;b.textContent='Let me in'})}
  document.getElementById('go').onclick=go;inp.onkeydown=function(e){if(e.key==='Enter')go()}
}
function doLogin(id){
  return post('/api/login',{id:id}).then(function(j){ME=j;ME.badges=j.badges||[];ls('bb_id',j.id);cacheMe();OFFLINE=false;banner();flush()}).catch(function(e){
    if(e.http)throw e;
    var c=lsj('bb_prof');if(c&&(!id||c.id===String(id).toUpperCase().replace(/\s/g,'')||c.id===ls('bb_id'))){ME=c;OFFLINE=true;banner();return}
    throw new Error('No internet and nothing saved on this phone yet.')})
}
function logout(){ls('bb_id',null);lsj('bb_prof',null);ME=null;login()}

function badgeRow(){
  return ['blue','red','green','purple','builder'].map(function(b){var on=has(b);return '<span class="badge '+(on?'on ':'')+b+'" title="'+BADGE_TXT[b]+'"><i>'+(b==='builder'?'🔨':{blue:'🔵',red:'🔴',green:'🟢',purple:'🟣'}[b])+'</i>'+BADGE_TXT[b]+'</span>'}).join('')}

function home(){
  var S=school(),n=doneCount(),term=ls('bb_term')||'t1';
  who.innerHTML='<span style="max-width:34vw;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+esc(ME.name||ME.id)+'</span><button id="out" aria-label="Exit and log out">Exit</button>';document.getElementById('out').onclick=logout;
  var nx=0;for(var w0=1;w0<=10;w0++)if(!prog(w0).done){nx=w0;break}
  var h='<div class="hello o-glow o-in"><span class="o-eyebrow">'+esc(S.name)+'</span><h1>Hello'+(ME.name?', '+esc(ME.name.split(' ')[0]):'')+'! 👋</h1><p style="color:var(--mut);margin:0">Your ID <span class="idchip">'+esc(ME.id)+'</span></p></div>';
  h+='<div class="places">'+[['/studio','🎮','ByteBusters Studio','Fun projects, puzzles and the showcase games. Earn stars!','var(--bb-yellow)'],['/webdev','💻','Web Foundations Bridge','10 weeks: HTML, CSS and JavaScript with Scam Shield, Harvest Calendar and Apprentice Pathway.','var(--bb-green)'],['/journey','🗺','Your Coding Journey','Four years, twelve terms — from Scratch to a real capstone. Each term you finish unlocks the next.','var(--bb-yellow)'],['/ai-journey','🤖','The AI Journey','Its own four-level path: Safe AI Builder → AI Creator → AI App Builder → AI Agents & Leadership.','var(--purple)']].map(function(x){return '<a class="card place" href="'+x[0]+'" style="--c:'+x[4]+'"><span class="ic" aria-hidden="true">'+x[1]+'</span><b>'+x[2]+'</b><span class="d">'+x[3]+'</span></a>'}).join('')+'</div>';
  h+='<div class="tabs">'+DATA.terms.map(function(t){return '<button data-t="'+t.id+'" class="'+(t.id===term?'on':'')+'">'+esc(t.name.split(':')[0])+(t.ready?'':' 🔒')+'</button>'}).join('')+'</div>';
  if(term!=='t1'){h+=termHome(term);app.innerHTML=h;bindTabs();window.scrollTo(0,0);return}
  h+='<div class="card"><div class="next"><div class="grow"><b>'+n+' of 10 weeks done</b><div class="prog" style="margin-top:8px"><i style="width:'+n*10+'%"></i></div></div>'+(nx?'<a class="btn go" href="#w'+nx+'">'+(n?'Continue':'Start')+' Week '+nx+' →</a>':'')+'</div><p style="margin:.9em 0 0">'+badgeRow()+'</p></div>';
  h+='<div class="card"><b>Your 3 games</b><p style="margin:.3em 0">'+S.games.map(function(g){return esc(g.name)}).join(' → ')+'</p><p class="why">You finish with a game that uses all 4 logic colours.</p><p>'+chips(['blue','red','green','purple'])+'</p></div>';
  h+='<div class="sec-h"><h2>Your 10 weeks</h2><span class="why">Tap a week to open it</span></div>';
  S.lessons.forEach(function(L){var p=prog(L.week);
    h+='<a class="card week'+(p.done?' done':'')+'" href="#w'+L.week+'"><span class="n">'+(p.done?'✓':L.week)+'</span><span><b>'+esc(L.title)+'</b><small>'+esc(L.game.name)+' · '+esc(L.topic)+'</small>'+(p.quiz!=null?'<small>Quiz: '+'⭐'.repeat(p.quiz)+'☆'.repeat(Math.max(0,3-p.quiz))+'</small>':'')+'</span></a>'});
  if(n===10)h+='<div class="card cert"><h2>🏆 You did it!</h2><p>You finished the ByteBusters Scratch Path.</p><a class="btn" href="#cert">See my certificate</a></div>';
  h+='<div class="card"><b>👪 Show your parent</b><p class="why">A private page that shows only your first name, weeks and badges. No ID.</p><button class="btn alt" id="par">Share on WhatsApp</button> <button class="btn alt" id="parc">Copy link</button></div>';
  h+='<details class="card"><summary>How do I open the game files?</summary><p>1. Tap <b>Download</b> in a lesson.<br>2. Open <b>scratch.mit.edu/create</b> (or turbowarp.org).<br>3. Tap <b>File → Load from your computer</b> and pick the file.<br>On a phone the Scratch editor is small. You can use <b>Play the game</b> and <b>Read mode</b> in each lesson, then build on a computer at the centre.</p></details>';
  app.innerHTML=h;bindTabs();window.scrollTo(0,0);
  var link=location.origin+'/parent?t='+ME.share;
  document.getElementById('par').onclick=function(){window.open('https://wa.me/?text='+encodeURIComponent('See my ByteBusters Scratch progress: '+link),'_blank')};
  document.getElementById('parc').onclick=function(){try{navigator.clipboard.writeText(link).then(function(){toast('Link copied')},function(){prompt('Copy this link',link)})}catch(e){prompt('Copy this link',link)}};
}
function termHome(term){
  var T=DATA.terms.filter(function(x){return x.id===term})[0],h='';
  if(!termOpen(term)){
    h+='<div class="card"><h2 style="margin-top:0">🔒 '+esc(T.name)+'</h2><p>This term opens when your trainer says so. Here is what is coming:</p><ul>'+T.weeks.map(function(w){return '<li><b>Week '+w[0]+':</b> '+esc(w[1])+'</li>'}).join('')+'</ul><p><b>Project:</b> '+esc(T.project)+'</p></div>';return h}
  if(!WEB){h+='<div class="card">Loading lessons…</div>';fetch('/data/web.json').then(function(r){return r.json()}).then(function(d){WEB=d;home()}).catch(function(){});return h}
  var W=WEB.terms[term],th=WEB.themes[ME.school],n=doneCount(term),lc=labCount(term);
  h+='<div class="card"><b>'+n+' of 10 weeks done</b> <span class="why">· '+lc+' labs complete</span><div class="prog" style="margin-top:8px"><i style="width:'+n*10+'%"></i></div>';
  if(term==='t2')h+='<p style="margin:.7em 0 0">'+webBadge('web')+'</p>';else h+='<p style="margin:.7em 0 0">'+webBadge('js')+webBadge('php')+'</p>';
  h+='</div><div class="card"><b>Your project: '+esc(th.SHOP)+'</b><p class="why">'+(term==='t2'?'Your stall gets a real web page and an order form that checks itself.':'Your stall goes digital: a cash register in JavaScript, then receipts in PHP.')+' All prices are examples. Change them to real prices from your market.</p></div>';
  W.lessons.forEach(function(L){var p=prog(L.week,term),lb=p.lab;
    h+='<a class="card week'+(p.done?' done':'')+'" href="#'+term+'w'+L.week+'"><span class="n">'+(p.done?'✓':L.week)+'</span><span><b>'+esc(L.title)+'</b><small>'+esc(L.topic)+'</small><small>'+L.chips.map(function(c){return esc(c)}).join(' · ')+(lb&&lb.total?' · Lab '+lb.passed+'/'+lb.total:'')+'</small>'+(p.quiz!=null?'<small>Quiz: '+'⭐'.repeat(p.quiz)+'☆'.repeat(Math.max(0,3-p.quiz))+'</small>':'')+'</span></a>'});
  return h}
var WB={web:['🌐','Web Builder'],js:['⚡','JS Maker'],php:['🐘','PHP Starter']};
function webBadge(b){var on=has(b);return '<span class="badge '+(on?'on ':'')+'" title="'+WB[b][1]+'"><i>'+WB[b][0]+'</i>'+WB[b][1]+'</span>'}
function loadScript(src){return new Promise(function(ok,no){if(document.querySelector('script[data-s="'+src+'"]'))return ok();var s=document.createElement('script');s.src=src;s.dataset.s=src;s.onload=ok;s.onerror=no;document.head.appendChild(s)})}
function webLesson(term,w){
  if(!termOpen(term)){location.hash='';return}
  var ready=WEB?Promise.resolve():fetch('/data/web.json').then(function(r){return r.json()}).then(function(d){WEB=d});
  app.innerHTML='<p><a href="#">← All weeks</a></p><div class="card">Loading your lab…</div>';
  ready.then(function(){var L=WEB.terms[term].lessons[w-1];if(!L)return home();return Promise.all([loadScript('/lab.js'),L.kind==='php'?loadScript('/php-lite.js'):null]).then(function(){drawWeb(term,w,L)})}).catch(function(){app.innerHTML='<p><a href="#">← All weeks</a></p><p class="err">Could not load the lab. Check your data and try again.</p>'});
}
function drawWeb(term,w,L){
  var th=WEB.themes[ME.school],p=prog(w,term),F=function(x){return window.BBLab.fill(x,th)};
  var h='<p><a href="#">← All weeks</a></p><h1>Week '+w+': '+esc(L.title)+'</h1><p>'+L.chips.map(function(c){return '<span class="chip web">'+esc(c)+'</span>'}).join('')+'</p><p class="why">Curriculum: '+esc(L.cur)+' · '+esc(L.topic)+'</p>';
  h+='<h2>The big idea</h2><p>'+esc(F(L.big))+'</p><div class="card story">'+esc(F(L.analogy))+'</div>';
  h+='<h2>Learn this first</h2><ul class="learn">'+L.steps.map(function(x){return '<li>'+esc(F(x))+'</li>'}).join('')+'</ul>';
  h+='<div id="labroot"></div>';
  h+='<h2>Your turn</h2><div class="card">'+esc(F(L.turn))+'</div>';
  h+='<h2>Quick check</h2><div id="quiz"></div>';
  h+='<div class="card" style="text-align:center"><button class="btn" id="done" style="width:100%">'+(p.done?'✓ Week done (tap to undo)':'I finished this week')+'</button></div>';
  h+='<p style="display:flex;justify-content:space-between">'+(w>1?'<a href="#'+term+'w'+(w-1)+'">← Week '+(w-1)+'</a>':'<span></span>')+(w<10?'<a href="#'+term+'w'+(w+1)+'">Week '+(w+1)+' →</a>':'')+'</p>';
  app.innerHTML=h;window.scrollTo(0,0);
  document.getElementById('done').onclick=function(){var d=!prog(w,term).done;save(w,{done:d},term).then(function(){toast(d?'Well done! ⭐':'Okay');checkWebBadges(term);drawWeb(term,w,L)})};
  quiz(w,{quiz:L.quiz},term);
  window.BBLabRoot=document.getElementById('labroot');
  window.BBLab.renderLab(document.getElementById('labroot'),term,L,th,{
    id:ME.id,progress:function(){return prog(w,term)},
    loadServer:function(key){return post('/api/code',{id:ME.id,key:key,action:'get'}).catch(function(){return null})},
    saveServer:function(key,code){post('/api/code',{id:ME.id,key:key,code:code}).catch(function(){})},
    onLab:function(lab,won){var cur=prog(w,term).lab||{};if(lab.passed>(cur.passed||0)||lab.peeked!==!!cur.peeked||(lab.total&&!cur.total)){save(w,{lab:lab},term).then(function(){checkWebBadges(term)})}if(won){toast('🎉 Lab complete!');var wn=document.getElementById('win');if(wn&&wn.scrollIntoView)wn.scrollIntoView({block:'center',behavior:'smooth'})}}
  });
}
function checkWebBadges(term){
  var add=[];
  function all(a,b){for(var w=a;w<=b;w++){var l=prog(w,term).lab;if(!(l&&l.total&&l.passed>=l.total))return false}return true}
  if(term==='t2'&&all(1,10)&&!has('web'))add.push('web');
  if(term==='t3'&&all(1,6)&&!has('js'))add.push('js');
  if(term==='t3'&&all(7,10)&&!has('php'))add.push('php');
  if(add.length){ME.badges=(ME.badges||[]).concat(add);toast('🎖 New badge: '+add.map(function(b){return WB[b][1]}).join(', '));post('/api/progress',{id:ME.id,week:10,term:term,badges:add}).catch(function(){})}
}
function bindTabs(){[].forEach.call(document.querySelectorAll('.tabs button'),function(b){b.onclick=function(){ls('bb_term',b.dataset.t);home()}})}

function cert(){
  if(doneCount()<10){location.hash='';return}
  var S=school(),d=new Date().toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'});
  app.innerHTML='<p class="noprint"><a href="#">← Back</a></p><div class="cert big"><div class="seal">🏆</div><p class="why">ByteBusters Coding Centre</p><h1>Certificate of Completion</h1><p>This is to certify that</p><h2 class="nm">'+esc(ME.name||ME.id)+'</h2><p>of <b>'+esc(S.name)+'</b> completed the<br><b>First Term Scratch Path</b> (10 weeks)'+(['blue','red','green','purple'].every(has)?'<br>and built scripts with all four logic colours.':'')+'</p><p>'+badgeRow()+'</p><p class="why">Games: '+S.games.map(function(g){return esc(g.name)}).join(', ')+'</p><p class="why">'+d+'</p><div class="sig">Project Assistant and Centre Lead</div></div><p class="noprint"><button class="btn" id="pr">Print or save as PDF</button></p>';
  document.getElementById('pr').onclick=function(){window.print()};
}

function lessonSteps(L){return{a:L.start?+/step(\d)/.exec(L.start)[1]:0,b:+/step(\d)/.exec(L.goal)[1],slug:L.goal.split('-step')[0]}}
function lesson(w){
  var S=school(),L=S.lessons[w-1];if(!L)return home();var p=prog(w),steps=p.steps||[],LS=lessonSteps(L);
  var h='<p><a href="#">← All weeks</a></p><h1>Week '+w+': '+esc(L.title)+'</h1><p>'+chips(L.colours)+(L.colours.length?'':'<span class="chip grey">Getting to know Scratch</span>')+'</p>';
  h+='<p class="why">Curriculum: '+esc(L.topic)+'</p>';
  h+='<div class="card"><b>Game: '+esc(L.game.name)+'</b><p class="story">'+esc(L.game.story)+'</p><button class="btn alt" id="playbtn">▶ Play the finished game</button><p class="why" id="playnote">First time uses about 4 MB of data. After that it works offline.</p><div id="playbox"></div></div>';
  h+='<h2>The big idea</h2><p>'+esc(L.big)+'</p>';
  h+='<h2>Do this</h2><ol class="steps" id="steps">'+L.steps.map(function(s,i){return '<li class="'+(steps[i]?'on':'')+'"><label><input type="checkbox" data-i="'+i+'" '+(steps[i]?'checked':'')+'> '+esc(s)+'</label></li>'}).join('')+'</ol>';
  h+='<h2>Your files</h2><div class="card">';
  if(L.start)h+='<p><b>Start file</b> (where you begin)<br><a class="btn alt" href="/files/'+L.start+'" download>⬇ Download start</a></p>';
  h+='<p><b>'+(L.start?'Goal file (the answer — peek only after trying!)':'Starter file')+'</b><br><a class="btn" href="/files/'+L.goal+'" download>⬇ Download '+(L.start?'goal':'starter')+'</a></p>';
  if(LS.a!==LS.b&&LS.a!==0&&LS.b<5)h+='<p><button class="btn alt" id="playgoal">▶ Play the goal file</button></p>';
  h+='</div>';
  if(L.scripts.length){
    h+='<details class="card"><summary>Read mode: scripts to build ('+L.scripts.length+')</summary><p class="why">Each line is one script. “Blocks” is how many blocks it has. Colour chips tell you what idea it uses.</p><table><tr><th>Sprite</th><th>Starts with</th><th>Uses</th></tr>'+L.scripts.map(function(s){var t=s.tags.map(function(x){return{variable:'blue',if:'red',loop:'green',broadcast:'purple',timer:'green'}[x]||'grey'}).filter(function(v,i,a){return a.indexOf(v)===i});return '<tr><td>'+esc(s.sprite)+'</td><td>'+esc(s.hat)+'</td><td>'+(t.length?t.map(function(c){return '<span class="chip '+c+'">'+CN[c]+'</span>'}).join(''):'—')+' <span class="why">'+s.blocks+' blocks</span></td></tr>'}).join('')+'</table></details>';
  }
  if(L.addons&&L.addons.length)h+='<div class="card"><b>⭐ Look for these extra scripts</b>'+L.addons.map(function(a){return '<div class="add">'+esc(a)+'</div>'}).join('')+'<p class="why">In Scratch they have a note next to them.</p></div>';
  h+='<h2>Your turn</h2><div class="card">'+esc(L.turn)+'</div>';
  if(L.scripts.length){
    h+='<h2>Did I build it right?</h2><div class="card"><p class="why">Save your project as a file (.sb3) and pick it here. I will compare it with the goal. This only gives hints. It never stops you finishing the week.</p>'+(p.check?'<p><b>Last check:</b> '+p.check.newFound+' of '+p.check.newTotal+' new scripts</p>':'')+'<label class="btn alt" style="display:block;text-align:center">📁 Choose my .sb3 file<input type="file" id="chk" accept=".sb3" style="display:none"></label><div id="chkout"></div></div>';
  }
  h+='<h2>Quick check</h2><div id="quiz"></div>';
  h+='<div class="card" style="text-align:center"><button class="btn" id="done" style="width:100%">'+(p.done?'✓ Week done (tap to undo)':'I finished this week')+'</button></div>';
  h+='<p style="display:flex;justify-content:space-between">'+(w>1?'<a href="#w'+(w-1)+'">← Week '+(w-1)+'</a>':'<span></span>')+(w<10?'<a href="#w'+(w+1)+'">Week '+(w+1)+' →</a>':'')+'</p>';
  app.innerHTML=h;window.scrollTo(0,0);
  document.getElementById('steps').onchange=function(){var a=[];[].forEach.call(document.querySelectorAll('#steps input'),function(c){a.push(c.checked);c.closest('li').className=c.checked?'on':''});save(w,{steps:a})};
  document.getElementById('done').onclick=function(){var d=!prog(w).done;save(w,{done:d}).then(function(){toast(d?'Well done! ⭐':'Okay');lesson(w)})};
  function play(file){var box=document.getElementById('playbox');box.innerHTML='<iframe src="/player.html?f='+encodeURIComponent(file)+'" title="Game player" allow="autoplay"></iframe>';document.getElementById('playnote').textContent='Tap Start, then tap the buttons in the game.'}
  document.getElementById('playbtn').onclick=function(){play(LS.slug+'-step5-finished.sb3')};
  var pg=document.getElementById('playgoal');if(pg)pg.onclick=function(){play(L.goal)};
  var ck=document.getElementById('chk');if(ck)ck.onchange=function(){if(ck.files[0])runCheck(ck.files[0],w,L,LS)};
  quiz(w,L);
}

/* ---- build checker: compares what the child built with the goal. Hints only. ---- */
function loadJSZip(){return window.JSZip?Promise.resolve():new Promise(function(ok,no){var s=document.createElement('script');s.src='/vendor/jszip.min.js';s.onload=ok;s.onerror=no;document.head.appendChild(s)})}
function hatLabel(b){var o=b.opcode,f=b.fields||{};
  if(o==='event_whenflagclicked')return 'when green flag clicked';
  if(o==='event_whenthisspriteclicked')return 'when this sprite clicked';
  if(o==='event_whenbroadcastreceived')return "when I receive '"+(f.BROADCAST_OPTION||[''])[0]+"'";
  if(o==='event_whenkeypressed')return 'when '+(f.KEY_OPTION||[''])[0]+' key pressed';return o}
function reach(B,id){var seen={},st=[id],n=0,ops={};while(st.length){var c=st.pop();if(seen[c]||!B[c]||typeof B[c]!=='object'||Array.isArray(B[c]))continue;seen[c]=1;n++;var b=B[c];ops[b.opcode]=1;if(b.next)st.push(b.next);var inp=b.inputs||{};for(var k in inp){var v=inp[k];for(var i=1;i<v.length;i++)if(typeof v[i]==='string')st.push(v[i])}}return{n:n,ops:ops}}
function flagsOf(ops){var f='';if(ops.data_setvariableto||ops.data_changevariableby)f+='v';if(ops.control_if||ops.control_if_else)f+='i';if(ops.control_repeat||ops.control_forever||ops.control_repeat_until||ops.sensing_timer||ops.control_wait_until)f+='l';if(ops.event_broadcast||ops.event_broadcastandwait)f+='b';return f.split('').sort().join('')}
function scriptsOf(pj){var out=[];(pj.targets||[]).forEach(function(t){var B=t.blocks||{};for(var id in B){var b=B[id];if(b&&!Array.isArray(b)&&b.topLevel&&/^event_when/.test(b.opcode)){var r=reach(B,id);out.push({s:String(t.name).toLowerCase().trim(),h:hatLabel(b),n:r.n,f:flagsOf(r.ops),used:false})}}});return out}
function compare(man,kid,a,b){
  var exp=man.scripts.filter(function(e){return e[2]<=b}),res={newTotal:0,newFound:0,ok:0,miss:[],part:[],colours:{}};
  exp.forEach(function(e){
    var isNew=e[2]>a;if(isNew)res.newTotal++;
    var best=null;kid.forEach(function(k){if(!k.used&&k.s===e[0].toLowerCase().trim()&&k.h===e[1]&&(!best||k.n>best.n))best=k});
    if(!best){if(isNew)res.miss.push(e);return}
    best.used=true;
    var good=best.n>=Math.ceil(e[4]*0.6)&&e[3].split('').every(function(c){return best.f.indexOf(c)>=0});
    if(isNew){res.newFound++;if(good){res.ok++;e[3].split('').forEach(function(c){res.colours[{v:'blue',i:'red',l:'green',b:'purple'}[c]]=1});if(/^when I receive|^when green|^when this/.test(e[1]))res.colours.purple=1}else res.part.push([e,best.n])}
  });
  return res}
function runCheck(file,w,L,LS){
  var out=document.getElementById('chkout');out.innerHTML='<p>Checking…</p>';
  Promise.all([loadJSZip(),MAN?Promise.resolve(MAN):fetch('/data/manifests.json').then(function(r){return r.json()})]).then(function(r){MAN=r[1];
    return window.JSZip.loadAsync(file)}).then(function(z){var f=z.file('project.json');if(!f)throw new Error('x');return f.async('string')}).then(function(txt){
    var man=MAN[LS.slug],res=compare(man,scriptsOf(JSON.parse(txt)),LS.a,LS.b);
    var h='<h3>You built '+res.newFound+' of '+res.newTotal+' new scripts '+(res.newFound>=res.newTotal?'🎉':'')+'</h3><div class="prog"><i style="width:'+Math.round(100*res.newFound/Math.max(1,res.newTotal))+'%"></i></div>';
    if(res.part.length)h+='<p><b>Started, but not finished:</b></p><ul>'+res.part.slice(0,6).map(function(x){return '<li>'+esc(x[0][0])+': '+esc(x[0][1])+' <span class="why">(has '+x[1]+' of about '+x[0][4]+' blocks)</span></li>'}).join('')+'</ul>';
    if(res.miss.length)h+='<p><b>Still to build:</b></p><ul>'+res.miss.slice(0,8).map(function(e){return '<li>'+esc(e[0])+': '+esc(e[1])+'</li>'}).join('')+(res.miss.length>8?'<li>…and '+(res.miss.length-8)+' more (see Read mode)</li>':'')+'</ul>';
    var add=[];Object.keys(res.colours).forEach(function(c){if(!has(c))add.push(c)});
    var builder=res.newFound>=Math.min(3,res.newTotal)&&res.newTotal>0&&!has('builder');if(builder)add.push('builder');
    if(add.length)h+='<div class="add">🎖 New badge'+(add.length>1?'s':'')+': <b>'+add.map(function(b){return BADGE_TXT[b]}).join(', ')+'</b></div>';
    out.innerHTML=h;
    ME.badges=(ME.badges||[]).concat(add);
    return save(w,{check:{found:res.newFound,total:res.newTotal,newFound:res.newFound,newTotal:res.newTotal},badges:add.length?add:undefined})
  }).catch(function(){out.innerHTML='<p class="err">I could not read that file. Save from Scratch with File → Save to your computer, and pick the .sb3 file.</p>'})
}

function save(w,o,term){
  var K=wkey(w,term),cur=ME.progress[K]||{};for(var k in o)if(k!=='badges')cur[k]=o[k];ME.progress[K]=cur;cacheMe();
  var payload={};for(var k2 in o)payload[k2]=o[k2];payload.id=ME.id;payload.week=w;if(term&&term!=='t1')payload.term=term;
  return post('/api/progress',payload).then(function(j){ME.progress[K]=j.saved;if(j.badges)ME.badges=j.badges;cacheMe();return j}).catch(function(e){if(!e.http){queue(payload);toast('Saved on this phone. It will sync when you are online.')}else toast('Could not save. Try again.')});
}
function quiz(w,L,term){
  var box=document.getElementById('quiz'),i=0,score=0,qs=L.quiz,qa=[];
  function show(){
    if(i>=qs.length){box.innerHTML='<div class="card"><b>You got '+score+' of '+qs.length+'!</b> '+'⭐'.repeat(score)+'</div>';save(w,{quiz:score,qa:qa},term);return}
    var q=qs[i];box.innerHTML='<div class="card"><p><b>'+(i+1)+'/'+qs.length+'. '+esc(q.q)+'</b></p>'+q.o.map(function(o,k){return '<button class="opt" data-k="'+k+'">'+esc(o)+'</button>'}).join('')+'<p class="why" id="why"></p></div>';
    [].forEach.call(box.querySelectorAll('.opt'),function(b){b.onclick=function(){
      var k=+b.dataset.k;[].forEach.call(box.querySelectorAll('.opt'),function(x){x.disabled=true;if(+x.dataset.k===q.a)x.className+=' ok'});
      if(k===q.a){score++;qa.push(1)}else{b.className+=' no';qa.push(0)}document.getElementById('why').textContent=q.why;
      var nx=document.createElement('button');nx.className='btn';nx.textContent='Next';nx.onclick=function(){i++;show()};box.firstChild.appendChild(nx)}})
  }
  var p=prog(w,term);if(p.quiz!=null){box.innerHTML='<div class="card">Your best: '+'⭐'.repeat(p.quiz)+'☆'.repeat(Math.max(0,qs.length-p.quiz))+' <button class="btn alt" id="again">Try again</button></div>';document.getElementById('again').onclick=function(){i=0;score=0;qa=[];show()}}else show();
}
function route(){
  if(!DATA||!ME)return;var m=/^#w(\d+)/.exec(location.hash),m2=/^#(t[23])w(\d+)/.exec(location.hash);if(window.BBLabRoot&&window.BBLabRoot._off){window.BBLabRoot._off();window.BBLabRoot=null}if(location.hash==='#cert')cert();else if(m2)webLesson(m2[1],+m2[2]);else if(m)lesson(+m[1]);else home();
}
window.addEventListener('hashchange',route);
/* ---- Ctrl/⌘K palette: jump anywhere ---- */
function need(f){return function(){if(!ME||!DATA){toast('Type your ID first');var i=document.getElementById('id');if(i)i.focus();return}f()}}
function goTerm(t){return need(function(){ls('bb_term',t);if(location.hash&&location.hash!=='#')location.hash='';else home()})}
if(window.ODS&&ODS.cmdk){ODS.cmdk([
  {group:'My learning',icon:'🏠',title:'My weeks',hint:'Home: progress, badges and all 10 weeks',keywords:'home start',run:need(function(){if(location.hash&&location.hash!=='#')location.hash='';else home()})},
  {group:'My learning',icon:'▶',title:'Continue my next week',hint:'Opens the first week you have not finished',keywords:'next resume lesson',run:need(function(){for(var w=1;w<=10;w++)if(!prog(w).done){location.hash='#w'+w;return}toast('All 10 weeks done 🎉')})},
  {group:'My learning',icon:'1',title:'Term 1: Scratch',run:goTerm('t1'),keywords:'scratch term'},
  {group:'My learning',icon:'2',title:'Term 2: HTML & CSS',run:goTerm('t2'),keywords:'web html css term'},
  {group:'My learning',icon:'3',title:'Term 3: JavaScript & PHP',run:goTerm('t3'),keywords:'js php term'},
  {group:'My learning',icon:'🏆',title:'My certificate',hint:'After you finish all 10 weeks',run:need(function(){if(doneCount()<10)toast('Finish all 10 weeks first ⭐');else location.hash='#cert'})},
  {group:'Places',icon:'🎮',title:'ByteBusters Studio',hint:'Projects, puzzles, showcase games',href:'/studio',keywords:'games puzzles stars'},
  {group:'Places',icon:'💻',title:'Web Foundations Bridge',hint:'HTML, CSS and JavaScript',href:'/webdev',keywords:'web html'},
  {group:'Places',icon:'🗺',title:'Your Coding Journey',hint:'Four years, twelve terms',href:'/journey',keywords:'journey years'},
  {group:'Places',icon:'🤖',title:'The AI Journey',hint:'Four AI levels',href:'/ai-journey',keywords:'ai genai'},
  {group:'Me',icon:'👪',title:'Share with my parent',hint:'WhatsApp link with first name and progress only',keywords:'parent whatsapp',run:need(function(){window.open('https://wa.me/?text='+encodeURIComponent('See my ByteBusters Scratch progress: '+location.origin+'/parent?t='+ME.share),'_blank')})},
  {group:'Me',icon:'🚪',title:'Exit',hint:'Log out on this phone',keywords:'logout sign out',run:need(function(){logout()})}
]);var sb=document.getElementById('srch');if(sb)sb.onclick=function(){ODS.openCmdk()};var kk=sb&&sb.querySelector('.o-kbd');if(kk&&/Mac|iP/.test(navigator.platform))kk.textContent='⌘K'}
if('serviceWorker' in navigator)window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').catch(function(){})});
banner();
fetch('/api/config').then(function(r){return r.json()}).then(function(j){CFG=j.open;lsj('bb_cfg',CFG);if(ME)route()}).catch(function(){});
fetch('/data/path.json').then(function(r){return r.json()}).then(function(d){
  DATA=d;var id=ls('bb_id');
  if(id)doLogin(id).then(route).catch(function(){login()});else login();
}).catch(function(){app.innerHTML='<div class="card" style="margin-top:28px;text-align:center"><h2 style="margin-top:0">📡 Cannot load</h2><p class="err">Check your data and refresh.</p><button class="btn" onclick="location.reload()">Try again</button></div>'});
})();
