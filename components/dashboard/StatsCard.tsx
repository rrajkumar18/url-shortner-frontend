import React from "react";
import AnimateNumber from "../animation/number";

export type StatCardProps = {
    title: string;
    value: React.ReactNode;
    description: string;
    icon: React.ReactNode;
    iconStyle: string;
};

export default function StatCard({title, value, description, icon, iconStyle}: StatCardProps) {
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
