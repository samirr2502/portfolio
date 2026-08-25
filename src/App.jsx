import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";

import Header from "./snippets/header";
import Footer from "./snippets/footer";
import TechBackground from "./components/TechBackground";
import { scrollDeckTo } from "./components/ScrollDeck";
import Home from "./pages/home";
import Personal from "./pages/personalProjects";
import School from "./pages/schoolProjects";
import Admin from "./admin/pages/admin";
import Login from "./admin/pages/login";

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const isDeck = location.pathname === "/" || location.pathname === "";
  const [authenticated, setAuthenticated] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      return window.localStorage.getItem("theme") || "light";
    }
    return "light";
  });

  useEffect(() => {
    if (theme === "light") {
      document.documentElement.classList.add("theme-light");
    } else {
      document.documentElement.classList.remove("theme-light");
    }
    window.localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.classList.toggle("deck-mode", isDeck);
    document.body.classList.toggle("deck-mode", isDeck);
    return () => {
      document.documentElement.classList.remove("deck-mode");
      document.body.classList.remove("deck-mode");
    };
  }, [isDeck]);

  useEffect(() => {
    if (!isDeck) return undefined;
    const hash = location.hash.replace("#", "");
    if (!hash) return undefined;
    const timer = window.setTimeout(() => scrollDeckTo(hash), 80);
    return () => window.clearTimeout(timer);
  }, [isDeck, location.hash]);

  const goToSection = (sectionId) => {
    if (isDeck) {
      scrollDeckTo(sectionId);
      return;
    }
    navigate({ pathname: "/", hash: sectionId });
  };

  return (
    <div className={`body labBody ${isDeck ? "labShell" : ""}`}>
      <TechBackground isHeroChrome={isDeck && activeSection === "home"} />
      <Header
        theme={theme}
        toggleTheme={() => setTheme(theme === "light" ? "dark" : "light")}
        isDeck={isDeck}
        activeSection={activeSection}
        onSectionNav={goToSection}
      />

      <main className={isDeck ? "deckMain" : "main labMain"}>
        <Routes>
          <Route path="/" element={<Home onActiveSectionChange={setActiveSection} />} />
          <Route path="/personal" element={<Personal />} />
          <Route path="/school" element={<School />} />
          <Route path="/about" element={<Navigate to={{ pathname: "/", hash: "#about" }} replace />} />
          <Route
            path="/admin"
            element={
              authenticated ? (
                <Admin setAuthenticated={setAuthenticated} />
              ) : (
                <Login authenticated={authenticated} setAuthenticated={setAuthenticated} />
              )
            }
          />
          <Route path="*" element={<div className="text-center mt-8">Not Found</div>} />
        </Routes>
      </main>

      {!isDeck && <Footer />}
    </div>
  );
}

export default App;
