import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const TYPES: Record<string, string> = {
  "Wishlist-survey-workbook.xlsx":
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "responses.csv": "text/csv; charset=utf-8",
  "instrument.csv": "text/csv; charset=utf-8",
  "codebook.csv": "text/csv; charset=utf-8",
};

export async function GET(_req: Request, ctx: { params: Promise<{ file: string }> }) {
  const { file } = await ctx.params;
  const type = TYPES[file];
  if (!type) return new NextResponse("Not found", { status: 404 });

  try {
    const buf = await readFile(join(process.cwd(), "public", "survey", file));
    return new NextResponse(buf, {
      headers: {
        "Content-Type": type,
        "Content-Disposition": `attachment; filename="${file}"`,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
