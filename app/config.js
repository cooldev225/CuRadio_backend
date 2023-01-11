require('dotenv').config()

module.exports.MODE = process.env.MODE
module.exports.ERROR_OBJ = { status: false }
module.exports.SUCCESS_OBJ = { status: true }
module.exports.FRONTEND_URL = process.env.FRONTEND_URL
module.exports.APP_SECRET_KEY = process.env.APP_SECRET_KEY

module.exports.RMS_APP_DOMAIN = process.env.RMS_APP_DOMAIN

module.exports.STAT_DB_SYNC = process.env.STAT_DB_SYNC === 'true'
module.exports.STAT_DB_SYNC_FORCE = process.env.STAT_DB_SYNC_FORCE === 'true'
module.exports.STAT_DB_HOST = process.env.STAT_DB_HOST
module.exports.STAT_DB_PORT = process.env.STAT_DB_PORT
module.exports.STAT_DB_NAME = process.env.STAT_DB_NAME
module.exports.STAT_DB_USER = process.env.STAT_DB_USER
module.exports.STAT_DB_PASSWORD = process.env.STAT_DB_PASSWORD

module.exports.RMS_DB_SYNC = process.env.RMS_DB_SYNC === 'true'
module.exports.RMS_DB_SYNC_FORCE = process.env.RMS_DB_SYNC_FORCE === 'true'
module.exports.RMS_DB_HOST = process.env.RMS_DB_HOST
module.exports.RMS_DB_PORT = process.env.RMS_DB_PORT
module.exports.RMS_DB_NAME = process.env.RMS_DB_NAME
module.exports.RMS_DB_USER = process.env.RMS_DB_USER
module.exports.RMS_DB_PASSWORD = process.env.RMS_DB_PASSWORD

module.exports.RADIO_DB_SYNC = process.env.RADIO_DB_SYNC === 'true'
module.exports.RADIO_DB_SYNC_FORCE = process.env.RADIO_DB_SYNC_FORCE === 'true'
module.exports.RADIO_DB_HOST = process.env.RADIO_DB_HOST
module.exports.RADIO_DB_PORT = process.env.RADIO_DB_PORT
module.exports.RADIO_DB_NAME = process.env.RADIO_DB_NAME
module.exports.RADIO_DB_USER = process.env.RADIO_DB_USER
module.exports.RADIO_DB_PASSWORD = process.env.RADIO_DB_PASSWORD

module.exports.CUR_DB_SYNC = process.env.CUR_DB_SYNC === 'true'
module.exports.CUR_DB_SYNC_FORCE = process.env.CUR_DB_SYNC_FORCE === 'true'
module.exports.CUR_DB_HOST = process.env.CUR_DB_HOST
module.exports.CUR_DB_PORT = process.env.CUR_DB_PORT
module.exports.CUR_DB_NAME = process.env.CUR_DB_NAME
module.exports.CUR_DB_USER = process.env.CUR_DB_USER
module.exports.CUR_DB_PASSWORD = process.env.CUR_DB_PASSWORD

module.exports.DB = {
  dialect: 'mysql',
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
}

module.exports.cache_schema_name = 'cugate_v3_cache'

