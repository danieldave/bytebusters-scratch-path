(function(){
'use strict';
var app=document.getElementById('app'),who=document.getElementById('who'),DATA=null,ME=null;
var CN={blue:'Variables',red:'Conditionals',green:'Loops',purple:'Events'};
function $(h){var d=document.createElement('div');d.innerHTML=h;return d}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function toast(t){var e=document.getElementById('toast');e.textContent=t;e.className='toast on';setTimeout(function(){e.className='toast'},1800)}
function ls(k,v){try{if(v===undefined)return localStorage.getItem(k);if(v===null)localStorage.removeItem(k);else localStorage.setItem(k,v)}catch(e){}return null}
function post(u,b){return fetch(u,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b)}).then(function(r){return r.json().then(function(j){if(!r.ok)throw new Error(j.error||'Error');return j})})}
function chips(c){return (c||[]).map(function(x){return '<span class="chip '+x+'">'+CN[x]+'</span>'}).join('')}
function school(){return DATA.schools[ME.school]}
function prog(w){return (ME.progress['w'+w])||{}}
function doneCount(){var n=0;for(var w=1;w<=10;w++)if(prog(w).done)n++;return n}

function login(msg){
  who.textContent='';
  app.innerHTML='<h1>Welcome, game maker!</h1><p>Type your access ID from your ID card.</p><div class="card"><input id="id" type="text" inputmode="text" autocapitalize="characters" autocomplete="off" placeholder="UHS-4K7M" maxlength="9"><p class="err" id="err">'+(msg||'')+'</p><button class="btn" id="go" style="width:100%">Let me in</button></div><p style="color:var(--mut);font-size:15px">Lost your card? Ask your ByteBusters trainer. Your stars and lessons are saved on your ID, so you can continue on any phone.</p>';
  var inp=document.getElementById('id');inp.value=ls('bb_id')||'';
  function go(){var b=document.getElementById('go');b.disabled=true;b.textContent='Checking...';
    post('/api/login',{id:inp.value}).then(function(j){ME=j;ls('bb_id',j.id);route()}).catch(function(e){document.getElementById('err').textContent=e.message;b.disabled=false;b.textContent='Let me in'})}
  document.getElementById('go').onclick=go;inp.onkeydown=function(e){if(e.key==='Enter')go()}
}
function logout(){ls('bb_id',null);ME=null;login()}

function home(){
  var S=school(),n=doneCount();
  who.innerHTML=esc(ME.name||ME.id)+' · <button id="out">Exit</button>';document.getElementById('out').onclick=logout;
  var h='<h1>Hello'+(ME.name?', '+esc(ME.name.split(' ')[0]):'')+'!</h1><p style="color:var(--mut)">'+esc(S.name)+' · your ID <b>'+esc(ME.id)+'</b></p>';
  h+='<div class="card"><b>'+n+' of 10 weeks done</b><div class="prog" style="margin-top:8px"><i style="width:'+n*10+'%"></i></div></div>';
  h+='<div class="card"><b>Your 3 games</b><p style="margin:.3em 0">'+S.games.map(function(g){return esc(g.name)}).join(' → ')+'</p><p class="why">You finish with a game that uses all 4 logic colours.</p><p>'+chips(['blue','red','green','purple'])+'</p></div>';
  S.lessons.forEach(function(L){var p=prog(L.week);
    h+='<a class="card week'+(p.done?' done':'')+'" href="#w'+L.week+'"><span class="n">'+(p.done?'✓':L.week)+'</span><span><b>'+esc(L.title)+'</b><small>'+esc(L.game.name)+' · '+esc(L.topic)+'</small>'+(p.quiz!=null?'<small>Quiz: '+'⭐'.repeat(p.quiz)+'☆'.repeat(3-p.quiz)+'</small>':'')+'</span></a>'});
  if(n===10)h+='<div class="card cert"><h2>🏆 You did it!</h2><p><b>'+esc(ME.name||ME.id)+'</b> finished the ByteBusters Scratch Path and built a game with all 4 logic colours.</p><p class="why">Show this screen to your trainer.</p></div>';
  h+='<details class="card"><summary>How do I open the game files?</summary><p>1. Tap <b>Download</b> in a lesson.<br>2. Open <b>scratch.mit.edu/create</b> (or turbowarp.org).<br>3. Tap <b>File → Load from your computer</b> and pick the file.<br>On a phone the Scratch editor is small. You can also use <b>Read mode</b> in each lesson to see every script as a list, and then build on a computer at the centre.</p></details>';
  app.innerHTML=h;window.scrollTo(0,0);
}

