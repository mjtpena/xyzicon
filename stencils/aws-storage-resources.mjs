import { rect, oval, line, entry } from "./primitives.mjs";

export const awsStorageResourcesArtwork = [
  entry("aws-backup-plan", "aws", "Backup Plan", ["Res_AWS-Backup_Backup-Plan_48"],
    "A backup plan schedules recurring recovery points.",
    [
      line([19, 16], [78, 16], [90, 28], [90, 92], [19, 92], [19, 16]), line([78, 16], [78, 28], [90, 28]),
      line([28, 38], [60, 38]), line([28, 48], [52, 48]), oval(55, 55, 26, 26), line([68, 61], [68, 69], [75, 73]), line([14, 109], [110, 109]),
    ]),
  entry("aws-backup-restore-resource", "aws", "Backup Restore", ["Res_AWS-Backup_Backup-Restore_48"],
    "A saved recovery point restores data to a database.",
    [
      oval(42, 33, 39, 13), line([42, 39], [42, 70], [47, 74], [55, 76], [68, 76], [76, 74], [81, 70], [81, 39]), line([42, 52], [47, 56], [55, 58], [68, 58], [76, 56], [81, 52]),
      line([98, 43], [94, 29], [84, 19], [70, 14], [54, 14], [40, 19], [30, 29]), line([29, 19], [30, 29], [40, 29]),
      line([24, 55], [28, 69], [38, 80], [52, 86], [67, 86], [81, 81], [91, 72]), line([91, 82], [91, 72], [81, 72]), line([14, 109], [110, 109]),
    ]),
  entry("aws-backup-vault-resource", "aws", "Backup Vault", ["Res_AWS-Backup_Backup-Vault_48"],
    "A vault stores protected recovery points.",
    [
      rect(20, 17, 83, 75), line([27, 24], [96, 24], [96, 85], [27, 85], [27, 24]),
      oval(42, 34, 39, 39), oval(54, 46, 15, 15), line([61, 34], [61, 46]), line([61, 61], [61, 73]), line([42, 53], [54, 53]), line([69, 53], [81, 53]), line([14, 109], [110, 109]),
    ]),
  entry("aws-backup-vault-lock", "aws", "Backup Vault Lock", ["Res_AWS-Backup_Vault-Lock_48"],
    "A locked vault protects immutable backups.",
    [
      rect(15, 20, 71, 68), line([22, 27], [79, 27], [79, 81], [22, 81], [22, 27]), oval(34, 38, 30, 30), line([49, 38], [49, 68]), line([34, 53], [64, 53]),
      rect(75, 58, 31, 26), line([81, 58], [81, 50], [84, 45], [90, 43], [96, 45], [100, 50], [100, 58]), oval(88, 66, 6, 6, true), line([14, 109], [110, 109]),
    ]),
  entry("aws-backup-legal-hold", "aws", "Backup Legal Hold", ["Res_AWS-Backup_Legal-Hold_48"],
    "A legal hold preserves a recovery point.",
    [
      oval(14, 26, 35, 13), line([14, 32], [14, 74], [19, 78], [27, 80], [36, 80], [44, 78], [49, 74], [49, 32]), line([14, 48], [19, 52], [27, 54], [36, 54], [44, 52], [49, 48]),
      line([65, 36], [94, 65]), line([70, 27], [84, 41]), line([65, 32], [79, 46]), line([86, 59], [100, 73]), line([81, 64], [95, 78]), line([76, 84], [108, 84]), line([14, 109], [110, 109]),
    ]),
  entry("aws-backup-audit-manager", "aws", "Backup Audit Manager", ["Res_AWS-Backup_Audit-Manager_48"],
    "A magnifier inspects backup activity.",
    [
      line([15, 18], [70, 18], [80, 28], [80, 86], [15, 86], [15, 18]), line([70, 18], [70, 28], [80, 28]), line([24, 39], [65, 39]), line([24, 50], [57, 50]), line([24, 61], [49, 61]),
      oval(56, 49, 29, 29), line([78, 71], [105, 97]), line([14, 111], [110, 111]),
    ]),
  entry("aws-backup-compliance-report", "aws", "Backup Compliance Reporting", ["Res_AWS-Backup_Compliance-Reporting_48"],
    "A backup report records compliance checks.",
    [
      rect(20, 19, 79, 72), line([42, 19], [42, 12], [77, 12], [77, 19]), line([30, 36], [36, 42], [45, 31]), line([52, 37], [88, 37]),
      line([30, 54], [36, 60], [45, 49]), line([52, 55], [88, 55]), line([30, 72], [36, 78], [45, 67]), line([52, 73], [88, 73]), line([14, 109], [110, 109]),
    ]),
  entry("aws-backup-recovery-point-objective", "aws", "Backup Recovery Point Objective", ["Res_AWS-Backup_Recovery-Point-Objective_48"],
    "A timeline marks the allowable age of a recovery point.",
    [
      line([16, 59], [106, 59]), line([16, 50], [16, 68]), line([106, 50], [106, 68]), oval(36, 50, 18, 18), line([45, 50], [45, 33]), line([34, 29], [56, 29]),
      line([87, 47], [87, 71]), line([81, 47], [93, 47]), line([81, 71], [93, 71]), line([59, 82], [93, 82]), line([65, 77], [59, 82], [65, 87]), line([14, 109], [110, 109]),
    ]),
  entry("aws-backup-recovery-time-objective", "aws", "Backup Recovery Time Objective", ["Res_AWS-Backup_Recovery-Time-Objective_48"],
    "A stopwatch measures the time allowed for recovery.",
    [
      oval(28, 24, 66, 66), line([61, 24], [61, 15]), line([50, 15], [72, 15]), line([84, 31], [91, 24]), line([61, 35], [61, 57], [75, 66]), oval(58, 54, 6, 6, true),
      line([15, 46], [25, 46]), line([11, 56], [24, 56]), line([15, 66], [25, 66]), line([14, 109], [110, 109]),
    ]),
  entry("aws-backup-gateway-resource", "aws", "Backup Gateway", ["Res_AWS-Backup_Gateway_48"],
    "A gateway transfers backups from an on-premises server.",
    [
      rect(12, 31, 32, 46), line([12, 42], [44, 42]), line([19, 51], [37, 51]), line([19, 61], [34, 61]),
      line([44, 52], [56, 52]), line([51, 47], [56, 52], [51, 57]), line([61, 80], [61, 39], [68, 30], [77, 27], [86, 30], [93, 39], [93, 80]), line([55, 80], [100, 80]), line([14, 109], [110, 109]),
    ]),
];
