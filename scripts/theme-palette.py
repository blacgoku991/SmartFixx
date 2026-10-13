"""Convert existing CSS colours to explicit role-aware light/dark tokens.
Run only on newly authored literal colours; existing var() references are preserved.
Illustration files and email HTML are not transformed.
"""
from pathlib import Path
import re,colorsys
root=Path(__file__).resolve().parents[1]
files=list((root/'app').rglob('*.css'))
colours={}
def parsed(v):
 h=v.lstrip('#')
 if len(h) in (3,4):h=''.join(c*2 for c in h)
 rgb=[int(h[i:i+2],16)/255 for i in (0,2,4)]
 return rgb,h[6:] if len(h)==8 else ''
def alternate(hex,source,role):
 rgb,alpha=parsed(hex);h,l,s=colorsys.rgb_to_hls(*rgb)
 if role=='fixed':return hex
 if source=='d':
  if role=='text':
   if l>.40:l=.16+(1-l)*.45;s=min(s,.65)
  elif role=='surface':
   if l<.43:l=.99-l*.35;s=min(s,.55)
   elif l>.82 and alpha:h=.61;l=.22;s=.35
  elif role=='border':l=.78 if l<.65 else .70;s=min(s,.35)
  elif role=='shadow':
   if alpha:alpha=f'{round(int(alpha,16)*.35):02x}'
 elif source=='l':
  if role=='text':l=.94-l*.5;s=min(s,.58)
  elif role=='surface':
   if l>.80:
    l=.065+(1-l)*.65
    if s<.25:h=.61;s=.48
  elif role=='border':l=.19+(1-l)*.35;s=min(s,.40)
  elif role=='shadow':
   if alpha:alpha=f'{min(255,round(int(alpha,16)*1.8)):02x}'
 rgb=colorsys.hls_to_rgb(h,l,s)
 return '#'+''.join(f'{round(x*255):02x}' for x in rgb)+alpha
for path in files:
 if path.name=='theme-tokens.css':continue
 text=path.read_text()
 def block(m):
  selector,body=m.group(1),m.group(2)
  source='l' if path.name=='campaigns.css' and not re.search(r'camp-settings|camp-journal|smtp-rate',selector) else 'd'
  def declaration(d):
   prop,value=d.group(1),d.group(2)
   if prop.startswith('--color-'):return d.group(0)
   if re.search(r'shadow',prop):role='shadow'
   elif re.search(r'border|outline|ring',prop):role='border'
   elif re.search(r'background|^fill$|--(?:card|popover|muted|secondary|accent|sidebar|camp-line)$',prop):role='surface'
   elif re.search(r'color|stroke|foreground|--(?:camp-ink|camp-muted|destructive)$',prop):role='text'
   else:role='fixed'
   if re.search(r'primary-foreground|sidebar-primary-foreground',prop):role='fixed'
   if role=='text' and re.search(r'(?:button|brand-mark|skip-link|checkbox|switch|badge).*?(?:primary|checked)|button-primary|brand-mark|header-cta|::selection',selector):role='fixed'
   def token(c):
    raw=c.group(0);raw={'white':'#ffffff','black':'#000000'}.get(raw,raw).lower()
    name=f'--sfx-{source}-{role}-{raw[1:]}'
    colours[name]=(raw,alternate(raw,source,role),source)
    return f'var({name})'
   value=re.sub(r'#[0-9a-fA-F]{3,8}\b|(?<![\w-])(?:white|black)(?![\w-])',token,value)
   if prop=='color-scheme':value='inherit'
   return prop+':'+value
  body=re.sub(r'([\w-]+):([^;{}]+)',declaration,body)
  return selector+'{'+body+'}'
 text=re.sub(r'([^{}]+)\{([^{}]*)\}',block,text)
 path.write_text(text)
# Preserve previously generated entries if this is rerun after new CSS was added.
p=root/'app/theme-tokens.css'
previous=p.read_text() if p.exists() else ''
if colours:
 default=':root{'+''.join(k+':'+v[0]+';' for k,v in sorted(colours.items()))+'}\n'
 light=':root[data-theme="light"]{'+''.join(k+':'+v[1]+';' for k,v in sorted(colours.items()) if v[2]=='d')+'}\n'
 dark=':root[data-theme="dark"]{'+''.join(k+':'+v[1]+';' for k,v in sorted(colours.items()) if v[2]=='l')+'}\n'
 p.write_text(previous+default+light+dark)
print(f'{len(colours)} colour tokens written across {len(files)} stylesheets')
