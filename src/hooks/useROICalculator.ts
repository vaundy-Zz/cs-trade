import { useState, useMemo } from 'react';
import type { ROICalculation } from '../types/skin';

interface UseROICalculatorParams {
  currentPrice: number;
}

interface UseROICalculatorResult {
  calculation: ROICalculation | null;
  purchasePrice: number;
  setPurchasePrice: (price: number) => void;
  purchaseDate: string;
  setPurchaseDate: (date: string) => void;
  calculate: () => void;
  reset: () => void;
}

export const useROICalculator = ({
  currentPrice,
}: UseROICalculatorParams): UseROICalculatorResult => {
  const [purchasePrice, setPurchasePrice] = useState<number>(0);
  const [purchaseDate, setPurchaseDate] = useState<string>('');
  const [calculation, setCalculation] = useState<ROICalculation | null>(null);

  const calculate = () => {
    if (purchasePrice <= 0 || !purchaseDate) {
      return;
    }

    const profit = currentPrice - purchasePrice;
    const roi = (profit / purchasePrice) * 100;
    const holdingDays = Math.floor(
      (new Date().getTime() - new Date(purchaseDate).getTime()) / (1000 * 60 * 60 * 24)
    );

    setCalculation({
      purchasePrice,
      currentPrice,
      profit,
      roi,
      holdingDays,
    });
  };

  const reset = () => {
    setPurchasePrice(0);
    setPurchaseDate('');
    setCalculation(null);
  };

  return {
    calculation,
    purchasePrice,
    setPurchasePrice,
    purchaseDate,
    setPurchaseDate,
    calculate,
    reset,
  };
};