module.exports.Tables = {
  country: 'country_list',
  country_ip: 'country_ip',
  city: 'country_city_list',
  airport: 'country_airport_list',
  dbip: 'dbip_lookup',

  member: 'member_list',
  member_type: 'member_type_list',
  member_role: 'member_role_list',
  artist_stat: 'stat_artist_list',
  member_more_info: 'member_more_info',

  album: 'album_list',
  album_disc: 'album_disc_list',
  album_format: 'album_format_list',
  album_type: 'album_type_list',
  album_package: 'album_package_list',
  album_client: 'album_client_rel',
  album_member: 'album_member_rel',
  album_more_info: 'album_more_info',
  album_covers_from_portals: 'album_covers_from_portals',
  album_release: 'album_release_rel',
  album_label_cat: 'album_label_cat_rel',
  cumarket_albums: 'cumarket_albums',

  client: 'client_list',
  client_type: 'client_type_list',
  client_type_rel: 'client_type_rel',
  client_wm2: 'client_wm2_list',
  client_businesstype: 'client_business_type_list',
  client_businesstype_rel: 'client_business_type_rel',

  track: 'track_list',
  track_album_rel: 'track_album_rel',
  track_client_rel: 'track_client_rel',
  track_composition_rel: 'track_composition_rel',
  track_file_format: 'track_file_format_list',
  track_file: 'track_file_list',
  track_file_rel: 'track_file_rel',
  track_file_type: 'track_file_type_list',
  track_file_server: 'track_file_server_list',
  track_masterright: 'track_masterright_list',
  track_member_rel: 'track_member_rel',
  track_publisher_rel: 'track_publisher_rel',
  track_wm1: 'track_wm1_list',
  track_stat: 'stat_track_list',
  track_release: 'track_release_rel',
  arrangement: 'arrangement_list',
  composition: 'composition_list',
  composition_member_rel: 'composition_member_rel',
  footprint: 'fp_051',

  genre: 'genre_list',
  key: 'key_list',
  mood: 'mood_list',
  mood_key_rel: 'mood_key_rel',
  mood_key_user_rel: 'mood_key_user_rel',
  submood: 'submood_list',
  tempo: 'tempo_list',
  tempo_genre_user_rel: 'tempo_genre_user_rel',
  music_period: 'music_period_list',
  label: 'label_list',
  label_cat: 'label_category_list',

  lang: 'lang_list',
  lang_region: 'lang_region_list',
  lang_details: 'lang_details_list',
  lang_module_rel: 'lang_module_rel',

  user: 'user_list',
  action: 'action_list',
  user_group: 'user_group_list',
  user_group_rel: 'user_group_rel',
  usergroup_right_rel: 'user_group_right_rel',
  user_group_module_rel: 'user_group_module_rel',
  user_module_rel: 'user_module_rel',
  user_right_rel: 'user_right_rel',
  right: 'right_list',
  right_filter: 'right_filter_list',
  user_fav_track: 'user_fav_track_list',
  user_fav_artist: 'user_fav_artist_list',
  user_fav_album: 'user_fav_album_list',
  user_fav_rstation: 'user_fav_rstation_list',
  listened_rstation: 'user_listened_rstation_list',
  most_listened_rstation: 'user_most_listened_rstation_list',
  listened_track: 'user_listened_track_list',
  te_user_group_product_owner_rel: 'te_user_group_product_owner_rel',
  te_user_product_owner_rel: 'te_user_product_owner_rel',

  object: 'object_list',
  module: 'module_list',

  colour: 'colour_list',

  gender: 'gender_list',
  tag_status: 'tag_status_list',

  cache_tracks: this.cache_schema_name + '.cache_tracks',
  cache_members: this.cache_schema_name + '.cache_members',
  cache_albums: this.cache_schema_name + '.cache_albums',
  cache_global_objects: this.cache_schema_name + '.cache_global_objects',
  cache_global_objects_hash:
    this.cache_schema_name + '.cache_global_objects_hash',
  cache_gender: this.cache_schema_name + '.cache_gender',
  cache_genre: this.cache_schema_name + '.cache_genre',
  cache_member_type: this.cache_schema_name + '.cache_member_type',
  cache_mood: this.cache_schema_name + '.cache_mood',
  cache_role: this.cache_schema_name + '.cache_role',
  cache_tag_status: this.cache_schema_name + '.cache_tag_status',
  cache_tempo: this.cache_schema_name + '.cache_tempo',
  cache_country: this.cache_schema_name + '.cache_country',
  cache_culink_album: this.cache_schema_name + '.cache_culink_album',
  cache_culink_cat: this.cache_schema_name + '.cache_culink_cat',
  cache_culink_member: this.cache_schema_name + '.cache_culink_member',
  cache_culink_portal: this.cache_schema_name + '.cache_culink_portal',
  cache_culink_product: this.cache_schema_name + '.cache_culink_product',
  cache_culink_product_type:
    this.cache_schema_name + '.cache_culink_product_type',
  cache_culink_query_type: this.cache_schema_name + '.cache_culink_query_type',
  cache_culink_track: this.cache_schema_name + '.cache_culink_track',

  cache_lang: this.cache_schema_name + '.cache_language',
  cache_album_type: this.cache_schema_name + '.cache_album_type',
  cache_album_format: this.cache_schema_name + '.cache_album_format',
  cache_file_type: this.cache_schema_name + '.cache_file_type',
  cache_file_format: this.cache_schema_name + '.cache_file_format',

  log: 'log_list',
  log_te: 'log_te_list',
  log_webpage: 'log_web_page_list',
  log_webpage_det: 'log_web_page_details',
  stat_track: 'stat_track_list',
  stat_artist: 'stat_artist_list',
  log_app_tracks: 'log_app_tracks',
  log_app_tracks_fp: 'log_app_tracks_fp',
  log_analyzed_audio_data: 'log_analyzed_audio_data',

  object_link: 'object_link_list',
  object_link_type: 'object_link_type_list',

  video_link: 'video_link_list',
  video_link_type: 'video_link_type_list',
  video_link_cat: 'video_link_category_list',
  video_link_subcat: 'video_link_subcategory_list',
  video_link_rel: 'video_link_rel',

  portal_files: 'portal_download_file_list',
  portal_folders: 'portal_download_folder_list',
  portal_files_analyze_error: 'portal_files_analyze_error_list',

  portal_playlist: 'portal_playlist_list',
  portal_playlist_album: 'portal_playlist_album_rel',
  portal_playlist_genre: 'portal_playlist_genre_rel',
  portal_playlist_member: 'portal_playlist_member_rel',
  portal_playlist_track: 'portal_playlist_track_rel',

  chart_albums: 'chart_album_list',
  chart_members: 'chart_member_list',
  chart_tracks: 'chart_track_list',
  chart_tracks_alt: 'chart_track_list_alt', //alternative table
  chart_type: 'chart_type_list',

  settings_cutube: 'settings_cutube_page',

  error: 'error_list',

  log_email_send: 'email_send_log',
  email_category: 'email_category_list',
  email_send_method: 'email_send_method_list',

  delivery_package_log: 'delivery_package_log',
  delivery_product_log: 'delivery_product_log',
  delivery_status_list: 'delivery_status_list',
  delivery_error_list: 'delivery_error_list',
  delivery_action_list: 'delivery_action_list',

  price_code: 'price_code_list'
}

module.exports.slash = '/'

module.exports.F_LEVEL = 5

module.exports.F_DIGITS_NUM = 3

module.exports.F_TOTAL_DIGITS = (this.F_LEVEL * this.F_DIGITS_NUM) + this.F_DIGITS_NUM;

module.exports.IMG_EXT = {
  album: 'jpg',
  disc: 'jpg',
  disc: 'jpg',
  member: 'jpg',
  client: 'png',
  user: 'jpg',
  extra_ink: 'png',
  cube_ink: 'png'
}

module.exports.TEMP_UPLOAD_PATH	= "/temp_upload/";  

//FILE Server
module.exports.FILE_SERVER_URL 	= "http://img.cugate.com";
module.exports.MUSIC_SERVER_URL 	= "http://music.cugate.com";