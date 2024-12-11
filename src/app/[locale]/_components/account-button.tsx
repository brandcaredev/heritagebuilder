"use client";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Link, useRouter } from "@/i18n/routing";
import { createClient } from "@/supabase/client";
import { useQuery } from "@tanstack/react-query";
import {
  LogInIcon,
  LogOut,
  PlusCircleIcon,
  ShieldEllipsis,
  User,
} from "lucide-react";

export default function AccountButton() {
  const supabase = createClient();
  const router = useRouter();
  const { data, isLoading, refetch } = useQuery({
    queryFn: async () => (await supabase.auth.getUser()).data,
    queryKey: ["user"],
    staleTime: 0,
  });

  if (isLoading) {
    return null;
  }

  const user = data?.user;

  if (user) {
    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label="User account"
            className="hover:text-stone-300"
          >
            <User className="h-5 w-5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-brown-light-40" />
            <Link href="/admin">
              <DropdownMenuItem>
                <ShieldEllipsis />
                <span>Admin</span>
              </DropdownMenuItem>
            </Link>
            <DropdownMenuItem
              onClick={async () => {
                await supabase.auth.signOut();
                router.refresh();
                await refetch();
              }}
            >
              <LogOut />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Link
          href={{ pathname: "/new" }}
          aria-label="New building"
          className="hover:text-stone-300"
        >
          <PlusCircleIcon className="h-5 w-5" />
        </Link>
      </>
    );
  }
  return (
    <Link
      href={{ pathname: "/login" }}
      aria-label="Login"
      className="hover:text-stone-300"
    >
      <LogInIcon className="h-5 w-5" />
    </Link>
  );
}
