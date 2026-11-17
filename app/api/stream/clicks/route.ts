import { cookies } from 'next/headers';

export async function GET() {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;
    if (!accessToken) {
        return new Response('Unauthorized', { status: 401 });
    }
    const backendUrl = process.env.BACKEND_URL;
    if (!backendUrl) {
        return new Response('Backend URL not configured', {
            status: 500,
        });
    }

    try {
        console.log('[SSE Proxy] Connecting to:', `${backendUrl}/urls/stats/clicks`);
        const backendResponse = await fetch(
            `${backendUrl}/urls/stats/clicks`,
            {
                method: 'GET',
                headers: {
                    Cookie: `access_token=${accessToken}`,
                    Accept: 'text/event-stream',
                },
                cache: 'no-store',
                // signal: AbortSignal.timeout(0),
            },
        );

        console.log('[SSE Proxy] Backend status:', backendResponse.status);
        console.log('[SSE Proxy] Content-Type:', backendResponse.headers.get('content-type'));

        if (!backendResponse.ok || !backendResponse.body) {
            return new Response('SSE connection failed', {
                status: backendResponse.status,
            });
        }

        return new Response(backendResponse.body, {
            status: 200,
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache, no-transform',
                'Connection': 'keep-alive',
                'X-Accel-Buffering': 'no',
            },
        });
    } catch (error) {
        console.error('[SSE Proxy] Error:', error);
        return new Response('SSE connection failed', {
            status: 502,
        });
    }
}
