# -*- coding: utf-8 -*-
"""把 方案说明.md 转为 PDF（使用 reportlab 内置中文字体）"""
import re
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.cidfonts import UnicodeCIDFont

pdfmetrics.registerFont(UnicodeCIDFont("STSong-Light"))
FONT = "STSong-Light"

SRC = "方案说明.md"
OUT = "方案说明.pdf"

styles = getSampleStyleSheet()
title = ParagraphStyle("t", parent=styles["Title"], fontName=FONT, fontSize=18, leading=24)
h1 = ParagraphStyle("h1", parent=styles["Heading1"], fontName=FONT, fontSize=14, leading=20, spaceBefore=10, spaceAfter=4)
body = ParagraphStyle("b", parent=styles["Normal"], fontName=FONT, fontSize=10.5, leading=17)

doc = SimpleDocTemplate(OUT, pagesize=A4, topMargin=18*mm, bottomMargin=18*mm,
                        leftMargin=20*mm, rightMargin=20*mm)
flow = []

def clean(s):
    s = re.sub(r"\*\*(.+?)\*\*", r"\1", s)
    return s.replace("`", "")

for line in open(SRC, encoding="utf-8").read().split("\n"):
    line = line.rstrip()
    if not line:
        continue
    if line.startswith("# "):
        flow.append(Paragraph(clean(line[2:]), title))
        flow.append(Spacer(1, 6))
    elif line.startswith("## "):
        flow.append(Paragraph(clean(line[3:]), h1))
    elif line.startswith("- "):
        flow.append(Paragraph("• " + clean(line[2:]), body))
    else:
        flow.append(Paragraph(clean(line), body))

doc.build(flow)
print("saved", OUT)
