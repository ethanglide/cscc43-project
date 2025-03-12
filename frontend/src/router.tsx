import { createBrowserRouter } from "react-router";
import Layout from "./layout";
import NotFound from "./not-found";
import Home from "./home/home";

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
    ],
  },
]);

export default router;
