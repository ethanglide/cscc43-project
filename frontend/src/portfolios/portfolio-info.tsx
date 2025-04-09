import { PortfoliosResponse } from "../api/stock-lists-api";
import StockListCorrelations from "../stock-lists/stock-list-correlations";
import StockListStocks from "../stock-lists/stock-list-stocks";
import PortfolioCash from "./portfolio-cash";

export default function PortfolioInfo({
  portfolios,
  setPortfolios,
  selectedIndex,
  refresh,
  triggerRefresh,
}: {
  portfolios: PortfoliosResponse[];
  setPortfolios: (portfolios: PortfoliosResponse[]) => void;
  selectedIndex: number;
  refresh: boolean;
  triggerRefresh: () => void;
}) {
  const portfolio = portfolios[selectedIndex];

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-xl font-bold">Cash</h3>
      <PortfolioCash
        portfolios={portfolios}
        setPortfolios={setPortfolios}
        selectedIndex={selectedIndex}
      />
      <h3 className="text-xl font-bold">Stocks</h3>
      <StockListStocks
        username={portfolio.username}
        listName={portfolio.list_name}
        triggerRefresh={triggerRefresh}
      />
      <h3 className="text-xl font-bold">Correlation Matrix</h3>
      <StockListCorrelations
        username={portfolio.username}
        listName={portfolio.list_name}
        refresh={refresh}
      />
    </div>
  );
}
