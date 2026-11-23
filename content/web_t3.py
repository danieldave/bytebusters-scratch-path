# Term 3: JavaScript (weeks 1-6) then PHP (weeks 7-10).
T3 = []
def L(**k): T3.append(k)

# ---------------------------------------------------------------- Week 1
L(week=1, title='Variables: boxes with names', topic='Basic syntax, variables, and data types', cur='Week 1-2', kind='js', chips=['JavaScript', 'Variables'],
  big='A variable is a labelled box that remembers something. You give the box a name and put a value inside. Later you can use the name to get the value back.',
  analogy='A variable is like a bottle with a label "Palm oil". You do not need to see inside every time, you just read the label.',
  steps=['const makes a box that never changes. let makes a box you can change later.', 'Text goes in quotes: "Ade". Numbers have no quotes: 500. true and false are booleans.', 'console.log(thing) prints it in the Console below your code.', 'Backticks let you mix text and variables: `Welcome to ${shopName}!`'],
  shelf=[['const','const |= ;'],['let','let |= ;'],['console.log','console.log(|);'],['`${ }`','`|${}`'],['"text"','"|"']],
  starter='''// Mission 1: make a variable called shopName with your shop name (text)
// Mission 2: make price (a number) and isOpen (true or false)
// Mission 3: print all three with console.log
// Mission 4: print one sentence with backticks and ${ }, like `Welcome to ${shopName}!`

''',
  solution='''const shopName = "{{SHOP}}";
const price = {{P1n}};
let isOpen = true;

console.log(shopName);
console.log(price);
console.log(isOpen);
console.log(`${shopName} sells {{I1}} for ₦${price}`);
''',
  missions=[
   dict(say='Make a variable called shopName that holds text.', hint='const shopName = "My Shop";', test="return typeof t.v('shopName')==='string' && t.v('shopName').length>1"),
   dict(say='Make price (a number) and isOpen (true or false).', hint='const price = 500;  let isOpen = true;', test="return typeof t.v('price')==='number' && t.v('price')>0 && typeof t.v('isOpen')==='boolean'"),
   dict(say='Print all three with console.log.', hint='console.log(shopName);  console.log(price);  console.log(isOpen);', test="return t.out.length>=3 && t.out.indexOf(String(t.v('shopName')))>=0 && t.out.indexOf(String(t.v('price')))>=0"),
   dict(say='Print one sentence using backticks and ${ }.', hint='console.log(`Welcome to ${shopName}!`);', test="return /`[^`]*\\$\\{[^}]+\\}[^`]*`/.test(t.src) && t.out.some(function(l){return l.length>12 && l.indexOf('${')<0 && l.indexOf(String(t.v('shopName')))>=0})")],
  turn='Make a variable for your own age and print: "I am ... years old." Then change isOpen to false using isOpen = false; (only let allows that).',
  quiz=[dict(q='Which one can be changed later?', o=['let', 'const', 'neither'], a=0, why='const is constant: it never changes. let can change.'),
        dict(q='Which is a number?', o=['500', '"500"', 'five hundred'], a=0, why='Anything in quotes is text, even if it looks like a number.'),
        dict(q='What does console.log(x) do?', o=['Prints x in the console', 'Deletes x', 'Makes x bigger'], a=0, why='The console is the developer\'s notebook.')])

