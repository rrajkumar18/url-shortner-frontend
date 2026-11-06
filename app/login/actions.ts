'use server';
import { cookies } from "next/headers";
import setCookieParser from 'set-cookie-parser';

interface LoginInput {    
    email: string;
    password: string;
}

export async function loginUser(formData: LoginInput) {
    const email = formData.email.trim();
    const password = formData.password;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
        return {
            success: false,
            message: 'Please enter your email address.',
        };
    }

    if (!password) {
        return {
            success: false,
            message: 'Please enter your password.'
        };
    }
    
    if (!emailRegex.test(email)) {
        return {
            success: false,
            message: 'Please enter a valid email address.'
        };
    }    
    
    try {
        const response = await fetch(
            `${process.env.BACKEND_URL}/auth/login`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    password,
                }),
                cache: 'no-store'
            }
        );
        const data = await response.json().catch(() => ({}));
        if( !response.ok ) {
            return {
                success: false,
                message: data.message || data.error || "Login failed. Please check your credentials."
            };
        }
        
        // Read Set-Cookie headers returned by NestJS
        const setCookieHeaders = response.headers.getSetCookie();
        const parsedCookies = setCookieParser.parse(setCookieHeaders);

        const accessToken = parsedCookies.find(cookie => cookie.name === 'access_token');
        const refreshToken = parsedCookies.find(cookie => cookie.name === 'refresh_token');
        
        if (!accessToken || !refreshToken) {
            console.error('Login response did not contain both authentication cookies.');
            return {
                success: false,
                message: 'Authentication cookies were not received.',
            };
        }

        // Transfer cookies to the browser through Next.js
        const cookieStore = await cookies();
        const isProduction = process.env.NODE_ENV === 'production';

        for (const cookie of [accessToken, refreshToken]) {
            console.log('cookie',cookie);
            cookieStore.set({
                name: cookie.name,
                value: cookie.value,
                httpOnly: true,
                secure: isProduction,
                sameSite: 'lax',
                path: '/',
                ...(cookie.maxAge !== undefined && {
                    maxAge: cookie.maxAge,
                }),
                ...(cookie.expires && {
                    expires: cookie.expires,
                }),
            });
        }

        return {
            success: true,
            message: 'Login successful.',
        };

    } catch (error) {
        console.error('login error:', error);
		return {
			success: false,
			message: 'Unable to login. Please try again.',
		};
    }
}