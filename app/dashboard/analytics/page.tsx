import { BarChart3 } from "lucide-react";
import Link from "next/link";

export default function AnalyticsPage() {
    return (
        <main className="min-h-screen bg-slate-50 text-slate-900">
            <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">

                {/* Analytics Heading */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold tracking-tight">
                        Analytics
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Understand how your shortened URLs are performing.
                    </p>
                </div>

                {/* Analytics Placeholder */}
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

                    <Link
                        href="/dashboard"
                        className="mt-6 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
                    >
                        Back to Dashboard
                    </Link>

                </section>
            </div>
        </main>
    );
}