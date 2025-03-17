import { createBrowserRouter } from "react-router";
import Layout from "./layout";
import NotFound from "./not-found";
import Home from "./home/home";
import StockListPage from "./stock-lists/stock-list-page";

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
    ],
  },
]);

export default router;
