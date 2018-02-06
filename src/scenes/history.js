import Telegraf from 'telegraf'
import Scene from 'telegraf/scenes/base'
import _ from 'lodash'
import moment from 'moment'
import Finance from '../models/finance'

const getTable = (where) => {
  let message = "Записи:\n"
  return Finance.findAll({ where })
    .then((rows) => {
      const groups = {}
      _.forEach(rows, (row) => {
        if (!_.has(groups, row.category)) {
          groups[row.category] = {
            sum: 0,
            list: []
          }
        }
        groups[row.category].list.push(row)
        if (row.type == 0) {
          groups[row.category].sum += row.sum
        }
      })
      _.forEach(groups, (group, groupName) => {
        message += "Категория: " + groupName + " | Сумма расходов: " + group.sum + "\n----------------\n"
        _.forEach(group.list, (row) => {
          message += "ID: " + row.id + " | Тип: " + ((row.type == 1) ? "приход" : "расход") + " | Сумма: " + row.sum + " | Дата: " + moment(new Date(row.createdAt)).format("DD.MM.YYYY HH:mm") + "\n"
        })
        message += "\n"
      })
      return message
    })
}

const scene = new Scene('history')
scene.enter((ctx) => {
  return ctx.reply('Укажите категорию',
    Telegraf.Markup.inlineKeyboard([
      Telegraf.Markup.callbackButton('Все категории', 'ALL'),
    ]).extra()
  );
});

scene.on('text', (ctx) => {
  const where = {
    userId: ctx.message.from.id,
    category: ctx.message.text
  }
  ctx.scene.leave()
  return getTable(where)
    .then((result) => ctx.reply(result))
});

scene.action('ALL', (ctx) => {
  const where = {
    userId: ctx.callbackQuery.from.id
  }
  ctx.scene.leave()
  return getTable(where)
    .then((result) => ctx.reply(result))
});

export default scene
