"""Build the two editable bundles; no third-party dependency or new hosting files."""
from pathlib import Path
import json,sys
root=Path(__file__).resolve().parent
for target,parts in json.loads((root/'build-manifest.json').read_text()).items():
    text=''.join((root/part).read_text() for part in parts)
    if '--check' in sys.argv:
        if (root/target).read_text()!=text: raise SystemExit(target+' is out of date; run python3 build.py')
    else: (root/target).write_text(text)
print('Generated bundles match source.' if '--check' in sys.argv else 'Built app.js and style.css.')
