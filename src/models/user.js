import db from './db'

const User = db.sequelize.define('user', {
  userId: {
    type: db.Sequelize.STRING,
    unique: true
  },
  username: {
    type: db.Sequelize.STRING,
    unique: true
  },
  balance: {
    type: db.Sequelize.INTEGER,
    defaultValue: 0
  }
})

export default User
