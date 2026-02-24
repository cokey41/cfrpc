/**
 * FRPC 配置类型定义
 */

// 代理类型
export type ProxyType = 'tcp' | 'udp' | 'http' | 'https' | 'stcp' | 'xtcp' | 'sudp';

// 基础服务器配置
export interface ServerConfig {
  serverAddr: string;
  serverPort: number;
  token?: string;
  tlsEnable?: boolean;
  dnsServer?: string;
}

// 代理规则配置
export interface ProxyConfig {
  name: string;
  type: ProxyType;
  localIP: string;
  localPort: number;
  remotePort?: number;
  customDomains?: string[];
  subdomain?: string;
  useCompression?: boolean;
  useEncryption?: boolean;
  healthCheckType?: string;
  healthCheckIntervalS?: number;
  healthCheckMaxFailed?: number;
  healthCheckTimeoutS?: number;
  healthCheckURL?: string;
  // STCP/XTCP 特有
  secret?: string;
  allowUsers?: string[];
}

// 完整的 FRPC 配置
export interface FrpcConfig {
  id: string;
  name: string; // 用户配置的名称（用于显示）
  description?: string;
  server: ServerConfig;
  proxies: ProxyConfig[];
  createdAt: number;
  updatedAt: number;
}

// 配置模板类型
export interface ConfigTemplate {
  id: string;
  name: string;
  description: string;
  type: ProxyType;
  defaultConfig: Partial<ProxyConfig>;
  icon: string;
}

// 连接测试结果
export interface ConnectionTestResult {
  success: boolean;
  latency?: number;
  error?: string;
  timestamp: number;
}
