
import { Routes as RouterRoutes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Upload from "./pages/Upload";

const Routes = () => (
  <RouterRoutes>
    <Route path="/" element={<Index />} />
    <Route path="/upload" element={<Upload />} />
    <Route path="*" element={<NotFound />} />
  </RouterRoutes>
);

export default Routes;
