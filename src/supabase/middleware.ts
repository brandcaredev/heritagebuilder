import { createServerClient } from "@supabase/ssr";
import {
  NextResponse,
  type NextRequest,
  type NextResponse as NextResponseType,
} from "next/server";

export async function updateSession(
  request: NextRequest,
  response: NextResponseType,
) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          const updatedResponse =
            response instanceof NextResponse
              ? response
              : NextResponse.next({ request });

          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            updatedResponse.cookies.set(name, value, options);
          });

          response = updatedResponse;
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const decodedUrl = decodeURIComponent(request.nextUrl.pathname).split("/")[2];
  if (!user && ["új", "new"].includes(decodedUrl ?? "")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return response;
}
