import { AppLayout } from "./AppLayout";
import { createHashRouter, RouterProvider } from "react-router-dom";
import { DirectTokenize } from "./components/DirectTokenize";
import { SideBySide } from "./components/SideBySide";
import { Home } from "./components/Home";

export const router = createHashRouter([
  {
    path: "",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "direct",
        element: <DirectTokenize />,
      },
      {
        path: "side-by-side",
        element: <SideBySide />,
      },
      {
        path: "about",
        element: <div>About</div>,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
