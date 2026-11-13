import "server-only";
import { cookies } from "next/headers";
import setCookieParser from 'set-cookie-parser';

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
};

export async function getAuthCookies() {
    const cookieStore = await cookies();
    return {
        accessToken: cookieStore.get("access_token")?.value,
        refreshToken: cookieStore.get("refresh_token")?.value
    };
}

export async function clearAuthCookies() {
    try {
        const cookieStore = await cookies();
        cookieStore.delete("access_token");
        cookieStore.delete("refresh_token");
    } catch {
        // Cookie mutations are not allowed during Server Component renders
    }
}

export async function saveAuthCookies(response: Response): Promise<{
    accessToken?: string;
    refreshToken?: string;
}> {
    const parsedCookies = setCookieParser.parse(
        response.headers.getSetCookie()
    );

    const tokens: { accessToken?: string; refreshToken?: string } = {};

    for (const cookie of parsedCookies) {
        if (cookie.name === 'access_token') tokens.accessToken = cookie.value;
        if (cookie.name === 'refresh_token') tokens.refreshToken = cookie.value;
    }

    try {
        const cookieStore = await cookies();

        for (const cookie of parsedCookies) {
            if ( cookie.name !== 'access_token' && cookie.name !== 'refresh_token' ) {
                continue;
            }

            cookieStore.set({
                name: cookie.name,
                value: cookie.value,
                ...COOKIE_OPTIONS,
                ...(cookie.maxAge !== undefined && {
                    maxAge: cookie.maxAge,
                }),
                ...(cookie.expires && {
                    expires: cookie.expires,
                }),
            });
        }
    } catch {
        // Cookie mutations are not allowed during Server Component renders
    }

    return tokens;
}