const TelegramBot = require("node-telegram-bot-api")
const puppeteer = require("puppeteer")
const AppConfig = require('./config')
const parser = require('./parser')


const conf = {view: {width: 390 , height: 844},
              launch : {headless: 'newupp'}}
const API_KEY_BOT = "6808347523:AAG3pUn2TWaq0nrIKjLk4sVNji9G5xOcLy0"
const bot = new TelegramBot(API_KEY_BOT, {
    polling: {
        interval: 300,
        autoStart: true
    }
})             






const commands = [
    {
        command: "items",
        description: "Поиск курса по предметам"
    },
    {
        command: "help",
        description: "Помощь в использовании"
    },
    /*{
        command: "find_by_platfrom",
        description: "Поиск курса по платформе"
    }*/
]
bot.setMyCommands(commands)
bot.on("polling_error", err => console.log(err.data.error.message));
bot.on("text", async msg => {
    try{
        if (msg.text == "/start"){
            bot.sendMessage(msg.chat.id, 'Категорически приветствую, юный любитель самообразования!\nЭто EdSelectBot, меня создало существо, произосщедшее от обезьян, для поиска полезных курсов.\nВ общем и целом, развлекайся, если тебе что-то не ясно, пиши /help  ')
        }
        else if(msg.text == "/help" ){
            await bot.sendMessage(msg.chat.id, 'Для поиска курсов используй команду /items, выбирай нужный предмет и готово.')
        }
        else if(msg.text == "/items"){
            await bot.sendMessage(msg.chat.id, '<b>Школьные предметы</b>', {
                reply_markup: {
                    inline_keyboard: [
                        [{text: 'Математика 👑', callback_data: 'math'}],
                        [{text: 'Русский язык', callback_data: 'rus'}, {text: 'Литература', callback_data: 'lit'}],
                        [{text: 'Физика', callback_data: 'phis'}, {text: 'Химия', callback_data: 'chem'}],
                        [{text: 'История', callback_data: 'his'}, {text: 'Обществознание', callback_data: 'soc'}],
                        [{text: 'Биология', callback_data: 'bio'}, {text: 'География', callback_data: 'geo'}],
                        [{text: 'Английсикй язык', callback_data: 'en'}],
                        [{text: "Закрыть меню", callback_data: 'close'}]
                    ]
                },
                parse_mode: "HTML",
                reply_to_message_id: msg.message_id
            })
        }else{
            const quote = await parser.getRandomQuote()
            await bot.sendMessage(msg.chat.id, `<b>Отвечать на сообщения меня не научили, но я умею кидать рандомные цитаки. Вот одна из них: </b><i>"${quote}"</i>`, {parse_mode: 'HTML'})
            console.log(msg.chat.id)
        }
    }catch(error){
        console.log(error)
    }

})


bot.on("callback_query", async ctx => {
    try {
        const result = async(request)=>{
            
            bot.sendMessage(ctx.message.chat.id, "Ваш запрос в обработке, подождите пару секунд :)")
            const result = await parser.getAllCoursesInfo(request)
            if (result.length >= 5){
                for (let i = 0; i<5 ;i++){let course = result[i];await bot.sendMessage(ctx.message.chat.id, `${course.title} \n ${course.url}`)}
            }else{
                for (let i = 0; i<result.length ;i++){let course = result[i];await bot.sendMessage(ctx.message.chat.id, `${course.title} \n ${course.url}`)}
            }
            await bot.deleteMessage(ctx.message.chat.id, ctx.message.message_id);
            await bot.sendMessage(ctx.message.chat.id,"Если потребуются ещё курсы то, жми /items")
            
        }
        switch(ctx.data){
            case "close":
                await bot.deleteMessage(ctx.message.chat.id, ctx.message.message_id);
                await bot.deleteMessage(ctx.message.reply_to_message.chat.id, ctx.message.reply_to_message.message_id);
                break;

            case "math":
                await result('математика')
                break;
            case "rus":
                await result('русский')
                break
            case "lit":
                await result('литература')
                break
            case "phis":
                await result('физика')
                break
            case "chem":
                await result('химия')
                break
            case "his":
                await result('история')
                break
            case "soc":
                await result('обществознание экономика право')
                break
            case "bio":
                await result('биология')
                break
            case "geo":
                await result('география')
                break
            case 'en':
                await result('английский')
                break
        }
    }catch(err){
        console.log(err)
    }
})