# ---------------------------------------------------------------- Week 2
L(week=2, title='Numbers, text and maths', topic='Basic syntax, variables, and data types', cur='Week 1-2', kind='js', chips=['JavaScript', 'Variables'],
  big='Computers are great at maths. JavaScript does + - * / for numbers. But careful: the + sign joins TEXT and adds NUMBERS. "5" + 3 is "53", not 8!',
  analogy='If you write 5 on a paper (text) it is just a drawing. If you hold 5 naira (number) you can count with it.',
  steps=['+ - * / and % (remainder) work on numbers.', '"5" is text. Number("5") turns it into the number 5.', '.toFixed(2) rounds a number to 2 decimal places and gives text.', 'typeof x tells you if x is a "number", "string" (text) or "boolean".'],
  shelf=[['Number()','Number(|)'],['.toFixed','.toFixed(2)'],['typeof','typeof |'],['*','*'],['-','-']],
  starter='''const price = {{P1n}};
const qty = 3;

// Mission 1: make total = price times qty
// Mission 2: make money = 5000 and change = money - total
// Mission 3: print "Total: ₦..." and "Change: ₦..."
// Mission 4: quantityText = "4" is TEXT. Make qtyNumber = Number(quantityText)
// Mission 5: discountAmount = total times 0.1 (10%). Print it with .toFixed(2)

const quantityText = "4";

''',
  solution='''const price = {{P1n}};
const qty = 3;

const total = price * qty;
const money = 5000;
const change = money - total;
console.log("Total: ₦" + total);
console.log("Change: ₦" + change);

const quantityText = "4";
const qtyNumber = Number(quantityText);
console.log(typeof quantityText, typeof qtyNumber);

const discountAmount = total * 0.1;
console.log("Discount: ₦" + discountAmount.toFixed(2));
''',
  missions=[
   dict(say='Make total = price * qty.', hint='const total = price * qty;', test="return t.v('total') === t.v('price')*t.v('qty')"),
   dict(say='Make money = 5000 and change = money - total.', hint='const money = 5000; const change = money - total;', test="return t.v('money')===5000 && t.v('change')===5000-t.v('total')"),
   dict(say='Print "Total: ₦…" and "Change: ₦…" lines.', hint='console.log("Total: ₦" + total);', test="return t.out.some(function(l){return /total/i.test(l) && l.indexOf(String(t.v('total')))>=0}) && t.out.some(function(l){return /change/i.test(l) && l.indexOf(String(t.v('change')))>=0})"),
   dict(say='Turn the text "4" into a real number called qtyNumber.', hint='const qtyNumber = Number(quantityText);', test="return t.v('qtyNumber')===4 && typeof t.v('qtyNumber')==='number'"),
   dict(say='Find 10% (discountAmount) and print it with .toFixed(2).', hint='const discountAmount = total * 0.1; console.log(discountAmount.toFixed(2));', test="return Math.abs(t.v('discountAmount') - t.v('total')*0.1) < 0.0001 && /toFixed\\(\\s*2\\s*\\)/.test(t.src)")],
  turn='Try console.log("5" + 3) and console.log("5" - 3). Why are the answers different? Explain it to a friend.',
  quiz=[dict(q='What does "5" + 3 give in JavaScript?', o=['"53"', '8', 'An error'], a=0, why='When one side is text, + joins them.'),
        dict(q='How do you turn the text "7" into a number?', o=['Number("7")', 'Text(7)', '"7" * "7"'], a=0, why='Number() converts text to a number.'),
        dict(q='What does the % sign do?', o=['Gives the remainder after dividing', 'Gives percent', 'Divides'], a=0, why='7 % 3 is 1 because 3 goes into 7 twice with 1 left.')])

# ---------------------------------------------------------------- Week 3
L(week=3, title='Decide and repeat', topic='Conditional statements and loops', cur='Week 3', kind='js', chips=['JavaScript', 'Conditionals', 'Loops'],
  big='Two superpowers: DECIDE (if / else) and REPEAT (loops). With them your code can make choices and do boring work again and again without getting tired.',
  analogy='If: "If it is raining, take an umbrella, else wear a cap." Loop: "Sweep the floor 5 times."',
  steps=['if (condition) { ... } else { ... } runs one block or the other.', '=== means "is exactly equal". >= means "bigger or equal". && means AND. || means OR.', 'for (let i = 1; i <= 5; i++) { ... } repeats 5 times. i counts 1, 2, 3, 4, 5.', 'while (condition) { ... } repeats as long as the condition is true. Make sure something changes or it never stops!'],
  shelf=[['if/else','if (|) {\n  \n} else {\n  \n}'],['for','for (let i = 1; i <= 5; i++) {\n  |\n}'],['while','while (n > 0) {\n  |\n}'],['>=','>='],['===','===']],
  starter='''const qty = 6;
let discount = 0;

// Mission 1: if qty is 5 or more, discount = 10, else discount = 0
// Mission 2: if qty >= 5 print "Big order!", else print "Small order"
// Mission 3: a for loop prints the 2 times table for 1 to 5
//            example line: 3 x 2 = 6
// Mission 4: a while loop counts down 3, 2, 1 and then prints "Go!"

''',
  solution='''const qty = 6;
let discount = 0;

if (qty >= 5) {
  discount = 10;
} else {
  discount = 0;
}

if (qty >= 5) {
  console.log("Big order!");
} else {
  console.log("Small order");
}

for (let i = 1; i <= 5; i++) {
  console.log(i + " x 2 = " + i * 2);
}

let n = 3;
while (n > 0) {
  console.log(n);
  n = n - 1;
}
console.log("Go!");
''',
  missions=[
   dict(say='Use if / else: when qty is 5 or more, discount must become 10.', hint='if (qty >= 5) { discount = 10; } else { discount = 0; }', test="return /\\bif\\s*\\(/.test(t.src) && /\\belse\\b/.test(t.src) && t.v('discount')===10"),
   dict(say='Print "Big order!" when qty >= 5 (else "Small order").', hint='console.log("Big order!");', test="return t.out.some(function(l){return /big order/i.test(l)})"),
   dict(say='Use a for loop to print 1 x 2 = 2 up to 5 x 2 = 10.', hint='for (let i = 1; i <= 5; i++) { console.log(i + " x 2 = " + i * 2); }', test="return /for\\s*\\(/.test(t.src) && [1,2,3,4,5].every(function(n){return t.out.indexOf(n+' x 2 = '+n*2)>=0})"),
   dict(say='Use a while loop: print 3, 2, 1 and then "Go!".', hint='let n = 3; while (n > 0) { console.log(n); n = n - 1; } console.log("Go!");', test="return /while\\s*\\(/.test(t.src) && /3\\|2\\|1\\|Go!/.test(t.out.join('|'))")],
  turn='Change qty to 2 and run again. Which message prints now? Then add else if (qty >= 10) for "Huge order!".',
  quiz=[dict(q='What does === mean?', o=['Exactly equal', 'Assign a value', 'Greater than'], a=0, why='One = puts a value in a box. Three === asks if two things are the same.'),
        dict(q='for (let i = 1; i <= 3; i++) runs how many times?', o=['3', '1', 'Forever'], a=0, why='i is 1, then 2, then 3. After that i <= 3 is false.'),
        dict(q='What is dangerous in a while loop?', o=['Nothing changes inside, so it never stops', 'Using let', 'Using console.log'], a=0, why='An infinite loop freezes the page. Always change the counter.')])

