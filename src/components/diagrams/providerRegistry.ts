export type CloudProviderId =
  | "aws"
  | "azure"
  | "gcp"
  | "kubernetes"
  | "docker"
  | "linux"
  | "networking"
  | "database"
  | "cicd"
  | "generic";

export interface ProviderTheme {
  id: CloudProviderId;
  name: string;
  badge: string;
  primaryColor: string;
  accentColor: string;
  borderColor: string;
  glowColor: string;
}

export const providerRegistry: Record<CloudProviderId, ProviderTheme> = {
  aws: {
    id: "aws",
    name: "Amazon Web Services",
    badge: "☁️",
    primaryColor: "#ff9900",
    accentColor: "#f59e0b",
    borderColor: "rgba(255, 153, 0, 0.45)",
    glowColor: "rgba(255, 153, 0, 0.3)",
  },
  azure: {
    id: "azure",
    name: "Microsoft Azure",
    badge: "🔷",
    primaryColor: "#0078d4",
    accentColor: "#50e6ff",
    borderColor: "rgba(0, 120, 212, 0.45)",
    glowColor: "rgba(0, 120, 212, 0.3)",
  },
  gcp: {
    id: "gcp",
    name: "Google Cloud Platform",
    badge: "🌐",
    primaryColor: "#4285f4",
    accentColor: "#34a853",
    borderColor: "rgba(66, 133, 244, 0.45)",
    glowColor: "rgba(66, 133, 244, 0.3)",
  },
  kubernetes: {
    id: "kubernetes",
    name: "Kubernetes",
    badge: "☸️",
    primaryColor: "#326ce5",
    accentColor: "#61dafb",
    borderColor: "rgba(50, 108, 229, 0.45)",
    glowColor: "rgba(50, 108, 229, 0.3)",
  },
  docker: {
    id: "docker",
    name: "Docker",
    badge: "🐳",
    primaryColor: "#2496ed",
    accentColor: "#38bdf8",
    borderColor: "rgba(36, 150, 237, 0.45)",
    glowColor: "rgba(36, 150, 237, 0.3)",
  },
  linux: {
    id: "linux",
    name: "Linux Systems",
    badge: "🐧",
    primaryColor: "#fcc624",
    accentColor: "#e5a900",
    borderColor: "rgba(252, 198, 36, 0.45)",
    glowColor: "rgba(252, 198, 36, 0.3)",
  },
  networking: {
    id: "networking",
    name: "Cloud Networking",
    badge: "🔀",
    primaryColor: "#10b981",
    accentColor: "#34d399",
    borderColor: "rgba(16, 185, 129, 0.45)",
    glowColor: "rgba(16, 185, 129, 0.3)",
  },
  database: {
    id: "database",
    name: "Databases & Storage",
    badge: "💾",
    primaryColor: "#a855f7",
    accentColor: "#c084fc",
    borderColor: "rgba(168, 85, 247, 0.45)",
    glowColor: "rgba(168, 85, 247, 0.3)",
  },
  cicd: {
    id: "cicd",
    name: "CI/CD & DevOps",
    badge: "🚀",
    primaryColor: "#ec4899",
    accentColor: "#f472b6",
    borderColor: "rgba(236, 72, 153, 0.45)",
    glowColor: "rgba(236, 72, 153, 0.3)",
  },
  generic: {
    id: "generic",
    name: "Cloud Architecture",
    badge: "⚙️",
    primaryColor: "#2563eb",
    accentColor: "#f59e0b",
    borderColor: "rgba(37, 99, 235, 0.4)",
    glowColor: "rgba(37, 99, 235, 0.25)",
  },
};

export const getProviderTheme = (providerId?: CloudProviderId): ProviderTheme => {
  if (!providerId || !providerRegistry[providerId]) {
    return providerRegistry.generic;
  }
  return providerRegistry[providerId];
};
