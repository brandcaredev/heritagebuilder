import { env } from "@/env";
import { sendEmail } from "@/lib/email";
import { getURL } from "@/lib/utils";
import { HookOperationType, PayloadRequest } from "payload";
import { Building } from "payload-types";

const getApprovalTemplate = (name: string, url: string) =>
  `<!DOCTYPE html>
<html lang="hu">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Épület jóváhagyva</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            color: #343e27;
            margin-bottom: 20px;
        }
        .content {
            font-size: 16px;
            line-height: 1.6;
            color: #333333;
        }
        .link-btn {
            display: inline-block;
            margin-top: 20px;
            padding: 12px 24px;
            background-color: #343e27;
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 5px;
        }
        .link-btn:hover {
            background-color: #6a573a;
        }
        .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 14px;
            color: #666666;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1 class="header">Jó hírek! 🎉</h1>
        <div class="content">
            <p>Örömmel értesítjük, hogy az Ön épülete (<strong>${name}</strong>) sikeresen jóváhagyásra került!</p>
            <p>Az alábbi gombra kattintva megtekintheti és kezelheti az épületet:</p>
            <p style="text-align: center;">
                <a href="${url}" class="link-btn">Épület megtekintése</a>
            </p>
            <p>Ha bármilyen kérdése van, forduljon bizalommal ügyfélszolgálatunkhoz.</p>
            <p>Köszönjük, hogy a Heritage Builder részese!</p>
        </div>
        <div class="footer">
            <p>&copy; 2025 Heritage Builder. Minden jog fenntartva.</p>
        </div>
    </div>
</body>
</html>
`;

const sendApprovalEmail = async (name: string, url: string, email: string) => {
  try {
    await sendEmail({
      from: `Heritage Builder <${env.BASE_EMAIL}>`,
      to: email,
      subject: "Az ön épülete jóváhagyásra került!",
      html: getApprovalTemplate(name, url),
    });
  } catch (e) {
    console.error("Approval email failed to send:", e);
  }
};

export const approvalEmail = async ({
  req,
  doc,
  previousDoc,
  operation,
}: {
  req: PayloadRequest;
  doc: Building;
  previousDoc: Building;
  operation: Extract<HookOperationType, "create" | "update">;
}) => {
  if (
    // only if the creator email is set
    doc.creatorEmail &&
    // only if the hungarian version is published
    req.locale === "hu" &&
    operation === "update" &&
    previousDoc?._status !== "published" &&
    doc?._status === "published"
  ) {
    const { totalDocs } = await req.payload.findVersions({
      collection: "counties",
      where: {
        "version._status": { equals: "published" },
        parent: { equals: previousDoc?.id || doc.id },
      },
    });
    const previousPublish = totalDocs > 0;
    if (!previousPublish) {
      await sendApprovalEmail(
        doc.name,
        `${getURL()}/hu/épület/${doc.slug}`,
        doc.creatorEmail,
      );
      return;
    }
  }
};
