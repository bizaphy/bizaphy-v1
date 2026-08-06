//registry de proyectos

import TranslationChecker from "./translation-checker";
import TicTacToe from "./tic-tac-toe";
import WeatherDashboard from "./clima";
import WorldClock from "./hora-mundial";
import MarketDashboard from "./mercados";
//
export const projectsMap = {
  "translation-checker": TranslationChecker,
  "tic-tac-toe": TicTacToe,
  "clima": WeatherDashboard,
  "hora-mundial": WorldClock,
  "mercados": MarketDashboard,
};

export type ProjectSlug = keyof typeof projectsMap;
