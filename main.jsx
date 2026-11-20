#!/usr/bin/env python3
"""Build self-contained offline React preview (React 16 UMD available in local test environment).
The Vite application uses React 18; this HTML is a portable no-build edition."""
from pathlib import Path
import subprocess
ROOT=Path(__file__).resolve().parent.parent
B=ROOT/'.build-temp'
B.mkdir(exist_ok=True)
subprocess.run(['tsc','--allowJs','--checkJs','false','--jsx','react','--module','commonjs','--target','es2018','--lib','es2020,dom','--outDir',str(B),'--noEmitOnError','false','--skipLibCheck','--pretty','false','src/data.js','src/app.jsx'],cwd=ROOT,check=True)
react_dir=Path('/opt/pyvenv/lib/python3.13/site-packages/nbclassic/static/components/react')
react_js=(react_dir/'react.production.min.js').read_text()
react_dom=(react_dir/'react-dom.production.min.js').read_text()
css=(ROOT/'src/styles.css').read_text().replace("@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');",'')
data=(B/'data.js').read_text();app=(B/'app.js').read_text()
html=f'''<!doctype html><html lang="ru"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><meta name="theme-color" content="#080f1c"/><meta name="description" content="DAA Final Prep: lessons, quizzes, mock finals, flashcards and Java code practice."/><title>DAA Final Prep · Offline React edition</title><style>{css}</style></head><body><div id="root"></div><script>{react_js}</script><script>{react_dom}</script><script>window.React.Fragment = function ReactFragment(props) {{return props.children;}};</script><script>var exports = {{}}; {data}\nwindow.DAA_DATA = exports;</script><script>var exports = {{}}; {app}\nvar DAAApp = exports.DAAAppFactory(window.React,window.DAA_DATA);window.ReactDOM.render(window.React.createElement(DAAApp),document.getElementById('root'));</script></body></html>'''
output=ROOT/'standalone'/'daa-final-prep.html'
output.write_text(html,encoding='utf-8')
print(output, output.stat().st_size)
