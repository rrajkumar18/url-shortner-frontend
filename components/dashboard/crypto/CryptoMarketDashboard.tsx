"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, Wifi, WifiOff, BriefcaseBusiness, Play, Square } from "lucide-react";

import { useMarketStream } from "@/context/MarketStreamContext";
import { startMarketCollection, stopMarketCollection } from "@/actions/crypto";
import RecentTradesTable from "./RecentTradeTables";
import CoinSelector from "./CoinSelector";
import LivePriceChart from "./LivePriceChart";

export default function CryptoMarketDashboard() {
    const { trades, symbols, connected, collectorStatus } = useMarketStream();
    const [selectedSymbol, setSelectedSymbol] = useState("");
    const [actionPending, setActionPending] = useState(false);
    const [actionError, setActionError] = useState("");

    const handleStart = async () => {
        setActionPending(true);
        setActionError("");

        try {
            const result = await startMarketCollection();
            if (!result.success) {
                setActionError(result.error);
            }
        } catch {
            setActionError("Failed to start collection.");
        } finally {
            setActionPending(false);
        }
    };

    const handleStop = async () => {
        setActionPending(true);
        setActionError("");
        try {
            const result = await stopMarketCollection();

            if (!result.success) {
                setActionError(result.error);
            }
        } catch {
            setActionError("Failed to stop collection.");
        } finally {
            setActionPending(false);
        }
    };

    // Automatically select the first discovered symbol
    useEffect(() => {
        if (!selectedSymbol && symbols.length > 0) {
            setSelectedSymbol(symbols[0]);
        }
    }, [symbols, selectedSymbol]);

    // Find the latest trade for the selected symbol
    const latestTrade = useMemo(() => {
        return [...trades]
            .reverse()
            .find((trade) => trade.symbol === selectedSymbol);
    }, [trades, selectedSymbol]);

    const formatPrice = (price: string) => {
        const value = Number(price);

        if (!Number.isFinite(value)) return price;

        return value.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 8,
        });
    };

    return (
        <main className="min-h-screen bg-slate-50 text-slate-900">
            <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">

                {/* Heading */}
                <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Crypto Fun
                        </h1>

                        <p className="mt-1 text-sm text-slate-500">
                            Explore live cryptocurrency market activity.
                        </p>
                    </div>

                    {/* Connection and Collector Status */}
                    <div className="flex flex-wrap items-center gap-3">
                        {/* SSE Connection */}
                        <div
                            className={`flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium ${
                                connected
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-red-50 text-red-600"
                            }`}
                        >
                            {connected ? <Wifi size={16} /> : <WifiOff size={16} />}

                            {connected ? "Live Stream Connected" : "Stream Disconnected"}
                        </div>

                        {/* Collector Job Status */}
                        <div
                            className={`flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium ${
                                collectorStatus.collectorStatus === "RUNNING"
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-slate-100 text-slate-600"
                            }`}
                        >
                            <BriefcaseBusiness size={16} />

                            {collectorStatus.collectorStatus === "RUNNING"
                                ? `${collectorStatus.sessionMode} Job Running`
                                : "Job Idle"}
                        </div>

                        {/* Start / Stop Button */}
                        {collectorStatus.collectorStatus === "IDLE" ? (
                            <button
                                onClick={handleStart}
                                disabled={actionPending || !connected}
                                className="flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <Play size={15} />
                                {actionPending ? "Starting..." : "Start"}
                            </button>
                        ) : (
                            <button
                                onClick={handleStop}
                                disabled={actionPending}
                                className="flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <Square size={14} />
                                {actionPending ? "Stopping..." : "Stop"}
                            </button>
                        )}
                        {actionError && (
                            <p className="mt-2 text-right text-sm text-red-600">
                                {actionError}
                            </p>
                        )}
                    </div>
                </div>

                {/* Coin Selector */}
                <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5">
                    <h2 className="mb-4 text-sm font-semibold text-slate-700">
                        Available trading pairs
                    </h2>

                    {symbols.length > 0 ? (
                        <CoinSelector
                            coins={symbols.map((symbol) => ({
                                symbol,
                                name: symbol,
                            }))}
                            selectedSymbol={selectedSymbol}
                            onSelect={setSelectedSymbol}
                        />
                    ) : (
                        <p className="text-sm text-slate-500">
                            Waiting for cryptocurrency market data...
                        </p>
                    )}
                </section>

                {/* Selected Coin Overview */}
                <section className="rounded-2xl border border-slate-200 bg-white p-6">
                    {latestTrade ? (
                        <>
                            <div className="mb-5 flex items-center gap-2">
                                <Activity size={20} className="text-indigo-600" />

                                <h2 className="font-semibold">
                                    {selectedSymbol}
                                </h2>
                            </div>

                            <p className="text-sm text-slate-500">
                                Latest price
                            </p>

                            <p className="mt-2 text-3xl font-bold tracking-tight">
                                ${formatPrice(latestTrade.price)}
                            </p>

                            <div className="mt-6 grid gap-4 sm:grid-cols-3">
                                <div>
                                    <p className="text-xs text-slate-500">
                                        Trade Quantity
                                    </p>
                                    <p className="mt-1 font-semibold">
                                        {latestTrade.quantity}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-slate-500">
                                        Trade ID
                                    </p>
                                    <p className="mt-1 font-semibold">
                                        {latestTrade.tradeId}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-slate-500">
                                        Event Time
                                    </p>
                                    <p className="mt-1 text-sm font-semibold">
                                        {new Date(
                                            latestTrade.eventTime
                                        ).toLocaleTimeString()}
                                    </p>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex min-h-48 flex-col items-center justify-center text-center">
                            <Activity
                                size={32}
                                className="mb-3 text-slate-300"
                            />

                            <h2 className="font-semibold">
                                Waiting for trade data
                            </h2>

                            <p className="mt-2 text-sm text-slate-500">
                                The latest trade will appear here when data
                                arrives for the selected trading pair.
                            </p>
                        </div>
                    )}
                </section>

                {/* Chart */}
                <LivePriceChart trades={trades} selectedSymbol={selectedSymbol}/>

                {/* Trades Table  */}
                <RecentTradesTable trades={trades} selectedSymbol={selectedSymbol}/>

            </div>
        </main>
    );
}