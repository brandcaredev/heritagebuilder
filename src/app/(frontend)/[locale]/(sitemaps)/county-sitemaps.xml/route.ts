// TODO
// import { unstable_cache } from "next/cache";
// import { getPayload } from "payload";
// import config from "@payload-config";
// import { getLocale } from "next-intl/server";
// import { LocaleType } from "@/lib/constans";
// import { getURL } from "@/lib/utils";
// import { getServerSideSitemap } from 'next-sitemap'

// const getCountySitemaps = unstable_cache(
//   async () => {
//     const payload = await getPayload({ config });
//     const locale = await getLocale();
//     const results = await payload.find({
//       collection: "counties",
//       locale: locale as LocaleType,
//       draft: false,
//       where: {
//         _status: {
//           equals: "published",
//         },
//         name: {
//           not_equals: null,
//         },
//       },
//       select: {
//         slug: true,
//         updatedAt: true,
//       },
//     });

//     const dateFallback = new Date().toISOString();
//     return (
//       results.docs?.map((result) => ({
//         loc: `${getURL()}/${locale}/county/${result.slug}`,
//         lastmod: result.updatedAt || dateFallback,
//       })) ?? []
//     );
//   },
//   [],
//   { tags: ["counties"] },
// );

// export async function GET() {
//   const sitemap = await getCountySitemaps()

//   return getServerSideSitemap(sitemap)
// }
