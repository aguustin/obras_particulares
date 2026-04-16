const mongoose = require('mongoose');

const observacionSchema = new mongoose.Schema({
  descripcion: { type: String, required: true },
  archivos_pdf: [{ type: String }],
  tecnico: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  fecha: { type: Date, default: Date.now },
}, { _id: false });

const comentarioSchema = new mongoose.Schema({
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mensaje: { type: String, required: true },
  fecha: { type: Date, default: Date.now },
}, { _id: true });

const archivoSchema = new mongoose.Schema({
  url: { type: String, required: true },
  key: { type: String, required: true },
  nombre: { type: String, default: 'documento.pdf' },
}, { _id: false });

const versionPlanoSchema = new mongoose.Schema({
  planoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plano', required: true },
  numero_version: { type: Number, required: true, min: 1 },
  // Array de archivos (nuevo modelo multi-PDF)
  archivos: { type: [archivoSchema], default: [] },
  // Campos legacy para versiones anteriores (un solo archivo)
  archivo_pdf_url: { type: String },
  archivo_pdf_key: { type: String },
  descripcion: { type: String, trim: true },
  subido_por: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fecha: { type: Date, default: Date.now },
  observacion_tecnica: { type: observacionSchema, default: null },
  comentarios: { type: [comentarioSchema], default: [] },
}, { timestamps: true });

versionPlanoSchema.index({ planoId: 1, numero_version: 1 });

module.exports = mongoose.model('VersionPlano', versionPlanoSchema);
