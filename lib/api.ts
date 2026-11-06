import 'server-only';
import { getAuthCookies, clearAuthCookies, saveAuthCookies } from '@/lib/auth';

// use it like this
// import { backendFetch } from '@/lib/backend';
// const response = await backendFetch('/urls');
// const urls = await response.json();
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

    const makeRequest = (cookieHeader: string) => {
        const headers = new Headers(options.headers);
        headers.set('Cookie', cookieHeader);
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
    await saveAuthCookies(refreshResponse);

    // Retry original request with the new access token
    response = await makeRequest(cookieHeader);

    return response;
}