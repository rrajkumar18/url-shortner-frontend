"use client";

import { useEffect, useRef, useState } from "react";
import { getHistoricalCandles, type HistoricalCandle } from "@/services/market.service";

import {
    createChart,
    ColorType,
    LineSeries,
    CandlestickSeries,
    type IChartApi,
    type ISeriesApi,
    type Time,
} from "lightweight-charts";

import type { MarketTrade } from "@/context/MarketStreamContext";
import { type CandleInterval } from "./ChartUtils";

type ChartType = "line" | "candlestick";

type LivePriceChartProps = {
    trades: MarketTrade[];
    selectedSymbol: string;
};

const intervals: CandleInterval[] = ["1m", "5m", "15m", "1h"];

function getCandleStartTime(
    eventTime: string,
    interval: CandleInterval
): number {
    const intervalSeconds: Record<CandleInterval, number> = {
        "1m": 60,
        "5m": 300,
        "15m": 900,
        "1h": 3600,
    };

    const eventTimestamp = Math.floor(
        new Date(eventTime).getTime() / 1000
    );

    const duration = intervalSeconds[interval];

    return Math.floor(eventTimestamp / duration) * duration;
}

export default function LivePriceChart({trades, selectedSymbol}: LivePriceChartProps) {

    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);

    // Track trades already processed by the chart
    const processedTradesRef = useRef<Set<string>>(new Set());
    // Indicates whether we've initialized live updates after loading history
    const hasInitializedLiveTradesRef = useRef(false);

    const seriesRef = useRef<
        | ISeriesApi<"Line">
        | ISeriesApi<"Candlestick">
        | null
    >(null);

    const [chartType, setChartType] = useState<ChartType>("line");
    const [interval, setInterval] = useState<CandleInterval>("1m");

    const [historicalCandles, setHistoricalCandles] = useState<HistoricalCandle[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Create chart
    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart = createChart(chartContainerRef.current, {
            width: chartContainerRef.current.clientWidth,
            height: 400,

            layout: {
                background: {
                    type: ColorType.Solid,
                    color: "#ffffff",
                },
                textColor: "#64748b",
            },

            grid: {
                vertLines: {
                    color: "#f1f5f9",
                },
                horzLines: {
                    color: "#f1f5f9",
                },
            },

            rightPriceScale: {
                borderColor: "#e2e8f0",
            },

            timeScale: {
                borderColor: "#e2e8f0",
                timeVisible: true,
                secondsVisible: chartType === "line",
            },
        });

        chartRef.current = chart;

        const resizeObserver = new ResizeObserver((entries) => {
            const { width } = entries[0].contentRect;

            chart.applyOptions({
                width: Math.floor(width),
            });
        });

        resizeObserver.observe(chartContainerRef.current);

        return () => {
            resizeObserver.disconnect();
            chart.remove();

            chartRef.current = null;
            seriesRef.current = null;
        };
    }, []);

    // Create or replace series when chart type changes
    useEffect(() => {
        const chart = chartRef.current;

        if (!chart) return;

        if (seriesRef.current) {
            chart.removeSeries(seriesRef.current);
            seriesRef.current = null;
        }

        if (chartType === "line") {
            seriesRef.current = chart.addSeries(LineSeries, {
                color: "#4f46e5",
                lineWidth: 2,
            });
        } else {
            seriesRef.current = chart.addSeries(CandlestickSeries, {
                upColor: "#16a34a",
                downColor: "#dc2626",
                borderVisible: false,
                wickUpColor: "#16a34a",
                wickDownColor: "#dc2626",
            });
        }

        chart.timeScale().applyOptions({
            secondsVisible: chartType === "line",
        });
    }, [chartType]);

    // Update chart data using historical candles
    useEffect(() => {
        const series = seriesRef.current;

        if (!series) return;

        if (series.seriesType() === "Line") {
            const lineData = historicalCandles.map((candle) => ({
                time: candle.time as Time,
                value: candle.close,
            }));

            series.setData(lineData);
        } else if (series.seriesType() === "Candlestick") {
            const candleData = historicalCandles.map((candle) => ({
                time: candle.time as Time,
                open: candle.open,
                high: candle.high,
                low: candle.low,
                close: candle.close,
            }));

            series.setData(candleData);
        }

        chartRef.current?.timeScale().fitContent();

    }, [historicalCandles, chartType]);

    // Update chart using historical data
    useEffect(() => {
        if (!selectedSymbol) return;

        let cancelled = false;

        async function loadHistoricalCandles() {
            try {
                setLoading(true);
                setError(null);

                const candles = await getHistoricalCandles(
                    selectedSymbol,
                    interval,
                    500
                );

                if (!cancelled) {
                    setHistoricalCandles(candles);
                }
            } catch (err) {
                console.error("Historical candle fetch failed:", err);

                if (!cancelled) {
                    setError("Unable to load historical market data");
                    setHistoricalCandles([]);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadHistoricalCandles();

        return () => {
            cancelled = true;
        };
    }, [selectedSymbol, interval]);

    // Process incoming live trades
    useEffect(() => {
        if (!selectedSymbol || !seriesRef.current) return;

        const relevantTrades = trades.filter(
            (trade) => trade.symbol === selectedSymbol
        );

        // On initial load, historical API data already represents past trades.
        // Mark currently available trades as processed.
        if (!hasInitializedLiveTradesRef.current) {
            relevantTrades.forEach((trade) => {
                processedTradesRef.current.add(
                    `${trade.symbol}-${trade.tradeId}`
                );
            });

            hasInitializedLiveTradesRef.current = true;
            return;
        }

        const newTrades = relevantTrades.filter((trade) => {
            const key = `${trade.symbol}-${trade.tradeId}`;

            return !processedTradesRef.current.has(key);
        });

        for (const trade of newTrades) {
            const key = `${trade.symbol}-${trade.tradeId}`;

            processedTradesRef.current.add(key);

            const series = seriesRef.current;

            if (!series) continue;

            const price = Number(trade.price);

            if (!Number.isFinite(price)) continue;

            const eventTimestamp = Math.floor(
                new Date(trade.eventTime).getTime() / 1000
            );

            if (!Number.isFinite(eventTimestamp)) continue;

            if (series.seriesType() === "Line") {
                series.update({
                    time: eventTimestamp as Time,
                    value: price,
                });
            } else {
                const candleTime = getCandleStartTime(
                    trade.eventTime,
                    interval
                );

                const candle: HistoricalCandle = {
                    time: candleTime,
                    open: price,
                    high: price,
                    low: price,
                    close: price,
                };

                series.update({
                    time: candle.time as Time,
                    open: candle.open,
                    high: candle.high,
                    low: candle.low,
                    close: candle.close,
                });
            }
        }
    }, [trades, selectedSymbol, interval, chartType]);

    return (
        <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="flex flex-col justify-between gap-4 border-b border-slate-200 px-6 py-4 sm:flex-row sm:items-center">
                <div>
                    <h2 className="font-semibold text-slate-800">
                        Price Chart
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Live price movement for {selectedSymbol || "selected pair"}
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">

                    {/* Chart type selector */}
                    <button
                        type="button"
                        onClick={() => setChartType("line")}
                        className={`rounded-lg px-3 py-2 text-sm font-medium ${
                            chartType === "line"
                                ? "bg-indigo-600 text-white"
                                : "bg-slate-100 text-slate-600"
                        }`}
                    >
                        Line
                    </button>

                    <button
                        type="button"
                        onClick={() => setChartType("candlestick")}
                        className={`rounded-lg px-3 py-2 text-sm font-medium ${
                            chartType === "candlestick"
                                ? "bg-indigo-600 text-white"
                                : "bg-slate-100 text-slate-600"
                        }`}
                    >
                        Candlestick
                    </button>

                    {/* Time interval selector */}
                    {chartType === "candlestick" && (
                        <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
                            {intervals.map((item) => (
                                <button
                                    key={item}
                                    type="button"
                                    onClick={() => setInterval(item)}
                                    className={`rounded-md px-2 py-1 text-xs font-medium ${
                                        interval === item
                                            ? "bg-white text-indigo-600 shadow-sm"
                                            : "text-slate-600"
                                    }`}
                                >
                                    {item}
                                </button>
                            ))}
                        </div>
                    )}

                </div>
            </div>

            <div className="p-4">
                <div
                    ref={chartContainerRef}
                    className="w-full"
                />
            </div>

        </section>
    );
}