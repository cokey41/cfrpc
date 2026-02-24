# FRPC 配置管理 App - EAS Build 打包指南

## ✅ 已完成配置

- ✅ EAS Build Project ID: `ec4f414b-4521-4d49-a5de-b00d38dc79ad`
- ✅ 应用名称: FRPC 配置管理
- ✅ 版本: 1.0.0
- ✅ 构建配置: `eas.json`
- ✅ Android 原生项目: 已生成

---

## 🚀 开始构建 APK

### 第一步：在你的本地电脑上操作

**重要：** 由于当前环境不支持交互式登录，请在你的**本地电脑**上执行以下步骤。

#### 1. 克隆或下载项目代码

```bash
# 如果你已经有项目代码，跳到第 2 步

# 方式 1: 从 Git 克隆（如果有 Git 仓库）
git clone <你的仓库地址>
cd frpc-client

# 方式 2: 下载项目文件
# 下载项目后，进入 client 目录
cd client
```

#### 2. 安装依赖

```bash
cd client
npm install
# 或
pnpm install
```

#### 3. 安装 EAS CLI

```bash
npm install --global eas-cli
```

#### 4. 登录 Expo 账户

```bash
eas login
```

浏览器会打开，使用你注册 EAS Build 的账户登录。

#### 5. 验证登录状态

```bash
eas whoami
```

应该显示你的用户名。

---

### 第二步：触发构建

#### 选项 A: 构建 Preview 版本 APK（推荐，免费）

```bash
eas build --platform android --profile preview
```

**优点：**
- ✅ 免费
- ✅ 构建速度快（约 5-10 分钟）
- ✅ 适合测试

#### 选项 B: 构建 Production 版本 APK

```bash
eas build --platform android --profile production
```

**优点：**
- ✅ 优化性能
- ✅ 生产级质量

---

### 第三步：等待构建完成

构建过程中你会看到以下信息：

```
✔ Build started

Android Build Details
─────────────────────────
┌──────────┬─────────────────────────────────────┐
│ Platform │ android                              │
│ Profile  │ preview                              │
│ Project  │ ec4f414b-4521-4d49-a5de-b00d38dc79ad │
└──────────┴─────────────────────────────────────┘

Waiting for build to complete...
```

构建时间：5-10 分钟（首次构建可能更慢）

---

### 第四步：下载 APK

构建完成后：

**自动下载：**
```bash
✅ Build finished
📲 Downloading APK...
```

**手动下载：**
1. 访问 [EAS Dashboard](https://expo.dev/)
2. 选择你的项目
3. 找到刚才的构建记录
4. 点击下载 APK

---

## 📱 安装 APK 到手机

### 方法 1: 通过数据线

```bash
# 连接手机到电脑（启用 USB 调试）
adb install app-preview.apk
```

### 方法 2: 通过文件传输

1. 将 APK 文件复制到手机
2. 在手机上打开文件管理器
3. 找到 APK 文件
4. 点击安装

### 方法 3: 通过应用商店（未签名 APK）

由于未签名的 APK，安装时可能需要：
- 设置 → 安全 → 允许安装未知来源的应用

---

## 🎯 快速命令汇总

```bash
# 完整流程
cd client
npm install --global eas-cli
eas login
eas build --platform android --profile preview

# 下载后安装
adb install app-preview.apk
```

---

## ⚠️ 常见问题

### Q1: 登录时提示 "Not logged in"
**A:** 确保执行 `eas login` 并在浏览器中完成登录。

### Q2: 构建失败
**A:** 查看错误信息，常见原因：
- 依赖未安装（运行 `npm install`）
- 项目 ID 不匹配（检查 `app.config.ts` 中的 `projectId`）
- 网络问题

### Q3: APK 无法安装
**A:**
- 允许安装未知来源的应用
- 检查 Android 版本是否 ≥ 5.0
- 卸载旧版本再安装

### Q4: 构建时间太长
**A:**
- 首次构建需要下载依赖，约 15-20 分钟
- 后续构建约 5-10 分钟
- 使用 `--profile preview` 速度更快

---

## 📊 构建信息

- **Project ID**: `ec4f414b-4521-4d49-a5de-b00d38dc79ad`
- **应用名称**: FRPC 配置管理
- **版本**: 1.0.0
- **包名**: `com.anonymous.x7610426512289939502`
- **最小 Android 版本**: 5.0 (API 21)
- **目标 Android 版本**: 14 (API 34)

---

## 🔗 有用的链接

- [EAS Dashboard](https://expo.dev/)
- [EAS Build 文档](https://docs.expo.dev/build/introduction/)
- [Expo Go 下载](https://play.google.com/store/apps/details?id=host.exp.exponent)

---

## 💡 提示

- **构建前检查**: 确保代码已提交（可选）
- **构建日志**: 可以在终端或 EAS Dashboard 查看
- **构建历史**: EAS Dashboard 保存所有构建记录
- **多设备测试**: 构建一次，可以在多个 Android 设备上安装

---

**祝你构建顺利！🎉**

如有问题，请查看 [EAS Build 文档](https://docs.expo.dev/build/introduction/)
