import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Allow next internals, API routes, and the login page itself
    if (
        pathname.startsWith("/_next") ||
        pathname.startsWith("/api") ||
        pathname === "/login" ||
        pathname.startsWith("/static") ||
        pathname.includes(".")
    ) {
        return;
    }

    const auth = request.cookies.get("auth")?.value;
    if (auth === "true") {
        return;
    }

    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', request.nextUrl.pathname + request.nextUrl.search);
    return NextResponse.redirect(loginUrl);
}

export const config = {
    matcher: ['/((?!_next|api|login|static|favicon.ico).*)'],
};
