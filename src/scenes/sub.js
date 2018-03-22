import https from 'https'
import fs from 'fs'
import path from 'path'
import Telegraf from 'telegraf'
import WizardScene from 'telegraf/scenes/wizard'
import Promise from 'bluebird'
import { PATH_IMG } from '../config'
import Files from '../models/files'
import { financeAdd } from '../utils'

const fileDownload = (url) => {
  return new Promise((resolve, reject) => {
    const fileName = path.basename(url)
    const file = fs.createWriteStream(PATH_IMG + '/' + fileName);
    https.get(url, function(response) {
      response.pipe(file);
      file.on('finish', function() {
        resolve(PATH_IMG + '/' + fileName)
        // file.close(cb);
      });
    })
      .on('error', function(err) {
        fs.unlink(PATH_IMG + '/' + fileName);
        reject(err)
      });
  })
}

const scene = new WizardScene('sub',
  (ctx) => {
    ctx.scene.state.sum = 0
    ctx.scene.state.category = ''
    ctx.scene.state.comment = ''
    ctx.scene.state.img = ''
    ctx.reply('Укажите сумму расхода',
      Telegraf.Markup.inlineKeyboard([
        Telegraf.Markup.callbackButton('Cancel', 'CANCEL'),
      ]).extra()
    );
    return ctx.wizard.next()
  },
  (ctx) => {
    if (ctx.message) {
      const result = ctx.message.text.split(' ')
      ctx.scene.state.sum = Number(result[0])
      ctx.scene.state.currency = (result.length > 1) ? result[1].toUpperCase() : 'RUB'
    }
    ctx.reply('Укажите категорию',
      Telegraf.Markup.inlineKeyboard([
        Telegraf.Markup.callbackButton('Пропустить', 'NEXT'),
        Telegraf.Markup.callbackButton('Cancel', 'CANCEL'),
      ]).extra()
    );
    return ctx.wizard.next()
  },
  (ctx) => {
    if (ctx.message) {
      ctx.scene.state.category = ctx.message.text
    }
    ctx.reply('Укажите комментарий',
      Telegraf.Markup.inlineKeyboard([
        Telegraf.Markup.callbackButton('Пропустить', 'NEXT'),
        Telegraf.Markup.callbackButton('Cancel', 'CANCEL'),
      ]).extra()
    );
    return ctx.wizard.next()
  },
  (ctx) => {
    if (ctx.message) {
      ctx.scene.state.comment = ctx.message.text
    }
    ctx.reply('Приложите фото чека',
      Telegraf.Markup.inlineKeyboard([
        Telegraf.Markup.callbackButton('Пропустить', 'NEXT'),
        Telegraf.Markup.callbackButton('Cancel', 'CANCEL'),
      ]).extra()
    );
    return ctx.wizard.next()
  },
  (ctx) => {
    const { sum, currency, category, comment } = ctx.scene.state
    if (ctx.message) {
      const userId = ctx.message.from.id
      ctx.telegram.getFileLink( ctx.message.photo[ctx.message.photo.length-1].file_id )
        .then((link) => fileDownload(link))
        .then((file) => {
          return Files.create({ userId, messageId: ctx.message.message_id, file: path.basename(file) })
        })
        .then((file) => {
          financeAdd(userId, 0, sum, currency, category, comment, file.id)
        })
    } else if (ctx.callbackQuery) {
      const userId = ctx.callbackQuery.from.id
      financeAdd(userId, 0, sum, currency, category, comment, null)
    }
    ctx.reply('Done')
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
