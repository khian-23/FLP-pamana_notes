import PublicLayout from "../layouts/PublicLayout";
import LandingPage from "../pages/public/LandingPage";

export const publicRoutes = {
  path: "/",
  element: <PublicLayout />,
  children: [
    { index: true, element: <LandingPage /> }
  ]
};
