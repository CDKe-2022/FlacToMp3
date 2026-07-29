# CarTunes · 车机音频转换器

> 纯前端、零上传、离线运行的无损音乐转 MP3 工具，专为车载音响系统适配。

CarTunes 是一个**完全运行在浏览器中**的音频转换工具。无需安装任何软件，无需联网，文件**永不离开本地**。它将 FLAC、WAV、APE 等无损格式一键转换为 44.1 kHz MP3，确保所有车机系统完美兼容。

---

## ✨ 核心特性

- 🔒 **全程本地离线** — 所有解码、重采样、编码均在浏览器内完成，文件不上传任何服务器
- ⚡ **多核并行编码** — 基于 Web Worker 线程池，自动检测 CPU 核心数，批量文件并行转换
- 🎵 **车机完美适配** — 统一输出 44.1 kHz 采样率 MP3，兼容市面上绝大多数车载音响系统
- 📦 **一键打包下载** — 转换完成后自动打包为 ZIP 文件
- 🎛️ **三档质量选择** — 320 / 192 / 128 kbps，适配不同存储需求
- 📱 **全端响应式** — 桌面端三栏铺开，移动端自适应布局

---

## 📖 工作原理

```
用户拖入文件
    │
    ▼
┌──────────────────────────────────┐
│  AudioContext.decodeAudioData()  │  ← 浏览器原生解码
│  支持 FLAC / WAV / APE / M4A /   │
│       OGG / MP3                  │
└──────────┬───────────────────────┘
           │
           ▼ 原始采样率 ≠ 44.1 kHz?
┌──────────────────────────────────┐
│  OfflineAudioContext 重采样       │  ← 离线渲染到 44.1 kHz
└──────────┬───────────────────────┘
           │
           ▼
┌──────────────────────────────────┐
│  Web Worker × lamejs 编码        │  ← 多线程并行 MP3 编码
│  Float32 → Int16 → MP3           │
└──────────┬───────────────────────┘
           │
           ▼
┌──────────────────────────────────┐
│  JSZip 打包 → saveAs 下载        │  ← 浏览器端压缩并保存
└──────────────────────────────────┘
```

### 技术栈

