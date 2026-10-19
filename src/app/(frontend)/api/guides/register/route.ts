import config from "@payload-config";
import { isValidGuidePhoneNumber } from "@/lib/guide-phone-validation";
import { getPayload } from "payload";
import { NextResponse } from "next/server";
import { slugify } from "@/lib/utils";

export const runtime = "nodejs";

const MAX_PROFILE_PHOTO_SIZE = 5 * 1024 * 1024;
const MAX_PUBLICATION_SIZE = 8 * 1024 * 1024;

const getRequiredText = (formData: FormData, key: string) => {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
};

const getList = (values: FormDataEntryValue[]) =>
  Array.from(
    new Set(
      values
        .filter((value): value is string => typeof value === "string")
        .flatMap((value) => value.split(","))
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  );

const isPdf = (file: File) =>
  file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

const safeFileName = (fileName: string) =>
  fileName.replace(/[^a-zA-Z0-9._-]/g, "-");

export async function POST(request: Request) {
  let guideId: number | undefined;
  let profilePhotoId: number | undefined;
  let publicationId: number | undefined;

  try {
    const formData = await request.formData();
    const name = getRequiredText(formData, "name");
    const bioEnglish = getRequiredText(formData, "bioEnglish");
    const bioHungarian = getRequiredText(formData, "bioHungarian");
    const cityIdValues = formData.getAll("cities");
    const cityIds = Array.from(
      new Set(
        cityIdValues.map((value) =>
          typeof value === "string" && /^\d+$/.test(value)
            ? Number(value)
            : Number.NaN,
        ),
      ),
    );
    const cityLocale = getRequiredText(formData, "cityLocale");
    const countryId = Number(getRequiredText(formData, "countryId"));
    const languages = getList(formData.getAll("languages"));
    const phone = getRequiredText(formData, "phone");
    const email = getRequiredText(formData, "email").toLowerCase();
    const profilePhoto = formData.get("profilePhoto");
    const publication = formData.get("publication");

    if (
      !name ||
      !bioEnglish ||
      !bioHungarian ||
      !cityIds.length ||
      cityIds.some((id) => !Number.isInteger(id) || id <= 0) ||
      !Number.isInteger(countryId) ||
      countryId <= 0 ||
      !["en", "hu"].includes(cityLocale) ||
      !languages.length ||
      !phone ||
      !email ||
      !profilePhoto ||
      !(profilePhoto instanceof File)
    ) {
      return NextResponse.json(
        { error: "requiredFields" },
        { status: 400 },
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "emailInvalid" },
        { status: 400 },
      );
    }

    if (!isValidGuidePhoneNumber(phone)) {
      return NextResponse.json(
        { error: "phoneInvalid" },
        { status: 400 },
      );
    }

    if (
      !profilePhoto.type.startsWith("image/") ||
      profilePhoto.size > MAX_PROFILE_PHOTO_SIZE
    ) {
      return NextResponse.json(
        { error: "profilePhotoInvalid" },
        { status: 400 },
      );
    }

    if (publication && !(publication instanceof File)) {
      return NextResponse.json(
        { error: "publicationUploadInvalid" },
        { status: 400 },
      );
    }

    if (
      publication instanceof File &&
      publication.name !== "" &&
      (publication.size === 0 ||
        publication.size > MAX_PUBLICATION_SIZE ||
        !isPdf(publication))
    ) {
      return NextResponse.json(
        { error: "publicationInvalid" },
        { status: 400 },
      );
    }

    const payload = await getPayload({ config });
    const { totalDocs: matchingCountries } = await payload.find({
      collection: "countries",
      locale: cityLocale as "en" | "hu",
      where: {
        and: [
          { id: { equals: countryId } },
          { _status: { equals: "published" } },
          { name: { not_equals: null } },
        ],
      },
      limit: 1,
      overrideAccess: true,
    });

    if (!matchingCountries) {
      return NextResponse.json(
        { error: "countryUnavailable" },
        { status: 400 },
      );
    }

    const { docs: selectedCities } = await payload.find({
      collection: "cities",
      locale: cityLocale as "en" | "hu",
      where: {
        and: [
          { id: { in: cityIds } },
          { country: { equals: countryId } },
          { _status: { equals: "published" } },
          { name: { not_equals: null } },
        ],
      },
      limit: 0,
      overrideAccess: true,
    });

    if (selectedCities.length !== cityIds.length) {
      return NextResponse.json(
        { error: "citiesUnavailable" },
        { status: 400 },
      );
    }

    const baseSlug = slugify(name) || "local-guide";
    let slug = baseSlug;
    let suffix = 2;
    while (true) {
      const { totalDocs } = await payload.find({
        collection: "guides",
        where: { slug: { equals: slug } },
        limit: 1,
        overrideAccess: true,
      });
      if (!totalDocs) break;
      slug = `${baseSlug}-${suffix}`;
      suffix += 1;
    }

    const profilePhotoDoc = await payload.create({
      collection: "media",
      data: { alt: `${name} profile photo` },
      file: {
        data: Buffer.from(await profilePhoto.arrayBuffer()),
        mimetype: profilePhoto.type,
        name: `${slug}-profile-${safeFileName(profilePhoto.name)}`,
        size: profilePhoto.size,
      },
      overrideAccess: true,
    });
    profilePhotoId = profilePhotoDoc.id;

    if (publication instanceof File && publication.size > 0) {
      const publicationDoc = await payload.create({
        collection: "guide-publications",
        data: {},
        file: {
          data: Buffer.from(await publication.arrayBuffer()),
          mimetype: "application/pdf",
          name: `${slug}-${safeFileName(publication.name)}`,
          size: publication.size,
        },
        overrideAccess: true,
      });
      publicationId = publicationDoc.id;
    }

    const guide = await payload.create({
      collection: "guides",
      data: {
        name,
        slug,
        profilePhoto: profilePhotoId,
        bio: bioHungarian,
        cities: cityIds,
        languages,
        phone,
        email,
        ...(publicationId ? { publication: publicationId } : {}),
      },
      draft: true,
      locale: "hu",
      context: { deferGuideSubmissionEmail: true },
      overrideAccess: true,
    });
    guideId = guide.id;

    await payload.update({
      collection: "guides",
      id: guide.id,
      data: { bio: bioEnglish },
      // Persist the second locale on the base draft document as well as its
      // version so it is present when an admin publishes the guide.
      draft: false,
      locale: "en",
      context: { notifyGuideSubmission: true },
      overrideAccess: true,
    });

    return NextResponse.json({
      message: "Your profile was submitted for approval.",
    });
  } catch (error) {
    console.error("Guide registration failed:", error);

    const payload = await getPayload({ config });
    const cleanupTasks = [];
    if (guideId) {
      cleanupTasks.push(
        payload.delete({
          collection: "guides",
          id: guideId,
          overrideAccess: true,
        }),
      );
    }
    if (profilePhotoId) {
      cleanupTasks.push(
        payload.delete({
          collection: "media",
          id: profilePhotoId,
          overrideAccess: true,
        }),
      );
    }
    if (publicationId) {
      cleanupTasks.push(
        payload.delete({
          collection: "guide-publications",
          id: publicationId,
          overrideAccess: true,
        }),
      );
    }
    await Promise.all(cleanupTasks);

    return NextResponse.json(
      { error: "error" },
      { status: 500 },
    );
  }
}
