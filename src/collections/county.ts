import { authenticatedOrPublished } from "@/access/authenticatesOrPublished";
import { checkSlugUniqueness } from "@/hooks/slug-uniqueness";
import { formatSlug } from "@/lib/utils";
import { revalidateTag } from "next/cache";
import type { CollectionConfig } from "payload";
import { isNextBuild } from "payload/shared";

export const Counties: CollectionConfig = {
  slug: "counties",
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
      localized: true,
      index: true,
    },
    {
      name: "slug",
      type: "text",
      required: true,
      localized: true,
      index: true,
      hooks: {
        beforeValidate: [formatSlug("name")],
      },
      admin: {
        position: "sidebar",
        readOnly: true,
      },
    },
    {
      name: "description",
      type: "textarea",
      localized: true,
    },
    {
      name: "position",
      type: "point",
      admin: {
        components: {
          Field: "@/collections/cities/custom-position-selector",
        },
      },
    },
    {
      name: "country",
      type: "relationship",
      relationTo: "countries",
      required: true,
    },
    {
      name: "region",
      type: "relationship",
      relationTo: "regions",
    },
    {
      name: "code",
      type: "select",
      options: [
        { label: "Alba", value: "RO-AB" },
        { label: "Argeș", value: "RO-AG" },
        { label: "Arad", value: "RO-AR" },
        { label: "Bacău", value: "RO-BC" },
        { label: "Bihor", value: "RO-BH" },
        { label: "Bistrița-Năsăud", value: "RO-BN" },
        { label: "Brăila", value: "RO-BR" },
        { label: "Botoșani", value: "RO-BT" },
        { label: "București", value: "RO-B" },
        { label: "Brașov", value: "RO-BV" },
        { label: "Buzău", value: "RO-BZ" },
        { label: "Cluj", value: "RO-CJ" },
        { label: "Călărași", value: "RO-CL" },
        { label: "Caraș-Severin", value: "RO-CS" },
        { label: "Constanța", value: "RO-CT" },
        { label: "Covasna", value: "RO-CV" },
        { label: "Dâmbovița", value: "RO-DB" },
        { label: "Dolj", value: "RO-DJ" },
        { label: "Gorj", value: "RO-GJ" },
        { label: "Galați", value: "RO-GL" },
        { label: "Giurgiu", value: "RO-GR" },
        { label: "Hunedoara", value: "RO-HD" },
        { label: "Harghita", value: "RO-HR" },
        { label: "Ilfov", value: "RO-IF" },
        { label: "Ialomița", value: "RO-IL" },
        { label: "Iași", value: "RO-IS" },
        { label: "Mehedinți", value: "RO-MH" },
        { label: "Maramureș", value: "RO-MM" },
        { label: "Mureș", value: "RO-MS" },
        { label: "Neamț", value: "RO-NT" },
        { label: "Olt", value: "RO-OT" },
        { label: "Prahova", value: "RO-PH" },
        { label: "Sibiu", value: "RO-SB" },
        { label: "Sălaj", value: "RO-SJ" },
        { label: "Satu Mare", value: "RO-SM" },
        { label: "Suceava", value: "RO-SV" },
        { label: "Tulcea", value: "RO-TL" },
        { label: "Timiș", value: "RO-TM" },
        { label: "Teleorman", value: "RO-TR" },
        { label: "Vâlcea", value: "RO-VL" },
        { label: "Vrancea", value: "RO-VN" },
        { label: "Vaslui", value: "RO-VS" },
        { label: "Beograd", value: "RS-00" },
        { label: "Severnobački okrug", value: "RS-01" },
        { label: "Srednjebanatski okrug", value: "RS-02" },
        { label: "Severnobanatski okrug", value: "RS-03" },
        { label: "Južnobanatski okrug", value: "RS-04" },
        { label: "Zapadnobački okrug", value: "RS-05" },
        { label: "Južnobački okrug", value: "RS-06" },
        { label: "Sremski okrug", value: "RS-07" },
        { label: "Mačvanski okrug", value: "RS-08" },
        { label: "Kolubarski okrug", value: "RS-09" },
        { label: "Podunavski okrug", value: "RS-10" },
        { label: "Braničevski okrug", value: "RS-11" },
        { label: "Šumadijski okrug", value: "RS-12" },
        { label: "Pomoravski okrug", value: "RS-13" },
        { label: "Borski okrug", value: "RS-14" },
        { label: "Zaječarski okrug", value: "RS-15" },
        { label: "Zlatiborski okrug", value: "RS-16" },
        { label: "Moravički okrug", value: "RS-17" },
        { label: "Raški okrug", value: "RS-18" },
        { label: "Rasinski okrug", value: "RS-19" },
        { label: "Nišavski okrug", value: "RS-20" },
        { label: "Toplički okrug", value: "RS-21" },
        { label: "Pirotski okrug", value: "RS-22" },
        { label: "Jablanički okrug", value: "RS-23" },
        { label: "Pčinjski okrug", value: "RS-24" },
      ],
    },
    {
      name: "relatedBuildings",
      type: "join",
      collection: "buildings",
      on: "county",
      where: {
        _status: {
          equals: "published",
        },
      },
    },
    {
      name: "relatedCities",
      type: "join",
      collection: "cities",
      on: "county",
      where: {
        _status: {
          equals: "published",
        },
      },
    },
  ],
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "slug", "description", "_status"],
  },
  versions: {
    drafts: true,
  },
  hooks: {
    beforeChange: [checkSlugUniqueness("counties")],
    afterChange: [
      ({ doc, previousDoc }) => {
        if (doc._status === "draft" && previousDoc?._status !== "published") {
          return;
        }
        if (!isNextBuild()) {
          revalidateTag(`counties`);
        }
      },
    ],
    afterDelete: [
      () => {
        if (!isNextBuild()) {
          revalidateTag(`counties`);
        }
      },
    ],
  },
  access: {
    read: authenticatedOrPublished,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user), // Only logged in users can update
    delete: ({ req: { user } }) => Boolean(user), // Only logged in users can delete
  },
};
