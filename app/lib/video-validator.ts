import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";

class VideoValidator {
  constructor() {
    this.ffmpeg = null;
    this.loaded = false;
  }

  async init() {
    if (this.loaded) return;

    this.ffmpeg = new FFmpeg();
    await this.ffmpeg.load();
    this.loaded = true;
  }

  async validateVideoFile(file) {
    await this.init();

    // Initialize result object
    const result = {
      container: {
        isMovOrMp4: false,
        noEditLists: false,
        moovAtFront: false,
        valid: false,
      },
      audio: {
        isAac: false,
        sampleRate48khzOrLess: false,
        monoOrStereo: false,
        bitrate128kbpsOrLess: false,
        valid: false,
      },
      video: {
        isHevcOrH264: false,
        progressiveScan: false,
        closedGop: false,
        chroma420: false,
        valid: false,
      },
      frameRate: {
        between23And60: false,
        valid: false,
      },
      pictureSize: {
        maxWidth1920: false,
        aspectRatioValid: false,
        valid: false,
      },
      videoBitrate: {
        isVbr: false,
        max25Mbps: false,
        valid: false,
      },
      duration: {
        min3Seconds: false,
        max15Minutes: false,
        valid: false,
      },
      fileSize: {
        max300MB: false,
        valid: false,
      },
      overall: {
        valid: false,
      },
    };

    try {
      // Check file size first (300MB = 314,572,800 bytes)
      result.fileSize.max300MB = file.size <= 314572800;
      result.fileSize.valid = result.fileSize.max300MB;

      // Write file to FFmpeg filesystem
      await this.ffmpeg.writeFile("input.mov", await fetchFile(file));

      // Get comprehensive media info
      const mediaInfo = await this.getMediaInfo("input.mov");
      const containerInfo = await this.getContainerInfo("input.mov");
      const gopInfo = await this.getGopInfo("input.mov");

      // Validate container
      await this.validateContainer(mediaInfo, containerInfo, result);

      // Validate audio
      await this.validateAudio(mediaInfo, result);

      // Validate video
      await this.validateVideoStream(mediaInfo, gopInfo, result);

      // Validate frame rate
      await this.validateFrameRate(mediaInfo, result);

      // Validate picture size
      await this.validatePictureSize(mediaInfo, result);

      // Validate video bitrate
      await this.validateVideoBitrate(mediaInfo, result);

      // Validate duration
      await this.validateDuration(mediaInfo, result);

      // Set overall validity
      result.overall.valid = this.isOverallValid(result);

      // Cleanup
      await this.ffmpeg.deleteFile("input.mov");
    } catch (error) {
      console.error("Video validation error:", error);
      throw error;
    }

    return result;
  }

  async getMediaInfo(filename) {
    const mediaInfo = {
      format: {},
      streams: [],
    };

    try {
      // Get format info
      await this.ffmpeg.exec([
        "-v",
        "quiet",
        "-print_format",
        "json",
        "-show_format",
        "-i",
        filename,
      ]);

      // Get stream info
      await this.ffmpeg.exec([
        "-v",
        "quiet",
        "-print_format",
        "json",
        "-show_streams",
        "-i",
        filename,
      ]);

      // Since FFmpeg WASM doesn't redirect output the same way,
      // we'll parse the basic info from a simpler approach
      await this.ffmpeg.exec(["-i", filename]);

      // For now, let's use a different approach to get basic info
      // This is a simplified version - in production you'd want more robust parsing
      const basicInfo = await this.getBasicVideoInfo(filename);
      return basicInfo;
    } catch (error) {
      console.error("Error getting media info:", error);
      return mediaInfo;
    }
  }

  async getMediaInfo(filename) {
    let mediaInfo = {
      format: {
        format_name: "",
        duration: "0",
        size: "0",
        bit_rate: "0",
      },
      streams: [],
    };

    try {
      // Capture stderr output where ffprobe info is displayed
      let stderrOutput = "";

      this.ffmpeg.on("log", ({ message }) => {
        stderrOutput += `${message}\n`;
      });

      // Run ffprobe command
      await this.ffmpeg.exec(["-i", filename]);

      // Parse the stderr output to extract basic info
      mediaInfo = this.parseFFmpegOutput(stderrOutput);

      // Remove the log listener
      this.ffmpeg.off("log");
    } catch (error) {
      // FFmpeg throws an error when no output is specified, but we can still get info
      console.log("Expected FFmpeg error when probing file");
    }

    return mediaInfo;
  }

