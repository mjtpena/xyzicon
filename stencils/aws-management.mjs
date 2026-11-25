import { rect, oval, line, entry } from "./primitives.mjs";

const sizes = (name) => [16, 32, 48, 64].map((size) => `Arch_${name}_${size}`);

export const awsManagementArtwork = [
  entry("aws-appconfig", "aws", "AWS AppConfig", sizes("AWS-AppConfig"),
    "A feature switch is safely rolled out to application instances.",
    [
      rect(16, 16, 96, 66), line([16, 29], [112, 29]), line([23, 23], [30, 23]),
      line([26, 43], [48, 43]), line([26, 63], [48, 63]),
      line([59, 38], [88, 38], [96, 43], [96, 48], [88, 53], [59, 53], [52, 48], [52, 43], [59, 38]),
      oval(78, 40, 11, 11), line([55, 64], [93, 64]),
      line([24, 99], [50, 99]), line([57, 99], [83, 99]), line([90, 99], [106, 99]),
      line([99, 92], [106, 99], [99, 106]),
      line([31, 92], [36, 97], [44, 88]), line([64, 92], [69, 97], [77, 88]),
    ]),
  entry("aws-console-mobile", "aws", "AWS Console Mobile Application", sizes("AWS-Console-Mobile-Application"),
    "A phone presents a cloud console with service status and alerts.",
    [
      rect(31, 10, 66, 108), line([31, 24], [97, 24]), line([51, 17], [77, 17]),
      line([31, 103], [97, 103]), line([56, 110], [72, 110]),
      line([47, 47], [45, 41], [48, 35], [55, 34], [59, 29], [67, 29], [73, 34],
        [79, 35], [82, 41], [80, 47], [47, 47]),
      line([41, 61], [48, 61], [52, 54], [57, 68], [62, 59], [70, 59]),
      line([41, 82], [51, 82]), line([58, 82], [76, 82]), oval(77, 75, 12, 12),
    ]),
  entry("aws-organizations", "aws", "AWS Organizations", sizes("AWS-Organizations"),
    "A management account groups three member accounts under shared governance.",
    [
      line([46, 13], [82, 13], [82, 43], [46, 43], [46, 13]),
      line([54, 22], [74, 22]), line([54, 31], [68, 31]),
      line([64, 43], [64, 59], [23, 59], [23, 75]),
      line([64, 59], [105, 59], [105, 75]), line([64, 59], [64, 75]),
      rect(9, 75, 28, 25), rect(50, 75, 28, 25), rect(91, 75, 28, 25),
      line([15, 83], [31, 83]), line([56, 83], [72, 83]), line([97, 83], [113, 83]),
      line([15, 91], [26, 91]), line([56, 91], [67, 91]), line([97, 91], [108, 91]),
      line([28, 113], [100, 113]),
    ]),
  entry("aws-health-dashboard", "aws", "AWS Health Dashboard", sizes("AWS-Health-Dashboard"),
    "A service-health pulse accompanies a checked status list.",
    [
      line([16, 41], [16, 31], [22, 23], [31, 21], [40, 25], [46, 34],
        [52, 25], [61, 21], [70, 23], [76, 31], [76, 41], [70, 52], [46, 75], [22, 52], [16, 41]),
      line([10, 46], [29, 46], [35, 36], [41, 58], [48, 41], [53, 46], [80, 46]),
      line([86, 28], [114, 28]), line([86, 38], [108, 38]),
      line([86, 59], [113, 59]), line([86, 69], [105, 69]),
      line([20, 95], [106, 95]), line([20, 105], [84, 105]),
      oval(96, 82, 25, 25), line([103, 94], [108, 99], [115, 89]),
    ]),
];
