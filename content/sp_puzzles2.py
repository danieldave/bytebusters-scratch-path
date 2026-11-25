from sp_puzzles import add,Q,RD,OR,FX,SP,Z
# ---- Scratch
RD(1,"when green flag clicked\ngo to x: (0) y: (0)\nsay [I am in the middle!] for (2) seconds","Where is the sprite when it speaks?",["At the middle of the stage","At the top","At the left edge"],0,"x 0, y 0 is the centre of the stage.")
RD(1,"when [space v] key pressed\nchange y by (10)","What happens when you press space?",["The sprite moves up","The sprite moves right","The sprite hides"],0,"Change y by a positive number moves the sprite up.")
RD(1,"when green flag clicked\nplay sound [Meow v] until done\nsay [Hello!] for (2) seconds","What happens first?",["The sound plays and finishes","The sprite says Hello","Both together"],0,"'until done' waits for the sound to finish before the next block.")
RD(2,"when green flag clicked\nset [score v] to (0)\nrepeat (5)\nchange [score v] by (2)\nend","What is score at the end?",["5","10","2"],1,"5 times 2 is 10.")
RD(2,"when this sprite clicked\nif <(lives) = (0)> then\nbroadcast [game over v]\nend","When is 'game over' sent?",["When clicked and lives is 0","Every time it is clicked","Never"],0,"The if block only runs its inside when the condition is true.")
RD(2,"when green flag clicked\nforever\nif <touching [coin v]?> then\nchange [score v] by (1)\nhide\nend\nend","What happens when it touches the coin?",["Score goes up and the sprite hides","The coin hides","Nothing"],0,"Inside the if, the sprite adds 1 to score and then hides itself.")
RD(3,"when green flag clicked\nask [Capital of Nigeria?] and wait\nif <(answer) = [Abuja]> then\nchange [score v] by (1)\nsay [Correct!]\nelse\nsay [Try again]\nend","The player types Lagos. What does the sprite say?",["Correct!","Try again","Nothing"],1,"Lagos is not equal to Abuja, so the else part runs.")
OR(1,"A coin game",["when green flag clicked","set [score v] to (0)","forever","if <touching [coin v]?> then","change [score v] by (1)"],"Start the game, set score to 0, then keep checking for the coin.")
OR(1,"Say hello and hide",["when green flag clicked","say [Hello!] for (2) seconds","hide"],"Say first, then hide.")
OR(2,"A 10-second timer",["when green flag clicked","set [time v] to (10)","repeat (10)","wait (1) seconds","change [time v] by (-1)"],"Set time, then repeat wait and countdown.")
OR(2,"Game over message",["when I receive [game over v]","show","say [Well played!]"],"When the message arrives: show, then say.")
FX(1,"The sprite should hide on green flag. Which block is wrong?",["when green flag clicked","switch costume to [costume2 v]","hide"],1,"Switch costume is not needed here, and it hides after changing look. The key idea: check each block does what you want.")
FX(2,"Click the coin: add 1 to score. Which block is wrong?",["when this sprite clicked","change [lives v] by (1)","hide"],1,"It changes lives, not score.")
FX(2,"After 3 wrong answers the game must end. Which block is wrong?",["when green flag clicked","set [wrong v] to (0)","if <(wrong) > (3)> then","broadcast [game over v]"],2,"After 3 wrong answers means wrong = 3 (or > 2). 'More than 3' needs a 4th wrong answer.")
Q('scratch',1,"What does 'hide' do?",["Makes a sprite invisible","Deletes a sprite","Changes its costume"],0,"The sprite is still there. You can show it again.")
Q('scratch',1,"Which block makes a sprite talk?",["say","glide","hide"],0,"Say shows words in a speech bubble.")
Q('scratch',2,"A variable called Lives starts at 3. After 2 mistakes (each -1), what is Lives?",["1","2","0"],0,"3 - 1 - 1 = 1.")
Q('scratch',2,"Which is better for repeating something forever?",["forever","repeat 10","wait 1"],0,"Forever never stops.")
Q('scratch',2,"Which block would you use for a countdown clock?",["wait with a variable change","switch costume","go to x y"],0,"Wait 1 second, then change the variable by -1.")
Q('scratch',3,"Why use clones?",["To make many copies of a sprite while the game runs","To save the game","To change the backdrop"],0,"Clones let you make lots of raindrops or enemies without drawing each one.")
Q('scratch',3,"What does 'pick random 1 to 6' act like?",["A dice","A timer","A costume"],0,"A dice gives a number from 1 to 6 by chance.")
# ---- Web
for lvl,q,o,a,why in [
 (1,"Which tag makes a numbered list?",["<ol>","<ul>","<li>"],0,"ol = ordered list (numbers). ul = unordered list (dots)."),
 (1,"Which tag makes a paragraph?",["<p>","<h1>","<br>"],0,"p is for paragraphs of text."),
 (1,"Where do we put the page title that shows on the browser tab?",["Inside <head>","Inside <body>","Inside <p>"],0,"The title goes in the head."),
 (2,"In CSS, what does padding do?",["Adds space inside a box","Adds space outside a box","Changes the colour"],0,"Padding is inside. Margin is outside."),
 (2,"What does display: flex do?",["Lines things up in a row or column","Hides the page","Makes text bold"],0,"Flexbox arranges children neatly."),
 (2,"What does a media query help with?",["Different screen sizes","Colours","Pictures"],0,"It lets CSS change on phones and big screens."),
 (3,"What does addEventListener do?",["Waits for something like a click and runs code","Changes the colour","Makes a new page"],0,"It listens for an event."),
 (3,"What does document.getElementById('x') do?",["Finds the element with id x","Makes a new element","Deletes the page"],0,"It gets one element so code can use it."),
 (3,"What does textContent change?",["The words inside an element","The page address","The font"],0,"textContent changes the text."),
 (2,"Why is alt text on pictures important?",["It helps people who cannot see the picture","It makes the picture bigger","It is only for decoration"],0,"Screen readers read alt text aloud.")]:
    Q('web',lvl,q,o,a,why)
