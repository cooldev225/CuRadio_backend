require('dotenv').config();

module.exports.MODE = process.env.MODE;
module.exports.ERROR_OBJ = {status: false};
module.exports.SUCCESS_OBJ = {status: true};
module.exports.FRONTEND_URL = process.env.FRONTEND_URL;
module.exports.APP_SECRET_KEY = process.env.APP_SECRET_KEY;

module.exports.RMS_APP_DOMAIN = process.env.RMS_APP_DOMAIN;

module.exports.STAT_DB_SYNC = process.env.STAT_DB_SYNC === 'true';
module.exports.STAT_DB_SYNC_FORCE = process.env.STAT_DB_SYNC_FORCE === 'true';
module.exports.STAT_DB_HOST = process.env.STAT_DB_HOST;
module.exports.STAT_DB_PORT = process.env.STAT_DB_PORT;
module.exports.STAT_DB_NAME = process.env.STAT_DB_NAME;
module.exports.STAT_DB_USER = process.env.STAT_DB_USER;
module.exports.STAT_DB_PASSWORD = process.env.STAT_DB_PASSWORD;

module.exports.RMS_DB_SYNC = process.env.RMS_DB_SYNC === 'true';
module.exports.RMS_DB_SYNC_FORCE = process.env.RMS_DB_SYNC_FORCE === 'true';
module.exports.RMS_DB_HOST = process.env.RMS_DB_HOST;
module.exports.RMS_DB_PORT = process.env.RMS_DB_PORT;
module.exports.RMS_DB_NAME = process.env.RMS_DB_NAME;
module.exports.RMS_DB_USER = process.env.RMS_DB_USER;
module.exports.RMS_DB_PASSWORD = process.env.RMS_DB_PASSWORD;

module.exports.RADIO_DB_SYNC = process.env.RADIO_DB_SYNC === 'true';
module.exports.RADIO_DB_SYNC_FORCE = process.env.RADIO_DB_SYNC_FORCE === 'true';
module.exports.RADIO_DB_HOST = process.env.RADIO_DB_HOST;
module.exports.RADIO_DB_PORT = process.env.RADIO_DB_PORT;
module.exports.RADIO_DB_NAME = process.env.RADIO_DB_NAME;
module.exports.RADIO_DB_USER = process.env.RADIO_DB_USER;
module.exports.RADIO_DB_PASSWORD = process.env.RADIO_DB_PASSWORD;

module.exports.CUR_DB_SYNC = process.env.CUR_DB_SYNC === 'true';
module.exports.CUR_DB_SYNC_FORCE = process.env.CUR_DB_SYNC_FORCE === 'true';
module.exports.CUR_DB_HOST = process.env.CUR_DB_HOST;
module.exports.CUR_DB_PORT = process.env.CUR_DB_PORT;
module.exports.CUR_DB_NAME = process.env.CUR_DB_NAME;
module.exports.CUR_DB_USER = process.env.CUR_DB_USER;
module.exports.CUR_DB_PASSWORD = process.env.CUR_DB_PASSWORD;

module.exports.DB = {
    dialect: "mysql",
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
}