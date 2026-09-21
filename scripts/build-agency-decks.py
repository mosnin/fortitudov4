"""Build landscape service pitch decks from the approved service catalog."""
import json, hashlib
from pathlib import Path
from xml.sax.saxutils import escape
from reportlab.pdfgen.canvas import Canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.colors import HexColor
from pypdf import PdfReader
import pypdfium2 as pdfium
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'public/resources'
fonts=ROOT/'node_modules/geist/dist/fonts/geist-sans'
for name,file in [('Regular','Geist-Regular.ttf'),('Medium','Geist-Medium.ttf')]: pdfmetrics.registerFont(TTFont(name,str(fonts/file)))
catalog=json.loads((ROOT/'src/content/service-catalog.json').read_text())
offers=json.loads((ROOT/'src/content/service-offers.json').read_text())
manifest=[]
W,H=960,540
for s in catalog:
 o=offers[s['slug']]; target=OUT/('fortitudo-'+s['resourceSlug']+'.pdf'); c=Canvas(str(target),pagesize=(W,H)); c.setTitle(s['name']+' — Fortitudo service deck');c.setAuthor('Fortitudo'); page=0
 def text(value,x,y,width,size=18,color='#b8b8b8'):
  p=Paragraph(escape(value),ParagraphStyle('p',fontName='Regular',fontSize=size,leading=size*1.42,textColor=HexColor(color)))
  _,h=p.wrap(width,1000)
  assert y-h>48,(s['slug'],page,value,y,h)
  p.drawOn(c,x,y-h); return y-h
 def slide(label,title):
  global page
  if page:c.showPage()
  page+=1;c.setFillColor(HexColor('#101010'));c.rect(0,0,W,H,stroke=0,fill=1)
  c.setFillColor(HexColor('#f7f7f5'));c.setFont('Medium',15);c.drawString(48,501,'Fortitudo')
  c.setFont('Regular',10);c.setFillColor(HexColor('#9b9b9b'));c.drawRightString(912,502,label.upper())
  c.setStrokeColor(HexColor('#363636'));c.line(48,44,912,44);c.setFont('Regular',9);c.drawString(48,25,'FORTITUDO / '+s['name'].upper());c.drawRightString(912,25,f'{page:02d}')
  c.linkURL('https://www.fortitudo.agency/services/'+s['slug'],(48,15,650,38))
  return text(title,48,449,850,39,'#f7f7f5')-30
 y=slide('Service deck',s['name']);text(o['summary'],48,y,680,27,'#f7f7f5');text(o['fit'],48,211,680,18);text('Design. Development. Delivery.',48,102,700,12)
 y=slide('The opportunity','What your business needs.');text(s['lead'],48,y,540,23,'#f7f7f5');text('Who this is for',655,y,250,13,'#f7f7f5');text(o['fit'],655,y-35,250,17)
 y=slide('The result','What we deliver.');text(s['result'],48,y,810,21,'#f7f7f5');
 for i,item in enumerate(o['deliverables']):text(f'{i+1:02d}  {item}',48+(i%2)*440,238-(i//2)*80,397,17)
 for start in range(0,len(s['sections']),2):
  y=slide('Scope of work','The work, in detail.')
  for i,item in enumerate(s['sections'][start:start+2]):
   x=48+i*440; yy=text(item['title'],x,y,395,26,'#f7f7f5')-24;text(item['body'],x,yy,395,17)
 for start in range(0,len(s['packages']),4):
  y=slide('Engagement options','A scope built around you.')
  for i,item in enumerate(s['packages'][start:start+4]):
   x=48+(i%2)*440;yy=y-(i//2)*132;yy=text(item['title'],x,yy,395,21,'#f7f7f5')-12;text(item['body'],x,yy,395,15)
 y=slide('Delivery','From brief to handover.')
 for i,item in enumerate(s['process']):
  yy=y-i*65;text(f'{i+1:02d}',48,yy,55,23,'#f7f7f5');text(item,127,yy,750,17)
 y=slide('Review & acceptance','How we assess the work.')
 for item in o['acceptance']:y=text(item,48,y,790,21,'#f7f7f5')-28
 y=slide('Project planning','What shapes the proposal.');yy=y
 for item in o['scopeDrivers']:yy=text(item,48,yy,390,21,'#f7f7f5')-20
 text(s['boundary'],510,y,400,17);text('Price, timing and responsibilities are agreed in the proposal. Third-party fees and ongoing support are identified separately.',48,130,830,14)
 y=slide('Working together','A clear start. Practical ownership.');text('What we need from you',48,y,390,24,'#f7f7f5');text(s['inputs'],48,y-54,390,17);text('What happens next',510,y,400,24,'#f7f7f5');text(o['firstStep'],510,y-54,400,17);text('Discuss your project →',48,116,650,24,'#f7f7f5');c.linkURL('https://www.fortitudo.agency/contact?offer='+s['slug'],(48,68,600,119));c.save()
 reader=PdfReader(str(target));assert len(reader.pages)==page
 assert all(p.extract_text().strip() for p in reader.pages)
 digest=hashlib.sha256(target.read_bytes()).hexdigest()[:12];doc=pdfium.PdfDocument(str(target));im=doc[0].render(scale=1.5).to_pil();im.save(OUT/'previews'/f'{s["resourceSlug"]}-{digest}.webp',quality=88)
 manifest.append(dict(slug=s['resourceSlug'],pages=page,bytes=target.stat().st_size,previewRevision=digest,file='/resources/'+target.name))
 print(s['slug'],page,'pages')
(ROOT/'src/content/resource-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
