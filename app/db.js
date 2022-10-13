const stat_db = require("./stat_models");
const rms_db = require("./rms_models");
const cur_db = require("./cur_models");
const radio_db = require("./radio_models");
const { QueryTypes, Op } = require("sequelize");
const { getArtistPic, getMood, getTempo } = require('./utils');
exports.getRMS = async (params) => {
    let result = {};
    if(params.a === 1){

    }else if(params.a === 2){
        let table = "track_played_total__"+params.time_period;

    }else{

    }
    let query = "show tables";
    result = await stat_db.sequelize.query(query, {type: QueryTypes.SELECT});
    return result;
}

exports.getTrackInfo = async (id) => {
    let result = {};
    let track = await this.getTrackInfoData(id);

    if(track !== null){
        let artistId = track.memberId;
        let artistName = await this.getArtistNameById(id);
        let artistInfo = await this.getArtistInfoById(artistId);
        if(artistName==="")
            artistInfo = await this.getArtistInfoByName(track.artist);
        
        let topList =  await this.getRMSPlayedTrack(artistId,10,track);
        let albumList = await this.getAlbums(artistId);
        trackList = await this.getTracks(artistId);

        result = {
            track: track,
            artistInfo: artistInfo,
            topList: topList,
            albumList: albumList,
            trackList: trackList,
        }
    }
    return result;
}

exports.getArtistInfoById = async (id) => {
    let artistName = await this.getArtistNameById(id);
    return await this.getArtistInfoByName(artistName);
}

exports.getArtistNameById = async (id) => {
    let artistName = "";
    let query = "SELECT sl_artist_name FROM gg_songlist_artist_info WHERE sl_artist_id=\"" + id+"\"";
    let res = await radio_db.sequelize.query(query, {type: QueryTypes.SELECT});
    if(res.length){
        artistName = res[0].sl_artist_name;
    }
    return artistName;
}

exports.getArtistInfoByName = async (name) => {
    let query = "SELECT a1.label,a1.label_link,a1.label_pic,a1.resume,a1.sl_artist_id,a1.weibo,a1.sl_artist_name FROM `gg_songlist_artist_info` a1 "
        + "WHERE a1.sl_artist_name=\"" + name+"\"";
    let res = await radio_db.sequelize.query(query, {type: QueryTypes.SELECT});
    
    let info = {
        artistId:-1,
        artistName:'',
        sex:0,   
	    category:0,
	    weibo:'',
        label:'',
	    labelLink:'',
	    headPicLink:'',  
	    externalLinks:null,
	    resume:''
    }
    if(res.length){
        info.artistId = res[0].sl_artist_id;
        info.label=res[0].label;
        info.labelLink=res[0].label_link;
        info.headPicLink=res[0].label_pic!==null&&res[0].label_pic!==''?res[0].label_pic:getArtistPic(info.artistId,-1);
        info.resume = res[0].resume;
        info.artistName = res[0].sl_artist_name;
        info.weibo = res[0].weibo;
    }
    return info;
}

exports.getRMSPlayedTrack = async (id, count, track) => {
    let tracks = [];
    let query = "select sl_id,count(*) as c from cugate_artist_track_play_time where sl_artist_id="+id+" GROUP BY sl_id, sl_artist_id  ORDER BY c DESC LIMIT "+count;
    console.log(['query = ',query]);
    let sids = await radio_db.sequelize.query(query, {type: QueryTypes.SELECT});
    //return tracks;
    for(var i=0;i<sids.length;i++){
        //let fp = await this.getTrackFP(sids[i].sl_id);
        //fp = fp.lenth>0? [fp[0].key,fp[0].bpm]: [0,60];
        let infos = await this.getTrackInfoData(sids[i].sl_id);
        if(infos !== null&&infos!==undefined){
            let info = [1,2,3,4,5,track.member,infos.track,0,
                        infos.track_id,1,sids[i].c,id,infos.album,
                        'fp[0]','fp[1]',infos.genre,-1,infos.album_id?infos.album_id:-1,
                        getArtistPic(-1,infos.album_id?infos.album_id:-1)]
            tracks.push(info); 
        }
    }
    return tracks;
}

exports.getTrackFP = async (id) => {
    let query = "SELECT fp.`key`,fp.bpm FROM gg_songlist_fp fp WHERE sl_id="+id;
    let res = await radio_db.sequelize.query(query, {type: QueryTypes.SELECT});
    return res;
}

