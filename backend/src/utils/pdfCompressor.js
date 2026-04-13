const { exec } = require('child_process');
const { promisify } = require('util');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { v4: uuidv4 } = require('uuid');
const logger = require('./logger');

const execAsync = promisify(exec);

/**
 * Compress a PDF buffer using Ghostscript if available, otherwise return as-is.
 * @param {Buffer} inputBuffer
 * @returns {Promise<Buffer>}
 */
const compressPdf = async (inputBuffer) => {
  const tmpDir = os.tmpdir();
  const inputPath = path.join(tmpDir, `${uuidv4()}_input.pdf`);
  const outputPath = path.join(tmpDir, `${uuidv4()}_output.pdf`);

  try {
    fs.writeFileSync(inputPath, inputBuffer);

    const gsCmd = process.platform === 'win32' ? 'gswin64c' : 'gs';
    const cmd = [
      gsCmd,
      '-sDEVICE=pdfwrite',
      '-dCompatibilityLevel=1.4',
      '-dPDFSETTINGS=/ebook',
      '-dNOPAUSE',
      '-dQUIET',
      '-dBATCH',
      `-sOutputFile=${outputPath}`,
      inputPath,
    ].join(' ');

    await execAsync(cmd);
    const compressed = fs.readFileSync(outputPath);

    // Only use compressed if it's actually smaller
    if (compressed.length < inputBuffer.length) {
      logger.debug(`PDF compressed: ${inputBuffer.length} -> ${compressed.length} bytes`);
      return compressed;
    }
    return inputBuffer;
  } catch (err) {
    // Ghostscript not available or failed — return original
    logger.warn('PDF compression skipped (Ghostscript unavailable):', err.message);
    return inputBuffer;
  } finally {
    [inputPath, outputPath].forEach((f) => {
      try { fs.unlinkSync(f); } catch {}
    });
  }
};

module.exports = { compressPdf };
