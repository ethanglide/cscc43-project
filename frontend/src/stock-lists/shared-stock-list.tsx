import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router";
import StockListsApi, { StockListsResponse } from "../api/stock-lists-api";
import { UserContext } from "../context/user-context";
import StockListInfo from "./stock-list-info";
import NotFound from "../not-found";

export default function SharedStockList() {
  const { user } = useContext(UserContext);
  const { username, listName } = useParams();
  const [stockList, setStockList] = useState<StockListsResponse | null>(null);
  const [publicLoading, setPublicLoading] = useState(true);
  const [sharedLoading, setSharedLoading] = useState(true);
  const [ownedLoading, setOwnedLoading] = useState(true);

  const signedInLoading =
    user && (publicLoading || sharedLoading || ownedLoading);
  const signedOutLoading = publicLoading;
  const loading = signedInLoading || signedOutLoading;

  async function getPublicLists() {
    if (stockList) {
      return;
    }

    const response = await StockListsApi.getPublicStockLists();

    if ("error" in response) {
      console.log("Failed to get public stock lists");
      return;
    }

    const list = response.find(
      (list) => list.username === username && list.list_name === listName,
    );
    if (list) {
      setStockList(list);
    }

    setPublicLoading(false);
  }

  async function getSharedLists() {
    if (!user || stockList) {
      return;
    }

    const response = await StockListsApi.getSharedStockLists(user.accessToken);

    if ("error" in response) {
      console.log("Failed to get shared stock lists");
      return;
    }

    const list = response.find(
      (list) => list.username === username && list.list_name === listName,
    );
    if (list) {
      setStockList(list);
    }

    setSharedLoading(false);
  }

  async function getOwnedLists() {
    if (!user || stockList) {
      return;
    }

    const response = await StockListsApi.getStockLists(user.username);

    if ("error" in response) {
      console.log("Failed to get owned stock lists");
      return;
    }

    const list = response.find(
      (list) => list.username === username && list.list_name === listName,
    );
    if (list) {
      setStockList(list);
    }

    setOwnedLoading(false);
  }

  useEffect(() => {
    getPublicLists();
  }, []);

  useEffect(() => {
    getSharedLists();
    getOwnedLists();
  }, [user]);

  if (stockList) {
    return <StockListInfo stockList={stockList} />;
  }

  if (!loading) {
    return <NotFound />;
  }

  return (
    <div className="flex justify-center">
      <span className="loading loading-spinner loading-lg"></span>
    </div>
  );
}
