import React, { useState } from 'react';

interface DiscountCalculatorProps {
  originalPrice: number;
  onPriceCalculated?: (newPrice: number) => void;
}

export default function DiscountCalculator({ originalPrice, onPriceCalculated }: DiscountCalculatorProps) {
  const [discountPercent, setDiscountPercent] = useState(0);

  const discountedPrice = originalPrice - (originalPrice * (discountPercent / 100));

  return (
    <div className="flex flex-col gap-2 mt-2 p-2 bg-background/50 border border-border rounded-lg">
      <div className="flex items-center gap-4">
        <label className="text-xs uppercase text-muted-foreground font-bold">Discount (%)</label>
        <input 
            type="number" 
            value={discountPercent} 
            onChange={e => setDiscountPercent(Number(e.target.value))} 
            className="bg-background border border-border px-2 py-1 rounded w-20" 
        />
      </div>
      <div className="text-sm font-bold text-primary">
        Calculated Price: {discountedPrice.toFixed(2)}
        {onPriceCalculated && (
            <button onClick={() => onPriceCalculated(discountedPrice)} className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-1 rounded hover:brightness-110">Apply</button>
        )}
      </div>
    </div>
  );
}
