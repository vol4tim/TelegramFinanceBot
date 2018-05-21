import moment from 'moment'
import db from './models/db'
import Finance from './models/finance'
import User from './models/user'
import { getListByName, addRow, getRows } from './doc'

const replaceAll = (str, search, replace) => {
  return str.split(search).join(replace);
}

export const financeAddDb = (userId, type, sum, currency, category, comment, fileId, createdAt = null) => {
  sum = Number(replaceAll(replaceAll(sum, ' ', ''), ',', '.'))
  currency = currency.toUpperCase()
  if (createdAt !== null) {
    createdAt = moment(createdAt, "DD.MM.YYYY").format("YYYY-MM-DD 00:00:00")
  }
  return Finance.create({ userId, type, sum, currency, category, comment, fileId, createdAt })
}

export const financeAdd = (userId, type, sum, currency, category, comment, fileId) => {
  let date
  currency = currency.toUpperCase()
  return Finance.create({ userId, type, sum, currency, category, comment, fileId })
    .then((row) => {
      date = moment(new Date(row.createdAt)).format("DD.MM.YYYY")
    })
    .then(() => {
      return User.findOne({ where: { userId } })
    })
    .then((user) => {
      if (user === null) {
        return false
      }
      return getListByName(user.username)
    })
    .then((list) => {
      if (list === false) {
        return false
      }
      return addRow(list, {
        'Когда': date,
        'Тип': currency,
        'Приход': (type === 1) ? sum : '',
        'Расход': (type === 0) ? sum : '',
        'Статья': category,
        'Комментарий': comment
      })
    })
}

export const financeDel = (userId, id) => {
  let entity
  let count
  return Finance.findOne({ where: { userId, id } })
    .then((row) => {
      if (row !== null) {
        entity = row
        return Finance.destroy({ where: { userId, id } })
      }
      return false
    })
    .then((result) => {
      count = result
      // if (count === 1) {
      //   if (entity.type == 1) {
      //     User.increment({ balance: -entity.sum }, { where: { userId } })
      //   } else {
      //     User.increment({ balance: entity.sum }, { where: { userId } })
      //   }
      // }
    })
    .then(() => {
      return User.findOne({ where: { userId } })
    })
    .then((user) => {
      if (user === null) {
        return false
      }
      return getListByName(user.username)
    })
    .then((list) => {
      if (list === false) {
        return false
      }
      return getRows(list, {
        query: 'когда=' + moment(new Date(entity.createdAt)).format("DD.MM.YYYY") + ' and ' +
          'тип=' + entity.currency + ' and ' +
          ((entity.type === 1) ?
            'приход=' + entity.sum + ' and ' :
            'расход=' + entity.sum + ' and '
          ) +
          'статья=' + entity.category + ' and ' +
          'комментарий=' + entity.comment
      })
    })
    .then((rows) => {
      if (rows.length > 0) {
        rows[0].del()
      }
      return count
    })
}

export const financeDelAllUser = (userId) => {
  return Finance.destroy({ where: { userId } })
}

export const syncUser1 = (userId) => {
  return financeDelAllUser(userId)
    .then(() => {
      return User.findOne({ where: { userId } })
    })
    .then((user) => {
      if (user === null) {
        return false
      }
      return getListByName(user.username)
    })
    .then((list) => {
      return getRows(list)
    })
    .then((rows) => {
      rows.forEach((row) => {
        financeAddDb(userId, ((row['приход'] !== '') ? 1 : 0), ((row['приход'] !== '') ? row['приход'] : row['расход']), row['тип'], row['статья'], row['комментарий'], null, row['когда'])
      })
    })
}

// export const syncUser = (userId) => {
//  const skipDel = [ 127,
//     128,
//     129,
//     130,
//     131,
//     132,
//     133,
//     134,
//     135,
//     136,
//     137 ];
//   console.log(skipDel);
//   Finance.destroy({ where: { userId, id: { [db.Sequelize.Op.notIn]: skipDel } } })
// }

export const syncUser = (userId) => {
  const table = []
  const skipDel = []
  return User.findOne({ where: { userId } })
    .then((user) => {
      if (user === null) {
        return false
      }
      return getListByName(user.username)
    })
    .then((list) => {
      return getRows(list)
    })
    .then((rows) => {
      const ps = []
      rows.forEach((row) => {
        // проверяем если в базе нет такой строки, то добавляем
        let sum = (row['приход'] !== '') ? row['приход'] : row['расход']
        sum = Number(replaceAll(replaceAll(sum, ' ', ''), ',', '.'))
        const data = {
          userId,
          type: (row['приход'] !== '') ? 1 : 0,
          sum: sum,
          currency: row['тип'],
          category: row['статья'],
          comment: row['комментарий'],
          fileId: null,
          createdAt: moment(row['когда'], "DD.MM.YYYY").format("YYYY-MM-DD 00:00:00")
        }
        table.push(data)
        ps.push(Finance.findOne({ where: {
          userId: data['userId'],
          type: data['type'],
          sum: data['sum'],
          currency: data['currency'],
          category: data['category'],
          comment: data['comment'],
          createdAt: data['createdAt'],
        } }))
      })
      return Promise.all(ps)
    })
    .then((result) => {
      const ps = []
      result.forEach((item, i) => {
        if (item === null) {
          ps.push(Finance.create(table[i]))
        } else {
          skipDel.push(item.id)
        }
      })
      return Promise.all(ps)
    })
    .then((result) => {
      result.forEach((item) => {
        skipDel.push(item.id)
      })
      if (skipDel.length > 0) {
        return Finance.destroy({ where: { userId, id: { [db.Sequelize.Op.notIn]: skipDel } } })
      }
      return true
    })
    .then((result) => {
      console.log(result)
    })
}
