import React, { useState } from "react";
import { CALCULATOR_MODULES } from "./registry/calculators";
import {
  Scale,
  ArrowLeftRight,
  Coins,
  IndianRupee,
  Star,
  ArrowLeft,
  ChevronRight,
  Globe,
} from "lucide-react";
import { playFeedback } from "./utils/feedback";

const ICONS_CONFIG: Record<
  string,
  { icon: React.ReactNode; bg: string; text: string; border: string }
> = {
  Globe: {
    icon: <Globe className="w-6 h-6 text-sky-400" />,
    bg: "bg-sky-500/10",
    text: "text-sky-400",
    border: "border-sky-500/20",
  },
  Scale: {
    icon: <Scale className="w-6 h-6 text-emerald-400" />,
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/20",
  },
  ArrowLeftRight: {
    icon: <ArrowLeftRight className="w-6 h-6 text-teal-400" />,
    bg: "bg-teal-500/10",
    text: "text-teal-400",
    border: "border-teal-500/20",
  },
  Coins: {
    icon: <Coins className="w-6 h-6 text-amber-400" />,
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/20",
  },
  IndianRupee: {
    icon: <IndianRupee className="w-6 h-6 text-indigo-400" />,
    bg: "bg-indigo-500/10",
    text: "text-indigo-400",
    border: "border-indigo-500/20",
  },
};

