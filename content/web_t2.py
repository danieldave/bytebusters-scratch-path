# Term 2: HTML & CSS (10 weeks). Placeholders: {{SHOP}} {{TAG}} {{I1}} {{P1}} ... {{CLR}} are filled per school.
T2 = []
def L(**k): T2.append(k)

HEAD = '''<!DOCTYPE html>
<html>
<head>
  <title>{{SHOP}}</title>'''

# ---------------------------------------------------------------- Week 1
L(week=1, title='Your first web page', topic='Understanding HTML structure and basic tags', cur='Week 1-2', kind='html', chips=['HTML'],
  big='A web page is like a house. HTML is the walls and rooms. Every page has the same frame: a head (the name tag on the door) and a body (everything people see inside).',
  analogy='Think of a letter: the head is the envelope (title, who it is for), the body is the letter itself.',
  steps=['Every page starts with <!DOCTYPE html>. It tells the phone: this is a modern web page.',
         '<html> wraps everything. Inside it are two parts: <head> and <body>.',
         '<title> goes in the head. It shows on the browser tab.',
         '<h1> is the biggest heading. <p> is a paragraph. Most tags open <p> and close </p> with a slash.'],
  shelf=[['<title>','<title>|</title>'],['<h1>','<h1>|</h1>'],['<p>','<p>|</p>'],['<h2>','<h2>|</h2>']],
  starter=HEAD.replace('  <title>{{SHOP}}</title>', '  <!-- Mission 1: write a <title> here -->\n') + '''
</head>
<body>
  <!-- Mission 2: add a big heading (h1) with your shop name -->

  <!-- Mission 3: add two paragraphs (p) -->

</body>
</html>''',
  solution=HEAD + '''
</head>
<body>
  <h1>{{SHOP}}</h1>
  <p>{{TAG}}</p>
  <p>Open every day. Come and see our goods!</p>
</body>
</html>''',
  missions=[
   dict(say='Put a <title> inside the <head>. Type your shop name.', hint='Between <head> and </head> write: <title>My Shop</title>', test="return t.has('head > title') && t.text('title').length > 1"),
   dict(say='Add an <h1> inside the <body> with your shop name.', hint='<h1>Name of my shop</h1> goes between <body> and </body>.', test="return t.has('body > h1') && t.text('h1').length > 2"),
   dict(say='Add at least two <p> paragraphs under the heading.', hint='Each paragraph is its own <p>…</p>. Tell people what you sell.', test="return t.count('body > p') >= 2 && t.all('body > p').every(function(p){return p.textContent.trim().length>2})"),
   dict(say='Keep the frame: <!DOCTYPE html>, <html>, <head> and <body>.', hint='Do not delete the first lines. Your page needs its frame.', test="return /^\\s*<!doctype html>/i.test(t.src) && t.has('html > head') && t.has('html > body')")],
  turn='Add an <h2> that says "Open hours" and a <p> with the time you open. View your page on a different phone.',
  quiz=[dict(q='Where does the <title> go?', o=['Inside <head>', 'Inside <body>', 'After </html>'], a=0, why='The title lives in the head. It shows on the browser tab.'),
        dict(q='Which tag makes the BIGGEST heading?', o=['<h1>', '<h6>', '<p>'], a=0, why='h1 is the biggest. h6 is the smallest.'),
        dict(q='How do you CLOSE a tag?', o=['Put / before the name, like </p>', 'Put a dot', 'You do not need to'], a=0, why='A closing tag has a slash: <p> opens, </p> closes.')])

# ---------------------------------------------------------------- Week 2
W2_BODY_START = '''  <h1>{{SHOP}}</h1>'''
L(week=2, title='Lists, links and pictures', topic='Understanding HTML structure and basic tags', cur='Week 1-2', kind='html', chips=['HTML'],
  big='Real pages show lists, pictures and links. A list groups things. An image shows a picture. A link takes you somewhere. All three are just tags.',
  analogy='A list is your shopping list. A link is a signpost. An image is a photo on the wall.',
  steps=['<ul> makes a bullet list. Each item is an <li>.', '<img src="..." alt="..."> shows a picture. The alt text describes it for people who cannot see it.', '<a href="..."> makes a link. The words between <a> and </a> are what people tap.', 'The picture files for this lab are ready: assets/stall.svg, assets/basket.svg and assets/coin.svg.'],
  shelf=[['<ul>+<li>','<ul>\n  <li>|</li>\n  <li></li>\n  <li></li>\n</ul>'],['<img>','<img src="assets/stall.svg" alt="|">'],['<a>','<a href="#">|</a>'],['<h2>','<h2>|</h2>']],
  starter='''<!DOCTYPE html>
<html>
<head>
  <title>{{SHOP}}</title>
</head>
<body>
  <h1>{{SHOP}}</h1>
  <p>{{TAG}}</p>

  <!-- Mission 1: add a picture (img) of the stall -->

  <!-- Mission 2: add a heading "What we sell" and a list of 3 things -->

  <!-- Mission 3: add a link -->

</body>
</html>''',
  solution='''<!DOCTYPE html>
<html>
<head>
  <title>{{SHOP}}</title>
</head>
<body>
  <h1>{{SHOP}}</h1>
  <img src="assets/stall.svg" alt="Our stall">
  <p>{{TAG}}</p>
  <h2>What we sell</h2>
  <ul>
    <li>{{I1}} - {{P1}}</li>
    <li>{{I2}} - {{P2}}</li>
    <li>{{I3}} - {{P3}}</li>
  </ul>
  <p>Questions? <a href="#contact">Go to contact</a></p>
  <h2 id="contact">Contact</h2>
  <p>Come and see us!</p>
</body>
</html>''',
  missions=[
   dict(say='Add an <img> with src="assets/stall.svg" and an alt text.', hint='<img src="assets/stall.svg" alt="Our stall"> (an img has no closing tag).', test="await t.wait(200); var i=t.$('img'); return !!i && /stall\\.svg/.test(i.getAttribute('src')||'') && (i.getAttribute('alt')||'').trim().length>2"),
   dict(say='Add an <h2> and a <ul> with at least 3 <li> items.', hint='<ul> then three lines of <li>…</li>, then </ul>.', test="return t.has('h2') && t.count('ul > li') >= 3 && t.all('li').every(function(l){return l.textContent.trim().length>1})"),
   dict(say='Add a link: <a href="#contact"> with words people can tap.', hint='<a href="#contact">Go to contact</a>. Then add <h2 id="contact">Contact</h2> lower down.', test="return t.has('a[href]') && t.text('a').length>2"),
   dict(say='Make the link work: give one heading id="contact".', hint='<h2 id="contact">Contact</h2>. The # in href matches the id.', test="var a=t.$('a[href^=\"#\"]'); if(!a) return false; var id=a.getAttribute('href').slice(1); return id.length>0 && !!t.doc.getElementById(id)")],
  turn='Add a second picture, assets/basket.svg, and a second list using <ol> (a numbered list) with 3 steps to order from you.',
  quiz=[dict(q='What does alt="..." in an image do?', o=['Describes the picture in words', 'Makes it bigger', 'Adds a link'], a=0, why='Alt text helps people who cannot see the picture and shows if it fails to load.'),
        dict(q='Which tag is ONE item in a list?', o=['<li>', '<ul>', '<a>'], a=0, why='<ul> is the whole list. Each <li> is one item.'),
        dict(q='Which attribute says WHERE a link goes?', o=['href', 'src', 'alt'], a=0, why='href means "hypertext reference": the place to go.')])

