import { env } from "@/env";
import { sendEmail } from "@/lib/email";
import { getURL } from "@/lib/utils";
import { renderGuideEmailTemplate } from "@/lib/guide-email-template";
import type {
  HookOperationType,
  PayloadRequest,
  RequestContext,
} from "payload";
import type { Guide } from "payload-types";

export const newGuideEmail = async ({
  req,
  doc,
  operation,
  context,
}: {
  req: PayloadRequest;
  doc: Guide;
  operation: Extract<HookOperationType, "create" | "update">;
  context: RequestContext;
}) => {
  const deferUntilTranslationsAreSaved =
    context.deferGuideSubmissionEmail === true;
  const notifyAfterTranslationsAreSaved =
    context.notifyGuideSubmission === true;

  if (
    doc._status !== "draft" ||
    deferUntilTranslationsAreSaved ||
    (operation !== "create" && !notifyAfterTranslationsAreSaved)
  ) {
    return;
  }

  try {
    const { docs: admins } = await req.payload.find({
      collection: "users",
      where: { role: { equals: "admin" } },
      select: { email: true },
      limit: 0,
      overrideAccess: true,
    });
    const recipients = admins.map(({ email }) => email).filter(Boolean);

    if (recipients.length === 0) {
      return;
    }

    await sendEmail({
      from: `Heritage Builder <${env.BASE_EMAIL}>`,
      to: recipients,
      subject: "Új idegenvezetői profil jóváhagyásra vár",
      html: renderGuideEmailTemplate({
        eyebrow: "Új idegenvezetői jelentkezés",
        title: "Új idegenvezetői profil vár jóváhagyásra",
        introduction: `${doc.name} idegenvezetői profilt küldött be ellenőrzésre.`,
        details: [
          { label: "Név", value: doc.name },
          { label: "E-mail cím", value: doc.email },
        ],
        action: {
          label: "Profil áttekintése",
          url: `${getURL()}/admin/collections/guides/${doc.id}`,
        },
        footerText:
          "A profil jóváhagyás után válik nyilvánosan elérhetővé.",
      }),
    });
  } catch (error) {
    console.error("New guide email failed to send:", error);
  }
};
