import { MarketStreamProvider } from "@/context/MarketStreamContext";
import CryptoMarketDashboard from "@/components/dashboard/crypto/CryptoMarketDashboard";

export default function CryptoPage() {
    return (
        <MarketStreamProvider>
            <CryptoMarketDashboard />
        </MarketStreamProvider>
    );
}