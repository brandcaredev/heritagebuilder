import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import PendingBuildings from "./_components/pending-buildings";
import YoutubeLinks from "./_components/youtube-links";
import { api } from "@/trpc/server";
import LocationManager from "./_components/location-manager";
import { CountryExtendedWithTranslations } from "@/server/db/zodSchemaTypes";

export default async function AdminPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const pendingBuildings = await api.building.getPendingBuildings();
  const youtubeLinks = await api.youtube.getLinks();
  const buildingTypes = await api.buildingType.getBuildingTypes({
    lang: locale,
  });
  const countries = await api.country.getCountriesWithCountyCityRegion({
    lang: locale,
  });

  return (
    <div className="container py-10">
      <h1 className="mb-8 text-3xl font-bold">Admin Dashboard</h1>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">Pending Buildings</TabsTrigger>
          <TabsTrigger value="youtube">YouTube Links</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card className="p-6">
            <PendingBuildings
              pendingBuildings={pendingBuildings}
              buildingTypes={buildingTypes}
            />
          </Card>
        </TabsContent>

        <TabsContent value="youtube">
          <Card className="p-6">
            <YoutubeLinks youtubeLinks={youtubeLinks} />
          </Card>
        </TabsContent>

        <TabsContent value="locations">
          <Card className="p-6">
            <LocationManager
              countries={
                countries as unknown as CountryExtendedWithTranslations[]
              }
            />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
