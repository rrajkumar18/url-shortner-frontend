"use client";

import { useEffect, useState } from "react";
import { Link2, Plus, MousePointerClick, Check } from "lucide-react";

import UrlTable from "@/components/dashboard/UrlTable";
import StatCard from "@/components/dashboard/StatsCard";
import CreateLinkModal from "@/components/dashboard/CreateLinkModal";
import { getDashboardStats, type DashboardStats } from "@/actions/urls";
import { useClickStream } from "@/context/ClickStreamContext";
import AnimateNumber from "@/components/animation/number";

export default function DashboardPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [isStatsLoading, setIsStatsLoading] = useState(true);

    const { latestClick } = useClickStream();

    // Update total clicks when a new click event arrives
    useEffect(() => {
        if (!latestClick) return;

        setStats((prev) => {
            if (!prev) return prev;

            return {
                ...prev,
                totalClicks: prev.totalClicks + 1,
            };
        });
    }, [latestClick]);

    // Fetch dashboard statistics
    useEffect(() => {
        let active = true;

        getDashboardStats().then((result) => {
            if (!active) return;

            if (result.success) {
                setStats(result.data);
            }

            setIsStatsLoading(false);
        });

        return () => {
            active = false;
        };
    }, [refreshKey]);

    const formatValue = (value?: number) => {
        if (isStatsLoading) return "...";
        return (value ?? 0).toLocaleString();
    };

    return (
        <main className="min-h-screen bg-slate-50 text-slate-900">
            <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">

                {/* Dashboard Heading */}
                <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Dashboard
                        </h1>

                        <p className="mt-1 text-sm text-slate-500">
                            Manage and track all your shortened URLs.
                        </p>
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                    >
                        <Plus size={18} />
                        Create new Link
                    </button>
                </div>

                {/* Dashboard Statistics */}
                <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

                    <StatCard
                        title="Total links"                        
                        value={<AnimateNumber value={stats?.totalLinks ?? 0}/>}
                        description="Total shortened URLs"
                        icon={<Link2 size={20} />}
                        iconStyle="bg-indigo-50 text-indigo-600"
                    />

                    <StatCard
                        title="Total clicks"
                        value={<AnimateNumber value={stats?.totalClicks ?? 0}/>}
                        description="Across all your links"
                        icon={<MousePointerClick size={20} />}
                        iconStyle="bg-emerald-50 text-emerald-600"
                    />

                    <StatCard
                        title="Active links"
                        value={<AnimateNumber value={stats?.totalLinks ?? 0}/>}
                        description="Currently active URLs"
                        icon={<Check size={20} />}
                        iconStyle="bg-amber-50 text-amber-600"
                    />

                </div>

                {/* URL Table */}
                <UrlTable refreshKey={refreshKey} />

            </div>

            {/* Create Link Modal */}
            <CreateLinkModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onCreated={() => setRefreshKey((prev) => prev + 1)}
            />
        </main>
    );
}