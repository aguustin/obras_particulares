require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Padron = require('../models/Padron');
const Expediente = require('../models/Expediente');
const { MONGO_URI } = require('../config/env');

const seed = async () => {
  await mongoose.connect(MONGO_URI);
  console.log('Connected. Seeding...');

  await User.deleteMany({});
  await Padron.deleteMany({});
  await Expediente.deleteMany({});

  const admin = await User.create({
    nombre: 'Administrador',
    email: 'admin@godoycruz.gob.ar',
    password: 'admin123',
    rol: 'ADMIN',
  });

  const tecnico = await User.create({
    nombre: 'Carlos Técnico',
    email: 'tecnico@godoycruz.gob.ar',
    password: 'tecnico123',
    rol: 'TECNICO',
  });

  const profesional = await User.create({
    nombre: 'María Arquitecta',
    email: 'profesional@godoycruz.gob.ar',
    password: 'prof123',
    rol: 'PROFESIONAL',
  });

  const padron1 = await Padron.create({ numero: '12345', direccion: 'Av. San Martín 1234', propietario: 'Juan Pérez' });
  const padron2 = await Padron.create({ numero: '67890', direccion: 'Calle Belgrano 567', propietario: 'Ana García' });

  await Expediente.create({ numero: '2024-E-12345', padronId: padron1._id, descripcion: 'Construcción casa habitación' });
  await Expediente.create({ numero: '2024-E-67890', padronId: padron2._id, descripcion: 'Ampliación local comercial' });
  await Expediente.create({ numero: '2023-E-11111', padronId: padron1._id, descripcion: 'Refacción baños' });

  console.log('Seed complete!');
  console.log('Admin:', admin.email, '/ admin123');
  console.log('Técnico:', tecnico.email, '/ tecnico123');
  console.log('Profesional:', profesional.email, '/ prof123');

  await mongoose.disconnect();
};

seed().catch(console.error);
