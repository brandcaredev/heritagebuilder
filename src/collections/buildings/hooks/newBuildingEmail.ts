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
    <title>Új épület érkezett</title>
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
            <p>Új épület (<strong>${name}</strong>) került hozzáadásra a rendszerbe, amely jóváhagyásra vár.</p>
            <p>Kérjük, ellenőrizze az épület adatait és hagyja jóvá vagy egészítse ki. Az alábbi gombra kattintva megtekintheti az épület részleteit:</p>
            <p style="text-align: center;">
                <a href="${url}" class="link-btn">Épület ellenőrzése</a>
            </p>
            <p>Az épület addig nem lesz nyilvánosan elérhető, amíg jóváhagyásra nem kerül. Kérjük, mihamarabb tekintse át a beküldött információkat.</p>
            <p>Köszönjük közreműködését!</p>
        </div>
        <div class="footer">
            <p>&copy; 2025 Heritage Builder. Minden jog fenntartva.</p>
        </div>
    </div>
</body>
</html>
`;

const sendNewBuildingEmail = async (
  name: string,
  url: string,
  email: string,
) => {
  try {
    await sendEmail({
      from: `Heritage Builder <${env.BASE_EMAIL}>`,
      to: email,
      subject: "Egy új épület került hozzáadásra!",
      html: getApprovalTemplate(name, url),
    });
  } catch (e) {
    console.error("New building email failed to send:", e);
  }
};

export const newBuildingEmail = async ({
  req,
  doc,
  operation,
}: {
  req: PayloadRequest;
  doc: Building;
  operation: Extract<HookOperationType, "create" | "update">;
}) => {
  if (operation === "create") {
    // get the users with notifyOnNewBuilding set to true
    const { docs } = await req.payload.find({
      collection: "users",
      where: {
        role: { equals: "admin" },
        notifyOnNewBuilding: { equals: true },
      },
      overrideAccess: true,
      select: {
        email: true,
      },
    });
    if (docs.length > 0) {
      await Promise.all(
        docs.map(async (user) => {
          await sendNewBuildingEmail(
            doc.name,
            `${getURL()}/admin/collections/buildings/${doc.id}`,
            user.email,
          );
        }),
      );
    }
    return;
  }
};
