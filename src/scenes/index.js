import Stage from 'telegraf/stage'
import balance from './balance'
import add from './add'
import sub from './sub'
import history from './history'
import total from './total'
import remove from './remove'

const stage = new Stage()

stage.register(balance)
stage.register(add)
stage.register(sub)
stage.register(history)
stage.register(total)
stage.register(remove)

export default stage.middleware()
