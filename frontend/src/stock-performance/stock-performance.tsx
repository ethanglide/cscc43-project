import { useParams } from "react-router";
import StocksApi, { StockHistoryResponse } from "../api/stocks-api";
import { useEffect, useState } from "react";
import StockGraph from "./stock-graph";

export default function StockPerformance() {
  const { stock } = useParams();
  const [stockHistory, setStockHistory] = useState<StockHistoryResponse[]>([]);
  const [startDate, setStartDate] = useState<string>(new Date(0).toISOString().substring(0, 10));
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().substring(0, 10));
  const [loading, setLoading] = useState<boolean>(false);

  async function fetchStockHistory() {
    setLoading(true);

    const response = await StocksApi.getStockHistory(stock as string, startDate, endDate);

    setLoading(false);

    if ("error" in response) {
      console.error("Error fetching stock history:", response);
      return;
    }

    setStockHistory(response);
  }

  useEffect(() => {
    fetchStockHistory();
  }, [stock, startDate, endDate]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 items-center">
        <h2 className="text-3xl font-bold">{stock}</h2>
        <p className="text-xl">Performance</p>
      </div>
      <StockGraph history={stockHistory} />
    </div>
  );
}
