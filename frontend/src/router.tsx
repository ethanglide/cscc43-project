import { createBrowserRouter } from "react-router";
import Layout from "./layout";
import NotFound from "./not-found";
import Home from "./home/home";
import StockListPage from "./stock-lists/stock-list-page";
import StockListBrowse from "./stock-lists/stock-list-browse";
import SharedStockList from "./stock-lists/shared-stock-list";
import PortfoliosPage from "./portfolios/portfolios-page";

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
        element: <Home />,
      },
      {
        path: "stock-lists",
        element: <StockListPage />,
      },
      {
        path: "browse",
        element: <StockListBrowse />,
      },
      {
        path: "stock-lists/:username/:listName",
        element: <SharedStockList />,
      },
      {
        path: "portfolios",
        element: <PortfoliosPage />,
      },
    ],
  },
]);

export default router;
