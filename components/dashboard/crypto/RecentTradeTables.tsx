"use client";

import { useMemo } from "react";
import type { MarketTrade } from "@/context/MarketStreamContext";

type RecentTradesTableProps = {
    trades: MarketTrade[];
    selectedSymbol: string;
};

export default function RecentTradesTable({
    trades,
    selectedSymbol,
}: RecentTradesTableProps) {

    const recentTrades = useMemo(() => {
        return trades
            .filter((trade) => trade.symbol === selectedSymbol)
            .slice(-10)
            .reverse();
    }, [trades, selectedSymbol]);

    const formatPrice = (price: string) => {
        return Number(price).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 8,
        });
    };

    return (
        <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-6 py-4">
                <h2 className="font-semibold text-slate-800">
                    Recent Trades
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                    Latest trades for {selectedSymbol || "selected pair"}
                </p>
            </div>

            {recentTrades.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                            <tr>
                                <th className="px-6 py-3">Time</th>
                                <th className="px-6 py-3">Price</th>
                                <th className="px-6 py-3">Quantity</th>
                                <th className="px-6 py-3">Trade ID</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            {recentTrades.map((trade, index) => (
                                <tr
                                    key={`${trade.tradeId}-${index}`}
                                    className="transition hover:bg-slate-50"
                                >
                                    <td className="whitespace-nowrap px-6 py-4 text-slate-500">
                                        {new Date(trade.eventTime).toLocaleTimeString()}
                                    </td>

                                    <td className="whitespace-nowrap px-6 py-4 font-semibold text-slate-800">
                                        ${formatPrice(trade.price)}
                                    </td>

                                    <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                                        {trade.quantity}
                                    </td>

                                    <td className="whitespace-nowrap px-6 py-4 text-slate-500">
                                        {trade.tradeId}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="p-8 text-center text-sm text-slate-500">
                    Waiting for trades...
                </div>
            )}
        </section>
    );
}