# ---------------------------------------------------------------- Week 3
L(week=3, title='Colour and style with CSS', topic='Basic CSS styling and formatting', cur='Week 3', kind='html', chips=['CSS'],
  big='HTML is the house. CSS is the paint, the curtains and the furniture. CSS says: "pick this thing, then change how it looks".',
  analogy='A CSS rule is like telling a tailor: "for every shirt (selector), make the colour green (property: value)".',
  steps=['A rule looks like this: h1 { color: green; }', 'selector = who to style (h1, p, body). property = what to change (color). value = how (green).', 'A class lets you style some things only. In HTML: class="price". In CSS: .price { }', 'Colours can be names (green), or hex codes like #1f7a3a.'],
  shelf=[['color','color: |;'],['background','background-color: |;'],['font-size','font-size: |px;'],['text-align','text-align: center;'],['.price','.price {\n  |\n}'],['bold','font-weight: bold;']],
  starter='''<!DOCTYPE html>
<html>
<head>
  <title>{{SHOP}}</title>
  <style>
    /* Write your CSS rules here */

  </style>
</head>
<body>
  <h1>{{SHOP}}</h1>
  <p>{{TAG}}</p>
  <h2>What we sell</h2>
  <ul>
    <li>{{I1}} - <span>{{P1}}</span></li>
    <li>{{I2}} - <span>{{P2}}</span></li>
    <li>{{I3}} - <span>{{P3}}</span></li>
  </ul>
</body>
</html>''',
  solution='''<!DOCTYPE html>
<html>
<head>
  <title>{{SHOP}}</title>
  <style>
    body {
      background-color: #fff8e1;
      font-family: Arial, sans-serif;
    }
    h1 {
      color: {{CLR}};
      text-align: center;
    }
    p {
      font-size: 20px;
    }
    .price {
      font-weight: bold;
      color: #c62828;
    }
  </style>
</head>
<body>
  <h1>{{SHOP}}</h1>
  <p>{{TAG}}</p>
  <h2>What we sell</h2>
  <ul>
    <li>{{I1}} - <span class="price">{{P1}}</span></li>
    <li>{{I2}} - <span class="price">{{P2}}</span></li>
    <li>{{I3}} - <span class="price">{{P3}}</span></li>
  </ul>
</body>
</html>''',
  missions=[
   dict(say='Give the page a background colour (style the body).', hint='body { background-color: #fff8e1; }  Choose any colour that is not white.', test="var c=t.css('body','background-color'); return c!=='rgba(0, 0, 0, 0)' && c!=='rgb(255, 255, 255)'"),
   dict(say='Make the h1 a colour (not black) and centre it.', hint='h1 { color: green; text-align: center; }', test="return t.css('h1','color')!=='rgb(0, 0, 0)' && t.css('h1','text-align')==='center'"),
   dict(say='Make all paragraphs at least 18px big.', hint='p { font-size: 20px; }', test="return t.num('p','font-size') >= 18"),
   dict(say='Add class="price" to each price <span>, then make .price bold.', hint='<span class="price">…</span> in the HTML. In CSS: .price { font-weight: bold; }', test="return t.count('.price') >= 3 && t.num('.price','font-weight') >= 600")],
  turn='Style the h2 with a different colour and add a font-family. Try font-family: Georgia, serif;',
  quiz=[dict(q='In  h1 { color: red; }  which part is the SELECTOR?', o=['h1', 'color', 'red'], a=0, why='The selector says who to style. Here it is every h1.'),
        dict(q='How do you style something with class="price"?', o=['.price { }', 'price { }', '#price { }'], a=0, why='A dot means class. A # means id.'),
        dict(q='Which property changes the text colour?', o=['color', 'background-color', 'font-size'], a=0, why='color is the text. background-color is behind it.')])

# ---------------------------------------------------------------- Week 4
CARDS = '''  <div class="card">
    <h3>{{I1}}</h3>
    <p class="price">{{P1}}</p>
    <span class="badge">NEW</span>
  </div>
  <div class="card">
    <h3>{{I2}}</h3>
    <p class="price">{{P2}}</p>
  </div>
  <div class="card">
    <h3>{{I3}}</h3>
    <p class="price">{{P3}}</p>
  </div>'''
