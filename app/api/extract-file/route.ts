import { NextRequest, NextResponse } from "next/server";
import { createRequire } from "module";

export const runtime = "nodejs";
export const maxDuration = 30;

const requireFn = createRequire(import.meta.url);

// 从上传的简历文件中抽取纯文本，支持 PDF（文字版）与 DOCX
export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "请上传文件" }, { status: 400 });
    }

    const name = file.name.toLowerCase();
    const buffer = Buffer.from(await file.arrayBuffer());
    let text = "";

    if (name.endsWith(".pdf")) {
      text = await extractPdfText(buffer);
    } else if (name.endsWith(".docx")) {
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else if (name.endsWith(".doc")) {
      return NextResponse.json(
        { error: "暂不支持旧版 .doc，请另存为 .docx 或 PDF 后上传" },
        { status: 400 }
      );
    } else {
      return NextResponse.json(
        { error: "仅支持 PDF 或 DOCX 文件" },
        { status: 400 }
      );
    }

    text = text.replace(/\n{3,}/g, "\n\n").trim();
    if (!text) {
      return NextResponse.json(
        { error: "未能从文件中提取到文字，可能是扫描件/图片型 PDF，请改用文字版或直接粘贴" },
        { status: 422 }
      );
    }

    return NextResponse.json({ text });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "文件解析失败";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// 用 pdfjs-dist 的 legacy build 抽取 PDF 文本（对 Node 服务端兼容性最好）
async function extractPdfText(buffer: Buffer): Promise<string> {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  // Node 服务端：把 worker 指向 legacy 的 worker 文件，转成 file:// URL（兼容 Windows）
  const path = await import("path");
  const { pathToFileURL } = await import("url");
  const workerPath = path.join(
    process.cwd(),
    "node_modules",
    "pdfjs-dist",
    "legacy",
    "build",
    "pdf.worker.mjs"
  );
  pdfjs.GlobalWorkerOptions.workerSrc = pathToFileURL(workerPath).href;

  const data = new Uint8Array(buffer);
  const doc = await pdfjs.getDocument({
    data,
    useSystemFonts: true,
    isEvalSupported: false,
  }).promise;

  const parts: string[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((it) => ("str" in it ? it.str : ""))
      .join(" ");
    parts.push(pageText);
  }
  await doc.destroy();
  return parts.join("\n");
}

