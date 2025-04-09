import { useEffect, useState } from "react";
import StockListsApi, {
  CorrelationMatrixResponse,
} from "../api/stock-lists-api";

export default function StockListCorrelations({
  username,
  listName,
  refresh,
}: {
  username: string;
  listName: string;
  refresh: boolean;
}) {
  const [correlationMatrix, setCorrelationMatrix] =
    useState<CorrelationMatrixResponse>();

  async function getCorrelationMatrix() {
    const response = await StockListsApi.getCorrelationMatrix(
      username,
      listName,
    );

    if ("error" in response) {
      console.log(response.error);
      return;
    }

    setCorrelationMatrix(response);
  }

  useEffect(() => {
    getCorrelationMatrix();
  }, [username, listName, refresh]);

  if (!correlationMatrix) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div className="overflow-x-auto rounded-lg shadow-lg max-h-96">
      <table className="table table-pin-rows table-pin-cols">
        <thead>
          <tr className="bg-base-200">
            <th className="bg-base-200"></th>
            {correlationMatrix?.symbols.map((symbol, index) => (
              <th className="bg-base-200" key={index}>
                {symbol}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {correlationMatrix?.correlations.map((row, rowIndex) => (
            <tr key={rowIndex}>
              <th className="bg-base-200">
                {correlationMatrix.symbols[rowIndex]}
              </th>
              {row.map((value, colIndex) => (
                <td
                  key={colIndex}
                  className="transition-colors duration-100 hover:bg-base-200"
                >
                  {value.toFixed(2)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
