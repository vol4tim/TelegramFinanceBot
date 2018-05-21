import Telegraf from 'telegraf'
import WizardScene from 'telegraf/scenes/wizard'
import Finance from '../models/finance'

const getTotal = (where) => {
  return Finance.sum('sum', { where }).then((r) => r || 0)
}

const scene = new WizardScene('total',
  (ctx) => {
    ctx.scene.state.userId = ctx.message.from.id
    ctx.scene.state.currency = 'RUB'
    ctx.reply('Укажите валюту',
      Telegraf.Markup.inlineKeyboard([
        Telegraf.Markup.callbackButton('Пропустить', 'NEXT'),
      ]).extra()
    );
    return ctx.wizard.next()
  },
  (ctx) => {
    if (ctx.message) {
      ctx.scene.state.currency = ctx.message.text.toUpperCase()
    }
    ctx.reply('Укажите категорию',
      Telegraf.Markup.inlineKeyboard([
        Telegraf.Markup.switchToCurrentChatButton('Выбрать категорию', ''),
        Telegraf.Markup.callbackButton('Все категории', 'NEXT'),
      ]).extra()
    );
    return ctx.wizard.next()
  },
  (ctx) => {
    const where = {
      userId: ctx.scene.state.userId,
      currency: ctx.scene.state.currency,
      type: 1
    }
    if (ctx.message) {
      where.category = ctx.message.text
    }
    getTotal(where)
      .then((result) => {
        ctx.reply('Всего приход: ' + result.toFixed(2) + ' ' + where.currency)
        where.type = 0
        return getTotal(where)
      })
      .then((result) => {
        ctx.reply('Всего расход: ' + result.toFixed(2) + ' ' + where.currency)
      })
    return ctx.scene.leave()
  }
)
scene.action('NEXT', (ctx) => {
  return ctx.wizard.steps[ctx.wizard.cursor](ctx)
})

scene.command('cancel', (ctx) => {
  ctx.reply('Canceled');
  return ctx.scene.leave()
})

export default scene
