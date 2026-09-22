"""Build Fortitudo's readable, branded sales PDFs from approved service content.

Run with Python plus reportlab, Pillow, pypdf and pypdfium2. Editorial narratives
are separate from the full scope catalog. Output includes layout/text/link QA.
No decorative rules, icons, cards, fabricated case studies or performance claims.
"""
from __future__ import annotations
import argparse
import hashlib
import json
from io import BytesIO
from pathlib import Path
from urllib.parse import urlencode
from xml.sax.saxutils import escape

from PIL import Image, ImageOps, ImageDraw
from pypdf import PdfReader
import pypdfium2 as pdfium
from reportlab.lib.colors import HexColor
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.pdfdoc import PDFString
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen.canvas import Canvas
from reportlab.platypus import Paragraph

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public/resources'
QA = ROOT / 'docs/imageworks/deck-redesign/qa'
W, H, M = 1280, 800, 64
BG, INK, MUTED = '#0a0a0a', '#fafafa', '#b5b5b5'
FONTS = ROOT / 'node_modules/geist/dist/fonts/geist-sans'
for name, filename in [('Geist', 'Geist-Regular.ttf'), ('GeistMedium', 'Geist-Medium.ttf')]:
    pdfmetrics.registerFont(TTFont(name, str(FONTS / filename)))


def read(name):
    return json.loads((ROOT / 'src/content' / name).read_text())


