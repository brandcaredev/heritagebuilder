import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

import { LocaleType } from "@/lib/constans";
import {
  getNextLanguageBuildingSlug,
  searchBuildings,
} from "@/lib/queries/building";
const getApprovalTemplate = (name: string, url: string) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Building Approved</title>
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
            color: #ffffff;
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
        <h1 class="header">Good News! 🎉</h1>
        <div class="content">
            <p>We are pleased to inform you that your building <strong>${name}</strong> has been successfully approved!</p>
            <p>You can now view and manage your building by clicking the button below:</p>
            <p style="text-align: center;">
                <a href="${url}" class="link-btn">View Building</a>
            </p>
            <p>If you have any questions, feel free to reach out to our support team.</p>
            <p>Thank you for being part of Heritage Builder!</p>
        </div>
        <div class="footer">
            <p>&copy; 2024 Heritage Builder. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;
// TODO => after publishing the buildings, we need to send email to the creator

export const buildingRouter = createTRPCRouter({
  search: publicProcedure
    .input(z.object({ q: z.string(), lang: z.string() }))
    .query(
      async ({ input: { q, lang } }) =>
        (await searchBuildings(q, lang as LocaleType)).buildings,
    ),
  getLanguageBuildingSlug: publicProcedure
    .input(z.object({ slug: z.string(), nextLang: z.string() }))
    .query(
      async ({ input: { slug, nextLang } }) =>
        await getNextLanguageBuildingSlug(slug, nextLang as LocaleType),
    ),
});