# ---------------------------------------------------------------- Week 4
L(week=4, title='Functions: your own tools', topic='Functions and scope', cur='Week 4', kind='js', chips=['JavaScript', 'Functions'],
  big='A function is a recipe you write once and use many times. You give it ingredients (parameters), it does the work and hands back the result (return).',
  analogy='A function is like a puff-puff machine: put in flour and sugar, it gives out puff-puff. Use it 100 times without rebuilding it.',
  steps=['function total(price, qty) { return price * qty; } makes the tool.', 'total(250, 4) uses the tool. The answer comes back.', 'return sends the answer out. console.log inside only prints, it does not give it back.', 'Scope: a variable made INSIDE a function stays inside. Outside, it does not exist.'],
  shelf=[['function','function name(a, b) {\n  return |;\n}'],['return','return |;'],['call','console.log(name(1, 2));']],
  starter='''// Mission 1: function greet(name) that RETURNS "Welcome, NAME!"
// Mission 2: function total(price, qty) that RETURNS price * qty
// Mission 3: function bill(price, qty) uses total() and adds 7.5% VAT (multiply by 1.075)
// Mission 4: scope! Put  const hidden = 42;  INSIDE a function called keepSafe,
//            then print typeof hidden OUTSIDE it. What do you see?


console.log(greet("Ade"));
console.log(total(250, 4));
console.log(bill(100, 1));
console.log(typeof hidden);
''',
  solution='''function greet(name) {
  return "Welcome, " + name + "!";
}

function total(price, qty) {
  return price * qty;
}

function bill(price, qty) {
  return total(price, qty) * 1.075;
}

function keepSafe() {
  const hidden = 42;
  return hidden;
}

console.log(greet("Ade"));
console.log(total(250, 4));
console.log(bill(100, 1));
console.log(typeof hidden);
''',
  missions=[
   dict(say='greet("Ade") must RETURN "Welcome, Ade!".', hint='function greet(name) { return "Welcome, " + name + "!"; }', test="return t.call('greet','Ade')==='Welcome, Ade!' && t.call('greet','Bola')==='Welcome, Bola!'"),
   dict(say='total(price, qty) must return price * qty.', hint='function total(price, qty) { return price * qty; }', test="return t.call('total',250,4)===1000 && t.call('total',3,3)===9"),
   dict(say='bill(price, qty) must use total() and add 7.5% VAT.', hint='return total(price, qty) * 1.075;', test="return Math.abs(t.call('bill',100,1)-107.5)<0.0001 && /total\\s*\\(/.test(t.src.split('function bill')[1]||'')"),
   dict(say='Make hidden live INSIDE a function keepSafe, so typeof hidden prints undefined outside.', hint='function keepSafe() { const hidden = 42; return hidden; }', test="return /function\\s+keepSafe/.test(t.src) && t.out.indexOf('undefined')>=0 && typeof t.v('hidden')==='undefined'")],
  turn='Write a function isBigOrder(qty) that returns true when qty is 5 or more. Use it inside an if.',
  quiz=[dict(q='What does return do?', o=['Sends the answer back out of the function', 'Repeats the function', 'Deletes the function'], a=0, why='Without return, you get undefined.'),
        dict(q='A variable made inside a function can be used…', o=['Only inside that function', 'Anywhere', 'Only in loops'], a=0, why='That is scope: the variable lives inside the function.'),
        dict(q='In function total(price, qty), price and qty are called…', o=['parameters', 'loops', 'colours'], a=0, why='Parameters are the ingredients the function receives.')])

