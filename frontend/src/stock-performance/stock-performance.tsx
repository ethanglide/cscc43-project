import { useParams } from "react-router";
import StocksApi, { StockHistoryResponse } from "../api/stocks-api";
import { useEffect, useState } from "react";
import StockGraph from "./stock-graph";

enum TimeInterval {
  DAY = "Past Day",
  WEEK = "Past Week",
  MONTH = "Past Month",
  YEAR = "Past Year",
  YTD = "Year to Date",
  ALL = "All Time",
}

export default function StockPerformance() {
  const { stock } = useParams();
  const [stockHistory, setStockHistory] = useState<StockHistoryResponse[]>([]);
  const [timeInterval, setTimeInterval] = useState<TimeInterval>(
    TimeInterval.ALL,
  );
  const [endDate, setEndDate] = useState<string>(
    new Date().toISOString().substring(0, 10),
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [showOpen, setShowOpen] = useState<boolean>(false);
  const [showClose, setShowClose] = useState<boolean>(true);
  const [showLow, setShowLow] = useState<boolean>(false);
  const [showHigh, setShowHigh] = useState<boolean>(false);
  const [showVolume, setShowVolume] = useState<boolean>(true);

  async function fetchStockHistory() {
    setLoading(true);

    const startDate = (() => {
      const date = new Date(endDate);
      switch (timeInterval) {
        case TimeInterval.DAY:
          date.setDate(date.getDate() - 1);
          break;
        case TimeInterval.WEEK:
          date.setDate(date.getDate() - 7);
          break;
        case TimeInterval.MONTH:
          date.setMonth(date.getMonth() - 1);
          break;
        case TimeInterval.YEAR:
          date.setFullYear(date.getFullYear() - 1);
          break;
        case TimeInterval.YTD:
          date.setFullYear(date.getFullYear(), 0, 0);
          break;
        case TimeInterval.ALL:
          return "1970-01-01"; // Start from Unix epoch
      }
      return date.toISOString().substring(0, 10);
    })();

    const response = await StocksApi.getStockHistory(
      stock as string,
      startDate,
      endDate,
    );

    setLoading(false);

    if ("error" in response) {
      console.error("Error fetching stock history:", response);
      return;
    }

    // Set the end date to the last date in the response
    response.length > 0 && setEndDate(response[response.length - 1].timestamp);

    setStockHistory(response);
  }

  useEffect(() => {
    fetchStockHistory();
  }, [stock, timeInterval]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2 items-center">
          <h2 className="text-3xl font-bold">{stock}</h2>
          <p className="text-xl">Performance</p>
        </div>
        <select
          className="select w-48"
          value={timeInterval}
          onChange={(e) => setTimeInterval(e.target.value as TimeInterval)}
        >
          {Object.values(TimeInterval).map((interval) => (
            <option key={interval} value={interval}>
              {interval}
            </option>
          ))}
        </select>
      </div>
      <div className="flex justify-around items-center">
        <fieldset className="fieldset">
          <label className="fieldset-label">
            <input
              type="checkbox"
              checked={showOpen}
              onChange={(e) => setShowOpen(e.target.checked)}
              className="checkbox checkbox-info"
            />
            Open
          </label>
        </fieldset>
        <fieldset className="fieldset">
          <label className="fieldset-label">
            <input
              type="checkbox"
              checked={showClose}
              onChange={(e) => setShowClose(e.target.checked)}
              className="checkbox checkbox-warning"
            />
            Close
          </label>
        </fieldset>
        <fieldset className="fieldset">
          <label className="fieldset-label">
            <input
              type="checkbox"
              checked={showLow}
              onChange={(e) => setShowLow(e.target.checked)}
              className="checkbox checkbox-error"
            />
            Low
          </label>
        </fieldset>
        <fieldset className="fieldset">
          <label className="fieldset-label">
            <input
              type="checkbox"
              checked={showHigh}
              onChange={(e) => setShowHigh(e.target.checked)}
              className="checkbox checkbox-success"
            />
            High
          </label>
        </fieldset>
        <fieldset className="fieldset">
          <label className="fieldset-label">
            <input
              type="checkbox"
              checked={showVolume}
              onChange={(e) => setShowVolume(e.target.checked)}
              className="checkbox"
            />
            Volume
          </label>
        </fieldset>
      </div>
      {loading ? (
        <span className="loading loading-xl loading-spinner"></span>
      ) : (
        <StockGraph
          history={stockHistory}
          showOpen={showOpen}
          showClose={showClose}
          showLow={showLow}
          showHigh={showHigh}
          showVolume={showVolume}
        />
      )}
    </div>
  );
}
