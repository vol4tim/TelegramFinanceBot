import Scene from 'telegraf/scenes/base'
import Promise from 'bluebird'
import _ from 'lodash'
import moment from 'moment'
import fs from 'fs'
import json2csv from 'json2csv'
import Finance from '../models/finance'
import Files from '../models/files'
import { PATH_FILES } from '../config'

const getHistory = (ctx, where) => {
  const include = [{
    model: Files,
    as: 'file'
  }]
  const data = []
  return Finance.findAll({ include, where })
    .then((rows) => {
      _.forEach(rows, (row) => {
        const file = (row.file) ? row.file.tFileId : ''
        data.push({
          id: row.id,
          type: ((row.type == 1) ? "приход" : "расход"),
          sum: row.sum,
          currency: row.currency,
          category: row.category,
          date: moment(new Date(row.createdAt)).format("DD.MM.YYYY HH:mm"),
          com: row.comment,
          file
        })
      })
      const filesPromises = []
      _.forEach(data, (row) => {
        if (row.file) {
          filesPromises.push(ctx.telegram.getFileLink(row.file))
        } else {
          filesPromises.push(Promise.resolve(''))
        }
      })
      return Promise.all(filesPromises)
    })
    .then((files) => {
      _.forEach(files, (file, i) => {
        data[i].file = file
      })
      return data
    })
}

const scene = new Scene('csv')
scene.enter((ctx) => {
  const where = {
    userId: ctx.message.from.id
  }
  return getHistory(ctx, where)
    .then((result) => {
      const fields = ['id', 'type', 'sum', 'currency', 'category', 'date', 'com', 'file'];
      const csv = json2csv({ data: result, fields: fields });
      fs.writeFile(PATH_FILES + '/tmp.csv', csv, function(err) {
        if (err) throw err;
        ctx.replyWithDocument({ filename: 'history.csv', source: fs.createReadStream(PATH_FILES + '/tmp.csv') })
      });
    })
});

export default scene
