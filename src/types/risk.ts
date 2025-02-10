
export type RiskLevel = "low" | "medium" | "high" | "critical";

export type Division = "B2B" | "B2C" | "B2E";

export type RiskAssessment = {
  id: string;
  serviceName: string;
  serviceDescription: string;
  division: Division;
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
  "Security",
  "Privacy",
  "Operational",
  "Financial",
  "Compliance",
  "Technical",
  "Strategic",
] as const;

export const DATA_CLASSIFICATIONS = [
  "Public",
  "Internal",
  "Confidential",
  "Restricted",
] as const;

export const DIVISIONS = ["B2B", "B2C", "B2E"] as const;