L(week=4, title='The box model', topic='Advanced CSS: box model and positioning', cur='Week 4', kind='html', chips=['CSS', 'Layout'],
  big='Every thing on a web page is a box. A box has content in the middle, padding (space inside), a border (the edge) and margin (space outside).',
  analogy='Think of a gift in a box: the gift is the content, the soft paper is padding, the box wall is the border, and the gap to the next gift on the shelf is the margin.',
  steps=['padding = space INSIDE the border. margin = space OUTSIDE it.', 'border: 2px solid green; draws the edge.', 'border-radius: 12px; rounds the corners.', 'position: relative on the card, and position: absolute on the badge, lets the badge sit in a corner of the card.'],
  shelf=[['padding','padding: 16px;'],['border','border: 2px solid #1f7a3a;'],['margin','margin: 12px 0;'],['radius','border-radius: 12px;'],['relative','position: relative;'],['absolute','position: absolute;\n  top: 8px;\n  right: 8px;']],
  starter='''<!DOCTYPE html>
<html>
<head>
  <title>{{SHOP}}</title>
  <style>
    body { font-family: Arial, sans-serif; background: #fff8e1; max-width: 480px; margin: auto; padding: 12px; }
    h1 { color: {{CLR}}; text-align: center; }
    .price { font-weight: bold; color: #c62828; }

    /* Mission 1-3: style .card (padding, border, margin, rounded corners) */

    /* Mission 4: make the card relative and put the .badge in its top-right corner */

  </style>
</head>
<body>
  <h1>{{SHOP}}</h1>
''' + CARDS + '''
</body>
</html>''',
  solution='''<!DOCTYPE html>
<html>
<head>
  <title>{{SHOP}}</title>
  <style>
    body { font-family: Arial, sans-serif; background: #fff8e1; max-width: 480px; margin: auto; padding: 12px; }
    h1 { color: {{CLR}}; text-align: center; }
    .price { font-weight: bold; color: #c62828; }

    .card {
      padding: 16px;
      border: 2px solid {{CLR}};
      margin: 12px 0;
      border-radius: 12px;
      background: white;
      position: relative;
    }
    .badge {
      position: absolute;
      top: 8px;
      right: 8px;
      background: #ffb800;
      padding: 2px 8px;
      border-radius: 99px;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <h1>{{SHOP}}</h1>
''' + CARDS + '''
</body>
</html>''',
  missions=[
   dict(say='Give .card some padding (at least 12px).', hint='.card { padding: 16px; }', test="return t.num('.card','padding-top') >= 12 && t.num('.card','padding-left') >= 12"),
   dict(say='Give .card a visible border.', hint='.card { border: 2px solid green; }', test="return t.num('.card','border-top-width') > 0 && t.css('.card','border-top-style')!=='none'"),
   dict(say='Add margin to .card so the cards do not touch, and round the corners (at least 8px).', hint='margin: 12px 0; border-radius: 12px;', test="return t.num('.card','margin-bottom') >= 6 && t.num('.card','border-top-left-radius') >= 8"),
   dict(say='Make .card position: relative and .badge position: absolute.', hint='.card { position: relative; }  .badge { position: absolute; top: 8px; right: 8px; }', test="return t.css('.card','position')==='relative' && t.css('.badge','position')==='absolute'"),
   dict(say='Place the badge inside the card corner (top and right set).', hint='Inside .badge add: top: 8px; right: 8px;', test="var b=t.$('.badge'), c=t.$('.card'); if(!b||!c) return false; var br=b.getBoundingClientRect(), cr=c.getBoundingClientRect(); return br.top>=cr.top && br.top-cr.top<30 && cr.right-br.right<30")],
  turn='Make a 4th card for something you want to sell. Give the badge a different word like "HOT" or "SALE".',
  quiz=[dict(q='Which one is the space INSIDE the border?', o=['padding', 'margin', 'radius'], a=0, why='Padding is inside. Margin is outside.'),
        dict(q='What does border-radius do?', o=['Rounds the corners', 'Makes the border thicker', 'Moves the box'], a=0, why='A bigger radius means rounder corners.'),
        dict(q='For a badge to sit in the card corner, the card needs…', o=['position: relative', 'position: static', 'margin: auto'], a=0, why='An absolute child is placed using the nearest relative parent.')])

