'use strict'

const rms_db = require('../rms_models')
const fs = require('fs')
const rms_module = require('../modules/rms')
const config = require('../config')
const moment = require('moment')
const { QueryTypes } = require('sequelize')
const Lib = require('../Library/index')
const { fileStore, fileDelete } = require('../file')
const TrackFile = require("./TrackFile")

module.exports = class TrackFileRel {
  static REGISTER_SUCCESS = 100
  static REGISTER_FAILED = 101
  static REGISTER_ID_TYPE_ERROR = 102
  
  constructor (track_id, file_id) {
    this.id = -1
    this.track_id = track_id
    this.file_id = file_id
  }

  static find (id) {}

  async register () {
    if ((typeof this.track_id) == "number" && (typeof this.file_id) == "number") {
      let query = `INSERT INTO ${config.Tables.track_file_rel} (track_id, file_id) VALUES (${this.track_id}, ${this.file_id})`
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
    return {
      id : -1,
      status : TrackFileRel.REGISTER_ID_TYPE_ERROR
    }
  }
}
