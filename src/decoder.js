// src/decoder.js

/**
 * 解码器模块
 * 功能：将输入文件解码为 AudioBuffer (PCM)
 * 策略：优先使用浏览器原生 AudioContext (性能最佳)，失败时尝试特殊库
 */

export default class Decoder {
    constructor() {
        this.audioContext = null;
    }

    /**
     * 初始化 AudioContext
     */
    initContext() {
        if (!this.audioContext) {
            // 创建 AudioContext，目标采样率锁定 44.1kHz (车机标准)
            // 注意：有些浏览器强制 48kHz，我们在 Encoder 处理重采样更稳妥，
            // 但这里尝试请求 44100。
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext({ sampleRate: 44100 });
        }
        // 确保恢复运行（浏览器策略：用户交互后才能播放/解码）
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        return this.audioContext;
    }

    /**
     * 解码文件
     * @param {ArrayBuffer} arrayBuffer - 文件二进制数据
     * @returns {Promise<AudioBuffer>} 解码后的音频数据
     */
    async decode(arrayBuffer) {
        const ctx = this.initContext();

        try {
            // 尝试使用原生解码
            // 支持格式：MP3, WAV, M4A(AAC), OGG, 以及现代浏览器的 FLAC
            const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
            return audioBuffer;
            
        } catch (error) {
            console.error("原生解码失败，尝试后备方案:", error);
            
            // 后备方案：如果是 FLAC 且原生不支持，这里可以引入 libflac.js
            // 目前阶段为了保持轻量，我们先抛出错误，或者提示用户浏览器不支持
            // 如果必须支持所有 FLAC，这里需要引入巨大的解码库，违背了 v3.0 初衷
            
            throw new Error("无法解码该文件格式，请尝试使用 Chrome 或 Edge 最新版浏览器。");
        }
    }
}
