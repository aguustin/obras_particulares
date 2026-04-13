const mongoose = require('mongoose');

const padronSchema = new mongoose.Schema({
  numero: { type: String, required: true, unique: true, trim: true },
  direccion: { type: String, trim: true },
  propietario: { type: String, trim: true },
  observaciones: { type: String, trim: true },
  activo: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Padron', padronSchema);