# ---------------------------------------------------------------- Week 5
L(week=5, title='A page that fits any phone', topic='Responsive design basics', cur='Week 5-6', kind='html', chips=['CSS', 'Responsive'],
  big='Your page will be opened on tiny phones and big screens. Responsive means the page bends to fit, like water in a bowl.',
  analogy='A responsive page is like a wrapper cloth (wrapper): it fits whoever wears it.',
  steps=['The viewport meta tag tells phones: use the real screen width. Without it, the page looks tiny.', 'display: flex puts boxes in a row. flex-wrap: wrap lets them go to the next line when there is no space.', 'max-width: 100% on images stops pictures from sticking out of the screen.', 'Use flexible sizes (flex: 1 1 200px) instead of fixed widths.'],
  shelf=[['viewport','<meta name="viewport" content="width=device-width, initial-scale=1">'],['flex','display: flex;\n  flex-wrap: wrap;\n  gap: 12px;'],['grow','flex: 1 1 200px;'],['img','img {\n  max-width: 100%;\n}']],
  starter='''<!DOCTYPE html>
<html>
<head>
  <title>{{SHOP}}</title>
  <!-- Mission 1: add the viewport meta tag here -->
  <style>
    body { font-family: Arial, sans-serif; background: #fff8e1; margin: 0; padding: 12px; }
    h1 { color: {{CLR}}; text-align: center; }
    .price { font-weight: bold; color: #c62828; }
    .card { padding: 16px; border: 2px solid {{CLR}}; border-radius: 12px; background: white; }

    /* Mission 2: make .cards a flex row that wraps, with a gap */

    /* Mission 3: let each .card grow and shrink (flex) */

    /* Mission 4: pictures must never be wider than the screen */

  </style>
</head>
<body>
  <h1>{{SHOP}}</h1>
  <img src="assets/stall.svg" alt="Our stall" width="1200">
  <div class="cards">
    <div class="card"><h3>{{I1}}</h3><p class="price">{{P1}}</p></div>
    <div class="card"><h3>{{I2}}</h3><p class="price">{{P2}}</p></div>
    <div class="card"><h3>{{I3}}</h3><p class="price">{{P3}}</p></div>
  </div>
</body>
</html>''',
  solution='''<!DOCTYPE html>
<html>
<head>
  <title>{{SHOP}}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: Arial, sans-serif; background: #fff8e1; margin: 0; padding: 12px; }
    h1 { color: {{CLR}}; text-align: center; }
    .price { font-weight: bold; color: #c62828; }
    .card { padding: 16px; border: 2px solid {{CLR}}; border-radius: 12px; background: white; }

    .cards {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }
    .card {
      flex: 1 1 200px;
    }
    img {
      max-width: 100%;
    }
  </style>
</head>
<body>
  <h1>{{SHOP}}</h1>
  <img src="assets/stall.svg" alt="Our stall" width="1200">
  <div class="cards">
    <div class="card"><h3>{{I1}}</h3><p class="price">{{P1}}</p></div>
    <div class="card"><h3>{{I2}}</h3><p class="price">{{P2}}</p></div>
    <div class="card"><h3>{{I3}}</h3><p class="price">{{P3}}</p></div>
  </div>
</body>
</html>''',
  missions=[
   dict(say='Add the viewport meta tag in the <head>.', hint='<meta name="viewport" content="width=device-width, initial-scale=1">', test="var m=t.$('meta[name=viewport]'); return !!m && /width\\s*=\\s*device-width/.test(m.getAttribute('content')||'')"),
   dict(say='Make .cards display: flex with flex-wrap: wrap.', hint='.cards { display: flex; flex-wrap: wrap; gap: 12px; }', test="return t.css('.cards','display')==='flex' && t.css('.cards','flex-wrap')==='wrap'"),
   dict(say='Give .card a flexible size: flex: 1 1 200px.', hint='.card { flex: 1 1 200px; }', test="return t.css('.card','flex-grow')==='1' && t.css('.card','flex-basis')==='200px'"),
   dict(say='Stop the picture from sticking out: img { max-width: 100%; }', hint='img { max-width: 100%; }', test="return t.css('img','max-width')==='100%'"),
   dict(say='Check it: on a 360px phone, nothing may stick out sideways.', hint='If it still sticks out, check the img rule and the flex-basis.', test="return await t.at(360, function(){ return t.doc.documentElement.scrollWidth <= 360 && t.all('.card').every(function(c){return c.getBoundingClientRect().right <= 361}); })")],
  turn='Change 200px to 120px. How many cards fit in one row on a wide screen? What happens on a phone?',
  quiz=[dict(q='What does the viewport meta tag do?', o=['Makes the page fit the phone screen', 'Adds a picture', 'Changes the colour'], a=0, why='Without it, phones pretend the screen is very wide and shrink your page.'),
        dict(q='What does flex-wrap: wrap do?', o=['Lets boxes move to the next line', 'Wraps text in a box', 'Hides the boxes'], a=0, why='When there is no space left, the next box goes down to a new line.'),
        dict(q='Why add max-width: 100% to images?', o=['So they never stick out of the screen', 'To make them red', 'To make them load faster'], a=0, why='The picture shrinks to fit its container.')])

