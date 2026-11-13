import 'server-only';
import { getAuthCookies, clearAuthCookies, saveAuthCookies } from '@/lib/auth';

export async function backendFetch(endpoint: string, options: RequestInit = {}){
    const backendUrl = process.env.BACKEND_URL;

    if (!backendUrl) {
        throw new Error('BACKEND_URL is not configured.');
    }

    const { accessToken, refreshToken } = await getAuthCookies();
    const cookieHeader = [
        accessToken && `access_token=${accessToken}`,
        refreshToken && `refresh_token=${refreshToken}`,
    ].filter(Boolean).join("; ");

    const makeRequest = (cookiesToSend: string) => {
        const headers = new Headers(options.headers);
        if (cookiesToSend) {
            headers.set('Cookie', cookiesToSend);
        }
        return fetch(`${backendUrl}${endpoint}`, {
            ...options,
            headers,
            cache: 'no-store',
        });
    };

    // First attempt using current access token
    let response = await makeRequest(cookieHeader);

    if (response.status !== 401) {
        return response;
    }

    // Access token expired. Attempt refresh.
    if (!refreshToken) {
        await clearAuthCookies();
        return response;
    }

    const refreshResponse = await fetch(
        `${backendUrl}/auth/refresh`,
        {
            method: 'POST',
            headers: {
                Cookie: `refresh_token=${refreshToken}`,
            },
            cache: 'no-store',
        }
    );

    if (!refreshResponse.ok) {
        await clearAuthCookies();
        return response;
    }

    // Save newly issued authentication cookies
    const refreshed = await saveAuthCookies(refreshResponse);
    const newAccessToken = refreshed.accessToken ?? accessToken;
    const newRefreshToken = refreshed.refreshToken ?? refreshToken;
    const refreshedCookieHeader = [
        newAccessToken && `access_token=${newAccessToken}`,
        newRefreshToken && `refresh_token=${newRefreshToken}`,
    ].filter(Boolean).join("; ");

    // Retry original request with the new access token
    response = await makeRequest(refreshedCookieHeader);

    return response;
}