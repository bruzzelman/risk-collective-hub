import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRiskAssessments } from "@/hooks/useRiskAssessments";
import { useProducts } from "@/hooks/useServices";
import { useProductDetails } from "@/hooks/useServiceDetails";
import { useAuth } from "@/components/AuthProvider";
import { 
  AlertCircle, 
  Clock, 
  Database, 
  Globe, 
  Map, 
  Shield, 
  ShieldAlert, 
  Hourglass,
  DollarSign,
  FileWarning,
  Network,
  ServerCrash,
  LifeBuoy
} from "lucide-react";
import { MetricCard } from "./MetricCard";
import { FinancialLossWidget } from "./FinancialLossWidget";
import { VulnerabilityDistributionWidget } from "./VulnerabilityDistributionWidget";
import { EOLSystemsWidget } from "./EOLSystemsWidget";
import { EngineeringRiskMetrics } from "./EngineeringRiskMetrics";
import { Euro } from "../icons/Euro";

const CISOReporting = () => {
  const { user } = useAuth();
  const { data: assessments = [] } = useRiskAssessments(user?.id);
  const { data: products = [] } = useProducts();
  const { getProductDetails } = useProductDetails();

  // Mock data for B2B Division and Zeus Team
  const division = "B2B";
  const team = "Zeus";

  // Initial mock metrics with realistic values
  const [metrics, setMetrics] = useState({
    numberOfProducts: 12,
    globalRevenueRisks: 3,
    localRevenueRisks: 7,
    customRisks: 13,
    daysSinceLastAssessment: 14,
    risksWithoutControls: 23,
    medianRecoveryTime: 24,
    piRiskScore: 78,
    estimatedGlobalRevenueRisk: "900k €",
    estimatedLocalRevenueRisk: "400k €"
  });

  // Financial loss by cost type mock data
  const [financialLossByType, setFinancialLossByType] = useState([
    { name: 'GDPR Fines', amount: 450000, color: '#FF6B6B' },
    { name: 'LGPD Fines', amount: 120000, color: '#FF9E5E' },
    { name: 'CCPA Penalties', amount: 95000, color: '#FFD166' },
    { name: 'Settlements', amount: 350000, color: '#4ECDC4' },
    { name: 'Remediation', amount: 280000, color: '#1A535C' },
    { name: 'Legal Fees', amount: 175000, color: '#7B68EE' },
    { name: 'Other', amount: 80000, color: '#9EB0C9' }
  ]);

  // Engineering risks mock data
  const [engineeringRisks, setEngineeringRisks] = useState({
    // Systems with critical patches missing
    criticalPatchesMissing: 12,
    // Systems with high CVSS score vulnerabilities
    highCvssVulnerabilities: 18,
    // Percentage of EOL systems
    eolSystemsPercentage: 23,
    // Systems without valid support contracts
    unsupportedSystems: 8,
    // Average age of security vulnerabilities in days
    averageVulnerabilityAge: 47,
    // Number of components with dependency vulnerabilities
    dependencyVulnerabilities: 34,
    // Number of unmanaged devices on network
    unmanagedDevices: 7
  });

  // CVSS score distribution
  const [cvssSeverity, setCvssSeverity] = useState([
    { name: 'Critical (9.0-10.0)', value: 6, color: '#D32F2F' },
    { name: 'High (7.0-8.9)', value: 12, color: '#FF5722' },
    { name: 'Medium (4.0-6.9)', value: 23, color: '#FFC107' },
    { name: 'Low (0.1-3.9)', value: 15, color: '#4CAF50' },
    { name: 'None (0.0)', value: 9, color: '#2196F3' }
  ]);

  // EOL systems by category
  const [eolSystems, setEolSystems] = useState([
    { name: 'Operating Systems', count: 5, color: '#9C27B0' },
    { name: 'Databases', count: 3, color: '#673AB7' },
    { name: 'Application Servers', count: 7, color: '#3F51B5' },
    { name: 'Network Equipment', count: 4, color: '#00BCD4' },
    { name: 'Container Images', count: 9, color: '#009688' }
  ]);

  useEffect(() => {
    if (assessments.length > 0 && products.length > 0) {
      // Filter assessments for B2B division and Zeus team
      const divisionProducts = products.filter(product => {
        const details = getProductDetails(product.id);
        return details.division === division && details.team === team;
      });

      const divisionProductIds = divisionProducts.map(p => p.id);
      const relevantAssessments = assessments.filter(a => 
        divisionProductIds.includes(a.serviceId)
      );

      // If we have real data, calculate metrics from it
      if (relevantAssessments.length > 0) {
        // Calculate metrics
        const numberOfProducts = divisionProducts.length;
        
        const globalRevenueRisks = relevantAssessments.filter(
          a => a.hasGlobalRevenueImpact
        ).length;
        
        const localRevenueRisks = relevantAssessments.filter(
          a => a.hasLocalRevenueImpact
        ).length;
        
        // For demo purposes, assume custom risks are ones with non-standard categories
        const standardCategories = ["Error", "Failure", "Malicious"];
        const customRisks = relevantAssessments.filter(
          a => !standardCategories.includes(a.riskCategory)
        ).length;
        
        // Calculate days since last assessment
        const lastAssessmentDate = relevantAssessments.length > 0 
          ? Math.max(...relevantAssessments.map(a => a.createdAt.getTime()))
          : Date.now();
        const daysSinceLastAssessment = Math.floor(
          (Date.now() - lastAssessmentDate) / (1000 * 60 * 60 * 24)
        );
        
        // Risks without compensating controls (empty mitigation field)
        const risksWithoutControls = relevantAssessments.filter(
          a => !a.mitigation || a.mitigation.trim() === ""
        ).length;
        
        // Calculate median recovery time (hours to remediate)
        const remediationTimes = relevantAssessments
          .map(a => a.hoursToRemediate)
          .filter(hours => hours !== undefined)
          .sort((a, b) => (a || 0) - (b || 0));
        
        let medianRecoveryTime = 0;
        if (remediationTimes.length > 0) {
          const mid = Math.floor(remediationTimes.length / 2);
          medianRecoveryTime = remediationTimes.length % 2 === 0
            ? ((remediationTimes[mid - 1] || 0) + (remediationTimes[mid] || 0)) / 2
            : (remediationTimes[mid] || 0);
        }
        
        // Calculate PI risk score - higher score for more PI data at risk
        // This is a simplified mock calculation
        const piRiskScore = relevantAssessments.reduce((score, assessment) => {
          if (assessment.piDataAtRisk === "yes") {
            switch (assessment.piDataAmount) {
              case "more_than_99m": return score + 100;
              case "between_1m_and_99m": return score + 50;
              case "less_than_1m": return score + 10;
              default: return score + 5;
            }
          }
          return score;
        }, 0);
        
        setMetrics({
          numberOfProducts,
          globalRevenueRisks,
          localRevenueRisks,
          customRisks,
          daysSinceLastAssessment,
          risksWithoutControls,
          medianRecoveryTime,
          piRiskScore,
          estimatedGlobalRevenueRisk: "900k €",
          estimatedLocalRevenueRisk: "400k €"
        });
      }
      // Otherwise, we keep the mock metrics
    }
  }, [assessments, products, getProductDetails]);

  console.log("CISO Report Metrics:", metrics);

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <h2 className="text-2xl font-bold">CISO Report: {division} Division - {team} Team</h2>
        <p className="text-muted-foreground">Security risk overview and metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Products" 
          value={metrics.numberOfProducts} 
          icon={<Database className="h-5 w-5 text-blue-500" />} 
          description="Total managed products" 
        />
        
        <MetricCard 
          title="Global Revenue Risks" 
          value={metrics.globalRevenueRisks} 
          icon={<Globe className="h-5 w-5 text-red-500" />} 
          description="Risks with global impact" 
        />
        
        <MetricCard 
          title="Local Revenue Risks" 
          value={metrics.localRevenueRisks} 
          icon={<Map className="h-5 w-5 text-orange-500" />} 
          description="Risks with local impact" 
        />
        
        <MetricCard 
          title="Custom Risks" 
          value={metrics.customRisks} 
          icon={<AlertCircle className="h-5 w-5 text-purple-500" />} 
          description="Non-standard risk categories" 
        />
        
        <MetricCard 
          title="Est. Global Revenue Risk" 
          value={metrics.estimatedGlobalRevenueRisk} 
          icon={<Euro className="h-5 w-5 text-red-600" />} 
          description="Potential financial impact globally" 
        />
        
        <MetricCard 
          title="Est. Local Revenue Risk" 
          value={metrics.estimatedLocalRevenueRisk} 
          icon={<Euro className="h-5 w-5 text-orange-600" />} 
          description="Potential financial impact locally" 
        />
        
        <MetricCard 
          title="Days Since Last Assessment" 
          value={metrics.daysSinceLastAssessment} 
          icon={<Clock className="h-5 w-5 text-gray-500" />} 
          description="Time since last risk review" 
        />
        
        <MetricCard 
          title="Missing Controls" 
          value={metrics.risksWithoutControls} 
          icon={<ShieldAlert className="h-5 w-5 text-yellow-500" />} 
          description="Risks without compensating controls" 
        />
        
        <MetricCard 
          title="Median Recovery Time" 
          value={`${metrics.medianRecoveryTime} hrs`} 
          icon={<Hourglass className="h-5 w-5 text-green-500" />} 
          description="Typical remediation time" 
        />
        
        <MetricCard 
          title="PI Risk Score" 
          value={metrics.piRiskScore} 
          icon={<Shield className="h-5 w-5 text-indigo-500" />} 
          description="Personal information risk exposure" 
        />
      </div>

      {/* Financial Loss by Cost Type Widget */}
      <FinancialLossWidget financialLossByType={financialLossByType} />

      {/* Engineering Risk Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <VulnerabilityDistributionWidget cvssSeverity={cvssSeverity} />
        <EOLSystemsWidget eolSystems={eolSystems} />
      </div>

      {/* Engineering Risk Metrics */}
      <EngineeringRiskMetrics engineeringRisks={engineeringRisks} />

      <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-md">
        <p className="text-amber-800 text-sm font-medium">
          Note: This is a mock report based on sample data. In a production environment, 
          this would be connected to real-time risk assessment data and compliance metrics.
        </p>
      </div>
    </div>
  );
};

export default CISOReporting;