# ---------------------------------------------------------------- Week 6
L(week=6, title='Media queries: one page, many screens', topic='Responsive design basics with media queries', cur='Week 5-6', kind='html', chips=['CSS', 'Responsive'],
  big='A media query is an IF for CSS: "IF the screen is at least 600px wide, THEN use these rules". On a phone you get the simple layout. On a big screen you get more.',
  analogy='It is like a wrapper cloth you tie one way for work and another way for church. Same cloth, different look for a different place.',
  steps=['Start with the PHONE layout first. This is called mobile-first.', '@media (min-width: 600px) { ... } means: only when the screen is 600px or wider.', 'Inside the curly braces, write normal CSS rules.', 'You can change many things: direction, font size, number of columns.'],
  shelf=[['@media','@media (min-width: 600px) {\n  |\n}'],['row','flex-direction: row;'],['column','flex-direction: column;'],['font-size','font-size: 40px;']],
  starter='''<!DOCTYPE html>
<html>
<head>
  <title>{{SHOP}}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: Arial, sans-serif; background: #fff8e1; margin: 0; padding: 12px; }
    h1 { color: {{CLR}}; text-align: center; font-size: 26px; }
    .price { font-weight: bold; color: #c62828; }
    .cards { display: flex; flex-direction: column; gap: 12px; }
    .card { padding: 16px; border: 2px solid {{CLR}}; border-radius: 12px; background: white; }

    /* Missions: add a media query for wide screens here */

  </style>
</head>
<body>
  <h1>{{SHOP}}</h1>
  <div class="cards">
    <div class="card"><h3>{{I1}}</h3><p class="price">{{P1}}</p></div>
    <div class="card"><h3>{{I2}}</h3><p class="price">{{P2}}</p></div>
    <div class="card"><h3>{{I3}}</h3><p class="price">{{P3}}</p></div>
  </div>
</body>
</html>''',
  solution='''<!DOCTYPE html>
<html>
<head>
  <title>{{SHOP}}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: Arial, sans-serif; background: #fff8e1; margin: 0; padding: 12px; }
    h1 { color: {{CLR}}; text-align: center; font-size: 26px; }
    .price { font-weight: bold; color: #c62828; }
    .cards { display: flex; flex-direction: column; gap: 12px; }
    .card { padding: 16px; border: 2px solid {{CLR}}; border-radius: 12px; background: white; }

    @media (min-width: 600px) {
      .cards {
        flex-direction: row;
      }
      .card {
        flex: 1;
      }
      h1 {
        font-size: 44px;
      }
    }
  </style>
</head>
<body>
  <h1>{{SHOP}}</h1>
  <div class="cards">
    <div class="card"><h3>{{I1}}</h3><p class="price">{{P1}}</p></div>
    <div class="card"><h3>{{I2}}</h3><p class="price">{{P2}}</p></div>
    <div class="card"><h3>{{I3}}</h3><p class="price">{{P3}}</p></div>
  </div>
</body>
</html>''',
  missions=[
   dict(say='Write a media query: @media (min-width: 600px) { … }', hint='@media (min-width: 600px) {  /* rules go here */  }', test="return t.mq().some(function(q){return /min-width/.test(q)})"),
   dict(say='On a 360px phone the cards must stay in a column.', hint='Leave .cards as column outside the media query.', test="return await t.at(360, function(){ return t.css('.cards','flex-direction')==='column'; })"),
   dict(say='On a 800px screen the cards must sit in a row.', hint='Inside the media query: .cards { flex-direction: row; }', test="return await t.at(800, function(){ return t.css('.cards','flex-direction')==='row'; })"),
   dict(say='On a wide screen make the h1 bigger than on the phone.', hint='Inside the media query: h1 { font-size: 44px; }', test="var small=await t.at(360,function(){return t.num('h1','font-size')}); var big=await t.at(800,function(){return t.num('h1','font-size')}); return big > small")],
  turn='Add a second media query for min-width: 900px that gives the body a background colour. Try your page in landscape and portrait.',
  quiz=[dict(q='@media (min-width: 600px) means…', o=['Only when the screen is 600px or wider', 'Only when the screen is exactly 600px', 'Only on phones'], a=0, why='min-width is the smallest width where the rules start working.'),
        dict(q='What is "mobile-first"?', o=['Write the phone layout first, then add rules for bigger screens', 'Only make pages for phones', 'Use big pictures'], a=0, why='Most of your visitors are on phones, so start there.'),
        dict(q='Where do the rules for wide screens go?', o=['Inside the { } of the @media query', 'In the <body>', 'In the <title>'], a=0, why='The rules inside only apply when the query is true.')])

# ---------------------------------------------------------------- Week 7
FORM_STYLE = '''  <style>
    body { font-family: Arial, sans-serif; background: #fff8e1; max-width: 480px; margin: auto; padding: 12px; }
    h1 { color: {{CLR}}; }
    label { display: block; margin-top: 14px; font-weight: bold; }
    input, select, textarea, button { font-size: 18px; padding: 10px; width: 100%; box-sizing: border-box; margin-top: 4px; }
    button { background: {{CLR}}; color: white; border: 0; border-radius: 8px; margin-top: 18px; }
  </style>'''
L(week=7, title='Forms: asking questions', topic='HTML forms and input handling', cur='Week 7-8', kind='html', chips=['HTML', 'Forms'],
  big='A form is how a page asks questions and collects answers. Every question has a label (the words) and an input (the box where people answer).',
  analogy='A form is like the register at school: each line has a name tag (label) and a space to write (input).',
  steps=['<form> wraps all the questions.', '<label for="name"> and <input id="name"> are joined when for and id match. Tapping the label then opens the box. This also helps screen readers.', '<select> with <option> items gives a drop-down list.', '<textarea> is a big box for long text. <button type="submit"> sends the form.'],
  shelf=[['label+input','<label for="|">Label</label>\n  <input id="" type="text">'],['select','<select id="item">\n    <option>|</option>\n    <option></option>\n    <option></option>\n  </select>'],['textarea','<textarea id="notes" rows="3"></textarea>'],['button','<button type="submit">Send order</button>']],
  starter='''<!DOCTYPE html>
<html>
<head>
  <title>Order from {{SHOP}}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
''' + FORM_STYLE + '''
</head>
<body>
  <h1>Order from {{SHOP}}</h1>
  <form>
    <!-- Mission 1: a label and an input for the customer's name -->

    <!-- Mission 2: a label and an input for the phone number (type="tel") -->

    <!-- Mission 3: a label and a select with 3 options (your items) -->

    <!-- Mission 4: a label and a textarea for notes -->

    <!-- Mission 5: a submit button -->

  </form>
</body>
</html>''',
  solution='''<!DOCTYPE html>
<html>
<head>
  <title>Order from {{SHOP}}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
''' + FORM_STYLE + '''
</head>
<body>
  <h1>Order from {{SHOP}}</h1>
  <form>
    <label for="name">Your name</label>
    <input id="name" type="text">

    <label for="phone">Phone number</label>
    <input id="phone" type="tel">

    <label for="item">What do you want?</label>
    <select id="item">
      <option>{{I1}}</option>
      <option>{{I2}}</option>
      <option>{{I3}}</option>
    </select>

    <label for="notes">Notes</label>
    <textarea id="notes" rows="3"></textarea>

    <button type="submit">Send order</button>
  </form>
</body>
</html>''',
  missions=[
   dict(say='Add a <label for="name"> and an <input id="name"> for the name.', hint='<label for="name">Your name</label> then <input id="name" type="text">', test="var l=t.$('label[for]'); if(!l) return false; var i=t.doc.getElementById(l.getAttribute('for')); return !!i && i.tagName==='INPUT' && i.type==='text'"),
   dict(say='Add a phone question: an input with type="tel" and a label joined by for/id.', hint='<label for="phone">Phone number</label> <input id="phone" type="tel">', test="var i=t.$('input[type=tel]'); if(!i || !i.id) return false; return !!t.$('label[for=\"'+i.id+'\"]')"),
   dict(say='Add a <select> with at least 3 <option> items and a label.', hint='<select id="item"><option>…</option> … </select>', test="var s=t.$('select'); return !!s && s.options.length>=3 && Array.prototype.every.call(s.options,function(o){return o.textContent.trim().length>1}) && !!s.id && !!t.$('label[for=\"'+s.id+'\"]')"),
   dict(say='Add a <textarea> for notes.', hint='<textarea id="notes" rows="3"></textarea>', test="return t.has('form textarea')"),
   dict(say='Add a button that sends the form: <button type="submit">.', hint='<button type="submit">Send order</button> goes before </form>.', test="var b=t.$('form button[type=submit]'); return !!b && b.textContent.trim().length>1"),
   dict(say='Check: every label must point to a real box.', hint='The for="x" in the label must match id="x" in the input.', test="var ls=t.all('label'); return ls.length>=3 && ls.every(function(l){return l.htmlFor && t.doc.getElementById(l.htmlFor)})")],
  turn='Add a label and an <input type="number"> for how many the customer wants. Test it on your phone: does the number keypad appear?',
  quiz=[dict(q='How do you join a label to its input?', o=['for="x" in the label and id="x" in the input', 'Put them on the same line', 'Use the same colour'], a=0, why='The for and the id must match exactly.'),
        dict(q='Which tag gives a drop-down list?', o=['<select>', '<input>', '<form>'], a=0, why='<select> holds <option> items.'),
        dict(q='What does type="tel" do on a phone?', o=['Shows the number keypad', 'Calls the number', 'Makes the box red'], a=0, why='The right type gives the right keyboard.')])

