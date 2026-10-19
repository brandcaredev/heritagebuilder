import config from "@payload-config";
import { env } from "@/env";
import { sendEmail } from "@/lib/email";
import { renderGuideEmailTemplate } from "@/lib/guide-email-template";
import { getPayload } from "payload";
import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";

const contactSchema = z.object({
  guideId: z.coerce.number().int().positive(),
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(200),
  message: z.string().trim().min(1).max(5000),
});

export async function POST(request: Request) {
  try {
    const input = contactSchema.parse(await request.json());
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

    await sendEmail({
      from: `Heritage Builder <${env.BASE_EMAIL}>`,
      to: guide.email,
      replyTo: input.email,
      subject: `Új üzenet érkezett az Ön Heritage Builder-profiljára | Heritage Builder`,
      html: renderGuideEmailTemplate({
        eyebrow: "Idegenvezető megkeresése",
        title: "Új üzenet érkezett",
        introduction:
          "Egy látogató üzenetet küldött az Ön Heritage Builder-profilján keresztül.",
        details: [
          { label: "Feladó", value: input.name },
          { label: "E-mail-cím", value: input.email },
        ],
        messageLabel: "Üzenet",
        message: input.message,
        footerText:
          "A látogatóval közvetlenül erre az e-mailre válaszolva veheti fel a kapcsolatot.",
      }),
    });

    return NextResponse.json({ message: "Message sent." });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Please complete the form with valid information." },
        { status: 400 },
      );
    }
    console.error("Guide contact message failed:", error);
    return NextResponse.json(
      { message: "We could not send your message. Please try again." },
      { status: 500 },
    );
  }
}
