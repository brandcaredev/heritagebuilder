import { revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";

const allowedTags = new Set([
  "about-us",
  "building-types",
  "buildings",
  "cities",
  "community",
  "countries",
  "counties",
  "description",
  "regions",
  "youtube-links",
]);

export async function POST(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");

  if (!process.env.PAYLOAD_SECRET || token !== process.env.PAYLOAD_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    tags?: unknown;
  } | null;
  const tags = Array.isArray(body?.tags)
    ? body.tags.filter((tag): tag is string => allowedTags.has(String(tag)))
    : [];

  if (tags.length === 0) {
    return NextResponse.json(
      { error: "No valid tags provided" },
      { status: 400 },
    );
  }

  for (const tag of new Set(tags)) {
    revalidateTag(tag, "max");
  }

  return NextResponse.json({ revalidated: [...new Set(tags)] });
}
