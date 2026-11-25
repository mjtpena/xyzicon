import { rect, oval, line, entry } from "./primitives.mjs";

const sizes = (name) => [16, 32, 48, 64].map((size) => `Arch_${name}_${size}`);

export const awsSecurityArtwork = [
  entry("aws-security-hub", "aws", "AWS Security Hub", sizes("AWS-Security-Hub"),
    "A security shield gathers findings from three sources.",
    [
      line([64, 35], [84, 42], [82, 61], [74, 73], [64, 80], [54, 73], [46, 61], [44, 42], [64, 35]),
      line([55, 58], [61, 64], [73, 51]),
      line([64, 35], [64, 25]), line([44, 55], [31, 55]), line([84, 55], [97, 55]),
      rect(49, 10, 30, 15), rect(10, 45, 21, 20), rect(97, 45, 21, 20),
      line([54, 17], [74, 17]), line([15, 55], [26, 55]), line([102, 55], [113, 55]),
      line([27, 96], [101, 96]), line([35, 106], [93, 106]),
    ]),
  entry("aws-certificate-manager", "aws", "AWS Certificate Manager", sizes("AWS-Certificate-Manager"),
    "A certificate secures an internet domain.",
    [
      line([12, 14], [68, 14], [81, 27], [81, 103], [12, 103], [12, 14]),
      line([68, 14], [68, 27], [81, 27]),
      line([21, 35], [70, 35]), line([21, 45], [61, 45]),
      oval(26, 55, 27, 27), line([33, 69], [38, 74], [47, 63]),
      line([31, 81], [28, 95], [39, 90], [48, 95], [47, 81]),
      oval(73, 60, 42, 42), line([73, 81], [115, 81]), line([94, 60], [94, 102]),
      line([82, 64], [78, 72], [77, 81], [78, 90], [82, 98]),
      line([106, 64], [110, 72], [111, 81], [110, 90], [106, 98]),
    ]),
  entry("aws-identity-center", "aws", "AWS IAM Identity Center", sizes("AWS-IAM-Identity-Center"),
    "One workforce identity opens access to multiple applications.",
    [
      oval(15, 29, 22, 22), line([10, 80], [13, 65], [19, 57], [33, 57], [39, 65], [42, 80]),
      line([42, 55], [55, 55], [55, 22], [83, 22]),
      line([55, 55], [83, 55]), line([55, 55], [55, 92], [83, 92]),
      rect(83, 12, 31, 20), rect(83, 45, 31, 20), rect(83, 82, 31, 20),
      line([90, 22], [107, 22]), line([90, 55], [107, 55]), line([90, 92], [107, 92]),
      line([15, 104], [56, 104]),
    ]),
  entry("aws-iam", "aws", "AWS Identity and Access Management", sizes("AWS-Identity-and-Access-Management"),
    "A key grants a named principal specific permissions.",
    [
      oval(12, 18, 30, 30), line([34, 41], [62, 69], [56, 75]), line([48, 54], [56, 46]),
      line([54, 60], [62, 52]),
      line([69, 15], [105, 15], [115, 25], [115, 103], [69, 103], [69, 15]),
      line([105, 15], [105, 25], [115, 25]),
      oval(77, 32, 13, 13), line([74, 57], [76, 49], [82, 46], [88, 49], [90, 57]),
      line([75, 69], [80, 74], [87, 65]), line([91, 70], [108, 70]),
      line([75, 86], [80, 91], [87, 82]), line([91, 87], [108, 87]),
      line([14, 102], [57, 102]),
    ]),
];
