import Sequelize from 'sequelize'
import { PATH_DB } from '../config'

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: PATH_DB,
  logging: false
});

const db = {}
db.Sequelize = Sequelize
db.sequelize = sequelize
db.model = {}
// db.model['user'] = sequelize.import(path.join(__dirname, 'user'));

export default db
