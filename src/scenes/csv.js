import Scene from 'telegraf/scenes/base'
import _ from 'lodash'
import moment from 'moment'
import fs from 'fs'
import json2csv from 'json2csv'
import Finance from '../models/finance'
import { PATH_FILES } from '../config'

const getHistory = (where) => {
  return Finance.findAll({ where })
    .then((rows) => {
      const data = []
      _.forEach(rows, (row) => {
        data.push({
          id: row.id,
          type: ((row.type == 1) ? "приход" : "расход"),
          sum: row.sum,
          category: row.category,
          date: moment(new Date(row.createdAt)).format("DD.MM.YYYY HH:mm"),
          com: row.comment
        })
      })
      return data
    })
}

const scene = new Scene('csv')
scene.enter((ctx) => {
  const where = {
    userId: ctx.message.from.id
  }
  return getHistory(where)
    .then((result) => {
      const fields = ['id', 'type', 'sum', 'category', 'date', 'com'];
      const csv = json2csv({ data: result, fields: fields });
      fs.writeFile(PATH_FILES + '/tmp.csv', csv, function(err) {
        if (err) throw err;
        ctx.replyWithDocument({ filename: 'history.csv', source: fs.createReadStream(PATH_FILES + '/tmp.csv') })
      });
    })
});

export default scene