# ---------------------------------------------------------------- Week 5
L(week=5, title='Touch the page: the DOM', topic='DOM manipulation', cur='Week 5-6', kind='html', chips=['JavaScript', 'DOM'],
  big='The browser turns your HTML into a tree of objects called the DOM. JavaScript can find any piece, change its words, its colours, even build new pieces from nothing.',
  analogy='Your page is a wall with photo frames. The DOM lets JavaScript swap a photo, repaint a frame or hang a new one.',
  steps=['document.getElementById("title") finds one element.', 'element.textContent = "..." changes the words. element.style.color = "green" changes colour.', 'document.createElement("li") makes a new element. list.appendChild(li) puts it on the page.', 'element.classList.add("highlight") adds a CSS class.'],
  shelf=[['getElementById','document.getElementById("|")'],['textContent','.textContent = "|";'],['style.color','.style.color = "|";'],['createElement','const li = document.createElement("li");'],['appendChild','list.appendChild(li);'],['classList','.classList.add("|");']],
  starter='''<!DOCTYPE html>
<html>
<head>
  <title>{{SHOP}}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 12px; background: #fff8e1; }
    .highlight { background: yellow; padding: 6px; }
  </style>
</head>
<body>
  <h1 id="title">Loading...</h1>
  <ul id="list"></ul>
  <p id="note">Prices can change. Ask us!</p>

  <script>
    const items = ["{{I1}}", "{{I2}}", "{{I3}}"];
    // Mission 1: change the title text to your shop name
    // Mission 2: change the title colour with style.color
    // Mission 3: loop over items and add one <li> per item to #list
    // Mission 4: add the class "highlight" to #note

  </script>
</body>
</html>''',
  solution='''<!DOCTYPE html>
<html>
<head>
  <title>{{SHOP}}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 12px; background: #fff8e1; }
    .highlight { background: yellow; padding: 6px; }
  </style>
</head>
<body>
  <h1 id="title">Loading...</h1>
  <ul id="list"></ul>
  <p id="note">Prices can change. Ask us!</p>

  <script>
    const items = ["{{I1}}", "{{I2}}", "{{I3}}"];

    const title = document.getElementById("title");
    title.textContent = "{{SHOP}}";
    title.style.color = "{{CLR}}";

    const list = document.getElementById("list");
    for (let i = 0; i < items.length; i++) {
      const li = document.createElement("li");
      li.textContent = items[i];
      list.appendChild(li);
    }

    document.getElementById("note").classList.add("highlight");
  </script>
</body>
</html>''',
  missions=[
   dict(say='Change the h1 text from "Loading..." to your shop name.', hint='title.textContent = "My Shop";', test="return t.text('#title')!=='Loading...' && t.text('#title').length>2"),
   dict(say='Change the title colour with style.color.', hint='title.style.color = "green";', test="return t.css('#title','color')!=='rgb(0, 0, 0)' && /style\\.color/.test(t.src)"),
   dict(say='Use a loop to add one <li> per item into #list.', hint='for (…) { const li = document.createElement("li"); li.textContent = items[i]; list.appendChild(li); }', test="return t.count('#list li')===3 && t.all('#list li').map(function(l){return l.textContent}).join('|')==='{{I1}}|{{I2}}|{{I3}}' && /createElement/.test(t.src)"),
   dict(say='Add the class "highlight" to #note with classList.add.', hint='document.getElementById("note").classList.add("highlight");', test="var n=t.$('#note'); return n.classList.contains('highlight') && /classList/.test(t.src)")],
  turn='Make each list item show its price too, using an object or two arrays. Colour the expensive ones red.',
  quiz=[dict(q='What is the DOM?', o=['The page as objects JavaScript can change', 'A CSS colour', 'A kind of loop'], a=0, why='Document Object Model: the browser\'s picture of your page.'),
        dict(q='Which line changes the words of an element?', o=['el.textContent = "Hi"', 'el.color = "Hi"', 'el.new("Hi")'], a=0, why='textContent sets the words.'),
        dict(q='What does appendChild do?', o=['Puts a new element on the page', 'Deletes an element', 'Colours an element'], a=0, why='A new element does not show until you append it.')])

