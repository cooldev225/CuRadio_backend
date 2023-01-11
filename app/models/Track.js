'use strict'

const rms_db = require('../rms_models')
const rms_module = require('./../modules/rms')
const config = require('../config')
const moment = require('moment')
const { QueryTypes } = require('sequelize')
const Lib = require('./../Library/index')
const DB = require('./DB')
const TrackFile = require('./TrackFile')
const TrackFileRel = require('./TrackFileRel')

module.exports = class Track {
  static REGISTER_SUCCESS = 100
  static REGISTER_FAILED = 101
  static REGISTER_FILE_SAVE_ERROR = 102
  static TITLE_MISSED = 102
  static FIND_SUCCESS = 200

  static getUniqid () {
    var n = Math.floor(Math.random() * 11)
    var k = Math.floor(Math.random() * 1000000)
    var m = n + k
    return m
  }

  constructor () {
    this.id = -1
    this.title = ''
    this.part = ''
    this.track_type = ''
    this.instrumental = 0
    this.isrc = ''
    this.genre_id = 0
    this.fileunder_id = 0
    this.title_lang_id = 0
    this.lyrics_lang_id = 0
    this.publishers = ''
    this.price_code = ''
    this.explicit_content = 0
    this.circle_p = ''
    this.publication_date = ''
    this.catalogue = ''
    this.start_of_preview = ''
    this.release_date = ''
    this.distribution_territories = ''
    this.lyrics = ''
    this.rec_country_id = 0
    this.rec_city = ''
    this.rec_date = ''
    this.has_file = 0
    this.external_id = ''
    this.tag_status_id = 1
    this.register_date = ''
    this.register_ip = ''
    this.register_from = ''
    this.track_file = null
  }

  static fromRequest (formData, remoteAddress = null, trackFile = null) {
    let track = new Track()
    track.title = formData.track_title
    track.part = formData.track_part
    track.track_type = formData.track_type
    track.instrumental = formData.instrumental
    track.isrc = formData.isrc
    track.genre_id = formData.genre_id
    track.fileunder_id = formData.fileunder_id
    track.title_lang_id = formData.title_lang_id
    track.lyrics_lang_id = formData.lyrics_lang_id
    track.publishers = formData.publishers
    track.price_code = formData.price_code
    track.explicit_content = formData.explicit_content
    track.circle_p = formData.circle_p
    track.publication_date = formData.publication_date
    track.catalogue = formData.catalogue
    track.start_of_preview = formData.start_of_preview
    track.release_date = formData.release_date
    track.distribution_territories = formData.distribution_territories
    track.lyrics = formData.lyrics
    track.rec_country_id = formData.rec_country_id
    track.rec_city = formData.rec_city
    track.rec_date = formData.rec_date
    track.has_file = formData.has_file
    track.external_id = formData.external_id
    track.register_from = formData.register_from
    track.tag_status_id = 1
    track.register_date = moment().format('YYYY-MM-DD HH:mm:ss')
    track.register_ip = remoteAddress
    track.track_file = trackFile ? trackFile : null
    return track
  }

  find (track_id) {
    //
  }
  async register () {
    let obj = {}
    if (DB.fieldCheck(this.title)) {
      if (DB.fieldCheck(this.title)) obj.title = this.title
      if (DB.fieldCheck(this.part)) obj.part = this.part
      if (DB.fieldCheck(this.track_type)) obj.track_type = this.track_type
      if (DB.fieldCheck(this.instrumental)) obj.instrumental = this.instrumental
      if (DB.fieldCheck(this.isrc)) obj.isrc = this.isrc
      if (DB.fieldCheck(this.genre_id)) obj.genre_id = this.genre_id
      if (DB.fieldCheck(this.fileunder_id)) obj.fileunder_id = this.fileunder_id
      if (DB.fieldCheck(this.title_lang_id))
        obj.title_lang_id = this.title_lang_id
      if (DB.fieldCheck(this.lyrics_lang_id)) obj.lang_id = this.lyrics_lang_id
      if (DB.fieldCheck(this.publishers)) obj.publisher_id = this.publishers
      if (DB.fieldCheck(this.price_code)) obj.price_code_id = this.price_code
      if (DB.fieldCheck(this.circle_p)) obj.circle_p = this.circle_p
      if (DB.fieldCheck(this.publication_date))
        obj.publication_date = this.publication_date
      if (DB.fieldCheck(this.catalogue)) obj.catalogue_num = this.catalogue
      if (DB.fieldCheck(this.release_date)) obj.release_date = this.release_date
      if (DB.fieldCheck(this.distribution_territories))
        obj.distribution = this.distribution_territories
      if (DB.fieldCheck(this.lyrics)) obj.lyrics = this.lyrics
      if (DB.fieldCheck(this.version)) obj.version = this.version
      if (DB.fieldCheck(this.arrangement_id))
        obj.arrangement_id = this.arrangement_id
      if (DB.fieldCheck(this.genre_from_file))
        obj.genre_from_file = this.genre_from_file
      if (DB.fieldCheck(this.tag_status_id))
        obj.tag_status_id = this.tag_status_id
      if (DB.fieldCheck(this.has_file)) obj.has_file = this.has_file
      if (DB.fieldCheck(this.lineup)) obj.lineup = this.lineup
      if (DB.fieldCheck(this.characters)) obj.characters = this.characters
      if (DB.fieldCheck(this.from_movie)) obj.from_movie = this.from_movie
      if (DB.fieldCheck(this.score_url)) obj.score_url = this.score_url
      if (DB.fieldCheck(this.colour_id)) obj.colour_id = this.colour_id
      if (DB.fieldCheck(this.rec_country_id))
        obj.rec_country_id = this.rec_country_id
      if (DB.fieldCheck(this.rec_city)) obj.rec_city = this.rec_city
      if (DB.fieldCheck(this.rec_date)) obj.rec_date = this.rec_date
      if (DB.fieldCheck(this.rec_company_id))
        obj.rec_company_id = this.rec_company_id
      if (DB.fieldCheck(this.copyright_c)) obj.copyright_c = this.copyright_c
      if (DB.fieldCheck(this.copyright_c_year))
        obj.copyright_c_date = this.copyright_c_year
      if (DB.fieldCheck(this.register_from))
        obj.register_from = this.register_from
      if (DB.fieldCheck(this.register_date))
        obj.register_date = this.register_date
      if (DB.fieldCheck(this.register_ip)) obj.register_ip = this.register_ip
      if (DB.fieldCheck(this.trash_status)) obj.trash_status = this.trash_status
      if (DB.fieldCheck(this.rec_date)) obj.rec_date = this.rec_date
      if (DB.fieldCheck(this.online)) obj.online = this.online
      if (DB.fieldCheck(this.comments)) obj.comments = this.comments
      if (DB.fieldCheck(this.update_time)) obj.update_time = this.update_time
      if (DB.fieldCheck(this.explicit_content))
        obj.explicit_content = this.explicit_content
      if (DB.fieldCheck(this.start_of_preview))
        obj.prelistening_index = this.start_of_preview
      if (DB.fieldCheck(this.prelistening_duration))
        obj.prelistening_duration = this.prelistening_duration
      if (DB.fieldCheck(this.external_id)) obj.external_id = this.external_id
      if (DB.fieldCheck(this.shenzhen_id)) obj.shenzhen_id = this.shenzhen_id
      if (DB.fieldCheck(this.unconfirmed)) obj.unconfirmed = this.unconfirmed
      if (DB.fieldCheck(this.mood)) obj.mood = this.mood
      if (DB.fieldCheck(this.price_code)) obj.price_code_id = this.price_code
      if (DB.fieldCheck(this.uniqid)) obj.uniqid = this.uniqid
      else obj.uniqid = Track.getUniqid()

      let fieldString = ''
      let valueString = ''
      let isFirst = true
      for (const field in obj) {
        if (Object.hasOwnProperty.call(obj, field)) {
          const value = obj[field]
          if (isFirst) {
            fieldString += ' ('
            valueString += ' VALUES ('
          } else {
            fieldString += ', '
            valueString += ', '
          }
          fieldString += field
          valueString += `'${Lib.String.escapeStr(value)}'`
          isFirst = false
        }
      }
      fieldString += ')'
      valueString += ')'
      let query =
        'INSERT INTO ' + config.Tables['track'] + fieldString + valueString
      let sqlRes = await rms_db.sequelize.query(query, {
        type: QueryTypes.INSERT
      })
      let id = sqlRes[0]
      let res = {
        id: id,
        status: id ? Track.REGISTER_SUCCESS : Track.REGISTER_FAILED
      }
      if (res.status == Track.REGISTER_SUCCESS) {
        if (this.track_file) {
          let trackFile = await TrackFile.fromFile(this.track_file)
          let trackFileRegisterRes = await trackFile.register()
          if ((trackFileRegisterRes.status = TrackFile.REGISTER_SUCCESS)) {
            let trackFileRel = new TrackFileRel(res.id, trackFileRegisterRes.id)
            let trackFileRelRegisterRes = await trackFileRel.register();
            let c = 5;
          }
        }
      }
      return res
    } else {
      return {
        id: -1,
        status: Track.TITLE_MISSED
      }
    }
  }

  static async findTracksByTitle (keyword, request) {
    let TERM = keyword
    let register_from = 2
    let result = []
    let track_list = await Track.getTrackList(
      register_from,
      0,
      TERM.trim(),
      1,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      'TITLE',
      'ASC',
      0,
      20
    )
    for (let i = 0; i < track_list.result.length; i++) {
      let track_id = track_list.result[i]['id'] //track_id
      let file_id = track_list.result[i]['file_id']
      let track_title = track_list.result[i]['title']
      let track_part = track_list.result[i]['part']
      let track_version = track_list.result[i]['version']
      let track_num = track_list.result[i]['track_num']

      //Genre
      let genre_title = track_list.result[i]['genre_title']
      let val = track_title
      let label = {}
      label.track_title = track_title
      label.track_part = track_part
      label.version = track_list.result[i]['version']
      let artist = await rms_module.cug_get_member_name_or_alias(
        track_list.result[i]['member_title'],
        track_list.result[i]['member_alias'],
        track_list.result[i]['member_used_name']
      )
      // label += artist ? (" / " + artist.replace("\"", '\"', artist)) : "";
      label.artist = artist
      // label += genre_title ? (" / " + genre_title) : "";
      label.genre_title = genre_title
      let client = await rms_module.cug_get_client(
        track_list.result[i]['register_from']
      )
      label.clientTitle = client.title
      // label += client.title ? " / <span style='color:#0099FF;'>" + client.title + "</span>" : "";

      //Track Marker (Registered From)
      let marker_arr = rms_module.get_marker(
        track_list.result[i]['register_from']
      )
      let track_marker =
        '<span class="badge badge-default" title="{' +
        marker_arr['full'] +
        '}">{' +
        marker_arr['short'] +
        '}</span>'
      track_marker = track_marker
      //-------------------------

      let part = track_part
      let version = track_list.result[i]['version']
      let seconds = track_list.result[i]['track_time']
        ? track_list.result[i]['track_time']
        : '0'
      let time = rms_module.cug_mseconds_to_time(seconds, 3)
      let tag_status_id = track_list.result[i]['tag_status_id']

      let performers_str = rms_module.get_track_members_str(
        { 0: track_id },
        true,
        false
      )
      let performers = performers_str

      let composers_str = rms_module.get_track_members_str(
        { 0: track_id },
        false,
        true,
        'html'
      )
      let composers = composers_str.replace('"', '"', composers_str)
      let has_file
      let server_app, stream, file_info
      if (track_list.result[i]['has_file'] > 0) {
        file_info = rms_module.cug_get_obj_file_info(
          file_id,
          'TRACK',
          'mp3',
          rms_module.cug_get_url_protocol(request) +
            '://' +
            track_list.result[i]['f_orgn_path']
        )
        server_app =
          'rtmp://' +
          track_list.result[i]['f_orgn_path'] +
          '/' +
          track_list.result[i]['f_orgn_path2']
        //stream = "mp3:".file_info['dir_tree_u']."/".file_info['filename'];

        stream =
          track_list.result[i]['f_prev_path'] +
          '/?i=' +
          track_list.result[i]['file_id']

        has_file = 1
      } else {
        has_file = 0
      }

      //get values for tracks table
      let limit_chars = 75
      let track_title_limited =
        track_title.length > limit_chars
          ? track_title.substring(0, limit_chars) + '...'
          : track_title
      let track_hint = track_title ? 'Title: ' + track_title + '^' : ''
      track_hint += track_part ? 'Part: ' + track_part + '^' : ''
      track_hint += track_version ? 'Version: ' + track_version : ''

      let track_part_ver = track_part
        ? '<b>Part:</b> ' +
          (track_part.length > limit_chars
            ? track_part.substring(0, limit_chars) + '...'
            : track_part)
        : ''
      track_part_ver =
        track_version && !track_part_ver
          ? '<b>Version:</b> ' +
            (track_version.length > limit_chars
              ? track_version.substring(0, limit_chars) + '...'
              : track_version)
          : track_part_ver

      //--------------------
      limit_chars = 33

      artist = ''
      let artist_id = 0
      let members = rms_module.cug_get_track_members(track_id, 0)
      if (members.length > 0) {
        artist = await rms_module.cug_get_member_name_or_alias(
          members[0]['title'],
          members[0]['alias'],
          members[0]['used_name']
        )
        artist =
          strlen(artist) > limit_chars
            ? artist.substring(0, limit_chars) + '...'
            : artist
        artist_id = members[0]['member_id']
      }
      //---------------------
      let composer = ''
      let composer_id = 0
      for (let comp = 1; comp < members.length; comp++) {
        if (members[comp]['role_title'] == 'Composer') {
          composer = await rms_module.cug_get_member_name_or_alias(
            members[comp]['title'],
            members[comp]['alias'],
            members[comp]['used_name']
          )
          composer =
            strlen(composer) > limit_chars
              ? composer.substring(0, limit_chars) + '...'
              : composer
          composer_id = members[comp]['member_id']
          break
        }
      }

      let all_members = rms_module.choose_all_members(members, '^')
      //------------------------------------
      //------------------------------------
      let result_t = {}
      result_t.track_id = track_id
      result_t.value = val
      result_t.label = label
      result_t.file_id = file_id
      result_t.part = part
      result_t.version = version
      result_t.performers = performers
      result_t.time = time
      result_t.tag_status_id = tag_status_id
      result_t.track_num = track_num
      result_t.seconds = seconds
      result_t.track_marker = track_marker
      result_t.genre_title = genre_title
      result_t.artist = artist
      result_t.artist_id = artist_id
      result_t.compose = composer
      result_t.composer_id = composer_id
      result_t.track_title_limited = track_title_limited
      result_t.track_hint = track_hint
      result_t.all_members = all_members
      if (has_file == 1) {
        result_t.server_app = server_app
        result_t.stream = stream
        result_t.has_file = 1
      } else result_t.has_file = 0
      result_t.composer = composer
      object_found = true
      result.push(result_t)
    }
    return result
  }

  static async getTrackList (
    register_from = '0',
    tag_status = 0,
    search_term = 'null',
    is_track_title = 0,
    is_album_title = 0,
    is_genre_title = 0,
    is_ean_code = 0,
    is_catalogue_num = 0,
    is_artist = 0,
    is_composer = 0,
    user_id = 0,
    action_id = 0,
    object_id = 0,
    trash_status = 0,
    sort_field = 'TITLE',
    sort_method = 'ASC',
    limit_from = 0,
    limit_quant = 30,
    online = -1,
    is_track_id = 0,
    duplicate_group_id = 0
  ) {
    let result_arr = []
    let result_index = 0
    let index = 0

    // First Query
    let query = `CALL get_track_list_te('${register_from}',${tag_status},`
    query +=
      search_term == 'null' || !search_term
        ? 'null,'
        : search_term.length > 3
        ? "'%" + Lib.String.escapeStr(search_term) + "%',"
        : "'" + Lib.String.escapeStr(search_term) + "%',"
    query += `${is_track_title},${is_album_title},${is_genre_title},${is_ean_code},${is_catalogue_num},${is_artist},${is_composer},`
    query += `${user_id},${action_id},${object_id},${trash_status},'${Lib.String.escapeStr(
      sort_field
    )}','${Lib.String.escapeStr(
      sort_method
    )}',${limit_from},${limit_quant}, ${online},${is_track_id},${duplicate_group_id});`

    //echo query+"</br>";
    // Second Query
    let records = await rms_db.sequelize.query(query)
    query = 'SELECT FOUND_ROWS() AS total;'

    let total = (await rms_db.sequelize.query(query))[0][0].total
    return {
      total: total,
      result: records
    }
    // result.forEach(row => {
    //     row.forEach(item => {
    //         result_arr[result_index][index] = row;
    //         index ++;
    //     });
    //     result_index ++;
    //     index = 0;
    //     result->free();

    //     if (!mysqli->more_results())
    //         break;
    // });
    // return result_arr;
  }
}

