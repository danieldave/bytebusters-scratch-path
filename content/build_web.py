import json,sys,os;sys.path.insert(0,os.path.dirname(__file__))
from web_t2 import T2
from web_t3 import T3
themes={
 'MHS':dict(SHOP="Mama T's Honest Shop",TAG="Honest weight. Fair price.",CLR="#1f7a3a",items=[["Tomatoes",500],["Rice (1 cup)",300],["Palm oil",800]]),
 'UHS':dict(SHOP="Farm-to-Market Stall",TAG="Fresh from the farm to your pot.",CLR="#b4531a",items=[["Yam tuber",900],["Fresh pepper",300],["Groundnut (1 cup)",250]]),
 'YWS':dict(SHOP="Owambe Small-Chops Stand",TAG="Party food, fast and tasty.",CLR="#8a6d00",items=[["Puff-puff",200],["Chin-chin",300],["Samosa",250]]),
}
def clean(ls,term):
    out=[]
    for l in ls:
        d=dict(l);d['term']=term;d['shelf']=[dict(l=a,i=b) for a,b in l['shelf']];out.append(d)
    return out
data=dict(themes=themes,terms=dict(
  t2=dict(name='Second Term: HTML & CSS',project='Develop a form with basic validation using JS',lessons=clean(T2,'t2')),
  t3=dict(name='Third Term: JavaScript and PHP',project='Create interactive elements on a webpage; create simple programs using basic PHP',lessons=clean(T3,'t3'))))
p=os.path.join(os.path.dirname(__file__),'..','public','data','web.json')
json.dump(data,open(p,'w'),ensure_ascii=False,separators=(',',':'))
print(os.path.getsize(p))
