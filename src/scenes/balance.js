import Scene from 'telegraf/scenes/base'
import User from '../models/user'

const scene = new Scene('balance')
scene.enter((ctx) => {
  User.findOne({ where: { userId: ctx.from.id } })
    .then((user) => {
      if (user === null) {
        ctx.reply('Учетная запись не найденна');
      } else {
        ctx.reply('Ваш баланс: ' + user.balance);
      }
    })
  ctx.scene.leave()
});

export default scene
