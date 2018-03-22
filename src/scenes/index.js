import Stage from 'telegraf/stage'
import balance from './balance'
import add from './add'
import sub from './sub'
import view from './view'
import history from './history'
import total from './total'
import remove from './remove'
import csv from './csv'
import sync from './sync'

const stage = new Stage()

stage.register(balance)
stage.register(add)
stage.register(sub)
stage.register(view)
stage.register(history)
stage.register(total)
stage.register(remove)
stage.register(csv)
stage.register(sync)

export default stage.middleware()