# ---------------------------------------------------------------- Week 8
L(week=8, title='Smart form fields', topic='HTML forms and input handling', cur='Week 7-8', kind='html', chips=['HTML', 'Forms'],
  big='Good forms help people get it right. The browser can already check some things for you: required boxes, email shape, numbers that are too small.',
  analogy='It is like a gateman at the school gate who stops anyone without an ID card before they come in.',
  steps=['name="..." gives each answer a label for the server that receives the form.', 'required means: the form will not send until this box is filled.', 'type="email" and type="number" with min and max make the browser check the answer.', 'Radio buttons with the SAME name let you pick only one option. placeholder shows a grey hint.'],
  shelf=[['required','required'],['placeholder','placeholder="|"'],['email','<input id="email" name="email" type="email">'],['number','<input id="qty" name="qty" type="number" min="1" max="20" value="1">'],['radio','<label><input type="radio" name="delivery" value="|"> Label</label>']],
  starter='''<!DOCTYPE html>
<html>
<head>
  <title>Order from {{SHOP}}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
''' + FORM_STYLE + '''
</head>
<body>
  <h1>Order from {{SHOP}}</h1>
  <form>
    <label for="name">Your name</label>
    <input id="name" type="text">

    <label for="email">Email</label>
    <input id="email" type="text">

    <label for="qty">How many?</label>
    <input id="qty" type="text">

    <!-- Mission 5: add two radio buttons for delivery (same name) -->

    <button type="submit">Send order</button>
  </form>
</body>
</html>''',
  solution='''<!DOCTYPE html>
<html>
<head>
  <title>Order from {{SHOP}}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
''' + FORM_STYLE + '''
</head>
<body>
  <h1>Order from {{SHOP}}</h1>
  <form>
    <label for="name">Your name</label>
    <input id="name" name="name" type="text" required placeholder="Type your full name">

    <label for="email">Email</label>
    <input id="email" name="email" type="email">

    <label for="qty">How many?</label>
    <input id="qty" name="qty" type="number" min="1" max="20" value="1">

    <label><input type="radio" name="delivery" value="pickup"> I will pick it up</label>
    <label><input type="radio" name="delivery" value="deliver"> Please deliver</label>

    <button type="submit">Send order</button>
  </form>
</body>
</html>''',
  missions=[
   dict(say='Give every input a name="…" (the answer needs a name to travel with).', hint='<input id="name" name="name" type="text">', test="var ins=t.all('form input'); return ins.length>=3 && ins.every(function(i){return !!i.getAttribute('name')})"),
   dict(say='Make the name box required and add a placeholder hint.', hint='<input … required placeholder="Type your full name">', test="var i=t.$('#name'); return !!i && i.required && (i.getAttribute('placeholder')||'').length>2"),
   dict(say='Change the email box to type="email".', hint='type="email" makes the browser check for an @.', test="var i=t.$('#email'); return !!i && i.type==='email'"),
   dict(say='Change the quantity to type="number" with min="1".', hint='<input id="qty" type="number" min="1" max="20" value="1">', test="var i=t.$('#qty'); return !!i && i.type==='number' && Number(i.min)>=1"),
   dict(say='Add two radio buttons with the SAME name so only one can be picked.', hint='<input type="radio" name="delivery" value="pickup"> and another with name="delivery" too.', test="var r=t.all('input[type=radio]'); return r.length>=2 && r.every(function(x){return x.name===r[0].name && x.name.length>0})"),
   dict(say='Check: a customer who leaves the name empty must be stopped by the browser.', hint='The name input needs the word required.', test="var f=t.$('form'); t.type('#name',''); return f.checkValidity()===false")],
  turn='Add pattern="[0-9]{11}" to a phone input so only 11 digits are allowed. Try typing 5 digits and sending.',
  quiz=[dict(q='What does required do?', o=['Stops the form from sending until the box is filled', 'Makes the box red', 'Hides the box'], a=0, why='The browser shows a message and does not send.'),
        dict(q='Two radio buttons can allow only ONE choice if they have…', o=['the same name', 'the same colour', 'different ids'], a=0, why='Same name means they belong to one group.'),
        dict(q='Why use type="email"?', o=['The browser checks it looks like an email', 'It sends an email', 'It makes the text bigger'], a=0, why='It checks for an @ and a dot.')])

