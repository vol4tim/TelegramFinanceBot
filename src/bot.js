import Telegraf from 'telegraf'

const TOKEN = process.env.TOKEN_BOT || '384700289:AAF3SxDCjk5Zl_LAxVBnzT1D4kiBMw_28u0';

const bot = new Telegraf(TOKEN)

export default bot
