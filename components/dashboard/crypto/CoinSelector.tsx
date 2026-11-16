"use client";

type Coin = {
    symbol: string;
    name: string;
};

type CoinSelectorProps = {
    coins: Coin[];
    selectedSymbol: string;
    onSelect: (symbol: string) => void;
};

export default function CoinSelector({
    coins,
    selectedSymbol,
    onSelect,
}: CoinSelectorProps) {
    return (
        <div className="flex flex-wrap gap-2">
            {coins.map((coin) => {
                const isSelected = coin.symbol === selectedSymbol;

                return (
                    <button
                        key={coin.symbol}
                        type="button"
                        onClick={() => onSelect(coin.symbol)}
                        aria-pressed={isSelected}
                        className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
                            isSelected
                                ? "border-indigo-600 bg-indigo-600 text-white shadow-sm"
                                : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:text-indigo-600"
                        }`}
                    >
                        <span>{coin.name}</span>
                        <span className="ml-2 text-xs opacity-75">
                            {coin.symbol}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}