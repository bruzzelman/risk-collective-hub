
export type RiskLevel = "low" | "medium" | "high" | "critical";

export type Team = {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  createdBy: string;
};

export type Division = {
  id: string;
  name: string;
  description?: string;
  teamId: string;
  parentDivisionId?: string;
  createdAt: Date;
  createdBy: string;
};

export type Service = {
  id: string;
  name: string;
  description?: string;
  divisionId?: string;
  teamId?: string;
  createdAt: Date;
  createdBy: string;
};

export type RiskAssessment = {
  id: string;
  serviceId: string;
  riskCategory: string;
  riskDescription: string;
  dataInterface: string;
  dataLocation: string;
  likelihoodPerYear: number;
  riskLevel: RiskLevel;
  impact: string;
  mitigation: string;
  dataClassification: string;
  riskOwner: string;
  createdAt: Date;
  divisionId?: string;
  hasGlobalRevenueImpact: boolean;
  globalRevenueImpactHours?: number;
};

export const RISK_CATEGORIES = [
  "Error",
  "Failure",
  "Malicious",
] as const;

export const DATA_INTERFACES = [
  "API",
  "Application code",
  "Command Line",
  "Database",
  "Email & Notification Interfaces",
  "File-Based",
  "Hardware Interfaces",
  "Layer 8",
  "Message Queue",
  "Not applicable",
  "Other",
  "Web"
] as const;

export const DATA_LOCATIONS = [
  "Appliction database",
  "Cloud architechture",
  "CRM",
  "Data lake",
  "Data warehouse",
  "Email archives",
  "Event streaming",
  "Local file system",
  "Not applicable",
  "Object storage",
  "Other",
  "Search indexes",
  "Appliction level",
  "Code repository"
] as const;

export const DATA_CLASSIFICATIONS = [
  "Public",
  "Internal",
  "Confidential",
  "Restricted",
] as const;
