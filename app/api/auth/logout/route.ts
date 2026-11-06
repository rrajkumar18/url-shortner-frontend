import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/api";
import { clearAuthCookies } from "@/lib/auth";

export async function POST() {
    try {
        const response = await backendFetch("/auth/logout", {
            method: "POST",
        });

        if (!response.ok) {
            console.error(
                "NestJS logout failed:",
                response.status
            );

            // Clear local cookies even if backend logout fails.
            await clearAuthCookies();

            return NextResponse.json(
                {
                    success: false,
                    message: "Local session cleared, but backend logout failed.",
                },
                { status: 502 }
            );
        }

        await clearAuthCookies();

        return NextResponse.json({
            success: true,
            message: "Logged out successfully.",
        });

    } catch (error) {
        console.error("Logout error:", error);

        // Clear local cookies even if NestJS is unavailable.
        await clearAuthCookies();

        return NextResponse.json(
            {
                success: false,
                message: "Local session cleared, but logout could not be confirmed.",
            },
            { status: 502 }
        );
    }
}