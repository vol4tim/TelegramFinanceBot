import Telegraf from 'telegraf'

const TOKEN = process.env.TOKEN_BOT || '384700289:AAGBuoTooCUPdXzMsc9naI16KtQD9Fw9LnE';

const bot = new Telegraf(TOKEN)

export default bot
