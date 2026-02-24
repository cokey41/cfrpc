import { ConfigTemplate, ProxyConfig, ProxyType } from '@/types/frpc';

/**
 * FRPC 配置模板
 */
export const CONFIG_TEMPLATES: ConfigTemplate[] = [
  {
    id: 'http',
    name: 'HTTP 代理',
    description: '将本地 Web 服务暴露到公网，支持自定义域名',
    type: 'http',
    icon: 'globe',
    defaultConfig: {
      type: 'http',
      localIP: '127.0.0.1',
      localPort: 80,
      useCompression: true,
      useEncryption: false,
    },
  },
  {
    id: 'https',
    name: 'HTTPS 代理',
    description: '将本地 HTTPS 服务暴露到公网',
    type: 'https',
    icon: 'lock-closed',
    defaultConfig: {
      type: 'https',
      localIP: '127.0.0.1',
      localPort: 443,
      useCompression: true,
      useEncryption: true,
    },
  },
  {
    id: 'tcp',
    name: 'TCP 代理',
    description: '将本地任意 TCP 端口暴露到公网',
    type: 'tcp',
    icon: 'server',
    defaultConfig: {
      type: 'tcp',
      localIP: '127.0.0.1',
      localPort: 22,
      remotePort: 6000,
      useEncryption: false,
    },
  },
  {
    id: 'ssh',
    name: 'SSH 远程连接',
    description: '远程访问设备的 SSH 服务',
    type: 'tcp',
    icon: 'terminal',
    defaultConfig: {
      type: 'tcp',
      localIP: '127.0.0.1',
      localPort: 22,
      remotePort: 6000,
      useEncryption: false,
    },
  },
  {
    id: 'stcp',
    name: '安全 TCP',
    description: '点对点安全连接，需要访问端配置 secret',
    type: 'stcp',
    icon: 'shield',
    defaultConfig: {
      type: 'stcp',
      localIP: '127.0.0.1',
      localPort: 22,
      secret: '12345678',
      useEncryption: true,
    },
  },
  {
    id: 'udp',
    name: 'UDP 代理',
    description: '将本地 UDP 服务暴露到公网',
    type: 'udp',
    icon: 'network',
    defaultConfig: {
      type: 'udp',
      localIP: '127.0.0.1',
      localPort: 53,
      remotePort: 6000,
      useEncryption: false,
    },
  },
];

/**
 * 根据类型获取模板
 */
export function getTemplateById(id: string): ConfigTemplate | undefined {
  return CONFIG_TEMPLATES.find((t) => t.id === id);
}

/**
 * 根据代理类型获取模板列表
 */
export function getTemplatesByType(type: ProxyType): ConfigTemplate[] {
  return CONFIG_TEMPLATES.filter((t) => t.type === type);
}

/**
 * 创建新的代理配置（基于模板）
 */
export function createProxyFromTemplate(templateId: string, name: string): Partial<ProxyConfig> {
  const template = getTemplateById(templateId);
  if (!template) {
    return {};
  }
  
  return {
    ...template.defaultConfig,
    name,
    type: template.type,
  };
}
