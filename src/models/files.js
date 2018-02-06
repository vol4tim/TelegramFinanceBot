import db from './db'

const Files = db.sequelize.define('files', {
  userId: {
    type: db.Sequelize.STRING
  },
  messageId: {
    type: db.Sequelize.INTEGER
  },
  file: {
    type: db.Sequelize.STRING
  }
})

export default Files
