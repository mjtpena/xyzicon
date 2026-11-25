// Independent service illustrations, not traced or modified provider logos.
// Coordinates are on a 128-unit drawing board. Each entry owns its composition.
import { rect, oval, line, polygon, entry } from "./primitives.mjs";
import { expansion } from "./expansion.mjs";
import { cloudArtwork } from "./cloud.mjs";
import { workloadArtwork } from "./workloads.mjs";
import { productivityArtwork } from "./productivity.mjs";
import { fabricArtwork } from "./fabric.mjs";
import { integrationArtwork } from "./integration.mjs";
import { officeArtwork } from "./office.mjs";
import { googleArtwork } from "./google-services.mjs";
import { collaborationArtwork } from "./collaboration.mjs";
import { fabricItemsArtwork } from "./fabric-items.mjs";
import { azureDataArtwork } from "./azure-data.mjs";
import { awsDataArtwork } from "./aws-data.mjs";
import { fabricMoreArtwork } from "./fabric-more.mjs";
import { officeMoreArtwork } from "./office-more.mjs";
import { peopleArtwork } from "./people.mjs";
import { awsIntelligenceArtwork } from "./aws-intelligence.mjs";
import { azureIntelligenceArtwork } from "./azure-intelligence.mjs";
import { fabricProductsArtwork } from "./fabric-products.mjs";
import { awsDeveloperArtwork } from "./aws-developer.mjs";
import { awsBusinessArtwork } from "./aws-business.mjs";
import { officeNavigationArtwork } from "./office-navigation.mjs";
import { officeSymbolsArtwork } from "./office-symbols.mjs";
import { awsNetworkArtwork } from "./aws-network.mjs";
import { googleCategoryArtwork } from "./google-categories.mjs";
import { fabricSymbolArtwork } from "./fabric-symbols.mjs";
import { awsComputeDatabaseArtwork } from "./aws-compute-databases.mjs";
import { awsEdgeComputeArtwork } from "./aws-edge-compute.mjs";
import { azureComputeArtwork } from "./azure-compute.mjs";
import { fabricVisualArtwork } from "./fabric-visuals.mjs";
import { fabricDataSymbolArtwork } from "./fabric-data-symbols.mjs";
import { fabricActionArtwork } from "./fabric-actions.mjs";
import { fabricOperationArtwork } from "./fabric-operations.mjs";
import { fabricLayoutArtwork } from "./fabric-layouts.mjs";
import { fabricCalendarArtwork } from "./fabric-calendars.mjs";
import { fabricDataViewArtwork } from "./fabric-data-views.mjs";

