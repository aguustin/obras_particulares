const mongoose = require('mongoose');

// Format: 2024-E-12345
const expedienteSchema = new mongoose.Schema({
  numero: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    match: [/^\d{4}-[A-Z]\d?-\d+$/, 'Formato inválido. Ej: 2024-E-12345, 2024-E1-12345, 2024-E2-12345'],
  },
  padronId: { type: mongoose.Schema.Types.ObjectId, ref: 'Padron', required: true },
  descripcion: { type: String, trim: true },
  activo: { type: Boolean, default: true },
  usuarios_autorizados: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

expedienteSchema.index({ padronId: 1 });

module.exports = mongoose.model('Expediente', expedienteSchema);
