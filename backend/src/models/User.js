const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ROLES = ['ADMIN', 'TECNICO', 'PROFESIONAL'];

const TIPOS_PLANO = ['DEMOLICION', 'SANITARIO', 'INCENDIO', 'ESTRUCTURA', 'ARQUITECTURA', 'ELECTRICO'];

const userSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true },
  apellido: { type: String, trim: true, default: '' },
  dni: { type: String, trim: true, default: '' },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  rol: { type: String, enum: ROLES, required: true, default: 'PROFESIONAL' },
  activo: { type: Boolean, default: true },

  // Técnicos: permisos de visualización por tipo de plano
  permisos_planos: [{ type: String, enum: TIPOS_PLANO }],

  // Técnicos: pendiente de aprobación por admin
  pendienteAprobacion: { type: Boolean, default: false },

  // Email verification
  emailVerified: { type: Boolean, default: false },
  verificationToken: { type: String, default: null },
  verificationTokenExpires: { type: Date, default: null },

  // Password reset
  resetPasswordToken: { type: String, default: null },
  resetPasswordTokenExpires: { type: Date, default: null },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.verificationToken;
  delete obj.verificationTokenExpires;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordTokenExpires;
  // Garantiza que 'id' (string) siempre esté presente junto a '_id'
  obj.id = this._id.toHexString();
  return obj;
};

module.exports = mongoose.model('User', userSchema);
module.exports.ROLES = ROLES;
module.exports.TIPOS_PLANO = TIPOS_PLANO;
