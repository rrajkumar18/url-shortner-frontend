import { NextRequest, NextResponse } from 'next/server';
const API_URL = process.env.BACKEND_URL!;

export async function POST(request: NextRequest) {
    const body = await request.json();

    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        cache: 'no-store',
    });

    const data = await response.json();

    const result = NextResponse.json(data, {
        status: response.status,
    });

    // Forward backend cookies to the browser,
    // but let Next.js own the cookies on its hostname.
    const cookies = response.headers.getSetCookie();

    for (const cookie of cookies) {
        result.headers.append('Set-Cookie', cookie);
    }

    return result;
}