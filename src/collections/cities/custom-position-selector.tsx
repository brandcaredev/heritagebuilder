"use client";
import { Skeleton } from "@/components/ui/skeleton";
import { useField } from "@payloadcms/ui";
import dynamic from "next/dynamic";
import { PointFieldClientComponent } from "payload";
const CustomPositionMap = dynamic(() => import("./custom-position-map"), {
  loading: () => <Skeleton className="h-20 w-full" />,
  ssr: false,
});

const CustomPositionSelector: PointFieldClientComponent = ({ path }) => {
  const {
    value,
    setValue,
  }: {
    value: [number, number];
    setValue: (val: [number, number], disableModifyingForm?: boolean) => void;
  } = useField({ path });
  return <CustomPositionMap value={value} setValue={setValue} />;
};

export default CustomPositionSelector;
