import { Routes, Route } from "react-router";
import AppLayout from "@/components/layout/AppLayout";
import Dashboard from "@/pages/Dashboard";
import Schools from "@/pages/Schools";
import SchoolDetail from "@/pages/SchoolDetail";
import Scraper from "@/pages/Scraper";
import Analytics from "@/pages/Analytics";
import Settings from "@/pages/Settings";
import DataSources from "@/pages/DataSources";
import NotFound from "@/pages/NotFound";


export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <AppLayout>
            <Dashboard />
          </AppLayout>
        }
      />
      <Route
        path="/schools"
        element={
          <AppLayout>
            <Schools />
          </AppLayout>
        }
      />
      <Route
        path="/schools/:id"
        element={
          <AppLayout>
            <SchoolDetail />
          </AppLayout>
        }
      />
      <Route
        path="/scraper"
        element={
          <AppLayout>
            <Scraper />
          </AppLayout>
        }
      />
      <Route
        path="/analytics"
        element={
          <AppLayout>
            <Analytics />
          </AppLayout>
        }
      />
      <Route
        path="/settings"
        element={
          <AppLayout>
            <Settings />
          </AppLayout>
        }
      />
      <Route
        path="/sources"
        element={
          <AppLayout>
            <DataSources />
          </AppLayout>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
