const config = require("../config");
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(config.CUR_DB_NAME, config.CUR_DB_USER, config.CUR_DB_PASSWORD, {
    host: config.CUR_DB_HOST,
    port: config.CUR_DB_PORT,
    dialect: config.DB.dialect,
    logging: config.CUR_DB_SYNC ? console.log : false,
    pool: {
        max: config.DB.pool.max,
        min: config.DB.pool.min,
        acquire: config.DB.pool.acquire,
        idle: config.DB.pool.idle
    }
});
console.log([config.CUR_DB_NAME, config.CUR_DB_USER, config.CUR_DB_PASSWORD]);

if(config.CUR_DB_SYNC) sequelize.sync({
    alter: true,
    drop: config.CUR_DB_SYNC_FORCE,
    force: config.CUR_DB_SYNC_FORCE
});

const cur_db = {};//initModels(sequelize);
cur_db.Sequelize = Sequelize;
cur_db.sequelize = sequelize;
module.exports = cur_db;