import { rect, oval, line, entry } from "./primitives.mjs";

const sizes = (name) => [16, 32, 48, 64].map((size) => `Arch_${name}_${size}`);

export const awsBusinessArtwork = [
  entry("aws-workmail", "aws", "Amazon WorkMail", sizes("Amazon-WorkMail"),
    "A letter arrives in a freestanding mailbox.",
    [
      line([19, 57], [19, 44], [24, 31], [34, 24], [77, 24], [87, 31], [92, 44], [92, 78], [19, 78], [19, 57]),
      line([34, 24], [44, 31], [49, 44], [49, 78]), line([49, 44], [92, 44]),
      rect(57, 51, 27, 18), line([57, 51], [70, 61], [84, 51]),
      line([64, 78], [64, 109]), line([48, 109], [80, 109]),
      line([92, 33], [108, 33], [108, 53], [92, 53]), line([100, 33], [100, 22], [112, 22]),
      line([24, 53], [43, 53]), line([24, 60], [43, 60]),
    ]),
  entry("aws-workdocs", "aws", "Amazon WorkDocs", sizes("Amazon-WorkDocs"),
    "Two people share a work document.",
    [
      line([35, 15], [78, 15], [94, 31], [94, 105], [35, 105], [35, 15]),
      line([78, 15], [78, 31], [94, 31]), line([44, 43], [84, 43]), line([44, 55], [84, 55]),
      line([44, 67], [76, 67]), line([44, 79], [84, 79]),
      oval(10, 52, 16, 16), line([7, 90], [9, 79], [14, 72], [22, 72], [27, 79], [29, 90], [7, 90]),
      oval(102, 52, 16, 16), line([99, 90], [101, 79], [106, 72], [114, 72], [119, 79], [121, 90], [99, 90]),
      line([29, 80], [35, 80]), line([94, 80], [99, 80]),
    ]),
  entry("aws-supply-chain", "aws", "AWS Supply Chain", sizes("AWS-Supply-Chain"),
    "A delivery truck departs a warehouse.",
    [
      line([9, 79], [9, 41], [32, 23], [55, 41], [55, 79]), line([9, 41], [55, 41]),
      rect(21, 54, 22, 25), line([21, 63], [43, 63]),
      line([56, 70], [76, 70], [76, 53], [99, 53], [114, 68], [114, 91], [56, 91], [56, 70]),
      line([76, 53], [76, 91]), line([99, 53], [99, 68], [114, 68]),
      oval(63, 85, 15, 15), oval(95, 85, 15, 15),
      line([61, 43], [76, 43]), line([70, 37], [76, 43], [70, 49]),
    ]),
  entry("aws-connect", "aws", "Amazon Connect", sizes("Amazon-Connect"),
    "A headset agent responds to a customer conversation.",
    [
      oval(26, 34, 31, 31), line([17, 100], [19, 82], [28, 72], [42, 68], [56, 72], [65, 82], [67, 100], [17, 100]),
      line([20, 52], [20, 43], [24, 30], [32, 24], [43, 21], [54, 24], [62, 31], [64, 45]),
      rect(15, 46, 9, 18), rect(61, 46, 9, 18), line([65, 64], [59, 71], [49, 71]),
      line([76, 24], [115, 24], [115, 53], [100, 53], [91, 62], [91, 53], [76, 53], [76, 24]),
      line([84, 35], [107, 35]), line([84, 43], [101, 43]),
    ]),
];
