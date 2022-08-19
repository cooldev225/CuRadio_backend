require('dotenv').config();

module.exports.MODE = process.env.MODE;
module.exports.ERROR_OBJ = {status: false};
module.exports.SUCCESS_OBJ = {status: true};
module.exports.FRONTEND_URL = process.env.FRONTEND_URL;

module.exports.RMS_APP_DOMAIN = process.env.RMS_APP_DOMAIN;
module.exports.RMS_DB_SYNC = process.env.RMS_DB_SYNC === 'true';
module.exports.RMS_DB_SYNC_FORCE = process.env.RMS_DB_SYNC_FORCE === 'true';
module.exports.RMS_DB_HOST = process.env.RMS_DB_HOST;
module.exports.RMS_DB_PORT = process.env.RMS_DB_PORT;
module.exports.RMS_DB_NAME = process.env.RMS_DB_NAME;
module.exports.RMS_DB_USER = process.env.RMS_DB_USER;
module.exports.RMS_DB_PASSWORD = process.env.RMS_DB_PASSWORD;

module.exports.DB = {
    dialect: "mysql",
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
}