import config from "@payload-config";
import { env } from "@/env";
import { sendEmail } from "@/lib/email";
import { renderGuideEmailTemplate } from "@/lib/guide-email-template";
import { getPayload } from "payload";
import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";

const bookingSchema = z.object({
  guideId: z.coerce.number().int().positive(),
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(200),
  requestedDate: z.string().trim().min(1).max(30),
  people: z.coerce.number().int().positive().max(1000),
  buildingIds: z.array(z.coerce.number().int().positive()).min(1),
  language: z.string().trim().min(1).max(100),
  additionalMessage: z.string().trim().max(5000).optional().default(""),
});

export async function POST(request: Request) {
  try {
    const input = bookingSchema.parse(await request.json());
    const payload = await getPayload({ config });
    const { docs } = await payload.find({
      collection: "guides",
      where: { id: { equals: input.guideId } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    });
    const guide = docs[0];

    if (guide?._status !== "published") {
      return NextResponse.json(
        { message: "Guide not found." },
        { status: 404 },
      );
    }

    const buildingIds = Array.from(new Set(input.buildingIds));
    const { docs: buildings } = await payload.find({
      collection: "buildings",
      depth: 0,
      limit: 0,
      overrideAccess: true,
      where: {
        and: [
          { id: { in: buildingIds } },
          { _status: { equals: "published" } },
          { localGuides: { contains: guide.id } },
        ],
      },
      select: { name: true },
    });

    if (buildings.length !== buildingIds.length) {
      return NextResponse.json(
        { message: "Please select an associated building." },
        { status: 400 },
      );
    }

    const dateParts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(input.requestedDate);
    const requestedDate = dateParts
      ? `${dateParts[1]}. ${dateParts[2]}. ${dateParts[3]}.`
      : input.requestedDate;

    await sendEmail({
      from: `Heritage Builder <${env.BASE_EMAIL}>`,
      to: guide.email,
      replyTo: input.email,
      subject: `Új túraigénylés érkezett az Ön Heritage Builder-profiljára | Heritage Builder`,
      html: renderGuideEmailTemplate({
        eyebrow: "Túraigénylés",
        title: "Új túraigénylés érkezett",
        introduction:
          "Egy látogató túrát szeretne kérni az Ön Heritage Builder-profilján keresztül.",
        details: [
          { label: "Feladó", value: input.name },
          { label: "E-mail-cím", value: input.email },
          { label: "Kért időpont", value: requestedDate },
          { label: "Résztvevők száma", value: String(input.people) },
          {
            label: "Épület(ek)",
            value: buildings
              .map((building) => building.name)
              .filter(Boolean)
              .join(", "),
          },
          { label: "A túra nyelve", value: input.language },
        ],
        messageLabel: "További üzenet",
        message: input.additionalMessage || "—",
        footerText:
          "A látogatóval közvetlenül erre az e-mailre válaszolva veheti fel a kapcsolatot.",
      }),
    });

    return NextResponse.json({ message: "Tour request sent." });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Please complete the form with valid information." },
        { status: 400 },
      );
    }
    console.error("Guide tour request failed:", error);
    return NextResponse.json(
      { message: "We could not send your tour request. Please try again." },
      { status: 500 },
    );
  }
}
