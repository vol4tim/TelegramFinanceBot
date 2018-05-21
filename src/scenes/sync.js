import Scene from 'telegraf/scenes/base'
import { syncUser } from '../utils'

const scene = new Scene('sync')
scene.enter((ctx) => {
  return syncUser(ctx.message.from.id)
    .then(() => {
      ctx.reply('Синхронизация завершена');
    })
});

export default scene