export const artwork = [
  entry("azure-virtual-machine", "azure", "Virtual machine",
    ["10021-icon-service-Virtual-Machine"],
    "A virtual cube runs inside a desktop display.",
    [
      rect(17, 21, 94, 67), line([17, 78], [111, 78]),
      line([64, 32], [82, 42], [82, 62], [64, 72], [46, 62], [46, 42], [64, 32]),
      line([46, 42], [64, 52], [82, 42]), line([64, 52], [64, 72]),
      line([55, 88], [55, 103], [36, 103]),
      line([73, 88], [73, 103], [92, 103]),
    ]),
  entry("azure-kubernetes", "azure", "Kubernetes Service",
    ["10023-icon-service-Kubernetes-Services"],
    "An orchestration wheel supervises a grid of container workloads.",
    [
      rect(14, 17, 40, 32), rect(62, 17, 40, 32), rect(14, 57, 40, 32),
      line([62, 72], [62, 57], [102, 57], [102, 66]),
      line([22, 27], [46, 27]), line([70, 27], [94, 27]), line([22, 67], [46, 67]),
      oval(71, 68, 43, 43), oval(87, 84, 11, 11),
      line([92, 68], [92, 84]), line([92, 95], [92, 111]),
      line([71, 89], [87, 89]), line([98, 89], [114, 89]),
    ]),
  entry("azure-sql-database", "azure", "SQL Database",
    ["10130-icon-service-SQL-Database"],
    "A database cylinder with a relational table, rather than a generic cloud or a caption.",
    [
      line([26, 28], [26, 96], [35, 105], [64, 109], [93, 105], [102, 96], [102, 28]),
      oval(26, 15, 76, 26),
      rect(39, 50, 50, 40), line([39, 63], [89, 63]),
      line([39, 77], [89, 77]), line([55, 50], [55, 90]), line([72, 50], [72, 90]),
    ]),
  entry("azure-cosmos-db", "azure", "Cosmos DB",
    ["10121-icon-service-Azure-Cosmos-DB"],
    "An orbital data system: a central planet, diagonal orbit and two satellite records.",
    [
      oval(36, 34, 57, 57),
      line([18, 87], [17, 75], [36, 53], [74, 31], [104, 26], [114, 33],
        [110, 47], [90, 70], [50, 94], [25, 98], [18, 87]),
      oval(91, 23, 14, 14), oval(23, 84, 12, 12),
      line([55, 44], [47, 53], [46, 64]), line([76, 79], [83, 71]),
    ]),
  entry("azure-key-vault", "azure", "Key Vault",
    ["10245-icon-service-Key-Vaults"],
    "A shield-shaped vault holding a key; protection and secret storage are visible without lettering.",
    [
      line([64, 13], [105, 28], [99, 77], [83, 99], [64, 114], [44, 100], [28, 77], [22, 28], [64, 13]),
      oval(43, 34, 29, 29), line([63, 59], [83, 83], [77, 89]),
      line([73, 71], [82, 64]), line([79, 79], [89, 72]),
    ]),
  entry("azure-storage", "azure", "Storage account",
    ["10086-icon-service-Storage-Accounts"],
    "An open storage crate with a document and a block: heterogeneous objects, not a database.",
    [
      line([20, 51], [63, 68], [108, 50], [108, 99], [64, 115], [20, 97], [20, 51]),
      line([64, 69], [64, 114]),
      line([20, 51], [35, 41]), line([108, 50], [94, 42]),
      rect(35, 17, 32, 37), line([42, 28], [59, 28]), line([42, 37], [58, 37]),
      line([78, 28], [99, 37], [99, 57], [78, 65], [68, 55], [68, 37], [78, 28]),
      line([68, 37], [80, 44], [99, 37]), line([80, 44], [80, 63]),
    ]),
  entry("azure-service-bus", "azure", "Service Bus",
    ["10836-icon-service-Azure-Service-Bus"],
    "A message queue feeding two subscribers; the envelopes carry the messaging meaning.",
    [
      rect(13, 44, 24, 22), line([14, 45], [25, 56], [36, 45]),
      line([38, 55], [49, 55]), rect(49, 33, 31, 48),
      line([56, 43], [73, 43]), line([56, 54], [73, 54]), line([56, 65], [73, 65]),
      line([80, 55], [90, 55], [90, 27], [100, 27]),
      line([90, 55], [90, 94], [100, 94]),
      rect(100, 17, 17, 20), rect(100, 84, 17, 20),
      line([53, 95], [70, 95]), line([63, 89], [70, 95], [63, 101]),
    ]),
  entry("fabric-lakehouse", "fabric", "Lakehouse",
    ["lakehouse_20_item", "lakehouse_24_item", "lakehouse_32_item",
      "lakehouse_40_item", "lakehouse_48_item", "lakehouse_64_item"],
    "A warehouse roof over open water: structured and unstructured data in one place.",
    [
      line([18, 52], [63, 16], [111, 52], [18, 52]),
      line([29, 51], [29, 88]), line([99, 51], [99, 88]),
      rect(43, 52, 40, 23),
      line([14, 91], [28, 85], [43, 91], [58, 85], [73, 91], [89, 85], [112, 91]),
      line([14, 107], [29, 101], [45, 107], [60, 101], [77, 107], [95, 101], [112, 107]),
    ]),
  entry("fabric-pipeline", "fabric", "Data pipeline",
    ["pipeline_20_item", "pipeline_24_item", "pipeline_32_item",
      "pipeline_40_item", "pipeline_48_item", "pipeline_64_item"],
    "A data store feeds a table through a bent pipeline.",
    [
      oval(12, 18, 35, 15), line([12, 25], [12, 51], [18, 56], [41, 56], [47, 51], [47, 25]),
      line([12, 41], [18, 46], [41, 46], [47, 41]),
      line([47, 29], [84, 29], [84, 62]), line([47, 43], [70, 43], [70, 62]),
      line([77, 48], [77, 67]), line([69, 59], [77, 67], [85, 59]),
      rect(52, 67, 55, 42), line([52, 81], [107, 81]), line([52, 95], [107, 95]),
      line([70, 67], [70, 109]), line([89, 67], [89, 109]),
    ]),
  entry("fabric-notebook", "fabric", "Notebook",
    ["notebook_20_item", "notebook_24_item", "notebook_32_item",
      "notebook_40_item", "notebook_48_item", "notebook_64_item",
      ...[16, 20, 24, 32].flatMap((size) =>
        ["filled", "regular"].map((style) => `notebook_code_${size}_${style}`))],
    "A spiral-bound code notebook with a runnable cell and a separate output plot.",
    [
      rect(26, 15, 78, 99), line([39, 16], [39, 113]),
      line([20, 31], [31, 31]), line([20, 51], [31, 51]),
      line([20, 72], [31, 72]), line([20, 93], [31, 93]),
      line([59, 34], [50, 43], [59, 52]), line([82, 34], [91, 43], [82, 52]),
      line([75, 31], [66, 55]),
      polygon([51, 68], [51, 83], [63, 75]),
      line([70, 99], [70, 77], [79, 89], [88, 69], [96, 78]),
    ]),
  entry("entra-id", "entra", "Entra ID",
    ["Microsoft Entra ID BW icon", "Microsoft Entra ID filled BW icon", "Microsoft Entra ID color icon"],
    "A person crossing an identity gate; clearly different from a verified credential.",
    [
      line([16, 109], [16, 18], [64, 18], [64, 109]),
      line([26, 99], [26, 29], [54, 29], [54, 99]),
      oval(75, 35, 24, 24),
      line([65, 96], [69, 77], [78, 66], [95, 66], [105, 78], [109, 96]),
      line([37, 64], [61, 64]), line([50, 54], [61, 64], [50, 73]),
    ]),
  entry("entra-verified-id", "entra", "Entra Verified ID",
    ["Microsoft Entra Verified ID BW icon", "Microsoft Entra Verified ID color icon"],
    "An identity credential with an overlapping verification seal, not the access-gate symbol.",
    [
      rect(12, 24, 94, 67), oval(24, 37, 19, 19),
      line([20, 76], [24, 64], [33, 59], [43, 64], [48, 76]),
      line([58, 41], [94, 41]), line([58, 52], [81, 52]), line([58, 63], [72, 63]),
      line([92, 63], [114, 74], [109, 97], [91, 113], [74, 98], [71, 76], [92, 63]),
      line([80, 86], [88, 94], [103, 78]),
    ]),
  entry("power-automate", "powerplatform", "Power Automate",
    ["PowerAutomate_scalable"],
    "A branching workflow with a decision and loopback; unlike the linear Fabric data pipeline.",
    [
      oval(14, 15, 22, 22), line([36, 26], [63, 26], [63, 43]),
      line([63, 43], [82, 62], [63, 81], [44, 62], [63, 43]),
      line([82, 62], [102, 62], [102, 88]), rect(88, 88, 27, 25),
      line([44, 62], [25, 62], [25, 95], [52, 95], [52, 108]),
      line([52, 108], [16, 108], [16, 46]),
      line([9, 54], [16, 46], [23, 54]),
    ]),
  entry("power-apps", "powerplatform", "Power Apps",
    ["PowerApps_scalable"],
    "An app canvas assembled from draggable interface blocks, with one tile lifted out of the screen.",
    [
      rect(18, 26, 78, 84), line([18, 42], [95, 42]),
      rect(28, 53, 22, 20), rect(28, 81, 22, 18),
      line([59, 81], [85, 81]), line([59, 92], [79, 92]),
      line([80, 12], [109, 19], [102, 49], [73, 42], [80, 12]),
      line([93, 54], [68, 66]), line([78, 66], [68, 66], [72, 57]),
    ]),
  entry("power-dataverse", "powerplatform", "Dataverse",
    ["Dataverse_scalable"],
    "Three related data tables joined through a central relationship; no generic database cylinder.",
    [
      rect(12, 18, 41, 30), line([12, 29], [53, 29]), line([26, 18], [26, 48]),
      rect(79, 41, 37, 31), line([79, 51], [116, 51]), line([91, 41], [91, 72]),
      rect(21, 84, 43, 29), line([21, 94], [64, 94]), line([36, 84], [36, 113]),
      line([53, 34], [65, 34], [65, 58], [79, 58]),
      line([65, 58], [65, 71], [44, 71], [44, 84]),
      oval(60, 53, 10, 10),
    ]),
  entry("dynamics-sales", "dynamics365", "Dynamics 365 Sales",
    ["Sales_scalable"],
    "A sales funnel resolving into an upward opportunity arrow; deliberately unlike the finance ledger.",
    [
      line([16, 19], [99, 19], [70, 58], [70, 86], [47, 100], [47, 58], [16, 19]),
      line([29, 35], [86, 35]),
      line([82, 106], [98, 91], [98, 60]),
      line([88, 71], [98, 60], [110, 71]),
    ]),
  entry("dynamics-field-service", "dynamics365", "Dynamics 365 Field Service",
    ["FieldService_scalable"],
    "A location marker holding a service tool, communicating work performed at a customer site.",
    [
      line([64, 116], [27, 63], [24, 41], [34, 22], [54, 12], [76, 12],
        [97, 25], [104, 44], [99, 64], [64, 116]),
      line([47, 31], [44, 45], [52, 54], [75, 78], [84, 69], [61, 46],
        [64, 31], [55, 39], [47, 31]),
      oval(48, 119, 31, 3),
    ]),
  entry("dynamics-business-central", "dynamics365", "Dynamics 365 Business Central",
    ["BusinessCentral_scalable"],
    "A central ledger connecting inventory and money: an integrated business hub, not a sales funnel.",
    [
      rect(38, 25, 50, 77), line([48, 26], [48, 101]),
      line([55, 42], [79, 42]), line([55, 54], [79, 54]), line([55, 66], [70, 66]),
      line([9, 50], [23, 43], [35, 50], [35, 69], [22, 76], [9, 69], [9, 50]),
      line([9, 50], [22, 57], [35, 50]), line([22, 57], [22, 76]),
      line([88, 64], [97, 64]), oval(97, 51, 24, 24),
      line([109, 57], [109, 69]), line([104, 63], [114, 63]),
      line([63, 14], [63, 25]), line([63, 103], [63, 115]),
    ]),
  entry("m365-upload", "microsoft365", "Upload",
    ["Arrow Upload"],
    "An upward arrow leaving an open tray; direction is semantic, never randomized.",
    [
      line([21, 76], [21, 107], [106, 107], [106, 76]),
      line([51, 83], [51, 48], [32, 48], [64, 14], [96, 48], [77, 48], [77, 83], [51, 83]),
      line([33, 95], [45, 95]), line([85, 95], [96, 95]),
    ]),
  entry("m365-download", "microsoft365", "Download",
    ["Arrow Download"],
    "A downward arrow entering a receiving tray; intentionally paired with, but distinct from, Upload.",
    [
      line([19, 79], [19, 109], [108, 109], [108, 79]),
      line([51, 16], [77, 16], [77, 58], [96, 58], [64, 91], [32, 58], [51, 58], [51, 16]),
      line([28, 99], [41, 99]), line([86, 99], [99, 99]),
    ]),
  ...expansion,
  ...cloudArtwork,
  ...workloadArtwork,
  ...productivityArtwork,
  ...fabricArtwork,
  ...integrationArtwork,
  ...officeArtwork,
  ...googleArtwork,
  ...collaborationArtwork,
  ...fabricItemsArtwork,
  ...azureDataArtwork,
  ...awsDataArtwork,
  ...fabricMoreArtwork,
  ...officeMoreArtwork,
  ...peopleArtwork,
  ...awsIntelligenceArtwork,
  ...azureIntelligenceArtwork,
  ...fabricProductsArtwork,
  ...awsDeveloperArtwork,
  ...awsBusinessArtwork,
  ...officeNavigationArtwork,
  ...officeSymbolsArtwork,
  ...awsNetworkArtwork,
  ...googleCategoryArtwork,
  ...fabricSymbolArtwork,
  ...awsComputeDatabaseArtwork,
  ...awsEdgeComputeArtwork,
  ...azureComputeArtwork,
  ...fabricVisualArtwork,
  ...fabricDataSymbolArtwork,
  ...fabricActionArtwork,
  ...fabricOperationArtwork,
  ...fabricLayoutArtwork,
  ...fabricCalendarArtwork,
  ...fabricDataViewArtwork,
];

export const accents = {
  azure: "#1971c2", fabric: "#087f5b", entra: "#0b7285",
  powerplatform: "#6741d9", dynamics365: "#364fc7", microsoft365: "#5f3dc4",
  aws: "#b25b00", gcp: "#137333",
};
