import { createBrowserRouter } from "react-router";
import Layout from "./layout";
import NotFound from "./not-found";
import StockListPage from "./stock-lists/stock-list-page";
import StockListBrowse from "./stock-lists/stock-list-browse";
import SharedStockList from "./stock-lists/shared-stock-list";
import PortfoliosPage from "./portfolios/portfolios-page";
import StockPerformance from "./stock-performance/stock-performance";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: (
      <Layout>
        <NotFound />
      </Layout>
    ),
    children: [
      {
        path: "",
        element: <StockListBrowse />,
      },
      {
        path: "stock-lists",
        element: <StockListPage />,
      },
      {
        path: "stock-lists/:username/:listName",
        element: <SharedStockList />,
      },
      {
        path: "portfolios",
        element: <PortfoliosPage />,
      },
      {
        path: "stock/:stock",
        element: <StockPerformance />,
      },
    ],
  },
]);

export default router;
