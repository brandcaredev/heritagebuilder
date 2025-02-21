import { CollectionConfig } from "payload";

const Users: CollectionConfig = {
  slug: "users",
  auth: true,
  admin: {
    useAsTitle: "email",
    hidden: ({ user }) => user?.role !== "admin",
  },
  fields: [
    {
      name: "role",
      type: "select",
      options: [
        { label: "Admin", value: "admin" },
        { label: "Moderator", value: "moderator" },
      ],
      required: true,
      defaultValue: "moderator",
    },
    {
      name: "notifyOnNewBuilding",
      type: "checkbox",
      label: "Email when a new building is created",
      defaultValue: false,
    },
  ],
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
};

export default Users;
