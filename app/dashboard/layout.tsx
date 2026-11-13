import { Suspense } from "react";
import DashboardAuth from "./DashboardAuth";
import { ClickStreamProvider } from "@/context/ClickStreamContext";

export default function DashboardLayout({children}: {children: React.ReactNode;}) {
    return (
        <Suspense fallback={<div>Loading dashboard...</div>}>
            <DashboardAuth>
                <ClickStreamProvider>
                    {children}
                </ClickStreamProvider>
            </DashboardAuth>
        </Suspense>
    );
}