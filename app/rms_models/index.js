const config = require("../config");
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(config.RMS_DB_NAME, config.RMS_DB_USER, config.RMS_DB_PASSWORD, {
    host: config.RMS_DB_HOST,
    port: config.RMS_DB_PORT,
    dialect: config.DB.dialect,
    logging: config.RMS_DB_SYNC ? console.log : false,
    pool: {
        max: config.DB.pool.max,
        min: config.DB.pool.min,
        acquire: config.DB.pool.acquire,
        idle: config.DB.pool.idle
    }
});
console.log([config.RMS_DB_NAME, config.RMS_DB_USER, config.RMS_DB_PASSWORD]);

if(config.RMS_DB_SYNC) sequelize.sync({
    alter: true,
    drop: config.RMS_DB_SYNC_FORCE,
    force: config.RMS_DB_SYNC_FORCE
});

const rms_db = {};//initModels(sequelize);
rms_db.Sequelize = Sequelize;
rms_db.sequelize = sequelize;
module.exports = rms_db;