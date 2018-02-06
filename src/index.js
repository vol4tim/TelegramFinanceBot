import Telegraf from 'telegraf'
import session from 'telegraf/session'
import bot from './bot'
import db from './models/db'
import scenes from './scenes'
import User from './models/user'

const runApp = () => {
  // bot.use(Telegraf.log())
  bot.use(session())
  bot.use(scenes);

  bot.command('balance', (ctx) => ctx.scene.enter('balance'))
  bot.command('add', (ctx) => ctx.scene.enter('add'))
  bot.command('sub', (ctx) => ctx.scene.enter('sub'))
  bot.command('history', (ctx) => ctx.scene.enter('history'))
  bot.command('total', (ctx) => ctx.scene.enter('total'))
  bot.command('remove', (ctx) => ctx.scene.enter('remove'))

  bot.action('CANCEL', (ctx) => {
    ctx.scene.leave();
    ctx.editMessageText('Canceled');
  });

  const GLOBAL_KEYBOARD = Telegraf.Markup.keyboard([['Приход', 'Расход']]).resize().extra();

  bot.start((ctx) => {
    User.findOne({ where: { userId: ctx.from.id } })
      .then((user) => {
        if (user === null) {
          User.create({ userId: ctx.from.id, username: ctx.from.username })
          return null
        }
        return user
      })
    return ctx.reply('Welcome!', GLOBAL_KEYBOARD)
  })

  bot.hears('Приход', ctx => ctx.scene.enter('add'));
  bot.hears('Расход', ctx => ctx.scene.enter('sub'));
}

db.sequelize.sync()
  .then(() => {
    runApp()
    bot.startPolling()
  })
  .catch((e) => {
    console.log(e);
  })
