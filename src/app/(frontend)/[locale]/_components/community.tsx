import type { LocaleType } from "@/lib/constans";
import { getCommunityContent } from "@/lib/queries/community";
import React from "react";
import RichText from "./richtext";

interface CommunityProps {
  locale: LocaleType;
}

const Community: React.FC<CommunityProps> = async ({ locale }) => {
  const communityContent = await getCommunityContent(locale);

  if (!communityContent) {
    return null;
  }
  return (
    <div className="mb-16">
      <div className="lg:px-30">
        <RichText
          className="text-brown-700 mt-6"
          data={communityContent}
          enableGutter={false}
        />
      </div>
    </div>
  );
};

export default Community;
