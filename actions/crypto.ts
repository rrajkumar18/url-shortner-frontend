'use client';

export type MarketActionResponse = {
    message: string;
    session?: {
        id: string;
        mode: "MANUAL" | "SCHEDULED";
        status: string;
        startedAt: string;
        scheduledStopAt: string;
    };
};

type MarketActionResult =
    | { success: true; data: MarketActionResponse }
    | { success: false; error: string };

export async function startMarketCollection(): Promise<MarketActionResult> {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_CRYPTO_BACKEND_URL;
        const response = await fetch(`${baseUrl}/api/market/start`, {
            method: 'POST'
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
            return {
                success: false,
                error: payload.message || `Request failed with status ${response.status}`,
            };
        }
        return {
            success: true,
            data: payload,
        };
    } catch (err) {
        return {
            success: false,
            error: err instanceof Error ? err.message : 'Failed to start market collection.',
        };
    }
}

export async function stopMarketCollection(): Promise<MarketActionResult> {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_CRYPTO_BACKEND_URL;
        const response = await fetch(`${baseUrl}/api/market/stop`, {
            method: 'POST'
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
            return {
                success: false,
                error: payload.message || `Request failed with status ${response.status}`,
            };
        }
        return {
            success: true,
            data: payload,
        };
    } catch (err) {
        return {
            success: false,
            error: err instanceof Error ? err.message : 'Failed to stop market collection.',
        };
    }
}