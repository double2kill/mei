import { Route, Routes } from "react-router-dom";
import { RootLayout } from "./RootLayout";
import { HomePage } from "./pages/HomePage";
import { TestPage } from "./pages/TestPage";
import { RandomThunderPage } from "./pages/RandomThunderPage";
import { TestSettingsPage } from "./pages/TestSettingsPage";

export default function App() {
  return (
    <RootLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/test" element={<TestPage />} />
        <Route path="/test/settings" element={<TestSettingsPage />} />
        <Route path="/random" element={<RandomThunderPage />} />
      </Routes>
    </RootLayout>
  );
}
