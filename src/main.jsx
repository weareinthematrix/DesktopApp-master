import React from "react";
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import Calcul from "./Pages/Calcul";
import Graphe from "./Pages/Graphe";
import "./styles.css";
import Root from "./Layout/root";
import ErrorPage from "./Pages/error-page";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "calcul",
        element: <Calcul/>,
      },
      {
        path: "graphe",
        element: <Graphe/>,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
