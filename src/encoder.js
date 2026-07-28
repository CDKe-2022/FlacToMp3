// src/encoder.js

/**
 * MP3 编码器模块
 * 依赖：lamejs
 * 特性：固定参数 (320kbps, CBR, 44.1kHz, Stereo)，确保老款车机兼容
 */

export default class Encoder {
    constructor() {
        // 车机兼容模式参数（写死，不暴露给用户）
        this.config = {
            sampleRate: 44100,
            numChannels: 2,
            bitRate: 320, // 320 kbps
            mode: 'CBR'   // Constant Bit Rate
        };
    }

    /**
     * 将 AudioBuffer (PCM数据) 编码为 MP3 Blob
     * @param {AudioBuffer} audioBuffer - 解码后的音频数据
     * @returns {Blob} MP3 文件 Blob
     */
    encode(audioBuffer) {
        return new Promise((resolve, reject) => {
            try {
                // 检查 lamejs 是否加载
                if (typeof lamejs === 'undefined') {
                    throw new Error("lamejs 库未加载");
                }

                const sampleRate = this.config.sampleRate;
                const channels = this.config.numChannels;
                const kbps = this.config.bitRate;

                // 1. 初始化 MP3 编码器
                const mp3encoder = new lamejs.Mp3Encoder(channels, sampleRate, kbps);
                const mp3Data = [];

                // 2. 从 AudioBuffer 提取 PCM 数据 (Float32 -> Int16)
                // 左声道
                const left = audioBuffer.getChannelData(0);
                // 右声道 (如果是单声道，复制左声道)
                const right = audioBuffer.numberOfChannels > 1 
                    ? audioBuffer.getChannelData(1) 
                    : audioBuffer.getChannelData(0);

                // 转换 Float32 (-1.0 到 1.0) 到 Int16 (-32768 到 32767)
                const leftInt = this.floatTo16Bit(left);
                const rightInt = this.floatTo16Bit(right);

                // 3. 编码
                // 这里的 sampleBlockSize 建议为 1152，这是 MP3 帧大小的标准
                const sampleBlockSize = 1152;
                
                for (let i = 0; i < leftInt.length; i += sampleBlockSize) {
                    const leftChunk = leftInt.subarray(i, i + sampleBlockSize);
                    const rightChunk = rightInt.subarray(i, i + sampleBlockSize);
                    
                    // 编码这一块数据
                    const mp3buf = mp3encoder.encodeBuffer(leftChunk, rightChunk);
                    if (mp3buf.length > 0) {
                        mp3Data.push(mp3buf);
                    }
                }

                // 4. 完成编码
                const mp3buf = mp3encoder.flush();
                if (mp3buf.length > 0) {
                    mp3Data.push(mp3buf);
                }

                // 5. 合并数据为 Blob
                const blob = new Blob(mp3Data, { type: 'audio/mpeg' });
                resolve(blob);

            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * 辅助函数：Float32 转 Int16
     */
    floatTo16Bit(floatArray) {
        const int16Array = new Int16Array(floatArray.length);
        for (let i = 0; i < floatArray.length; i++) {
            const s = Math.max(-1, Math.min(1, floatArray[i]));
            int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }
        return int16Array;
    }
}
