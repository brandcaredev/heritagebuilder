import Image from "next/image";
import Divider from "./_icons/divider";
import { api } from "~/trpc/server";
import { createClient } from "~/supabase/server";
import { Link } from "~/i18n/routing";

export default async function MainPage() {
  const countries = await api.country.getCountries();
  const buildingTypes = await api.buildingType.getBuildingTypes();
  const buildings = await api.building.getBuildings();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const supabase = await createClient();
  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      {/* Main Content */}
      <div className="lg:w-4/6">
        <h1 className="mb-8 text-4xl text-stone-800">Discover</h1>

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
                <h2 className="absolute bottom-4 left-4 text-3xl text-white">
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
      <div className="lg:w-2/6">
        <h2 className="mb-6 text-2xl text-stone-800">Latest articles</h2>
        <div className="space-y-4">
          {[...buildings, ...buildings.splice(0, 3)].map((building) => {
            const {
              data: { publicUrl },
            } = supabase.storage
              .from("heritagebuilder-test")
              .getPublicUrl(building.img ?? "");

            return (
              <Link
                key={building.id}
                href={`/${building.slug}`}
                className="group relative flex items-center gap-4"
              >
                <div className="aspect-square">
                  <Image
                    src={publicUrl}
                    alt={building.name ?? "Building"}
                    width={50}
                    height={50}
                    className="h-full w-full rounded object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-brown font-bold group-hover:text-opacity-80">
                    {building.name}
                  </h3>
                  <p className="text-brown-dark-20 font-source-sans-3 text-xs uppercase">
                    {`${building.city?.name}, ${building.country?.name}`}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
