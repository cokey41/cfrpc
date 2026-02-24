import AsyncStorage from '@react-native-async-storage/async-storage';
import { FrpcConfig } from '@/types/frpc';

const STORAGE_KEY = 'frpc_configs';

/**
 * 保存所有配置
 */
export async function saveConfigs(configs: FrpcConfig[]): Promise<void> {
  try {
    const jsonValue = JSON.stringify(configs);
    await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
  } catch (error) {
    console.error('保存配置失败:', error);
    throw error;
  }
}

/**
 * 加载所有配置
 */
export async function loadConfigs(): Promise<FrpcConfig[]> {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
    if (jsonValue != null) {
      return JSON.parse(jsonValue);
    }
    return [];
  } catch (error) {
    console.error('加载配置失败:', error);
    return [];
  }
}

/**
 * 保存单个配置
 */
export async function saveConfig(config: FrpcConfig): Promise<void> {
  try {
    const configs = await loadConfigs();
    const index = configs.findIndex((c) => c.id === config.id);
    
    const updatedConfig = {
      ...config,
      updatedAt: Date.now(),
    };

    if (index >= 0) {
      configs[index] = updatedConfig;
    } else {
      configs.push(updatedConfig);
    }

    await saveConfigs(configs);
  } catch (error) {
    console.error('保存配置失败:', error);
    throw error;
  }
}

/**
 * 删除配置
 */
export async function deleteConfig(configId: string): Promise<void> {
  try {
    const configs = await loadConfigs();
    const filtered = configs.filter((c) => c.id !== configId);
    await saveConfigs(filtered);
  } catch (error) {
    console.error('删除配置失败:', error);
    throw error;
  }
}

/**
 * 根据 ID 获取配置
 */
export async function getConfigById(configId: string): Promise<FrpcConfig | null> {
  try {
    const configs = await loadConfigs();
    return configs.find((c) => c.id === configId) || null;
  } catch (error) {
    console.error('获取配置失败:', error);
    return null;
  }
}
