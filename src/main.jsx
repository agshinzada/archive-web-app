import React from "react";
import ReactDOM from "react-dom/client";
import WarehouseApp from "./WarehouseApp.jsx";
import "./index.css";
import "./global.css";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import FichesPage from "./pages/ware/FichesPage.jsx";
import ProcessingPage from "./pages/ware/ProcessingPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import { FichesProvider } from "./context/FichesContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import PrivateRoute from "./components/PrivateRoute.jsx";
import ConfirmedDocumentPage from "./pages/ware/ConfirmedDocumentPage.jsx";
import UnConfirmedDocumentPage from "./pages/ware/UnConfirmedDocumentPage.jsx";
import RoutePage from "./pages/RoutePage.jsx";
import AccountingApp from "./AccountApp.jsx";
import PrivateRouteAcc from "./components/PrivateRouteAcc.jsx";
import ClientsPage from "./pages/acc/ClientsPage.jsx";
import TechApp from "./TechApp.jsx";
import ActPage from "./pages/tech/ActPage.jsx";
import HandoverPage from "./pages/tech/HandoverPage.jsx";
import ErrorPage from "./pages/ErrorPage.jsx";
const router = createBrowserRouter([
  {
    path: "/",
    element: <RoutePage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/ware",
    element: (
      <PrivateRoute>
        <WarehouseApp />
      </PrivateRoute>
    ),
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <ProcessingPage />,
      },
      {
        path: "invoices",
        element: <FichesPage />,
      },
      {
        path: "invoices/approved",
        element: <ConfirmedDocumentPage />,
      },
      {
        path: "invoices/unconfirmed",
        element: <UnConfirmedDocumentPage />,
      },
    ],
  },
  {
    path: "/acc",
    element: (
      <PrivateRouteAcc>
        <AccountingApp />
      </PrivateRouteAcc>
    ),
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <ClientsPage />,
      },
    ],
  },
  {
    path: "/tech",
    element: (
      <PrivateRouteAcc>
        <TechApp />
      </PrivateRouteAcc>
    ),
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <ActPage />,
      },
      {
        path: "handover",
        element: <HandoverPage />,
      },
    ],
  },
  {
    path: "ware/auth/login",
    element: <LoginPage />,
  },
  {
    path: "acc/auth/login",
    element: <LoginPage />,
  },
  {
    path: "tech/auth/login",
    element: <LoginPage />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <FichesProvider>
        <RouterProvider router={router} />
      </FichesProvider>
    </AuthProvider>
  </React.StrictMode>
);
