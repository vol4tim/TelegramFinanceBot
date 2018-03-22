import Telegraf from 'telegraf'
import WizardScene from 'telegraf/scenes/wizard'
import Finance from '../models/finance'

const scene = new WizardScene('balance',
  (ctx) => {
    ctx.reply('Укажите валюту',
      Telegraf.Markup.inlineKeyboard([
        Telegraf.Markup.callbackButton('Пропустить', 'NEXT'),
        Telegraf.Markup.callbackButton('Cancel', 'CANCEL'),
      ]).extra()
    );
    return ctx.wizard.next()
  },
  (ctx) => {
    let currency = 'RUB'
    if (ctx.message) {
      currency = ctx.message.text.toUpperCase()
    }
    let add = 0
    let sub = 0
    Finance.sum('sum', { where: { userId: ctx.from.id, currency, type: 1 } })
      .then((r) => r || 0)
      .then((r) => {
        add = r
        return Finance.sum('sum', { where: { userId: ctx.from.id, currency, type: 0 } })
      })
      .then((r) => r || 0)
      .then((r) => {
        sub = r
        ctx.reply('Ваш баланс: ' + (add - sub).toFixed(2) + ' ' + currency)
      })
    return ctx.scene.leave()
  }
)
scene.action('NEXT', (ctx) => {
  return ctx.wizard.steps[ctx.wizard.cursor](ctx)
})
scene.action('CANCEL', (ctx) => {
  ctx.editMessageText('Canceled');
  return ctx.scene.leave()
})

export default scene
