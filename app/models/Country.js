'use strict'

const DB = require('./DB')
const Lib = require('./../Library')
const config = require('./../config')
const rms_db = require('./../rms_models')
const { QueryTypes } = require('sequelize')

module.exports = class Country {
  static ITEM_TYPE_ID = 'id'
  static ITEM_TYPE_TITLE = 'title'
  static ITEM_TYPE_CODE2 = 'code_alpha2'
  static ITEM_TYPE_CODE3 = 'code_alpha3'
  static ITEM_TYPE_CODENUM = 'code_num'
  static ITEM_TYPE_CODEDIAL = 'code_dial'
  static ITEM_TYPE_DEFAULT = ''

  static SORT_BY_ID = 'id'
  static SORT_BY_TITLE = 'title'
  static SORT_BY_CODE2 = 'code_alpha2'
  static SORT_BY_CODE3 = 'code_alpha3'
  static SORT_BY_CODENUM = 'code_num'
  static SORT_BY_CODEDIAL = 'code_dial'
  static SORT_BY_DEFAULT = 'id'

  constructor () {
    //
  }

  find (countryId) {}

  static async getList (data = {
    field : Country.ITEM_TYPE_DEFAULT,
    value : "",
    orderBy : Country.SORT_BY_DEFAULT,
    orderDir : DB.SORT_ASC
  }) {
    let item = data.value
    let item_type = data.field
    let sort_by = data.orderBy
    let sort_type = data.orderDir;

    let result = []
    let query = ''

    if (item) {
      let field = ''
      switch (item_type) {
        case Country.ITEM_TYPE_ID:
          field = 'id'
          break
        case Country.ITEM_TYPE_TITLE:
          field = 'title'
          break
        case Country.ITEM_TYPE_CODE2:
          field = 'code_alpha2'
          break
        case Country.ITEM_TYPE_CODE3:
          field = 'code_alpha3'
          break
        case Country.ITEM_TYPE_CODENUM:
          field = 'code_num'
          break
        case Country.ITEM_TYPE_CODEDIAL:
          field = 'code_dial'
          break
        default:
          field = ''
          break
      }

      if (field) {
        if (field == 'id') {
          query =
            'SELECT * FROM ' +
            config.Tables['country'] +
            ' WHERE ' +
            field +
            '=' +
            Lib.String.escapeStr(item)
        } else {
          query =
            'SELECT * FROM ' +
            config.Tables['country'] +
            ' WHERE ' +
            field +
            "='" +
            Lib.String.escapeStr(item) +
            "'"
        }
      }
    } else {
      query = 'SELECT * FROM ' + config.Tables['country']
    }
    //--------------------------

    if (query) {
      let sort_field = ''
      if (sort_by == Country.SORT_BY_ID) sort_field = 'id'
      else if (sort_by == Country.SORT_BY_CODE2) sort_field = 'code_alpha2'
      else if (sort_by == Country.SORT_BY_CODE3) sort_field = 'code_alpha3'
      else if (sort_by == Country.SORT_BY_CODENUM) sort_field = 'code_num'
      else if (sort_by == Country.SORT_BY_CODEDIAL) sort_field = 'code_dial'
      else sort_field = 'title'

      query += ` ORDER BY ${sort_field} ${sort_type}`
      let r = await rms_db.sequelize.query(query, { type: QueryTypes.SELECT })
      result = r;
    }

    return result
  }
}