# ---------------------------------------------------------------- Week 6
L(week=6, title='Project: an interactive stall', topic='DOM manipulation and basic event handling', cur='Week 5-6', kind='html', chips=['JavaScript', 'Events', 'Project'],
  big='Your Term 3 JavaScript project. Make your stall page react: an add-to-cart button, a live total that updates as you type, and a warning for very big orders. All the earlier ideas meet here: variables, if, functions, events.',
  analogy='You are building the cash register of your stall: it counts, adds up and warns you.',
  steps=['"click" runs when a button is tapped. "input" runs every time someone types in a box.', 'Read a number from a box: Number(box.value).', 'Update the page after every change: total.textContent = qty * price.', 'if (qty > 10) { warning } else { clear it }'],
  shelf=[['click','add.addEventListener("click", function () {\n  |\n});'],['input','qtyBox.addEventListener("input", function () {\n  |\n});'],['Number()','Number(|.value)'],['if','if (qty > 10) {\n  |\n}']],
  starter='''<!DOCTYPE html>
<html>
<head>
  <title>{{SHOP}} cash register</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 12px; background: #fff8e1; }
    h1 { color: {{CLR}}; }
    button, input { font-size: 18px; padding: 10px; }
    button { background: {{CLR}}; color: white; border: 0; border-radius: 8px; }
    #warn { color: #c62828; font-weight: bold; min-height: 1.4em; }
  </style>
</head>
<body>
  <h1>{{SHOP}}</h1>
  <p>{{I1}}: ₦<span id="price" data-price="{{P1n}}">{{P1n}}</span></p>
  <button id="add">Add to cart</button>
  <p>Cart: <span id="count">0</span> items</p>
  <label>How many do you want? <input id="qty" type="number" value="1" min="0"></label>
  <p>Total: ₦<span id="total">{{P1n}}</span></p>
  <p id="warn"></p>
  <button id="clear">Clear</button>

  <script>
    // Mission 1: each click on #add makes #count go up by 1
    // Mission 2: when #qty changes ("input"), #total shows qty times the price
    // Mission 3: if qty is more than 10, #warn says "Big order! Please call us."
    //            otherwise #warn is empty
    // Mission 4: #clear sets the count back to 0

  </script>
</body>
</html>''',
  solution='''<!DOCTYPE html>
<html>
<head>
  <title>{{SHOP}} cash register</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 12px; background: #fff8e1; }
    h1 { color: {{CLR}}; }
    button, input { font-size: 18px; padding: 10px; }
    button { background: {{CLR}}; color: white; border: 0; border-radius: 8px; }
    #warn { color: #c62828; font-weight: bold; min-height: 1.4em; }
  </style>
</head>
<body>
  <h1>{{SHOP}}</h1>
  <p>{{I1}}: ₦<span id="price" data-price="{{P1n}}">{{P1n}}</span></p>
  <button id="add">Add to cart</button>
  <p>Cart: <span id="count">0</span> items</p>
  <label>How many do you want? <input id="qty" type="number" value="1" min="0"></label>
  <p>Total: ₦<span id="total">{{P1n}}</span></p>
  <p id="warn"></p>
  <button id="clear">Clear</button>

  <script>
    const price = Number(document.getElementById("price").dataset.price);
    const countBox = document.getElementById("count");
    const qtyBox = document.getElementById("qty");
    const totalBox = document.getElementById("total");
    const warn = document.getElementById("warn");
    let count = 0;

    document.getElementById("add").addEventListener("click", function () {
      count = count + 1;
      countBox.textContent = count;
    });

    qtyBox.addEventListener("input", function () {
      const qty = Number(qtyBox.value);
      totalBox.textContent = qty * price;
      if (qty > 10) {
        warn.textContent = "Big order! Please call us.";
      } else {
        warn.textContent = "";
      }
    });

    document.getElementById("clear").addEventListener("click", function () {
      count = 0;
      countBox.textContent = count;
    });
  </script>
</body>
</html>''',
  missions=[
   dict(say='Each click on Add to cart makes the cart count go up by 1.', hint='let count = 0; add.addEventListener("click", function () { count = count + 1; countBox.textContent = count; });', test="await t.click('#add'); await t.click('#add'); await t.click('#add'); return t.text('#count')==='3'"),
   dict(say='Typing a number in the box makes #total show qty times the price.', hint='qtyBox.addEventListener("input", function () { totalBox.textContent = Number(qtyBox.value) * price; });', test="var p=Number(t.attr('#price','data-price')); t.type('#qty','4'); return t.text('#total')===String(4*p)"),
   dict(say='When qty is more than 10, #warn says "Big order! Please call us." Otherwise it is empty.', hint='if (qty > 10) { warn.textContent = "Big order! Please call us."; } else { warn.textContent = ""; }', test="t.type('#qty','12'); var big=t.text('#warn'); t.type('#qty','2'); var small=t.text('#warn'); return big.length>3 && small===''"),
   dict(say='The Clear button sets the count back to 0.', hint='clear.addEventListener("click", function () { count = 0; countBox.textContent = count; });', test="await t.click('#add'); await t.click('#add'); await t.click('#clear'); return t.text('#count')==='0'")],
  turn='Add a second product with its own button. Show one grand total for the whole cart. Ask a friend to test it on their phone.',
  quiz=[dict(q='Which event runs every time someone types in a box?', o=['input', 'load', 'hover'], a=0, why='The input event fires on every key.'),
        dict(q='Why use Number(box.value)?', o=['A box gives text; we need a number to do maths', 'To hide the box', 'To make it faster'], a=0, why='.value is always text, even if it looks like a number.'),
        dict(q='What does if / else do in the warning?', o=['Shows the warning only for big orders', 'Always shows the warning', 'Never shows it'], a=0, why='The if checks the size of the order.')])

