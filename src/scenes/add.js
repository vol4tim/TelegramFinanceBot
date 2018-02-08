import https from 'https'
import fs from 'fs'
import path from 'path'
import Telegraf from 'telegraf'
import WizardScene from 'telegraf/scenes/wizard'
import Promise from 'bluebird'
import { PATH_IMG } from '../config'
import Finance from '../models/finance'
import Files from '../models/files'
import User from '../models/user'

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

const scene = new WizardScene('add',
  (ctx) => {
    ctx.scene.state.sum = 0
    ctx.scene.state.category = ''
    ctx.scene.state.comment = ''
    ctx.scene.state.img = ''
    ctx.reply('Укажите сумму прихода',
      Telegraf.Markup.inlineKeyboard([
        Telegraf.Markup.callbackButton('Cancel', 'CANCEL'),
      ]).extra()
    );
    return ctx.wizard.next()
  },
  (ctx) => {
    if (ctx.message) {
      ctx.scene.state.sum = Number(ctx.message.text)
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
    const { sum, category, comment } = ctx.scene.state
    if (ctx.message) {
      const userId = ctx.message.from.id
      const tFileId = ctx.message.photo[ctx.message.photo.length-1].file_id
      ctx.telegram.getFileLink(tFileId)
        .then((link) => fileDownload(link))
        .then((file) => {
          return Files.create({ userId, messageId: ctx.message.message_id, tFileId, file: path.basename(file) })
        })
        .then((file) => {
          Finance.create({ userId, type: 1, sum, category, comment, fileId: file.id })
            .then(() => {
              User.increment({ balance: sum }, { where: { userId } })
            })
        })
    } else if (ctx.callbackQuery) {
      const userId = ctx.callbackQuery.from.id
      Finance.create({ userId, type: 1, sum, category, comment })
        .then(() => {
          User.increment({ balance: sum }, { where: { userId } })
        })
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
