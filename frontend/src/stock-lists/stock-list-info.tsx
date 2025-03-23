import { useContext } from "react";
import { StockListsResponse, StockListType } from "../api/stock-lists-api";
import { UserContext } from "../context/user-context";
import StockListStocks from "./stock-list-stocks";
import StockListReviews from "./stock-list-reviews";

export default function StockListInfo({
  stockList,
}: {
  stockList: StockListsResponse;
}) {
  const { user } = useContext(UserContext);
  const tabsName = "stock-list-tabs";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4 items-center">
        <h2 className="text-3xl font-bold">{stockList.list_name}</h2>
        {stockList.list_type === StockListType.public && (
          <div className="badge badge-success">Public</div>
        )}
        {stockList.list_type === StockListType.private && (
          <div className="badge badge-error">Private</div>
        )}
      </div>
      <div className="flex gap-4 items-center">
        <h3 className="text-xl font-bold">{stockList.username}</h3>
        {user && user.username === stockList.username && (
          <div className="badge badge-primary">You</div>
        )}
      </div>
      <div className="tabs tabs-border tabs-lg flex">
        <input
          type="radio"
          name={tabsName}
          className="tab mb-4"
          aria-label="Stocks"
          defaultChecked
        />
        <div className="tab-content">
          <StockListStocks
            username={stockList.username}
            listName={stockList.list_name}
          />
        </div>
        <input
          type="radio"
          name={tabsName}
          className="tab mb-4"
          aria-label="Reviews"
        />
        <div className="tab-content">
          <StockListReviews stockList={stockList} />
        </div>
      </div>
    </div>
  );
}
