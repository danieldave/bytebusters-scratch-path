import json,sys
sys.path.insert(0,'.')
from sp_projects import ALL
from sp_puzzles import Z
from sp_web import W
from sp_ai import A
json.dump({'v':3,'projects':ALL+W+A,'puzzles':Z},open('../public/data/content.json','w'),ensure_ascii=False,separators=(',',':'))
print(len(ALL+W+A),len(Z))
