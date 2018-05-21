import Scene from 'telegraf/scenes/base'
import { financeDel } from '../utils'

const scene = new Scene('remove')
scene.enter((ctx) => {
  ctx.reply('Укажите id удаляемой записи');
});

scene.hears(/^\d+$/gi, (ctx) => {
  const id = ctx.message.text;
  const userId = ctx.message.from.id
  ctx.scene.leave()
  return financeDel(userId, id)
    .then((count) => {
      if (count === 1) {
        ctx.reply('Запись удалена');
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
