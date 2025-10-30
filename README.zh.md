## Capella 语音 – 流利度练习应用（中文）

[English](README.md) | [中文](README.zh.md)

本应用由 Capella Speech（[capella-speech.org](https://capella-speech.org)）开发。Capella Speech 是一个由学生发起的组织，致力于提升公众对言语障碍的认识，并为社区整理与分享相关资源。本应用旨在通过一些广泛使用的练习活动与教育资源，帮助口吃者进行流利度练习与了解相关知识。

重要提示：本应用并非临床工具，不能替代专业评估或治疗。如需获得临床帮助，请咨询有资质的言语治疗师。

### 应用内容

- **合诵（Choral Speaking）**：与参考语音同步朗读，利用“合诵效应”在练习时短暂提高流利度。用户可自行控制内容与节奏。
- **延迟听觉反馈（DAF）**：让用户在短延迟后听到自己的声音，以改变语速与节奏。应用支持调节延迟参数。
- **抽认卡（Flashcards）**：提供结构化词语与短语列表，支持反复练习与难度渐进。
- **节奏化说话（开发中）**：类似节拍器的节奏引导，帮助建立规律的说话节奏。注意：该活动尚未完成，未来可能调整。
- **故事接龙（Story Chain）**：协作式故事创作，鼓励在低压力环境下进行较长的表述。
- **资源（Resources）**：与口吃、治疗方法及社区支持相关的精选资料与链接。

再次提醒：以上活动仅用于学习与练习，不构成医疗行为。

### 项目背景

- 早期版本以 Swift 开发，仅支持 iOS。
- 当前仓库是使用 React Native（Expo）重写的跨平台版本（面向 iOS、Android，及在可行情况下的 Web）。
- 在 iOS 上，DAF 使用原生音频模块以降低延迟，并通过桥接供 React Native 调用（见 `ios/Capella/DAFModule.swift` 与 `native-modules/DAFModule.ts`）。

## 开始使用

1. 安装依赖

   ```bash
   npm install
   ```

2. 启动开发服务器

   ```bash
   npx expo start
   ```

随后可通过以下方式打开应用：开发版构建、Android 模拟器、iOS 模拟器或 Expo Go（功能有限，适合快速预览）。

## 技术概览

- React Native（Expo）、TypeScript
- iOS 原生音频模块用于 DAF（Swift，经 Objective‑C 桥接）
- `i18n/` 提供中英文本地化
- 资源文件位于 `assets/`，包含图标与词库

## 参与贡献

欢迎通过 Issue 或 Pull Request 参与贡献。提交即表示同意在本项目许可范围内使用你的贡献。

## 许可协议

MIT


