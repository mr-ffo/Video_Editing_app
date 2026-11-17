import type { KeywordDefinition } from "../../types/callout";

export const KEYWORD_DICTIONARY: KeywordDefinition[] = [
  // Storage & Archiving
  {
    id: "s3",
    label: "Amazon S3",
    icon: "🪣",
    category: "storage",
    color: "#f59e0b",
    badge: "Object Storage",
    keywords: ["s3", "amazon s3", "s3 bucket", "bucket", "simple storage service"],
  },
  {
    id: "glacier",
    label: "S3 Glacier",
    icon: "🧊",
    category: "archive",
    color: "#38bdf8",
    badge: "Cold Storage",
    keywords: ["glacier", "s3 glacier", "glacier flexible", "deep archive", "archive storage", "glazier"],
  },

  // FinOps & Business
  {
    id: "cost-savings",
    label: "Cost Optimization",
    icon: "💰",
    category: "cost",
    color: "#10b981",
    badge: "FinOps",
    keywords: ["cost", "reduce money", "reduce costs", "cost savings", "pricing", "finops", "save money", "budget"],
  },
  {
    id: "business-requirements",
    label: "Business Requirements",
    icon: "📋",
    category: "business",
    color: "#f59e0b",
    badge: "Governance",
    keywords: ["business requirement", "business requirements", "business", "sla", "compliance", "policy", "requirements"],
  },

  // Security & Identity
  {
    id: "iam",
    label: "IAM & Security",
    icon: "🛡️",
    category: "security",
    color: "#ef4444",
    badge: "Zero Trust",
    keywords: ["iam", "security", "permissions", "identity", "auth", "rbac", "access control"],
  },

  // Compute & Serverless
  {
    id: "lambda",
    label: "AWS Lambda",
    icon: "⚡",
    category: "compute",
    color: "#f97316",
    badge: "Serverless",
    keywords: ["lambda", "serverless", "function", "event-driven", "faas"],
  },
  {
    id: "ec2",
    label: "Amazon EC2",
    icon: "🖥️",
    category: "compute",
    color: "#f97316",
    badge: "Compute",
    keywords: ["ec2", "virtual machine", "server", "compute instance"],
  },

  // Database
  {
    id: "dynamodb",
    label: "Amazon DynamoDB",
    icon: "🗄️",
    category: "database",
    color: "#3b82f6",
    badge: "NoSQL DB",
    keywords: ["dynamodb", "database", "nosql", "dynamo", "key-value"],
  },

  // DevOps & IaC
  {
    id: "iac",
    label: "Infrastructure as Code",
    icon: "🏗️",
    category: "devops",
    color: "#844fba",
    badge: "Automation",
    keywords: ["terraform", "iac", "cdk", "cloudformation", "infrastructure as code", "deployment"],
  },
  {
    id: "docker",
    label: "Docker Containers",
    icon: "🐳",
    category: "devops",
    color: "#2496ed",
    badge: "Containers",
    keywords: ["docker", "containers", "container", "containerization", "dockerfile"],
  },
  {
    id: "kubernetes",
    label: "Kubernetes",
    icon: "☸️",
    category: "devops",
    color: "#326ce5",
    badge: "Orchestration",
    keywords: ["kubernetes", "k8s", "eks", "cluster", "pods"],
  },

  // Networking
  {
    id: "api-gateway",
    label: "Amazon API Gateway",
    icon: "🌐",
    category: "network",
    color: "#a855f7",
    badge: "REST Endpoint",
    keywords: ["api gateway", "rest api", "api", "endpoint", "http api"],
  },
  {
    id: "cloudfront",
    label: "CloudFront CDN",
    icon: "⚡",
    category: "network",
    color: "#06b6d4",
    badge: "Edge Delivery",
    keywords: ["cloudfront", "cdn", "edge location", "edge caching", "caching"],
  },
  {
    id: "vpc",
    label: "Amazon VPC",
    icon: "🔒",
    category: "network",
    color: "#6366f1",
    badge: "Isolated Network",
    keywords: ["vpc", "subnets", "virtual private cloud", "networking", "cidr"],
  },
];

/**
 * Resolves any spoken text, keyword, or alias to a rich visual KeywordDefinition.
 * Prioritizes exact matches, then word-boundary matches, and falls back to formatted custom concept.
 */
export const resolveKeyword = (query: string): KeywordDefinition => {
  const normalized = query.toLowerCase().trim();

  // 1. Exact match on keyword aliases
  const exactMatch = KEYWORD_DICTIONARY.find((item) =>
    item.keywords.some((kw) => normalized === kw)
  );
  if (exactMatch) {
    return exactMatch;
  }

  // 2. Word-boundary matching (longest keyword phrases first)
  const sorted = [...KEYWORD_DICTIONARY].sort((a, b) => {
    const maxA = Math.max(...a.keywords.map((k) => k.length));
    const maxB = Math.max(...b.keywords.map((k) => k.length));
    return maxB - maxA;
  });

  const matched = sorted.find((item) =>
    item.keywords.some((kw) => {
      if (kw.length >= 3) {
        const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = new RegExp(`\\b${escaped}\\b`, "i");
        return regex.test(normalized);
      }
      return false;
    })
  );

  if (matched) {
    return matched;
  }

  // 3. Fallback for custom terms
  const titleCase = query
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return {
    id: `custom-${normalized.replace(/\s+/g, "-")}`,
    label: titleCase,
    icon: "💡",
    category: "general",
    color: "#2563eb",
    badge: "Key Concept",
    keywords: [normalized],
  };
};
