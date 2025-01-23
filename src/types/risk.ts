export type RiskLevel = "low" | "medium" | "high" | "critical";

export type RiskAssessment = {
  id: string;
  serviceName: string;
  serviceDescription: string;
  riskCategory: string;
  riskDescription: string;
  riskLevel: RiskLevel;
  impact: string;
  mitigation: string;
  dataClassification: string;
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