# FRPC 配置管理 App - Android APK 构建指南

本项目提供了三种构建 APK 的方式，请根据你的环境和需求选择合适的方式。

---

## 方式一：使用 EAS Build 云端构建（推荐 ⭐）

EAS Build 是 Expo 官方提供的云端构建服务，无需配置本地 Android 环境。

### 步骤：

1. **登录 Expo 账户**
   ```bash
   cd client
   npx expo login
   ```

2. **触发构建**
   ```bash
   # 构建预览版 APK（免费）
   npx eas build --platform android --profile preview

   # 或者构建生产版 APK（免费）
   npx eas build --platform android --profile production
   ```

3. **等待构建完成**
   - 构建完成后，会自动下载 APK 文件
   - 也可以在 [EAS Dashboard](https://expo.dev/) 中查看构建历史和下载

### 优点：
- ✅ 无需配置 Android 开发环境
- ✅ 云端构建，不占用本地资源
- ✅ 构建速度快
- ✅ 每月有免费的构建额度

### 注意：
- 需要 Expo 账户（免费注册）
- 首次构建可能需要 5-10 分钟

---

## 方式二：本地构建（需要配置 Android 环境）

如果你已经配置了 Android 开发环境，可以使用本地构建。

### 前置要求：

1. **Java JDK 17**
   ```bash
   java -version  # 应显示 17.x.x
   ```

2. **Android SDK**
   - Android Studio 或独立的 Android SDK
   - 设置 `ANDROID_HOME` 环境变量

3. **Android Build Tools**
   - SDK Platform-Tools
   - SDK Build-Tools 34.0.0 或更高版本

### 步骤：

1. **生成原生项目**
   ```bash
   cd client
   npx expo prebuild --clean
   ```

2. **进入 Android 目录**
   ```bash
   cd android
   ```

3. **构建 Debug APK**
   ```bash
   ./gradlew assembleDebug
   ```

4. **构建 Release APK**
   ```bash
   ./gradlew assembleRelease
   ```

5. **找到 APK 文件**
   - Debug APK: `app/build/outputs/apk/debug/app-debug.apk`
   - Release APK: `app/build/outputs/apk/release/app-release.apk`

### 优点：
- ✅ 完全免费
- ✅ 可以自定义构建配置
- ✅ 构建速度快（本地环境）

---

## 方式三：使用 Expo Development Build

如果你只是想快速测试，可以使用 Expo Development Build。

### 步骤：

1. **安装 Expo Go App**
   - 在 Android 手机上安装 [Expo Go](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. **启动开发服务器**
   ```bash
   cd client
   npx expo start
   ```

3. **扫码连接**
   - 用 Expo Go App 扫描终端显示的二维码
   - 即可在手机上预览和测试应用

### 优点：
- ✅ 无需构建，实时预览
- ✅ 支持热重载
- ✅ 快速迭代开发

---

## 当前项目信息

- **应用名称**: FRPC 配置管理
- **版本**: 1.0.0
- **包名**: com.anonymous.x7610426512289939502
- **最小 SDK**: 21 (Android 5.0)
- **目标 SDK**: 34 (Android 14)

## 快速开始（推荐新手）

如果你是第一次使用，建议：

1. **先试用 Expo Go**（方式三）
   - 最快速度看到效果
   - 无需构建，扫码即可

2. **使用 EAS Build 构建 APK**（方式一）
   - 需要 Expo 账户
   - 云端构建，简单方便

3. **本地构建**（方式二）
   - 仅在需要自定义构建时使用

## 常见问题

### Q: EAS Build 需要付费吗？
A: EAS Build 有免费额度，每月可以免费构建一定次数的 APK。免费额度足够个人使用。

### Q: 本地构建失败怎么办？
A: 确保：
- Java JDK 版本为 17
- ANDROID_HOME 环境变量已设置
- Android SDK 中的 Build-Tools 已安装

### Q: APK 安装时提示"未安装应用"？
A: 这可能是因为：
- 签名不一致（Debug 和 Release 签名不同）
- 先卸载旧版本再安装新版本

## 联系支持

如果遇到问题，请查看：
- [Expo 文档](https://docs.expo.dev/)
- [EAS Build 文档](https://docs.expo.dev/build/introduction/)

---

**祝你构建顺利！** 🚀