//   constructor (
//     track_title,
//     track_part,
//     track_type,
//     instrumental,
//     isrc,
//     genre_id,
//     title_lang_id,
//     fileunder_id,
//     lyrics_lang_id,
//     publishers,
//     price_code,
//     explicit_content,
//     circle_p,
//     publication_date,
//     catalogue,
//     start_of_preview,
//     release_date,
//     distribution_territories,
//     lyrics,
//     rec_country_id,
//     members,
//     register_from
//   ) {
//     this.id = -1;
//     this.title = track_title
//     this.part = track_part
//     this.track_type = track_type
//     this.instrumental = instrumental
//     this.isrc = isrc
//     this.genre_id = genre_id
//     this.fileunder_id = fileunder_id
//     this.title_lang_id = title_lang_id
//     this.lyrics_lang_id = lyrics_lang_id
//     this.publishers = publishers
//     this.price_code = price_code
//     this.explicit_content = explicit_content
//     this.circle_p = circle_p
//     this.publication_date = publication_date
//     this.catalogue = catalogue
//     this.start_of_preview = start_of_preview
//     this.release_date = release_date
//     this.distribution_territories = distribution_territories
//     this.lyrics = lyrics
//     this.rec_country_id = rec_country_id
//     this.rec_city = rec_city
//     this.rec_date = rec_date
//     this.has_file = has_file
//     this.external_id = external_id
//     this.tag_status_id = 1
//     this.register_date = ""
//     this.register_ip = ""
//     this.register_from = register_from
//   }
