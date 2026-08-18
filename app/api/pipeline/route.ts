import { NextResponse } from "next/server";

export const runtime = "nodejs";

/** Full-battery Groq in one function times out on Hobby. Client loops POST /api/extract. */
export async function POST() {
  return NextResponse.json(
    {
      error: "Use POST /api/extract per quote. The Discovery UI already does seven separate calls.",
    },
    { status: 405 },
  );
}
