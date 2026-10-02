/**
 * Tiny dependency-free PDF writer.
 *
 * The Knowledge Vault ships generated study-pack PDFs so the "Download PDF"
 * buttons produce a real, openable document instead of a dead link. It builds a
 * single-page A4 document with Helvetica / Helvetica-Bold and computes the xref
 * offsets correctly, so the result is a valid PDF 1.4 file.
 */

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 56;

function escapeText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/[\u0000-\u001f\u007f-\u009f]/g, "")
    .replace(/[^\x20-\x7e]/g, "?");
}

/** Helvetica averages roughly 0.5em per glyph at 1em font size. */
function wrap(text: string, fontSize: number, maxWidth: number): string[] {
  const charsPerLine = Math.max(12, Math.floor(maxWidth / (fontSize * 0.5)));
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length <= charsPerLine) {
      line = candidate;
      continue;
    }
    if (line) lines.push(line);
    line = word.length > charsPerLine ? `${word.slice(0, charsPerLine)}` : word;
  }

  if (line) lines.push(line);
  return lines;
}

interface Line {
  text: string;
  font: "F1" | "F2";
  size: number;
  gapAfter: number;
  color?: [number, number, number];
}

export interface PdfSection {
  heading: string;
  paragraphs: string[];
}

export interface PdfDoc {
  title: string;
  subtitle: string;
  metaRows: Array<[string, string]>;
  sections: PdfSection[];
  footer: string;
}

function buildContentLines(doc: PdfDoc): string {
  const contentWidth = PAGE_WIDTH - MARGIN * 2;

  const header: Line[] = [
    {
      text: "MET Campus Hub  //  Academic Knowledge Vault",
      font: "F2",
      size: 9,
      gapAfter: 4,
      color: [0.02, 0.84, 0.6],
    },
    { text: doc.title, font: "F2", size: 20, gapAfter: 5 },
    {
      text: doc.subtitle,
      font: "F1",
      size: 10.5,
      gapAfter: 10,
      color: [0.63, 0.63, 0.67],
    },
  ];

  const laid: string[] = [];
  let cursorY = PAGE_HEIGHT - MARGIN;

  for (const line of header) {
    cursorY -= line.size * 1.2 + line.gapAfter;
    const rgb = line.color
      ? `${line.color.map((c) => c.toFixed(3)).join(" ")} rg`
      : "0 0 0 rg";
    laid.push(
      `${rgb}\nBT /${line.font} ${line.size} Tf ${MARGIN} ${cursorY.toFixed(2)} Td (${escapeText(line.text)}) Tj ET`,
    );
  }

  cursorY -= 8;
  laid.push(
    `0.84 0.84 0.86 RG 0.8 w\n${MARGIN} ${cursorY.toFixed(2)} m ${(PAGE_WIDTH - MARGIN).toFixed(2)} ${cursorY.toFixed(2)} l S`,
  );
  cursorY -= 18;

  for (const [key, value] of doc.metaRows) {
    if (cursorY < MARGIN + 140) break;
    const maxValueWidth = contentWidth - 130;
    const valueLines = wrap(value, 10, maxValueWidth);
    const blockHeight = Math.max(1, valueLines.length) * 13;

    cursorY -= blockHeight;
    laid.push(
      `0.13 0.13 0.14 rg\nBT /F2 10 Tf ${MARGIN} ${(cursorY + blockHeight - 11).toFixed(2)} Td (${escapeText(key)}) Tj ET`,
    );
    valueLines.forEach((valueLine, index) => {
      laid.push(
        `0.25 0.25 0.27 rg\nBT /F1 10 Tf ${(MARGIN + 130).toFixed(2)} ${(cursorY + blockHeight - 11 - index * 13).toFixed(2)} Td (${escapeText(valueLine)}) Tj ET`,
      );
    });
    cursorY -= 8;
  }

  cursorY -= 6;

  for (const section of doc.sections) {
    if (cursorY < MARGIN + 90) break;

    cursorY -= 16;
    laid.push(
      `0.02 0.84 0.6 rg\nBT /F2 12 Tf ${MARGIN} ${cursorY.toFixed(2)} Td (${escapeText(section.heading)}) Tj ET`,
    );

    for (const paragraph of section.paragraphs) {
      const wrapped = wrap(paragraph, 10.5, contentWidth);
      for (const textLine of wrapped) {
        if (cursorY < MARGIN + 60) break;
        cursorY -= 14;
        laid.push(
          `0.14 0.14 0.16 rg\nBT /F1 10.5 Tf ${MARGIN} ${cursorY.toFixed(2)} Td (${escapeText(textLine)}) Tj ET`,
        );
      }
      cursorY -= 6;
    }
  }

  if (cursorY > MARGIN + 30) {
    cursorY -= 14;
    const footerLines = wrap(doc.footer, 8.5, contentWidth);
    footerLines.forEach((textLine, index) => {
      laid.push(
        `0.55 0.55 0.58 rg\nBT /F1 8.5 Tf ${MARGIN} ${(cursorY - index * 11).toFixed(2)} Td (${escapeText(textLine)}) Tj ET`,
      );
    });
  }

  return laid.join("\n");
}

export function buildPdf(doc: PdfDoc): Blob {
  const stream = buildContentLines(doc);
  const objects: string[] = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] ` +
      "/Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>",
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
  ];

  let pdf = "%PDF-1.4\n%\xe2\xe3\xcf\xd3\n";
  const offsets: number[] = [];

  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (const offset of offsets) {
    pdf += `${offset.toString().padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  const bytes = new Uint8Array(pdf.length);
  for (let i = 0; i < pdf.length; i += 1) {
    bytes[i] = pdf.charCodeAt(i) & 0xff;
  }

  return new Blob([bytes], { type: "application/pdf" });
}

export function downloadPdf(doc: PdfDoc, filename: string): void {
  const blob = buildPdf(doc);
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
