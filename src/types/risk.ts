
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
  riskLevel: RiskLevel;
  impact: string;
  mitigation: string;
  dataClassification: string;
  riskOwner: string;
  createdAt: Date;
};

export const RISK_CATEGORIES = [
  "Error",
  "Failure",
  "Malicious",
] as const;

export const DATA_CLASSIFICATIONS = [
  "Public",
  "Internal",
  "Confidential",
  "Restricted",
] as const;
