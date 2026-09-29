import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Story from "./pages/Story";
import Chapter from "./pages/Chapter";
import Letters from "./pages/Letters";
import LittleThings from "./pages/LittleThings";
import Admin from "./pages/Admin";
import Memory from "./pages/Memory";
import StitchCompanion from "./components/StitchCompanion";
import { ThemeProvider, useBlueTheme } from "./lib/themeContext";

function AppContent() {
  const { theme, setTheme } = useBlueTheme();

  return (
    <div className={`theme-${theme} selection:bg-sky-200 selection:text-sky-950 min-h-screen`}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/story" element={<Story />} />
        <Route path="/story/:chapterId" element={<Chapter />} />
        <Route path="/memory/:id" element={<Memory />} />
        <Route path="/letters" element={<Letters />} />
        <Route path="/little-things" element={<LittleThings />} />
        <Route path="/admin/*" element={<Admin />} />
      </Routes>
      <StitchCompanion currentTheme={theme} onThemeChange={setTheme} />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ThemeProvider>
  );
}
