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
  EuroIcon,
  DollarSign,
  Plugin,
  FileWarning,
  Network,
  ServerCrash,
  LifeBuoy
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { PieChart, Pie, Cell as PieCell, Tooltip as PieTooltip } from 'recharts';

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

  // Format number with Euro symbol
  const formatEuro = (value: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(value);
  };

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
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg">Financial Loss by Cost Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={financialLossByType}
                margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
              >
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={70} 
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  tickFormatter={(value) => `€${value / 1000}k`} 
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  formatter={(value) => [formatEuro(value as number), "Amount"]}
                  labelStyle={{ fontWeight: "bold" }}
                />
                <Legend verticalAlign="top" height={36} />
                <Bar dataKey="amount" name="Amount (€)">
                  {financialLossByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            <p>
              <span className="font-medium">Total potential financial loss:</span> {formatEuro(financialLossByType.reduce((sum, item) => sum + item.amount, 0))}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* New Engineering Risks Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CVSS Severity Distribution */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <FileWarning className="h-5 w-5 text-red-500 mr-2" />
              CVSS Vulnerability Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={cvssSeverity}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {cvssSeverity.map((entry, index) => (
                      <PieCell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <PieTooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              <p>
                <span className="font-medium">Total vulnerabilities:</span> {cvssSeverity.reduce((sum, item) => sum + item.value, 0)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* EOL Systems by Category */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <ServerCrash className="h-5 w-5 text-orange-500 mr-2" />
              End-of-Life Systems by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={eolSystems}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={150} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" name="Number of Systems">
                    {eolSystems.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              <p>
                <span className="font-medium">Total EOL systems:</span> {eolSystems.reduce((sum, item) => sum + item.count, 0)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Engineering Risk Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Critical Patches Missing" 
          value={engineeringRisks.criticalPatchesMissing} 
          icon={<Plugin className="h-5 w-5 text-red-500" />} 
          description="Systems with critical security patches missing" 
        />
        
        <MetricCard 
          title="High CVSS Vulnerabilities" 
          value={engineeringRisks.highCvssVulnerabilities} 
          icon={<FileWarning className="h-5 w-5 text-orange-500" />} 
          description="Systems with CVSS score > 7.0" 
        />
        
        <MetricCard 
          title="EOL Systems" 
          value={`${engineeringRisks.eolSystemsPercentage}%`} 
          icon={<ServerCrash className="h-5 w-5 text-amber-500" />} 
          description="Percentage of systems past end-of-life" 
        />
        
        <MetricCard 
          title="Unsupported Systems" 
          value={engineeringRisks.unsupportedSystems} 
          icon={<LifeBuoy className="h-5 w-5 text-purple-500" />} 
          description="Systems without valid support contracts" 
        />
        
        <MetricCard 
          title="Avg. Vulnerability Age" 
          value={`${engineeringRisks.averageVulnerabilityAge} days`} 
          icon={<Clock className="h-5 w-5 text-blue-500" />} 
          description="Average age of open vulnerabilities" 
        />
        
        <MetricCard 
          title="Dependency Vulnerabilities" 
          value={engineeringRisks.dependencyVulnerabilities} 
          icon={<AlertCircle className="h-5 w-5 text-indigo-500" />} 
          description="Components with dependency issues" 
        />
        
        <MetricCard 
          title="Unmanaged Devices" 
          value={engineeringRisks.unmanagedDevices} 
          icon={<Network className="h-5 w-5 text-emerald-500" />} 
          description="Devices without management agents" 
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

// A Euro icon component since EuroIcon isn't available in lucide-react
const Euro = ({ className }: { className?: string }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M4 10h12" />
      <path d="M4 14h9" />
      <path d="M19 6a7.7 7.7 0 0 0-5.2-2A7.9 7.9 0 0 0 6 12c0 4.4 3.5 8 7.8 8 2 0 3.8-.8 5.2-2" />
    </svg>
  );
};

export default CISOReporting;
