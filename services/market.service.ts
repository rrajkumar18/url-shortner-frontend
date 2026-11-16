import type { CandleInterval } from "@/components/dashboard/crypto/ChartUtils";

export type HistoricalCandle = {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
};

type HistoricalCandlesResponse = {
    symbol: string;
    interval: CandleInterval;
    candles: HistoricalCandle[];
};

const API_URL = process.env.NEXT_PUBLIC_CRYPTO_BACKEND_URL;

export async function getHistoricalCandles(
    symbol: string,
    interval: CandleInterval,
    limit = 500
): Promise<HistoricalCandle[]> {
    if (!API_URL) {
        throw new Error("NEXT_PUBLIC_CRYPTO_BACKEND_URL is not configured");
    }

    const params = new URLSearchParams({
        symbol,
        interval,
        limit: String(limit),
    });

    const response = await fetch(
        `${API_URL}/api/market/history?${params.toString()}`
    );

    if (!response.ok) {
        throw new Error(
            `Failed to fetch historical candles: ${response.status}`
        );
    }

    const data: HistoricalCandlesResponse = await response.json();

    return data.candles;
}