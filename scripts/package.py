"""Empacota somente a extensão e as instruções, sem testes ou dados do SPX."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
root = Path(__file__).resolve().parents[1]
out = root.parent / 'output' / 'DEL-SPX-v0.1.3-teste.zip'
out.parent.mkdir(exist_ok=True)
with ZipFile(out, 'w', ZIP_DEFLATED) as z:
    for file in sorted((root / 'extension').rglob('*')):
        if file.is_file():
            z.write(file, Path('DEL-SPX') / file.relative_to(root / 'extension'))
    z.write(root / 'INSTALACAO.md', 'INSTALACAO.md')
print(out)
