import { useContext, useState } from "react";
import StockListsApi, { PortfoliosResponse } from "../api/stock-lists-api";
import { UserContext } from "../context/user-context";
import { FiCornerRightDown, FiCornerRightUp, FiRepeat } from "react-icons/fi";
import Modal from "../components/modal";

export default function PortfolioCash({
  portfolios,
  setPortfolios,
  selectedIndex,
}: {
  portfolios: PortfoliosResponse[];
  setPortfolios: (portfolios: PortfoliosResponse[]) => void;
  selectedIndex: number;
}) {
  const { user } = useContext(UserContext);
  const [fromPortfolio, setFromPortfolio] = useState("");
  const [transferAmount, setTransferAmount] = useState(0);
  const [depositAmount, setDepositAmount] = useState(0);
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  const [transferLoading, setTransferLoading] = useState(false);
  const [depositLoading, setDepositLoading] = useState(false);
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [transferError, setTransferError] = useState("");
  const [depositError, setDepositError] = useState("");
  const [withdrawError, setWithdrawError] = useState("");

  const portfolio = portfolios[selectedIndex];
  const cash = portfolio.cash;

  const transferModalId = `transfer-modal-${portfolio.list_name}`;
  const depositModalId = `deposit-modal-${portfolio.list_name}`;
  const withdrawModalId = `withdraw-modal-${portfolio.list_name}`;
  const otherPortfolios = portfolios.filter(
    (p) => p.list_name !== portfolio.list_name,
  );
  const selectedPortfolio = otherPortfolios.find(
    (p) => p.list_name === fromPortfolio,
  );

  async function transferCash() {
    if (!user || !fromPortfolio || !transferAmount) {
      return;
    }

    setTransferLoading(true);

    const response = await StockListsApi.transferCash(
      user.accessToken,
      fromPortfolio,
      portfolio.list_name,
      transferAmount,
    );

    setTransferLoading(false);

    if ("error" in response) {
      setTransferError("Error transferring cash");
      return;
    }

    const newPortfolios = portfolios.map((p) => {
      if (p.list_name === fromPortfolio) {
        return {
          ...p,
          cash: p.cash - transferAmount,
        };
      }
      if (p.list_name === portfolio.list_name) {
        return {
          ...p,
          cash: p.cash + transferAmount,
        };
      }

      return p;
    });
    setPortfolios(newPortfolios);
    setTransferAmount(0);
    setTransferError("");
    setFromPortfolio("");

    const modal = document.getElementById(transferModalId) as HTMLDialogElement;
    modal.close();
  }

  async function depositCash() {
    if (!user || !depositAmount) {
      return;
    }

    setDepositLoading(true);

    const response = await StockListsApi.depositCash(
      user.accessToken,
      portfolio.list_name,
      depositAmount,
    );

    setDepositLoading(false);

    if ("error" in response) {
      setDepositError("Error depositing cash");
      return;
    }

    const newPortfolios = portfolios.map((p) => {
      if (p.list_name === portfolio.list_name) {
        return {
          ...p,
          cash: p.cash + depositAmount,
        };
      }

      return p;
    });
    setPortfolios(newPortfolios);
    setDepositAmount(0);
    setDepositError("");

    const modal = document.getElementById(depositModalId) as HTMLDialogElement;
    modal.close();
  }

  async function withdrawCash() {
    if (!user || !withdrawAmount) {
      return;
    }

    setWithdrawLoading(true);

    const response = await StockListsApi.withdrawCash(
      user.accessToken,
      portfolio.list_name,
      withdrawAmount,
    );

    setWithdrawLoading(false);

    if ("error" in response) {
      setWithdrawError("Error withdrawing cash");
      return;
    }

    const newPortfolios = portfolios.map((p) => {
      if (p.list_name === portfolio.list_name) {
        return {
          ...p,
          cash: p.cash - withdrawAmount,
        };
      }

      return p;
    });
    setPortfolios(newPortfolios);
    setWithdrawAmount(0);
    setWithdrawError("");

    const modal = document.getElementById(withdrawModalId) as HTMLDialogElement;
    modal.close();
  }

  return (
    <div className="flex items-center gap-12">
      <p className="text-xl font-bold">${cash}</p>
      <div className="flex items-center gap-4">
        <div className="tooltip tooltip-success" data-tip="Deposit">
          <button
            className="btn btn-success btn-circle"
            onClick={() => {
              const modal = document.getElementById(
                depositModalId,
              ) as HTMLDialogElement;
              modal.showModal();
            }}
          >
            <FiCornerRightDown />
          </button>
        </div>
        <div className="tooltip tooltip-warning" data-tip="Withdraw">
          <button
            className="btn btn-warning btn-circle"
            onClick={() => {
              const modal = document.getElementById(
                withdrawModalId,
              ) as HTMLDialogElement;
              modal.showModal();
            }}
          >
            <FiCornerRightUp />
          </button>
        </div>
        <div className="tooltip tooltip-info" data-tip="Transfer">
          <button
            className="btn btn-info btn-circle"
            onClick={() => {
              const modal = document.getElementById(
                transferModalId,
              ) as HTMLDialogElement;
              modal.showModal();
            }}
          >
            <FiRepeat />
          </button>
        </div>
      </div>
      <Modal id={depositModalId}>
        <h2 className="text-2xl font-bold">Deposit Cash</h2>
        <div className="pt-2">
          <p>Current: ${cash}</p>
          <p>After Deposit: ${cash + depositAmount}</p>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            depositCash();
          }}
          className="flex flex-col gap-4"
        >
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Amount</legend>
            <input
              type="number"
              min={0}
              value={depositAmount}
              placeholder="Amount"
              onChange={(e) => setDepositAmount(parseFloat(e.target.value))}
              className="input input-lg w-full"
              required
            />
          </fieldset>
          <button
            type="submit"
            className="btn btn-success"
            disabled={depositLoading}
          >
            {depositLoading ? "Depositing..." : "Deposit"}
          </button>
          {depositError && (
            <p className="text-error text-center">{depositError}</p>
          )}
        </form>
      </Modal>
      <Modal id={withdrawModalId}>
        <h2 className="text-2xl font-bold">Withdraw Cash</h2>
        <div className="pt-2">
          <p>Current: ${cash}</p>
          <p>After Withdraw: ${cash - withdrawAmount}</p>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            withdrawCash();
          }}
          className="flex flex-col gap-4"
        >
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Amount</legend>
            <input
              type="number"
              min={0}
              value={withdrawAmount}
              placeholder="Amount"
              onChange={(e) => setWithdrawAmount(parseFloat(e.target.value))}
              className="input input-lg w-full"
              required
            />
          </fieldset>
          <button
            type="submit"
            className="btn btn-warning"
            disabled={withdrawLoading}
          >
            {withdrawLoading ? "Withdrawing..." : "Withdraw"}
          </button>
          {withdrawError && (
            <p className="text-error text-center">{withdrawError}</p>
          )}
        </form>
      </Modal>
      <Modal id={transferModalId}>
        <h2 className="text-2xl font-bold">Transfer Cash</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            transferCash();
          }}
          className="flex flex-col gap-4"
        >
          <div className="grid grid-cols-3 gap-1 pt-3">
            <p className="text-xl font-bold">Portfolio</p>
            <p className="text-xl font-bold">Before</p>
            <p className="text-xl font-bold">After</p>
            <div className="flex gap-4 items-center">
              <p>{portfolio.list_name}</p>
              <div className="badge badge-sm badge-info">Current</div>
            </div>
            <p>${cash}</p>
            <p>${cash + transferAmount}</p>
            {selectedPortfolio && (
              <>
                <p>{selectedPortfolio.list_name}</p>
                <p>${selectedPortfolio.cash}</p>
                <p>${selectedPortfolio.cash - transferAmount}</p>
              </>
            )}
          </div>
          <fieldset className="fieldset dropdown dropdown-bottom">
            <legend className="fieldset-legend">From Portfolio</legend>
            <input
              type="text"
              tabIndex={0}
              className="input input-lg w-full"
              placeholder="Portfolio"
              value={fromPortfolio}
              onChange={(e) => setFromPortfolio(e.target.value)}
              required
            />
            {fromPortfolio &&
              !otherPortfolios
                .map((p) => p.list_name)
                .includes(fromPortfolio) && (
                <p className="text-error">Portfolio not found</p>
              )}
            <ul
              tabIndex={0}
              className="dropdown-content menu bg-base-200 rounded-box w-full z-1 shadow"
            >
              {otherPortfolios
                .filter((p) => p.list_name.includes(fromPortfolio))
                .map((p) => (
                  <li key={p.list_name}>
                    <a onClick={() => setFromPortfolio(p.list_name)}>
                      {p.list_name}
                    </a>
                  </li>
                ))}
            </ul>
          </fieldset>
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Amount</legend>
            <input
              type="number"
              min={0}
              value={transferAmount}
              placeholder="Amount"
              onChange={(e) => setTransferAmount(parseFloat(e.target.value))}
              className="input input-lg w-full"
              required
            />
          </fieldset>
          <button
            type="submit"
            className="btn btn-info"
            disabled={transferLoading}
          >
            {transferLoading ? "Transferring..." : "Transfer"}
          </button>
          {transferError && (
            <p className="text-error text-center">{transferError}</p>
          )}
        </form>
      </Modal>
    </div>
  );
}
