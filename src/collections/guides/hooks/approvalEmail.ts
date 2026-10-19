import { env } from "@/env";
import { getURL } from "@/lib/utils";
import { sendEmail } from "@/lib/email";
import { renderGuideEmailTemplate } from "@/lib/guide-email-template";
import type { HookOperationType, PayloadRequest } from "payload";
import type { Guide } from "payload-types";

export const guideApprovalEmail = async ({
  doc,
  previousDoc,
  operation,
}: {
  req: PayloadRequest;
  doc: Guide;
  previousDoc: Guide;
  operation: Extract<HookOperationType, "create" | "update">;
}) => {
  if (
    operation !== "update" ||
    previousDoc?._status === "published" ||
    doc?._status !== "published" ||
    !doc.email
  ) {
    return;
  }

  try {
    await sendEmail({
      from: `Heritage Builder <${env.BASE_EMAIL}>`,
      to: doc.email,
      subject: "Jóváhagytuk a Heritage Builder idegenvezetői profilját",
      html: renderGuideEmailTemplate({
        eyebrow: "Profiljóváhagyás",
        title: "Jóváhagytuk az idegenvezetői profilját",
        introduction: `Kedves ${doc.name}! Profilja már megtekinthető a Heritage Builderen.`,
        details: [],
        action: {
          label: "Nyilvános profil megtekintése",
          url: `${getURL()}/hu/idegenvezeto/${doc.slug}`,
        },
        footerText: "Köszönjük, hogy a Heritage Builder közösségének tagja.",
      }),
    });
  } catch (error) {
    console.error("Guide approval email failed to send:", error);
  }
};
