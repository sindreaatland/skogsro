#!/bin/bash
# Setter sammen spillet til én fil (dist/skogsro.html) og en testversjon med doctype
set -e
cd "$(dirname "$0")"
mkdir -p dist
JS=$(mktemp)
{ echo '<script>'; cat src/01-core.js lib/three.min.js; echo; cat src/02-sprites.js src/03-world.js src/04-audio.js src/05-game.js src/06-render.js src/07-ui.js src/08-net.js src/09-aim3d.js src/10-gl.js src/11-figs.js; echo '</script>'; } > "$JS"
python3 - "$JS" <<'EOF'
import sys
js=open(sys.argv[1]).read()
s=open('src/shell.html').read().replace('<!--SCRIPTS-->', js)
open('dist/skogsro.html','w').write(s)
open('dist/test.html','w').write('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"><meta name="apple-mobile-web-app-title" content="Ud på jakt"><meta name="theme-color" content="#121a16"></head><body>'+s+'</body></html>')
EOF
rm "$JS"
node -e "const fs=require('fs');const s=fs.readFileSync('dist/skogsro.html','utf8');const m=s.match(/<script>([\s\S]*)<\/script>/);new Function(m[1]);console.log('syntax ok',(s.length/1024|0)+'KB')"
