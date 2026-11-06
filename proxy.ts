
import { NextRequest, NextResponse } from "next/server";
import setCookieParser, {type Cookie} from "set-cookie-parser";

const protectedRoutes = ["/dashboard"];
const authRoutes = ["/", "/login", "/register"];

const ACCESS_COOKIE = "access_token";
const REFRESH_COOKIE = "refresh_token";
const REFRESH_THRESHOLD = 60;

function getTokenExpiry(token?: string): number | null {
    if (!token) return null;

    try {
        const payload = token.split(".")[1];
        if (!payload) return null;
        const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
        const decoded = JSON.parse(atob(normalized));
        return typeof decoded.exp === "number" ? decoded.exp  : null;
    } catch {
        return null;
    }
}

function isTokenExpiringSoon(token?: string): boolean {
    const expiry = getTokenExpiry(token);
    if (!expiry) return true;
    return expiry <= Math.floor(Date.now() / 1000) + REFRESH_THRESHOLD;
}

function isProtectedRoute(pathname: string): boolean {
    return protectedRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`));
}

function isAuthRoute(pathname: string): boolean {
    return authRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`));
}

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    let accessToken = request.cookies.get(ACCESS_COOKIE)?.value;
    const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;

    let refreshedCookies: ReturnType<typeof setCookieParser.parse> = [];
    let invalidSession = false;
    let refreshUnavailable = false;

    // Check whether the access token needs refreshing.
    const needsRefresh = isTokenExpiringSoon(accessToken);

    if (needsRefresh && refreshToken) {
        try {
            const backendUrl = process.env.BACKEND_URL;

            if (!backendUrl) {
                throw new Error("BACKEND_URL is not configured.");
            }

            const refreshResponse = await fetch(
                `${backendUrl}/auth/refresh`,
                {
                    method: "POST",
                    headers: {
                        Cookie: `${REFRESH_COOKIE}=${refreshToken}`,
                    },
                    cache: "no-store",
                }
            );

            if (!refreshResponse.ok) {
                if (refreshResponse.status === 401 || refreshResponse.status === 403) {
                    invalidSession = true;
                } else {
                    refreshUnavailable = true;
                }
            } else {
                // Read the new cookies from NestJS.
                refreshedCookies = setCookieParser.parse(refreshResponse.headers.getSetCookie(), {map:false});

                const newAccessToken = refreshedCookies.find(cookie => cookie.name === ACCESS_COOKIE);
                const newRefreshToken = refreshedCookies.find(cookie => cookie.name === REFRESH_COOKIE);

                if (!newAccessToken || !newRefreshToken) {
                    refreshUnavailable = true;
                } else {
                    // Update cookies for the current request.
                    request.cookies.set(ACCESS_COOKIE, newAccessToken.value);
                    request.cookies.set(REFRESH_COOKIE, newRefreshToken.value);
                    accessToken = newAccessToken.value;
                }
            }

        } catch (error) {
            console.error("Token refresh error:", error);
            refreshUnavailable = true;
        }
    } else if (needsRefresh && !refreshToken) {
        // Access token is expired but no refresh token exists.
        invalidSession = true;
    }

    if (refreshUnavailable) {
        if (isProtectedRoute(pathname)) {
            return NextResponse.json(
                { message: "Authentication service temporarily unavailable." },
                { status: 503 }
            );
        }
        return NextResponse.next();
    }

    if (invalidSession) {
        request.cookies.delete(ACCESS_COOKIE);
        request.cookies.delete(REFRESH_COOKIE);
        accessToken = undefined;
    }

    // Redirect unauthenticated users away from protected routes.
    if (isProtectedRoute(pathname) && !accessToken) {
        const loginUrl = new URL("/login", request.url);

        loginUrl.searchParams.set("callbackUrl", pathname);

        const response = NextResponse.redirect(loginUrl);

        response.cookies.delete(ACCESS_COOKIE);
        response.cookies.delete(REFRESH_COOKIE);

        return response;
    }

    // Redirect authenticated users away from home/login/register.
    if (isAuthRoute(pathname) && accessToken) {
        const response = NextResponse.redirect(
            new URL("/dashboard", request.url)
        );

        // Preserve refreshed cookies on the redirect response.
        setRefreshedCookies(response, refreshedCookies);

        return response;
    }

    // Pass updated cookies to the current request.
    const requestHeaders = new Headers(request.headers);

    const response = NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });

    if (invalidSession) {
        response.cookies.delete(ACCESS_COOKIE);
        response.cookies.delete(REFRESH_COOKIE);
    }

    // Send updated cookies to the browser.
    setRefreshedCookies(response, refreshedCookies);

    return response;
}

function setRefreshedCookies(response: NextResponse, cookies: Cookie[]) {
    const isProduction = process.env.NODE_ENV === "production";

    for (const cookie of cookies) {
        if (cookie.name !== ACCESS_COOKIE && cookie.name !== REFRESH_COOKIE) {
            continue;
        }

        response.cookies.set({
            name: cookie.name,
            value: cookie.value,
            httpOnly: true,
            secure: isProduction,
            sameSite: "lax",
            path: "/",
            ...(cookie.maxAge !== undefined && {
                maxAge: cookie.maxAge,
            }),
            ...(cookie.expires && {
                expires: cookie.expires,
            }),
        });
    }
}

export const config = {
    matcher: [
        "/",
        "/dashboard/:path*",
        "/login",
        "/register",
        "/api/:path*",
    ],
};
