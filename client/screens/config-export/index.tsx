import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
  Platform,
} from 'react-native';
import { useSafeRouter, useSafeSearchParams } from '@/hooks/useSafeRouter';
import { useTheme } from '@/hooks/useTheme';
import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { FontAwesome6 } from '@expo/vector-icons';
import { FrpcConfig } from '@/types/frpc';
import { getConfigById } from '@/utils/frpcStorage';
import { generateFrpcToml, generateFrpcCommand } from '@/utils/frpcToml';
import { createStyles } from './styles';

type ExportMode = 'toml' | 'command';

export default function ConfigExportScreen() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useSafeRouter();
  const params = useSafeSearchParams<{ configId: string }>();

  const [config, setConfig] = useState<FrpcConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [exportMode, setExportMode] = useState<ExportMode>('toml');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadConfig();
  }, [params.configId]);

  const loadConfig = async () => {
    if (!params.configId) {
      Alert.alert('错误', '配置 ID 不存在');
      router.back();
      return;
    }

    try {
      const data = await getConfigById(params.configId);
      if (data) {
        setConfig(data);
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
  };

  const getExportContent = (): string => {
    if (!config) return '';

    if (exportMode === 'toml') {
      return generateFrpcToml(config);
    } else {
      return generateFrpcCommand(config);
    }
  };

  const handleCopy = async () => {
    const content = getExportContent();
    try {
      if (Platform.OS === 'web') {
        await navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        // 移动端提示用户手动复制
        Alert.alert(
          '复制内容',
          '请在下方配置预览区域选择并复制文本',
        );
      }
    } catch (error) {
      console.error('复制失败:', error);
      Alert.alert('复制失败', '无法复制到剪贴板');
    }
  };

  const handleShare = async () => {
    const content = getExportContent();
    const filename = `frpc-${config?.name || 'config'}.toml`;

    try {
      if (Platform.OS === 'web') {
        // Web 端下载文件
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        // 移动端分享
        await Share.share({
          message: content,
          title: `FRPC 配置: ${config?.name}`,
        });
      }
    } catch (error: any) {
      if (error.message !== 'User did not share') {
        Alert.alert('分享失败', error.message);
      }
    }
  };

  const handleSaveToFile = async () => {
    const content = getExportContent();
    const filename = `frpc-${config?.name || 'config'}.toml`;

    try {
      if (Platform.OS === 'web') {
        await handleShare();
      } else {
        // 移动端可以通过文件系统保存
        // 由于 expo-file-system 限制，这里使用分享作为替代
        Alert.alert(
          '提示',
          '在移动端，请使用"分享"功能将配置发送到其他应用，或复制内容后手动保存到文件。',
        );
      }
    } catch (error: any) {
      Alert.alert('保存失败', error.message);
    }
  };

  if (loading) {
    return (
      <Screen backgroundColor={theme.backgroundRoot}>
        <View style={styles.loadingContainer}>
          <ThemedText>加载中...</ThemedText>
        </View>
      </Screen>
    );
  }

  if (!config) {
    return null;
  }

  const content = getExportContent();

  return (
    <Screen backgroundColor={theme.backgroundRoot} statusBarStyle="dark">
      <View style={styles.container}>
        {/* 顶部导航栏 */}
        <View style={styles.navbar}>
          <TouchableOpacity onPress={() => router.back()}>
            <FontAwesome6 name="arrow-left" size={24} color={theme.textPrimary} />
          </TouchableOpacity>
          <ThemedText variant="h4">导出配置</ThemedText>
          <View style={styles.navbarSpacer} />
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* 配置信息 */}
          <ThemedView level="default" style={styles.infoSection}>
            <ThemedText variant="h4" style={styles.infoTitle}>
              {config.name}
            </ThemedText>
            {config.description && (
              <ThemedText variant="body" color={theme.textSecondary} style={styles.infoDesc}>
                {config.description}
              </ThemedText>
            )}
            <View style={styles.infoDetails}>
              <View style={styles.infoRow}>
                <FontAwesome6 name="server" size={14} color={theme.textMuted} />
                <ThemedText variant="caption" color={theme.textSecondary}>
                  {config.server.serverAddr}:{config.server.serverPort}
                </ThemedText>
              </View>
              <View style={styles.infoRow}>
                <FontAwesome6 name="share-nodes" size={14} color={theme.textMuted} />
                <ThemedText variant="caption" color={theme.textSecondary}>
                  {config.proxies.length} 个代理
                </ThemedText>
              </View>
            </View>
          </ThemedView>

          {/* 导出模式选择 */}
          <ThemedView level="default" style={styles.modeSection}>
            <ThemedText variant="h4" style={styles.modeTitle}>
              导出格式
            </ThemedText>
            <View style={styles.modeButtons}>
              <TouchableOpacity
                style={[styles.modeButton, exportMode === 'toml' && styles.modeButtonActive]}
                onPress={() => setExportMode('toml')}
              >
                <FontAwesome6
                  name="file-code"
                  size={20}
                  color={exportMode === 'toml' ? theme.buttonPrimaryText : theme.textPrimary}
                />
                <ThemedText
                  variant="bodyMedium"
                  color={exportMode === 'toml' ? theme.buttonPrimaryText : theme.textPrimary}
                >
                  TOML 文件
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modeButton, exportMode === 'command' && styles.modeButtonActive]}
                onPress={() => setExportMode('command')}
              >
                <FontAwesome6
                  name="terminal"
                  size={20}
                  color={exportMode === 'command' ? theme.buttonPrimaryText : theme.textPrimary}
                />
                <ThemedText
                  variant="bodyMedium"
                  color={exportMode === 'command' ? theme.buttonPrimaryText : theme.textPrimary}
                >
                  命令行
                </ThemedText>
              </TouchableOpacity>
            </View>
          </ThemedView>

          {/* 配置内容预览 */}
          <ThemedView level="default" style={styles.previewSection}>
            <View style={styles.previewHeader}>
              <ThemedText variant="h4" style={styles.previewTitle}>
                {exportMode === 'toml' ? 'TOML 配置' : '命令行'}
              </ThemedText>
              <TouchableOpacity onPress={handleCopy}>
                <ThemedText variant="caption" color={theme.primary}>
                  {copied ? '已复制' : '复制'}
                </ThemedText>
              </TouchableOpacity>
            </View>
            <ThemedView level="tertiary" style={styles.codeBlock}>
              <ThemedText variant="caption" selectable style={styles.codeText}>
                {content}
              </ThemedText>
            </ThemedView>
          </ThemedView>

          {/* 使用说明 */}
          <ThemedView level="default" style={styles.helpSection}>
            <ThemedText variant="h4" style={styles.helpTitle}>
              使用说明
            </ThemedText>
            {exportMode === 'toml' ? (
              <>
                <ThemedText variant="body" color={theme.textSecondary} style={styles.helpText}>
                  1. 点击&ldquo;保存文件&rdquo;将配置保存为 TOML 文件
                </ThemedText>
                <ThemedText variant="body" color={theme.textSecondary} style={styles.helpText}>
                  2. 将文件复制到你的 FRPC 客户端目录
                </ThemedText>
                <ThemedText variant="body" color={theme.textSecondary} style={styles.helpText}>
                  3. 运行: frpc -c config.toml
                </ThemedText>
              </>
            ) : (
              <>
                <ThemedText variant="body" color={theme.textSecondary} style={styles.helpText}>
                  1. 复制命令行参数
                </ThemedText>
                <ThemedText variant="body" color={theme.textSecondary} style={styles.helpText}>
                  2. 在终端中直接运行
                </ThemedText>
                <ThemedText variant="caption" color={theme.textMuted} style={styles.helpNote}>
                  注意: 命令行模式只支持第一个代理规则
                </ThemedText>
              </>
            )}
          </ThemedView>
        </ScrollView>

        {/* 底部操作按钮 */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.secondaryButton} onPress={handleCopy}>
            <FontAwesome6 name="copy" size={18} color={theme.primary} />
            <ThemedText variant="bodyMedium" color={theme.primary}>
              {copied ? '已复制' : '复制'}
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.primaryButton} onPress={handleSaveToFile}>
            <FontAwesome6 name="download" size={18} color={theme.buttonPrimaryText} />
            <ThemedText variant="bodyMedium" color={theme.buttonPrimaryText}>
              保存文件
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </Screen>
  );
}

import { useMemo } from 'react';