function lesson(w){
  var S=school(),L=S.lessons[w-1];if(!L)return home();var p=prog(w),steps=p.steps||[];
  var h='<p><a href="#">← All weeks</a></p><h1>Week '+w+': '+esc(L.title)+'</h1><p>'+chips(L.colours)+(L.colours.length?'':'<span class="chip grey">Getting to know Scratch</span>')+'</p>';
  h+='<p class="why">Curriculum: '+esc(L.topic)+'</p>';
  h+='<div class="card"><b>Game: '+esc(L.game.name)+'</b><p class="story">'+esc(L.game.story)+'</p></div>';
  h+='<h2>The big idea</h2><p>'+esc(L.big)+'</p>';
  h+='<h2>Do this</h2><ol class="steps" id="steps">'+L.steps.map(function(s,i){return '<li class="'+(steps[i]?'on':'')+'"><label><input type="checkbox" data-i="'+i+'" '+(steps[i]?'checked':'')+'> '+esc(s)+'</label></li>'}).join('')+'</ol>';
  h+='<h2>Your files</h2><div class="card">';
  if(L.start)h+='<p><b>Start file</b> (where you begin)<br><a class="btn alt" href="/files/'+L.start+'" download>⬇ Download start</a></p>';
  h+='<p><b>'+(L.start?'Goal file (the answer — peek only after trying!)':'Starter file')+'</b><br><a class="btn" href="/files/'+L.goal+'" download>⬇ Download '+(L.start?'goal':'starter')+'</a></p></div>';
  if(L.scripts.length){
    h+='<details class="card"><summary>Read mode: scripts to build ('+L.scripts.length+')</summary><p class="why">Each line is one script. “Blocks” is how many blocks it has. Colour chips tell you what idea it uses.</p><table><tr><th>Sprite</th><th>Starts with</th><th>Uses</th></tr>'+L.scripts.map(function(s){var t=s.tags.map(function(x){return{variable:'blue',if:'red',loop:'green',broadcast:'purple',timer:'green'}[x]||'grey'}).filter(function(v,i,a){return a.indexOf(v)===i});return '<tr><td>'+esc(s.sprite)+'</td><td>'+esc(s.hat)+'</td><td>'+(t.length?t.map(function(c){return '<span class="chip '+c+'">'+CN[c]+'</span>'}).join(''):'—')+' <span class="why">'+s.blocks+' blocks</span></td></tr>'}).join('')+'</table></details>';
  }
  if(L.addons&&L.addons.length)h+='<div class="card"><b>⭐ Look for these extra scripts</b>'+L.addons.map(function(a){return '<div class="add">'+esc(a)+'</div>'}).join('')+'<p class="why">In Scratch they have a note next to them.</p></div>';
  h+='<h2>Your turn</h2><div class="card">'+esc(L.turn)+'</div>';
  h+='<h2>Quick check</h2><div id="quiz"></div>';
  h+='<div class="card" style="text-align:center"><button class="btn" id="done" style="width:100%">'+(p.done?'✓ Week done (tap to undo)':'I finished this week')+'</button></div>';
  h+='<p style="display:flex;justify-content:space-between">'+(w>1?'<a href="#w'+(w-1)+'">← Week '+(w-1)+'</a>':'<span></span>')+(w<10?'<a href="#w'+(w+1)+'">Week '+(w+1)+' →</a>':'')+'</p>';
  app.innerHTML=h;window.scrollTo(0,0);
  document.getElementById('steps').onchange=function(){var a=[];[].forEach.call(document.querySelectorAll('#steps input'),function(c){a.push(c.checked);c.closest('li').className=c.checked?'on':''});save(w,{steps:a})};
  document.getElementById('done').onclick=function(){var d=!prog(w).done;save(w,{done:d}).then(function(){toast(d?'Well done! ⭐':'Okay');lesson(w)})};
  quiz(w,L);
}
function save(w,o){
  var cur=ME.progress['w'+w]||{};for(var k in o)cur[k]=o[k];ME.progress['w'+w]=cur;
  o.id=ME.id;o.week=w;
  return post('/api/progress',o).then(function(j){ME.progress['w'+w]=j.saved;return j}).catch(function(){toast('Saved on this phone only. Check your data.')});
}
function quiz(w,L){
  var box=document.getElementById('quiz'),i=0,score=0,qs=L.quiz;
  function show(){
    if(i>=qs.length){box.innerHTML='<div class="card"><b>You got '+score+' of '+qs.length+'!</b> '+'⭐'.repeat(score)+'</div>';save(w,{quiz:score});return}
    var q=qs[i];box.innerHTML='<div class="card"><p><b>'+(i+1)+'/'+qs.length+'. '+esc(q.q)+'</b></p>'+q.o.map(function(o,k){return '<button class="opt" data-k="'+k+'">'+esc(o)+'</button>'}).join('')+'<p class="why" id="why"></p></div>';
    [].forEach.call(box.querySelectorAll('.opt'),function(b){b.onclick=function(){
      var k=+b.dataset.k;[].forEach.call(box.querySelectorAll('.opt'),function(x){x.disabled=true;if(+x.dataset.k===q.a)x.className+=' ok'});
      if(k===q.a)score++;else b.className+=' no';document.getElementById('why').textContent=q.why;
      var nx=document.createElement('button');nx.className='btn';nx.textContent='Next';nx.onclick=function(){i++;show()};box.firstChild.appendChild(nx)}})
  }
  var p=prog(w);if(p.quiz!=null){box.innerHTML='<div class="card">Your best: '+'⭐'.repeat(p.quiz)+'☆'.repeat(qs.length-p.quiz)+' <button class="btn alt" id="again">Try again</button></div>';document.getElementById('again').onclick=function(){i=0;score=0;show()}}else show();
}
function route(){
  if(!DATA||!ME)return;var m=/^#w(\d+)/.exec(location.hash);if(m)lesson(+m[1]);else home();
}
window.addEventListener('hashchange',route);
fetch('/data/path.json').then(function(r){return r.json()}).then(function(d){
  DATA=d;var id=ls('bb_id');
  if(id){post('/api/login',{id:id}).then(function(j){ME=j;route()}).catch(function(){login()})}else login();
}).catch(function(){app.innerHTML='<p class="err">Cannot load. Check your data and refresh.</p>'});
})();
