import json,sys,re
sys.path.insert(0,'.')
from sp_projects import ALL
from sp_projects2 import NEW2
from sp_puzzles2 import Z
from sp_web import W
from sp_web2 import W2
from sp_ai import A
from sp_ai2 import A2
from sp_words import D
WORDS=[{'id':re.sub(r'[^a-z0-9]+','-',x[0].lower()).strip('-'),'w':x[0],'d':x[1],'e':x[2],'t':x[3]} for x in sorted(D,key=lambda x:x[0].lower())]
P=ALL+NEW2+W+W2+A+A2
ids=[p['id'] for p in P]; assert len(ids)==len(set(ids)),'dup project ids'
zid=[z['id'] for z in Z]; assert len(zid)==len(set(zid))
json.dump({'v':5,'projects':P,'puzzles':Z,'words':WORDS},open('../public/data/content.json','w'),ensure_ascii=False,separators=(',',':'))
print(len(P),len(Z),len(WORDS))
