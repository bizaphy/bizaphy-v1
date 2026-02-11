//registry de proyectos

import TranslationChecker from "./translation-checker";
import useMosis from "./useMosis";
import MCPTest from "./mcp-project";
import excelBakery from "./excel-bakery";
import TicTacToe from "./tic-tac-toe";
//
export const projectsMap = {
  "translation-checker": TranslationChecker,
  "use-mosis": useMosis,
  "mcp-project": MCPTest,
  "excel-bakery": excelBakery,
  "tic-tac-toe": TicTacToe,
};

export type ProjectSlug = keyof typeof projectsMap;
