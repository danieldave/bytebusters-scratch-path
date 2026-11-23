import json,sys
sys.path.insert(0,'.')
from sp_projects import ALL
from sp_puzzles import Z
from sp_web import W
json.dump({'v':2,'projects':ALL+W,'puzzles':Z},open('../public/data/content.json','w'),ensure_ascii=False,separators=(',',':'))
print(len(ALL+W),len(Z))
