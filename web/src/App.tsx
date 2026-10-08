import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { AdminLayout } from "./admin/AdminLayout";
import { AdminLoginPage } from "./admin/AdminLoginPage";
import { AdminQuizEditPage } from "./admin/AdminQuizEditPage";
import { AdminQuizListPage } from "./admin/AdminQuizListPage";
import { AdminRoute } from "./admin/AdminRoute";
import { AdminScreenPage } from "./admin/AdminScreenPage";
import { PageStatus } from "./components/PageStatus";
import { RootLayout } from "./RootLayout";
import { HomePage } from "./pages/HomePage";
import { TestPage } from "./pages/TestPage";
import { RandomThunderPage } from "./pages/RandomThunderPage";
import { EvaPage } from "./pages/EvaPage";

const TestPlayPage = lazy(() =>
  import("./pages/TestPlayPage").then((m) => ({ default: m.TestPlayPage })),
);
const TestSettingsPage = lazy(() =>
  import("./pages/TestSettingsPage").then((m) => ({
    default: m.TestSettingsPage,
  })),
);

export default function App() {
  return (
    <Routes>
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin" element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route index element={<AdminQuizListPage />} />
          <Route path="quizzes" element={<AdminQuizListPage />} />
          <Route path="quizzes/:id" element={<AdminQuizEditPage />} />
          <Route path="screens/:screen" element={<AdminScreenPage />} />
        </Route>
      </Route>
      <Route
        path="/*"
        element={
          <RootLayout>
            <Suspense fallback={<PageStatus loading />}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/eva" element={<EvaPage />} />
                <Route path="/test" element={<TestPage />} />
                <Route path="/test/:id" element={<TestPlayPage />} />
                <Route
                  path="/test/:id/settings"
                  element={<TestSettingsPage />}
                />
                <Route path="/random" element={<RandomThunderPage />} />
              </Routes>
            </Suspense>
          </RootLayout>
        }
      />
    </Routes>
  );
}
