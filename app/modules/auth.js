const config = require("../config");
const radio_db = require("../radio_models");
const rms_db = require("../rms_models");
const { QueryTypes, Op } = require("sequelize");
const { getRandString } = require('../utils');
const md5 = require("md5");
const jwt = require('jsonwebtoken');
const secret = config.APP_SECRET_KEY;

exports.login = async (params) => {
    let result = {};
    if(params.submit === "facebook"){
        let user = this.findByFacebookAccessToken(params.facebookId);
        if(!user){
            let profilePic = "https://graph.facebook.com/"+params.facebookId+"/picture?type=normal";
			let key = getRandString(6);
            let expires = 1;
			let pwd = md5(params.facebookId + key);
            this.createUser(params.facebookId,pwd,key,params.name,expires,
                profilePic,params.facebookId,params.faceBookAccessToken,"facebook",params.email);
            user = this.findByFacebookAccessToken(params.facebookId);

            //send email process
        }
        result.token = jwt.sign({account:user.account, is_subscribe:user.is_subscribe, expires: user.expires}, secret);
        result.code = 20000;
    }else if(params.submit === "google"){
        let user = this.findByGoogleAccessToken(params.facebookId);
        if(!user){
            let profilePic = params.faceBookAccessToken;
            let key = getRandString(6);
            let expires = 1;
            let pwd = md5(params.facebookId + key);
            this.createUser(params.facebookId,pwd,key,params.name,expires,
                profilePic,params.facebookId,"","google",params.email);
            user = this.findByGoogleAccessToken(params.facebookId);

        }
        result.token = jwt.sign({account:user.account, is_subscribe:user.is_subscribe, expires: user.expires}, secret);
        result.code = 20000;
    }else{
        let user = await this.getUserByName(params.user);
        if(!user){
            result.message = "There is no username.";
            result.code = -20000;
        }else{
            if(user.pwd != md5(params.password + user.key)){
                result.message = "Password is wrong.";
                result.code = -20000;
            }else{
                if(user.expires && (new Date()).getMilliseconds() > user.expires){
                    result.message = "You are expired.";
                    result.code = -20000;
                }else{
                    if(user.active<=0){
                        result.message = "You are disabled.";
                        result.code = -20000;
                    }else{
                        result.token = jwt.sign({account:user.account, is_subscribe:user.is_subscribe, expires: user.expires}, secret);
                        result.code = 20000;
                    }
                }
            }
        }
    }
    return result;
};

exports.register = async (params) => {
    let result = {};
    let user = await this.getUserByName(params.user);
    if(user){
        result.message = "Username is exist already.";
        result.code = -20000;
    }else{
        let expiresTime = (new Date()).getMilliseconds() + 1000 * 60 * 60 * 24 * 365 ;
        let key = getRandString(6);
        let pwd = md5(params.password + key);
        await this.createUser(params.user,pwd,key,"",expiresTime,"","","","",params.email);
        user = await this.getUserByName(params.user);
        result.code = 20000;
        result.token = jwt.sign({account:user.account, is_subscribe:user.is_subscribe, expires: user.expires}, secret);
    }
    return result;
};

exports.getUserInfo = async (token) => {
    var decoded = jwt.decode(token);
    let query = `SELECT * FROM gg_user where account='${decoded.account}'`;
    let result = await radio_db.sequelize.query(query, {type: QueryTypes.SELECT});
    if(result.length) return result[0];
    return null;
};

exports.setUserInfo = async (token, params) => {
    var decoded = jwt.decode(token);
    let query = ``;
    Object.keys(params).forEach((key) => {
        query += (query==``?``:`,`) + key + `='${params[key]}'`;
    });
    if(query == ``) return null;
    query = `update gg_user set ${query} where account='${decoded.account}'`;
    let result = await radio_db.sequelize.query(query, {type: QueryTypes.UPDATE});
    return result;
};

exports.__gg_user = async () => {
    let query = `SELECT * FROM gg_user`;
    let result = await radio_db.sequelize.query(query, {type: QueryTypes.SELECT});
    return result;
};

exports.findByFacebookAccessToken = async (facebookId) => {
    let query = `SELECT * FROM gg_user WHERE facebook_user_id='${facebookId}'`;
    let result = await radio_db.sequelize.query(query, {type: QueryTypes.SELECT});
    if(result.length) return result[0];
    return null;
};

exports.findByGoogleAccessToken = async (googleId) => {
    let query = `SELECT * FROM gg_user WHERE google_user_id='${googleId}'`;
    let result = await radio_db.sequelize.query(query, {type: QueryTypes.SELECT});
    if(result.length) return result[0];
    return null;
};

exports.getUserById = async (userId) => {
    let query = `SELECT * FROM gg_user WHERE uid='${userId}'`;
    let result = await radio_db.sequelize.query(query, {type: QueryTypes.SELECT});
    if(result.length) return result[0];
    return null;
};

exports.getUserByName = async (userName) => {
    let query = `SELECT * FROM gg_user WHERE account='${userName}'`;
    result = await radio_db.sequelize.query(query, {type: QueryTypes.SELECT});
    if(result.length) return result[0];
    return null;
};

exports.createUser = async (account , pwd , key ,name ,expires, profilePic,
    facebookId, accessToken, type, email) => {
    let googleId = "";
    if(type==="google") {
        googleId = facebookId;
        facebookId = "";
    }
    // let query = `\
    //     INSERT INTO gg_user (\
    //         'active','account','pwd','key','expires','addTime',\
    //         'profile_pic','facebook_token','email', '${userIdField}'\
    //         `+(name?`',name'`:``)+`\
    //     ) values(\
    //         1,'${account}','${pwd}','${key}','${expires}','${moment().format("YYYY-MM-DD H:m:s")}',
    //         '${profilePic}','${accessToken}','${email}','${facebookId}'
    //         `+(name?`,'${name}'`:``)+`\
    //     )`;

    // `uid`, `account`, `pwd`, `key`, `tel`, `name`, `company`, `email`, 
    // `expires`, `active`, `addTime`, `howknow`, `reportValid`, `reportClient`,
    // `reportComposer`, `reportLabel`, `trackStatsValid`, `is_business`,
    // `profile_pic`, `facebook_token`, `facebook_user_id`, `google_user_id`,
    // `is_subscribe`, `is_send`
    let query = `\
            INSERT INTO gg_user VALUES\ 
                (null, '${account}', '${pwd}', '${key}', null, `+(name?`,'${name}'`:null)+`,\
                null, '${email}', ${expires}, 1, ${(new Date()).getMilliseconds()},\
                null, 0, '', '', '', '1', '0', '${profilePic}', '${accessToken}',
                '${facebookId}', '${googleId}', '0', '1');\
    `;
    let result = await radio_db.sequelize.query(query, {type: QueryTypes.INSERT});
    return result;
};