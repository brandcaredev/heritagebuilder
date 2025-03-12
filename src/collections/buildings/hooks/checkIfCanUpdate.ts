import CustomAdminError from "@/lib/errorClasses";
import { CollectionBeforeChangeHook } from "payload";

export const checkIfCanUpdate: CollectionBeforeChangeHook = async ({
  req,
  originalDoc,
}) => {
  if (Boolean(req.user)) return;

  // if trying to update the en
  if (req.locale === "en") {
    const hunVersion = await req.payload.find({
      collection: "buildings",
      locale: "hu",
      where: {
        id: originalDoc.id,
      },
      limit: 1,
    });
    const isoDate = new Date(hunVersion.docs[0]!.createdAt).toISOString();
    if (
      hunVersion.docs.length > 0 &&
      Date.parse(isoDate) < Date.now() - 15 * 60 * 1000
    ) {
      throw new CustomAdminError("You can't update this building", 403);
    }
    return;
  }
  throw new CustomAdminError("You can't update this building", 403);
};