# ---- AI
for lvl,q,o,a,why in [
 (1,"What does 'hallucination' mean for an AI?",["It says something false but sounds sure","It draws a picture","It runs very fast"],0,"Always check important facts."),
 (1,"Which is a good thing to add to a prompt?",["Who it is for","Nothing else","Only capital letters"],0,"Knowing the audience helps the AI answer well."),
 (1,"What should you do if an AI chat asks for your home address?",["Say no and tell a trusted adult","Type it quickly","Ask a friend"],0,"Never share private details."),
 (2,"Which prompt will give the best answer?",["Write about rice","Write 4 lines about growing rice in Nigeria for a 10-year-old"],1,"Specific prompts get specific answers."),
 (2,"Why should you ask an AI for sources?",["To check if the facts are true","To make the answer longer","To make it faster"],0,"Sources help you fact-check."),
 (2,"A deepfake is…",["A fake video or voice made to look real","A fast computer","A type of Scratch block"],0,"Do not trust everything you see. Ask who made it."),
 (3,"AI gives a wrong answer. What is the best next step?",["Tell it what was wrong and ask again","Believe it anyway","Delete the chat only"],0,"You can correct it and ask again, then still check."),
 (3,"Which is honest use of AI for homework?",["Use it to understand, then write in your own words","Copy and paste its answer","Say you did it all alone"],0,"Learn from AI, don't copy."),
 (2,"What is an API key?",["A secret code that lets an app use an AI service","A type of keyboard","A password for Scratch"],0,"Keep it secret. Never post it online."),
 (1,"What is a prompt?",["What you type to tell the AI what to do","The AI's answer","A game"],0,"A prompt is your instruction.")]:
    Q('ai',lvl,q,o,a,why)
SP(2,"The AI wrote this about the internet. Which sentence is wrong?",["The internet connects computers around the world.","You can use it to send messages.","The internet is owned by one school."],2,"No one school owns the internet. It is a giant network of many networks.")
SP(2,"Spot the wrong sentence about web pages.",["HTML builds the structure of a page.","CSS changes how a page looks.","JavaScript is used only to make the page blue."],2,"JavaScript makes pages do things. CSS does colours.")
SP(2,"Spot the wrong sentence about safe passwords.",["A long password is stronger.","Do not use your name as a password.","Share your password with new friends so they trust you."],2,"Never share your password with anyone except a parent.")
SP(1,"Spot the wrong sentence about Scratch.",["A sprite is a character.","The green flag starts the project.","A backdrop is a small sound."],2,"A backdrop is the picture behind the sprites.")
SP(3,"Spot the wrong sentence about AI.",["AI can make mistakes.","You should check important facts.","AI always knows the latest news perfectly."],2,"AI can be out of date or wrong. Always check.")
SP(3,"Spot the wrong sentence about prompts.",["Adding who it is for helps.","Saying how long you want it helps.","A prompt should never include an example."],2,"Examples often help the AI understand what you want.")
