Z=[]
n=[0]
def add(t,track,lvl,**k):
    n[0]+=1; d=dict(id='z%03d'%n[0],type=t,track=track,level=lvl); d.update(k); Z.append(d)
def Q(track,lvl,q,o,a,why): add('quiz',track,lvl,q=q,o=o,a=a,why=why)
def RD(lvl,script,q,o,a,why): add('read','scratch',lvl,script=script,q=q,o=o,a=a,why=why)
def OR(lvl,title,blocks,why): add('order','scratch',lvl,title=title,blocks=blocks,why=why)
def FX(lvl,title,blocks,bad,why): add('fix','scratch',lvl,title=title,blocks=blocks,bad=bad,why=why)

# ---- Scratch: reading scripts
RD(1,"when green flag clicked\nhide\nsay [Hello!] for (2) seconds","What happens when you click the green flag?",["The sprite hides first","The sprite says Hello for 2 seconds, then hides","Nothing happens"],0,"Blocks run from top to bottom. It hides first. The say block is below, but a hidden sprite cannot be seen.")
RD(1,"when this sprite clicked\nchange [score v] by (1)","What does clicking this sprite do?",["Score goes up by 1","Score goes down by 1","Score resets to 0"],0,"'change score by 1' adds one each time.")
RD(1,"when green flag clicked\nforever\nmove (10) steps\nif on edge, bounce\nend","What will the sprite do?",["Move once and stop","Keep moving and bounce at the edges","Spin round and round"],1,"Forever means it never stops. If on edge, bounce turns it round.")
RD(1,"when I receive [start v]\nshow\nsay [Welcome!] for (2) seconds","When does this script run?",["When the green flag is clicked","When someone broadcasts 'start'","When a key is pressed"],1,"'When I receive' waits for a broadcast message. It is the purple events colour.")
RD(2,"when green flag clicked\nset [lives v] to (3)\nrepeat (3)\nchange [lives v] by (-1)\nend","What is the value of lives at the end?",["3","0","-3"],1,"Start at 3, take away 1 three times, and you get 0.")
RD(2,"when green flag clicked\nif <(score) > (9)> then\nsay [You win!]\nelse\nsay [Keep going!]\nend","Score is 5. What does the sprite say?",["You win!","Keep going!","Nothing"],1,"5 is not more than 9, so the else part runs.")
RD(2,"when green flag clicked\nset [money v] to (100)\nchange [money v] by (-30)\nchange [money v] by (-30)","How much money is left?",["40","60","100"],0,"100 - 30 - 30 = 40.")
RD(2,"when this sprite clicked\nbroadcast [next scene v]\nhide","What does this script do?",["Tells other sprites 'next scene', then hides","Hides, then tells others","Only hides"],0,"Top to bottom: broadcast first, then hide.")
RD(3,"when green flag clicked\nset [time v] to (10)\nrepeat until <(time) = (0)>\nwait (1) seconds\nchange [time v] by (-1)\nend\nbroadcast [time is up v]","How long does this take, and what happens at the end?",["10 seconds, then 'time is up' is sent","1 second, then nothing","Forever, nothing happens"],0,"It waits 1 second 10 times. When time is 0, the loop stops and 'time is up' is sent.")
# ---- order
OR(1,"Make a title screen",["when green flag clicked","hide","wait (1) seconds","show","say [Welcome to my game!]"],"Start with the green flag. Then hide, wait, show, and say.")
OR(1,"A sprite that starts a game when clicked",["when this sprite clicked","hide","broadcast [game starts v]"],"The sprite is clicked, hides, then tells everyone.")
OR(2,"Count down from 3",["when green flag clicked","set [count v] to (3)","repeat (3)","change [count v] by (-1)"],"First set the number. Then repeat the change.")
OR(2,"Catch game score",["when green flag clicked","set [score v] to (0)","forever","if <touching [Basket v]?> then","change [score v] by (1)"],"Set score to 0 first. Then keep checking if the basket is touched.")
OR(2,"Ask and answer",["when green flag clicked","ask [What is your name?] and wait","say (join [Hello ] (answer)) for (2) seconds"],"Ask first. The answer only exists after you ask.")
# ---- fix
FX(1,"This sprite should hide when the game starts. Which block is wrong?",["when green flag clicked","show","say [Get ready!] for (2) seconds"],1,"The sprite should hide on the flag, but 'show' makes it appear.")
FX(1,"Click the sprite to add 1 point. Which block is wrong?",["when this sprite clicked","change [score v] by (-1)"],1,"-1 takes a point away. It should be +1.")
FX(2,"This should send a message when time is up. Which block is wrong?",["when green flag clicked","wait (10) seconds","broadcast [start v]"],2,"It should broadcast 'time is up', not 'start'.")
FX(2,"The game must start with 3 lives. Which block is wrong?",["when green flag clicked","set [lives v] to (0)","say [Let's go!] for (2) seconds"],1,"Lives should be 3. Starting at 0 means you lose straight away.")
FX(2,"The sprite should move right when you press the right arrow. Which block is wrong?",["when [right arrow v] key pressed","change x by (-10)"],1,"Right means a positive x. -10 moves left.")
# ---- quizzes Scratch
Q('scratch',1,"What colour are variable blocks in our guide?",["Blue","Red","Green"],0,"Variables are blue. They remember things like score and money.")
Q('scratch',1,"What does a variable do?",["Remembers a number or word","Plays a sound","Draws a picture"],0,"A variable is like a box with a name that stores something.")
Q('scratch',1,"Which colour is for 'if / else' choices in our guide?",["Blue","Red","Purple"],1,"Conditionals (choices) are red.")
Q('scratch',1,"A 'forever' block is…",["A loop that never stops","A message","A sound"],0,"Loops repeat. Forever never ends until you press stop.")
Q('scratch',1,"What does 'broadcast' do?",["Sends a message to all sprites","Plays music","Makes a new sprite"],0,"Sprites that wait with 'when I receive' hear the message and act.")
Q('scratch',1,"Which hat block starts a script when the flag is clicked?",["when green flag clicked","when I receive","forever"],0,"The green flag is the start button of your game.")
Q('scratch',1,"What happens to a hidden sprite?",["It is invisible but still there","It is deleted","It moves away"],0,"Hide just makes it invisible. You can show it again.")
Q('scratch',2,"Which block repeats something exactly 10 times?",["repeat (10)","forever","wait (10)"],0,"Repeat counts. Forever never stops.")
Q('scratch',2,"What is the best use for a timer?",["Counting down a round","Changing a costume","Making a sprite bigger"],0,"A timer or wait helps with time limits.")
Q('scratch',2,"Why do we use broadcasts?",["So sprites can work together","To make the game bigger","To save the game"],0,"One sprite tells the others when to act. It keeps your code tidy.")
Q('scratch',2,"If score = 5 and you 'change score by 2', what is the score now?",["3","7","10"],1,"5 + 2 = 7.")
Q('scratch',2,"A costume is…",["Another picture of the same sprite","A new sprite","A sound"],0,"Switching costumes makes a sprite look like it is moving.")
Q('scratch',3,"You want a sprite to follow the mouse. Which block helps?",["go to (mouse-pointer)","wait","say"],0,"'go to mouse-pointer' inside a forever loop follows the mouse.")
Q('scratch',3,"How do you make a different random number each time?",["pick random (1) to (10)","set to 5","change by 1"],0,"Random picks a new number each time it runs.")
# ---- web
for q in [
 ("What does HTML do?",["Builds the page's content","Makes it bounce","Talks to the internet"],0,"HTML is the skeleton: headings, text, pictures and links."),
 ("What does CSS do?",["Makes the page look good","Stores data","Sends emails"],0,"CSS gives colour, size and space."),
 ("What does JavaScript do?",["Makes the page do things","Draws the page's colours","Names the page"],0,"JavaScript is for buttons that react, scores that change, and more."),
 ("Which tag makes the biggest heading?",["<h1>","<p>","<b>"],0,"h1 is the main heading. h6 is the smallest."),
 ("Which tag shows a picture?",["<img>","<pic>","<photo>"],0,"<img src='...'> shows a picture."),
 ("A link in HTML is made with…",["<a>","<l>","<link2>"],0,"<a href='...'>Click me</a> is a link."),
 ("In CSS, what does color: red; change?",["Text colour","Page speed","Page name"],0,"color changes the text colour. background changes the background."),
 ("Which is a safe password?",["Your name","12345","A long mix of words, numbers and symbols"],2,"Long and mixed passwords are hard to guess."),
 ("What does a browser do?",["Opens websites","Makes phones","Draws maps"],0,"Chrome and Safari are browsers."),
 ("What does 'responsive' mean?",["The page fits big and small screens","The page is red","The page is slow"],0,"A responsive page works on phones and computers.")]:
    Q('web',1 if q[0] in ("What does HTML do?","What does CSS do?","Which tag shows a picture?","What does a browser do?") else 2,*q)
