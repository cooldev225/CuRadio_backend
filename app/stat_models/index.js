const config = require("../config");
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(config.STAT_DB_NAME, config.STAT_DB_USER, config.STAT_DB_PASSWORD, {
    host: config.STAT_DB_HOST,
    port: config.STAT_DB_PORT,
    dialect: config.DB.dialect,
    logging: config.STAT_DB_SYNC ? console.log : false,
    pool: {
        max: config.DB.pool.max,
        min: config.DB.pool.min,
        acquire: config.DB.pool.acquire,
        idle: config.DB.pool.idle
    }
});
console.log([config.STAT_DB_NAME, config.STAT_DB_USER, config.STAT_DB_PASSWORD]);

if(config.STAT_DB_SYNC) sequelize.sync({
    alter: true,
    drop: config.STAT_DB_SYNC_FORCE,
    force: config.STAT_DB_SYNC_FORCE
});

const db = {};//initModels(sequelize);
db.Sequelize = Sequelize;
db.sequelize = sequelize;
module.exports = db;