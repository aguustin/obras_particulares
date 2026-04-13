require('dotenv').config();
const app = require('./app');
const { connect } = require('./config/database');
const { initBucket } = require('./config/minio');
const { PORT } = require('./config/env');
const logger = require('./utils/logger');

const start = async () => {
  await connect();
  await initBucket();

  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT} [${process.env.NODE_ENV}]`);
  });
};

start().catch((err) => {
  logger.error('Fatal startup error:', err);
  process.exit(1);
});
