import { rect, oval, line, entry } from "./primitives.mjs";

export const awsIotArtwork = [
  entry("aws-iot-thing-humidity-sensor", "aws", "IoT Thing Humidity Sensor", ["Res_AWS-IoT_Thing_Humidity-Sensor_48"],
    "A humidity sensor measures moisture in the air.",
    [
      line([60, 16], [47, 35], [39, 49], [38, 59], [42, 68], [50, 74], [60, 76], [70, 74], [78, 68], [82, 59], [81, 49], [73, 35], [60, 16]),
      line([49, 56], [51, 63], [57, 67]), line([90, 38], [98, 43]), line([89, 49], [102, 49]), line([90, 60], [98, 55]), line([14, 109], [110, 109]),
    ]),
  entry("aws-iot-thing-temperature-sensor", "aws", "IoT Thing Temperature Sensor", ["Res_AWS-IoT_Thing_Temperature-Sensor_48"],
    "A thermometer measures temperature.",
    [
      line([53, 65], [53, 24], [56, 17], [62, 15], [68, 17], [71, 24], [71, 65]), oval(47, 61, 30, 30), line([62, 35], [62, 73]), oval(57, 70, 10, 10, true),
      line([75, 29], [84, 29]), line([75, 39], [81, 39]), line([75, 49], [84, 49]), line([14, 109], [110, 109]),
    ]),
  entry("aws-iot-thing-temperature-humidity", "aws", "IoT Thing Temperature Humidity Sensor", ["Res_AWS-IoT_Thing_Temperature-Humidity-Sensor_48"],
    "A sensor combines temperature and humidity readings.",
    [
      line([25, 68], [25, 27], [28, 20], [34, 18], [40, 20], [43, 27], [43, 68]), oval(19, 64, 30, 30), line([34, 37], [34, 76]), oval(29, 73, 10, 10, true),
      line([81, 25], [71, 40], [65, 50], [64, 59], [67, 67], [73, 72], [81, 74], [89, 72], [95, 67], [98, 59], [97, 50], [91, 40], [81, 25]), line([14, 109], [110, 109]),
    ]),
  entry("aws-iot-thing-temperature-vibration", "aws", "IoT Thing Temperature Vibration Sensor", ["Res_AWS-IoT_Thing_Temperature-Vibration-Sensor_48"],
    "A sensor measures both temperature and vibration.",
    [
      line([54, 51], [54, 20], [57, 14], [62, 12], [67, 14], [70, 20], [70, 51]), oval(48, 47, 28, 28), line([62, 28], [62, 60]), oval(58, 57, 8, 8, true),
      line([16, 86], [32, 86], [38, 76], [45, 98], [52, 73], [59, 101], [66, 75], [73, 95], [80, 86], [106, 86]), line([14, 112], [110, 112]),
    ]),
  entry("aws-iot-thing-vibration-sensor", "aws", "IoT Thing Vibration Sensor", ["Res_AWS-IoT_Thing_Vibration-Sensor_48"],
    "A vibration waveform is detected by a sensor.",
    [
      rect(14, 24, 96, 59), line([14, 35], [110, 35]), line([22, 56], [31, 56], [37, 46], [44, 68], [51, 43], [59, 72], [67, 46], [74, 65], [81, 56], [102, 56]), line([14, 109], [110, 109]),
    ]),
  entry("aws-iot-thing-thermostat", "aws", "IoT Thing Thermostat", ["Res_AWS-IoT_Thing_Thermostat_48"],
    "A thermostat controls a desired temperature.",
    [
      oval(22, 15, 79, 79), oval(32, 25, 59, 59), line([43, 48], [45, 44], [55, 44], [57, 48], [43, 63], [57, 63]),
      line([63, 44], [75, 44], [75, 63], [63, 63], [63, 44]), oval(79, 40, 5, 5), line([14, 109], [110, 109]),
    ]),
  entry("aws-iot-thing-stacklight", "aws", "IoT Thing Stacklight", ["Res_AWS-IoT_Thing_Stacklight_48"],
    "A stacked signal lamp reports equipment state.",
    [
      rect(46, 17, 30, 60), line([46, 37], [76, 37]), line([46, 57], [76, 57]), oval(56, 22, 10, 10), oval(56, 42, 10, 10), oval(56, 62, 10, 10),
      line([61, 77], [61, 91]), line([49, 91], [73, 91]), line([37, 27], [31, 24]), line([85, 27], [91, 24]), line([14, 109], [110, 109]),
    ]),
  entry("aws-iot-thing-medical-emergency", "aws", "IoT Thing Medical Emergency", ["Res_AWS-IoT_Thing_Medical-Emergency_48"],
    "A medical alert device reports an emergency.",
    [
      rect(22, 20, 77, 63), line([22, 33], [99, 33]), line([55, 42], [67, 42], [67, 52], [77, 52], [77, 64], [67, 64], [67, 74], [55, 74], [55, 64], [45, 64], [45, 52], [55, 52], [55, 42]),
      line([31, 93], [91, 93]), line([14, 109], [110, 109]),
    ]),
  entry("aws-iot-thing-police-emergency", "aws", "IoT Thing Police Emergency", ["Res_AWS-IoT_Thing_Police-Emergency_48"],
    "An emergency beacon sends a police alert.",
    [
      line([29, 71], [31, 51], [37, 39], [48, 33], [61, 31], [74, 33], [85, 39], [91, 51], [93, 71]), line([23, 71], [99, 71], [99, 81], [23, 81], [23, 71]),
      line([61, 20], [61, 12]), line([34, 27], [27, 21]), line([88, 27], [95, 21]), line([17, 47], [9, 44]), line([105, 47], [113, 44]), line([14, 109], [110, 109]),
    ]),
  entry("aws-iot-thing-windfarm", "aws", "IoT Thing Windfarm", ["Res_AWS-IoT_Thing_Windfarm_48"],
    "A connected wind turbine reports its operation.",
    [
      oval(56, 39, 11, 11), line([61, 39], [55, 14], [59, 10], [64, 14], [65, 39]), line([56, 46], [35, 62], [30, 61], [32, 56], [55, 40]), line([66, 45], [92, 54], [95, 59], [90, 61], [64, 50]),
      line([59, 50], [51, 96]), line([64, 50], [72, 96]), line([42, 96], [80, 96]), line([14, 109], [110, 109]),
    ]),
  entry("aws-iot-thing-bank", "aws", "IoT Thing Bank", ["Res_AWS-IoT_Thing_Bank_48"],
    "A bank building represents a connected financial location.",
    [
      line([13, 36], [61, 15], [110, 36], [13, 36]), line([18, 42], [104, 42]), line([24, 42], [24, 79]), line([42, 42], [42, 79]), line([61, 42], [61, 79]), line([80, 42], [80, 79]), line([98, 42], [98, 79]),
      line([16, 79], [107, 79]), line([11, 87], [112, 87]), line([14, 109], [110, 109]),
    ]),
  entry("aws-iot-thing-bicycle", "aws", "IoT Thing Bicycle", ["Res_AWS-IoT_Thing_Bicycle_48"],
    "A bicycle is a connected thing.",
    [
      oval(10, 52, 33, 33), oval(81, 52, 33, 33), line([26, 68], [46, 42], [68, 68], [26, 68]), line([46, 42], [59, 68], [97, 68], [77, 33]), line([71, 33], [83, 33]), line([40, 37], [52, 37]), line([46, 37], [46, 42]), line([14, 109], [110, 109]),
    ]),
  entry("aws-iot-thing-camera", "aws", "IoT Thing Camera", ["Res_AWS-IoT_Thing_Camera_48"],
    "A connected camera captures and transmits images.",
    [
      line([20, 33], [78, 33], [93, 46], [78, 59], [20, 59], [20, 33]), oval(72, 39, 14, 14),
      line([42, 59], [42, 72], [52, 80], [52, 89]), line([34, 89], [70, 89]),
      line([89, 25], [94, 20], [101, 18]), line([91, 33], [100, 27], [110, 27]), line([14, 109], [110, 109]),
    ]),
  entry("aws-iot-thing-car", "aws", "IoT Thing Car", ["Res_AWS-IoT_Thing_Car_48"],
    "A connected car reports its state.",
    [
      line([12, 72], [15, 56], [29, 51], [40, 33], [82, 33], [96, 51], [108, 56], [111, 72], [12, 72]),
      line([33, 51], [42, 39], [60, 39], [60, 51], [33, 51]), line([66, 39], [79, 39], [89, 51], [66, 51], [66, 39]),
      oval(22, 65, 17, 17), oval(85, 65, 17, 17), line([14, 109], [110, 109]),
    ]),
  entry("aws-iot-thing-cart", "aws", "IoT Thing Cart", ["Res_AWS-IoT_Thing_Cart_48"],
    "A shopping cart represents a connected retail asset.",
    [
      line([12, 25], [25, 25], [37, 71], [92, 71], [105, 37], [29, 37]), line([33, 51], [99, 51]), line([48, 37], [51, 71]), line([75, 37], [73, 71]),
      oval(38, 77, 12, 12), oval(79, 77, 12, 12), line([14, 109], [110, 109]),
    ]),
  entry("aws-iot-thing-coffee-pot", "aws", "IoT Thing Coffee Pot", ["Res_AWS-IoT_Thing_Coffee-Pot_48"],
    "A connected coffee pot can be monitored.",
    [
      line([30, 39], [72, 39], [76, 80], [69, 89], [33, 89], [26, 80], [30, 39]), line([26, 52], [16, 55], [25, 63]), line([75, 48], [88, 48], [95, 55], [93, 67], [85, 71], [76, 71]),
      line([28, 35], [73, 35]), line([39, 28], [63, 28]), line([50, 15], [45, 21], [50, 27]), line([62, 15], [57, 21], [62, 27]), line([14, 109], [110, 109]),
    ]),
  entry("aws-iot-thing-door-lock", "aws", "IoT Thing Door Lock", ["Res_AWS-IoT_Thing_Door-Lock_48"],
    "A connected lock secures a door.",
    [
      rect(27, 15, 67, 82), line([35, 22], [86, 22], [86, 90], [35, 90], [35, 22]), oval(72, 55, 5, 5, true),
      rect(47, 53, 19, 17), line([51, 53], [51, 47], [55, 43], [60, 43], [63, 47], [63, 53]), line([14, 109], [110, 109]),
    ]),
  entry("aws-iot-thing-factory", "aws", "IoT Thing Factory", ["Res_AWS-IoT_Thing_Factory_48"],
    "A factory connects industrial equipment.",
    [
      line([16, 87], [16, 51], [35, 40], [35, 51], [54, 40], [54, 51], [73, 40], [73, 87], [16, 87]),
      line([22, 47], [22, 18], [32, 18], [32, 41]), rect(25, 62, 11, 11), rect(44, 62, 11, 11), rect(61, 62, 7, 11),
      line([85, 43], [91, 36], [98, 34]), line([87, 52], [96, 46], [106, 45]), line([14, 109], [110, 109]),
    ]),
  entry("aws-iot-thing-house", "aws", "IoT Thing House", ["Res_AWS-IoT_Thing_House_48"],
    "A house represents a connected home.",
    [
      line([12, 50], [61, 15], [110, 50]), line([22, 44], [22, 91], [100, 91], [100, 44]), rect(49, 63, 24, 28), rect(30, 51, 13, 13), rect(79, 51, 13, 13), oval(67, 75, 4, 4, true), line([14, 109], [110, 109]),
    ]),
  entry("aws-iot-thing-lightbulb", "aws", "IoT Thing Lightbulb", ["Res_AWS-IoT_Thing_Lightbulb_48"],
    "A connected light is switched on.",
    [
      line([38, 42], [38, 33], [43, 25], [51, 20], [61, 18], [71, 20], [79, 25], [84, 33], [84, 42], [80, 50], [72, 59], [70, 68], [52, 68], [50, 59], [42, 50], [38, 42]),
      line([52, 75], [70, 75]), line([55, 82], [67, 82]), line([61, 9], [61, 15]), line([27, 27], [20, 23]), line([95, 27], [102, 23]), line([14, 109], [110, 109]),
    ]),
];
