"use client";

import React, {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

export type MarketTrade = {
    symbol: string;
    price: string;
    quantity: string;
    eventTime: string;
    receivedAt: string;
    tradeId: number;
};

export type CollectorStatus = {
    collectorStatus: "RUNNING" | "IDLE";
    sessionMode?: "MANUAL" | "SCHEDULED" | null;
    sessionId?: string;
    startedAt?: string;
    stopsAt?: string;
    remainingSeconds?: number;
    lastSession?: unknown;
};

type MarketStreamContextType = {
    trades: MarketTrade[];
    symbols: string[];
    connected: boolean;
    collectorStatus: CollectorStatus;
};

const marketStreamContext = createContext<MarketStreamContextType>({
    trades: [],
    symbols: [],
    connected: false,
    collectorStatus: {
        collectorStatus: "IDLE",
        sessionMode: null,
        remainingSeconds: 0
    }
});

export function MarketStreamProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [trades, setTrades] = useState<MarketTrade[]>([]);
    const [symbols, setSymbols] = useState<string[]>([]);
    const [connected, setConnected] = useState(false);
    const [collectorStatus, setCollectorStatus] = useState<CollectorStatus>({
        collectorStatus: "IDLE",
        sessionMode: null,
        remainingSeconds: 0,
    });

    useEffect(() => {
        const baseUrl = process.env.NEXT_PUBLIC_CRYPTO_BACKEND_URL;

        if (!baseUrl) {
            console.error("Backend URL not configured for crypto watch");
            return;
        }

        const eventSource = new EventSource(
            `${baseUrl}/api/market/stream`,
            { withCredentials: true }
        );

        eventSource.addEventListener("connected", () => {
            console.log("[Market SSE] Connected");
            setConnected(true);
        });

        eventSource.addEventListener("prices", (event) => {
            try {
                const data = JSON.parse(event.data);

                if (!Array.isArray(data.prices)) {
                    return;
                }

                const incomingTrades: MarketTrade[] = data.prices;

                // Keep only the latest 500 trade events.
                setTrades((prev) =>
                    [...prev, ...incomingTrades].slice(-500)
                );

                // Discover symbols independently of the trade history.
                setSymbols((prev) => {
                    const newSymbols = incomingTrades
                        .map((trade) => trade.symbol)
                        .filter((symbol) => !prev.includes(symbol));

                    return newSymbols.length > 0
                        ? [...prev, ...newSymbols].sort()
                        : prev;
                });
            } catch (error) {
                console.error(
                    "[Market SSE] Failed to parse price event:",
                    error
                );
            }
        });

        eventSource.addEventListener("collector-status", (event) => {
            try {
                const data: CollectorStatus = JSON.parse(event.data);
                setCollectorStatus(data);
                console.log("[Market SSE] Collector status:", data);
            } catch (error) {
                console.error("[Market SSE] Failed to parse collector status:", error);
            }
        });

        eventSource.onerror = (error) => {
            console.error("[Market SSE] Connection error:", error);
            setConnected(false);
        };

        return () => {
            eventSource.close();
            setConnected(false);
        };
    }, []);

    return (
        <marketStreamContext.Provider value={{ trades, symbols, connected, collectorStatus }}>
            {children}
        </marketStreamContext.Provider>
    );
}

export function useMarketStream() {
    return useContext(marketStreamContext);
}