import Telegraf from 'telegraf'

const TOKEN = process.env.TOKEN_BOT || '';

const bot = new Telegraf(TOKEN)

export default bot