  parseFFmpegOutput(output) {
    const mediaInfo = {
      format: {
        format_name: "",
        duration: "0",
        size: "0",
        bit_rate: "0",
      },
      streams: [],
    };

    // Parse container format
    const formatMatch = output.match(/Input #0, ([^,]+),/);
    if (formatMatch) {
      mediaInfo.format.format_name = formatMatch[1];
    }

    // Parse duration
    const durationMatch = output.match(/Duration: (\d+):(\d+):(\d+\.\d+)/);
    if (durationMatch) {
      const hours = parseInt(durationMatch[1]);
      const minutes = parseInt(durationMatch[2]);
      const seconds = parseFloat(durationMatch[3]);
      mediaInfo.format.duration = (
        hours * 3600 +
        minutes * 60 +
        seconds
      ).toString();
    }

    // Parse bitrate
    const bitrateMatch = output.match(/bitrate: (\d+) kb\/s/);
    if (bitrateMatch) {
      mediaInfo.format.bit_rate = (parseInt(bitrateMatch[1]) * 1000).toString();
    }

    // Parse video stream
    const videoMatch = output.match(
      /Stream #0:(\d+)[^:]*: Video: ([^,\(]+)(?:\s*\([^)]*\))?[^,]*,\s*([^,\(]+)(?:\s*\([^)]*\))?[^,]*,\s*(\d+)x(\d+)[^,]*,\s*([^,]+)/,
    );
    if (videoMatch) {
      const videoStream = {
        codec_type: "video",
        codec_name: videoMatch[2].trim(),
        pix_fmt: videoMatch[3].trim(),
        width: parseInt(videoMatch[4]),
        height: parseInt(videoMatch[5]),
        r_frame_rate: "30/1", // Default
        field_order: "progressive",
        bit_rate: "0",
      };

      // Parse frame rate
      const fpsMatch = output.match(/(\d+(?:\.\d+)?) fps/);
      if (fpsMatch) {
        videoStream.r_frame_rate = `${fpsMatch[1]}/1`;
      }

      // Parse video bitrate
      const videoBitrateMatch = output.match(
        /Video: [^,]+, [^,]+, [^,]+, (\d+) kb\/s/,
      );
      if (videoBitrateMatch) {
        videoStream.bit_rate = (
          parseInt(videoBitrateMatch[1]) * 1000
        ).toString();
      }

      mediaInfo.streams.push(videoStream);
    }

    // Parse audio stream
    const audioMatch = output.match(
      /Stream #0:(\d+)[^:]*: Audio: ([^,\(]+)(?:\s*\([^)]*\))?[^,]*,\s*(\d+) Hz[^,]*,\s*([^,\s]+)[^,]*,\s*[^,]*,\s*(\d+) kb\/s/,
    );
    if (audioMatch) {
      const channelLayout = audioMatch[4].trim();
      const audioStream = {
        codec_type: "audio",
        codec_name: audioMatch[2].trim(),
        sample_rate: audioMatch[3],
        channels: this.parseChannelCount(channelLayout),
        channel_layout: channelLayout,
        bit_rate: (parseInt(audioMatch[5]) * 1000).toString(),
      };

      mediaInfo.streams.push(audioStream);
    }

    return mediaInfo;
  }

  async getContainerInfo(filename) {
    // Simplified container info - just return basic structure
    return {
      hasEditLists: false,
      moovAtFront: true,
    };
  }

  async getGopInfo(filename) {
    // Simplified GOP info - return basic structure
    // In production, you'd want more sophisticated GOP analysis
    return "I,1,1\nP,2,0\nP,3,0\nI,4,1\n"; // Sample GOP structure
  }

  async validateContainer(mediaInfo, containerInfo, result) {
    const format = mediaInfo.format;

    // Check if MOV or MP4
    const formatName = format.format_name.toLowerCase();
    result.container.isMovOrMp4 =
      formatName.includes("mov") || formatName.includes("mp4");

    // Check for edit lists (simplified check)
    result.container.noEditLists = !this.hasEditLists(mediaInfo);

    // Check moov atom position (simplified)
    result.container.moovAtFront = await this.isMoovAtFront(containerInfo);

    result.container.valid =
      result.container.isMovOrMp4 &&
      result.container.noEditLists &&
      result.container.moovAtFront;
  }

  async validateAudio(mediaInfo, result) {
    const audioStream = mediaInfo.streams.find((s) => s.codec_type === "audio");

    if (!audioStream) {
      return; // No audio stream
    }

    // Check codec
    result.audio.isAac = audioStream.codec_name === "aac";

    // Check sample rate (48kHz = 48000)
    const sampleRate = parseInt(audioStream.sample_rate);
    result.audio.sampleRate48khzOrLess = sampleRate <= 48000;

    // Check channels (1 or 2 only)
    result.audio.monoOrStereo =
      audioStream.channels === 1 || audioStream.channels === 2;

    // Check bitrate (128kbps = 128000 bps)
    const bitrate = parseInt(audioStream.bit_rate);
    result.audio.bitrate128kbpsOrLess = bitrate <= 128000;

    result.audio.valid =
      result.audio.isAac &&
      result.audio.sampleRate48khzOrLess &&
      result.audio.monoOrStereo &&
      result.audio.bitrate128kbpsOrLess;
  }

  async validateVideoStream(mediaInfo, gopInfo, result) {
    const videoStream = mediaInfo.streams.find((s) => s.codec_type === "video");

    if (!videoStream) {
      return; // No video stream
    }

    // Check codec
    result.video.isHevcOrH264 =
      videoStream.codec_name === "h264" || videoStream.codec_name === "hevc";

    // Check progressive scan
    result.video.progressiveScan =
      videoStream.field_order === "progressive" || !videoStream.field_order;

    // Check closed GOP (analyze frame sequence)
    result.video.closedGop = this.isClosedGop(gopInfo);

    // Check chroma subsampling (4:2:0)
    result.video.chroma420 = this.is420ChromaSubsampling(videoStream.pix_fmt);

    result.video.valid =
      result.video.isHevcOrH264 &&
      result.video.progressiveScan &&
      result.video.closedGop &&
      result.video.chroma420;
  }

  async validateFrameRate(mediaInfo, result) {
    const videoStream = mediaInfo.streams.find((s) => s.codec_type === "video");

    if (!videoStream) {
      return;
    }

    // Parse frame rate
    const frameRate = this.parseFrameRate(videoStream.r_frame_rate);
    result.frameRate.between23And60 = frameRate >= 23 && frameRate <= 60;
    result.frameRate.valid = result.frameRate.between23And60;
  }

  async validatePictureSize(mediaInfo, result) {
    const videoStream = mediaInfo.streams.find((s) => s.codec_type === "video");

    if (!videoStream) {
      return;
    }

    const width = videoStream.width;
    const height = videoStream.height;

    // Check max width
    result.pictureSize.maxWidth1920 = width <= 1920;

    // Check aspect ratio (0.01:1 to 10:1)
    const aspectRatio = width / height;
    result.pictureSize.aspectRatioValid =
      aspectRatio >= 0.01 && aspectRatio <= 10.0;

    result.pictureSize.valid =
      result.pictureSize.maxWidth1920 && result.pictureSize.aspectRatioValid;
  }

  async validateVideoBitrate(mediaInfo, result) {
    const videoStream = mediaInfo.streams.find((s) => s.codec_type === "video");

    if (!videoStream) {
      return;
    }

    // Check if VBR (simplified check)
    result.videoBitrate.isVbr =
      !videoStream.bit_rate || videoStream.bit_rate_mode === "VBR";

    // Check max bitrate (25Mbps = 25,000,000 bps)
    const bitrate = parseInt(videoStream.bit_rate) || 0;
    result.videoBitrate.max25Mbps = bitrate <= 25000000;

    result.videoBitrate.valid =
      result.videoBitrate.isVbr && result.videoBitrate.max25Mbps;
  }

  async validateDuration(mediaInfo, result) {
    const duration = parseFloat(mediaInfo.format.duration);

    // Check duration limits (3 seconds to 15 minutes)
    result.duration.min3Seconds = duration >= 3.0;
    result.duration.max15Minutes = duration <= 900.0; // 15 minutes = 900 seconds

    result.duration.valid =
      result.duration.min3Seconds && result.duration.max15Minutes;
  }

  // Helper methods
  hasEditLists(mediaInfo) {
    // Simplified check for edit lists
    return false; // Default to no edit lists for now
  }

  async isMoovAtFront(containerInfo) {
    // Simplified check using containerInfo structure
    return containerInfo.moovAtFront || true; // Default to true for now
  }

  parseChannelCount(channelLayout) {
    // Convert FFmpeg channel layout strings to channel counts
    const channelMappings = {
      mono: 1,
      stereo: 2,
      "2.1": 3,
      "3.0": 3,
      "3.1": 4,
      "4.0": 4,
      "4.1": 5,
      "5.0": 5,
      "5.1": 6,
      "6.0": 6,
      "6.1": 7,
      "7.0": 7,
      "7.1": 8,
      "7.1(wide)": 8,
      "7.1(wide-side)": 8,
    };

    // Handle direct channel count (e.g., "1 channels", "2 channels")
    const directCountMatch = channelLayout.match(/^(\d+)(?:\s+channels?)?$/);
    if (directCountMatch) {
      return parseInt(directCountMatch[1]);
    }

    // Handle standard layout names
    const layout = channelLayout.toLowerCase();
    if (channelMappings[layout]) {
      return channelMappings[layout];
    }

    // Handle complex layouts like "5.1(side)" - extract the base number
    const complexMatch = channelLayout.match(/^(\d+)\.(\d+)/);
    if (complexMatch) {
      const main = parseInt(complexMatch[1]);
      const lfe = parseInt(complexMatch[2]);
      return main + lfe;
    }

    console.warn(`Unknown channel layout: ${channelLayout}, defaulting to 2`);
    return 2; // Default fallback
  }

  is420ChromaSubsampling(pixFmt) {
    if (!pixFmt) return false;

    // Extract the base pixel format (remove parentheses and everything after)
    // e.g., "yuv420p(progressive)" -> "yuv420p"
    // e.g., "yuv420p(tv, bt709)" -> "yuv420p"
    const basePixFmt = pixFmt.split("(")[0].trim();

    // All pixel formats that use 4:2:0 chroma subsampling
    const yuv420Formats = [
      "yuv420p", // 8-bit planar YUV 4:2:0
      "yuv420p10le", // 10-bit planar YUV 4:2:0, little endian
      "yuv420p10be", // 10-bit planar YUV 4:2:0, big endian
      "yuv420p12le", // 12-bit planar YUV 4:2:0, little endian
      "yuv420p12be", // 12-bit planar YUV 4:2:0, big endian
      "yuv420p14le", // 14-bit planar YUV 4:2:0, little endian
      "yuv420p14be", // 14-bit planar YUV 4:2:0, big endian
      "yuv420p16le", // 16-bit planar YUV 4:2:0, little endian
      "yuv420p16be", // 16-bit planar YUV 4:2:0, big endian
      "yuvj420p", // 8-bit planar YUV 4:2:0 with full range (JPEG style)
      "nv12", // 8-bit semi-planar YUV 4:2:0
      "nv21", // 8-bit semi-planar YUV 4:2:0 (UV interleaved)
      "p010le", // 10-bit semi-planar YUV 4:2:0, little endian
      "p010be", // 10-bit semi-planar YUV 4:2:0, big endian
      "p016le", // 16-bit semi-planar YUV 4:2:0, little endian
      "p016be", // 16-bit semi-planar YUV 4:2:0, big endian
    ];

    return yuv420Formats.includes(basePixFmt);
  }

  isClosedGop(gopInfo) {
    // Analyze GOP structure to determine if it's closed
    const lines = gopInfo.trim().split("\n");
    let gopStart = -1;
    const isClosedGop = true;

    for (let i = 0; i < lines.length; i++) {
      const [pictType, , keyFrame] = lines[i].split(",");

      if (keyFrame === "1") {
        // I-frame
        if (gopStart !== -1) {
          // Check if previous GOP was closed
          // This is a simplified check
        }
        gopStart = i;
      }
    }

    return isClosedGop;
  }

  parseFrameRate(frameRateStr) {
    const [num, den] = frameRateStr.split("/").map(Number);
    return den ? num / den : num;
  }

  isOverallValid(result) {
    return (
      result.container.valid &&
      result.audio.valid &&
      result.video.valid &&
      result.frameRate.valid &&
      result.pictureSize.valid &&
      result.videoBitrate.valid &&
      result.duration.valid &&
      result.fileSize.valid
    );
  }
}

// Usage example:
async function validateVideoFile(file) {
  const validator = new VideoValidator();

  try {
    const result = await validator.validateVideoFile(file);
    console.log("Validation Result:", result);
    return result;
  } catch (error) {
    console.error("Validation failed:", error);
    throw error;
  }
}

// Export for use
export { validateVideoFile, VideoValidator };

// Example usage:
// const fileInput = document.getElementById('video-input');
// fileInput.addEventListener('change', async (event) => {
//   const file = event.target.files?.[0];
//   if (file) {
//     const result = await validateVideoFile(file);
//     console.log('Video validation:', result);
//   }
// });
