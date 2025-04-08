import { useParams } from "react-router";
import StockHistory from "./stock-history";
import NotFound from "../not-found";
import StockPrediction from "./stock-prediction";

export default function StockPerformance() {
  const { stock } = useParams();

  const tabsName = "stock-performance-tabs";

  if (!stock) {
    return <NotFound />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 items-center">
        <h2 className="text-3xl font-bold">{stock}</h2>
        <p className="text-xl">Performance</p>
      </div>
      <div className="tabs tabs-border tabs-lg flex">
        <input
          type="radio"
          name={tabsName}
          className="tab mb-4"
          aria-label="History"
          defaultChecked
        />
        <div className="tab-content">
          <StockHistory stock={stock} />
        </div>
        <input
          type="radio"
          name={tabsName}
          className="tab mb-4"
          aria-label="Predictions"
        />
        <div className="tab-content">
          <StockPrediction stock={stock} />
        </div>
      </div>
    </div>
  );
}
