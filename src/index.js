import Telegraf from 'telegraf'
import session from 'telegraf/session'
import bot from './bot'
import db from './models/db'
import scenes from './scenes'
import User from './models/user'
import _ from 'lodash'
import Finance from './models/finance'

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
  bot.command('csv', (ctx) => ctx.scene.enter('csv'))

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

  function getCategory(ctx) {
    if (!ctx.inlineQuery.query) {
      return ctx.answerInlineQuery([{
        type: 'article',
        title: 'Начните вводить название...',
        id: ctx.inlineQuery.id,
        input_message_content: {
          message_text: 'Начните вводить название...',
        },
      }]);
    }

    const query = ctx.inlineQuery.query
    const where = {
      userId: ctx.inlineQuery.from.id,
      category: {
        [db.Sequelize.Op.like]: query +'%'
      }
    }

    return Finance.findAll({ where })
      .then((rows) => {
        const res = []
        _.forEach(rows, (row) => {
          res.push({
            type: 'article',
            id: String(row.id),
            title: row.category,
            input_message_content: {
              message_text: row.category
            },
          })
        })
        return res
      })
      .then((res) => {
        ctx.answerInlineQuery(res);
      })
  }

  bot.on('inline_query', (ctx) => {
    return getCategory(ctx);
  });
}

db.sequelize.sync()
  .then(() => {
    runApp()
    bot.startPolling()
  })
  .catch((e) => {
    console.log(e);
  })
