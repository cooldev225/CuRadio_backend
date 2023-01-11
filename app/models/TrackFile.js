'use strict'

const rms_db = require('../rms_models')
const fs = require('fs')
const rms_module = require('../modules/rms')
const config = require('../config')
const moment = require('moment')
const { QueryTypes } = require('sequelize')
const Lib = require('../Library/index')
const { fileStore, fileDelete } = require('./../file')
const DB = require("./DB")

module.exports = class TrackFile {
  static REGISTER_SUCCESS = 100
  static REGISTER_FAILED = 101
  static UNIQID_ERROR = 102

  constructor () {
    this.id = -1
    this.track_type_id = 0
    this.track_time = 0
    this.fp_status = 0
    this.wm_status = 0
    this.f_format_id = 0
    this.f_size = 0
    this.f_brate = 0
    this.f_srate = 0
    this.f_register_from = 0
    this.f_orign_path = ''
    this.f_prev_path = ''
    this.uniqid = Lib.String.uniqid()
  }

  static async fromFile (file) {
    let trackFile = new TrackFile()
    let uid = Lib.String.uniqid()
    let info = TrackFile.getTrackFileInfo(file)
    trackFile.uniqid = uid
    trackFile.track_time = info.duration
    trackFile.f_prev_path = await fileStore(file, '/upload/audios')
    return trackFile;
  }

  static find (id) {
    //
  }

  static async getTrackFileInfo (file) {
    return {
      duration: 244
    }
  }

  async register () {
    let obj = {}
    if (this.uniqid) {
      if (DB.fieldCheck(this.track_type_id))
        obj.track_type_id = this.track_type_id
      if (DB.fieldCheck(this.track_time)) obj.track_time = this.track_time
      if (DB.fieldCheck(this.track_type)) obj.track_type = this.track_type
      if (DB.fieldCheck(this.wm_status)) obj.wm_status = this.wm_status
      if (DB.fieldCheck(this.f_format_id)) obj.f_format_id = this.f_format_id
      if (DB.fieldCheck(this.f_size)) obj.f_size = this.f_size
      if (DB.fieldCheck(this.f_brate)) obj.f_brate = this.f_brate
      if (DB.fieldCheck(this.f_register_from))
        obj.f_register_from = this.f_register_from
      if (DB.fieldCheck(this.f_orign_path)) obj.f_orign_path = this.f_orign_path
      if (DB.fieldCheck(this.f_prev_path)) obj.f_prev_path = this.f_prev_path

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
      let query = `INSERT INTO ${config.Tables.track_file} ${fieldString} ${valueString}`
      let sqlRes = await rms_db.sequelize.query(query, {
        type: QueryTypes.INSERT
      })
      let id = sqlRes[0]
      let res = {
        id: id,
        status: id ? TrackFile.REGISTER_SUCCESS : Track.REGISTER_FAILED
      }
      return res
    }
  }
}