| 组件 | 技术 | 用途 |
|------|------|------|
| 音频解码 | `AudioContext.decodeAudioData()` | 浏览器原生解码各种音频格式 |
| 重采样 | `OfflineAudioContext` | 离线渲染，将任意采样率转为 44.1 kHz |
| MP3 编码 | [lamejs](https://github.com/zhuker/lamejs) | 纯 JS 实现的 MP3 编码器 |
| 多线程 | Web Worker + 线程池 | 并行处理多个文件，提升批量转换速度 |
| 打包下载 | [JSZip](https://stuk.github.io/jszip/) + [FileSaver.js](https://github.com/eligrey/FileSaver.js) | 浏览器端 ZIP 压缩与文件保存 |

---

## 🚀 快速开始

### 方式一：直接打开

下载 `CarTunes.html`，用 **Chrome / Edge 浏览器**直接打开即可使用。

> 建议使用 Chromium 内核浏览器以获得最佳兼容性。

### 方式二：本地服务器（可选）

```bash
# 使用 Python 内置服务器
python3 -m http.server 8000

# 或使用 Node.js
npx serve .

# 然后浏览器访问 http://localhost:8000
```

### 使用步骤

1. **添加文件** — 将音频文件拖入拖拽区，或点击选择文件（支持多选）
2. **选择质量** — 根据需要在 320 / 192 / 128 kbps 之间切换
3. **自动转换** — 文件添加后自动开始转换，实时显示进度
4. **下载文件** — 转换完成后点击「下载全部」按钮，自动打包为 ZIP

---

## 📁 支持的格式

| 输入格式 | 说明 |
|----------|------|
| FLAC | 无损音频编码，最常用的高保真格式 |
| WAV | 未压缩 PCM 音频 |
| APE | Monkey's Audio 无损压缩 |
| M4A | AAC 编码音频 |
| OGG | Ogg Vorbis 音频 |
| MP3 | 已有 MP3 也会重新编码为统一参数 |

| 输出参数 | 值 |
|----------|-----|
| 格式 | MP3 (MPEG-1 Layer III) |
| 采样率 | 44.1 kHz |
| 声道 | 与源文件一致（单声道 / 立体声） |
| 比特率 | 可选 320 / 192 / 128 kbps |

---

## 🏗️ 项目结构

```
CarTunes.html          # 单文件应用，包含全部 HTML/CSS/JS
├── <style>            # 响应式样式（三栏 / 两栏 / 单栏自适应）
├── <script>           # JSZip + FileSaver.js + lamejs（内联）
├── #worker-code       # Web Worker 脚本模板（MP3 编码逻辑）
└── <script>           # 应用主逻辑
    ├── WorkerPool     #   线程池管理，任务调度
    ├── App.init()     #   初始化 AudioContext + Worker
    ├── App.runPipeline() #  解码 → 重采样 → 编码流水线
    └── App.downloadAll()  #  ZIP 打包下载
```

> 整个项目是**单 HTML 文件**，所有依赖库均内联打包，无需额外文件，可离线使用。

---

## ⚙️ 性能与限制

### 性能表现

- **并行度**：自动检测 `navigator.hardwareConcurrency`，最多使用 4 个 Worker 线程
- **流水线**：最多 2 条文件处理流水线并行运行
- **编码速度**：取决于 CPU 性能，典型场景下 320 kbps 编码约实时速度的 3-5 倍

### 已知限制

- 浏览器 `decodeAudioData()` 对格式的支持取决于浏览器本身
- 超大文件（>500 MB）可能因内存限制导致失败
- 建议使用 Chrome 90+ 或 Edge 90+ 以获得最佳兼容性
- iOS Safari 对 Web Worker 数量有限制

---

## 📝 质量选择建议

| 比特率 | 适用场景 | 文件大小参考（4分钟歌曲） |
|--------|----------|--------------------------|
| 320 kbps | 高品质车载音响系统，追求音质 | ~9.6 MB |
| 192 kbps | 日常使用，音质与体积均衡 | ~5.8 MB |
| 128 kbps | 存储空间有限的设备 | ~3.8 MB |

---

## 🛠️ 技术实现细节

### Worker 线程池

```javascript
// 自动检测 CPU 核心数，创建对应数量的 Worker
const cpuCount = navigator.hardwareConcurrency || 4;
this.pool = new WorkerPool(this.workerUrl, Math.min(cpuCount, 4));
```

每个 Worker 独立完成一个文件的 MP3 编码任务，主线程负责任务调度和进度更新。

### 离线 MP3 编码

lamejs 源码以 Base64 编码内嵌在 HTML 中，运行时解码并拼接进 Worker 脚本，实现**完全离线**的 MP3 编码，无需任何外部网络请求。

### 重采样

使用 `OfflineAudioContext` 进行离线音频渲染，将任意采样率的高分辨率音频统一降采样至 44.1 kHz，确保车机播放兼容性。

---

## 🔧 自定义配置

如需修改默认参数，编辑 `CarTunes.html` 中的对应代码：

```javascript
// 修改默认比特率（第 680 行附近）
currentBitRate: 320,  // 改为 192 或 128

// 修改最大并行流水线数（第 685 行附近）
MAX_PIPELINES: 2,     // 增大可提升速度，但占用更多内存

// 修改输出采样率（第 625 行附近）
audioBuffer = await this.resample(audioBuffer, 44100);  // 改为 48000 等
```

---

## ❓ 常见问题

<details>
<summary><b>转换失败怎么办？</b></summary>

点击文件项右侧的「失败」标签可查看具体错误信息。常见原因：
- 文件损坏或格式不被浏览器支持
- 内存不足（文件过大）
- 浏览器版本过低

建议使用 Chrome 90+ 浏览器重试。
</details>

<details>
<summary><b>支持哪些车机系统？</b></summary>

44.1 kHz 采样率的 MP3 是兼容性最广的车机音频格式，适用于绝大多数原车音响、后装车机、中控大屏系统。
</details>

<details>
<summary><b>文件会被上传到服务器吗？</b></summary>

**不会。** 所有处理完全在浏览器本地完成，不涉及任何网络上传。你可以断开网络后使用，功能完全不受影响。
</details>

<details>
<summary><b>可以离线使用吗？</b></summary>

可以。所有依赖库（JSZip、FileSaver、lamejs）均已内联打包，下载 HTML 文件后断网也能正常使用。
</details>

---

## 📜 开源协议

本项目仅供学习交流使用。内含的第三方库各自遵循其原始许可：

- [JSZip](https://github.com/Stuk/jszip) — MIT / GPLv3
- [FileSaver.js](https://github.com/eligrey/FileSaver.js) — MIT
- [lamejs](https://github.com/zhuker/lamejs) — LGPL

---

## 🙏 致谢

感谢以下开源项目让 CarTunes 成为可能：

- [JSZip](https://github.com/Stuk/jszip) — 浏览器端 ZIP 压缩
- [FileSaver.js](https://github.com/eligrey/FileSaver.js) — 文件保存
- [lamejs](https://github.com/zhuker/lamejs) — 纯 JS MP3 编码器
