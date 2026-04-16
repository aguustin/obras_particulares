const { exec } = require('child_process');
const { promisify } = require('util');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { v4: uuidv4 } = require('uuid');
const logger = require('./logger');

const execAsync = promisify(exec);

// null = no comprobado, true = disponible, false = no disponible
let gsAvailable = null;

const getGsCmd = () => (process.platform === 'win32' ? 'gswin64c' : 'gs');

/** Verifica una sola vez si Ghostscript está disponible en el PATH. */
const checkGhostscript = async () => {
  if (gsAvailable !== null) return gsAvailable;
  try {
    await execAsync(`${getGsCmd()} --version`);
    gsAvailable = true;
    logger.info('Ghostscript disponible — compresión de PDF activada');
  } catch {
    gsAvailable = false;
    logger.warn('Ghostscript no disponible — los PDFs se subirán sin comprimir');
  }
  return gsAvailable;
};

/**
 * Comprime un PDF usando Ghostscript si está disponible, sino devuelve el buffer original.
 * Solo avisa una vez al inicio; no spammea en cada upload.
 */
const compressPdf = async (inputBuffer) => {
  const available = await checkGhostscript();
  if (!available) return inputBuffer;

  const tmpDir = os.tmpdir();
  const inputPath = path.join(tmpDir, `${uuidv4()}_input.pdf`);
  const outputPath = path.join(tmpDir, `${uuidv4()}_output.pdf`);

  try {
    fs.writeFileSync(inputPath, inputBuffer);

    const cmd = [
      getGsCmd(),
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

    if (compressed.length < inputBuffer.length) {
      logger.debug(`PDF comprimido: ${inputBuffer.length} → ${compressed.length} bytes`);
      return compressed;
    }
    return inputBuffer;
  } catch (err) {
    logger.debug(`PDF compression failed (se usa original): ${err.message}`);
    return inputBuffer;
  } finally {
    [inputPath, outputPath].forEach((f) => {
      try { fs.unlinkSync(f); } catch {}
    });
  }
};

module.exports = { compressPdf };
