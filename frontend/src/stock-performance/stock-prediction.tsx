import { useEffect, useState } from "react";
import StocksApi, { StockPredictionResponse } from "../api/stocks-api";
import { FiRefreshCw } from "react-icons/fi";
import StockGraph from "./stock-graph";

enum IntervalUnit {
  DAY = "day",
  MONTH = "month",
  YEAR = "year",
}

export default function StockPrediction({ stock }: { stock: string }) {
  const [predictions, setPredictions] = useState<StockPredictionResponse[]>([]);
  const [intervalCount, setIntervalCount] = useState<number>(10);
  const [intervalUnit, setIntervalUnit] = useState<IntervalUnit>(
    IntervalUnit.DAY,
  );
  const [currentIntervalCount, setCurrentIntervalCount] =
    useState<number>(intervalCount);
  const [currentIntervalUnit, setCurrentIntervalUnit] =
    useState<IntervalUnit>(intervalUnit);

  async function getStockPredictions() {
    const response = await StocksApi.getStockPredictions(
      stock,
      intervalCount,
      intervalUnit,
    );
    if ("error" in response) {
      console.log(response.error);
      return;
    }
    setPredictions(response);
  }

  function updateStockPredictions() {
    currentIntervalCount !== intervalCount &&
      setCurrentIntervalCount(intervalCount);
    currentIntervalUnit !== intervalUnit &&
      setCurrentIntervalUnit(intervalUnit);
    getStockPredictions();
  }

  useEffect(() => {
    getStockPredictions();
  }, [stock]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <div className="flex gap-4">
          <input
            type="number"
            className="input w-24"
            value={intervalCount}
            onChange={(e) => setIntervalCount(Number(e.target.value))}
            min={1}
          />
          <select
            className="select w-32"
            value={intervalUnit}
            onChange={(e) => setIntervalUnit(e.target.value as IntervalUnit)}
          >
            <option value={IntervalUnit.DAY}>Days</option>
            <option value={IntervalUnit.MONTH}>Months</option>
            <option value={IntervalUnit.YEAR}>Years</option>
          </select>
          <button
            onClick={updateStockPredictions}
            className="btn btn-primary btn-circle"
            disabled={
              currentIntervalCount === intervalCount &&
              currentIntervalUnit === intervalUnit
            }
          >
            <FiRefreshCw />
          </button>
        </div>
      </div>
      <StockGraph
        history={predictions.map((prediction) => ({
          symbol: prediction.symbol,
          timestamp: prediction.date,
          open: 0,
          high: 0,
          low: 0,
          close: prediction.predicted_price,
          volume: 0,
        }))}
        showClose={true}
        showOpen={false}
        showHigh={false}
        showLow={false}
        showVolume={false}
      />
    </div>
  );
}
