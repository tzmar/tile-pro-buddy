import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/context/AppContext";
import Layout from "@/components/Layout";
import Dashboard from "./pages/Index";
import NewJob from "./pages/NewJob";
import JobDetail from "./pages/JobDetail";
import TimerPage from "./pages/TimerPage";
import CompletedJobs from "./pages/CompletedJobs";
import SettingsPage from "./pages/SettingsPage";
import ShoppingList from "./pages/ShoppingList";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/new-job" element={<NewJob />} />
              <Route path="/job/:id" element={<JobDetail />} />
              <Route path="/timer" element={<TimerPage />} />
              <Route path="/completed" element={<CompletedJobs />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/shopping" element={<ShoppingList />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