# ---------------------------------------------------------------- Week 7 (PHP)
PHPNOTE = 'PHP runs on a SERVER, not on your phone. In this lab a small PHP practice runner in your browser runs your code, so you can learn the basics. It supports the beginner parts of PHP.'
L(week=7, title='PHP: your first script', topic='Basic PHP syntax and variables', cur='Week 7-8', kind='php', chips=['PHP', 'Variables'],
  big='PHP is a language that runs on the server (the computer that serves websites) and prepares the page BEFORE it reaches your phone. Facebook, Wikipedia and many Nigerian websites use it. ' + PHPNOTE,
  analogy='JavaScript works in the customer\'s hands (the browser). PHP works in the kitchen (the server) and sends out the food ready.',
  steps=['PHP code lives between <?php and ?>. Every line ends with a semicolon ;', 'Variables start with a dollar sign: $shop = "Mama T";', 'echo prints something. Join text with a dot: "Hi " . $name', '\\n starts a new line inside double quotes.'],
  shelf=[['<?php','<?php\n|'],['$var','$|= ;'],['echo','echo "|";'],['. (join)',' . '],['\\n','\\n']],
  starter='''<?php
// Mission 1: echo a welcome message (end with \\n for a new line)
// Mission 2: make variables $shop (text) and $price (a number)
// Mission 3: echo a sentence that joins text and the variables with a dot .
// Mission 4: echo the price plus 100 (next month's price)

''',
  solution='''<?php
$shop = "{{SHOP}}";
$price = {{P1n}};

echo "Welcome to " . $shop . "\\n";
echo "{{I1}} costs ₦" . $price . "\\n";
echo "Next month: ₦" . ($price + 100) . "\\n";
''',
  missions=[
   dict(say='Start with <?php and echo a welcome message.', hint='echo "Welcome!\\n";', test="return /<\\?php/.test(t.src) && /echo\\b/.test(t.src) && t.out.trim().length>3"),
   dict(say='Make $shop (text) and $price (number).', hint='$shop = "My Shop"; $price = 500;', test="return /\\$shop\\s*=\\s*[\"']/.test(t.src) && /\\$price\\s*=\\s*\\d+/.test(t.src)"),
   dict(say='Echo a sentence that joins text and variables with a dot.', hint='echo "{{I1}} costs ₦" . $price . "\\n";', test="return /\\.\\s*\\$(price|shop)|\\$(price|shop)\\s*\\./.test(t.src) && t.lines.some(function(l){return l.indexOf('₦')>=0 && /\\d/.test(l)})"),
   dict(say='Echo the price plus 100.', hint='echo "Next month: ₦" . ($price + 100) . "\\n";', test="var m=/\\$price\\s*=\\s*(\\d+)/.exec(t.src); return !!m && t.out.indexOf(String(Number(m[1])+100))>=0")],
  turn='Make a $name variable with your name and echo: "Hello, my name is ..." Add your age too.',
  quiz=[dict(q='Every PHP variable starts with…', o=['$', '#', '@'], a=0, why='The dollar sign marks a variable: $price.'),
        dict(q='How do you join text in PHP?', o=['With a dot .', 'With a plus +', 'With a comma only'], a=0, why='In PHP the dot joins text. The plus is for adding numbers.'),
        dict(q='Where does PHP run?', o=['On the server', 'Inside the phone browser', 'In the SIM card'], a=0, why='The server runs PHP, then sends the finished page.')])

# ---------------------------------------------------------------- Week 8
L(week=8, title='PHP: arrays and types', topic='Basic PHP syntax and variables', cur='Week 7-8', kind='php', chips=['PHP', 'Variables'],
  big='An array is ONE variable that holds MANY things, like a shopping list. A list can have numbers (0, 1, 2…) or names (like "Tomatoes") for each slot. ' + PHPNOTE,
  analogy='An array is a tray of drinks: each place on the tray holds one bottle, and you can point to a place by its number or its label.',
  steps=['$items = ["Tomatoes", "Rice"]; The first one is $items[0] (counting starts at 0).', 'count($items) tells you how many.', '$prices = ["Rice" => 300]; has labels. Read it with $prices["Rice"].', '$items[] = "Yam"; adds one to the end. strlen("Ade") counts letters. strtoupper("ade") makes capitals.'],
  shelf=[['array','$| = ["", "", ""];'],['key=>value','"|" => '],['count','count($|)'],['$a[]','$items[] = "|";'],['strlen','strlen($|)']],
  starter='''<?php
$shop = "{{SHOP}}";
$items = ["{{I1}}", "{{I2}}", "{{I3}}"];

// Mission 1: echo how many items there are, using count()
// Mission 2: echo the SECOND item ($items[1])
// Mission 3: make $prices, a list with labels: "name" => price, for 3 items. Echo one price.
// Mission 4: add a 4th item with $items[] = "Yam"; and echo count() again
// Mission 5: echo strlen($shop) and strtoupper($shop)

''',
  solution='''<?php
$shop = "{{SHOP}}";
$items = ["{{I1}}", "{{I2}}", "{{I3}}"];

echo "Items: " . count($items) . "\\n";
echo "Second item: " . $items[1] . "\\n";

$prices = ["{{I1}}" => {{P1n}}, "{{I2}}" => {{P2n}}, "{{I3}}" => {{P3n}}];
echo "{{I2}} costs ₦" . $prices["{{I2}}"] . "\\n";

$items[] = "Yam";
echo "Now: " . count($items) . "\\n";

echo strlen($shop) . "\\n";
echo strtoupper($shop) . "\\n";
''',
  missions=[
   dict(say='Echo how many items there are using count().', hint='echo "Items: " . count($items) . "\\n";', test="return /count\\(\\s*\\$items\\s*\\)/.test(t.src) && t.lines.some(function(l){return /(^|\\D)3(\\D|$)/.test(l)})"),
   dict(say='Echo the SECOND item with $items[1].', hint='echo $items[1];', test="return /\\$items\\[\\s*1\\s*\\]/.test(t.src) && t.out.indexOf('{{I2}}')>=0"),
   dict(say='Make $prices with labels ("name" => price) for 3 items and echo one price.', hint='$prices = ["{{I1}}" => {{P1n}}, …];  echo $prices["{{I2}}"];', test="return /\\$prices\\s*=\\s*(\\[|array)/.test(t.src) && (t.src.match(/=>/g)||[]).length>=3 && /\\$prices\\[/.test(t.src)"),
   dict(say='Add a 4th item with $items[] = "..."; and echo count() again.', hint='$items[] = "Yam"; echo count($items);', test="return /\\$items\\[\\]\\s*=/.test(t.src) && t.lines.some(function(l){return /(^|\\D)4(\\D|$)/.test(l)})"),
   dict(say='Use strlen() and strtoupper() on $shop.', hint='echo strlen($shop); echo strtoupper($shop);', test="return /strlen\\(/.test(t.src) && /strtoupper\\(/.test(t.src) && t.error===null")],
  turn='Make a list of 5 school subjects. Echo the 1st and the last using count($subjects) - 1.',
  quiz=[dict(q='In PHP, what is the position number of the FIRST item in a list?', o=['0', '1', '-1'], a=0, why='Counting starts at zero.'),
        dict(q='What does count($items) give?', o=['How many items are in the list', 'The first item', 'The price'], a=0, why='count() counts the slots.'),
        dict(q='How do you add one more item to the end of $items?', o=['$items[] = "Yam";', '$items.add("Yam");', 'add $items "Yam";'], a=0, why='Empty square brackets mean: add to the end.')])

