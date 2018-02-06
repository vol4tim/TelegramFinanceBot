import db from './db'

const Finance = db.sequelize.define('finance', {
  userId: {
    type: db.Sequelize.STRING
  },
  sum: {
    type: db.Sequelize.INTEGER,
    defaultValue: 0
  },
  category: {
    type: db.Sequelize.STRING,
    defaultValue: ''
  },
  type: {
    type: db.Sequelize.INTEGER,
    defaultValue: 0
  },
  fileId: {
    type: db.Sequelize.INTEGER,
    defaultValue: 0
  }
})

export default Finance
