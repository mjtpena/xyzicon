import { rect, oval, line, entry } from "./primitives.mjs";

const variants = (name, sizes) => sizes.flatMap((size) =>
  ["filled", "regular"].map((style) => `${name}_${size}_${style}`));

export const fabricDataViewArtwork = [
  entry("fabric-data-graph", "fabric", "Data graph",
    variants("data_graph", [20]),
    "Two independent series run across a chart with horizontal and vertical axes.",
    [
      line([15, 16], [15, 106], [113, 106]),
      line([19, 53], [37, 39], [56, 49], [74, 62], [91, 56], [106, 34]),
      line([19, 78], [36, 67], [55, 74], [75, 84], [92, 82], [107, 71]),
      oval(34, 36, 6, 6), oval(71, 59, 6, 6), oval(33, 64, 6, 6),
    ]),
  entry("fabric-data-tree", "fabric", "Data tree",
    variants("data_tree", [20]),
    "Three branches connect separate records to a shared data store.",
    [
      oval(77, 41, 37, 14), line([77, 48], [77, 78], [82, 83], [109, 83], [114, 78], [114, 48]),
      line([77, 65], [83, 69], [108, 69], [114, 65]),
      rect(12, 14, 17, 17), rect(12, 55, 17, 17), rect(12, 96, 17, 17),
      line([29, 22], [45, 22], [57, 48], [77, 48]),
      line([29, 63], [77, 63]), line([29, 104], [45, 104], [57, 78], [77, 78]),
    ]),
  entry("fabric-double-pie", "fabric", "Double pie chart",
    variants("pie_double", [20]),
    "One complete pie and two detached pieces make a split distribution.",
    [
      line([55, 18], [55, 59], [94, 59], [92, 75], [82, 88], [69, 96],
        [52, 98], [39, 93], [28, 83], [55, 59]),
      line([45, 13], [45, 49], [15, 49], [18, 35], [27, 24], [35, 18], [45, 13]),
      line([14, 58], [43, 58], [22, 79], [15, 70], [14, 58]),
    ]),
  entry("fabric-progress-bars", "fabric", "Progress bars",
    variants("progress_bar", [20]),
    "Two horizontal tracks show different completion amounts.",
    [
      rect(13, 30, 101, 24), line([49, 30], [49, 54]),
      line([18, 42], [42, 42]), line([21, 37], [38, 37]), line([21, 47], [38, 47]),
      rect(13, 73, 101, 24), line([84, 73], [84, 97]),
      line([19, 85], [77, 85]), line([21, 80], [75, 80]), line([21, 90], [75, 90]),
    ]),
  entry("fabric-stream-search", "fabric", "Stream search",
    variants("stream_search", [20]),
    "A magnifier inspects three separate flowing data strands.",
    [
      line([50, 93], [57, 76], [62, 56], [73, 41], [92, 32], [110, 31]),
      line([63, 102], [70, 86], [75, 66], [84, 54], [96, 48], [112, 48]),
      line([78, 111], [84, 96], [88, 78], [97, 67], [111, 65]),
      oval(17, 64, 32, 32), line([43, 91], [58, 106]),
    ]),
  entry("fabric-histogram-function", "fabric", "Histogram function",
    variants("data_histogram_function", [16, 20]),
    "A distribution of bars is paired with an explicit function curve.",
    [
      line([13, 102], [13, 75], [25, 75], [25, 102]),
      line([32, 102], [32, 49], [44, 49], [44, 102]),
      line([51, 102], [51, 28], [63, 28], [63, 102]),
      line([8, 102], [67, 102]),
      line([98, 21], [91, 18], [84, 21], [81, 31], [74, 86], [70, 99], [64, 104]),
      line([69, 43], [95, 43]), line([89, 73], [109, 96]), line([108, 73], [89, 96]),
    ]),
  entry("fabric-connected-nodes", "fabric", "Connected nodes",
    variants("nodes_connected", [20]),
    "A central hub connects to three separate outer nodes.",
    [
      oval(22, 37, 31, 31), oval(91, 16, 18, 18),
      oval(24, 95, 18, 18), oval(90, 91, 18, 18),
      line([50, 44], [91, 27]), line([36, 68], [33, 95]),
      line([51, 63], [93, 93]),
    ]),
];
