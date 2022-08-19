const db = require("./models");
const moment = require("moment");
const { QueryTypes, Op } = require("sequelize");
const config = require('./config');

exports.getRMS = async (params) => {
    let result = {};
    if(params.a === 1){

    }else if(params.a === 2){
        let table = "track_played_total__"+params.time_period;
        

    }else{

    }
    let query = "show tables";
    result = await db.sequelize.query(query, {type: QueryTypes.SELECT});
    return result;
}