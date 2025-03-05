
import React from "react";
import { 
  Clock, 
  AlertCircle, 
  Network, 
  Plug, 
  FileWarning, 
  ServerCrash, 
  LifeBuoy 
} from "lucide-react";
import { MetricCard } from "./MetricCard";

interface EngineeringRisksData {
  criticalPatchesMissing: number;
  highCvssVulnerabilities: number;
  eolSystemsPercentage: number;
  unsupportedSystems: number;
  averageVulnerabilityAge: number;
  dependencyVulnerabilities: number;
  unmanagedDevices: number;
}

interface EngineeringRiskMetricsProps {
  engineeringRisks: EngineeringRisksData;
}

export const EngineeringRiskMetrics = ({ engineeringRisks }: EngineeringRiskMetricsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard 
        title="Critical Patches Missing" 
        value={engineeringRisks.criticalPatchesMissing} 
        icon={<Plug className="h-5 w-5 text-red-500" />} 
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
  );
};
