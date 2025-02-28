import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRiskAssessments } from "@/hooks/useRiskAssessments";
import { useServices } from "@/hooks/useServices";
import { useServiceDetails } from "@/hooks/useServiceDetails";
import { useAuth } from "@/components/AuthProvider";
import { 
  AlertCircle, 
  Clock, 
  Database, 
  Globe, 
  Map, 
  Shield, 
  ShieldAlert, 
  Hourglass 
} from "lucide-react";

const CISOReporting = () => {
  const { user } = useAuth();
  const { data: assessments = [] } = useRiskAssessments(user?.id);
  const { data: services = [] } = useServices();
  const { getServiceDetails } = useServiceDetails();

  // Mock data for B2B Division and Zeus Team
  const division = "B2B";
  const team = "Zeus";

  // Initial mock metrics with realistic values
  const [metrics, setMetrics] = useState({
    numberOfProducts: 12,
    globalRevenueRisks: 3,
    localRevenueRisks: 7,
    customRisks: 4,
    daysSinceLastAssessment: 14,
    risksWithoutControls: 5,
    medianRecoveryTime: 24,
    piRiskScore: 78
  });

  useEffect(() => {
    if (assessments.length > 0 && services.length > 0) {
      // Filter assessments for B2B division and Zeus team
      const divisionServices = services.filter(service => {
        const details = getServiceDetails(service.id);
        return details.division === division && details.team === team;
      });

      const divisionServiceIds = divisionServices.map(s => s.id);
      const relevantAssessments = assessments.filter(a => 
        divisionServiceIds.includes(a.serviceId)
      );

      // If we have real data, calculate metrics from it
      if (relevantAssessments.length > 0) {
        // Calculate metrics
        const numberOfProducts = divisionServices.length;
        
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
          piRiskScore
        });
      }
      // Otherwise, we keep the mock metrics
    }
  }, [assessments, services, getServiceDetails]);

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

      <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-md">
        <p className="text-amber-800 text-sm font-medium">
          Note: This is a mock report based on sample data. In a production environment, 
          this would be connected to real-time risk assessment data and compliance metrics.
        </p>
      </div>
    </div>
  );
};

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description: string;
}

const MetricCard = ({ title, value, icon, description }: MetricCardProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
};

export default CISOReporting;
