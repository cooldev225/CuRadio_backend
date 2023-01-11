const config = require("../config");
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(config.RADIO_DB_NAME, config.RADIO_DB_USER, config.RADIO_DB_PASSWORD, {
    host: config.RADIO_DB_HOST,
    port: config.RADIO_DB_PORT,
    dialect: config.DB.dialect,
    logging: console.log,
    pool: {
        max: config.DB.pool.max,
        min: config.DB.pool.min,
        acquire: config.DB.pool.acquire,
        idle: config.DB.pool.idle
    }
});
console.log([config.RADIO_DB_NAME, config.RADIO_DB_USER, config.RADIO_DB_PASSWORD]);

if(config.RADIO_DB_SYNC) sequelize.sync({
    alter: true,
    drop: config.RADIO_DB_SYNC_FORCE,
    force: config.RADIO_DB_SYNC_FORCE
});

const RADIO_DB = {};//initModels(sequelize);
RADIO_DB.sequelize = sequelize;
module.exports = RADIO_DB;