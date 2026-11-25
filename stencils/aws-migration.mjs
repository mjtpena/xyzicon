import { rect, oval, line, entry } from "./primitives.mjs";

const sizes = (name) => [16, 32, 48, 64].map((size) => `Arch_${name}_${size}`);

export const awsMigrationArtwork = [
  entry("aws-datasync", "aws", "AWS DataSync", sizes("AWS-DataSync"),
    "Two storage locations synchronize data in both directions.",
    [
      oval(11, 28, 29, 13), line([11, 34], [11, 82], [17, 88], [34, 88], [40, 82], [40, 34]),
      line([11, 58], [17, 64], [34, 64], [40, 58]),
      oval(88, 28, 29, 13), line([88, 34], [88, 82], [94, 88], [111, 88], [117, 82], [117, 34]),
      line([88, 58], [94, 64], [111, 64], [117, 58]),
      line([47, 42], [81, 42]), line([73, 35], [81, 42], [73, 49]),
      line([81, 75], [47, 75]), line([55, 68], [47, 75], [55, 82]),
      line([22, 107], [106, 107]),
    ]),
  entry("aws-application-migration", "aws", "AWS Application Migration Service", sizes("AWS-Application-Migration-Service"),
    "An application moves from an on-premises rack into a cloud.",
    [
      rect(10, 55, 36, 47), line([10, 70], [46, 70]), line([10, 86], [46, 86]),
      oval(15, 59, 6, 6), oval(15, 75, 6, 6), oval(15, 91, 6, 6),
      line([26, 62], [39, 62]), line([26, 78], [39, 78]), line([26, 94], [39, 94]),
      line([67, 45], [64, 37], [66, 28], [73, 22], [83, 22], [89, 15], [101, 15],
        [110, 22], [111, 30], [117, 35], [117, 44], [112, 50], [67, 50], [67, 45]),
      rect(81, 27, 24, 16), line([81, 32], [105, 32]),
      line([45, 70], [64, 70], [64, 58], [81, 58]),
      line([73, 52], [81, 58], [73, 64]),
      line([19, 113], [105, 113]),
    ]),
  entry("aws-transfer-family", "aws", "AWS Transfer Family", sizes("AWS-Transfer-Family"),
    "Documents move into and out of a secure file drop.",
    [
      line([16, 45], [16, 96], [112, 96], [112, 45], [79, 45], [72, 36], [16, 36], [16, 45]),
      line([16, 52], [112, 52]),
      line([27, 21], [45, 21], [51, 27], [51, 45], [27, 45], [27, 21]), line([45, 21], [45, 27], [51, 27]),
      line([35, 63], [35, 82]), line([28, 75], [35, 82], [42, 75]),
      line([93, 82], [93, 63]), line([86, 70], [93, 63], [100, 70]),
      line([56, 70], [56, 65], [59, 60], [69, 60], [72, 65], [72, 70]),
      rect(53, 70, 22, 17), oval(62, 76, 4, 4),
    ]),
  entry("aws-application-discovery", "aws", "AWS Application Discovery Service", sizes("AWS-Application-Discovery-Service"),
    "A magnifier discovers the dependencies of an application.",
    [
      oval(12, 14, 67, 67), line([70, 72], [95, 98], [89, 105], [64, 79]),
      rect(28, 27, 33, 17), line([33, 33], [56, 33]), line([33, 38], [50, 38]),
      line([44, 44], [44, 53], [31, 53], [31, 59]), line([44, 53], [58, 53], [58, 59]),
      rect(22, 59, 18, 12), rect(49, 59, 18, 12),
      line([94, 27], [113, 27]), line([94, 39], [108, 39]), line([94, 51], [113, 51]),
      line([24, 110], [80, 110]),
    ]),
];
