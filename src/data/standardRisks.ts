export const standardRisks = [
  {
    name: "Administrator unintentionally introduces significant bug into production software",
    category: "Error",
    description: "Production bug introduced by administrative error",
    lossEventCategory: "Execution, Delivery & Process Management"
  },
  {
    name: "Vulnerable component gets deployed to production environment",
    category: "Error",
    description: "Security vulnerability introduced in production",
    lossEventCategory: "Execution, Delivery & Process Management"
  },
  {
    name: "Unauthorized internal access to confidential information",
    category: "Error",
    description: "Internal unauthorized access to sensitive data",
    lossEventCategory: "Internal Fraud"
  },
  {
    name: "Unauthorized external or partner access to confidential information",
    category: "Error",
    description: "External unauthorized access to sensitive data",
    lossEventCategory: "External Fraud"
  },
  {
    name: "Third party dependency disrupts core component",
    category: "Failure",
    description: "Critical dependency failure affecting core functionality",
    lossEventCategory: "Business Disruption and System Failures"
  },
  {
    name: "Unable to provide data to other internal products",
    category: "Failure",
    description: "Data provision failure to internal systems",
    lossEventCategory: "Business Disruption and System Failures"
  },
  {
    name: "Unable to get data from other internal products",
    category: "Failure",
    description: "Data retrieval failure from internal systems",
    lossEventCategory: "Business Disruption and System Failures"
  },
  {
    name: "Insufficient Monitoring and Alerting",
    category: "Failure",
    description: "Inadequate system monitoring and alert mechanisms",
    lossEventCategory: "Business Disruption and System Failures"
  },
  {
    name: "Resource exhaustion (CPU, memory, storage)",
    category: "Failure",
    description: "System resource depletion",
    lossEventCategory: "Business Disruption and System Failures"
  },
  {
    name: "Malfunction causes violation of compliance frameworks like GDPR, NIS2, PCI-DSS",
    category: "Failure",
    description: "Compliance violation due to system malfunction",
    lossEventCategory: "Clients, Products & Business Practices"
  },
  {
    name: "An attacker exposes PI data",
    category: "Malicious",
    description: "Malicious exposure of personal information",
    lossEventCategory: "External Fraud"
  },
  {
    name: "Data is intentionally compromised by insider",
    category: "Malicious",
    description: "Intentional internal data compromise",
    lossEventCategory: "Internal Fraud"
  }
];
