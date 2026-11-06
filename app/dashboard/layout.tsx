import { Suspense } from "react";
import DashboardAuth from "./DashboardAuth";

export default function DashboardLayout({children}: {children: React.ReactNode;}) {
    return (
        <Suspense fallback={<div>Loading dashboard...</div>}>
            <DashboardAuth>
                {children}
            </DashboardAuth>
        </Suspense>
    );
}