exports.getTrackInfoData = async (id) => {
    let query = "SELECT "+
        "sl.title as track,"+
        "album.title as album,"+
        "member.title as member,"+
        "genre.title as genre,"+
        "album.id as album_id, "+
        "sl.id as track_id, "+
        "member.id as member_id " + 
        "FROM "+
        "(select * from track_list where id = "+id+") sl "+
        "LEFT JOIN track_member_rel tmr on (tmr.track_id = sl.id and tmr.role_id=43) "+
        "LEFT JOIN member_list member on member.id = tmr.member_id "+
        "LEFT JOIN (select * from track_album_rel where track_id="+id+") tar on tar.track_id=sl.id "+
        "left join album_list album on album.id=tar.album_id "+
        "left join genre_list genre on genre.id=sl.genre_id ";
    let trackList = await rms_db.sequelize.query(query, {type: QueryTypes.SELECT});
    if(trackList.length){
        let track = {
            title:trackList[0].track,
            album:trackList[0].album,
            mood:getMood(2),
            genre:trackList[0].genre,
            tempo:getTempo(100),
            artist:trackList[0].member,
            albumId:trackList[0].album_id,
            trackId:trackList[0].track_id,
            memberId:trackList[0].member_id,
            pic:getArtistPic(-1,trackList[0].album_id),
            rank:await this.getTrackRank(trackList[0].track,trackList[0].member)
        }
        query = "SELECT fp.`key`,fp.bpm FROM gg_songlist_fp fp WHERE sl_id="+id;
        let trackFp = await radio_db.sequelize.query(query, {type: QueryTypes.SELECT});
        if(trackFp.length){
            track.mood = getMood(trackFp[0].key);
            track.tempo = getTempo(trackFp[0].bpm);
        }
        return track;
    }
    return null;
}

exports.getAlbums = async (id) => {
    let query  = "SELECT "+
						"album.id,"+
						"album.title "+
					"FROM "+
						"track_list sl "+
						"LEFT JOIN track_member_rel tmr ON ( tmr.track_id = sl.id AND tmr.role_id = 43 ) "+
						"LEFT JOIN member_list member ON member.id = tmr.member_id "+
						"LEFT JOIN track_album_rel tar ON tar.track_id = sl.id "+
						"LEFT JOIN album_list album ON album.id = tar.album_id "+
					"WHERE "+
						"member.id =  "+ id + 
					" GROUP BY "+
						"album.id";
    let res = await rms_db.sequelize.query(query, {type: QueryTypes.SELECT});
    let result = [];
    if(res.length){
        for(var i=0;i<res.length;i++){
            let obj = {
                id:res[i].id,
                title:res[i].title,
                pic:getArtistPic(-1,res[i].id),
            }
            result.push(obj);
        }
    }
    return result;

}

exports.getTracks = async (artist_id) => {
    let query  = "select track.title as track,album.title as album,track.id as track_id,album.id as album_id,played.played_count from track_member_rel tmr "+ 
    "left join track_list track on  (tmr.track_id=track.id and tmr.role_id=43) "+ 
    "left join track_album_rel tar on track.id=tar.track_id "+ 
    "left join album_list album on album.id=tar.album_id "+ 
    "left join curadio_track_played_count played on played.track_id=track.id " +
    "where tmr.member_id=" + artist_id + " " + 
    "ORDER BY played.played_count desc, album.title asc";
    //return await rms_db.sequelize.query(query, {type: QueryTypes.SELECT});
    query = 'select track.media,track.`key`,track.slid,track.albumId,ord.rank \
        from gg_radiostations_cache_track_rank `rank` \
        left join gg_radiostations_cache_track track on rank.dateId=track.dateId \
        left join gg_radiostations_cache_track_order ord on ord.dateId=track.dateId and ord.artistId=track.artistId and ord.slid=track.slid \
        LEFT JOIN gg_songlist_artist_info info on info.sl_artist_id=track.artistId \
        where track.artistId='+artist_id+' \
        group by ord.slid \
        order by ord.rank';
    query = 'select mediaName as track,albumName as album,slid as track_id,albumId as album_id from gg_radiostations_result where artistId='+artist_id+' group by slid';
    return await radio_db.sequelize.query(query, {type: QueryTypes.SELECT});
}

exports.getTrackRank = async (track, artist) => {
    let rank = {
        rank:-1,
        freq:0,
        month:''
    };
    let query  = "select * from gg_radiostations_track_freq group by month order by month desc";
    let res = radio_db.sequelize.query(query, {type: QueryTypes.SELECT});
    if(res.length){
        for(var i=0;i<res.length;i++){
            query  = "select count(b.freq)+1 as cnt,a.freq "+
                "from gg_radiostations_track_freq a "+
                "left join gg_radiostations_track_freq b "+
                "on a.month=b.month and a.freq<b.freq "+
                "where a.artist='"+artist+"' and a.track='"+track+"' and a.month='"+res[i].month+"' ";
            let _res = radio_db.sequelize.query(query, {type: QueryTypes.SELECT});
            if(_res.length){
                 if(minr==-1||rank.rank>_res[0].cnt){
                    rank = _res[0];
                 }
            }
        }
    }
    return rank;
}

exports.getActiveRadios = async () => {
    //radioId, radioName, placeTypedId, styleTypedId, nativeTypedId, active, isIndex, streamLink, radioProperty, quality, playerUrl, nativeTypeName
    let query  = "SELECT r.*, t.nativeTypeName FROM gg_radiostations r INNER JOIN gg_radiostations_latest_result rs ON r.radioId=rs.radioId LEFT JOIN gg_radio_native_type t ON r.nativeTypeId = t.nativeTypeId";
    let res = radio_db.sequelize.query(query, {type: QueryTypes.SELECT});
    return res;
}