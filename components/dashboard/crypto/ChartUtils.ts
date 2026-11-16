import type { CandlestickData, UTCTimestamp } from "lightweight-charts";
import type { MarketTrade } from "@/context/MarketStreamContext";

export type CandleInterval = "1m" | "5m" | "15m" | "1h";

const intervalSeconds: Record<CandleInterval, number> = {
    "1m": 60,
    "5m": 300,
    "15m": 900,
    "1h": 3600,
};

export function aggregateTradesToCandles(
    trades: MarketTrade[],
    selectedSymbol: string,
    interval: CandleInterval
): CandlestickData<UTCTimestamp>[] {

    const intervalSize = intervalSeconds[interval];

    const filteredTrades = trades
        .filter((trade) => trade.symbol === selectedSymbol)
        .filter((trade) => {
            return (
                Number.isFinite(new Date(trade.eventTime).getTime()) &&
                Number.isFinite(Number(trade.price))
            );
        })
        .sort(
            (a, b) =>
                new Date(a.eventTime).getTime() -
                new Date(b.eventTime).getTime()
        );

    const candles = new Map<number, CandlestickData<UTCTimestamp>>();

    const processedTradeIds = new Set<number>();

    for (const trade of filteredTrades) {
        // Avoid processing duplicate exchange trade IDs.
        if (processedTradeIds.has(trade.tradeId)) {
            continue;
        }

        processedTradeIds.add(trade.tradeId);

        const timestamp = Math.floor(
            new Date(trade.eventTime).getTime() / 1000
        );

        const candleTime =
            Math.floor(timestamp / intervalSize) * intervalSize;

        const price = Number(trade.price);

        const existingCandle = candles.get(candleTime);

        if (!existingCandle) {
            candles.set(candleTime, {
                time: candleTime as UTCTimestamp,
                open: price,
                high: price,
                low: price,
                close: price,
            });
        } else {
            existingCandle.high = Math.max(existingCandle.high, price);
            existingCandle.low = Math.min(existingCandle.low, price);
            existingCandle.close = price;
        }
    }

    return Array.from(candles.values());
}