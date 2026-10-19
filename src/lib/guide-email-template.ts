type EmailDetail = {
  label: string;
  value: string;
};

type GuideEmailTemplate = {
  eyebrow: string;
  title: string;
  introduction: string;
  details: EmailDetail[];
  messageLabel?: string;
  message?: string;
  action?: { label: string; url: string };
  footerText?: string;
};

export const escapeEmailHtml = (value: string) =>
  value.replace(
    /[&<>\'"]/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;",
      })[character] ?? character,
  );

const renderDetail = ({ label, value }: EmailDetail) => `
  <tr>
    <td style="padding: 11px 14px; color: #6a573a; font-size: 14px; font-weight: 700; vertical-align: top; border-bottom: 1px solid #e1dcd4;">
      ${escapeEmailHtml(label)}
    </td>
    <td style="padding: 11px 14px; color: #201a11; font-size: 15px; line-height: 1.5; vertical-align: top; border-bottom: 1px solid #e1dcd4; word-break: break-word;">
      ${escapeEmailHtml(value)}
    </td>
  </tr>
`;

export const renderGuideEmailTemplate = ({
  eyebrow,
  title,
  introduction,
  details,
  messageLabel,
  message,
  action,
  footerText,
}: GuideEmailTemplate) => `
<!DOCTYPE html>
<html lang="hu">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeEmailHtml(title)}</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #edeeeb; color: #201a11; font-family: Arial, Helvetica, sans-serif;">
    <div style="display: none; max-height: 0; overflow: hidden; opacity: 0; color: transparent;">
      ${escapeEmailHtml(introduction)}
    </div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width: 100%; background-color: #edeeeb;">
      <tr>
        <td align="center" style="padding: 36px 16px;">
          <table role="presentation" width="640" cellspacing="0" cellpadding="0" border="0" style="width: 100%; max-width: 640px; border-collapse: separate; border-spacing: 0;">
            <tr>
              <td style="padding: 22px 30px; background-color: #6a573a; border-radius: 12px 12px 0 0; color: #edeeeb;">
                <div style="font-family: Georgia, 'Times New Roman', serif; font-size: 22px; font-weight: 700; letter-spacing: 0.2px;">Heritage Builder</div>
              </td>
            </tr>
            <tr>
              <td style="padding: 30px; background-color: #f0eeeb; border: 1px solid #cbc4ba; border-top: 0;">
                <p style="margin: 0 0 10px; color: #4a5838; font-size: 12px; font-weight: 700; letter-spacing: 1.3px; text-transform: uppercase;">${escapeEmailHtml(eyebrow)}</p>
                <h1 style="margin: 0 0 14px; color: #6a573a; font-family: Georgia, 'Times New Roman', serif; font-size: 28px; line-height: 1.25;">${escapeEmailHtml(title)}</h1>
                <p style="margin: 0 0 22px; color: #403423; font-size: 16px; line-height: 1.6;">${escapeEmailHtml(introduction)}</p>
                ${
                  details.length
                    ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width: 100%; border: 1px solid #cbc4ba; border-radius: 8px; border-spacing: 0; background-color: #ffffff;">
                  ${details.map(renderDetail).join("")}
                </table>`
                    : ""
                }
                ${
                  message !== undefined
                    ? `
                  <h2 style="margin: 24px 0 10px; color: #6a573a; font-family: Georgia, 'Times New Roman', serif; font-size: 20px;">${escapeEmailHtml(messageLabel ?? "Üzenet")}</h2>
                  <div style="padding: 16px 18px; border: 1px solid #cbc4ba; border-radius: 8px; background-color: #ffffff; color: #201a11; font-size: 16px; line-height: 1.65; white-space: normal;">${escapeEmailHtml(message).replace(/\r\n|\r|\n/g, "<br />") || "—"}</div>
                `
                    : ""
                }
                ${
                  action
                    ? `<p style="margin: 24px 0 0;"><a href="${escapeEmailHtml(action.url)}" style="display: inline-block; padding: 12px 22px; border-radius: 999px; background-color: #4a5838; color: #edeeeb; font-size: 15px; font-weight: 700; text-decoration: none;">${escapeEmailHtml(action.label)}</a></p>`
                    : ""
                }
                <p style="margin: 22px 0 0; color: #6a573a; font-size: 14px; line-height: 1.5;">${escapeEmailHtml(footerText ?? "A látogatóval közvetlenül erre az e-mailre válaszolva veheti fel a kapcsolatot.")}</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 16px 24px; background-color: #4a5838; border-radius: 0 0 12px 12px; color: #edeeeb; font-size: 12px; line-height: 1.5; text-align: center;">
                Heritage Builder
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
