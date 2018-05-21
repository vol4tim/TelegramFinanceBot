import Scene from 'telegraf/scenes/base'
import Finance from '../models/finance'
import db from '../models/db'

const scene = new Scene('balance')
scene.enter((ctx) => {
  let adds = 0
  Finance.findAll({
    attributes: [[db.Sequelize.fn('SUM', db.Sequelize.col('sum')), 'sum'], 'currency'],
    where: { userId: ctx.from.id, type: 1 },
    group: ['currency']
  })
    .then((rows) => {
      adds = rows
      return Finance.findAll({
        attributes: [[db.Sequelize.fn('SUM', db.Sequelize.col('sum')), 'sum'], 'currency'],
        where: { userId: ctx.from.id, type: 0 },
        group: ['currency']
      })
    })
    .then((rows) => {
      const msg = ['Ваш баланс:']
      adds.forEach((add) => {
        rows.forEach((sub) => {
          if (sub.currency === add.currency) {
            msg.push((add.sum - sub.sum).toFixed(2) + ' ' + add.currency)
          }
        })
      })
      ctx.reply(msg.join("\n"))
    })
  return ctx.scene.leave()
});

export default scene
