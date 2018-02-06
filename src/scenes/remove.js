import Scene from 'telegraf/scenes/base'
import Finance from '../models/finance'

const scene = new Scene('remove')
scene.enter((ctx) => {
  ctx.reply('Укажите id удаляемой записи');
});

scene.on('text', (ctx) => {
  const id = ctx.message.text;
  const userId = ctx.message.from.id
  Finance.destroy({ where: { userId, id } })
    .then((count) => {
      if (count === 1) {
        ctx.reply('Запись удалена');
      }
    })
    .catch((e) => {
      ctx.reply('Что то не так');
      console.log(e);
    })
  ctx.scene.leave()
});

export default scene
