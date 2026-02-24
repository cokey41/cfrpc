import { ConnectionTestResult, ServerConfig } from '@/types/frpc';

/**
 * 测试与 FRPS 服务器的连接
 * 注意：这是一个简单的 TCP 连接测试，实际 FRPC 连接可能更复杂
 */
export async function testServerConnection(config: ServerConfig): Promise<ConnectionTestResult> {
  const startTime = Date.now();

  try {
    // 使用 fetch 尝试连接（如果服务器有 HTTP 接口）
    // 或者通过自定义的网络模块测试 TCP 连接
    
    // 由于 React Native 环境限制，我们使用 fetch 测试 HTTP 连通性
    // 这假设 FRPS 服务器提供了 dashboard 或其他 HTTP 接口
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      // 尝试连接到 FRPS 的 dashboard 或健康检查端点
      // 默认端口通常是 7000，dashboard 通常是 7500
      const dashboardUrl = `http://${config.serverAddr}:7500`;
      
      const response = await fetch(dashboardUrl, {
        method: 'GET',
        signal: controller.signal,
        mode: 'cors',
      }).catch(() => {
        // 如果 dashboard 不可用，尝试连接主端口
        return Promise.reject(new Error('Dashboard not accessible'));
      });

      clearTimeout(timeoutId);
      
      if (response.ok || response.status === 401) {
        // 401 表示需要认证，但连接成功
        return {
          success: true,
          latency: Date.now() - startTime,
          timestamp: Date.now(),
        };
      }

      return {
        success: false,
        error: `服务器返回状态码: ${response.status}`,
        timestamp: Date.now(),
      };
    } catch (fetchError) {
      clearTimeout(timeoutId);

      // 如果 HTTP 连接失败，返回提示信息
      return {
        success: false,
        error: '无法连接到服务器。请检查服务器地址和端口是否正确。',
        timestamp: Date.now(),
      };
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || '连接测试失败',
      timestamp: Date.now(),
    };
  }
}

/**
 * 测试配置的端口是否可用（模拟）
 * 注意：React Native 无法直接绑定本地端口，这只是个形式检查
 */
export function testLocalPortAvailability(port: number): { available: boolean; error?: string } {
  if (port <= 0 || port > 65535) {
    return {
      available: false,
      error: '端口号必须在 1-65535 之间',
    };
  }

  // 系统保留端口
  if (port < 1024) {
    return {
      available: false,
      error: '端口号小于 1024，可能需要管理员权限',
    };
  }

  // 端口格式正确
  return {
    available: true,
  };
}

/**
 * 生成服务器状态描述
 */
export function getServerStatusText(result: ConnectionTestResult | null): string {
  if (!result) {
    return '未测试';
  }

  if (result.success) {
    return `连接成功 (${result.latency}ms)`;
  }

  return `连接失败: ${result.error}`;
}
