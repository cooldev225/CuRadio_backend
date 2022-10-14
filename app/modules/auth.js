const radio_db = require("../radio_models");
const { QueryTypes, Op } = require("sequelize");
const { getRandString } = require('../utils');
const md5 = require("md5");

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
            result.token = params.facebookId;
        }
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

            result.token = params.facebookId;
        }
    }else{
        let user = this.getUserByName(params.user);
        if(!user){
            result.message = "There is no username.";
        }else{
            if(user.pwd != md5(params.password + user.key)){
                result.message = "Password is wrong.";
            }else{
                if(user.expires && (new Date()).getMilliseconds() > user.expires){
                    result.message = "You are expired.";
                }else{
                    if(user.active<=0){
                        result.message = "You are disabled.";
                    }else{
                        result.token = user.account;
                    }
                }
            }
        }
    }
    return result;
};

exports.register = async (params) => {
    let result = {};
    let user = this.getUserByName(params.user);
    if(user){
        result.message = "Username is exist already.";
    }else{
        let expiresTime = (new Date()).getMilliseconds() + 1000 * 60 * 60 * 24 * 365 ;
        let key = getRandString(6);
        let pwd = md5(params.password + key);
        this.createUser(params.user,pwd,key,"",expiresTime,
            "","","","",params.email);
        user = this.getUserByName(params.user);

        result.code = 1;
    }
    return result;
};

exports.findByFacebookAccessToken = async (facebookId) => {
    let query = `SELECT * FROM gg_user WHERE facebook_user_id='${facebookId}'`;
    result = await radio_db.sequelize.query(query, {type: QueryTypes.SELECT});
    if(result.lenth) return result[0];
    return null;
};

exports.findByGoogleAccessToken = async (googleId) => {
    let query = `SELECT * FROM gg_user WHERE google_user_id='${googleId}'`;
    result = await radio_db.sequelize.query(query, {type: QueryTypes.SELECT});
    if(result.lenth) return result[0];
    return null;
};

exports.getUserById = async (userId) => {
    let query = `SELECT * FROM gg_user WHERE uid='${userId}'`;
    result = await radio_db.sequelize.query(query, {type: QueryTypes.SELECT});
    if(result.lenth) return result[0];
    return null;
};

exports.getUserByName = async (userName) => {
    let query = `SELECT * FROM gg_user WHERE account='${userName}'`;
    result = await radio_db.sequelize.query(query, {type: QueryTypes.SELECT});
    if(result.lenth) return result[0];
    return null;
};

exports.createUser = async (account , pwd , key ,name ,expires, profilePic,
    facebookId, accessToken, type, email) => {
    let userIdField = "facebook_user_id";
    if(type==="google") {
        userIdField = "`google_user_id`";
    }
    let sql = `\
        INSERT INTO gg_user (\
            'active','account','pwd','key','expires','addTime',\
            'profile_pic','facebook_token','email', '${userIdField}'\
            `+(name?`',name'`:`,`)+`\
        ) values(\
            1,'\'${account}\'','${pwd}','${key}','${expires}','${new Date()}',
            '${profilePic}','${accessToken}','${email}','${facebookId}',
            `+(name?`,'${name}'`:`,`)+`\
        )`;
    result = await radio_db.sequelize.query(query, {type: QueryTypes.INSERT});
    return result;
};