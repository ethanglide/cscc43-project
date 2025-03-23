import { FormEvent, useContext, useEffect, useState } from "react";
import { UserContext } from "../context/user-context";
import StockListsApi, {
  StockListsResponse,
  StockListType,
} from "../api/stock-lists-api";
import {
  FiAlertCircle,
  FiChevronDown,
  FiPlusCircle,
  FiTrash2,
} from "react-icons/fi";
import StockListInfo from "./stock-list-info";
import Modal from "../components/modal";
import ShareStockListButton from "./share-stock-list-button";

export default function StockListPage() {
  const { user } = useContext(UserContext);
  const [stockLists, setStockLists] = useState<StockListsResponse[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [newListName, setNewListName] = useState("");
  const [newListPublic, setNewListPublic] = useState(false);
  const [newListLoading, setNewListLoading] = useState(false);
  const [newListError, setNewListError] = useState("");

  const createStockListModalId = "create-stock-list-modal";
  const deleteStockListModalId = "delete-stock-list-modal";

  async function createStockList() {
    if (!user) {
      return;
    }

    setNewListLoading(true);
    setNewListError("");

    const response = await StockListsApi.createStockList(
      user.accessToken,
      newListName,
      newListPublic,
    );

    setNewListLoading(false);

    if ("error" in response) {
      setNewListError("Error creating stock list");
      return;
    }

    setStockLists([
      ...stockLists,
      {
        list_name: newListName,
        list_type: newListPublic ? StockListType.public : StockListType.private,
        username: user.username,
      },
    ]);
    setNewListName("");
    setNewListPublic(false);

    const modal = document.getElementById(
      createStockListModalId,
    ) as HTMLDialogElement;
    modal.close();
  }

  function handleCreateStockList(e: FormEvent) {
    e.preventDefault();
    createStockList();
  }

  async function deleteStockList() {
    if (!user || selectedIndex === null) {
      return;
    }

    const response = await StockListsApi.deleteStockList(
      user.accessToken,
      stockLists[selectedIndex].list_name,
    );

    if ("error" in response) {
      console.log(response.error);
      return;
    }

    setStockLists(stockLists.filter((_, index) => index !== selectedIndex));

    const modal = document.getElementById(
      deleteStockListModalId,
    ) as HTMLDialogElement;
    modal.close();
  }

  async function getStockLists() {
    if (!user) {
      return;
    }

    const response = await StockListsApi.getStockLists(user.username);

    if ("error" in response) {
      console.log(response.error);
      return;
    }

    setStockLists(response);
  }

  useEffect(() => {
    getStockLists();
  }, [user]);

  useEffect(() => {
    if (stockLists.length === 0) {
      setSelectedIndex(null);
    } else if (selectedIndex === null || selectedIndex >= stockLists.length) {
      setSelectedIndex(0);
    }
  }, [stockLists]);

  if (!user) {
    return (
      <div role="alert" className="alert alert-error">
        <FiAlertCircle className="w-5 h-5" />
        <span className="text-base">
          You must be logged in to view your stock lists
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="dropdown">
            <div tabIndex={0} role="button" className="btn btn-xl">
              {selectedIndex !== null && stockLists[selectedIndex]
                ? stockLists[selectedIndex].list_name
                : "Select Stock List"}
              <FiChevronDown />
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content menu bg-base-200 rounded-box z-1 w-52 p-2 shadow"
            >
              {stockLists.map((list, index) => (
                <li
                  key={list.list_name}
                  onClick={() => setSelectedIndex(index)}
                >
                  <a onClick={(e) => e.currentTarget.blur()}>
                    {list.list_name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          {selectedIndex !== null && stockLists[selectedIndex] && (
            <button
              onClick={() => {
                const modal = document.getElementById(
                  deleteStockListModalId,
                ) as HTMLDialogElement;
                modal.showModal();
              }}
              className="btn btn-error btn-circle"
            >
              <FiTrash2 />
            </button>
          )}
          {selectedIndex !== null &&
            stockLists[selectedIndex] &&
            stockLists[selectedIndex].list_type !== StockListType.public && (
              <ShareStockListButton
                listName={stockLists[selectedIndex].list_name}
              />
            )}
        </div>
        <button
          onClick={() => {
            const modal = document.getElementById(
              createStockListModalId,
            ) as HTMLDialogElement;
            modal.showModal();
          }}
          className="btn btn-primary btn-lg"
        >
          <FiPlusCircle /> Create Stock List
        </button>
      </div>
      {selectedIndex !== null && stockLists[selectedIndex] && (
        <StockListInfo stockList={stockLists[selectedIndex]} />
      )}
      <Modal id={createStockListModalId}>
        <h2 className="text-xl font-bold">Create Stock List</h2>
        <form onSubmit={handleCreateStockList} className="flex flex-col gap-4">
          <div className="flex items-center gap-6">
            <fieldset className="fieldset flex-grow">
              <legend className="fieldset-legend">Stock List Name</legend>
              <input
                type="text"
                value={newListName}
                placeholder="Stock List Name"
                onChange={(e) => setNewListName(e.target.value)}
                className="input input-lg w-full"
                required
              />
            </fieldset>
            <fieldset className="fieldset">
              <legend className="fieldset-legend">Public</legend>
              <label className="fieldset-label">
                <input
                  type="checkbox"
                  checked={newListPublic}
                  onChange={(e) => setNewListPublic(e.target.checked)}
                  className="checkbox checkbox-lg"
                />
                <span>Public?</span>
              </label>
            </fieldset>
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={newListLoading}
          >
            {newListLoading ? "Creating..." : "Create Stock List"}
          </button>
          {newListError && (
            <p className="text-error text-center">{newListError}</p>
          )}
        </form>
      </Modal>
      <Modal id={deleteStockListModalId}>
        <div className="flex flex-col items-center gap-4">
          <h2 className="text-xl font-bold">Delete Stock List</h2>
          <p>Are you sure you want to delete this stock list?</p>
          <div className="flex gap-4">
            <button onClick={deleteStockList} className="btn btn-error">
              Delete
            </button>
            <button
              onClick={() => {
                const modal = document.getElementById(
                  deleteStockListModalId,
                ) as HTMLDialogElement;
                modal.close();
              }}
              className="btn btn-primary"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
