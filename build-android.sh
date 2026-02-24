#!/bin/bash

# FRPC 配置管理 App - Android APK 构建辅助脚本

set -e

echo "=========================================="
echo "  FRPC 配置管理 App - APK 构建工具"
echo "=========================================="
echo ""

cd "$(dirname "$0")/client"

echo "请选择构建方式："
echo "1) 使用 EAS Build 云端构建（推荐）"
echo "2) 本地构建（需要 Android SDK）"
echo "3) 启动 Expo Go 开发模式（无需构建）"
echo ""
read -p "请输入选项 (1/2/3): " choice

case $choice in
  1)
    echo ""
    echo "=========================================="
    echo "  EAS Build 云端构建"
    echo "=========================================="
    echo ""

    # 检查是否已登录
    if npx expo whoami 2>&1 | grep -q "Not logged in"; then
      echo "请先登录 Expo 账户："
      npx expo login
    fi

    echo ""
    echo "开始构建..."
    echo ""
    npx eas build --platform android --profile preview
    ;;
  2)
    echo ""
    echo "=========================================="
    echo "  本地构建"
    echo "=========================================="
    echo ""

    # 检查 Java
    if ! command -v java &> /dev/null; then
      echo "❌ 错误: 未找到 Java，请先安装 JDK 17"
      exit 1
    fi

    # 检查 Android SDK
    if [ -z "$ANDROID_HOME" ]; then
      echo "⚠️  警告: ANDROID_HOME 环境变量未设置"
      echo "请设置 ANDROID_HOME 环境变量"
      exit 1
    fi

    echo "Java 版本:"
    java -version
    echo ""

    echo "生成原生项目..."
    npx expo prebuild --clean

    echo ""
    echo "构建 APK..."
    cd android

    echo "构建中..."
    ./gradlew assembleDebug

    echo ""
    echo "✅ 构建完成！"
    echo "APK 位置: app/build/outputs/apk/debug/app-debug.apk"
    ;;
  3)
    echo ""
    echo "=========================================="
    echo "  Expo Go 开发模式"
    echo "=========================================="
    echo ""

    echo "请确保已安装 Expo Go App："
    echo "https://play.google.com/store/apps/details?id=host.exp.exponent"
    echo ""

    echo "启动开发服务器..."
    npx expo start
    ;;
  *)
    echo "无效的选项"
    exit 1
    ;;
esac
