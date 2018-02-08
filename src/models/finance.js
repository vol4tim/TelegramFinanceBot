import db from './db'
import Files from './files'

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
  comment: {
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
Finance.belongsTo(Files, {foreignKey: 'fileId'});

export default Finance