# ---- ai
for q in [
 ("What is a prompt?",["What you tell the AI","The AI's answer","A computer virus"],0,"A prompt is your question or instruction to the AI."),
 ("Which prompt is better?",["Write about farming","Write 5 simple lines about farming in Ogun State for a 10-year-old"],1,"Clear instructions get clearer answers."),
 ("AI sometimes gets facts wrong. What do you do?",["Check with a trusted adult or book","Believe everything","Ignore it"],0,"Always check important facts."),
 ("Is it safe to type your home address into an AI app?",["No, never","Yes","Only if it is polite"],0,"Never share private details like your address, school or phone number."),
 ("Who owns the work if AI draws a picture for you?",["Say clearly that AI helped","Say nothing","Say you drew it by hand"],0,"Be honest about AI help. Honesty is part of being a good creator."),
 ("An AI says something unkind. What do you do?",["Tell a teacher or parent","Argue back","Share it"],0,"Tell a trusted adult."),
 ("What does an AI need to give a good answer?",["Clear facts and a clear goal","A lot of capital letters","A fast phone"],0,"Say who, what, and why."),
 ("What is a good first step when AI writes your homework?",["Read it, check it, and make it yours","Hand it in","Delete it"],0,"AI is a helper, not the boss. You must understand it.")]:
    Q('ai',1,*q)
