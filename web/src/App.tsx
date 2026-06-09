import { Route, Routes } from "react-router-dom";
import { AdminLayout } from "./admin/AdminLayout";
import { AdminLoginPage } from "./admin/AdminLoginPage";
import { AdminQuizEditPage } from "./admin/AdminQuizEditPage";
import { AdminQuizListPage } from "./admin/AdminQuizListPage";
import { AdminRoute } from "./admin/AdminRoute";
import { AdminScreenPage } from "./admin/AdminScreenPage";
import { RootLayout } from "./RootLayout";
import { HomePage } from "./pages/HomePage";
import { TestPage } from "./pages/TestPage";
import { RandomThunderPage } from "./pages/RandomThunderPage";
import { TestSettingsPage } from "./pages/TestSettingsPage";
import { EvaPage } from "./pages/EvaPage";
import { TestPlayPage } from "./pages/TestPlayPage";

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
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/eva" element={<EvaPage />} />
              <Route path="/test" element={<TestPage />} />
              <Route path="/test/:id" element={<TestPlayPage />} />
              <Route path="/test/:id/settings" element={<TestSettingsPage />} />
              <Route path="/random" element={<RandomThunderPage />} />
            </Routes>
          </RootLayout>
        }
      />
    </Routes>
  );
}
