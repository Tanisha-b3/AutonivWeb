import fs from 'fs';
import path from 'path';

export class AudioRecorder {
  constructor(sampleRate = 24000) {
    this.sampleRate = sampleRate;
    this.startTime = Date.now();
    // 16MB buffer pre-allocation (approx. 5.5 minutes of 24kHz 16-bit mono audio)
    this.buffer = Buffer.alloc(16 * 1024 * 1024);
    this.maxByteOffset = 0;
  }

  /**
   * Resamples a PCM16 buffer from 16000Hz to 24000Hz using linear interpolation
   */
  resample16To24(pcmBuffer) {
    const inputSamples = pcmBuffer.length / 2;
    const outputSamples = Math.floor(inputSamples * 1.5);
    const outputBuffer = Buffer.alloc(outputSamples * 2);

    for (let i = 0; i < outputSamples; i++) {
      const inputIndex = i / 1.5;
      const indexLow = Math.floor(inputIndex);
      const indexHigh = Math.min(inputSamples - 1, indexLow + 1);
      const weight = inputIndex - indexLow;

      const s0 = pcmBuffer.readInt16LE(indexLow * 2);
      const s1 = pcmBuffer.readInt16LE(indexHigh * 2);

      const interpolated = Math.round(s0 * (1 - weight) + s1 * weight);
      outputBuffer.writeInt16LE(interpolated, i * 2);
    }
    return outputBuffer;
  }

  writeAudio(pcmBuffer, timestamp, sourceSampleRate = 24000) {
    let activeBuffer = pcmBuffer;
    if (sourceSampleRate === 16000) {
      activeBuffer = this.resample16To24(pcmBuffer);
    }

    const elapsedMs = timestamp - this.startTime;
    const sampleOffset = Math.floor(elapsedMs * (this.sampleRate / 1000));
    const byteOffset = sampleOffset * 2;

    if (byteOffset + activeBuffer.length > this.buffer.length) {
      // Resize buffer dynamically if it exceeds 16MB
      const newSize = Math.max(this.buffer.length * 2, byteOffset + activeBuffer.length);
      const newBuffer = Buffer.alloc(newSize);
      this.buffer.copy(newBuffer);
      this.buffer = newBuffer;
    }

    // Mix PCM16 samples sequentially or simultaneously
    for (let i = 0; i < activeBuffer.length; i += 2) {
      const targetOffset = byteOffset + i;
      if (targetOffset >= this.buffer.length) break;

      const srcVal = activeBuffer.readInt16LE(i);
      const existingVal = this.buffer.readInt16LE(targetOffset);

      let mixed = srcVal + existingVal;
      if (mixed > 32767) mixed = 32767;
      if (mixed < -32768) mixed = -32768;

      this.buffer.writeInt16LE(mixed, targetOffset);
    }

    const endOffset = byteOffset + activeBuffer.length;
    if (endOffset > this.maxByteOffset) {
      this.maxByteOffset = endOffset;
    }
  }

  getWavBuffer() {
    const dataSize = this.maxByteOffset;
    const wavHeader = Buffer.alloc(44);

    // RIFF Header
    wavHeader.write('RIFF', 0);
    wavHeader.writeInt32LE(36 + dataSize, 4);
    wavHeader.write('WAVE', 8);

    // Format Chunk
    wavHeader.write('fmt ', 12);
    wavHeader.writeInt32LE(16, 16);
    wavHeader.writeInt16LE(1, 20);
    wavHeader.writeInt16LE(1, 22); // Mono channel
    wavHeader.writeInt32LE(this.sampleRate, 24);
    wavHeader.writeInt32LE(this.sampleRate * 2, 28);
    wavHeader.writeInt16LE(2, 32);
    wavHeader.writeInt16LE(16, 34);

    // Data Chunk
    wavHeader.write('data', 36);
    wavHeader.writeInt32LE(dataSize, 40);

    return Buffer.concat([wavHeader, this.buffer.slice(0, dataSize)]);
  }
}
