import Telegraf from 'telegraf'
import Scene from 'telegraf/scenes/base'
import Finance from '../models/finance'

const getTotal = (where) => {
  return Finance.sum('sum', { where })
}

const scene = new Scene('total')
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
    category: ctx.message.text,
    type: 1
  }
  ctx.scene.leave()
  return getTotal(where)
    .then((result) => {
      ctx.reply('Всего приход: ' + result)
      where.type = 0
      return getTotal(where)
    })
    .then((result) => {
      ctx.reply('Всего расход: ' + result)
    })
});

scene.action('ALL', (ctx) => {
  const where = {
    userId: ctx.callbackQuery.from.id,
    type: 1
  }
  ctx.scene.leave()
  return getTotal(where)
    .then((result) => {
      ctx.reply('Всего приход: ' + result)
      where.type = 0
      return getTotal(where)
    })
    .then((result) => {
      ctx.reply('Всего расход: ' + result)
    })
});

export default scene
