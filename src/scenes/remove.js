import Scene from 'telegraf/scenes/base'
import Finance from '../models/finance'
import User from '../models/user'

const scene = new Scene('remove')
scene.enter((ctx) => {
  ctx.reply('Укажите id удаляемой записи');
});

scene.on('text', (ctx) => {
  const id = ctx.message.text;
  const userId = ctx.message.from.id
  let entity
  ctx.scene.leave()
  return Finance.findOne({ where: { userId, id } })
    .then((row) => {
      if (row !== null) {
        entity = row
        return Finance.destroy({ where: { userId, id } })
      }
      return false
    })
    .then((count) => {
      if (count === 1) {
        ctx.reply('Запись удалена');
        if (entity.type == 1) {
          User.increment({ balance: -entity.sum }, { where: { userId } })
        } else {
          User.increment({ balance: entity.sum }, { where: { userId } })
        }
      }
    })
    .catch((e) => {
      ctx.reply('Что то не так');
      console.log(e);
    })
});

export default scene