# ---------------------------------------------------------------- Week 9
L(week=9, title='PHP: decide and repeat', topic='Control structures and functions in PHP', cur='Week 9-10', kind='php', chips=['PHP', 'Conditionals', 'Loops'],
  big='The same two superpowers you used in JavaScript, now in PHP: if / elseif / else to decide, and for / foreach to repeat. foreach is special: it walks through every item in a list. ' + PHPNOTE,
  analogy='foreach is like a teacher calling the register: "next name, next name, next name" until the list ends.',
  steps=['if ($qty >= 10) { ... } elseif ($qty >= 5) { ... } else { ... }', 'foreach ($prices as $name => $cost) { ... } gives you each label and value.', 'for ($i = 1; $i <= 3; $i++) { ... } counts for you.', '$total += $cost; adds to a running total (it is short for $total = $total + $cost).'],
  shelf=[['if/elseif','if (|) {\n  \n} elseif () {\n  \n} else {\n  \n}'],['foreach','foreach ($prices as $name => $cost) {\n  |\n}'],['for','for ($i = 1; $i <= 3; $i++) {\n  |\n}'],['+=','$total += $cost;']],
  starter='''<?php
$prices = ["{{I1}}" => {{P1n}}, "{{I2}}" => {{P2n}}, "{{I3}}" => {{P3n}}];
$qty = 6;

// Mission 1: if $qty >= 10 echo "Big order!", elseif $qty >= 5 echo "Medium order", else "Small order"
// Mission 2: foreach: echo each line like this:  Name - ₦price   (one per line)
// Mission 3: a for loop that echoes "Day 1", "Day 2", "Day 3" (each on its own line)
// Mission 4: use foreach and += to find the total of all prices. Echo "Total: ₦" and the number

''',
  solution='''<?php
$prices = ["{{I1}}" => {{P1n}}, "{{I2}}" => {{P2n}}, "{{I3}}" => {{P3n}}];
$qty = 6;

if ($qty >= 10) {
  echo "Big order!\\n";
} elseif ($qty >= 5) {
  echo "Medium order\\n";
} else {
  echo "Small order\\n";
}

foreach ($prices as $name => $cost) {
  echo $name . " - ₦" . $cost . "\\n";
}

for ($day = 1; $day <= 3; $day++) {
  echo "Day " . $day . "\\n";
}

$total = 0;
foreach ($prices as $cost) {
  $total += $cost;
}
echo "Total: ₦" . $total . "\\n";
''',
  missions=[
   dict(say='Use if / elseif / else: with $qty = 6 it must echo "Medium order".', hint='if ($qty >= 10) { … } elseif ($qty >= 5) { echo "Medium order\\n"; } else { … }', test="return /\\belseif\\b/.test(t.src) && t.out.indexOf('Medium order')>=0"),
   dict(say='Use foreach to echo each line as: Name - ₦price', hint='foreach ($prices as $name => $cost) { echo $name . " - ₦" . $cost . "\\n"; }', test="return /foreach\\s*\\(/.test(t.src) && t.out.indexOf('{{I1}} - ₦{{P1n}}')>=0 && t.out.indexOf('{{I2}} - ₦{{P2n}}')>=0 && t.out.indexOf('{{I3}} - ₦{{P3n}}')>=0"),
   dict(say='Use a for loop to echo Day 1, Day 2, Day 3.', hint='for ($day = 1; $day <= 3; $day++) { echo "Day " . $day . "\\n"; }', test="return /for\\s*\\(/.test(t.src) && /Day 1\\nDay 2\\nDay 3/.test(t.out)"),
   dict(say='Find the total with foreach and += then echo "Total: ₦" and the number.', hint='$total = 0; foreach ($prices as $cost) { $total += $cost; } echo "Total: ₦" . $total;', test="return /\\+=/.test(t.src) && t.out.indexOf('Total: ₦{{PSUM}}')>=0")],
  turn='Add a fourth price. Run it again: does your total update by itself? That is the power of a loop.',
  quiz=[dict(q='What does foreach do?', o=['Walks through every item in a list', 'Repeats forever', 'Deletes the list'], a=0, why='foreach gives you each item one by one.'),
        dict(q='$total += 5;  means…', o=['$total = $total + 5;', '$total = 5;', '$total = $total - 5;'], a=0, why='+= adds to what is already there.'),
        dict(q='In PHP, which word means "otherwise if"?', o=['elseif', 'elif', 'otherwise'], a=0, why='PHP uses elseif (or else if).')])

