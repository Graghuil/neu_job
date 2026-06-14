# -*- coding: utf-8 -*-
"""把 方案说明.md 转为 DOCX"""
import re
from docx import Document
from docx.shared import Pt, RGBColor
from docx.oxml.ns import qn

SRC = "方案说明.md"
OUT = "方案说明.docx"

doc = Document()
# 设置中文字体
style = doc.styles["Normal"]
style.font.name = "宋体"
style.font.size = Pt(11)
style.element.rPr.rFonts.set(qn("w:eastAsia"), "宋体")

lines = open(SRC, encoding="utf-8").read().split("\n")
for line in lines:
    line = line.rstrip()
    if not line:
        continue
    if line.startswith("# "):
        h = doc.add_heading(line[2:], level=0)
    elif line.startswith("## "):
        doc.add_heading(line[3:], level=1)
    elif re.match(r"^\d+\.\s", line):
        p = doc.add_paragraph(line, style="List Number")
    elif line.startswith("- "):
        doc.add_paragraph(line[2:], style="List Bullet")
    else:
        # 去掉行内 **加粗** 标记，保留文字
        text = re.sub(r"\*\*(.+?)\*\*", r"\1", line)
        text = text.replace("`", "")
        doc.add_paragraph(text)

doc.save(OUT)
print("saved", OUT)
