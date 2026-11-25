import { rect, oval, line, polygon, entry } from "./primitives.mjs";

const sizes = (name) => [16, 32, 48, 64].map((size) => `Arch_${name}_${size}`);

export const awsMediaArtwork = [
  entry("aws-medialive", "aws", "AWS Elemental MediaLive", sizes("AWS-Elemental-MediaLive"),
    "A video camera broadcasts a live signal.",
    [
      rect(15, 41, 58, 42), line([73, 52], [95, 41], [95, 83], [73, 72]),
      oval(25, 50, 23, 23), oval(32, 57, 9, 9),
      line([102, 39], [108, 48], [110, 61], [108, 73], [102, 82]),
      line([111, 29], [117, 41], [120, 61], [117, 80], [111, 92]),
      line([33, 83], [33, 96]), line([58, 83], [58, 96]), line([22, 97], [68, 97]),
      oval(54, 51, 10, 10, true),
    ]),
  entry("aws-mediaconvert", "aws", "AWS Elemental MediaConvert", sizes("AWS-Elemental-MediaConvert"),
    "A video file changes format through a conversion step.",
    [
      line([10, 22], [45, 22], [53, 30], [53, 72], [10, 72], [10, 22]),
      line([45, 22], [45, 30], [53, 30]), polygon([25, 38], [25, 57], [40, 47]),
      line([75, 58], [108, 58], [116, 66], [116, 106], [75, 106], [75, 58]),
      line([108, 58], [108, 66], [116, 66]), polygon([89, 73], [89, 92], [104, 82]),
      line([55, 37], [70, 37], [70, 51]), line([63, 45], [70, 51], [77, 45]),
      line([73, 91], [59, 91], [59, 77]), line([52, 83], [59, 77], [66, 83]),
      line([11, 100], [43, 100]),
    ]),
  entry("aws-mediapackage", "aws", "AWS Elemental MediaPackage", sizes("AWS-Elemental-MediaPackage"),
    "A video stream is packaged into a delivery parcel.",
    [
      rect(11, 19, 47, 35), line([11, 27], [58, 27]), polygon([29, 32], [29, 47], [42, 40]),
      line([58, 37], [74, 37], [74, 52]), line([67, 45], [74, 52], [81, 45]),
      line([59, 68], [85, 56], [111, 68], [111, 96], [85, 109], [59, 96], [59, 68]),
      line([59, 68], [85, 80], [111, 68]), line([85, 80], [85, 109]),
      line([15, 73], [42, 73]), line([15, 84], [37, 84]), line([15, 95], [42, 95]),
    ]),
  entry("aws-mediastore", "aws", "AWS Elemental MediaStore", sizes("AWS-Elemental-MediaStore"),
    "Film reels are stored together on a media shelf.",
    [
      line([13, 19], [13, 105], [115, 105], [115, 19]), line([13, 61], [115, 61]),
      oval(23, 26, 28, 28), oval(32, 35, 10, 10),
      oval(63, 26, 28, 28), oval(72, 35, 10, 10),
      rect(24, 70, 32, 23), polygon([35, 75], [35, 89], [46, 82]),
      line([65, 72], [103, 72]), line([65, 82], [97, 82]), line([65, 92], [103, 92]),
      line([22, 113], [106, 113]),
    ]),
];