# ---------------------------------------------------------------- Week 10
L(week=10, title='Project: the PHP receipt machine', topic='Control structures and functions in PHP', cur='Week 9-10', kind='php', chips=['PHP', 'Functions', 'Project'],
  big='Your last project. Write PHP functions that print a receipt for your stall. A function is a tool you write once and use again and again: perfect for receipts. ' + PHPNOTE,
  analogy='A function is your receipt machine: put in the item, the price and how many, and out comes a neat line.',
  steps=['function receiptLine($item, $price, $qty = 1) { return ...; } The $qty = 1 is a default: if you do not give it, it is 1.', 'return gives the answer back. echo prints it.', 'number_format(1500) turns 1500 into 1,500 (nice for money).', 'Call your function many times with different items.'],
  shelf=[['function','function name($a, $b = 1) {\n  return |;\n}'],['return','return |;'],['number_format','number_format(|)'],['call','echo receiptLine("", 0, 1) . "\\n";']],
  starter='''<?php
// Mission 1: function receiptLine($item, $price, $qty = 1)
//            it RETURNS text like:  Rice x2 = ₦600   (item, x, qty, = ₦, price times qty)
//            use number_format() for the money so 1500 shows as 1,500
// Mission 2: function orderTotal($price, $qty) returns $price * $qty
// Mission 3: the default! receiptLine("Yam", 50) must work and mean qty 1
// Mission 4: echo 3 receipt lines (your 3 items) and then a line "Total: ₦..."

''',
  solution='''<?php
function receiptLine($item, $price, $qty = 1) {
  return $item . " x" . $qty . " = ₦" . number_format($price * $qty);
}

function orderTotal($price, $qty) {
  return $price * $qty;
}

echo receiptLine("{{I1}}", {{P1n}}, 2) . "\\n";
echo receiptLine("{{I2}}", {{P2n}}) . "\\n";
echo receiptLine("{{I3}}", {{P3n}}, 3) . "\\n";

$grand = orderTotal({{P1n}}, 2) + orderTotal({{P2n}}, 1) + orderTotal({{P3n}}, 3);
echo "Total: ₦" . number_format($grand) . "\\n";
''',
  missions=[
   dict(say='receiptLine("Rice", 300, 2) must RETURN: Rice x2 = ₦600', hint='return $item . " x" . $qty . " = ₦" . number_format($price * $qty);', test="return t.eval('echo receiptLine(\"Rice\", 300, 2);')==='Rice x2 = ₦600' && t.eval('echo receiptLine(\"Oil\", 1500, 3);')==='Oil x3 = ₦4,500'"),
   dict(say='orderTotal($price, $qty) must return price times qty.', hint='function orderTotal($price, $qty) { return $price * $qty; }', test="return t.eval('echo orderTotal(250, 4);')==='1000'"),
   dict(say='Default value: receiptLine("Yam", 50) must mean quantity 1.', hint='function receiptLine($item, $price, $qty = 1)', test="return t.eval('echo receiptLine(\"Yam\", 50);')==='Yam x1 = ₦50'"),
   dict(say='Echo 3 receipt lines for your items, then "Total: ₦…".', hint='echo receiptLine("{{I1}}", {{P1n}}, 2) . "\\n"; … then echo "Total: ₦" . number_format($grand);', test="var ls=t.lines.filter(function(l){return / x\\d+ = ₦/.test(l)}); return ls.length>=3 && t.lines.some(function(l){return /^Total: ₦[\\d,]+$/.test(l)})")],
  turn='Make orderTotal add 7.5% VAT. Add a function that returns "Big order!" or "Small order" depending on $qty.',
  quiz=[dict(q='What is a default parameter, like $qty = 1?', o=['A value used when you do not give one', 'A secret value', 'A loop'], a=0, why='If you skip it, PHP uses the default.'),
        dict(q='What is the difference between return and echo?', o=['return gives the value back, echo prints it', 'They are the same', 'echo gives it back'], a=0, why='A function can return a value so other code can use it.'),
        dict(q='What does number_format(1500) give?', o=['1,500', '15', '1500.00'], a=0, why='It adds commas to make money easy to read.')])
