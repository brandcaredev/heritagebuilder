"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, useRouter } from "@/i18n/routing";
import { createClient } from "@/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { LogInIcon, LogOut, PlusCircleIcon, User } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import LoginSignupDialog from "./login-signup-dialog";

export default function AccountButton() {
  const t = useTranslations();
  const supabase = createClient();
  const router = useRouter();
  const { data, isLoading, refetch } = useQuery({
    queryFn: async () => (await supabase.auth.getUser()).data,
    queryKey: ["user"],
    staleTime: 0,
  });
  const [openLogin, setOpenLogin] = useState(false);

  if (isLoading) {
    return null;
  }

  const user = data?.user;

  if (user) {
    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label={t("account.userAccount")}
            className="hover:text-stone-300"
          >
            <User className="h-5 w-5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="z-10">
            <DropdownMenuLabel>{t("account.myAccount")}</DropdownMenuLabel>
            {/* <DropdownMenuSeparator className="bg-brown-200" />
            <Link href="admin">
              <DropdownMenuItem>
                <ShieldEllipsis />
                <span>{t("account.admin")}</span>
              </DropdownMenuItem>
            </Link> */}
            <DropdownMenuItem
              onClick={async () => {
                await supabase.auth.signOut();
                router.refresh();
                await refetch();
              }}
            >
              <LogOut aria-label="Log out" />
              <span>{t("account.signOut")}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Link
          href={{ pathname: "/new" }}
          aria-label={t("account.newBuilding")}
          className="hover:text-stone-300"
        >
          <PlusCircleIcon className="h-5 w-5" />
        </Link>
      </>
    );
  }
  return (
    <>
      <button
        onClick={() => setOpenLogin(true)}
        aria-label={"Login"}
        className="hover:cursor-pointer hover:text-stone-300"
      >
        <LogInIcon className="h-5 w-5" />
      </button>
      {openLogin && (
        <LoginSignupDialog open={openLogin} setOpen={setOpenLogin} />
      )}
    </>
  );
}
