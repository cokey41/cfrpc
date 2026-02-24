import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { useTheme } from '@/hooks/useTheme';
import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { FontAwesome6 } from '@expo/vector-icons';
import { FrpcConfig } from '@/types/frpc';
import { loadConfigs, deleteConfig } from '@/utils/frpcStorage';
import { createStyles } from './styles';

export default function HomeScreen() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useSafeRouter();
  const [configs, setConfigs] = useState<FrpcConfig[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // 加载配置列表
  useEffect(() => {
    const load = async () => {
      try {
        const data = await loadConfigs();
        setConfigs(data);
      } catch (error) {
        console.error('加载配置失败:', error);
      }
    };
    load();
  }, []);

  // 下拉刷新
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const data = await loadConfigs();
      setConfigs(data);
    } catch (error) {
      console.error('加载配置失败:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // 新建配置
  const handleAddConfig = () => {
    router.push('/config-edit', { mode: 'create' });
  };

  // 编辑配置
  const handleEditConfig = (config: FrpcConfig) => {
    router.push('/config-edit', { mode: 'edit', configId: config.id });
  };

  // 删除配置
  const handleDeleteConfig = (config: FrpcConfig) => {
    Alert.alert(
      '确认删除',
      `确定要删除配置 "${config.name}" 吗？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteConfig(config.id);
              const data = await loadConfigs();
              setConfigs(data);
            } catch (error) {
              Alert.alert('删除失败', '请稍后重试');
            }
          },
        },
      ]
    );
  };

  // 导出配置
  const handleExportConfig = (config: FrpcConfig) => {
    router.push('/config-export', { configId: config.id });
  };

  // 渲染配置卡片
  const renderConfigCard = (config: FrpcConfig) => {
    const proxyCount = config.proxies.length;
    const proxyTypes = [...new Set(config.proxies.map(p => p.type))];
    
    return (
      <TouchableOpacity
        key={config.id}
        style={styles.configCard}
        onPress={() => handleEditConfig(config)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <ThemedText variant="h4" style={styles.configName}>
            {config.name}
          </ThemedText>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => handleExportConfig(config)}
            >
              <FontAwesome6 name="download" size={20} color={theme.textMuted} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => handleDeleteConfig(config)}
            >
              <FontAwesome6 name="trash" size={20} color={theme.error} />
            </TouchableOpacity>
          </View>
        </View>

        {config.description && (
          <ThemedText variant="caption" color={theme.textSecondary} style={styles.configDesc}>
            {config.description}
          </ThemedText>
        )}

        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <FontAwesome6 name="server" size={14} color={theme.textMuted} />
            <ThemedText variant="caption" color={theme.textSecondary}>
              {config.server.serverAddr}:{config.server.serverPort}
            </ThemedText>
          </View>

          <View style={styles.infoRow}>
            <FontAwesome6 name="share-nodes" size={14} color={theme.textMuted} />
            <ThemedText variant="caption" color={theme.textSecondary}>
              {proxyCount} 个代理 ({proxyTypes.join(', ').toUpperCase()})
            </ThemedText>
          </View>

          <View style={styles.infoRow}>
            <FontAwesome6 name="clock" size={14} color={theme.textMuted} />
            <ThemedText variant="caption" color={theme.textMuted}>
              {new Date(config.updatedAt).toLocaleString('zh-CN')}
            </ThemedText>
          </View>
        </View>

        {/* 代理类型标签 */}
        <View style={styles.tagsContainer}>
          {proxyTypes.map((type) => (
            <View key={type} style={styles.tag}>
              <ThemedText variant="caption" color={theme.primary}>
                {type.toUpperCase()}
              </ThemedText>
            </View>
          ))}
        </View>
      </TouchableOpacity>
    );
  };

  // 空状态
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <FontAwesome6 name="network-wired" size={64} color={theme.textMuted} />
      </View>
      <ThemedText variant="h3" color={theme.textSecondary} style={styles.emptyTitle}>
        暂无配置
      </ThemedText>
      <ThemedText variant="body" color={theme.textMuted} style={styles.emptyDesc}>
        点击下方按钮创建新的 FRPC 配置
      </ThemedText>
    </View>
  );

  return (
    <Screen backgroundColor={theme.backgroundRoot} statusBarStyle="dark">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText variant="h2" color={theme.textPrimary}>
            FRPC 配置管理
          </ThemedText>
          <ThemedText variant="body" color={theme.textSecondary} style={styles.headerDesc}>
            管理 FRPC 内网穿透配置
          </ThemedText>
        </View>

        {/* 配置列表 */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.primary}
            />
          }
        >
          {configs.length === 0 ? (
            renderEmptyState()
          ) : (
            <View style={styles.configsList}>
              {configs.map(renderConfigCard)}
            </View>
          )}
        </ScrollView>

        {/* 添加按钮 */}
        <TouchableOpacity style={styles.fab} onPress={handleAddConfig}>
          <FontAwesome6 name="plus" size={24} color={theme.buttonPrimaryText} />
        </TouchableOpacity>
      </View>
    </Screen>
  );
}

import { useMemo } from 'react';
