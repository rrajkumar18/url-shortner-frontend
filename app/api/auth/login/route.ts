import { NextResponse } from "next/server";
// import { cookies } from "next/headers";

export async function POST(request: Request) {
    try {
        const {email, password} = await request.json();
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    password,
                }),
                cache: "no-store"
            }
        );
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            return NextResponse.json(
                { message: data.message || data.error || "Login failed." },
                { status: response.status }
            );
        }

        const accessToken = data.accessToken;

        if (!accessToken) {
            return NextResponse.json(
                { message: "The backend did not return an access token." },
                { status: 502 }
            );
        }

        const resp = NextResponse.json({
            message: data.message || "Login successful.",
        });

        resp.cookies.set("access_token", accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            path: "/",
            maxAge: 15*60
        });

        const setCookie = response.headers.get("refresh_token");
        if (setCookie) {
            resp.headers.append("refresh_token", setCookie);
        }

        return resp;

        // const cookieStore = await cookies();
        // cookieStore.set("access_token", accessToken, {
        //     httpOnly: true,
        //     secure: process.env.NODE_ENV === "production",
        //     sameSite: "lax",
        //     path: "/",
        //     maxAge: 15 * 60,
        // });

        // return NextResponse.json({
        //     message: data.message || "Login successful.",
        // });

    } catch (error) {
        console.log(error);
        return NextResponse.json(
            { message: "Unable to connect to the backend." },
            { status: 500 }
        );
    }
}