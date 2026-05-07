import { Route, Routes } from "react-router-dom";
import { RootLayout } from "./RootLayout";
import { HomePage } from "./pages/HomePage";
import { TestPage } from "./pages/TestPage";
import { RandomThunderPage } from "./pages/RandomThunderPage";
import { TestSettingsPage } from "./pages/TestSettingsPage";
import { EvaPage } from "./pages/EvaPage";
import { TestPlayPage } from "./pages/TestPlayPage";

export default function App() {
  return (
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
  );
}
