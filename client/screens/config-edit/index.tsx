import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeRouter, useSafeSearchParams } from '@/hooks/useSafeRouter';
import { useTheme } from '@/hooks/useTheme';
import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Input } from '@/components/Input';
import { FontAwesome6 } from '@expo/vector-icons';
import { FrpcConfig, ProxyConfig, ProxyType, ServerConfig } from '@/types/frpc';
import { 
  saveConfig, 
  getConfigById,
} from '@/utils/frpcStorage';
import { 
  validateFrpcConfig, 
  generateFrpcToml 
} from '@/utils/frpcToml';
import { 
  createProxyFromTemplate,
  CONFIG_TEMPLATES 
} from '@/utils/frpcTemplates';
import { testServerConnection } from '@/utils/frpcConnection';
import { createStyles } from './styles';

type EditMode = 'create' | 'edit';

export default function ConfigEditScreen() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useSafeRouter();
  const params = useSafeSearchParams<{ mode: EditMode; configId?: string }>();

  const [mode, setMode] = useState<EditMode>('create');
  const [loading, setLoading] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);

  // 服务器配置
  const [configName, setConfigName] = useState('');
  const [configDesc, setConfigDesc] = useState('');
  const [serverAddr, setServerAddr] = useState('');
  const [serverPort, setServerPort] = useState('7000');
  const [token, setToken] = useState('');
  const [tlsEnable, setTlsEnable] = useState(false);

  // 代理配置列表
  const [proxies, setProxies] = useState<Partial<ProxyConfig>[]>([]);

  // 当前编辑的代理索引
  const [editingProxyIndex, setEditingProxyIndex] = useState<number | null>(null);

  // 显示代理表单
  const [showProxyForm, setShowProxyForm] = useState(false);

  // 加载配置（编辑模式）
  useEffect(() => {
    const loadConfig = async () => {
      if (params.mode === 'edit' && params.configId) {
        setMode('edit');
        setLoading(true);
        try {
          const config = await getConfigById(params.configId);
          if (config) {
            setConfigName(config.name);
            setConfigDesc(config.description || '');
            setServerAddr(config.server.serverAddr);
            setServerPort(config.server.serverPort.toString());
            setToken(config.server.token || '');
            setTlsEnable(config.server.tlsEnable || false);
            setProxies(config.proxies);
          } else {
            Alert.alert('错误', '配置不存在');
            router.back();
          }
        } catch (error) {
          console.error('加载配置失败:', error);
          Alert.alert('错误', '加载配置失败');
          router.back();
        } finally {
          setLoading(false);
        }
      }
    };
    loadConfig();
  }, [params.mode, params.configId]);

  // 添加代理
  const handleAddProxy = (templateId: string) => {
    const proxy = createProxyFromTemplate(templateId, `proxy-${proxies.length + 1}`);
    setProxies([...proxies, proxy]);
    setEditingProxyIndex(proxies.length);
    setShowProxyForm(true);
  };

  // 删除代理
  const handleDeleteProxy = (index: number) => {
    Alert.alert(
      '确认删除',
      '确定要删除这个代理规则吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: () => {
            const newProxies = proxies.filter((_, i) => i !== index);
            setProxies(newProxies);
            if (editingProxyIndex === index) {
              setEditingProxyIndex(null);
              setShowProxyForm(false);
            } else if (editingProxyIndex !== null && editingProxyIndex > index) {
              setEditingProxyIndex(editingProxyIndex - 1);
            }
          },
        },
      ]
    );
  };

  // 编辑代理
  const handleEditProxy = (index: number) => {
    setEditingProxyIndex(index);
    setShowProxyForm(true);
  };

  // 保存代理
  const handleSaveProxy = (proxy: Partial<ProxyConfig>) => {
    const newProxies = [...proxies];
    if (editingProxyIndex !== null) {
      newProxies[editingProxyIndex] = proxy;
    } else {
      newProxies.push(proxy);
    }
    setProxies(newProxies);
    setShowProxyForm(false);
    setEditingProxyIndex(null);
  };

  // 测试服务器连接
  const handleTestConnection = async () => {
    if (!serverAddr || !serverPort) {
      Alert.alert('提示', '请先填写服务器地址和端口');
      return;
    }

    setTestingConnection(true);
    try {
      const result = await testServerConnection({
        serverAddr,
        serverPort: parseInt(serverPort, 10),
        token: token || undefined,
        tlsEnable,
      });

      if (result.success) {
        Alert.alert('连接成功', `服务器连接正常，延迟 ${result.latency}ms`);
      } else {
        Alert.alert('连接失败', result.error || '无法连接到服务器');
      }
    } catch (error: any) {
      Alert.alert('连接失败', error.message || '连接测试出错');
    } finally {
      setTestingConnection(false);
    }
  };

  // 保存配置
  const handleSave = async () => {
    // 基础验证
    if (!configName.trim()) {
      Alert.alert('提示', '请输入配置名称');
      return;
    }

    if (!serverAddr.trim()) {
      Alert.alert('提示', '请输入服务器地址');
      return;
    }

    const portNum = parseInt(serverPort, 10);
    if (isNaN(portNum) || portNum <= 0 || portNum > 65535) {
      Alert.alert('提示', '服务器端口必须在 1-65535 之间');
      return;
    }

    if (proxies.length === 0) {
      Alert.alert('提示', '请至少添加一个代理规则');
      return;
    }

    // 构建完整配置
    const config: FrpcConfig = {
      id: mode === 'edit' && params.configId ? params.configId : `config-${Date.now()}`,
      name: configName,
      description: configDesc,
      server: {
        serverAddr,
        serverPort: portNum,
        token: token || undefined,
        tlsEnable,
      },
      proxies: proxies as ProxyConfig[],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    // 验证配置
    const validation = validateFrpcConfig(config);
    if (!validation.valid) {
      Alert.alert('配置错误', validation.errors.join('\n'));
      return;
    }

    setLoading(true);
    try {
      await saveConfig(config);
      Alert.alert('保存成功', '配置已保存', [
        { text: '确定', onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error('保存配置失败:', error);
      Alert.alert('保存失败', '请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 渲染代理项
  const renderProxyItem = (proxy: Partial<ProxyConfig>, index: number) => (
    <View key={index} style={styles.proxyItem}>
      <TouchableOpacity
        style={styles.proxyInfo}
        onPress={() => handleEditProxy(index)}
        activeOpacity={0.7}
      >
        <View style={styles.proxyHeader}>
          <FontAwesome6 name="share-nodes" size={20} color={theme.primary} />
          <ThemedText variant="body" style={styles.proxyName}>
            {proxy.name || `代理 ${index + 1}`}
          </ThemedText>
        </View>
        <View style={styles.proxyDetails}>
          <ThemedText variant="caption" color={theme.textSecondary}>
            {proxy.type?.toUpperCase()} · {proxy.localIP}:{proxy.localPort}
          </ThemedText>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.deleteProxyButton}
        onPress={() => handleDeleteProxy(index)}
      >
        <FontAwesome6 name="trash" size={16} color={theme.error} />
      </TouchableOpacity>
    </View>
  );

  // 渲染模板选择
  const renderTemplateSelection = () => (
    <View style={styles.templateSection}>
      <ThemedText variant="h4" style={styles.sectionTitle}>
        选择代理类型
      </ThemedText>
      <View style={styles.templateGrid}>
        {CONFIG_TEMPLATES.map((template) => (
          <TouchableOpacity
            key={template.id}
            style={styles.templateCard}
            onPress={() => handleAddProxy(template.id)}
            activeOpacity={0.7}
          >
            <View style={styles.templateIcon}>
              <FontAwesome6 name={template.icon as any} size={32} color={theme.primary} />
            </View>
            <ThemedText variant="bodyMedium" style={styles.templateName}>
              {template.name}
            </ThemedText>
            <ThemedText variant="caption" color={theme.textMuted}>
              {template.description}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  if (loading) {
    return (
      <Screen backgroundColor={theme.backgroundRoot}>
        <View style={styles.loadingContainer}>
          <ThemedText>加载中...</ThemedText>
        </View>
      </Screen>
    );
  }

  return (
    <Screen backgroundColor={theme.backgroundRoot} statusBarStyle="dark">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          {/* 顶部导航栏 */}
          <View style={styles.navbar}>
            <TouchableOpacity onPress={() => router.back()}>
              <FontAwesome6 name="xmark" size={24} color={theme.textPrimary} />
            </TouchableOpacity>
            <ThemedText variant="h4">
              {mode === 'create' ? '新建配置' : '编辑配置'}
            </ThemedText>
            <TouchableOpacity onPress={handleSave} disabled={loading}>
              <ThemedText variant="bodyMedium" color={theme.primary}>
                保存
              </ThemedText>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            {/* 基础配置 */}
            <ThemedView level="default" style={styles.section}>
              <ThemedText variant="h4" style={styles.sectionTitle}>
                基础配置
              </ThemedText>

              <Input
                label="配置名称"
                placeholder="输入配置名称"
                value={configName}
                onChangeText={setConfigName}
              />

              <Input
                label="描述（可选）"
                placeholder="输入配置描述"
                value={configDesc}
                onChangeText={setConfigDesc}
                multiline
                numberOfLines={2}
              />
            </ThemedView>

            {/* 服务器配置 */}
            <ThemedView level="default" style={styles.section}>
              <View style={styles.sectionHeader}>
                <ThemedText variant="h4" style={styles.sectionTitle}>
                  服务器配置
                </ThemedText>
                <TouchableOpacity
                  style={styles.testButton}
                  onPress={handleTestConnection}
                  disabled={testingConnection}
                >
                  <FontAwesome6
                    name={testingConnection ? "circle-notch" : "bolt"}
                    size={16}
                    color={testingConnection ? theme.textMuted : theme.primary}
                  />
                  <ThemedText variant="caption" color={testingConnection ? theme.textMuted : theme.primary}>
                    {testingConnection ? '测试中...' : '测试连接'}
                  </ThemedText>
                </TouchableOpacity>
              </View>

              <Input
                label="服务器地址"
                placeholder="例如: your-server.com"
                value={serverAddr}
                onChangeText={setServerAddr}
                keyboardType="url"
              />

              <Input
                label="服务器端口"
                placeholder="默认: 7000"
                value={serverPort}
                onChangeText={setServerPort}
                keyboardType="number-pad"
              />

              <Input
                label="认证 Token"
                placeholder="输入认证 Token"
                value={token}
                onChangeText={setToken}
                secureTextEntry
              />

              <TouchableOpacity
                style={styles.toggleRow}
                onPress={() => setTlsEnable(!tlsEnable)}
              >
                <View style={styles.toggleInfo}>
                  <FontAwesome6 name="lock" size={20} color={theme.textPrimary} />
                  <View>
                    <ThemedText variant="body" style={styles.toggleLabel}>
                      启用 TLS
                    </ThemedText>
                    <ThemedText variant="caption" color={theme.textMuted}>
                      使用 SSL/TLS 加密连接
                    </ThemedText>
                  </View>
                </View>
                <View style={[styles.toggleIndicator, tlsEnable && styles.toggleActive]}>
                  <FontAwesome6 name="check" size={12} color={theme.buttonPrimaryText} />
                </View>
              </TouchableOpacity>
            </ThemedView>

            {/* 代理配置 */}
            <ThemedView level="default" style={styles.section}>
              <ThemedText variant="h4" style={styles.sectionTitle}>
                代理配置 ({proxies.length})
              </ThemedText>

              {proxies.length === 0 ? (
                <ThemedText variant="body" color={theme.textMuted} style={styles.emptyProxies}>
                  暂无代理规则，点击下方添加
                </ThemedText>
              ) : (
                <View style={styles.proxyList}>
                  {proxies.map((proxy, index) => renderProxyItem(proxy, index))}
                </View>
              )}

              {renderTemplateSelection()}
            </ThemedView>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>

      {/* 代理表单 Modal */}
      {showProxyForm && editingProxyIndex !== null && (
        <ProxyFormModal
          visible={showProxyForm}
          proxy={proxies[editingProxyIndex]}
          onSave={handleSaveProxy}
          onClose={() => {
            setShowProxyForm(false);
            setEditingProxyIndex(null);
          }}
        />
      )}
    </Screen>
  );
}

// 代理表单 Modal 组件
function ProxyFormModal({
  visible,
  proxy,
  onSave,
  onClose,
}: {
  visible: boolean;
  proxy?: Partial<ProxyConfig>;
  onSave: (proxy: Partial<ProxyConfig>) => void;
  onClose: () => void;
}) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [name, setName] = useState(proxy?.name || '');
  const [localIP, setLocalIP] = useState(proxy?.localIP || '127.0.0.1');
  const [localPort, setLocalPort] = useState(proxy?.localPort?.toString() || '');
  const [remotePort, setRemotePort] = useState(proxy?.remotePort?.toString() || '');
  const [customDomains, setCustomDomains] = useState(proxy?.customDomains?.join(', ') || '');
  const [subdomain, setSubdomain] = useState(proxy?.subdomain || '');
  const [secret, setSecret] = useState(proxy?.secret || '');
  const [useCompression, setUseCompression] = useState(proxy?.useCompression ?? true);
  const [useEncryption, setUseEncryption] = useState(proxy?.useEncryption ?? false);

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('提示', '请输入代理名称');
      return;
    }

    const portNum = parseInt(localPort, 10);
    if (isNaN(portNum) || portNum <= 0 || portNum > 65535) {
      Alert.alert('提示', '本地端口必须在 1-65535 之间');
      return;
    }

    const updatedProxy: Partial<ProxyConfig> = {
      ...proxy,
      name,
      localIP,
      localPort: portNum,
      remotePort: remotePort ? parseInt(remotePort, 10) : undefined,
      customDomains: customDomains
        ? customDomains.split(',').map((d) => d.trim()).filter(Boolean)
        : undefined,
      subdomain: subdomain || undefined,
      secret: secret || undefined,
      useCompression,
      useEncryption,
    };

    onSave(updatedProxy);
  };

  if (!visible) return null;

  const isHttp = proxy?.type === 'http' || proxy?.type === 'https';
  const isStcp = proxy?.type === 'stcp' || proxy?.type === 'xtcp';

  return (
    <View style={styles.modalOverlay}>
      <KeyboardAvoidingView
        style={styles.modalContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <ThemedText variant="h4">编辑代理配置</ThemedText>
            <TouchableOpacity onPress={onClose}>
              <FontAwesome6 name="xmark" size={24} color={theme.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <Input
              label="代理名称"
              placeholder="输入代理名称"
              value={name}
              onChangeText={setName}
            />

            <Input
              label="本地 IP"
              placeholder="127.0.0.1"
              value={localIP}
              onChangeText={setLocalIP}
            />

            <Input
              label="本地端口"
              placeholder="例如: 80"
              value={localPort}
              onChangeText={setLocalPort}
              keyboardType="number-pad"
            />

            {proxy?.type === 'tcp' && (
              <Input
                label="远程端口"
                placeholder="例如: 6000"
                value={remotePort}
                onChangeText={setRemotePort}
                keyboardType="number-pad"
              />
            )}

            {isHttp && (
              <>
                <Input
                  label="自定义域名"
                  placeholder="example.com, www.example.com"
                  value={customDomains}
                  onChangeText={setCustomDomains}
                />

                <Input
                  label="子域名"
                  placeholder="myapp"
                  value={subdomain}
                  onChangeText={setSubdomain}
                />
              </>
            )}

            {isStcp && (
              <Input
                label="访问密钥 (Secret)"
                placeholder="输入访问密钥"
                value={secret}
                onChangeText={setSecret}
                secureTextEntry
              />
            )}

            <TouchableOpacity
              style={styles.toggleRow}
              onPress={() => setUseCompression(!useCompression)}
            >
              <View style={styles.toggleInfo}>
                <FontAwesome6 name="compress" size={20} color={theme.textPrimary} />
                <View>
                  <ThemedText variant="body" style={styles.toggleLabel}>
                    启用压缩
                  </ThemedText>
                  <ThemedText variant="caption" color={theme.textMuted}>
                    压缩传输数据
                  </ThemedText>
                </View>
              </View>
              <View style={[styles.toggleIndicator, useCompression && styles.toggleActive]}>
                <FontAwesome6 name="check" size={12} color={theme.buttonPrimaryText} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toggleRow}
              onPress={() => setUseEncryption(!useEncryption)}
            >
              <View style={styles.toggleInfo}>
                <FontAwesome6 name="lock" size={20} color={theme.textPrimary} />
                <View>
                  <ThemedText variant="body" style={styles.toggleLabel}>
                    启用加密
                  </ThemedText>
                  <ThemedText variant="caption" color={theme.textMuted}>
                    加密传输数据
                  </ThemedText>
                </View>
              </View>
              <View style={[styles.toggleIndicator, useEncryption && styles.toggleActive]}>
                <FontAwesome6 name="check" size={12} color={theme.buttonPrimaryText} />
              </View>
            </TouchableOpacity>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <ThemedText variant="bodyMedium" color={theme.textSecondary}>
                取消
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <ThemedText variant="bodyMedium" color={theme.buttonPrimaryText}>
                保存
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

import { useMemo } from 'react';
