const config = require('../config')
const radio_db = require('../radio_models')
const rms_db = require('../rms_models')
const stat_db = require('../stat_models')
const { QueryTypes, Op } = require('sequelize')
const { getRandString } = require('../utils')
const md5 = require('md5')
const jwt = require('jsonwebtoken')
const secret = config.APP_SECRET_KEY
const axios = require('axios')
const https = require('https')
const xml2js = require('xml2js')
const moment = require('moment')
const WEATHER_API_KEY = 'd931d74d618f5604632371f4fa5c3f4d'

function escape_str (str) {
  return str
}

exports.getTrackList = async (
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
) => {
  let result_arr = []
  let result_index = 0
  let index = 0

  // First Query
  query = `CALL get_track_list_te('${register_from}',${tag_status},`
  query +=
    search_term == 'null' || !search_term
      ? 'null,'
      : search_term.length > 3
      ? "'%" + escape_str(search_term) + "%',"
      : "'" + escape_str(search_term) + "%',"
  query += `${is_track_title},${is_album_title},${is_genre_title},${is_ean_code},${is_catalogue_num},${is_artist},${is_composer},`
  query += `${user_id},${action_id},${object_id},${trash_status},'${escape_str(
    sort_field
  )}','${escape_str(
    sort_method
  )}',${limit_from},${limit_quant}, ${online},${is_track_id},${duplicate_group_id});`

  //echo query+"</br>";
  // Second Query
  let records = await rms_db.sequelize.query(query)
  query = 'SELECT FOUND_ROWS() AS total;'

  let total = (await rms_db.sequelize.query(query))[0][0].total
  console.log(total)

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

exports.cug_get_member_name_or_alias = async (
  member_name,
  member_alias,
  used_name = 2
) => {
  if (used_name == 1 || used_name == 2) {
    if (used_name == 2 && member_alias) {
      return member_alias
    } else {
      return member_name
    }
  } else {
    return member_name
  }
}

exports.cug_get_client = async (item, item_type = 'ID') => {
  // global $mysqli, $Tables, $FILE_SERVER_URL;

  if (item) {
    let query = ''
    if (item_type == 'ID') {
      query =
        'SELECT * FROM ' +
        config.Tables['client'] +
        ' WHERE id=' +
        escape_str(item)
    } else if (item_type == 'UNIQID') {
      query =
        'SELECT * FROM ' +
        config.Tables['client'] +
        " WHERE uniqid='" +
        escape_str(item) +
        "'"
    } else if (item_type == 'TITLE') {
      query =
        'SELECT * FROM ' +
        config.Tables['client'] +
        " WHERE title='" +
        escape_str(item) +
        "'"
    } else {
      return NULL
    }
    let r = await rms_db.sequelize.query(query, { type: QueryTypes.SELECT })
    if (r) {
      let arr = r[0]
      if (arr) {
        let obj = {}

        obj.id = arr['id']
        obj.title = arr['title']
        obj.dba = arr['dba']
        obj.parent_id = arr['parent_id']
        obj.level = arr['level']
        obj.country_id = arr['country_id']
        obj.state = arr['state']
        obj.city = arr['city']
        obj.addr = arr['addr']
        obj.url = arr['url']
        obj.zip_code = arr['zip_code']
        obj.tel = arr['tel']
        obj.fax = arr['fax']
        obj.email = arr['email']
        obj.admin_name = arr['admin_name']
        obj.admin_email = arr['admin_email']
        obj.admin_phone = arr['admin_phone']
        obj.acc_name = arr['acc_name']
        obj.acc_email = arr['acc_email']
        obj.acc_phone = arr['acc_phone']
        obj.tech_name = arr['tech_name']
        obj.tech_email = arr['tech_email']
        obj.tech_phone = arr['tech_phone']
        obj.register_date = arr['register_date']
        obj.register_ip = arr['register_ip']
        obj.status_id = arr['status_id']
        obj.reg_module_id = arr['reg_module_id']
        obj.reg_module_details_id = arr['reg_module_details_id']
        obj.delivery_email = arr['delivery_email']
        obj.uniqid = arr['uniqid']
        obj.update_time = arr['update_time']

        img_path = obj.img_path ? obj.img_path : config.FILE_SERVER_URL
        //img_path = obj.img_path) ? cug_get_url_protocol()+"://" + obj.img_path : $FILE_SERVER_URL;

        obj.img_34 = img_path + '/?o=client&i=' + obj.id + '&s=34'
        obj.img_64 = img_path + '/?o=client&i=' + obj.id + '&s=64'
        obj.img_174 = img_path + '/?o=client&i=' + obj.id + '&s=174'
        obj.img_300 = img_path + '/?o=client&i=' + obj.id + '&s=300'
        obj.img_600 = img_path + '/?o=client&i=' + obj.id + '&s=600'
        obj.img_orgn = img_path + '/?o=client&i=' + obj.id + '&s=mega'

        obj.img_34_num = arr['img_34']
        obj.img_64_num = arr['img_64']
        obj.img_174_num = arr['img_174']
        obj.img_300_num = arr['img_300']
        obj.img_600_num = arr['img_600']
        obj.img_orgn_num = arr['img_orgn']

        /*
				if(arr['img_34'] == 1) {
					$file_info = cug_get_obj_file_info(arr['id'], 'CLIENT', '34', img_path);
					obj.img_34 = $file_info['url'];
				}
				else { 
					obj.img_34 = "";
				}
				//-------
				if(arr['img_64'] == 1) {
					$file_info = cug_get_obj_file_info(arr['id'], 'CLIENT', '64', img_path);
					obj.img_64 = $file_info['url'];
				}
				else {
					obj.img_64 = "";
				}
				//-------
				if(arr['img_174'] == 1) {
					$file_info = cug_get_obj_file_info(arr['id'], 'CLIENT', '174', img_path);
					obj.img_174 = $file_info['url'];
				}
				else {
					obj.img_174 = "";
				}
				//-------
				if(arr['img_300'] == 1) {
					$file_info = cug_get_obj_file_info(arr['id'], 'CLIENT', '300', img_path);
					obj.img_300 = $file_info['url'];
				}
				else {
					obj.img_300 = "";
				}
				//-------
				if(arr['img_600'] == 1) {
					$file_info = cug_get_obj_file_info(arr['id'], 'CLIENT', '600', img_path);
					obj.img_600 = $file_info['url'];
				}
				else {
					obj.img_600 = "";
				}
				//-------
				if(arr['img_orgn'] > 0) {
					$file_info = cug_get_obj_file_info(arr['id'], 'CLIENT', 'mega', img_path);
					obj.img_orgn = $file_info['url'];
				}
				else {
					obj.img_orgn = "";
				}
				//-------
				*/

        return obj
      } else return NULL
    } else return NULL
  } else {
    return NULL
  }
}

exports.get_marker = register_from => {
  let marker = {}

  switch (register_from) {
    //Nuclear Blast
    case 1:
      marker['short'] = 'N'
      marker['full'] = 'Nuclear Blast'
      break

    //Nuclear Blast
    case 2:
      marker['short'] = 'C'
      marker['full'] = 'Cugate Ltd.'
      break

    //Russian EAN
    case 675:
      marker['short'] = 'R'
      marker['full'] = 'Russian EAN'
      break

    //Other (200000)
    case 1019:
      marker['short'] = 'O'
      marker['full'] = 'Other'
      break

    //Recxp
    case 1310:
      marker['short'] = 'X'
      marker['full'] = 'Recxp'
      break

    //Tony
    case 3066:
      marker['short'] = 'T'
      marker['full'] = 'Tony'
      break

    //---------
    default:
      marker['short'] = ''
      marker['full'] = ''
      break
  }

  return marker
}

exports.cug_mseconds_to_time = (milliseconds = 0, format = 1) => {
  milliseconds = Number(milliseconds)
  seconds = Math.floor(milliseconds / 1000)
  minutes = Math.floor(seconds / 60)
  hours = Math.floor(minutes / 60)
  milliseconds = milliseconds % 1000
  seconds = seconds % 60
  minutes = minutes % 60
  let duration = moment(moment.duration(milliseconds, 'millisecond')._data)

  if (format == 1) {
    // 00:03:55.937
    // format = '%02u:%02u:%02u.%03u'
    // time = sprintf(format, hours, minutes, seconds, milliseconds)
    return duration.format('hh:mm:ss.SSS')
    //return rtrim(time, '0');
  } else if (format == 2) {
    // 03:55
    // format = '%02u:%02u'
    // time = sprintf(format, minutes, seconds)
    return duration.format('mm:ss')
  } else if (format == 3) {
    // 00:03:55
    // format = '%02u:%02u:%02u'
    // time = sprintf(format, hours, minutes, seconds)
    return duration.format('hh:mm:ss.SSS')
    //return rtrim(time, '0');
  }
}

exports.get_track_members_str = (
  track_ids_arr,
  performers = TRUE,
  composers = FALSE,
  style = 'html'
) => {
  let members_str = ''
  let members = []
  this.get_track_members_json(track_ids_arr, performers, composers, members)
  members.forEach(member => {
    primary = member['primary'] == 1 ? ' - Primary' : ''
    url =
      'index.php?act=member_view&ids=' + member['member_id'] + ';&membersnum=1'

    if (style == 'html') {
      members_str += '<a href="url"><b>' + member['member_name'] + '</b></a>'
      members_str += ' (' + member['role_name'] + ')'
      members_str += primary + ', '
    } else if (style == 'hint') {
      members_str += member['member_name']
      members_str += ' (' + member['role_name'] + ')'
      members_str += primary + '\n'
    }
  })
  members_str = members_str.substring(0, members_str.length - 2)
  return members_str
}

exports.get_track_members_json = async (
  track_ids_arr,
  performers = TRUE,
  composers = FALSE,
  output_arr = []
) => {
  let result = []
  let object_found = false

  let total_ids = track_ids_arr.length
  let temp_arr = []
  let counter = 0

  //collect all data in temporary array
  for (let i = 0; i < total_ids; i++) {
    temp_arr[i] = {}
    temp_arr[i]['track_id'] = track_ids_arr[i]
    let arr = cug_get_track_members(track_ids_arr[i])

    if (arr.length) {
      if (performers == TRUE && composers == FALSE) {
        index = 0
        for (let j = 0; j < arr.length; j++) {
          if (arr[j]['role_id'] != 13 && arr[j]['role_id'] != 33) {
            //COMPOSER && LYRICIST
            temp_arr[i]['member'][index]['member_id'] = arr[j]['member_id']
            temp_arr[i]['member'][index]['member_name'] =
              cug_get_member_name_or_alias(
                arr[j]['title'],
                arr[j]['alias'],
                arr[j]['used_name']
              )
            temp_arr[i]['member'][index]['role_id'] = arr[j]['role_id']
            temp_arr[i]['member'][index]['role_name'] = arr[j]['role_title']
            temp_arr[i]['member'][index]['isprimary'] = arr[j]['isprimary']
            index++
          }
        }
      } else if (performers == FALSE && composers == TRUE) {
        index = 0
        for (let j = 0; j < arr.length; j++) {
          if (arr[j]['role_id'] == 13 || arr[j]['role_id'] == 33) {
            //COMPOSER && LYRICIST
            temp_arr[i]['member'][index]['member_id'] = arr[j]['member_id']
            temp_arr[i]['member'][index]['member_name'] =
              cug_get_member_name_or_alias(
                arr[j]['title'],
                arr[j]['alias'],
                arr[j]['used_name']
              )
            temp_arr[i]['member'][index]['role_id'] = arr[j]['role_id']
            temp_arr[i]['member'][index]['role_name'] = arr[j]['role_title']
            temp_arr[i]['member'][index]['isprimary'] = arr[j]['isprimary']
            index++
          }
        }
      } else {
        for (j = 0; j < arr.length; j++) {
          temp_arr[i]['member'][j]['member_id'] = arr[j]['member_id']
          temp_arr[i]['member'][j]['member_name'] =
            cug_get_member_name_or_alias(
              arr[j]['title'],
              arr[j]['alias'],
              arr[j]['used_name']
            )
          temp_arr[i]['member'][j]['role_id'] = arr[j]['role_id']
          temp_arr[i]['member'][j]['role_name'] = arr[j]['role_title']
          temp_arr[i]['member'][j]['isprimary'] = arr[j]['isprimary']
        }
      }
    } else if (total_ids > 1) {
      //if tracks has not any member
      temp_arr[i]['member'][0]['member_id'] = 0
      temp_arr[i]['member'][0]['member_name'] = ''
      temp_arr[i]['member'][0]['role_id'] = 0
      temp_arr[i]['member'][0]['role_name'] = ''
      temp_arr[i]['member'][0]['isprimary'] = 0
    }
  }
  //-------------------------------
  //-------------------------------
  if (total_ids == 1) {
    //single track selection
    if (temp_arr[0]['member']) {
      for (i = 0; i < temp_arr[0]['member'].length; i++) {
        member_id = temp_arr[0]['member'][i]['member_id']
        member_name = temp_arr[0]['member'][i]['member_name']
        role_id = temp_arr[0]['member'][i]['role_id']
        role_name = temp_arr[0]['member'][i]['role_name']
        is_primary = temp_arr[0]['member'][i]['isprimary']

        result.name = member_name
        result.mamber_id = member_id
        result.role = role_name
        result.isprimary = is_primary
        let obj = {
          member_id: member_id,
          member_name: member_name,
          role_id: role_id,
          role_name: role_name,
          primary: is_primary
        }
        output_arr.push(obj)

        object_found = true
      }
    }
  } else {
    //multitrack selection
    let same_object = false
    let arr_index = 0

    if (temp_arr.length && temp_arr[0]['member']) {
      for (let k = 0; k < temp_arr[0]['member'].length; k++) {
        for (let i = 1; i < temp_arr.length; i++) {
          for (let j = 0; j < temp_arr[i]['member'].length; j++) {
            if (
              temp_arr[0]['member'][k]['member_id'] ==
                temp_arr[i]['member'][j]['member_id'] &&
              temp_arr[0]['member'][k]['role_id'] ==
                temp_arr[i]['member'][j]['role_id']
            ) {
              same_object = true
              break
            }
          }

          if (!same_object) {
            break
          }
        }
        //------------
        if (same_object) {
          member_id = temp_arr[0]['member'][k]['member_id']
          member_name = temp_arr[0]['member'][k]['member_name']
          role_id = temp_arr[0]['member'][k]['role_id']
          role_name = temp_arr[0]['member'][k]['role_name']

          result.name = member_name
          result.member_id = member_id
          result.role = role_name

          // output_arr[arr_index]['member_id'] = member_id
          // output_arr[arr_index]['member_name'] = member_name
          // output_arr[arr_index]['role_id'] = role_id
          // output_arr[arr_index]['role_name'] = role_name

          let obj = {
            member_id: member_id,
            member_name: member_name,
            role_id: role_id,
            role_name: role_name
          }
          output_arr.push(obj)

          //calculate if 'isprimary' is same or not
          for (i = 1; i < temp_arr.length; i++) {
            same_primary = false

            for (j = 0; j < temp_arr[i]['member'].length; j++) {
              if (
                temp_arr[0]['member'][k]['isprimary'] ==
                  temp_arr[i]['member'][j]['isprimary'] &&
                temp_arr[0]['member'][k]['member_id'] ==
                  temp_arr[i]['member'][j]['member_id']
              ) {
                same_primary = true
                break
              }
            }

            if (!same_primary) {
              break
            }
          }

          //--------------------
          if (same_primary) {
            result.isprimary = temp_arr[0]['member'][k]['isprimary']
            output_arr[arr_index]['primary'] =
              temp_arr[0]['member'][k]['isprimary']
          } else {
            result.isprimary = false
            output_arr[arr_index]['primary'] = 0
          }
          //--------------------
          //--------------------
          arr_index++

          object_found = true
          same_object = false
        }
      }
    }
    //----------
  }
  return result
}

exports.cug_get_track_members = async (
  track_id,
  role_id = 0,
  unique_members = false
) => {
  // global mysqli, config.Tables;
  let result = []
  index = 0

  if (track_id) {
    unique = unique_members ? 1 : 0
    result = await rms_db.sequelize.query(
      `CALL get_track_members(${track_id}, ${role_id}, ${unique})`,
      { type: QueryTypes.SELECT }
    )
  }
  return result
}

exports.choose_all_members = (members_arr, sep = '\n') => {
  let members_str = ''

  for (let i = 0; i < members_arr.length; i++) {
    member_title = this.cug_get_member_name_or_alias(
      members_arr[i]['title'],
      members_arr[i]['alias'],
      members_arr[i]['used_name']
    )
    members_str += member_title + ' - ' + members_arr[i]['role_title']

    if (members_arr[i]['isprimary'] == 1) {
      members_str += ' (Primary)'
    }
    members_str += sep
  }

  return members_str
}

exports.cug_get_obj_file_info = async (
  obj_id,
  obj_type,
  subfolder,
  domain = '',
  obj_cat = '1'
) => {
  // global slash, F_LEVEL, F_DIGITS_NUM, IMG_EXT;
  result = {}
  let main_folder, main_folder_url, file_name_suffix, file_extention
  switch (obj_type.toUpperCase()) {
    //--------------
    case 'TRACK':
      main_folder = 'music' + config.slash.subfolder
      main_folder_url = 'music/' + subfolder
      file_name_suffix = ''
      file_extention = subfolder
      break

    //-------------
    case 'ALBUM':
      main_folder = 'img' + config.slash + 'album' + config.slash.subfolder
      main_folder_url = 'img/album/' + subfolder
      file_name_suffix = '_a_' + subfolder
      file_extention = config.IMG_EXT['album']
      break

    //-------------
    case 'DISC':
      main_folder = 'img' + config.slash + 'disc' + config.slash.subfolder
      main_folder_url = 'img/disc/' + subfolder
      file_name_suffix = '_d_' + subfolder
      file_extention = config.IMG_EXT['disc']
      break

    //-------------
    case 'MEMBER':
      main_folder = 'img' + config.slash + 'member' + config.slash.subfolder
      main_folder_url = 'img/member/' + subfolder
      file_name_suffix = '_m_' + subfolder
      file_extention = config.IMG_EXT['member']
      break

    //-------------
    case 'USER':
      main_folder = 'img' + config.slash + 'user' + config.slash.subfolder
      main_folder_url = 'img/user/' + subfolder
      file_name_suffix = '_u_' + subfolder
      file_extention = config.IMG_EXT['user']
      break

    //-------------
    case 'CLIENT':
      main_folder = 'img' + config.slash + 'client' + config.slash.subfolder
      main_folder_url = 'img/client/' + subfolder
      file_name_suffix = '_c_' + subfolder
      file_extention = config.IMG_EXT['client']
      break
    //-------------
    case 'EXTRALINK':
      main_folder =
        'img' +
        config.slash +
        'link' +
        config.slash +
        'extra' +
        config.slash.subfolder
      main_folder_url = 'img/link/extra/' + subfolder
      file_name_suffix = '_le_' + subfolder
      file_extention = config.IMG_EXT['extra_ink']
      break
    //-------------
    case 'CUBE':
      main_folder =
        'img' +
        config.slash +
        'link' +
        config.slash +
        'cube' +
        config.slash.subfolder
      main_folder_url = 'img/link/cube/' + subfolder
      file_name_suffix = '_lc_' + obj_cat + '_' + subfolder
      file_extention = config.IMG_EXT['cube_ink']
      break
    case 'TRUECUBE':
      main_folder =
        'img' +
        config.slash +
        'link' +
        config.slash +
        'truecube' +
        config.slash.subfolder
      main_folder_url = 'img/link/truecube/' + subfolder
      file_name_suffix = '_lc_' + obj_cat + '_' + subfolder
      file_extention = config.IMG_EXT['cube_ink']
      break
  }

  file_name = this.cug_get_obj_file_name(obj_id)
  file_path_p = this.cug_get_obj_file_path_l(file_name)
  file_path_u = this.cug_get_obj_file_path_u(file_name)

  result['filename'] = file_name.file_name_suffix
  result['basename'] = result['filename'] + '+' + file_extention
  result['dir_tree_l'] = main_folder + config.slash + file_path_p
  result['dir_tree_u'] = main_folder_url + '/' + file_path_u
  result['url'] =
    domain != ''
      ? domain +
        '/' +
        main_folder_url +
        '/' +
        file_path_u +
        '/' +
        result['basename']
      : ''

  return result
}

exports.cug_get_obj_file_name = obj_id => {
  // global $F_TOTAL_DIGITS;
  let zeros = ''
  for (let i = 0; i < config.F_TOTAL_DIGITS - obj_id.length; i++) {
    zeros += '0'
  }

  return zeros + obj_id
}

exports.cug_get_obj_file_path_l = file_name => {
  // global $slash, $F_LEVEL, $F_DIGITS_NUM;
  let path = ''

  for (let i = 0; i < config.F_LEVEL; i++) {
    chunk = file_name.substring(i * config.F_DIGITS_NUM, config.F_DIGITS_NUM)
    path += config.slash
  }

  //chunk = .substring(file_name, F_LEVEL*F_DIGITS_NUM, F_DIGITS_NUM);
  //path .= chunk;
  path = path.substring(0, path.length - config.slash.length)

  return path
}

exports.cug_get_obj_file_path_u = file_name => {
  // global $F_LEVEL, $F_DIGITS_NUM;
  let path = ''

  for (let i = 0; i < config.F_LEVEL; i++) {
    chunk = file_name.substring(i * config.F_DIGITS_NUM, config.F_DIGITS_NUM)
    path += config.chunk + '/'
  }

  path = path.substring(0, path.length - 1)

  return path
}

exports.cug_get_url_protocol = req => {
  let protocol = req.protocol.indexOf('https') === true ? 'https' : 'http'
  return protocol
}

exports.createTrack = async postData => {
  let result = []
  let track_ids = postData['track_ids'] ? postData['track_ids'] : ''
  let track_ids_arr = track_ids.split(';')
  let REG_NEW_TRACK
  /*
      albums_arr = json_decode(postData['albums'], true);
      print_r(albums_arr);
      return result;
     */

  if (track_ids_arr.length == 0 || track_ids_arr[0] == null) {
    REG_NEW_TRACK = true
    tracks_num = 0
  } else {
    track_ids_arr.pop() //remove last (null == ) element
    tracks_num = track_ids_arr.length

    REG_NEW_TRACK = false
  }

  if (!REG_NEW_TRACK) {
    log_ids = postData['log_ids'] ? postData['log_ids'] : ''
    log_ids_arr = log_ids.split(';')
    log_ids_arr.pop() //remove last (null == ) element
  } else {
    //arr = cug_get_user_clients(_SESSION['user_id']);
    //register_from = (arr[0].id) ? arr[0].id : 0;
    register_from = _SESSION['client_id'] ? _SESSION['client_id'] : 0
  }

  //prepare new Track object
  let track_obj = {}
  track_obj.title = postData['track_title']
    ? postData['track_title'].trim()
    : ''
  track_obj.part = postData['track_part'] ? postData['track_part'].trim() : ''
  track_obj.type = postData['track_type'] ? postData['track_type'].trim() : ''
  track_obj.instrumental = postData['instrumental']
    ? postData['instrumental'].trim()
    : 0
  track_obj.isrc = postData['ta_isrc'] ? postData['ta_isrc'].trim() : ''
  track_obj.genre_id =
    postData['genre_id'] && postData['genre_id'] > 0 ? postData['genre_id'] : 0
  track_obj.fileunder_id =
    postData['fileunder_id'] && postData['fileunder_id'] > 0
      ? postData['fileunder_id']
      : 0
  track_obj.title_lang_id =
    postData['title_lang_id'] && postData['title_lang_id'] > 0
      ? postData['title_lang_id']
      : 0
  track_obj.lyrics_lang_id =
    postData['lyrics_lang_id'] && postData['lyrics_lang_id'] > 0
      ? postData['lyrics_lang_id']
      : 0
  // echo(track_obj.title_lang_id);
  // echo(track_obj.lang_id);
  // die;
  track_obj.publishers = postData['publishers']
    ? postData['publishers'].trim()
    : ''
  track_obj.price_code = postData['price_code']
    ? postData['price_code'].trim()
    : ''
  track_obj.explicit_content = postData['explicit_content']
    ? postData['explicit_content'].trim()
    : 0
  track_obj.circle_p =
    postData['circle_p'] && postData['circle_p'] >= 0
      ? postData['circle_p'].trim()
      : ''
  track_obj.publication_date = postData['publication_date']
    ? postData['publication_date'].trim()
    : ''
  track_obj.catalogue =
    postData['catalogue'] && postData['catalogue'] >= 0
      ? postData['catalogue'].trim()
      : ''
  track_obj.start_of_preview =
    postData['start_of_preview'] && postData['start_of_preview'] >= 0
      ? postData['start_of_preview'].trim()
      : ''
  track_obj.release_date =
    postData['release_date'] && postData['release_date'] >= 0
      ? postData['release_date'].trim()
      : ''
  track_obj.distribution_territories =
    postData['distribution_territories'] &&
    postData['distribution_territories'] >= 0
      ? postData['distribution_territories'].trim()
      : ''
  track_obj.lyrics =
    postData['lyrics'] && postData['lyrics'] >= 0
      ? postData['lyrics'].trim()
      : ''

  track_obj.rec_country_id =
    postData['rec_country_id'] && postData['rec_country_id'] > 0
      ? postData['rec_country_id']
      : 0
  track_obj.rec_city = postData['rec_city'] ? postData['rec_city'].trim() : ''
  track_obj.rec_date = postData['rec_date'] ? postData['rec_date'].trim() : ''
  //    track_obj.tag_status_id = 2; //Checked
  track_obj.has_file = postData['has_file'] ? postData['has_file'].trim() : 0
  //    track_obj.comments = ((postData['track_comment'])) ? .trim()(postData['track_comment']) : "";

  track_obj.external_id = postData['external_id']
    ? postData['external_id'].trim()
    : ''
  track_obj.tag_status_id = !REG_NEW_TRACK
    ? 2 /* Checked */
    : 1 /* Not Checked */
  track_obj.register_date = !REG_NEW_TRACK
    ? ''
    : moment().format('YYYY-MM-DD HH:mm:ss')
  track_obj.register_ip = !REG_NEW_TRACK ? '' : _SERVER['REMOTE_ADDR']
  track_obj.register_from = !REG_NEW_TRACK ? '' : register_from

  track_time = this.cug_time_to_mseconds(
    postData['track_time'] ? postData['track_time'].trim() : ''
  )
  file_id = postData['file_id'] ? postData['file_id'] : 0

  if (tracks_num == 1) {
    //single track
    track_id = track_ids_arr[0]

    if (!this.cug_edit_track([track_id], track_obj, true)) {
      result['status_code'] = -1
      result['status_msg'] = "Error: Can't update Tracks table"
      return result
    }
  } else if (tracks_num > 1) {
    //multiply tracks
    if (!this.cug_edit_track(track_ids_arr, track_obj, false)) {
      result['status_code'] = -1
      result['status_msg'] = "Error: Can't update Tracks table"
      return result
    }
  } else if (REG_NEW_TRACK) {
    track_id = this.cug_reg_track(track_obj)

    if (!track_id) {
      result['status_code'] = -1
      result['status_msg'] = "Error: Can't Register Track"
      return result
    }

    track_ids_arr = { 0: track_id }

    //add new composition
    comp_obj = {}
    comp_obj.title = postData['track_title']
      ? postData['track_title'].trim()
      : ''
    comp_obj.part = postData['track_part'] ? postData['track_part'].trim() : ''

    comp_id = this.cug_reg_composition(comp_obj)
    if (comp_id > 0) {
      this.cug_reg_track_composition_rel(track_id, comp_id)
    }
  }

  //Members
  if (postData['update_performers'] && postData['update_performers'] == '1') {
    members_arr = postData['members']
    if (!this.update_track_members(track_ids_arr, members_arr)) {
      result['status_code'] = -1
      result['status_msg'] = "Error: Can't update Members"
      return result
    }
  }

  if (!REG_NEW_TRACK) {
    //track time
    if (track_time > 0) {
      if (!file_id) {
        //register new file
        let f_obj = {}
        f_obj.f_track_type_id = 1
        f_obj.f_track_time = track_time
        f_obj.f_fp_status = 0
        f_obj.f_wm_status = 0
        f_obj.f_format_id = 2
        f_obj.f_register_from = register_from
        f_obj.f_register_date = moment().format('YYYY-MM-DD HH:mm:ss')
        f_obj.f_register_ip = _SERVER['REMOTE_ADDR']

        file_id = this.cug_reg_track_file_rel(f_obj)

        //register track-file rel
        if (file_id > 0) {
          this.cug_reg_track_file_rel(track_id, file_id)
        }
      } else {
        this.cug_edit_track_time(file_id, track_time)
      }
    }

    //Update Relations
    //-----------------------
    //Album
    if (postData['update_albums'] && postData['update_albums'] == '1') {
      albums_arr = json_decode(postData['albums'], true)

      if (!this.update_track_albums(track_ids_arr[0], albums_arr, file_id)) {
        result['status_code'] = -1
        result['status_msg'] = "Error: Can't update Albums"
        return result
      }
    }
    //Composition
    if (
      postData['update_compositions'] &&
      postData['update_compositions'] == '1'
    ) {
      compositions_arr = json_decode(postData['compositions'], true)
      if (!this.update_track_compositions(track_ids_arr, compositions_arr)) {
        result['status_code'] = -1
        result['status_msg'] = "Error: Can't update Compositions"
        return result
      }
    }
    //Publisher
    if (postData['update_publishers'] && postData['update_publishers'] == '1') {
      publishers_arr = json_decode(postData['publishers'], true)
      if (!update_track_publishers(track_ids_arr, publishers_arr)) {
        result['status_code'] = -1
        result['status_msg'] = "Error: Can't update Publishers"
        return result
      }
    }
    //Clients
    if (postData['update_clients'] && postData['update_clients'] == '1') {
      clients_arr = json_decode(postData['clients'], true)
      if (!update_track_clients(track_ids_arr, clients_arr)) {
        result['status_code'] = -1
        result['status_msg'] = "Error: Can't update Clients"
        return result
      }
    }

    //update logs
    log_ids_arr.forEach(log_id => {
      log_obj = {}
      log_obj.subaction_id = 7 //Change
      log_obj.end_time = moment().format('YYYY-MM-DD HH:mm:ss')

      cug_edit_log_te(log_id, log_obj)
    })
    track_ids_arr.forEach(track_id => {
      //update 'cache_tracks' table
      cug_cache_del_track(track_id)
      cug_cache_add_track(track_id)

      //update 'cache_albums' table
      albums = cug_get_track_albums(track_id)
      albums.forEach(album => {
        cug_cache_del_album(album['album_id'])
        cug_cache_add_album(album['album_id'])
      })

      //update 'cache_members' table
      members = cug_get_track_members(track_id)
      members.forEach(member => {
        cug_cache_del_member(member['member_id'])
        cug_cache_add_member(member['member_id'])
      })
    })
    //----------------------
  } else {
    //register log
    curr_time = moment().format('YYYY-MM-DD HH:mm:ss')
    log_objects_te(
      (action_id = 8),
      (object_id = 1),
      track_ids_arr,
      (start_time = curr_time),
      (end_time = curr_time),
      (subobject_id = 0),
      (subaction_id = 7),
      (subitem_id = 0)
    )
    log_objects_te(
      (action_id = 2),
      (object_id = 1),
      track_ids_arr,
      (start_time = curr_time),
      (end_time = curr_time),
      (subobject_id = 0),
      (subaction_id = 7),
      (subitem_id = 0)
    )
  }
  result['status_code'] = 1
  result['status_msg'] = 'OK'
  result['registered_track_id'] = REG_NEW_TRACK ? track_ids_arr[0] : 0
  return result
}

exports.cug_time_to_mseconds = time_str => {
  let result = 0
  let arr = time_str.split(':')
  if (arr.length == 3) {
    if (Number(arr[0]) <= 59 && Number(arr[1]) <= 59 && Number(arr[1]) <= 59) {
      result =
        moment(time_str, 'HH:mm:ss').milliseconds() - moment().milliseconds()
      if (result > 0) {
        result = result * 1000
      }
    }
  }

  return result
}

exports.cug_edit_track = async (
  track_ids_arr,
  obj,
  update_empty_fields = false
) => {
  // global mysqli, config.Tables;
  let fields = ''
  let where = ''

  if (track_ids_arr.length > 0 && track_ids_arr[0]) {
    if (obj.title) fields += "title='" + escape_str(obj.title) + "',"

    if (obj.part) {
      if (update_empty_fields && null == obj.part) fields += "part='',"
      else if (obj.part) fields += "part='" + escape_str(obj.part) + "',"
    }

    if (obj.version) {
      if (update_empty_fields && null == obj.version) fields += "version='',"
      else if (obj.version)
        fields += "version='" + escape_str(obj.version) + "',"
    }
    //------------------------

    if (obj.arrangement_id) {
      if (update_empty_fields && null == obj.arrangement_id)
        fields += 'arrangement_id=0,'
      else if (obj.arrangement_id != null && obj.arrangement_id >= 0)
        fields += 'arrangement_id=' + escape_str(obj.arrangement_id) + ','
    }
    //------------------------

    if (obj.lyrics_lang_id) {
      if (update_empty_fields && null == obj.lyrics_lang_id)
        fields += 'lang_id=0,'
      else if (obj.lyrics_lang_id != null && obj.lyrics_lang_id >= 0)
        fields += 'lang_id=' + escape_str(obj.lyrics_lang_id) + ','
    }

    //------------------------

    if (obj.title_lang_id) {
      if (update_empty_fields && null == obj.title_lang_id)
        fields += 'title_lang_id=0,'
      else if (obj.title_lang_id != null && obj.title_lang_id >= 0)
        fields += 'title_lang_id=' + escape_str(obj.title_lang_id) + ','
    }

    //------------------------

    if (obj.genre_id) {
      if (update_empty_fields && null == obj.genre_id) fields += 'genre_id=0,'
      else if (obj.genre_id != null && obj.genre_id >= 0)
        fields += 'genre_id=' + escape_str(obj.genre_id) + ','
    }
    //------------------------

    if (obj.fileunder_id) {
      if (update_empty_fields && null == obj.fileunder_id)
        fields += 'fileunder_id=0,'
      else if (obj.fileunder_id != null && obj.fileunder_id >= 0)
        fields += 'fileunder_id=' + escape_str(obj.fileunder_id) + ','
    }
    //------------------------

    if (obj.genre_from_file) {
      if (update_empty_fields && null == obj.genre_from_file)
        fields += "genre_from_file='',"
      else if (obj.genre_from_file)
        fields += "genre_from_file='" + escape_str(obj.genre_from_file) + "',"
    }
    //------------------------

    if (obj.has_file) {
      if (update_empty_fields && null == obj.has_file) fields += 'has_file=0,'
      else if (obj.has_file != null && obj.has_file >= 0)
        fields += 'has_file=' + escape_str(obj.has_file) + ','
    }
    //------------------------

    if (obj.lineup) {
      if (update_empty_fields && null == obj.lineup) fields += "lineup='',"
      else if (obj.lineup) fields += "lineup='" + escape_str(obj.lineup) + "',"
    }
    //------------------------

    if (obj.characters) {
      if (update_empty_fields && null == obj.characters)
        fields += "characters='',"
      else if (obj.characters)
        fields += "characters='" + escape_str(obj.characters) + "',"
    }
    //------------------------

    if (obj.from_movie) {
      if (update_empty_fields && null == obj.from_movie)
        fields += "from_movie='',"
      else if (obj.from_movie)
        fields += "from_movie='" + escape_str(obj.from_movie) + "',"
    }
    //------------------------

    if (obj.score_url) {
      if (update_empty_fields && null == obj.score_url)
        fields += "score_url='',"
      else if (obj.score_url)
        fields += "score_url='" + escape_str(obj.score_url) + "',"
    }
    //------------------------

    if (obj.colour_id) {
      if (update_empty_fields && null == obj.colour_id) fields += 'colour_id=0,'
      else if (obj.colour_id != null && obj.colour_id >= 0)
        fields += 'colour_id=' + escape_str(obj.colour_id) + ','
    }
    //------------------------

    if (obj.rec_country_id) {
      if (update_empty_fields && null == obj.rec_country_id)
        fields += 'rec_country_id=0,'
      else if (obj.rec_country_id != null && obj.rec_country_id >= 0)
        fields += 'rec_country_id=' + escape_str(obj.rec_country_id) + ','
    }
    //------------------------

    if (obj.rec_city) {
      if (update_empty_fields && null == obj.rec_city) fields += "rec_city='',"
      else if (obj.rec_city)
        fields += "rec_city='" + escape_str(obj.rec_city) + "',"
    }
    //------------------------

    if (obj.rec_date) {
      if (update_empty_fields && null == obj.rec_date)
        fields += 'rec_date=null,'
      else if (obj.rec_date)
        fields += "rec_date='" + escape_str(obj.rec_date) + "',"
    }
    //------------------------

    if (obj.rec_company_id) {
      if (update_empty_fields && null == obj.rec_company_id)
        fields += 'rec_company_id=0,'
      else if (obj.rec_company_id != null && obj.rec_company_id >= 0)
        fields += 'rec_company_id=' + escape_str(obj.rec_company_id) + ','
    }
    //------------------------

    if (obj.copyright_c) {
      if (update_empty_fields && null == obj.copyright_c)
        fields += 'copyright_c=0,'
      else if (obj.copyright_c)
        fields += 'copyright_c=' + escape_str(obj.copyright_c) + ','
    }

    if (obj.copyright_p) {
      if (update_empty_fields && null == obj.copyright_p)
        fields += 'copyright_p=0,'
      else if (obj.copyright_p)
        fields += 'copyright_p=' + escape_str(obj.copyright_p) + ','
    }
    if (obj.comments) {
      if (update_empty_fields && null == obj.comments) fields += "comments='',"
      else if (obj.comments)
        fields += "comments='" + escape_str(obj.comments) + "',"
    }
    //------------------------

    if (obj.tag_status_id)
      fields += 'tag_status_id=' + escape_str(obj.tag_status_id) + ','
    if (obj.register_from)
      fields += 'register_from=' + escape_str(obj.register_from) + ','
    if (obj.online) fields += 'online=' + escape_str(obj.online) + ','

    if (obj.trash_status != null && obj.trash_status >= 0)
      fields += 'trash_status=' + escape_str(obj.trash_status) + ','

    if (obj.explicit_content) {
      if (update_empty_fields && null == obj.explicit_content)
        fields += 'explicit_content=null,'
      else if (obj.explicit_content)
        fields += 'explicit_content=' + escape_str(obj.explicit_content) + ','
    }
    //------------------------

    if (obj.unconfirmed) {
      if (update_empty_fields && null == obj.unconfirmed)
        fields += 'unconfirmed=null,'
      else if (obj.unconfirmed)
        fields += 'unconfirmed=' + escape_str(obj.unconfirmed) + ','
    }
    //------------------------

    if (obj.prelistening_index != null && obj.prelistening_index >= 0)
      fields += 'prelistening_index=' + escape_str(obj.prelistening_index) + ','
    if (obj.prelistening_duration != null && obj.prelistening_duration >= 0)
      fields +=
        'prelistening_duration=' + escape_str(obj.prelistening_duration) + ','
    //------------------------

    if (obj.external_id)
      fields += "external_id='" + escape_str(obj.external_id) + "',"
    if (obj.shenzhen_id)
      fields += 'shenzhen_id=' + escape_str(obj.shenzhen_id) + ','

    if (obj.isrc != null && obj.isrc >= 0) {
      fields += "ISRC='" + escape_str(obj.isrc) + "',"
    }

    if (obj.price_code != null) {
      fields += "PriceCode='" + escape_str(obj.price_code) + "',"
    }

    if (fields.length > 0) {
      fields = fields.substring(0, fields.length - 1)

      for (let i = 0; i < track_ids_arr.length; i++) {
        if (track_ids_arr[i] > 0) {
          where += 'id=' + track_ids_arr[i] + ' OR '
        }
      }

      if (where.length > 0) {
        where = where.substring(0, where.length - 3)
        query =
          'UPDATE ' + config.Tables['track'] + ' SET ' + fields + ' WHERE where'
        if (await rms_db.sequelize.query(query)) {
          return TRUE
        } else {
          return FALSE
        }
      } else {
        return FALSE
      }
    } else return FALSE
  } else return FALSE
}

exports.cug_reg_track = async obj => {
  // global mysqli, config.Tables;
  let fields = ''
  let values = ''

  if (obj.title) {
    fields = ' (title,'
    values = " VALUES('" + escape_str(obj.title) + "',"

    if (obj.part) {
      fields += 'part,'
      values += "'" + escape_str(obj.part) + "',"
    }

    if (obj.type) {
      fields += 'track_type,'
      values += "'" + escape_str(obj.type) + "',"
    }

    if (obj.instrumental !== '') {
      fields += 'instrumental,'
      values += escape_str(obj.instrumental) + ','
    }

    if (obj.isrc) {
      fields += 'isrc,'
      values += "'" + escape_str(obj.isrc) + "',"
    }

    if (obj.genre_id) {
      fields += 'genre_id,'
      values += escape_str(obj.genre_id) + ','
    }

    if (obj.fileunder_id) {
      fields += 'fileunder_id,'
      values += escape_str(obj.fileunder_id) + ','
    }

    if (obj.title_lang_id) {
      fields += 'title_lang_id,'
      values += escape_str(obj.title_lang_id) + ','
    }

    if (obj.lyrics_lang_id) {
      fields += 'lang_id,'
      values += escape_str(obj.lyrics_lang_id) + ','
    }

    if (obj.publishers) {
      fields += 'publisher_id,'
      values += "'" + escape_str(obj.publishers) + "',"
    }

    if (obj.price_code) {
      fields += 'price_code_id,'
      values += "'" + escape_str(obj.price_code) + "',"
    }

    if (obj.circle_p) {
      fields += 'circle_p,'
      values += "'" + escape_str(obj.circle_p) + "',"
    }

    if (obj.publication_date) {
      fields += 'publication_date,'
      values += "'" + escape_str(obj.publication_date) + "',"
    }

    if (obj.catalogue) {
      fields += 'catalogue_num,'
      values += "'" + escape_str(obj.catalogue) + "',"
    }

    if (obj.release_date) {
      fields += 'release_date,'
      values += "'" + escape_str(obj.release_date) + "',"
    }

    if (obj.distribution_territories) {
      fields += 'distribution,'
      values += "'" + escape_str(obj.distribution_territories) + "',"
    }

    if (obj.lyrics) {
      fields += 'lyrics,'
      values += "'" + escape_str(obj.lyrics) + "',"
    }

    if (obj.version) {
      fields += 'version,'
      values += "'" + escape_str(obj.version) + "',"
    }

    if (obj.arrangement_id) {
      fields += 'arrangement_id,'
      values += escape_str(obj.arrangement_id) + ','
    }

    if (obj.genre_from_file) {
      fields += 'genre_from_file,'
      values += "'" + escape_str(obj.genre_from_file) + "',"
    }

    if (obj.tag_status_id >= 0) {
      fields += 'tag_status_id,'
      values += escape_str(obj.tag_status_id) + ','
    }

    if (obj.has_file >= 0) {
      fields += 'has_file,'
      values += escape_str(obj.has_file) + ','
    }

    if (obj.lineup) {
      fields += 'lineup,'
      values += "'" + escape_str(obj.lineup) + "',"
    }

    if (obj.characters) {
      fields += 'characters,'
      values += "'" + escape_str(obj.characters) + "',"
    }

    if (obj.from_movie) {
      fields += 'from_movie,'
      values += "'" + escape_str(obj.from_movie) + "',"
    }

    if (obj.score_url) {
      fields += 'score_url,'
      values += "'" + escape_str(obj.score_url) + "',"
    }
    if (obj.colour_id) {
      fields += 'colour_id,'
      values += escape_str(obj.colour_id) + ','
    }

    if (obj.rec_country_id) {
      fields += 'rec_country_id,'
      values += escape_str(obj.rec_country_id) + ','
    }

    if (obj.rec_city) {
      fields += 'rec_city,'
      values += "'" + escape_str(obj.rec_city) + "',"
    }

    if (obj.rec_date) {
      fields += 'rec_date,'
      values += "'" + escape_str(obj.rec_date) + "',"
    }

    if (obj.rec_company_id) {
      fields += 'rec_company_id,'
      values += escape_str(obj.rec_company_id) + ','
    }

    if (obj.copyright_c) {
      fields += 'copyright_c,'
      values += "'" + escape_str(obj.copyright_c) + "',"
    }

    if (obj.copyright_c_year) {
      fields += 'copyright_c_date,'
      values += "'" + escape_str(obj.copyright_c_year) + "',"
    }

    if (obj.register_from) {
      fields += 'register_from,'
      values += escape_str(obj.register_from) + ','
    }

    if (obj.register_date) {
      fields += 'register_date,'
      values += "'" + escape_str(obj.register_date) + "',"
    }

    if (obj.register_ip) {
      fields += 'register_ip,'
      values += "'" + escape_str(obj.register_ip) + "',"
    }

    if (obj.trash_status != null && obj.trash_status >= 0) {
      fields += 'trash_status,'
      values += obj.trash_status + ','
    }

    if (obj.online != null && obj.online >= 0) {
      fields += 'online,'
      values += obj.online + ','
    }

    if (obj.comments) {
      fields += 'comments,'
      values += "'" + escape_str(obj.comments) + "',"
    }

    if (obj.update_time) {
      fields += 'update_time,'
      values += "'" + escape_str(obj.update_time) + "',"
    }

    if (obj.explicit_content !== '') {
      fields += 'explicit_content,'
      values += escape_str(obj.explicit_content) + ','
    }

    if (obj.start_of_preview) {
      fields += 'prelistening_index,'
      values += "'" + escape_str(obj.start_of_preview) + "',"
    }

    if (obj.prelistening_duration) {
      fields += 'prelistening_duration,'
      values += escape_str(obj.prelistening_duration) + ','
    }

    if (obj.external_id) {
      fields += 'external_id,'
      values += "'" + escape_str(obj.external_id) + "',"
    }

    if (obj.shenzhen_id) {
      fields += 'shenzhen_id,'
      values += escape_str(obj.shenzhen_id) + ','
    }

    if (obj.unconfirmed) {
      fields += 'unconfirmed,'
      values += escape_str(obj.unconfirmed) + ','
    }
    if (obj.mood) {
      fields += 'mood_id,'
      values += "'" + escape_str(obj.mood) + "',"
    }

    if (obj.price_code) {
      fields += 'PriceCode,'
      values += "'" + escape_str(obj.price_code) + "',"
    }
    fields += 'uniqid)'
    if (obj.uniqid) {
      values += "'" + escape_str(obj.uniqid) + "')"
    } else {
      uniqid = uniqid()
      values += "'" + uniqid + "')"
    }

    query = 'INSERT INTO ' + config.Tables['track'] + fields + values
    //print_r(query);
    //die;
    let res = await rms_db.sequelize.query(query)

    if (res) {
      return res.id
    } else {
      return -1
    }
  } else {
    return 0
  }
}

exports.cug_reg_composition = async obj => {
  // global mysqli, config.Tables;
  let fields = ''
  let values = ''

  if (obj.title) {
    fields = ' (title,'
    values = " VALUES('" + escape_str(obj.title) + "',"

    if (obj.part) {
      fields += 'part,'
      values += "'" + escape_str(obj.part) + "',"
    }

    if (obj.genre_id) {
      fields += 'genre_id,'
      values += escape_str(obj.genre_id) + ','
    }

    if (obj.music_period_id) {
      fields += 'music_period_id,'
      values += escape_str(obj.music_period_id) + ','
    }

    if (obj.music_date) {
      fields += 'music_date,'
      values += "'" + escape_str(obj.music_date) + "',"
    }

    if (obj.tempo_id) {
      fields += 'tempo_id,'
      values += escape_str(obj.tempo_id) + ','
    }

    if (obj.music_score_url) {
      fields += 'music_score_url,'
      values += "'" + escape_str(obj.music_score_url) + "',"
    }

    if (obj.iswc) {
      fields += 'iswc,'
      values += "'" + escape_str(obj.iswc) + "',"
    }

    if (obj.publisher_id) {
      fields += 'publisher_id,'
      values += escape_str(obj.publisher_id) + ','
    }

    if (obj.update_time) {
      fields += 'update_time,'
      values += "'" + escape_str(obj.update_time) + "',"
    }

    fields += 'uniqid)'
    if (obj.uniqid) {
      values += "'" + escape_str(obj.uniqid) + "')"
    } else {
      uniqid = uniqid()
      values += "'" + uniqid + "')"
    }

    query = 'INSERT INTO ' + config.Tables['composition'] + fields + values
    let sqlRes = await rms_db.sequelize.query(query)
    if (sqlRes) {
      return sqlRes.id
    } else {
      return -1
    }
  } else {
    return 0
  }
}

exports.cug_reg_track_composition_rel = async (
  track_id,
  comp_id,
  uniqid = ''
) => {
  // global mysqli, config.Tables;

  if (track_id > 0 && comp_id > 0) {
    // Check for existing record
    let r = await rms_db.sequelize.query(
      'SELECT id FROM ' +
        config.Tables['track_composition_rel'] +
        ' WHERE track_id=track_id AND comp_id=comp_id'
    )

    if (!r.num_rows) {
      let uniq_id
      if (!uniqid) uniq_id = getUniqid()
      else uniq_id = escape_str(uniqid)

      query =
        'INSERT INTO ' +
        config.Tables['track_composition_rel'] +
        " VALUES(NULL, track_id, comp_id, 'uniq_id', NULL)"
      let sqlRes = await rms_db.sequelize.query(query)
      if (sqlRes) return sqlRes.id
      else return -1
    } else {
      arr = r[0]
      return arr['id']
    }
  } else return 0
}

function getUniqid () {
  var n = Math.floor(Math.random() * 11)
  var k = Math.floor(Math.random() * 1000000)
  var m = String.fromCharCode(n) + k
  return m
}

exports.update_track_members = async (track_ids, members) => {
  // global IMG_FILE_SERVER;

  if (track_ids.length == 1) {
    //single track
    let track_id = track_ids[0]

    if (track_id > 0) {
      if (this.cug_del_track_member_rel([track_id], [], true)) {
        members.forEach(arr => {
          if (!arr['member_id'] && arr['member_title']) {
            //new Member
            //check for existing Member
            member_obj = this.cug_get_member(arr['member_title'], 'TITLE')
            if (member_obj.id && member_obj.id > 0) member_id = member_obj.id
            else member_id = 0
            //--------------------------------

            if (member_id == 0) {
              //register new Member
              obj = {}
              obj.title = trim(arr['member_title'])
              obj.img_path = config.IMG_FILE_SERVER
              obj.register_date = moment().format('YYYY-MM-DD HH:mm:ss')
              obj.register_ip = _SERVER['REMOTE_ADDR']
                ? _SERVER['REMOTE_ADDR']
                : ''
              obj.used_name = 1 //title
              obj.register_from = _SESSION['client_id']
                ? _SESSION['client_id']
                : 0
              obj.online = 1

              member_id = this.cug_reg_member(obj)
            }

            if (member_id > 0) {
              cug_reg_track_member_rel(
                track_id,
                member_id,
                arr['role_id'],
                arr['primary']
              )
            }
          } else {
            //existing Member
            this.cug_reg_track_member_rel(
              track_id,
              arr['member_id'],
              arr['role_id'],
              arr['primary']
            )
          }
        }) //end of foreach()
      } else {
        return false
      }
    }
  } else if (track_ids.length > 1) {
    //multiply tracks
    //calculate same members and roles
    same_members = []
    this.get_track_members_json(track_ids, TRUE, FALSE, same_members)

    //delete same relations
    if (same_members.length) {
      if (!this.cug_del_track_member_rel(track_ids, same_members)) {
        return false
      }
    }

    //add new relations
    if (members.length) {
      track_ids.forEach(track_id => {
        members.forEach(arr => {
          if (!arr['member_id'] && arr['member_title']) {
            //new Member
            //check for existing Member
            member_obj = this.cug_get_member(arr['member_title'], 'TITLE')
            if (member_obj.id && member_obj.id > 0) member_id = member_obj.id
            else member_id = 0
            //--------------------------------

            if (member_id == 0) {
              //register new Member
              let obj = {}
              obj.title = arr['member_title'].trim()
              obj.img_path = config.IMG_FILE_SERVER
              obj.register_date = moment().format('YYYY-MM-DD HH:mm:ss')
              obj.register_ip = _SERVER['REMOTE_ADDR']
                ? _SERVER['REMOTE_ADDR']
                : ''
              obj.used_name = 1 //title
              obj.register_from = _SESSION['client_id']
                ? _SESSION['client_id']
                : 0
              obj.online = 1

              member_id = this.cug_reg_member(obj)
            }

            if (member_id > 0) {
              this.cug_reg_track_member_rel(
                track_id,
                member_id,
                arr['role_id'],
                arr['primary']
              )
            }
          } else {
            //existing Member
            this.cug_reg_track_member_rel(
              track_id,
              arr['member_id'],
              arr['role_id'],
              arr['primary']
            )
          }
        }) //end of foreach()
      }) //end of foreach()
    }
  } else {
    return false
  }

  return true
}

exports.cug_del_track_member_rel = async (
  track_ids,
  members_roles = [],
  delete_all_roles = false
) => {
  // global mysqli, config.Tables;
  where_id = '('
  where_member = '('
  where_role = '('

  if (track_ids.length > 0) {
    //-------------
    track_ids.forEach(track_id => {
      where_id += track_id > 0 ? 'track_id=track_id OR ' : ''
    })
    //-------------
    if (members_roles.length) {
      members_roles.forEach(member_role => {
        where_member +=
          !empty(member_role['member_id']) && member_role['member_id'] > 0
            ? 'member_id=' + member_role['member_id'] + ' OR '
            : ''
        where_role +=
          !empty(member_role['role_id']) && member_role['role_id'] > 0
            ? 'role_id=' + member_role['role_id'] + ' OR '
            : ''
      })
    }
    //-------------

    if (where_id.length > 1) {
      where_id = where_id.substring(0, where_id.length - 3) + ')'

      if (where_member.length > 1) {
        where_member = where_member.substring(0, where_member.length - 3) + ')'
      } else {
        where_member = ''
      }
      //------------
      if (where_role.length > 1) {
        where_role = where_role.substring(0, where_role.length - 3) + ')'
      } else {
        where_role = ''
      }

      query =
        'DELETE FROM ' + config.Tables['track_member_rel'] + ' WHERE where_id'
      query += where_member.length ? ' AND where_member' : ''
      query += where_role.length ? ' AND where_role' : ''
      query += !delete_all_roles ? ' AND role_id<>13 AND role_id<>33' : ''

      if (mysqli.query(query)) {
        return true
      } else {
        return false
      }
    } else {
      return false
    }
  } else {
    return false
  }
}

exports.cug_get_member = async (item, item_type = 'ID') => {
  // global mysqli, config.Tables, FILE_SERVER_URL;

  if (!empty(item)) {
    if (item_type == 'ID') {
      query =
        'SELECT * FROM ' +
        config.Tables['member'] +
        ' WHERE id=' +
        escape_str(item)
    } else if (item_type == 'UNIQID') {
      query =
        'SELECT * FROM ' +
        config.Tables['member'] +
        " WHERE uniqid='" +
        escape_str(item) +
        "'"
    } else if (item_type == 'TITLE') {
      query =
        'SELECT * FROM ' +
        config.Tables['member'] +
        " WHERE title='" +
        escape_str(item) +
        "'"
    } else {
      return NULL
    }

    r = await rms_db.sequelize.query(query)
    if (r) {
      arr = r[0]
      if (arr) {
        let obj = {}

        obj.id = arr['id']
        obj.title = arr['title']
        obj.alias = arr['alias']
        obj.used_name = arr['used_name']
        obj.member_type_id = arr['member_type_id']
        obj.standard_role_id = arr['standard_role_id']
        obj.gender_id = arr['gender_id']
        obj.genre_id = arr['genre_id']
        obj.tag_status_id = arr['tag_status_id']
        obj.birth_date = arr['birth_date']
        obj.birth_country_id = arr['birth_country_id']
        obj.birth_place = arr['birth_place']
        obj.death_date = arr['death_date']
        obj.death_country_id = arr['death_country_id']
        obj.death_place = arr['death_place']
        obj.bio_url = arr['bio_url']
        obj.fan_url = arr['fan_url']
        obj.member_url = arr['member_url']
        obj.merch_url = arr['merch_url']
        obj.worktime_from = arr['worktime_from']
        obj.worktime_to = arr['worktime_to']
        obj.img_path = arr['img_path']
        obj.trash_status = arr['trash_status']
        obj.register_from = arr['register_from']
        obj.online = arr['online']
        obj.register_date = arr['register_date']
        obj.register_ip = arr['register_ip']
        obj.uniqid = arr['uniqid']
        obj.external_id = arr['external_id']
        obj.shenzhen_id = arr['shenzhen_id']
        obj.update_time = arr['update_time']

        img_path = !empty(obj.img_path) ? obj.img_path : FILE_SERVER_URL
        //img_path = !empty(obj.img_path) ? cug_get_url_protocol()."://".obj.img_path : FILE_SERVER_URL;

        obj.img_34 =
          img_path +
          '/?o=member&i=' +
          obj.id +
          '&s=34&mt=' +
          obj.member_type_id +
          '&mg=' +
          obj.gender_id
        obj.img_64 =
          img_path +
          '/?o=member&i=' +
          obj.id +
          '&s=64&mt=' +
          obj.member_type_id +
          '&mg=' +
          obj.gender_id
        obj.img_174 =
          img_path +
          '/?o=member&i=' +
          obj.id +
          '&s=174&mt=' +
          obj.member_type_id +
          '&mg=' +
          obj.gender_id
        obj.img_300 =
          img_path +
          '/?o=member&i=' +
          obj.id +
          '&s=300&mt=' +
          obj.member_type_id +
          '&mg=' +
          obj.gender_id
        obj.img_600 =
          img_path +
          '/?o=member&i=' +
          obj.id +
          '&s=600&mt=' +
          obj.member_type_id +
          '&mg=' +
          obj.gender_id
        obj.img_orgn =
          img_path +
          '/?o=member&i=' +
          obj.id +
          '&s=mega&mt=' +
          obj.member_type_id +
          '&mg=' +
          obj.gender_id

        obj.img_34_num = arr['img_34']
        obj.img_64_num = arr['img_64']
        obj.img_174_num = arr['img_174']
        obj.img_300_num = arr['img_300']
        obj.img_600_num = arr['img_600']
        obj.img_orgn_num = arr['img_orgn']

        return obj
      } else return NULL
    } else return NULL
  } else {
    return NULL
  }
}

exports.cug_reg_member = async obj => {
  // global mysqli, config.Tables;
  fields = ''
  values = ''

  if (obj.title) {
    fields = ' (title,'
    values = " VALUES('" + escape_str(obj.title) + "',"

    if (obj.alias) {
      fields += 'alias,'
      values += "'" + escape_str(obj.alias) + "',"
    }

    if (obj.used_name) {
      fields += 'used_name,'
      values += escape_str(obj.used_name) + ','
    }

    if (obj.member_type_id) {
      fields += 'member_type_id,'
      values += escape_str(obj.member_type_id) + ','
    }

    if (obj.standard_role_id) {
      fields += 'standard_role_id,'
      values += escape_str(obj.standard_role_id) + ','
    }

    if (obj.gender_id) {
      fields += 'gender_id,'
      values += escape_str(obj.gender_id) + ','
    }

    if (obj.birth_date) {
      fields += 'birth_date,'
      values += "'" + escape_str(obj.birth_date) + "',"
    }

    if (obj.birth_country_id) {
      fields += 'birth_country_id,'
      values += escape_str(obj.birth_country_id) + ','
    }

    if (obj.birth_place) {
      fields += 'birth_place,'
      values += "'" + escape_str(obj.birth_place) + "',"
    }

    if (obj.death_date) {
      fields += 'death_date,'
      values += "'" + escape_str(obj.death_date) + "',"
    }

    if (obj.death_country_id) {
      fields += 'death_country_id,'
      values += escape_str(obj.death_country_id) + ','
    }

    if (obj.death_place) {
      fields += 'death_place,'
      values += "'" + escape_str(obj.death_place) + "',"
    }

    if (obj.bio_url) {
      fields += 'bio_url,'
      values += "'" + escape_str(obj.bio_url) + "',"
    }

    if (obj.fan_url) {
      fields += 'fan_url,'
      values += "'" + escape_str(obj.fan_url) + "',"
    }

    if (obj.member_url) {
      fields += 'member_url,'
      values += "'" + escape_str(obj.member_url) + "',"
    }

    if (obj.merch_url) {
      fields += 'merch_url,'
      values += "'" + escape_str(obj.merch_url) + "',"
    }

    if (obj.worktime_from) {
      fields += 'worktime_from,'
      values += "'" + escape_str(obj.worktime_from) + "',"
    }

    if (obj.worktime_to) {
      fields += 'worktime_to,'
      values += "'" + escape_str(obj.worktime_to) + "',"
    }

    fields += 'tag_status_id,'
    if (obj.tag_status_id) {
      values += escape_str(obj.tag_status_id) + ','
    } else {
      values += '1,' // Unchecked
    }

    if (obj.img_path) {
      fields += 'img_path,'
      values += "'" + escape_str(obj.img_path) + "',"
    }

    if (obj.img_34 != null && obj.img_34 >= 0) {
      fields += 'img_34,'
      values += obj.img_34 + ','
    }

    if (obj.img_64 != null && obj.img_64 >= 0) {
      fields += 'img_64,'
      values += obj.img_64 + ','
    }

    if (obj.img_174 != null && obj.img_174 >= 0) {
      fields += 'img_174,'
      values += obj.img_174 + ','
    }

    if (obj.img_300 != null && obj.img_300 >= 0) {
      fields += 'img_300,'
      values += obj.img_300 + ','
    }

    if (obj.img_600 != null && obj.img_600 >= 0) {
      fields += 'img_600,'
      values += obj.img_600 + ','
    }

    if (obj.img_orgn != null && obj.img_orgn >= 0) {
      fields += 'img_orgn,'
      values += obj.img_orgn + ','
    }

    if (obj.trash_status != null && obj.trash_status >= 0) {
      fields += 'trash_status,'
      values += obj.trash_status + ','
    }

    if (obj.external_id) {
      fields += 'external_id,'
      values += "'" + escape_str(obj.external_id) + "',"
    }

    if (obj.shenzhen_id) {
      fields += 'shenzhen_id,'
      values += escape_str(obj.shenzhen_id) + ','
    }

    if (obj.register_from) {
      fields += 'register_from,'
      values += escape_str(obj.register_from) + ','
    }

    if (obj.online) {
      fields += 'online,'
      values += escape_str(obj.online) + ','
    }

    if (obj.register_date) {
      fields += 'register_date,'
      values += "'" + escape_str(obj.register_date) + "',"
    }

    if (obj.register_ip) {
      fields += 'register_ip,'
      values += "'" + escape_str(obj.register_ip) + "',"
    }

    if (obj.update_time) {
      fields += 'update_time,'
      values += "'" + escape_str(obj.update_time) + "',"
    }

    fields += 'uniqid)'
    if (obj.uniqid) {
      values += "'" + escape_str(obj.uniqid) + "')"
    } else {
      uniqid = getUniqid()
      values += "'" + uniqid + "')"
    }

    query = 'INSERT INTO ' + config.Tables['member'] + fields + values
    //echo PHP_EOL.query.PHP_EOL;
    let selRes = await rms_db.sequelize.query(query)
    if (selRes) {
      return selRes.id
    } else {
      return -1
    }
  } else {
    return 0
  }
}

exports.cug_reg_track_member_rel = async (
  track_id,
  member_id,
  role_id,
  isprimary,
  hidden = 0,
  uniqid = ''
) => {
  // global mysqli, config.Tables;

  if (track_id > 0 && member_id > 0 && role_id > 0) {
    // Check for existing record
    r = await rms_db.sequelize.query(
      'SELECT id FROM ' +
        config.Tables['track_member_rel'] +
        ' WHERE track_id=track_id AND member_id=member_id AND role_id=role_id'
    )

    if (!r.length) {
      let uniq_id
      if (!uniqid) uniq_id = getUniqId()
      else uniq_id = escape_str(uniqid)

      values = '(NULL, track_id, member_id, role_id,'
      values += isprimary >= 0 ? isprimary + ',' : '0,'
      values += hidden > 0 ? '1,' : 'NULL,'
      values += "'" + uniq_id + "', NULL)"

      query =
        'INSERT INTO ' + config.Tables['track_member_rel'] + ' VALUES' + values
      let sqlRes = await rms_db.sequelize.query(query)
      if (sqlRes) return sqlRes.id
      else return -1
    } else {
      arr = r[0]
      return arr['id']
    }
  } else return 0
}

exports.get_track_members_json = async (
  track_ids_arr,
  performers = TRUE,
  composers = FALSE,
  output_arr = []
) => {
  let result = []
  object_found = false

  total_ids = track_ids_arr.length
  let temp_arr = []
  counter = 0

  //collect all data in temporary array
  for (let i = 0; i < total_ids; i++) {
    temp_arr[i]['track_id'] = track_ids_arr[i]
    arr = cug_get_track_members(track_ids_arr[i])

    if (arr.length) {
      if (performers == TRUE && composers == FALSE) {
        index = 0
        for (let j = 0; j < arr.length; j++) {
          if (arr[j]['role_id'] != 13 && arr[j]['role_id'] != 33) {
            //COMPOSER && LYRICIST
            temp_arr[i]['member'][index]['member_id'] = arr[j]['member_id']
            temp_arr[i]['member'][index]['member_name'] =
              cug_get_member_name_or_alias(
                arr[j]['title'],
                arr[j]['alias'],
                arr[j]['used_name']
              )
            temp_arr[i]['member'][index]['role_id'] = arr[j]['role_id']
            temp_arr[i]['member'][index]['role_name'] = arr[j]['role_title']
            temp_arr[i]['member'][index]['isprimary'] = arr[j]['isprimary']
            index++
          }
        }
      } else if (performers == FALSE && composers == TRUE) {
        index = 0
        for (let j = 0; j < arr.length; j++) {
          if (arr[j]['role_id'] == 13 || arr[j]['role_id'] == 33) {
            //COMPOSER && LYRICIST
            temp_arr[i]['member'][index]['member_id'] = arr[j]['member_id']
            temp_arr[i]['member'][index]['member_name'] =
              cug_get_member_name_or_alias(
                arr[j]['title'],
                arr[j]['alias'],
                arr[j]['used_name']
              )
            temp_arr[i]['member'][index]['role_id'] = arr[j]['role_id']
            temp_arr[i]['member'][index]['role_name'] = arr[j]['role_title']
            temp_arr[i]['member'][index]['isprimary'] = arr[j]['isprimary']
            index++
          }
        }
      } else {
        for (let j = 0; j < arr.length; j++) {
          temp_arr[i]['member'][j]['member_id'] = arr[j]['member_id']
          temp_arr[i]['member'][j]['member_name'] =
            cug_get_member_name_or_alias(
              arr[j]['title'],
              arr[j]['alias'],
              arr[j]['used_name']
            )
          temp_arr[i]['member'][j]['role_id'] = arr[j]['role_id']
          temp_arr[i]['member'][j]['role_name'] = arr[j]['role_title']
          temp_arr[i]['member'][j]['isprimary'] = arr[j]['isprimary']
        }
      }
    } else if (total_ids > 1) {
      //if tracks has not any member
      temp_arr[i]['member'][0]['member_id'] = 0
      temp_arr[i]['member'][0]['member_name'] = ''
      temp_arr[i]['member'][0]['role_id'] = 0
      temp_arr[i]['member'][0]['role_name'] = ''
      temp_arr[i]['member'][0]['isprimary'] = 0
    }
  }
  //-------------------------------
  //-------------------------------

  if (total_ids == 1) {
    //single track selection
    if (temp_arr[0] && temp_arr[0]['member']) {
      for (let i = 0; i < temp_arr[0]['member'].length; i++) {
        member_id = temp_arr[0]['member'][i]['member_id']
        member_name = temp_arr[0]['member'][i]['member_name']
        role_id = temp_arr[0]['member'][i]['role_id']
        role_name = temp_arr[0]['member'][i]['role_name']
        is_primary = temp_arr[0]['member'][i]['isprimary']

        result.push({
          name: json_str(member_name),
          member_id: member_id,
          role: json_str(role_name),
          isprimary: is_primary
        })
        output_arr[i]['member_id'] = member_id
        output_arr[i]['member_name'] = member_name
        output_arr[i]['role_id'] = role_id
        output_arr[i]['role_name'] = role_name
        output_arr[i]['primary'] = is_primary

        object_found = true
      }
    }
  } else {
    //multitrack selection
    same_object = false
    arr_index = 0

    if (temp_arr[0] && temp_arr[0]['member']) {
      for (let k = 0; k < temp_arr[0]['member'].length; k++) {
        for (let i = 1; i < temp_arr.length; i++) {
          for (let j = 0; j < temp_arr[i]['member'].length; j++) {
            if (
              temp_arr[0]['member'][k]['member_id'] ==
                temp_arr[i]['member'][j]['member_id'] &&
              temp_arr[0]['member'][k]['role_id'] ==
                temp_arr[i]['member'][j]['role_id']
            ) {
              same_object = true
              break
            }
          }

          if (!same_object) {
            break
          }
        }
        //------------

        if (same_object) {
          member_id = temp_arr[0]['member'][k]['member_id']
          member_name = temp_arr[0]['member'][k]['member_name']
          role_id = temp_arr[0]['member'][k]['role_id']
          role_name = temp_arr[0]['member'][k]['role_name']
          let tmpRes = {
            name: json_str(member_name),
            member_id: member_id,
            role: json_str(role_name)
          }
          output_arr[arr_index]['member_id'] = member_id
          output_arr[arr_index]['member_name'] = member_name
          output_arr[arr_index]['role_id'] = role_id
          output_arr[arr_index]['role_name'] = role_name

          //calculate if 'isprimary' is same or not
          for (let i = 1; i < temp_arr.length; i++) {
            same_primary = false

            for (let j = 0; j < temp_arr[i]['member'].length; j++) {
              if (
                temp_arr[0]['member'][k]['isprimary'] ==
                  temp_arr[i]['member'][j]['isprimary'] &&
                temp_arr[0]['member'][k]['member_id'] ==
                  temp_arr[i]['member'][j]['member_id']
              ) {
                same_primary = true
                break
              }
            }

            if (!same_primary) {
              break
            }
          }

          //--------------------
          if (same_primary) {
            tmpRes.isprimary = is_primary

            output_arr[arr_index]['primary'] =
              temp_arr[0]['member'][k]['isprimary']
          } else {
            tmpRes.isprimary = 0
            output_arr[arr_index]['primary'] = 0
          }
          result.push(tmpRes)
          arr_index++

          object_found = true
          same_object = false
        }
      }
    }
    //----------
  }

  return result
}

exports.cug_reg_track_file_rel = async (track_id, file_id) => {
  // global mysqli, config.Tables;
  let result = 0

  if (track_id > 0 && file_id > 0) {
    //check for existing
    r = await rms_db.sequelize.query(
      "SELECT id FROM {Tables['track_file_rel']} WHERE track_id=" +
        escape_str(track_id) +
        ' AND file_id=' +
        escape_str(file_id)
    )

    if (!r.num_rows) {
      query =
        "INSERT INTO {Tables['track_file_rel']} (track_id, file_id) VALUES(" +
        escape_str(track_id) +
        ', ' +
        escape_str(file_id) +
        ')'
      let sqlRes = await rms_db.sequelize.query(query)
      if (sqlRes) {
        result = sqlRes.id
      }
    } else {
      let arr = r[0]
      result = arr['id']
    }
  }

  return result
}

exports.cug_edit_track_time = async (file_id, time) => {
  if (file_id > 0 && time > 0) {
    query =
      'UPDATE ' +
      config.Tables['track_file'] +
      ' SET track_time=' +
      escape_str(time) +
      ' WHERE id= file_id'
    let sqlRes = await rms_db.sequelize.query(query)
    if (sqlRes) {
      return true
    } else {
      return false
    }
  } else {
    return false
  }
}

exports.update_track_albums = async (track_id, albums, file_id = 0) => {
  // global IMG_FILE_SERVER;

  if (track_id) {
    if (this.cug_del_track_album_rel([track_id])) {
      albums.forEach(arr => {
        if (!arr['album_id'] && arr['album_title']) {
          //new Album
          let register_date = moment().format('YYYY-MM-DD HH:mm:ss')

          let obj = {}
          obj.title = arr['album_title'].trim()
          obj.img_path = config.IMG_FILE_SERVER
          obj.register_date = register_date
          obj.register_ip = _SERVER['REMOTE_ADDR']

          if ((album_id = cug_reg_album(obj))) {
            obj = {}
            obj.title = arr['album_title'].trim()
            obj.album_id = album_id
            obj.disc_num = arr['disc_num'] ? arr['disc_num'] : 0
            obj.img_path = config.IMG_FILE_SERVER
            obj.register_date = register_date
            obj.register_ip = _SERVER['REMOTE_ADDR']

            if ((disc_id = this.cug_reg_disc(obj))) {
              track_num = arr['track_num'] ? arr['track_num'] : 0
              hidden = arr['hidden'] == 'true' ? 1 : 0
              this.cug_reg_track_album_rel(
                track_id,
                album_id,
                disc_id,
                obj.disc_num,
                track_num,
                hidden,
                file_id
              )
            }
          }
        } else {
          //existing Album
          obj = {}
          obj.album_id = arr['album_id']
          obj.disc_num = arr['disc_num'] ? arr['disc_num'] : 0
          disc = this.cug_get_disc(obj)

          if (disc.id != null) {
            //existing Disc
            track_num = arr['track_num'] ? arr['track_num'] : 0
            hidden = arr['hidden'] == 'true' ? 1 : 0
            this.cug_reg_track_album_rel(
              track_id,
              arr['album_id'],
              disc.id,
              obj.disc_num,
              track_num,
              hidden,
              file_id
            )
          } else {
            //New Disc
            obj.title = trim(arr['album_title'])
            obj.img_path = IMG_FILE_SERVER

            if ((disc_id = this.cug_reg_disc(obj))) {
              track_num = arr['track_num'] ? arr['track_num'] : 0
              hidden = arr['hidden'] == 'true' ? 1 : 0
              cug_reg_track_album_rel(
                track_id,
                arr['album_id'],
                disc_id,
                obj.disc_num,
                track_num,
                hidden,
                file_id
              )
            }
          }
        } // end of else
      }) //end of foreach()

      //update track_album_rel ids in track_wm1_list
      albums.forEach(arr => {
        if (arr['album_id']) {
          this.cug_fix_track_wm1_alb_rel(track_id, arr['album_id'])
        }
      })
    } else {
      return false
    }
  } else {
    return false
  }

  return true
}

exports.cug_del_track_album_rel = async (
  track_ids,
  album_id = 0,
  disc_id = 0
) => {
  if (track_ids.length) {
    where = '('
    track_ids.forEach(track_id => {
      where += track_id > 0 ? 'track_id=track_id OR ' : ''
    })
    if (where.length > 1) {
      where = where.substring(0, where.length - 4)
      where += ') AND'

      if (album_id > 0) where += ' album_id=album_id AND'
      if (disc_id > 0) where += ' disc_id=disc_id AND'

      where = where.substring(0, where.length - 4)
      query = 'DELETE FROM ' + config.Tables['track_album_rel'] + ' WHERE where'
      let sqlRes = await rms_db.sequelize.query(query)
      if (sqlRes) {
        return true
      } else {
        return false
      }
    } else {
      return false
    }
  } else {
    return false
  }
}

exports.cug_reg_disc = async obj => {
  // global mysqli, config.Tables;
  let fields = ''
  let values = ''

  if (obj.title != null) {
    fields = ' (title,'
    values = " VALUES('" + escape_str(obj.title) + "',"

    if (obj.disc_num != null && obj.disc_num >= 0) {
      fields += 'disc_num,'
      values += escape_str(obj.disc_num) + ','
    }

    if (obj.total_tracks != null) {
      fields += 'total_tracks,'
      values += escape_str(obj.total_tracks) + ','
    }

    if (obj.total_time != null) {
      fields += 'total_time,'
      values += escape_str(obj.total_time) + ','
    }

    if (obj.album_id != null) {
      fields += 'album_id,'
      values += escape_str(obj.album_id) + ','
    }

    if (obj.img_path != null) {
      fields += 'img_path,'
      values += "'" + escape_str(obj.img_path) + "',"
    }

    if (obj.img_34 != null && obj.img_34 >= 0) {
      fields += 'img_34,'
      values += obj.img_34 + ','
    }

    if (obj.img_64 != null && obj.img_64 >= 0) {
      fields += 'img_64,'
      values += obj.img_64 + ','
    }

    if (obj.img_174 != null && obj.img_174 >= 0) {
      fields += 'img_174,'
      values += obj.img_174 + ','
    }

    if (obj.img_300 != null && obj.img_300 >= 0) {
      fields += 'img_300,'
      values += obj.img_300 + ','
    }

    if (obj.img_600 != null && obj.img_600 >= 0) {
      fields += 'img_600,'
      values += obj.img_600 + ','
    }

    if (obj.img_orgn != null && obj.img_orgn >= 0) {
      fields += 'img_orgn,'
      values += obj.img_orgn + ','
    }

    if (obj.update_time != null) {
      fields += 'update_time,'
      values += "'" + escape_str(obj.update_time) + "',"
    }

    fields += 'uniqid)'
    if (obj.uniqid != null) {
      values += "'" + escape_str(obj.uniqid) + "')"
    } else {
      uniqid = getUniqid()
      values += "'" + uniqid + "')"
    }

    let query = 'INSERT INTO ' + config.Tables['album_disc'] + fields + values
    let sqlRes = await rms_db.sequelize.query(query)
    if (sqlRes) {
      return sqlRes.id
    } else {
      return -1
    }
  } else {
    return 0
  }
}

exports.cug_get_disc = async obj => {
  // global mysqli, config.Tables, FILE_SERVER_URL;
  let fields = ''

  if (obj) {
    if (obj.id != null) {
      fields += 'id=' + obj.id + ' AND '
    } else if (null != obj.uniqid) {
      fields += "uniqid='" + escape_str(obj.uniqid) + "' AND "
    } else {
      if (null != obj.title) {
        fields += "title='" + escape_str(obj.title) + "' AND "
      }
      if (obj.disc_num != null && obj.disc_num >= 0) {
        fields += 'disc_num=' + obj.disc_num + ' AND '
      }
      if (obj.total_tracks != null && obj.total_tracks >= 0) {
        fields += 'total_tracks=' + obj.total_tracks + ' AND '
      }
      if (obj.total_time != null && obj.total_time >= 0) {
        fields += 'total_time=' + obj.total_time + ' AND '
      }
      if (null != obj.album_id) {
        fields += 'album_id=' + escape_str(obj.album_id) + ' AND '
      }
      if (null != obj.img_path) {
        fields += "img_path='" + escape_str(obj.img_path) + "' AND "
      }
      if (obj.img_34 != null && obj.img_34 >= 0) {
        fields += 'img_34=' + obj.img_34 + ' AND '
      }
      if (obj.img_64 != null && obj.img_64 >= 0) {
        fields += 'img_64=' + obj.img_64 + ' AND '
      }
      if (obj.img_174 != null && obj.img_174 >= 0) {
        fields += 'img_174=' + obj.img_174 + ' AND '
      }
      if (obj.img_300 != null && obj.img_300 >= 0) {
        fields += 'img_300=' + obj.img_300 + ' AND '
      }
      if (obj.img_600 != null && obj.img_600 >= 0) {
        fields += 'img_600=' + obj.img_600 + ' AND '
      }
      if (obj.img_orgn != null && obj.img_orgn >= 0) {
        fields += 'img_orgn=' + obj.img_orgn + ' AND '
      }
      if (null != obj.update_time) {
        fields += "update_time='" + escape_str(obj.update_time) + "' AND "
      }
    }

    fields = fields.substring(0, fields.length - 4)
    query = 'SELECT * FROM ' + config.Tables['album_disc'] + ' WHERE ' + fields
    r = await rms_db.sequelize.query(query)

    if (r) {
      arr = r[0]
      if (arr) {
        obj = {}

        obj.id = arr['id']
        obj.title = arr['title']
        obj.disc_num = arr['disc_num']
        obj.total_tracks = arr['total_tracks']
        obj.total_time = arr['total_time']
        obj.album_id = arr['album_id']
        obj.img_path = arr['img_path']
        obj.uniqid = arr['uniqid']
        obj.update_time = arr['update_time']

        img_path = null != obj.img_path ? obj.img_path : FILE_SERVER_URL
        //img_path = null !=(obj.img_path) ? cug_get_url_protocol()."://".obj.img_path : FILE_SERVER_URL;

        obj.img_34 = img_path + '/?o=disc&i=' + obj.id + '&s=34'
        obj.img_64 = img_path + '/?o=disc&i=' + obj.id + '&s=64'
        obj.img_174 = img_path + '/?o=disc&i=' + obj.id + '&s=174'
        obj.img_300 = img_path + '/?o=disc&i=' + obj.id + '&s=300'
        obj.img_600 = img_path + '/?o=disc&i=' + obj.id + '&s=600'
        obj.img_orgn = img_path + '/?o=disc&i=' + obj.id + '&s=mega'

        obj.img_34_num = arr['img_34']
        obj.img_64_num = arr['img_64']
        obj.img_174_num = arr['img_174']
        obj.img_300_num = arr['img_300']
        obj.img_600_num = arr['img_600']
        obj.img_orgn_num = arr['img_orgn']

        return obj
      } else return NULL
    } else return NULL
  } else {
    return NULL
  }
}

exports.cug_reg_track_album_rel = async (
  track_id,
  album_id,
  disc_id,
  disc_num,
  track_num,
  hidden = 0,
  file_id = 0,
  uniqid = ''
) => {
  // global mysqli, config.Tables;

  if (
    track_id > 0 &&
    album_id > 0 &&
    disc_id > 0 &&
    disc_num >= 0 &&
    track_num >= 0
  ) {
    // Check for existing record
    r = mysqli.query(
      'SELECT id FROM ' +
        config.Tables['track_album_rel'] +
        ' WHERE album_id=album_id AND disc_id=disc_id AND track_id=track_id AND track_num=track_num'
    )

    if (!r.num_rows) {
      let uniq_id
      if (!uniqid) uniq_id = getUniqid()
      else uniq_id = escape_str(uniqid)

      query =
        'INSERT INTO ' +
        config.Tables['track_album_rel'] +
        " VALUES(NULL, track_id, album_id, disc_id, disc_num, track_num, '', hidden, file_id, 'uniq_id', NULL)"
      let sqlRes = await rms_db.sequelize.query(query)
      if (sqlRes) {
        //register Track-File relation
        if (file_id > 0) this.cug_reg_track_file_rel(track_id, file_id)
        //----------------------------------

        return sqlRes.id
      } else return -1
    } else {
      let arr = r[0]
      return arr['id']
    }
  } else return 0
}

exports.cug_fix_track_wm1_alb_rel = async (track_id, album_id) => {
  // global mysqli, config.Tables;

  if (track_id > 0 && album_id > 0) {
    r = await rms_db.sequelize.query(
      'update ' +
        config.Tables['track_wm1'] +
        ' wm1 \n' +
        'inner join ' +
        config.Tables['track_album_rel'] +
        ' tar on wm1.track_id = tar.track_id and wm1.album_id = tar.album_id \n' +
        'set wm1.track_album_rel_id = tar.id \n' +
        'where wm1.track_id = track_id and wm1.album_id = album_id;'
    )

    if (r) {
      return 1
    } else {
      return -1
    }
  } else return 0
}

exports.update_track_compositions = async (track_ids, compositions) => {
  if (track_ids.length == 1) {
    //single track
    let track_id = track_ids[0]

    if (track_id) {
      if (this.cug_del_track_composition_rel(track_ids)) {
        compositions.forEach(arr => {
          if (!arr['comp_id'] && arr['comp_title']) {
            //new Composition
            obj = {}
            obj.title = trim(arr['comp_title'])

            if ((comp_id = cug_reg_composition(obj))) {
              cug_reg_track_composition_rel(track_id, comp_id)
            }
          } else {
            //existing Composition
            cug_reg_track_composition_rel(track_id, arr['comp_id'])
          }
        })
      } else {
        return false
      }
    } else {
      return false
    }
  } else if (track_ids.length > 1) {
    //multiply tracks
    //calculate same compositions
    same_compositions = array()
    this.get_track_compositions_json(track_ids, same_compositions)

    //delete same compositions
    if (same_compositions.length) {
      if (!this.cug_del_track_composition_rel(track_ids, same_compositions)) {
        return false
      }
    }

    //add new relations
    if (compositions.length) {
      track_ids.forEach(track_id => {
        compositions.forEach(arr => {
          if (!arr['comp_id'] && arr['comp_title']) {
            //new Composition
            obj = {}
            obj.title = arr['comp_title'].trim()

            if ((comp_id = this.cug_reg_composition(obj))) {
              this.cug_reg_track_composition_rel(track_id, comp_id)
            }
          } else {
            //existing Composition
            this.cug_reg_track_composition_rel(track_id, arr['comp_id'])
          }
        })
      })
    }
  } else {
    return false
  }
  return true
}

exports.cug_del_track_publisher_rel = async (track_ids, publishers = []) => {
  where_id = '('
  where_publisher = '('

  if (track_ids.length > 0) {
    //-------------
    track_ids.forEach(track_id => {
      where_id += track_id > 0 ? 'track_id=track_id OR ' : ''
    })
    //-------------
    if (publishers.length) {
      publishers.forEach(publisher => {
        where_publisher +=
          !empty(publisher['publisher_id']) && publisher['publisher_id'] > 0
            ? 'publisher_id=' + publisher['publisher_id'] + ' OR '
            : ''
      })
    }
    //-------------

    if (where_id.length > 1) {
      where_id = where_id.substring(where_id, 0, where_id.length - 3) + ')'

      if (where_publisher.length > 1) {
        where_publisher =
          where_publisher.substring(0, where_publisher.length - 3) + ')'
      } else {
        where_publisher = ''
      }

      query =
        'DELETE FROM ' +
        config.Tables['track_publisher_rel'] +
        ' WHERE where_id'
      query += where_publisher.length ? ' AND where_publisher' : ''
      let sqlRes = await rms_db.sequelize.query(query)
      if (sqlRes) {
        return true
      } else {
        return false
      }
    } else {
      return false
    }
  } else {
    return false
  }
}

exports.cug_del_track_composition_rel = async (
  track_ids,
  compositions = []
) => {
  // global mysqli, config.Tables;
  let where_id = '('
  let where_composition = '('

  if (track_ids.length > 0) {
    //-------------
    track_ids.forEach(track_id => {
      where_id += track_id > 0 ? `track_id=${track_id} OR ` : ''
    })
    //-------------
    if (compositions.length) {
      compositions.forEach(composition => {
        where_composition +=
          !empty(composition['comp_id']) && composition['comp_id'] > 0
            ? 'comp_id=' + composition['comp_id'] + ' OR '
            : ''
      })
    }
    //-------------

    if (where_id.length > 1) {
      where_id = where_id.substring(0, where_id.length - 3) + ')'

      if (where_composition.length > 1) {
        where_composition =
          where_composition.substring(0, where_composition.length - 3) + ')'
      } else {
        where_composition = ''
      }

      let query =
        'DELETE FROM ' +
        config.Tables['track_composition_rel'] +
        ' WHERE where_id'
      query += where_composition.length ? ' AND where_composition' : ''
      let sqlRes = await rms_db.sequelize.query(query)
      if (sqlRes) {
        return true
      } else {
        return false
      }
    } else {
      return false
    }
  } else {
    return false
  }
}

exports.get_track_compositions_json = (track_ids_arr, output_arr = []) => {
  result = []
  let object_found = false

  let total_ids = track_ids_arr.length
  temp_arr = []

  //collect all data in temporary array
  for (let i = 0; i < total_ids; i++) {
    temp_arr[i]['track_id'] = track_ids_arr[i]
    arr = cug_get_track_compositions(track_ids_arr[i])

    if (arr.length) {
      for (let j = 0; j < arr.length; j++) {
        temp_arr[i]['composition'][j]['id'] = arr[j]['comp_id']
        temp_arr[i]['composition'][j]['title'] = arr[j]['title']
        temp_arr[i]['composition'][j]['part'] = arr[j]['part']
      }
    } else if (total_ids > 1) {
      //if track has not any composition
      temp_arr[i]['composition'][0]['id'] = 0
      temp_arr[i]['composition'][0]['title'] = ''
      temp_arr[i]['composition'][0]['part'] = ''
    }
  }
  //-------------------------------

  if (total_ids == 1) {
    //single track selection
    if (null != temp_arr[0]['composition']) {
      for (let i = 0; i < temp_arr[0]['composition'].length; i++) {
        comp_id = temp_arr[0]['composition'][i]['id']
        comp_title = temp_arr[0]['composition'][i]['title']
        comp_part = temp_arr[0]['composition'][i]['part']
        result.push({
          name: json_str(comp_title),
          id: comp_id,
          part: json_str(comp_part)
        })
        output_arr.push({
          name: comp_title,
          id: comp_id,
          part: comp_part
        })
        object_found = true
      }
    }
  } else {
    //multitrack selection
    let same_object = false
    let arr_index = 0

    if (null != temp_arr[0]['composition']) {
      for (let k = 0; k < temp_arr[0]['composition'].length; k++) {
        for (let i = 1; i < temp_arr.length; i++) {
          for (let j = 0; j < temp_arr[i]['composition'].length; j++) {
            if (
              temp_arr[0]['composition'][k]['id'] ==
              temp_arr[i]['composition'][j]['id']
            ) {
              same_object = true
              break
            }
          }

          if (!same_object) {
            break
          }
        }
        //------------

        if (same_object) {
          comp_id = temp_arr[0]['composition'][k]['id']
          comp_title = temp_arr[0]['composition'][k]['title']
          comp_part = temp_arr[0]['composition'][k]['part']
          result.push({
            name: json_str(comp_title),
            id: comp_id,
            part: json_str(comp_part)
          })

          output_arr.push({
            name: comp_title,
            id: comp_id,
            part: comp_part
          })
          arr_index++

          object_found = true
          same_object = false
        }
      }
    }
    //----------
  }

  if (object_found) result = result.substring(0, result.length - 1)

  return result
}
