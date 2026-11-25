import { rect, oval, line, entry } from "./primitives.mjs";

const sizes = (name) => [16, 32, 48, 64].map((size) => `Arch_${name}_${size}`);

export const awsStorageArtwork = [
  entry("aws-backup", "aws", "AWS Backup", sizes("AWS-Backup"),
    "A scheduled backup preserves an archive for restoration.",
    [
      line([15, 41], [15, 94], [85, 94], [85, 41], [15, 41]), line([21, 33], [79, 33], [85, 41]),
      rect(33, 54, 35, 18), line([42, 63], [59, 63]),
      oval(73, 65, 38, 38), line([92, 72], [92, 84], [101, 89]),
      line([57, 34], [57, 23], [46, 15], [33, 15], [22, 23]),
      line([32, 24], [22, 23], [24, 34]),
      line([18, 110], [105, 110]),
    ]),
  entry("aws-elastic-disaster-recovery", "aws", "AWS Elastic Disaster Recovery", sizes("AWS-Elastic-Disaster-Recovery"),
    "A failed server restores workloads to a healthy standby.",
    [
      rect(10, 25, 37, 61), line([10, 45], [47, 45]), line([10, 65], [47, 65]),
      line([16, 35], [39, 35]), line([16, 55], [39, 55]), line([16, 75], [39, 75]),
      line([23, 18], [32, 11], [28, 22], [38, 19], [27, 33]),
      rect(81, 25, 37, 61), line([81, 45], [118, 45]), line([81, 65], [118, 65]),
      line([87, 35], [110, 35]), line([87, 55], [110, 55]), line([87, 75], [110, 75]),
      line([47, 54], [81, 54]), line([73, 46], [81, 54], [73, 62]),
      line([90, 99], [97, 106], [111, 92]), line([14, 108], [70, 108]),
    ]),
  entry("aws-efs", "aws", "Amazon EFS", sizes("Amazon-EFS"),
    "A shared file system expands to multiple applications.",
    [
      line([35, 43], [35, 78], [93, 78], [93, 43], [67, 43], [60, 35], [35, 35], [35, 43]),
      line([35, 49], [93, 49]), line([46, 58], [82, 58]), line([46, 67], [73, 67]),
      line([28, 29], [16, 17]), line([16, 27], [16, 17], [26, 17]),
      line([100, 29], [112, 17]), line([102, 17], [112, 17], [112, 27]),
      line([28, 91], [16, 103]), line([16, 93], [16, 103], [26, 103]),
      line([100, 91], [112, 103]), line([102, 103], [112, 103], [112, 93]),
    ]),
  entry("aws-fsx", "aws", "Amazon FSx", sizes("Amazon-FSx"),
    "A file system serves a library of files from a managed storage stack.",
    [
      line([11, 31], [11, 72], [61, 72], [61, 31], [39, 31], [33, 24], [11, 24], [11, 31]),
      line([11, 38], [61, 38]), line([20, 48], [52, 48]), line([20, 57], [46, 57]),
      line([61, 52], [72, 52]), line([66, 46], [72, 52], [66, 58]),
      rect(74, 20, 41, 66), line([74, 42], [115, 42]), line([74, 64], [115, 64]),
      oval(80, 27, 7, 7), oval(80, 49, 7, 7), oval(80, 71, 7, 7),
      line([92, 30], [109, 30]), line([92, 52], [109, 52]), line([92, 74], [109, 74]),
      line([20, 103], [108, 103]),
    ]),
];
