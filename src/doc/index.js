import GoogleSpreadsheet from 'google-spreadsheet'
import Promise from 'bluebird'
import _ from 'lodash'
import creds from './client_secret.json'

const GOOGLE_DOC_ID = process.env.GOOGLE_DOC_ID || '1uqSgCvXKhEzWnUzTUTUavBM4bJFhLVMWckzE3k-vM-8';

const doc = new GoogleSpreadsheet(GOOGLE_DOC_ID);

const docSync = () => {
  return new Promise((resolve, reject) => {
    doc.useServiceAccountAuth(creds, (err) => {
      if (err) {
        reject(err)
      }
      resolve(true)
    })
  })
}

export const addList = (name) => {
  return new Promise((resolve, reject) => {
    doc.addWorksheet({
      title: name,
      headers: ['Когда', 'Тип', 'Приход', 'Расход', 'Статья', 'Комментарий'],
    }, (err) => {
      if (err) {
        reject(err)
      }
      resolve(true)
    })
  })
}

export const getListByName = (name) => {
  return new Promise((resolve, reject) => {
    doc.getInfo((err, info) => {
      if (err) {
        reject(err)
      }
      const list = _.find(info.worksheets, { title: name });
      resolve(list)
    })
  })
}

export const addRow = (list, data) => {
  return new Promise((resolve, reject) => {
    list.addRow(data, (err, row) => {
      if (err) {
        reject(err)
      }
      resolve(row)
    });
  })
}

export const getRows = (list, query = {}) => {
  return new Promise((resolve, reject) => {
    list.getRows(query, (err, rows) => {
      if (err) {
        reject(err)
      }
      resolve(rows)
    });
  })
}

export default docSync