export const App: React.FC = () => {
  // Read saved default calculator from LocalStorage
  const [defaultModuleId, setDefaultModuleId] = useState<string | null>(() => {
    try {
      return localStorage.getItem("pricescale_default_calc");
    } catch {
      return null;
    }
  });

  // Current view: if default is set or URL has currency query params, open directly to calculator, else menu
  const [currentView, setCurrentView] = useState<"menu" | "calculator">(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.has('from') || searchParams.has('to')) {
        return 'calculator';
      }
      const savedDefault = localStorage.getItem("pricescale_default_calc");
      if (
        savedDefault &&
        CALCULATOR_MODULES.some((m) => m.id === savedDefault)
      ) {
        return "calculator";
      }
    } catch {
      // ignore
    }
    return "menu";
  });

  // Active module
  const [activeModuleId, setActiveModuleId] = useState<string>(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.has('from') || searchParams.has('to')) {
        return 'currency-converter';
      }
      const savedDefault = localStorage.getItem("pricescale_default_calc");
      if (
        savedDefault &&
        CALCULATOR_MODULES.some((m) => m.id === savedDefault)
      ) {
        return savedDefault;
      }
    } catch {
      // ignore
    }
    return "currency-converter";
  });

  const handleToggleDefault = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    playFeedback.click();

    if (defaultModuleId === id) {
      // Remove default
      try {
        localStorage.removeItem("pricescale_default_calc");
      } catch {
        // ignore
      }
      setDefaultModuleId(null);
    } else {
      // Set default
      try {
        localStorage.setItem("pricescale_default_calc", id);
      } catch {
        // ignore
      }
      setDefaultModuleId(id);
      playFeedback.success();
    }
  };

  const handleOpenCalculator = (id: string) => {
    playFeedback.click();
    setActiveModuleId(id);
    setCurrentView("calculator");
  };

  const handleBackToMenu = () => {
    playFeedback.click();
    setCurrentView("menu");
  };

  const activeModule =
    CALCULATOR_MODULES.find((m) => m.id === activeModuleId) ||
    CALCULATOR_MODULES[0];
  const ActiveComponent = activeModule.component;
  const isCurrentModuleDefault = defaultModuleId === activeModule.id;

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 font-sans selection:bg-emerald-500 selection:text-white flex flex-col">
      {/* VIEW 1: MENU DASHBOARD */}
      {currentView === "menu" && (
        <div className="w-full max-w-md mx-auto px-4 py-6 flex-1 flex flex-col justify-start">
          {/* Top Title & Subtitle */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-black text-slate-100 tracking-tight my-0">
              Select Calculator
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Choose a tool below or set one as your opening default.
            </p>
          </div>

          {/* Menu Cards List */}
          <div className="space-y-3.5">
            {CALCULATOR_MODULES.map((mod) => {
              const isDefault = defaultModuleId === mod.id;
              const iconConf = ICONS_CONFIG[mod.iconName] || ICONS_CONFIG.Scale;

              return (
                <div
                  key={mod.id}
                  onClick={() => handleOpenCalculator(mod.id)}
                  className={`relative p-4 rounded-2xl border transition-all duration-150 cursor-pointer active:scale-[0.98] shadow-lg flex items-start gap-3.5 ${
                    isDefault
                      ? "bg-slate-900/95 border-amber-500/40 shadow-amber-500/5"
                      : "bg-slate-900/80 hover:bg-slate-900 border-slate-800/90 hover:border-slate-700"
                  }`}
                >
                  {/* Icon Box */}
                  <div
                    className={`p-3 rounded-xl ${iconConf.bg} border ${iconConf.border} shrink-0`}
                  >
                    {iconConf.icon}
                  </div>

                  {/* Card Content */}
                  <div className="flex-1 min-w-0 pr-8">
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-slate-100 my-0 truncate">
                        {mod.name}
                      </h2>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 leading-snug line-clamp-2">
                      {mod.description}
                    </p>
                  </div>

                  {/* Top-Right: Set as Default Star Button */}
                  <button
                    onClick={(e) => handleToggleDefault(mod.id, e)}
                    className={`absolute top-3 right-3 p-2 rounded-xl transition-all cursor-pointer ${
                      isDefault
                        ? "bg-amber-400/20 text-amber-400 border border-amber-400/40"
                        : "text-slate-500 hover:text-slate-300 hover:bg-slate-800"
                    }`}
                    title={
                      isDefault
                        ? "Default Start Screen (Click to unset)"
                        : "Set as Default Start Screen"
                    }
                  >
                    <Star
                      className={`w-4 h-4 transition-transform ${
                        isDefault ? "fill-amber-400 scale-110" : ""
                      }`}
                    />
                  </button>

                  {/* Bottom-right arrow */}
                  <div className="absolute bottom-3 right-3 text-slate-500 pointer-events-none">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: ACTIVE CALCULATION PAGE */}
      {currentView === "calculator" && (
        <div className={`w-full ${activeModule.id === 'currency-converter' ? 'max-w-5xl' : 'max-w-md'} mx-auto px-3.5 py-4 flex-1 flex flex-col`}>
          {/* Mobile Top Navigation Bar */}
          <div className="flex items-center justify-between gap-2 mb-4 bg-slate-900/90 border border-slate-800/90 px-3.5 py-2.5 rounded-2xl backdrop-blur-md shadow-lg">
            {/* Back to Menu */}
            <button
              onClick={handleBackToMenu}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700/80 px-2.5 py-1.5 rounded-xl border border-slate-700 cursor-pointer active:scale-95 transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>All Tools</span>
            </button>

            {/* Title */}
            <div className="text-center font-bold text-sm text-slate-200 truncate px-2">
              {activeModule.shortName}
            </div>

            {/* Set as Default Toggle Button */}
            <button
              onClick={() => handleToggleDefault(activeModule.id)}
              className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer active:scale-95 ${
                isCurrentModuleDefault
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm shadow-amber-500/20"
                  : "bg-slate-800/80 text-slate-400 hover:text-slate-200 border-slate-700"
              }`}
              title={
                isCurrentModuleDefault
                  ? "Default Screen (Tap to remove)"
                  : "Set as Default Screen"
              }
            >
              <Star
                className={`w-3.5 h-3.5 ${isCurrentModuleDefault ? "fill-amber-400 text-amber-400" : ""}`}
              />
              <span className="hidden sm:inline">
                {isCurrentModuleDefault ? "Default" : "Set Default"}
              </span>
            </button>
          </div>

          {/* Active Calculator Component */}
          <div className="flex-1">
            <ActiveComponent />
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-auto py-4 text-center text-xs text-slate-500 select-none">
        Made with <span className="text-rose-500">♥</span> by <span className="text-slate-300 font-medium">SumitDas</span>
      </footer>
    </div>
  );
};

export default App;