# ---------------------------------------------------------------- Week 9
L(week=9, title='JavaScript wakes up the page', topic='Introduction to basic JavaScript for interactivity', cur='Week 9-10', kind='html', chips=['JavaScript', 'Events'],
  big='HTML is the structure. CSS is the style. JavaScript is the BRAIN: it makes the page react when someone taps, types or scrolls.',
  analogy='HTML is the house, CSS is the paint, JavaScript is the electricity. Press the switch (event) and the light (page) responds.',
  steps=['<script> holds JavaScript. Put it at the bottom of the <body>.', 'document.getElementById("btn") finds an element by its id.', 'addEventListener("click", function () { ... }) means: when this is tapped, run this code.', 'textContent changes the words. let count = 0; makes a variable (a box that remembers a number).'],
  shelf=[['getElementById','document.getElementById("|")'],['click','btn.addEventListener("click", function () {\n  |\n});'],['textContent','msg.textContent = "|";'],['let','let count = 0;'],['console.log','console.log("|");']],
  starter='''<!DOCTYPE html>
<html>
<head>
  <title>{{SHOP}}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: Arial, sans-serif; background: #fff8e1; max-width: 480px; margin: auto; padding: 12px; text-align: center; }
    h1 { color: {{CLR}}; }
    button { font-size: 20px; padding: 12px 20px; background: {{CLR}}; color: white; border: 0; border-radius: 10px; }
  </style>
</head>
<body>
  <h1>{{SHOP}}</h1>
  <button id="btn">Tap me</button>
  <p id="msg">Welcome!</p>
  <p>You tapped <span id="count">0</span> times.</p>

  <script>
    // Mission 1: find the button and the message with getElementById
    // Mission 2: when the button is clicked, change the message
    // Mission 3: count the taps and show the number in #count
    // Mission 4: also console.log something when it is clicked

  </script>
</body>
</html>''',
  solution='''<!DOCTYPE html>
<html>
<head>
  <title>{{SHOP}}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: Arial, sans-serif; background: #fff8e1; max-width: 480px; margin: auto; padding: 12px; text-align: center; }
    h1 { color: {{CLR}}; }
    button { font-size: 20px; padding: 12px 20px; background: {{CLR}}; color: white; border: 0; border-radius: 10px; }
  </style>
</head>
<body>
  <h1>{{SHOP}}</h1>
  <button id="btn">Tap me</button>
  <p id="msg">Welcome!</p>
  <p>You tapped <span id="count">0</span> times.</p>

  <script>
    const btn = document.getElementById("btn");
    const msg = document.getElementById("msg");
    const countBox = document.getElementById("count");
    let count = 0;

    btn.addEventListener("click", function () {
      count = count + 1;
      msg.textContent = "Thank you for visiting {{SHOP}}!";
      countBox.textContent = count;
      console.log("Tapped " + count + " times");
    });
  </script>
</body>
</html>''',
  missions=[
   dict(say='Use document.getElementById to find the button.', hint='const btn = document.getElementById("btn");', test="return /getElementById|querySelector/.test(t.src) && t.errors.length===0"),
   dict(say='When the button is clicked, change the text of #msg.', hint='btn.addEventListener("click", function () { msg.textContent = "Thank you!"; });', test="var before=t.text('#msg'); await t.click('#btn'); var after=t.text('#msg'); return after!==before && after.length>2"),
   dict(say='Count the taps: after 3 taps #count must show 3.', hint='let count = 0; and inside the click: count = count + 1; countBox.textContent = count;', test="await t.click('#btn'); await t.click('#btn'); return /^[3-9]$|^\\d{2,}$/.test(t.text('#count')) && Number(t.text('#count'))>=3"),
   dict(say='Add a console.log inside the click.', hint='console.log("Tapped!");', test="return t.out.length>0")],
  turn='Make the button text change too: btn.textContent = "Tap again!". Then make the count turn the message red when it reaches 5.',
  quiz=[dict(q='Which language makes a page REACT when tapped?', o=['JavaScript', 'HTML', 'CSS'], a=0, why='HTML is structure, CSS is style, JavaScript is behaviour.'),
        dict(q='What does addEventListener("click", …) do?', o=['Runs code when something is tapped', 'Adds a new button', 'Draws a border'], a=0, why='An event listener waits for an event, like a tap.'),
        dict(q='What does textContent change?', o=['The words inside an element', 'The colour', 'The id'], a=0, why='It sets or reads the text.')])

