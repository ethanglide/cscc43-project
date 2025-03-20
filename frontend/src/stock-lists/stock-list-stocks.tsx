import { FormEvent, useContext, useEffect, useState } from "react";
import StockListsApi, {
  StockListsResponse,
  StockListStockResponse,
} from "../api/stock-lists-api";
import { UserContext } from "../context/user-context";
import StocksApi, { StockResponse } from "../api/stocks-api";
import { FiMinus, FiPlus } from "react-icons/fi";
import Modal from "../components/modal";

export default function StockListStocks({
  stockList,
}: {
  stockList: StockListsResponse;
}) {
  const { user } = useContext(UserContext);
  const [allStocks, setAllStocks] = useState<StockResponse[]>([]);
  const [stockListStocks, setStockListStocks] = useState<
    StockListStockResponse[]
  >([]);
  const [newStockSymbol, setNewStockSymbol] = useState("");
  const [newStockAmount, setNewStockAmount] = useState(1);
  const [newStockLoading, setNewStockLoading] = useState(false);
  const [newStockError, setNewStockError] = useState("");

  const isOwner = user && user.username === stockList.username;
  const modalId = "add-stock-modal";
  const filteredStocks = allStocks.filter((stock) =>
    stock.symbol.startsWith(newStockSymbol),
  );

  async function getAllStocks() {
    const response = await StocksApi.getStocks();

    if ("error" in response) {
      console.log(response.error);
      return;
    }

    setAllStocks(response);
  }

  async function getStockListStocks() {
    const response = await StockListsApi.getStockListStocks(
      stockList.username,
      stockList.list_name,
    );

    if ("error" in response) {
      console.log(response.error);
      return;
    }

    setStockListStocks(response);
  }

  async function addStock() {
    if (!user) {
      return;
    }

    setNewStockLoading(true);

    const response = await StockListsApi.addStockToList(
      user.accessToken,
      stockList.list_name,
      newStockSymbol,
      newStockAmount,
    );

    setNewStockLoading(false);

    if ("error" in response) {
      setNewStockError("Error adding stock to list");
      return;
    }

    // Either add the stock to the list or update the amount
    if (!stockListStocks.find((stock) => stock.symbol === newStockSymbol)) {
      setStockListStocks([
        ...stockListStocks,
        { symbol: newStockSymbol, amount: newStockAmount },
      ]);
    } else {
      setStockListStocks(
        stockListStocks.map((stock) => {
          if (stock.symbol === newStockSymbol) {
            return { ...stock, amount: newStockAmount };
          }

          return stock;
        }),
      );
    }

    setNewStockError("");
    setNewStockSymbol("");
    setNewStockAmount(1);
  }

  function handleAddStock(e: FormEvent) {
    e.preventDefault();
    addStock();
  }

  async function removeStock(symbol: string) {
    if (!user) {
      return;
    }

    const response = await StockListsApi.removeStockFromList(
      user.accessToken,
      stockList.list_name,
      symbol,
    );

    if ("error" in response) {
      console.log(response.error);
      return;
    }

    setStockListStocks(
      stockListStocks.filter((stock) => stock.symbol !== symbol),
    );
  }

  function handleSetNewStockSymbol(symbol: string) {
    const newSymbol = symbol.toUpperCase();
    setNewStockSymbol(newSymbol);
    setNewStockAmount(
      stockListStocks.find((stock) => stock.symbol === newSymbol)?.amount ||
      newStockAmount,
    );
  }

  useEffect(() => {
    getAllStocks();
  }, []);

  useEffect(() => {
    getStockListStocks();
  }, [user, stockList]);

  return (
    <>
      <div className="tab-content overflow-x-hidden rounded-lg shadow-lg max-h-96">
        <table className="table table-pin-rows">
          <thead>
            <tr className="bg-base-200">
              <th>Symbol</th>
              <th>Amount</th>
              <th className="text-end">
                {isOwner && (
                  <button
                    onClick={() => {
                      const modal = document.getElementById(
                        modalId,
                      ) as HTMLDialogElement;
                      modal.showModal();
                    }}
                    className="btn btn-success btn-circle"
                  >
                    <FiPlus className="w-6 h-6" />
                  </button>
                )}
              </th>
            </tr>
          </thead>
          <tbody>
            {stockListStocks.map((stock) => (
              <tr key={stock.symbol} className="hover:bg-base-200">
                <td>{stock.symbol}</td>
                <td>{stock.amount}</td>
                <td className="text-end">
                  {isOwner && (
                    <button
                      onClick={() => removeStock(stock.symbol)}
                      className="btn btn-error btn-circle"
                    >
                      <FiMinus className="w-6 h-6" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal id={modalId}>
        <h2 className="text-xl font-bold">Add Stock</h2>
        <form onSubmit={handleAddStock} className="flex flex-col gap-4">
          <div className="flex items-center gap-6">
            <fieldset className="fieldset flex-grow dropdown dropdown-bottom">
              <legend className="fieldset-legend">Stock List Name</legend>
              <input
                type="text"
                tabIndex={0}
                value={newStockSymbol}
                placeholder="Stock List Name"
                onChange={(e) => handleSetNewStockSymbol(e.target.value)}
                className="input input-lg w-full"
                required
              />
              <ul
                tabIndex={0}
                className="dropdown-content block menu bg-base-200 rounded-box z-1 p-2 shadow max-h-20 overflow-y-auto"
              >
                {filteredStocks.map((stock) => (
                  <li
                    key={stock.symbol}
                    onClick={() => handleSetNewStockSymbol(stock.symbol)}
                  >
                    <a onClick={(e) => e.currentTarget.blur()}>
                      {stock.symbol}
                    </a>
                  </li>
                ))}
              </ul>
            </fieldset>
            <fieldset className="fieldset w-1/4">
              <legend className="fieldset-legend">Amount</legend>
              <input
                type="number"
                min={1}
                value={newStockAmount}
                placeholder="Amount"
                onChange={(e) => setNewStockAmount(+e.target.value)}
                className="input input-lg"
                required
              />
            </fieldset>
          </div>
          <button type="submit" className="btn btn-primary">
            {newStockLoading ? "Adding..." : "Add Stock"}
          </button>
          {newStockError && (
            <p className="text-error text-center">{newStockError}</p>
          )}
        </form>
      </Modal>
    </>
  );
}
