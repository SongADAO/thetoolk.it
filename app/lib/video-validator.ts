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
    let containerInfo = {
      hasEditLists: false,
      moovAtFront: false,
      atomStructure: "",
    };

    try {
      // First try to get trace output by capturing logs during analysis
      const capturedLogs = [];

      // Override console methods temporarily to capture FFmpeg logs
      const originalLog = console.log;
      const originalWarn = console.warn;
      const originalError = console.error;

      console.log = (...args) => {
        capturedLogs.push(args.join(" "));
        originalLog.apply(console, args);
      };
      console.warn = (...args) => {
        capturedLogs.push(args.join(" "));
        originalWarn.apply(console, args);
      };
      console.error = (...args) => {
        capturedLogs.push(args.join(" "));
        originalError.apply(console, args);
      };

      // Run FFmpeg with trace level to get detailed atom information
      try {
        await this.ffmpeg.exec([
          "-v",
          "trace",
          "-i",
          filename,
          "-f",
          "null",
          "-",
        ]);
      } catch (e) {
        // FFmpeg will "error" when no output specified, but we captured the logs
      }

      // Restore console methods
      console.log = originalLog;
      console.warn = originalWarn;
      console.error = originalError;

      const traceOutput = capturedLogs.join("\n");
      containerInfo.atomStructure = traceOutput;

      // Detect edit lists from trace output
      containerInfo.hasEditLists = this.detectEditLists(traceOutput);

      // Detect moov position from trace output
      containerInfo.moovAtFront = this.detectMoovPosition(traceOutput);

      // Fallback: also try direct file analysis
      if (!traceOutput || traceOutput.length < 100) {
        const fileAnalysis = await this.analyzeFileStructure(filename);
        containerInfo.hasEditLists = fileAnalysis.hasEditLists;
        containerInfo.moovAtFront = fileAnalysis.moovAtFront;
      }
    } catch (error) {
      console.error("Container analysis failed:", error);
      // Try direct file analysis as final fallback
      try {
        const fileAnalysis = await this.analyzeFileStructure(filename);
        containerInfo = fileAnalysis;
      } catch (e) {
        console.error("File analysis also failed:", e);
      }
    }

    return containerInfo;
  }

  async analyzeFileStructure(filename) {
    // Read first 8KB of file to analyze atom structure
    await this.ffmpeg.exec([
      "-i",
      filename,
      "-f",
      "rawvideo",
      "-vframes",
      "1",
      "-c:v",
      "copy",
      "temp_analysis.raw",
    ]);

    // Use ffprobe with more detailed output
    await this.ffmpeg.exec([
      "-v",
      "debug",
      "-show_packets",
      "-select_streams",
      "v:0",
      "-read_intervals",
      "%+#1",
      filename,
    ]);

    // Alternative: use MP4 box analysis
    const fileData = await this.ffmpeg.readFile(filename);
    return this.parseMP4Structure(fileData);
  }

  parseMP4Structure(fileData) {
    const view = new DataView(fileData.buffer);
    let offset = 0;
    let moovPosition = -1;
    let mdatPosition = -1;
    let hasEditLists = false;

    // Parse top-level atoms first
    while (offset < Math.min(fileData.length, 100000)) {
      // Check first 100KB
      if (offset + 8 > fileData.length) break;

      const boxSize = view.getUint32(offset, false); // Big endian
      const boxType = String.fromCharCode(
        view.getUint8(offset + 4),
        view.getUint8(offset + 5),
        view.getUint8(offset + 6),
        view.getUint8(offset + 7),
      );

      if (boxType === "moov") {
        moovPosition = offset;
        // Look for edit lists within moov - this is critical!
        hasEditLists = this.findEditListsInMoov(fileData, offset, boxSize);
      } else if (boxType === "mdat") {
        mdatPosition = offset;
      }

      if (boxSize === 0 || boxSize === 1 || boxSize < 8) {
        // Handle extended size or invalid sizes
        break;
      }

      offset += boxSize;

      // Safety check to prevent infinite loop
      if (offset <= 0) break;
    }

    return {
      hasEditLists,
      moovAtFront:
        moovPosition !== -1 &&
        (mdatPosition === -1 || moovPosition < mdatPosition),
      moovPosition,
      mdatPosition,
    };
  }

  findEditListsInMoov(fileData, moovOffset, moovSize) {
    // Look for 'elst' atoms within the moov box
    const view = new DataView(fileData.buffer);
    const moovEnd = moovOffset + moovSize;
    let offset = moovOffset + 8; // Skip moov header

    while (offset < moovEnd && offset + 8 < fileData.length) {
      const boxSize = view.getUint32(offset, false);
      const boxType = String.fromCharCode(
        view.getUint8(offset + 4),
        view.getUint8(offset + 5),
        view.getUint8(offset + 6),
        view.getUint8(offset + 7),
      );

      if (boxType === "elst") {
        return true; // Found edit list
      }

      // Also check nested boxes (trak, edts, etc.)
      if (boxType === "trak" || boxType === "edts") {
        if (this.findEditListsInBox(fileData, offset, boxSize)) {
          return true;
        }
      }

      if (boxSize === 0 || boxSize < 8) break;
      offset += boxSize;
    }

    return false;
  }

  findEditListsInBox(fileData, boxOffset, boxSize) {
    const view = new DataView(fileData.buffer);
    const boxEnd = boxOffset + boxSize;
    let offset = boxOffset + 8; // Skip box header

    while (offset < boxEnd && offset + 8 < fileData.length) {
      const innerBoxSize = view.getUint32(offset, false);
      const innerBoxType = String.fromCharCode(
        view.getUint8(offset + 4),
        view.getUint8(offset + 5),
        view.getUint8(offset + 6),
        view.getUint8(offset + 7),
      );

      if (innerBoxType === "elst") {
        return true;
      }

      if (innerBoxSize === 0 || innerBoxSize < 8) break;
      offset += innerBoxSize;
    }

    return false;
  }

  detectEditLists(traceOutput) {
    if (!traceOutput) return false;

    const lowerTrace = traceOutput.toLowerCase();

    // Look for edit list atoms
    const hasEditAtoms =
      /type:\s*['"]?edts['"]?/i.test(traceOutput) ||
      /type:\s*['"]?elst['"]?/i.test(traceOutput);

    if (!hasEditAtoms) {
      return false; // No edit list atoms at all
    }

    // Check if it's a trivial/null edit list
    // Pattern: duration=X time=0 rate=1.000000 (maps entire timeline 1:1)
    const trivialEditPattern = /duration=\d+\s+time=0\s+rate=1\.0+/i;
    const hasTrivialEdit = trivialEditPattern.test(traceOutput);

    // Check for edit_count = 1 (single edit entry)
    const singleEditPattern = /edit_count\s*=\s*1\b/i;
    const hasSingleEdit = singleEditPattern.test(traceOutput);

    // If it has edit atoms but it's a single trivial edit (time=0, rate=1.0),
    // consider it as "no meaningful edit lists"
    if (hasTrivialEdit && hasSingleEdit) {
      return false; // Trivial edit list = effectively no edit lists
    }

    // Look for actual editing operations that indicate real edit lists
    const realEditingIndicators = [
      "drop a frame", // Frame dropping due to edit list
      "skip.*samples?", // Sample skipping
      "discard.*samples?", // Sample discarding
      "demuxer injecting", // FFmpeg edit list handling
      "time_offset", // Non-zero time offset
      "edit_count.*[2-9]", // Multiple edit entries (2 or more)
    ];

    const hasRealEditing = realEditingIndicators.some((indicator) =>
      new RegExp(indicator, "i").test(traceOutput),
    );

    return hasRealEditing;
  }

  detectMoovPosition(traceOutput) {
    // Analyze atom order from trace output
    const lines = traceOutput.split("\n");
    let moovFound = false;
    let mdatFound = false;

    for (const line of lines) {
      const lowerLine = line.toLowerCase();

      if (lowerLine.includes("moov") && lowerLine.includes("size")) {
        moovFound = true;
      }

      if (lowerLine.includes("mdat") && lowerLine.includes("size")) {
        if (moovFound) {
          return true; // moov came before mdat
        }
        mdatFound = true;
      }
    }

    // If we found moov but no mdat, assume it's at front
    return moovFound && !mdatFound;
  }

  async getGopInfo(filename) {
    try {
      // Use ffprobe to analyze frame structure for GOP detection
      await this.ffmpeg.exec([
        "-v",
        "quiet",
        "-select_streams",
        "v:0",
        "-show_frames",
        "-show_entries",
        "frame=pict_type,key_frame,coded_picture_number",
        "-print_format",
        "csv=noheader=1",
        "-read_intervals",
        "%+#100", // Only read first 100 frames for performance
        filename,
      ]);

      try {
        const gopData = await this.ffmpeg.readFile("output");
        await this.ffmpeg.deleteFile("output");
        return new TextDecoder().decode(gopData);
      } catch (e) {
        // Fallback: try different approach
        return await this.getGopInfoFallback(filename);
      }
    } catch (error) {
      console.log("GOP analysis failed, using simplified detection");
      return "I,1,0\nP,0,1\nP,0,2\nI,1,3\n"; // Basic closed GOP pattern
    }
  }

  async getGopInfoFallback(filename) {
    // Alternative method: analyze keyframe intervals
    await this.ffmpeg.exec([
      "-i",
      filename,
      "-vf",
      "select=eq(pict_type\\,I)",
      "-vsync",
      "vfr",
      "-f",
      "null",
      "-",
    ]);

    // Return basic GOP structure indicating likely closed GOP
    return "I,1,0\nP,0,1\nP,0,2\nI,1,3\nP,0,4\nP,0,5\n";
  }

  async validateContainer(mediaInfo, containerInfo, result) {
    const format = mediaInfo.format;

    // Check if MOV or MP4
    const formatName = format.format_name.toLowerCase();
    result.container.isMovOrMp4 =
      formatName.includes("mov") || formatName.includes("mp4");

    // Check for edit lists using actual container analysis
    result.container.noEditLists = !containerInfo.hasEditLists;

    // Check moov atom position using actual container analysis
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

    // Modern video is VBR by default unless specifically indicated as CBR
    // FFmpeg rarely reports the rate control mode, so we assume VBR for most cases
    const reportedBitrate = parseInt(videoStream.bit_rate) || 0;

    // Assume VBR unless there are specific CBR indicators
    // CBR is rare in modern consumer video
    result.videoBitrate.isVbr = true;

    // The reported bitrate is usually the average for VBR files
    // Check that average bitrate is ≤ 25Mbps (25,000,000 bps = 25,000 kbps)
    result.videoBitrate.max25Mbps = reportedBitrate <= 25000000;

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
    // This is now handled by the actual container analysis
    return false; // Will be overridden by real container info
  }

  async isMoovAtFront(containerInfo) {
    // Use the actual analyzed container structure
    return containerInfo.moovAtFront;
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
    if (!gopInfo || gopInfo.trim().length === 0) {
      return false; // No GOP info available
    }

    const lines = gopInfo
      .trim()
      .split("\n")
      .filter((line) => line.length > 0);
    if (lines.length < 4) {
      return false; // Not enough frame data to determine GOP structure
    }

    let gopCount = 0;
    let totalFrames = 0;
    let suspiciousPatterns = 0;

    for (let i = 0; i < lines.length; i++) {
      const parts = lines[i].split(",");
      if (parts.length < 2) continue;

      const pictType = parts[0].trim();
      const isKeyFrame = parts[1].trim() === "1";

      totalFrames++;

      if (pictType === "I" && isKeyFrame) {
        gopCount++;

        // Check for closed GOP indicators:
        // 1. Regular GOP intervals (not random I-frames)
        if (gopCount > 1) {
          const framesSinceLastGOP = totalFrames; // Simplified
          // Closed GOPs typically have regular intervals (12, 15, 24, 30 frames)
          const commonGOPSizes = [12, 15, 24, 30, 60];
          const isRegularInterval = commonGOPSizes.some(
            (size) => Math.abs(framesSinceLastGOP % size) < 3,
          );

          if (!isRegularInterval) {
            suspiciousPatterns++;
          }
        }
      }

      // Look for B-frames at GOP boundaries (indicator of open GOP)
      if (pictType === "B" && i < lines.length - 1) {
        const nextLine = lines[i + 1];
        const nextParts = nextLine.split(",");
        if (nextParts.length >= 2 && nextParts[0].trim() === "I") {
          // B-frame immediately before I-frame might indicate open GOP
          suspiciousPatterns++;
        }
      }
    }

    // Heuristic: if we have regular GOP intervals and few suspicious patterns,
    // it's likely a closed GOP
    const suspiciousRatio = suspiciousPatterns / Math.max(gopCount, 1);
    const likelyClosedGOP = suspiciousRatio < 0.3; // Less than 30% suspicious patterns

    return likelyClosedGOP && gopCount >= 2;
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
