"use client";

import { useState } from "react";
import Link from "next/link";
import {Link2, BarChart3, Plus, MousePointerClick, Check} from "lucide-react";

import Header from "@/components/dashboard/DashboardHeader";
import UrlTable from "@/components/dashboard/UrlTable";

export default function DashboardPage() {
    const [activeTab, setActiveTab] = useState<"dashboard" | "analytics">("dashboard");

    return (
        <main className="min-h-screen bg-slate-50 text-slate-900">
            <Header activeTab={activeTab} setActiveTab={setActiveTab}/>
            <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">

                {activeTab === "dashboard" ? (
                <>
                    <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                        Dashboard
                        </h1>

                        <p className="mt-1 text-sm text-slate-500">
                        Manage and track all your shortened URLs.
                        </p>
                    </div>

                    <Link
                        href="/"
                        className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                    >
                        <Plus size={18} />
                        Create new link
                    </Link>
                    </div>

                    {/* Dashboard statistics */}
                    <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

                    <StatCard
                        title="Total links"
                        value="12"
                        description="Total shortened URLs"
                        icon={<Link2 size={20} />}
                        iconStyle="bg-indigo-50 text-indigo-600"
                    />

                    <StatCard
                        title="Total clicks"
                        value="3,011"
                        description="Across all your links"
                        icon={<MousePointerClick size={20} />}
                        iconStyle="bg-emerald-50 text-emerald-600"
                    />

                    <StatCard
                        title="Active links"
                        value="10"
                        description="Currently active URLs"
                        icon={<Check size={20} />}
                        iconStyle="bg-amber-50 text-amber-600"
                    />

                    </div>

                    {/* URL Table */}
                    <UrlTable />

                </>
                ) : (
                <section className="flex min-h-[450px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 text-center">

                    <div className="mb-4 rounded-2xl bg-indigo-50 p-4 text-indigo-600">
                    <BarChart3 size={32} />
                    </div>

                    <h2 className="text-xl font-bold">
                    Analytics coming soon
                    </h2>

                    <p className="mt-2 max-w-sm text-sm text-slate-500">
                    Detailed click statistics, traffic sources, locations,
                    devices, and more will be available here.
                    </p>

                    <button
                    onClick={() => setActiveTab("dashboard")}
                    className="mt-6 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
                    >
                    Back to Dashboard
                    </button>

                </section>
                )}

            </div>
        </main>
    );
}

type StatCardProps = {
    title: string;
    value: string;
    description: string;
    icon: React.ReactNode;
    iconStyle: string;
};

function StatCard({title, value, description, icon, iconStyle}: StatCardProps) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">
                    {title}
                </p>
                <div className={`rounded-xl p-2.5 ${iconStyle}`}>
                    {icon}
                </div>
            </div>

            <p className="mt-4 text-3xl font-bold">
                {value}
            </p>

            <p className="mt-1 text-xs text-slate-400">
                {description}
            </p>

        </div>
    );
}