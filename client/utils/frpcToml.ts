import { FrpcConfig } from '@/types/frpc';

/**
 * 生成 FRPC TOML 配置文件内容
 */
export function generateFrpcToml(config: FrpcConfig): string {
  const lines: string[] = [];

  // 服务器配置
  lines.push('[common]');
  lines.push(`server_addr = "${config.server.serverAddr}"`);
  lines.push(`server_port = ${config.server.serverPort}`);
  
  if (config.server.token) {
    lines.push(`token = "${config.server.token}"`);
  }
  
  if (config.server.tlsEnable) {
    lines.push('tls_enable = true');
  }
  
  if (config.server.dnsServer) {
    lines.push(`dns_server = "${config.server.dnsServer}"`);
  }
  
  lines.push('');

  // 代理配置
  config.proxies.forEach((proxy) => {
    lines.push(`[${proxy.type}]`);
    lines.push(`name = "${proxy.name}"`);
    lines.push(`local_ip = "${proxy.localIP}"`);
    lines.push(`local_port = ${proxy.localPort}`);
    
    if (proxy.remotePort !== undefined) {
      lines.push(`remote_port = ${proxy.remotePort}`);
    }
    
    if (proxy.customDomains && proxy.customDomains.length > 0) {
      lines.push(`custom_domains = [${proxy.customDomains.map(d => `"${d}"`).join(', ')}]`);
    }
    
    if (proxy.subdomain) {
      lines.push(`subdomain = "${proxy.subdomain}"`);
    }
    
    if (proxy.useCompression !== undefined) {
      lines.push(`use_compression = ${proxy.useCompression ? 'true' : 'false'}`);
    }
    
    if (proxy.useEncryption !== undefined) {
      lines.push(`use_encryption = ${proxy.useEncryption ? 'true' : 'false'}`);
    }
    
    if (proxy.healthCheckType) {
      lines.push(`health_check_type = "${proxy.healthCheckType}"`);
    }
    
    if (proxy.healthCheckIntervalS !== undefined) {
      lines.push(`health_check_interval_s = ${proxy.healthCheckIntervalS}`);
    }
    
    if (proxy.healthCheckMaxFailed !== undefined) {
      lines.push(`health_check_max_failed = ${proxy.healthCheckMaxFailed}`);
    }
    
    if (proxy.healthCheckTimeoutS !== undefined) {
      lines.push(`health_check_timeout_s = ${proxy.healthCheckTimeoutS}`);
    }
    
    if (proxy.healthCheckURL) {
      lines.push(`health_check_url = "${proxy.healthCheckURL}"`);
    }
    
    // STCP/XTCP 特有配置
    if (proxy.secret) {
      lines.push(`secret = "${proxy.secret}"`);
    }
    
    if (proxy.allowUsers && proxy.allowUsers.length > 0) {
      lines.push(`allow_users = [${proxy.allowUsers.map(u => `"${u}"`).join(', ')}]`);
    }
    
    lines.push('');
  });

  return lines.join('\n');
}

/**
 * 生成命令行参数形式
 */
export function generateFrpcCommand(config: FrpcConfig, configPath?: string): string {
  const parts = ['frpc'];

  // 如果提供了配置文件路径
  if (configPath) {
    parts.push('-c', configPath);
    return parts.join(' ');
  }

  // 否则使用命令行参数
  parts.push('-s', config.server.serverAddr);
  parts.push('-p', config.server.serverPort.toString());

  if (config.server.token) {
    parts.push('-t', config.server.token);
  }

  if (config.server.tlsEnable) {
    parts.push('--tls');
  }

  // 代理配置（简化版，只支持第一个代理）
  if (config.proxies.length > 0) {
    const proxy = config.proxies[0];
    parts.push(`--${proxy.type}`, `${proxy.localIP}:${proxy.localPort}`);
    
    if (proxy.remotePort) {
      parts.push('-r', proxy.remotePort.toString());
    }
  }

  return parts.join(' ');
}

/**
 * 验证配置是否完整
 */
export function validateFrpcConfig(config: FrpcConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // 验证服务器配置
  if (!config.server.serverAddr) {
    errors.push('服务器地址不能为空');
  }

  if (!config.server.serverPort || config.server.serverPort <= 0 || config.server.serverPort > 65535) {
    errors.push('服务器端口必须在 1-65535 之间');
  }

  // 验证代理配置
  if (config.proxies.length === 0) {
    errors.push('至少需要配置一个代理规则');
  }

  config.proxies.forEach((proxy, index) => {
    if (!proxy.name) {
      errors.push(`代理规则 ${index + 1} 的名称不能为空`);
    }

    if (!proxy.localIP) {
      errors.push(`代理规则 ${index + 1} 的本地 IP 不能为空`);
    }

    if (!proxy.localPort || proxy.localPort <= 0 || proxy.localPort > 65535) {
      errors.push(`代理规则 ${index + 1} 的本地端口必须在 1-65535 之间`);
    }

    // HTTP/HTTPS 需要域名或子域名
    if (proxy.type === 'http' || proxy.type === 'https') {
      if (!proxy.customDomains?.length && !proxy.subdomain) {
        errors.push(`代理规则 ${index + 1} (HTTP/HTTPS) 需要配置自定义域名或子域名`);
      }
    }

    // STCP 需要 secret
    if (proxy.type === 'stcp' || proxy.type === 'xtcp') {
      if (!proxy.secret) {
        errors.push(`代理规则 ${index + 1} (STCP/XTCP) 需要配置 secret`);
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}