# ---------------------------------------------------------------- Week 10
L(week=10, title='Project: a form that checks itself', topic='Introduction to basic JavaScript for interactivity', cur='Week 9-10', kind='html', chips=['JavaScript', 'Forms', 'Project'],
  big='Your Term 2 project: a form with checking. Before the order goes, JavaScript reads the answers and decides: are they good? If not, tell the person what to fix. If yes, thank them by name.',
  analogy='JavaScript is the shop assistant who checks your slip before you reach the counter: "You forgot your name, Oga."',
  steps=['Listen for the form event "submit". Call event.preventDefault() so the page does not reload.', 'Read answers with .value. .trim() removes spaces at the ends.', 'Use if / else if / else to check each rule one by one.', 'Show the result in #msg and give it the class "error" or "ok".'],
  shelf=[['submit','form.addEventListener("submit", function (event) {\n  event.preventDefault();\n  |\n});'],['value','document.getElementById("|").value.trim()'],['if','if (name === "") {\n  |\n}'],['else if','else if (phone.length !== 11) {\n  |\n}']],
  starter='''<!DOCTYPE html>
<html>
<head>
  <title>Order from {{SHOP}}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: Arial, sans-serif; background: #fff8e1; max-width: 480px; margin: auto; padding: 12px; }
    h1 { color: {{CLR}}; }
    label { display: block; margin-top: 14px; font-weight: bold; }
    input, button { font-size: 18px; padding: 10px; width: 100%; box-sizing: border-box; margin-top: 4px; }
    button { background: {{CLR}}; color: white; border: 0; border-radius: 8px; margin-top: 18px; }
    .error { color: #c62828; font-weight: bold; }
    .ok { color: #1b7a33; font-weight: bold; }
  </style>
</head>
<body>
  <h1>Order from {{SHOP}}</h1>
  <form id="order">
    <label for="name">Your name</label>
    <input id="name" type="text">
    <label for="phone">Phone number (11 digits)</label>
    <input id="phone" type="tel">
    <label for="qty">How many?</label>
    <input id="qty" type="number" value="1">
    <button type="submit">Send order</button>
  </form>
  <p id="msg"></p>

  <script>
    const form = document.getElementById("order");
    const msg = document.getElementById("msg");

    // Mission 1: listen for "submit" and call event.preventDefault()
    // Mission 2: if the name is empty, show an error in #msg
    // Mission 3: if the phone is not 11 digits, show an error
    // Mission 4: if qty is less than 1, show an error
    // Mission 5: otherwise show "Thank you, NAME!" with class "ok"

  </script>
</body>
</html>''',
  solution='''<!DOCTYPE html>
<html>
<head>
  <title>Order from {{SHOP}}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: Arial, sans-serif; background: #fff8e1; max-width: 480px; margin: auto; padding: 12px; }
    h1 { color: {{CLR}}; }
    label { display: block; margin-top: 14px; font-weight: bold; }
    input, button { font-size: 18px; padding: 10px; width: 100%; box-sizing: border-box; margin-top: 4px; }
    button { background: {{CLR}}; color: white; border: 0; border-radius: 8px; margin-top: 18px; }
    .error { color: #c62828; font-weight: bold; }
    .ok { color: #1b7a33; font-weight: bold; }
  </style>
</head>
<body>
  <h1>Order from {{SHOP}}</h1>
  <form id="order">
    <label for="name">Your name</label>
    <input id="name" type="text">
    <label for="phone">Phone number (11 digits)</label>
    <input id="phone" type="tel">
    <label for="qty">How many?</label>
    <input id="qty" type="number" value="1">
    <button type="submit">Send order</button>
  </form>
  <p id="msg"></p>

  <script>
    const form = document.getElementById("order");
    const msg = document.getElementById("msg");

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      const name = document.getElementById("name").value.trim();
      const phone = document.getElementById("phone").value.trim();
      const qty = Number(document.getElementById("qty").value);

      msg.className = "error";
      if (name === "") {
        msg.textContent = "Please type your name.";
      } else if (phone.length !== 11) {
        msg.textContent = "Phone number must be 11 digits.";
      } else if (qty < 1) {
        msg.textContent = "Order at least 1.";
      } else {
        msg.className = "ok";
        msg.textContent = "Thank you, " + name + "! We got your order.";
      }
    });
  </script>
</body>
</html>''',
  missions=[
   dict(say='Listen for the form "submit" and call event.preventDefault().', hint='form.addEventListener("submit", function (event) { event.preventDefault(); … });', test="t.type('#name','x'); return (await t.submit('#order'))===true"),
   dict(say='Empty name: show an error message in #msg (class "error").', hint='if (name === "") { msg.textContent = "Please type your name."; }', test="t.type('#name',''); t.type('#phone','08012345678'); t.type('#qty','2'); await t.submit('#order'); return t.text('#msg').length>2 && /error/.test(t.$('#msg').className)"),
   dict(say='Phone not 11 digits: show an error.', hint='else if (phone.length !== 11) { … }', test="t.type('#name','Ade'); t.type('#phone','123'); t.type('#qty','2'); await t.submit('#order'); return t.text('#msg').length>2 && /error/.test(t.$('#msg').className)"),
   dict(say='Quantity less than 1: show an error.', hint='else if (qty < 1) { … }', test="t.type('#name','Ade'); t.type('#phone','08012345678'); t.type('#qty','0'); await t.submit('#order'); return t.text('#msg').length>2 && /error/.test(t.$('#msg').className)"),
   dict(say='Everything right: show "Thank you, NAME!" with class "ok".', hint='else { msg.className = "ok"; msg.textContent = "Thank you, " + name + "!"; }', test="t.type('#name','Ade'); t.type('#phone','08012345678'); t.type('#qty','2'); await t.submit('#order'); return /ok/.test(t.$('#msg').className) && t.text('#msg').indexOf('Ade')>=0")],
  turn='Add a 4th rule: the name must be at least 3 letters. Then ask a friend to try to break your form. Write down what they tried.',
  quiz=[dict(q='Why call event.preventDefault() on a form?', o=['So the page does not reload before we check', 'To make the form faster', 'To delete the form'], a=0, why='Normally a form sends and reloads. We want to check first.'),
        dict(q='What does name.trim() do?', o=['Removes spaces at the start and end', 'Makes it shorter', 'Makes it uppercase'], a=0, why='" Ade " becomes "Ade".'),
        dict(q='In if / else if / else, how many branches run?', o=['Only the first one that is true', 'All of them', 'None'], a=0, why='JavaScript stops at the first true condition.')])
