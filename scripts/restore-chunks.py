#!/usr/bin/env python3
"""Restore stemforge source tree from scripts/chunks/part_*.b64"""
from __future__ import annotations
import base64, json, tarfile, io
from pathlib import Path

root = Path(__file__).resolve().parents[1]
chunk_dir = root / "scripts" / "chunks"
manifest = json.loads((chunk_dir / "manifest.json").read_text())
b64 = "".join((chunk_dir / name).read_text().strip() for name in manifest["parts"])
assert len(b64) == manifest["total_chars"], (len(b64), manifest["total_chars"])
data = base64.b64decode(b64)
with tarfile.open(fileobj=io.BytesIO(data), mode="r:gz") as tar:
    tar.extractall(root, filter="data")
print("Restored", len(manifest["parts"]), "parts →", root)
