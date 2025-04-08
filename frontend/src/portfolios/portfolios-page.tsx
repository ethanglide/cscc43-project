import { FormEvent, useContext, useEffect, useState } from "react";
import StockListsApi, { PortfoliosResponse } from "../api/stock-lists-api";
import { UserContext } from "../context/user-context";
import {
  FiAlertCircle,
  FiChevronDown,
  FiPlusCircle,
  FiTrash2,
} from "react-icons/fi";
import Modal from "../components/modal";
import PortfolioInfo from "./portfolio-info";

export default function PortfoliosPage() {
  const { user } = useContext(UserContext);
  const [portfolios, setPortfolios] = useState<PortfoliosResponse[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [newPortfolioName, setNewPortfolioName] = useState("");
  const [newPortfolioLoading, setNewPortfolioLoading] = useState(false);
  const [newPortfolioError, setNewPortfolioError] = useState("");
  const [refresh, setRefresh] = useState(false);

  const createPortfolioModalId = "create-portfolio-modal";
  const deletePortfolioModalId = "delete-portfolio-modal";

  function triggerRefresh() {
    setRefresh(!refresh);
  }

  async function createPortfolio() {
    if (!user) {
      return;
    }

    setNewPortfolioLoading(true);
    setNewPortfolioError("");

    const response = await StockListsApi.createPortfolio(
      user.accessToken,
      newPortfolioName,
    );

    setNewPortfolioLoading(false);

    if ("error" in response) {
      setNewPortfolioError("Error creating portfolio");
      return;
    }

    setPortfolios([
      ...portfolios,
      {
        username: user.username,
        list_name: newPortfolioName,
        cash: 0,
      },
    ]);
    setNewPortfolioName("");

    const modal = document.getElementById(
      createPortfolioModalId,
    ) as HTMLDialogElement;
    modal.close();
  }

  function handleCreatePortfolio(e: FormEvent) {
    e.preventDefault();
    createPortfolio();
  }

  async function deletePortfolio() {
    if (!user || selectedIndex === null) {
      return;
    }

    const response = await StockListsApi.deleteStockList(
      user.accessToken,
      portfolios[selectedIndex].list_name,
    );

    if ("error" in response) {
      return;
    }

    setPortfolios(portfolios.filter((_, index) => index !== selectedIndex));

    const modal = document.getElementById(
      deletePortfolioModalId,
    ) as HTMLDialogElement;
    modal.close();
  }

  async function getPortfolios() {
    if (!user) {
      return;
    }

    const response = await StockListsApi.getPortfolios(user.accessToken);

    if ("error" in response) {
      return;
    }

    setPortfolios(response);
  }

  useEffect(() => {
    console.log("Fetching portfolios");
    getPortfolios();
  }, [user, refresh]);

  useEffect(() => {
    if (portfolios.length === 0) {
      setSelectedIndex(null);
    } else if (selectedIndex === null || selectedIndex >= portfolios.length) {
      setSelectedIndex(0);
    }
  }, [portfolios]);

  if (!user) {
    return (
      <div role="alert" className="alert alert-error">
        <FiAlertCircle className="w-5 h-5" />
        <span className="text-base">
          You must be logged in to view your portfolios
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
              {selectedIndex !== null && portfolios[selectedIndex]
                ? portfolios[selectedIndex].list_name
                : "Select Portfolio"}
              <FiChevronDown />
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content menu bg-base-200 rounded-box z-1 w-52 p-2 shadow"
            >
              {portfolios.map((portfolio, index) => (
                <li
                  key={portfolio.list_name}
                  onClick={() => setSelectedIndex(index)}
                >
                  <a onClick={(e) => e.currentTarget.blur()}>
                    {portfolio.list_name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          {selectedIndex !== null && portfolios[selectedIndex] && (
            <button
              onClick={() => {
                const modal = document.getElementById(
                  deletePortfolioModalId,
                ) as HTMLDialogElement;
                modal.showModal();
              }}
              className="btn btn-error btn-circle"
            >
              <FiTrash2 />
            </button>
          )}
        </div>
        <button
          onClick={() => {
            const modal = document.getElementById(
              createPortfolioModalId,
            ) as HTMLDialogElement;
            modal.showModal();
          }}
          className="btn btn-primary btn-lg"
        >
          <FiPlusCircle /> Create Portfolio
        </button>
      </div>
      {selectedIndex !== null && portfolios[selectedIndex] && (
        <PortfolioInfo
          portfolios={portfolios}
          setPortfolios={setPortfolios}
          selectedIndex={selectedIndex}
          refresh={refresh}
          triggerRefresh={triggerRefresh}
        />
      )}
      <Modal id={createPortfolioModalId}>
        <h2 className="text-xl font-bold">Create Portfolio</h2>
        <form onSubmit={handleCreatePortfolio} className="flex flex-col gap-4">
          <fieldset className="fieldset flex-grow">
            <legend className="fieldset-legend">Portfolio Name</legend>
            <input
              type="text"
              value={newPortfolioName}
              placeholder="Portfolio Name"
              onChange={(e) => setNewPortfolioName(e.target.value)}
              className="input input-lg w-full"
              required
            />
          </fieldset>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={newPortfolioLoading}
          >
            {newPortfolioLoading ? "Creating..." : "Create Portfolio"}
          </button>
          {newPortfolioError && (
            <p className="text-error text-center">{newPortfolioError}</p>
          )}
        </form>
      </Modal>
      <Modal id={deletePortfolioModalId}>
        <div className="flex flex-col items-center gap-4">
          <h2 className="text-xl font-bold">Delete Portfolio</h2>
          <p>Are you sure you want to delete this portfolio?</p>
          <div className="flex gap-4">
            <button onClick={deletePortfolio} className="btn btn-error">
              Delete
            </button>
            <button
              onClick={() => {
                const modal = document.getElementById(
                  deletePortfolioModalId,
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