class Deck:
    def __init__(self, service, offer, story, photo):
        self.s, self.o, self.n = service, offer, story
        self.target = OUT / f'fortitudo-{service["resourceSlug"]}.pdf'
        self.c = Canvas(str(self.target), pagesize=(W, H), pageCompression=1, invariant=1)
        self.c.setTitle(f'{service["name"]} | Fortitudo')
        self.c.setAuthor('Fortitudo')
        self.c.setSubject(f'{offer["name"]}: outcomes, scope, delivery and how to start')
        self.c.setKeywords('Fortitudo, ' + service['name'] + ', service pitch, project brief')
        self.c.setViewerPreference('DisplayDocTitle', 'true')
        self.c.setPageCompression(1)
        self.c._doc.Catalog.Lang = PDFString('en-US')
        self.photo = Image.open(ROOT / 'public' / photo.lstrip('/')).convert('RGB')
        self.photo_cache = {}
        source_mark = Image.open(ROOT/'public/brand/fortitudo-mark.png').convert('RGBA')
        white_mark = Image.new('RGBA', source_mark.size, INK)
        white_mark.putalpha(source_mark.getchannel('A'))
        self.brand_mark = ImageReader(white_mark)
        self.page = 0
        self.boxes = []
        self.pages = []
        self.enquiry = 'https://www.fortitudo.agency/contact?' + urlencode({'service': service['serviceId'], 'offer': service['slug']})

    def photograph(self, x, y, w, h):
        key = (w, h)
        if key not in self.photo_cache:
            # Production assets remain unchanged. Crop only within the PDF frame.
            crop = ImageOps.fit(self.photo, (int(w * 1.5), int(h * 1.5)), method=Image.Resampling.LANCZOS)
            data = BytesIO()
            crop.save(data, 'JPEG', quality=88, optimize=True)
            data.seek(0)
            self.photo_cache[key] = ImageReader(data)
        self.c.drawImage(self.photo_cache[key], x, y, w, h)

    def text(self, value, x, top, width, size=24, color=INK, weight='Geist', leading=None, bottom=70):
        style = ParagraphStyle('deck', fontName=weight, fontSize=size,
                               leading=leading or size * 1.28, textColor=HexColor(color),
                               splitLongWords=False, allowWidows=0, allowOrphans=0)
        p = Paragraph(escape(value), style)
        _, height = p.wrap(width, 2000)
        assert top - height >= bottom, (self.s['slug'], self.page, 'text overflow', value, top - height)
        assert x >= 0 and x + width <= W and top <= H, (self.s['slug'], self.page, 'frame overflow')
        self.boxes.append(dict(page=self.page, text=value, x=x, top=top, width=width, height=height, size=size))
        p.drawOn(self.c, x, top - height)
        return top - height

    def mark(self, x=M, top=H-M):
        self.c.drawImage(self.brand_mark, x, top-25, 25, 25, mask='auto')
        self.text('Fortitudo', x+37, top, 190, 20, weight='GeistMedium')

    def slide(self, label, title=None, *, photo=False, brand_x=M, footer=True):
        if self.page:
            self.c.showPage()
        self.page += 1
        self.pages.append(label)
        self.c.setFillColor(HexColor(BG))
        self.c.rect(0, 0, W, H, fill=1, stroke=0)
        if photo:
            self.photograph(0, 0, W, H)
        self.mark(brand_x)
        self.c.bookmarkPage(f'page-{self.page}')
        self.c.addOutlineEntry(label, f'page-{self.page}', level=0)
        if footer:
            self.text(f'{self.s["name"]}  /  {label}', brand_x, 40, W-brand_x-100, 11, MUTED, bottom=18)
            self.c.setFont('Geist', 11)
            self.c.setFillColor(HexColor(MUTED))
            self.c.drawRightString(W-M, 26, f'{self.page:02d}')
        if title:
            return self.text(title, M, 636, W-2*M, 54, leading=60) - 42
        return 636

    def block(self, title, body, x, top, width, title_size=29, body_size=23):
        y = self.text(title, x, top, width, title_size, weight='GeistMedium')
        return self.text(body, x, y-16, width, body_size, MUTED)

    def build(self):
        s, o, n = self.s, self.o, self.n
        self.slide('Service overview', footer=False)
        self.photograph(760, 0, 520, H)
        self.text(s['name'], M, 635, 640, 24, MUTED)
        end = self.text(n['hook'], M, 568, 635, 68, leading=72)
        self.text(o['summary'], M, end-36, 620, 24, MUTED)
        self.text('Service overview', M, 100, 560, 13, MUTED)
        self.text('fortitudo.agency', M, 72, 560, 15, INK, bottom=36)
        self.c.linkURL('https://www.fortitudo.agency', (M, 42, 350, 83), relative=0)

        self.slide('The challenge')
        self.text(n['problemHeadline'], M, 636, 530, 54, leading=60)
        self.text(o['fit'], M, 300, 480, 24, MUTED)
        for i, item in enumerate(n['pains']):
            self.block(item['title'], item['body'], 694, 638-i*176, 510, 28, 23)

        y = self.slide('The solution', n['solutionHeadline'])
        # Actual deliverables, not fictional interface diagrams.
        top = min(y, 414)
        for i, item in enumerate(o['deliverables']):
            self.text(item, M+(i%2)*600, top-(i//2)*155, 526, 29, leading=38)

        self.slide('Why Fortitudo', brand_x=552, footer=False)
        self.photograph(0, 0, 470, H)
        self.text('Why work with us.', 552, 641, 660, 52, leading=60)
        for i, item in enumerate(n['benefits']):
            self.block(item['title'], item['body'], 552, 516-i*148, 650, 27, 22)
        self.text(f'Fortitudo  /  {s["name"]}', 552, 40, 660, 11, MUTED, bottom=18)

        y = self.slide('How it works', 'From the first conversation to a clear handover.')
        for i, item in enumerate(s['process']):
            x, top = M+(i%2)*600, min(y, 430)-(i//2)*169
            self.text(f'{i+1:02d}', x, top, 70, 22, MUTED)
            self.text(item, x+85, top, 437, 27, leading=36)

        self.slide('Review and acceptance')
        self.text('A working result, checked together.', M, 636, 570, 56, leading=62)
        self.text('We agree what success looks like before delivery, then review the work against it.', M, 339, 480, 24, MUTED)
        for i, item in enumerate(o['acceptance']):
            self.text(item, 694, 631-i*167, 510, 29, leading=38)

        # Full detail follows the concise buyer narrative. Nothing in the catalog
        # is silently discarded to make the layout appear more minimal.
        groups = []
        remaining = list(s['sections'])
        while remaining:
            count = 3 if len(remaining) == 3 else 2
            groups.append(remaining[:count])
            remaining = remaining[count:]
        for index, group in enumerate(groups):
            self.slide(f'Scope {index+1}')
            self.text(n['scopeHeadlines'][index], M, 636, 1110, 54, leading=60)
            for i, item in enumerate(group):
                if len(group) == 3:
                    self.block(item['title'], item['body'], M+i*398, 453, 356, 28, 23)
                else:
                    self.block(item['title'], item['body'], M+i*600, 453, 526, 34, 24)

        for start in range(0, len(s['packages']), 4):
            group = s['packages'][start:start+4]
            y = self.slide('Ways to work together' + (f' {start//4+1}' if start else ''), 'Start at the right scale.' if start == 0 else 'Extend or improve what you have.')
            if len(group) == 1:
                self.block(group[0]['title'], group[0]['body'], M, y, 920, 38, 28)
                self.text('We agree the deliverables, responsibilities and review points in a written proposal.', M, 206, 960, 24, MUTED)
            else:
                for i, item in enumerate(group):
                    self.block(item['title'], item['body'], M+(i%2)*600, min(y, 479)-(i//2)*182, 526, 28, 23)

        self.slide('Planning your project')
        self.text('A clear scope before the work begins.', M, 636, 1110, 54, leading=60)
        y = self.block('What we need from you', s['inputs'], M, 463, 526, 29, 23)
        self.block('What shapes the scope', ' · '.join(o['scopeDrivers']), M, y-40, 526, 27, 23)
        y = self.block('Scope and responsibilities', s['boundary'], 664, 463, 526, 29, 23)
        self.text('Your written proposal confirms price, timing, responsibilities, review points and final inclusions.', 664, y-38, 526, 23, MUTED)

        self.slide('Your questions')
        self.text('Before you decide.', M, 636, 1110, 54, leading=60)
        if len(o['faq']) <= 2:
            for i, item in enumerate(o['faq']):
                self.block(item['q'], item['a'], M+i*600, 475, 526, 29, 23)
        else:
            for i, item in enumerate(o['faq']):
                self.block(item['q'], item['a'], M+i*398, 475, 360, 27, 22)

        self.slide('Get started', footer=False)
        self.photograph(824, 0, 456, H)
        self.text(n['closing'], M, 614, 692, 66, leading=72)
        self.text(o['firstStep'], M, 365, 660, 27, leading=37)
        self.text('Start a conversation', M, 190, 650, 29, weight='GeistMedium')
        self.c.linkURL(self.enquiry, (M, 143, 505, 196), relative=0)
        self.text('hello@fortitudo.agency', M, 122, 650, 24, MUTED)
        self.c.linkURL('mailto:hello@fortitudo.agency', (M, 84, 530, 125), relative=0)
        self.text('fortitudo.agency/contact', M, 65, 650, 15, MUTED, bottom=36)
        self.c.linkURL(self.enquiry, (M, 39, 450, 67), relative=0)
        self.c.save()
        return self.verify()

    def verify(self):
        reader = PdfReader(str(self.target))
        assert len(reader.pages) == self.page
        all_text = '\n'.join(page.extract_text() for page in reader.pages)
        normalized = ' '.join(all_text.split())
        expected = [self.n['hook'], self.o['firstStep'], self.s['inputs'], self.s['boundary']]
        expected += self.o['deliverables'] + self.o['acceptance'] + self.s['process']
        expected += [p['body'] for p in self.s['sections']] + [p['body'] for p in self.s['packages']]
        expected += [p['a'] for p in self.o['faq']]
        for value in expected:
            assert ' '.join(value.split()) in normalized, (self.s['slug'], 'missing content', value)
        links = []
        for page in reader.pages:
            assert page.extract_text().strip()
            for ref in page.get('/Annots', []):
                action = ref.get_object().get('/A', {})
                if action.get('/URI'):
                    links.append(str(action['/URI']))
        assert self.enquiry in links and 'mailto:hello@fortitudo.agency' in links
        # Paragraph rectangles are explicit layout contracts. Exclude top branding
        # and footer labels, then ensure no two reading blocks overlap.
        for i, a in enumerate(self.boxes):
            for b in self.boxes[i+1:]:
                if a['page'] != b['page']:
                    continue
                overlaps_x = a['x'] < b['x']+b['width'] and b['x'] < a['x']+a['width']
                overlaps_y = a['top']-a['height'] < b['top'] and b['top']-b['height'] < a['top']
                assert not (overlaps_x and overlaps_y), (self.s['slug'], 'overlapping text', a['page'], a['text'], b['text'])
        digest = hashlib.sha256(self.target.read_bytes()).hexdigest()
        doc = pdfium.PdfDocument(str(self.target))
        (OUT/'previews').mkdir(exist_ok=True)
        doc[0].render(scale=1).to_pil().save(OUT/'previews'/f'{self.s["resourceSlug"]}-{digest[:12]}.webp', quality=88)
        # Uniform, legible contact sheets; full pages retained for detailed review.
        folder = QA/self.s['slug']; folder.mkdir(parents=True, exist_ok=True)
        cols, tw, th = 3, 512, 320
        sheet = Image.new('RGB', (cols*tw, ((self.page+cols-1)//cols)*(th+24)), '#262626')
        draw = ImageDraw.Draw(sheet)
        for i, p in enumerate(doc):
            im = p.render(scale=1).to_pil().convert('RGB')
            im.save(folder/f'{i+1:02d}.jpg', quality=88)
            sheet.paste(im.resize((tw, th), Image.Resampling.LANCZOS), ((i%cols)*tw, (i//cols)*(th+24)))
            draw.text(((i%cols)*tw+8, (i//cols)*(th+24)+th+4), f'{i+1:02d} {self.pages[i]}', fill='white')
        sheet.save(QA/f'{self.s["slug"]}-contact-sheet.jpg', quality=90)
        doc.close()
        return dict(slug=self.s['slug'], pages=self.page, bytes=self.target.stat().st_size,
                    sha256=digest, links=links, requiredTextChecks=len(expected),
                    textBlocks=len(self.boxes), minBodySize=min(b['size'] for b in self.boxes if b['top']>130),
                    boundsAndOverlap='passed', sections=self.pages)


def main():
    parser = argparse.ArgumentParser(); parser.add_argument('--only', nargs='*'); args=parser.parse_args()
    catalog, offers, stories, photos = [read(n) for n in ['service-catalog.json', 'service-offers.json', 'deck-narratives.json', 'service-photography.json']]
    assert set(stories) == {s['slug'] for s in catalog}
    QA.mkdir(parents=True, exist_ok=True); OUT.mkdir(exist_ok=True)
    manifest = read('resource-manifest.json'); checks=[]
    for s in catalog:
        if args.only and s['slug'] not in args.only: continue
        result=Deck(s, offers[s['slug']], stories[s['slug']], photos[s['slug']]).build()
        checks.append(result)
        entry=dict(slug=s['resourceSlug'], pages=result['pages'], bytes=result['bytes'], previewRevision=result['sha256'][:12], file=f'/resources/fortitudo-{s["resourceSlug"]}.pdf')
        manifest=[entry if row['slug']==s['resourceSlug'] else row for row in manifest]
        print(f'{s["slug"]}: {result["pages"]} pages, {result["requiredTextChecks"]} content checks, {result["bytes"]//1024} KB', flush=True)
    (ROOT/'src/content/resource-manifest.json').write_text(json.dumps(manifest, indent=2)+'\n')
    (QA/'checks.json').write_text(json.dumps(checks, indent=2)+'\n')

if __name__ == '__main__': main()
