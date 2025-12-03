"use client";

import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";

export default function Pagination({
  currentPage,
  totalPages,
}: {
  currentPage: number;
  totalPages: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleHover = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.prefetch(`?${params.toString()}`);
  };

  return (
    <div className="bg-white-2 absolute bottom-0 flex w-full items-center justify-between pt-8">
      <div>
        <Button
          variant="outline"
          className="w-28"
          onMouseEnter={() => handleHover(currentPage - 1)}
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous page
        </Button>
      </div>
      <span>
        Page {currentPage} of {totalPages}
      </span>
      <div>
        <Button
          variant="outline"
          className="w-28"
          onMouseEnter={() => handleHover(currentPage + 1)}
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next page
        </Button>
      </div>
    </div>
  );
}
