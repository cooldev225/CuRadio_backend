const config = require("../config");
const radio_db = require("../radio_models");
const rms_db = require("../rms_models");
const stat_db = require("../stat_models");
const { QueryTypes, Op } = require("sequelize");
const { getRandString } = require('../utils');
const md5 = require("md5");
const jwt = require('jsonwebtoken');
const secret = config.APP_SECRET_KEY;
const axios = require('axios');
const https = require("https");
const xml2js = require('xml2js')
const moment = require('moment');
const WEATHER_API_KEY = "d931d74d618f5604632371f4fa5c3f4d";

exports.login = async (params) => {
    let result = {};
    if (params.submit === "facebook") {
        let user = this.findByFacebookAccessToken(params.facebookId);
        if (!user) {
            let profilePic = "https://graph.facebook.com/" + params.facebookId + "/picture?type=normal";
            let key = getRandString(6);
            let expires = 1;
            let pwd = md5(params.facebookId + key);
            this.createUser(params.facebookId, pwd, key, params.name, expires,
                profilePic, params.facebookId, params.faceBookAccessToken, "facebook", params.email);
            user = this.findByFacebookAccessToken(params.facebookId);

            //send email process
        }
        result.token = jwt.sign({ account: user.account, is_subscribe: user.is_subscribe, expires: user.expires }, secret);
        result.code = 20000;
    } else if (params.submit === "google") {
        let user = this.findByGoogleAccessToken(params.facebookId);
        if (!user) {
            let profilePic = params.faceBookAccessToken;
            let key = getRandString(6);
            let expires = 1;
            let pwd = md5(params.facebookId + key);
            this.createUser(params.facebookId, pwd, key, params.name, expires,
                profilePic, params.facebookId, "", "google", params.email);
            user = this.findByGoogleAccessToken(params.facebookId);

        }
        result.token = jwt.sign({ account: user.account, is_subscribe: user.is_subscribe, expires: user.expires }, secret);
        result.code = 20000;
    } else {
        let user = await this.getUserByName(params.user);
        if (!user) {
            result.message = "There is no username.";
            result.code = -20000;
        } else {
            if (user.pwd != md5(params.password + user.key)) {
                result.message = "Password is wrong.";
                result.code = -20000;
            } else {
                if (user.expires && (new Date()).getMilliseconds() > user.expires) {
                    result.message = "You are expired.";
                    result.code = -20000;
                } else {
                    if (user.active <= 0) {
                        result.message = "You are disabled.";
                        result.code = -20000;
                    } else {
                        result.token = jwt.sign({ account: user.account, is_subscribe: user.is_subscribe, expires: user.expires }, secret);
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
    if (user) {
        result.message = "Username is exist already.";
        result.code = -20000;
    } else {
        let expiresTime = (new Date()).getMilliseconds() + 1000 * 60 * 60 * 24 * 365;
        let key = getRandString(6);
        let pwd = md5(params.password + key);
        await this.createUser(params.user, pwd, key, "", expiresTime, "", "", "", "", params.email);
        user = await this.getUserByName(params.user);
        result.code = 20000;
        result.token = jwt.sign({ account: user.account, is_subscribe: user.is_subscribe, expires: user.expires }, secret);
    }
    return result;
};

exports.getUserInfo = async (token) => {
    var decoded = jwt.decode(token);

    let query = `SELECT * FROM gg_user where account='${decoded.account}'`;
    let result = await radio_db.sequelize.query(query, { type: QueryTypes.SELECT });
    if (!result.length) return null;
    else result = result[0];

    let geo_info = {
        lat: null,
        lon: null,
        country: null,
        state: null,
        city: null,
        address: null,
        weather: null,
        temperature: null,
        time: null,
    };
    query = `select * from xx_user_profile where user_id = ${result.uid}`;
    let _result = await radio_db.sequelize.query(query, { type: QueryTypes.SELECT });
    if (_result.length) {
        result.profile = _result[0];
        geo_info.lat = result.profile.register_latitude;
        geo_info.lon = result.profile.register_longitude;
        geo_info.country = result.profile.country;
        geo_info.address = result.profile.address;
        geo_info.state = result.profile.state;
        geo_info.city = result.profile.city;
    }

    if (geo_info.lat && geo_info.lon) {
        //latitude 61.52401  longitude 105.318756
        var config = {
            method: 'get',
            url: `https://api.openweathermap.org/data/2.5/weather?lat=${geo_info.lat}&lon=${geo_info.lon}&appid=${WEATHER_API_KEY}&units=metric`,
            headers: {}
        };
        try {
            let res = await axios(config);
            geo_info.weather = res.data.weather[0].main;
            geo_info.temperature = res.data.main.temp;
            geo_info.time = res.data.dt + res.data.timezone;
        } catch (e) {
            //console.log(e);
        }
    }

    result.geo_info = geo_info;

    return result;
};

exports.setUserInfo = async (token, params) => {
    var decoded = jwt.decode(token);
    let user = await this.getUserByName(decoded.account);
    let now = moment().format("YYYY-MM-DD H:m:s");
    let query = ``;
    let result = "";
    if (params.is_profile) {
        if (params.register_latitude && params.register_longitude) {
            let country = "", address = "", state = "", city = "", country_code = "";
            if (params.country && params.state) {
                address = params.address;
                country = params.country;
                country_code = params.country_code;
                state = params.state;
                city = params.city;
            } else {
                var config = {
                    method: 'get',
                    url: `http://api.geonames.org/countrySubdivision?lat=${params.register_latitude}&lng=${params.register_longitude}&username=goldstar22501&=&maxRows=10&radius=40`,
                    headers: {}
                    //help   http://www.geonames.org/export/web-services.html#countrycode
                };

                const httpsAgent = new https.Agent({
                    rejectUnauthorized: false
                });
                const axiosInstance = axios.create({
                    httpsAgent: httpsAgent
                });
                let response = await axiosInstance(config);
                let obj = null;
                xml2js.parseString(response.data, { mergeAttrs: true }, async (err, res) => {
                    if (!err) obj = res;
                });
                if (obj && obj.geonames.countrySubdivision.length) {
                    country = obj.geonames.countrySubdivision[0].countryName;
                    country_code = obj.geonames.countrySubdivision[0].countryCode;
                    state = obj.geonames.countrySubdivision[0].adminName1;
                }
            }
            let sql = `select * from xx_user_profile where user_id = ${user.uid}`;
            let _result = await radio_db.sequelize.query(sql, { type: QueryTypes.SELECT });
            if (_result.length) {
                query = `update xx_user_profile set \
                    register_latitude=${params.register_latitude},\
                    register_longitude=${params.register_longitude},\
                    address='${address}',\
                    country='${country}',\
                    country_code='${country_code}',\
                    state='${state}',\
                    city='${city}',\
                    updated_by=${user.uid},\
                    updated_at='${now}' \
                    where user_id = ${user.uid}\
                `;
                result = await radio_db.sequelize.query(query, { type: QueryTypes.UPDATE });
            } else {
                query = `insert into xx_user_profile values(\
                null,${user.uid},${params.register_latitude},${params.register_longitude},\
                '${address}',\
                '${country}',\
                '${country_code}',\
                '${state}',\
                '${city}',\
                '',\
                '',\
                '',\
                '',\
                '',\
                '',\
                '',\
                0,\
                null,\
                0,\
                ${user.uid},'${now}',${user.uid},'${now}'\
                )`;
                result = await radio_db.sequelize.query(query, { type: QueryTypes.INSERT });
            }
            result = await radio_db.sequelize.query(sql, { type: QueryTypes.SELECT });
        } else {
            Object.keys(params).forEach((key) => {
                if (key !== 'is_profile')
                    query += (query == `` ? `` : `,`) + key + `='${params[key]}'`;
            });
            query = `update xx_user_profile set ${query} where user_id=${user.uid}`;
            if (query == ``) return null;
            result = await radio_db.sequelize.query(query, { type: QueryTypes.UPDATE });
        }
    } else if (params.is_password) {
        let pwd = md5(params.password + user.key);
        if (pwd !== user.pwd) {
            return {
                code: -20000,
                message: 'current password is wrong.'
            };
        }
        query = `update gg_user set pwd='${pwd}' where account='${decoded.account}'`;
        result = await radio_db.sequelize.query(query, { type: QueryTypes.UPDATE });
    } else if (params.is_membership) {
        params.membership_level
        query = `insert into xx_user_payment values(\
            null,${user.uid},0,${params.amount},0,${params.membership_level},\
            '${params.membership_expire}',
            ${user.uid},'${now}',${user.uid},'${now}'\
        )`;
        result = await radio_db.sequelize.query(query, { type: QueryTypes.INSERT });
        query = `update xx_user_profile set \
            membership_level=${params.membership_level},\
            membership_expire='${params.membership_expire}',\
            updated_by=${user.uid},\
            updated_at='${now}' \
            where user_id = ${user.uid}\
        `;
        result = await radio_db.sequelize.query(query, { type: QueryTypes.UPDATE });
    } else {
        Object.keys(params).forEach((key) => {
            query += (query == `` ? `` : `,`) + key + `='${params[key]}'`;
        });
        query = `update gg_user set ${query} where account='${decoded.account}'`;
        if (query == ``) return null;
        result = await radio_db.sequelize.query(query, { type: QueryTypes.UPDATE });
    }
    return result;
};

exports.getGenres = async () => {
    let query = `SELECT * FROM genre_list order by level,id`;
    let result = await rms_db.sequelize.query(query, { type: QueryTypes.SELECT });
    return result;
};

exports.getMoods = async () => {
    let query = `SELECT * FROM mood_list order by id`;
    let result = await rms_db.sequelize.query(query, { type: QueryTypes.SELECT });
    return result;
};

exports.getSearchTrackList = async (token, params) => {
    var decoded = jwt.decode(token);
    // let user = await this.getUserByName(decoded.account);
    let result = {
        pagination: params.pagination,
        list: [],
    };

    let query = "";
    let res = [];
    if (params.filter.sort_by === 'played_ranking' || params.filter.sort_by === 'played_count') {
        let query_select = `SELECT\
                    track.slid as id,\
                    rank.dateId AS dateId1,\
                    rank.startTime,\
                    rank.fromDate,\
                    rank.lastUpdated,\
                    rank.toDate,\
                    rank.endTime,\
                    track.count,\
                    max(track.count) as max_count,
                    sum(track.count) as sum_count,
                    track.artistId,\
                    track.artist,\
                    track.slid,\
                    track.media,\
                    track.genre,\
                    track.\`key\`,\
                    track.tempo,\
                    track.dateId,\
                    track.sex,\
                    track.albumId,\
                    ord.rank,\
                    ord.lastRank,\
                    track.genre AS genre_name,\
                    info.label,\
                    info.label_link,\
                    info.label_pic,\
                    ord.sex AS osex,\
                    ord.category AS ocategory,\
                    info.weibo, \
                    info.resume `;
        let query_from = `FROM\
                    gg_radiostations_cache_track_rank \`rank\`\
                    LEFT JOIN gg_radiostations_cache_track track ON rank.dateId = track.dateId\
                    LEFT JOIN gg_radiostations_cache_track_order ord ON ord.dateId = track.dateId\ 
                    AND ord.artistId = track.artistId \
                    AND ord.slid = track.slid\
                    LEFT JOIN gg_songlist_artist_info info ON info.sl_artist_id = track.artistId `;
        let query_where = `WHERE track.slid>=0 `;
        if (params.filter.keyword !== "")
            query_where += ` AND (track.media LIKE '%${params.filter.keyword}%' OR track.artist LIKE '%${params.filter.keyword}%' OR info.resume LIKE '%${params.filter.keyword}%') `;
        if (params.filter.genre.length)
            query_where += ` AND track.genre IN (${params.filter.genre})`;
        if (params.filter.mood.length)
            query_where += ` AND track.\`key\` IN (${params.filter.mood})`;

        let query_group = `GROUP BY track.slid `;
        let query_order = `ORDER BY -ord.\`rank\` DESC`;
        if (params.filter.sort_by === 'played_count') query_order = `ORDER BY sum(track.count) DESC`;
        let query_count = `select count(*) as cnt,max(max_count) as max_count,max(sum_count) as sum_count from (select track.slid,track.count,max(track.count) as max_count,sum(track.count) as sum_count ${query_from} ${query_where} ${query_group}) count_table`;
        res = await radio_db.sequelize.query(query_count, { type: QueryTypes.SELECT });
        result.pagination.total = res[0].cnt;
        result.pagination.max = res[0].max_count;
        result.pagination.sum = res[0].sum_count;
        result.pagination.pages = Math.ceil(result.pagination.total / result.pagination.size);

        query = `${query_select} ${query_from} ${query_where} ${query_group} ${query_order} limit ${params.pagination.page * params.pagination.size},${params.pagination.size}`;
        res = await radio_db.sequelize.query(query, { type: QueryTypes.SELECT });
    } else {
        query = `from track_list_copy a \
                    left join track_album_rel b on a.id=b.track_id \
                    left join album_list c on b.album_id=c.id \
                    left join track_member_rel d on (d.track_id = a.id AND d.role_id = 43) \
                    left join member_list e ON e.id = d.member_id \
                    left join curadio_track_played_count f on f.track_id=a.id \
                    where a.title!='' `;
        if (params.filter.genre.length) {
            let genres = "";
            params.filter.genre.map((g) => {
                genres += (genres === "" ? "" : ",") + `'${g}'`;
            });
            query += `and (a.genre_id in (${genres}) or c.genre_id in (${genres})) `;
        }
        if (params.filter.mood.length) {
            let moods = "";
            params.filter.mood.map((m) => {
                moods += (moods === "" ? "" : ",") + `'${m}'`;
            });
            query += `and a.mood_id in (${moods}) `;
        }
        if (params.filter.keyword !== "") {
            query += `and (a.title like '%${params.filter.keyword}%' or c.title like '%${params.filter.keyword}%') `;
        }

        let query_count = `select count(*) as cnt ${query}`;
        res = await rms_db.sequelize.query(query_count, { type: QueryTypes.SELECT });
        result.pagination.total = res[0].cnt;
        result.pagination.pages = Math.ceil(result.pagination.total / result.pagination.size);

        if (params.filter.sort_by === 'alpha')
            query += `order by a.title `;
        else if (params.filter.sort_by === 'new_published')
            query += `order by a.release_date desc `;

        query = `select a.*, c.id as album_id, c.id as albumId,c.title as album_title, e.title as track_member_title,f.played_count ${query} limit ${params.pagination.page * params.pagination.size},${params.pagination.size}`;
        res = await rms_db.sequelize.query(query, { type: QueryTypes.SELECT });

        // let ids = "";
        // for(var i=0;i<res.length;i++){
        //     ids += (ids===""?"":",") + res[i].id;
        // }

        // query = `select * from track_album_rel where track_id in (${ids})`;
        // let res_rel = await rms_db.sequelize.query(query, {type: QueryTypes.SELECT});
        // for(var i=0;i<res.length;i++){
        //     for(var j=0;j<res_rel.length;j++){
        //         if(res[i].id===res_rel[j].track_id){
        //             res[i].album_rel = res_rel[j];
        //         }
        //     }
        // }
    }
    for (var i = 0; i < res.length; i++) {
        // query = `select * from track_played_by_artist__this_year where cugate_track_id=${res[i].id}`;
        // let res_rms = await stat_db.sequelize.query(query, {type: QueryTypes.SELECT});
        // res[i].artist_rel = res_rms;

        query = `select \
        b.title as album_member_title,\
        c.file_id,\
        d.track_type_id AS f_track_type_id,\
        g.title AS f_track_type_title,\
        d.track_time AS f_track_time,\
        d.fp_status AS f_fp_status,\
        d.wm_status AS f_wm_status,\
        e.f_prev_path,\
        e.f_prev_path2,\
        d.f_format_id,\
        d.f_size,\
        d.f_brate,\
        d.f_srate,
        d.f_register_from,\
        d.f_register_date,\
        d.f_register_ip,\
        d.uniqid AS f_uniqid,\
        d.update_time AS f_update_time,\
        f.wm1_code AS WaterMark, \
        h.title as albumName \
        from album_member_rel a \
        left join member_list b on b.id = a.member_id \
        left join track_file_rel c on c.track_id=${res[i].id} \
        left join track_file_list d on c.file_id = d.id
        left join track_file_server_list e on d.f_prev_path = e.id
        left join track_wm1_list f on f.track_id=${res[i].id} \
        left join track_file_type_list g on d.track_type_id = g.id \
        left join album_list h on h.id = ${res[i].albumId} \
        where a.album_id=${res[i].albumId}`;
        let res_rel = await rms_db.sequelize.query(query, { type: QueryTypes.SELECT });
        res[i].album_member_title = res_rel.length ? res_rel[0].album_member_title : "";
        res[i].file_info = res_rel.length ? res_rel[0] : {};
    }

    result.list = res;
    return result;
};

exports.getSearchAlbumList = async (token, params) => {
    let result = {
        pagination: params.pagination,
        list: [],
    };
    let query = "";
    let res = [];
    if (params.filter.sort_by === 'played_ranking' || params.filter.sort_by === 'played_count') {
        // SELECT
        //     max(track.`count`),
        //         sum(track.count),
        //         track.slid AS id,
        //         rank.lastUpdated,
        //         track.count,
        //         track.slid,
        //         track.media,
        //         track.genre,
        //         track.`key`,
        //         track.tempo,
        //         track.dateId,
        //         track.sex,
        //         track.albumId,
        //         ord.rank,
        //         ord.lastRank
        //     FROM
        //         gg_radiostations_cache_track_rank `rank`
        //         LEFT JOIN gg_radiostations_cache_track track ON rank.dateId = track.dateId
        //         LEFT JOIN gg_radiostations_cache_track_order ord ON ord.dateId = track.dateId 
        //         AND ord.artistId = track.artistId 
        //         AND ord.slid = track.slid
        //         LEFT JOIN gg_songlist_artist_info info ON info.sl_artist_id = track.artistId 
        //     GROUP BY
        //         track.albumId 
        //     ORDER BY
        //         track.count DESC 
        //         LIMIT 0,
        //         10
        let query_select = `SELECT\
                track.slid as id,\
                rank.dateId AS dateId1,\
                rank.startTime,\
                rank.fromDate,\
                rank.lastUpdated,\
                rank.toDate,\
                rank.endTime,\
                track.count,\
                max(track.count) as max_count,
                sum(track.count) as sum_count,
                track.artistId,\
                track.artist,\
                track.slid,\
                track.media,\
                track.genre,\
                track.\`key\`,\
                track.tempo,\
                track.dateId,\
                track.sex,\
                track.albumId,\
                ord.rank,\
                ord.lastRank,\
                track.genre AS genre_name,\
                info.label,\
                info.label_link,\
                info.label_pic,\
                ord.sex AS osex,\
                ord.category AS ocategory,\
                info.weibo, \
                info.resume `;
        let query_from = `FROM\
                gg_radiostations_cache_track_rank \`rank\`\
                LEFT JOIN gg_radiostations_cache_track track ON rank.dateId = track.dateId\
                LEFT JOIN gg_radiostations_cache_track_order ord ON ord.dateId = track.dateId\ 
                AND ord.artistId = track.artistId \
                AND ord.slid = track.slid\
                LEFT JOIN gg_songlist_artist_info info ON info.sl_artist_id = track.artistId `;
        let query_where = `WHERE track.slid>=0 `;
        if (params.filter.keyword !== "")
            query_where += ` AND (track.media LIKE '%${params.filter.keyword}%' OR track.artist LIKE '%${params.filter.keyword}%' OR info.resume LIKE '%${params.filter.keyword}%') `;
        if (params.filter.genre.length)
            query_where += ` AND track.genre IN (${params.filter.genre})`;
        if (params.filter.mood.length)
            query_where += ` AND track.\`key\` IN (${params.filter.mood})`;

        let query_group = `GROUP BY track.albumId `;
        let query_order = `ORDER BY -ord.\`rank\` DESC`;
        if (params.filter.sort_by === 'played_count') query_order = `ORDER BY sum(track.count) DESC`;
        let query_count = `select count(*) as cnt,max(max_count) as max_count,max(sum_count) as sum_count from (select track.slid,track.albumId,track.count,max(track.count) as max_count,sum(track.count) as sum_count,count(*) as _count ${query_from} ${query_where} ${query_group}) count_table`;
        res = await radio_db.sequelize.query(query_count, { type: QueryTypes.SELECT });
        result.pagination.total = res[0].cnt;
        result.pagination.max = res[0].max_count;
        result.pagination.sum = Number(res[0].sum_count);
        result.pagination.pages = Math.ceil(result.pagination.total / result.pagination.size);

        query = `${query_select} ${query_from} ${query_where} ${query_group} ${query_order} limit ${params.pagination.page * params.pagination.size},${params.pagination.size}`;
        res = await radio_db.sequelize.query(query, { type: QueryTypes.SELECT });
    } else {
        query = `from album_list a \
            where a.title!='' `;
        /**
         *  Please don't join these because album:member=n:1 relation, so too much calculation is 5000000 * n
         *  left join album_member_rel b on b.album_id = a.id \
            left join member_list c on c.id = b.member_id \
         */
        if (params.filter.genre.length) {
            let genres = "";
            params.filter.genre.map((g) => {
                genres += (genres === "" ? "" : ",") + `'${g}'`;
            });
            //query += `and c.genre_id in (${genres}) `;
        }
        if (params.filter.mood.length) {
            // let moods = "";
            // params.filter.mood.map((m)=>{
            //     moods += (moods===""?"":",") + `'${m}'`;
            // });
        }
        if (params.filter.keyword !== "") {
            query += `and (a.title like '%${params.filter.keyword}%') `;
        }

        let query_count = `select count(*) as cnt ${query}`;
        res = await rms_db.sequelize.query(query_count, { type: QueryTypes.SELECT });
        result.pagination.total = res[0].cnt;
        result.pagination.pages = Math.ceil(result.pagination.total / result.pagination.size);

        if (params.filter.sort_by === 'alpha')
            query += `order by a.title `;
        else if (params.filter.sort_by === 'new_published')
            query += `order by a.update_date desc `;

        query = `select a.* ${query} limit ${params.pagination.page * params.pagination.size},${params.pagination.size}`;
        res = await rms_db.sequelize.query(query, { type: QueryTypes.SELECT });

        for (var i = 0; i < res.length; i++) {
            query = `select * from album_member_rel a left join member_list b on a.member_id=b.id where a.album_id=${res[i].id}`;
            let res_rel = await rms_db.sequelize.query(query, { type: QueryTypes.SELECT });
            res[i].members = res_rel;
        }
    }

    result.list = res;
    return result;
};

exports.getSearchArtistList = async (token, params) => {
    var decoded = jwt.decode(token);
    // let user = await this.getUserByName(decoded.account);
    let result = {
        pagination: params.pagination,
        list: [],
    };
    let query = "";
    let res = [];
    if (params.filter.sort_by === 'played_ranking' || params.filter.sort_by === 'played_count') {
        let query_select = `SELECT \
                \`rank\`.*,\
                artist.*,\
                ord.\`rank\`,\
                ord.lastRank,\
                info.label,\
                info.label_link,\
                info.label_pic,\
                info.resume,\
                ord.sex as osex,\
                ord.category as ocategory,\
                IFNULL(info.weibo,'') `;
        let query_from = `FROM\
                gg_radiostations_cache_artist_rank \`rank\` \
                LEFT JOIN gg_radiostations_cache_artist artist ON rank.dateId=artist.dateId \
                LEFT JOIN gg_radiostations_cache_artist_order ord ON artist.dateId=ord.dateId AND artist.artistId=ord.artistId \
                LEFT JOIN gg_songlist_artist_info info ON info.sl_artist_id=artist.artistId `;
        let query_where = `WHERE artist.artistId>=0 `;
        if (params.filter.keyword !== "")
            query_where += ` AND (artist.artist LIKE '%${params.filter.keyword}%' OR info.resume LIKE '%${params.filter.keyword}%') `;

        let query_order = `ORDER BY -ord.\`rank\` DESC`;
        if (params.filter.sort_by === 'played_count') query_order = `ORDER BY artist.count DESC`;
        let query_count = `select count(*) as cnt, max(artist.count) as max_count ${query_from} ${query_where}`;
        res = await radio_db.sequelize.query(query_count, { type: QueryTypes.SELECT });
        result.pagination.total = res[0].cnt;
        result.pagination.max_count = res[0].max_count;
        result.pagination.pages = Math.ceil(result.pagination.total / result.pagination.size);

        query = `${query_select} ${query_from} ${query_where} ${query_order} limit ${params.pagination.page * params.pagination.size},${params.pagination.size}`;
        res = await radio_db.sequelize.query(query, { type: QueryTypes.SELECT });
    } else {
        query = `from member_list a \
                where a.title!='' `;
        if (params.filter.genre.length) {
            let genres = "";
            params.filter.genre.map((g) => {
                genres += (genres === "" ? "" : ",") + `'${g}'`;
            });
            query += `and a.genre_id in (${genres}) `;
        }
        if (params.filter.mood.length) {
            // let moods = "";
            // params.filter.mood.map((m)=>{
            //     moods += (moods===""?"":",") + `'${m}'`;
            // });
        }
        if (params.filter.keyword !== "") {
            query += `and (a.title like '%${params.filter.keyword}%') `;
        }

        let query_count = `select count(*) as cnt ${query}`;
        res = await rms_db.sequelize.query(query_count, { type: QueryTypes.SELECT });
        result.pagination.total = res[0].cnt;
        result.pagination.pages = Math.ceil(result.pagination.total / result.pagination.size);

        if (params.filter.sort_by === 'alpha')
            query += `order by a.title `;
        else if (params.filter.sort_by === 'new_published')
            query += `order by a.update_date desc `;

        query = `select a.* ${query} limit ${params.pagination.page * params.pagination.size},${params.pagination.size}`;
        res = await rms_db.sequelize.query(query, { type: QueryTypes.SELECT });
    }
    result.list = res;
    return result;
};

exports.getSearchStationList = async (token, params) => {
    var decoded = jwt.decode(token);
    // let user = await this.getUserByName(decoded.account);
    let result = {
        pagination: params.pagination,
        list: [],
    };
    let query = "";
    let res = [];
    if (params.filter.sort_by === 'played_ranking' || params.filter.sort_by === 'played_count') {
        let query_select = `SELECT \
        radio.radioId,\
        radio.radioName,\
        radio.placeTypeId,\
        radio.styleTypeId,\
        radio.nativeTypeId,\
        radio.active,\
        radio.isIndex,\
        radio.streamLink,\
        radio.radioProperty,\
        radio.quality,\
        radio.playerUrl \
        `;
        let query_from = ` FROM \
        gg_radiostations radio \
        LEFT JOIN gg_radiostations_mood mood ON mood.radioId=radio.radioId `;
        let query_where = `WHERE radio.radioId>=0 `;
        // if (params.filter.keyword !== "")
        //     query_where += ` AND (artist.artist LIKE '%${params.filter.keyword}%' OR info.resume LIKE '%${params.filter.keyword}%') `;
        if (params.filter.keyword !== "")
            query_where += ` AND (radio.radioName LIKE '%${params.filter.keyword}%') `;
        // if (params.filter.genre.length)
        //     query_where += ` AND result.genreId IN (${params.filter.genre})`;
        if (params.filter.mood.length)
            query_where += ` AND mood.key IN (${params.filter.mood})`;
        let query_order = `ORDER BY radio.radioId DESC`;
        // if (params.filter.sort_by === 'played_count') query_order = `ORDER BY artist.count DESC`;
        let query_count = `select count(*) as cnt ${query_from} ${query_where}`;
        res = await radio_db.sequelize.query(query_count, { type: QueryTypes.SELECT });
        result.pagination.total = res[0].cnt;
        result.pagination.pages = Math.ceil(result.pagination.total / result.pagination.size);

        query = `${query_select} ${query_from} ${query_where} ${query_order} limit ${params.pagination.page * params.pagination.size},${params.pagination.size}`;
        res = await radio_db.sequelize.query(query, { type: QueryTypes.SELECT });
    } else {
        query = `from gg_radiostations_result a \
                    inner join gg_radiostations b on a.radioId=b.radioId \
                    group by a.radioId `;
        /**
         *  "WHERE result.date>="+ startTime +
            " AND result.date<="+ endTime +
            " AND result.radioId="+ radioId +
        */
        if (params.filter.genre.length) {
            let genres = "";
            params.filter.genre.map((g) => {
                genres += (genres === "" ? "" : ",") + `'${g}'`;
            });
            //query += `and c.genre_id in (${genres}) `;
        }
        if (params.filter.mood.length) {
            // let moods = "";
            // params.filter.mood.map((m)=>{
            //     moods += (moods===""?"":",") + `'${m}'`;
            // });
        }
        if (params.filter.keyword !== "") {
            //query += `and (b.radioName like '%${params.filter.keyword}%') `;
        }

        let query_count = `select count(*) as cnt from (select count(*) ${query}) c`;
        res = await radio_db.sequelize.query(query_count, { type: QueryTypes.SELECT });
        result.pagination.total = res[0].cnt;
        result.pagination.pages = Math.ceil(result.pagination.total / result.pagination.size);

        // if(params.filter.sort_by==='alpha')
        //     query += `order by a.title `;
        // else if(params.filter.sort_by==='new_published')
        //     query += `order by a.update_date desc `;

        query = `select b.*,count(*) as cnt ${query} limit ${params.pagination.page * params.pagination.size},${params.pagination.size}`;
        res = await radio_db.sequelize.query(query, { type: QueryTypes.SELECT });
    }


    result.list = res;
    return result;
};

exports.getFilterStations = async (token, params) => {
    var decoded = jwt.decode(token);
    let user = await this.getUserByName(decoded.account);
    let query = `SELECT radioId, radioName from gg_radiostations order by radioName`;
    let result = await radio_db.sequelize.query(query, { type: QueryTypes.SELECT });
    return result;
};

exports.getAnalyzeData = async (token, file) => {
    var decoded = jwt.decode(token);
    let user = await this.getUserByName(decoded.account);
    let query = `SELECT radioId, radioName from gg_radiostations order by radioName`;
    let result = await radio_db.sequelize.query(query, { type: QueryTypes.SELECT });
    return result;
};

exports.uploadTrackToAnalyze = async (token, file) => {
    var config = {
        method: 'post',
        url: `http://dashboard.cugate.com/upload_track/`,
        headers: {

        }
    };
    console.log(config);
    try {
        let response = await axios(config, { "musicFile": file });
        return response;
    } catch (e) {
        console.log(e);
    }
    return {};
};

exports.__gg_user = async () => {
    let query = `SELECT * FROM gg_user`;
    let result = await radio_db.sequelize.query(query, { type: QueryTypes.SELECT });
    return result;
};

exports.findByFacebookAccessToken = async (facebookId) => {
    let query = `SELECT * FROM gg_user WHERE facebook_user_id='${facebookId}'`;
    let result = await radio_db.sequelize.query(query, { type: QueryTypes.SELECT });
    if (result.length) return result[0];
    return null;
};

exports.findByGoogleAccessToken = async (googleId) => {
    let query = `SELECT * FROM gg_user WHERE google_user_id='${googleId}'`;
    let result = await radio_db.sequelize.query(query, { type: QueryTypes.SELECT });
    if (result.length) return result[0];
    return null;
};

exports.getUserById = async (userId) => {
    let query = `SELECT * FROM gg_user WHERE uid='${userId}'`;
    let result = await radio_db.sequelize.query(query, { type: QueryTypes.SELECT });
    if (result.length) return result[0];
    return null;
};

exports.getUserByName = async (userName) => {
    let query = `SELECT * FROM gg_user WHERE account='${userName}'`;
    result = await radio_db.sequelize.query(query, { type: QueryTypes.SELECT });
    if (result.length) return result[0];
    return null;
};

exports.createUser = async (account, pwd, key, name, expires, profilePic,
    facebookId, accessToken, type, email) => {
    let googleId = "";
    if (type === "google") {
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
    let query1 = `\
            INSERT INTO gg_user VALUES\ 
                (null, '${account}', '${pwd}', '${key}', null, ` + (name ? `,'${name}'` : null) + `,\
                null, '${email}', ${expires}, 1, ${(new Date()).getMilliseconds()},\
                null, 0, '', '', '', '1', '0', '${profilePic}', '${accessToken}',
                '${facebookId}', '${googleId}', '0', '1');\
    `;
    let result1 = await radio_db.sequelize.query(query1, { type: QueryTypes.INSERT });

    let query2 = `INSERT INTO user_list (nick_name, real_name, email, password) VALUES \
    ('${account}', '${name}', '${email}', '${pwd}')`;
    let result2 = await rms_db.sequelize.query(query2, { type: QueryTypes.INSERT });

    let query3 = `INSERT INTO xx_user_profile (user_id, track_user_id) VALUES ('${result1[0]}', '${result2[0]}')`;
    let result3 = await radio_db.sequelize.query(query3, { type: QueryTypes.INSERT });

    return result1;
};