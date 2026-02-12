import ClimaWidget from "./clima";
import NotaDelDiaWidget from "./nota-del-dia";
import BtcWidget from "./btc";
import HoraMundialWidget from "./hora-mundial";
import TareasWidget from "./tareas";
import StatsWidget from "./stats";
import NowPlayingWidget from "./now-playing";

export const widgetsMap = {
  "clima": ClimaWidget,
  "nota-del-dia": NotaDelDiaWidget,
  "btc": BtcWidget,
  "hora-mundial": HoraMundialWidget,
  "tareas": TareasWidget,
  "stats": StatsWidget,
  "now-playing": NowPlayingWidget,
};

export type WidgetSlug = keyof typeof widgetsMap;
