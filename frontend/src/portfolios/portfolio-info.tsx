import { PortfoliosResponse } from "../api/stock-lists-api";
import StockListStocks from "../stock-lists/stock-list-stocks";

export default function PortfolioInfo({
  portfolio,
}: {
  portfolio: PortfoliosResponse;
}) {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-xl font-bold">Cash</h3>
      <p>${portfolio.cash}</p>
      <h3 className="text-xl font-bold">Stocks</h3>
      <StockListStocks
        username={portfolio.username}
        listName={portfolio.list_name}
      />
    </div>
  );
}
