import { rect, oval, line, entry } from "./primitives.mjs";

export const azureNetworkArtwork = [
  entry("azure-firewall-manager", "azure", "Firewall Manager", ["00271-icon-service-Azure-Firewall-Manager"],
    "A firewall is managed through a control dial.",
    [
      rect(13, 30, 52, 49), line([13, 46], [65, 46]), line([13, 62], [65, 62]),
      line([32, 30], [32, 46]), line([52, 30], [52, 46]), line([22, 46], [22, 62]), line([48, 46], [48, 62]), line([32, 62], [32, 79]), line([52, 62], [52, 79]),
      oval(73, 62, 34, 34), oval(85, 74, 10, 10), line([90, 57], [90, 62]), line([90, 96], [90, 101]), line([68, 79], [73, 79]), line([107, 79], [112, 79]),
      line([14, 110], [110, 110]),
    ]),
  entry("azure-firewall-policy", "azure", "Firewall Policy", ["00272-icon-service-Azure-Firewall-Policy"],
    "A firewall policy records rules beside the protected wall.",
    [
      rect(12, 21, 52, 57), line([12, 40], [64, 40]), line([12, 59], [64, 59]), line([30, 21], [30, 40]), line([50, 21], [50, 40]), line([22, 40], [22, 59]), line([48, 40], [48, 59]), line([31, 59], [31, 78]), line([52, 59], [52, 78]),
      rect(72, 57, 40, 42), line([78, 67], [83, 67]), line([88, 67], [105, 67]), line([78, 77], [83, 77]), line([88, 77], [105, 77]), line([78, 87], [83, 87]), line([88, 87], [100, 87]), line([14, 110], [110, 110]),
    ]),
  entry("azure-ip-groups", "azure", "IP Groups", ["00701-icon-service-IP-Groups"],
    "Several address cards form an IP group.",
    [
      line([13, 67], [13, 22], [72, 22], [72, 30]), line([25, 76], [25, 34], [84, 34], [84, 42]), rect(38, 46, 70, 40),
      line([13, 31], [72, 31]), line([25, 43], [84, 43]), line([46, 57], [100, 57]), oval(47, 68, 5, 5, true), oval(59, 68, 5, 5, true), oval(71, 68, 5, 5, true), line([14, 110], [110, 110]),
    ]),
  entry("azure-virtual-wan-hub", "azure", "Virtual WAN Hub", ["00860-icon-service-Virtual-WAN-Hub"],
    "A wide-area network hub connects remote sites.",
    [
      oval(45, 37, 35, 35), line([52, 54], [72, 54]), line([62, 44], [72, 54], [62, 64]), line([45, 47], [25, 29]), line([80, 47], [101, 29]), line([45, 63], [25, 84]), line([80, 63], [101, 84]),
      rect(13, 16, 20, 15), rect(93, 16, 20, 15), rect(13, 84, 20, 15), rect(93, 84, 20, 15), line([14, 110], [110, 110]),
    ]),
  entry("azure-resource-management-private-link", "azure", "Resource Management Private Link", ["02145-icon-service-Resource-Management-Private-Link"],
    "A private management connection reaches a resource cube.",
    [
      line([20, 53], [31, 42]), line([20, 53], [31, 64]), line([106, 53], [95, 42]), line([106, 53], [95, 64]),
      line([63, 42], [84, 53], [84, 76], [63, 88], [42, 76], [42, 53], [63, 42]), line([42, 53], [63, 64], [84, 53]), line([63, 64], [63, 88]),
      line([63, 42], [63, 22]), oval(57, 11, 12, 12), rect(16, 89, 19, 16), line([20, 89], [20, 85], [25, 81], [31, 85], [31, 89]), line([14, 110], [110, 110]),
    ]),
  entry("azure-load-balancer-hub", "azure", "Load Balancer Hub", ["02302-icon-service-Load-Balancer-Hub", "029029174-icon-service-Load-Balancer-Hub"],
    "A hub distributes incoming traffic across three destinations.",
    [
      oval(50, 50, 25, 25), line([62, 99], [62, 75]), line([62, 50], [62, 27]), line([62, 27], [55, 34]), line([62, 27], [69, 34]),
      line([50, 58], [29, 38]), line([29, 38], [29, 48]), line([29, 38], [39, 38]), line([75, 58], [96, 38]), line([96, 38], [86, 38]), line([96, 38], [96, 48]), oval(55, 97, 14, 14), line([14, 116], [110, 116]),
    ]),
  entry("azure-bastions", "azure", "Azure Bastion", ["02422-icon-service-Bastions"],
    "A guarded gateway gives administrators access to a private host.",
    [
      line([12, 61], [32, 61]), line([23, 53], [32, 61], [23, 69]), line([31, 28], [31, 44], [43, 44], [43, 28], [55, 28], [55, 44], [67, 44], [67, 28], [79, 28], [79, 84], [31, 84], [31, 28]),
      line([48, 84], [48, 69], [55, 62], [62, 69], [62, 84]), line([79, 61], [100, 61]), rect(100, 51, 15, 21), line([14, 110], [110, 110]),
    ]),
  entry("azure-connected-cache", "azure", "Connected Cache", ["02509-icon-service-Connected-Cache"],
    "A cloud connection supplies cached data closer to clients.",
    [
      line([21, 63], [15, 59], [15, 50], [21, 44], [31, 44], [35, 33], [45, 27], [56, 28], [65, 38], [74, 38], [81, 46], [81, 53]),
      line([31, 64], [58, 64]), line([51, 57], [58, 64], [51, 71]), oval(68, 64, 42, 15), line([68, 72], [68, 91], [75, 97], [89, 99], [103, 97], [110, 91], [110, 72]), line([68, 82], [75, 88], [89, 90], [103, 88], [110, 82]), line([14, 110], [110, 110]),
    ]),
  entry("azure-spot-vm", "azure", "Spot Virtual Machine", ["02695-icon-service-Spot-VM"],
    "A virtual machine is acquired at a changing spot price.",
    [
      rect(16, 23, 95, 64), line([16, 76], [111, 76]), line([53, 87], [53, 99], [40, 99]), line([74, 87], [74, 99], [87, 99]),
      line([46, 42], [56, 32], [78, 35], [81, 56], [70, 67], [46, 42]), oval(68, 40, 6, 6), line([14, 110], [110, 110]),
    ]),
  entry("azure-spot-vmss", "azure", "Spot Virtual Machine Scale Set", ["02692-icon-service-Spot-VMSS"],
    "A scale set groups virtual machines acquired at spot prices.",
    [
      line([13, 68], [13, 20], [78, 20], [78, 29]), line([25, 77], [25, 30], [90, 30], [90, 39]), rect(38, 40, 73, 49),
      line([51, 54], [59, 46], [77, 49], [79, 66], [70, 75], [51, 54]), oval(69, 53, 5, 5), line([14, 110], [110, 110]),
    ]),
];
