import { Suspense } from "react";
import DashboardAuth from "./DashboardAuth";
import { ClickStreamProvider } from "@/context/ClickStreamContext";
import Header from "@/components/dashboard/DashboardHeader";

export default function DashboardLayout({children}: {children: React.ReactNode;}) {
    return (
        <Suspense fallback={<div>Loading dashboard...</div>}>
            <DashboardAuth>
                <ClickStreamProvider>
                    <Header/>
                    {children}
                </ClickStreamProvider>
            </DashboardAuth>
        </Suspense>
    );
}