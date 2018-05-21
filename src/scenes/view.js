import Scene from 'telegraf/scenes/base'
import moment from 'moment'
import Finance from '../models/finance'
import Files from '../models/files'

const scene = new Scene('view')
scene.enter((ctx) => {
  ctx.reply('Укажите id записи');
});

scene.hears(/^\d+$/gi, (ctx) => {
  const id = ctx.message.text;
  const userId = ctx.message.from.id
  ctx.scene.leave()
  return Finance.findOne({ where: { userId, id } })
    .then((row) => {
      if (row !== null) {
        const message = "ID: " + row.id + "\n"
          + "Тип: " + ((row.type == 1) ? "приход" : "расход") + "\n"
          + "Сумма: " + row.sum +  '' + row.currency + "\n"
          + "Дата: " + moment(new Date(row.createdAt)).format("DD.MM.YYYY HH:mm") + "\n"
          + ((row.comment) ? "Комментарий: " + row.comment : "")
        ctx.reply(message);
        if (row.fileId > 0) {
          Files.findOne({ where: { id: row.fileId } })
            .then((f) => {
              return ctx.replyWithPhoto(f.tFileId)
            })
        }
      } else {
        ctx.reply('Запись не найдена');
      }
    })
    .catch((e) => {
      ctx.reply('Что то не так');
      console.log(e);
    })
});

scene.command('cancel', (ctx) => {
  ctx.reply('Canceled');
  return ctx.scene.leave()
})

export default scene
