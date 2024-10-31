import Image from "next/image";
import Divider from "./_icons/divider";
import { api } from "~/trpc/server";
import { createClient } from "~/supabase/server";
import { Link } from "~/i18n/routing";

export default async function MainPage() {
  const countries = await api.country.getCountries();
  const buildingTypes = await api.buildingType.getBuildingTypes();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const supabase = await createClient();
  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      {/* Main Content */}
      <div>
        <h1 className="mb-8 font-serif text-4xl text-stone-800">Discover</h1>

        {/* Country Grid */}
        <div className="mb-8 grid gap-4 md:grid-cols-2">
          {countries.map(async (country) => {
            const {
              data: { publicUrl },
            } = supabase.storage
              .from("heritagebuilder-test")
              .getPublicUrl(country.img ?? "");

            return (
              <Link
                key={country.id}
                href={`/${country.slug}`}
                className="group relative aspect-[4/3] overflow-hidden rounded-lg"
              >
                <Image
                  src={publicUrl ?? "/placeholder.svg"}
                  alt={country.name ?? "Country"}
                  width={600}
                  height={400}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <h2 className="absolute bottom-4 left-4 font-serif text-3xl text-white">
                  {country.name}
                </h2>
              </Link>
            );
          })}
        </div>

        {/* Building Types Grid */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {buildingTypes.map((type) => {
            const {
              data: { publicUrl },
            } = supabase.storage
              .from("heritagebuilder-test")
              .getPublicUrl(type.img ?? "");

            return (
              <Link
                key={type.id}
                href={`/${type.slug}`}
                className="group relative aspect-square overflow-hidden rounded-lg"
              >
                <Image
                  src={publicUrl ?? "/placeholder.svg"}
                  alt={type.name ?? "Building Type"}
                  width={200}
                  height={200}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <h3 className="absolute bottom-2 left-2 text-sm text-white">
                  {type.name}
                </h3>
              </Link>
            );
          })}
        </div>
      </div>
      <div className="hidden lg:block">
        <Divider />
      </div>
      {/* Latest Articles Sidebar */}
      <aside>
        <h2 className="mb-6 font-serif text-2xl text-stone-800">
          Latest articles
        </h2>
        <div className="space-y-4">
          {[
            { title: "Dancing House", location: "PRAGUE, CZECH REPUBLIC" },
            { title: "Fisherman's Bastion", location: "BUDAPEST, HUNGARY" },
            { title: "Palais Coburg", location: "VIENNA, AUSTRIA" },
            { title: "Tyn Church", location: "PRAGUE, CZECH REPUBLIC" },
            { title: "Matthias Church", location: "BUDAPEST, HUNGARY" },
          ].map((article, index) => (
            <Link
              key={index}
              href={`/article/${article.title.toLowerCase().replace(" ", "-")}`}
              className="group flex gap-4"
            >
              <Image
                src={`/placeholder.svg?height=80&width=80`}
                alt={article.title}
                width={80}
                height={80}
                className="rounded object-cover"
              />
              <div>
                <h3 className="font-serif text-stone-800 group-hover:text-stone-600">
                  {article.title}
                </h3>
                <p className="text-xs text-stone-500">{article.location}</p>
              </div>
            </Link>
          ))}
        </div>
      </aside>
    </div>
  );
}
