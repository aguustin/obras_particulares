const mongoose = require('mongoose');

const TIPOS = ['ARQUITECTURA', 'ESTRUCTURA', 'SANITARIO', 'ELECTRICO', 'INCENDIO', 'DEMOLICION'];
const ESTADOS = ['PRESENTADO', 'EN_PROGRESO', 'OBSERVADO', 'PRE_APROBADO'];

const planoSchema = new mongoose.Schema({
  expedienteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Expediente', required: true },
  tipo: { type: String, enum: TIPOS, required: true },
  estado_actual: { type: String, enum: ESTADOS, default: 'PRESENTADO' },
  pendiente: { type: Boolean, default: true },
  profesionales_asignados: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  tecnicos_asignados: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

// Unique tipo per expediente
planoSchema.index({ expedienteId: 1, tipo: 1 }, { unique: true });
planoSchema.index({ estado_actual: 1 });
planoSchema.index({ pendiente: 1 });

module.exports = mongoose.model('Plano', planoSchema);
module.exports.TIPOS = TIPOS;
module.exports.ESTADOS = ESTADOS;
