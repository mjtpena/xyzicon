import { rect, oval, line, entry } from "./primitives.mjs";

const variants = (name, sizes) => sizes.flatMap((size) =>
  ["filled", "regular"].map((style) => `${name}_${size}_${style}`));

export const fabricLayoutArtwork = [
  entry("fabric-locked-columns", "fabric", "Locked columns",
    variants("layout_column_three_lock", [20, 24]),
    "Three vertical columns are protected by a lock.",
    [
      rect(14, 17, 91, 87), line([44, 17], [44, 104]), line([74, 17], [74, 62]),
      rect(68, 77, 45, 33), line([76, 77], [76, 68], [80, 60], [90, 56], [100, 60], [104, 68], [104, 77]),
      oval(87, 87, 7, 7), line([90, 94], [90, 101]),
    ]),
  entry("fabric-locked-rows", "fabric", "Locked rows",
    variants("layout_row_three_lock", [20, 24]),
    "Three horizontal rows are protected by a lock.",
    [
      rect(14, 17, 91, 87), line([14, 46], [105, 46]), line([14, 75], [68, 75]),
      rect(68, 77, 45, 33), line([76, 77], [76, 68], [80, 60], [90, 56], [100, 60], [104, 68], [104, 77]),
      oval(87, 87, 7, 7), line([90, 94], [90, 101]),
    ]),
  entry("fabric-stack-key", "fabric", "Stack key",
    variants("stack_key", [16, 20]),
    "A key grants access to a stack of records.",
    [
      rect(13, 19, 76, 48), line([20, 74], [91, 74]), line([27, 82], [83, 82]),
      oval(72, 57, 29, 29), line([78, 80], [53, 105], [59, 111], [66, 104], [72, 110], [79, 103], [73, 97], [85, 85]),
      oval(82, 66, 8, 8),
    ]),
  entry("fabric-table-wand", "fabric", "Table wand",
    variants("table_wand", [16, 20]),
    "A wand transforms a grid of table cells.",
    [
      rect(12, 19, 72, 84), line([12, 47], [84, 47]), line([12, 75], [68, 75]),
      line([36, 19], [36, 103]), line([60, 19], [60, 69]),
      line([65, 98], [99, 64], [109, 74], [75, 108], [65, 98]),
      line([92, 26], [92, 42]), line([84, 34], [100, 34]),
      line([108, 43], [108, 55]), line([102, 49], [114, 49]),
    ]),
  entry("fabric-toggle-sparkles", "fabric", "Toggle sparkles",
    variants("toggle_multiple_sparkles", [16, 20]),
    "Two switches are accompanied by sparkling automation.",
    [
      line([29, 29], [71, 29], [83, 35], [87, 45], [83, 55], [71, 61], [29, 61], [17, 55], [13, 45], [17, 35], [29, 29]),
      oval(21, 35, 20, 20),
      line([29, 73], [71, 73], [83, 79], [87, 89], [83, 99], [71, 105], [29, 105], [17, 99], [13, 89], [17, 79], [29, 73]),
      oval(60, 79, 20, 20),
      line([101, 15], [101, 37]), line([90, 26], [112, 26]), line([105, 58], [105, 72]), line([98, 65], [112, 65]),
    ]),
  entry("fabric-window-asterisk", "fabric", "Window asterisk",
    variants("window_asterisk", [20, 24, 32]),
    "A window contains a prominent asterisk.",
    [
      rect(15, 16, 98, 96), line([15, 36], [113, 36]), line([25, 26], [39, 26]),
      line([64, 49], [64, 98]), line([42, 61], [86, 86]), line([42, 86], [86, 61]),
    ]),
  entry("fabric-window-check", "fabric", "Window checkmark",
    variants("window_checkmark", [20, 32]),
    "A successful window has a checkmark badge.",
    [
      line([14, 102], [14, 16], [105, 16], [105, 58]), line([14, 36], [105, 36]),
      line([25, 26], [39, 26]), line([28, 53], [72, 53]), line([28, 67], [58, 67]),
      oval(60, 59, 53, 53), line([71, 85], [81, 95], [102, 73]),
    ]),
  entry("fabric-window-pulse", "fabric", "Window pulse",
    variants("window_pulse", [16, 20, 24]),
    "A monitored window plots a pulse on chart axes.",
    [
      rect(14, 17, 100, 94), line([14, 37], [114, 37]), line([24, 27], [38, 27]),
      line([26, 50], [26, 98], [104, 98]),
      line([31, 78], [44, 78], [52, 59], [63, 91], [74, 68], [81, 78], [102, 78]),
    ]),
];
