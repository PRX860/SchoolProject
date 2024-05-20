
const puppeteer = require('puppeteer');

/*
const getData = async() => {
    try {
        const responce = await unirest.get('https://stepik.org/catalog/search?q=физика')
        const $ = cheerio.load(responce)
        console.log($('.catalog-rich-card__link-wrapper').text())
    }catch(e){
        console.log(e)
    }
}

getData()

*/
const conf = {view: {width: 390 , height: 844},
              launch : {headless: 'newupp', args: ['--no-sandbox', '--disable-setuid-sandbox']},
             executablePath: '/usr/bin/chromium-browser}

const sleep = duration => new Promise(resolve => setTimeout(resolve, duration));
const scrollDown = async(calls, page) => {
    if (calls > 5){calls = 5}
    let i = 0
    while( i <= calls ){
        await sleep(10);
        await page.mouse.wheel({deltaY: 1080} )
        i++
    }
}
//Алгоритм получения информации о курсах на степике по запросу
const getStepikCoursesInfo = async(request = 'физика') => {
    try{

    
        viewConf = conf.view
        const browser = await puppeteer.launch(conf.launch)
        const page = await browser.newPage()
        await page.setViewport(viewConf)
        await page.goto(`https://stepik.org/catalog/search?q=${request}`)
        await page.waitForSelector('.catalog-block__content')
        await page.waitForSelector('.catalog-rich-card__link-wrapper')
        await scrollDown(1, page)
        await page.waitForSelector('.page-footer')
    
        const result = await page.evaluate(() => {
            let data = []
            const courses = document.querySelectorAll('.course-cards__item')
            for (let course of courses){
                const info = course.querySelector(".course-card__title")
                const title_html = info.innerHTML
                if(title_html == '&nbsp;') {continue}
                else{
                    const title = info.innerText
                    const source = "https://stepik.org"
                    const url = source + info.getAttribute('href')
                    data.push({
                        source: source,
                        title: title,
                        url: url
                    })    
                }       
            }
            if (data == []){
                return []
            }else{return data}
        })
    
        await browser.close()
        return result
    }catch(err){
        console.log('Ошибка при получении данных с Stepik')
        return []
    }
}

const getAcademikaCoursesInfo = async(request = 'физика') => {
    try{
        viewConf = conf.view
        const browser = await puppeteer.launch(conf.launch)
        const page = await browser.newPage()
        await page.setViewport(viewConf)
        await page.goto(`https://academika.ru/catalog?search=${request}`)
        await page.waitForSelector('.courses-layout__content')
        await page.waitForSelector('.cards-list__item')
        await scrollDown(2, page)
        await page.waitForSelector('.ui-footer')
        
        const result = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('.cards-list__item')).map((el) => {
                return {
                    source : 'academika.ru',
                    title : el.querySelector('.ui-product-card__title').innerText,
                    url : el.querySelector('.ui-product-card__link').getAttribute('href'),
                }
            })

        })
        await browser.close()
        return result
    }catch(err){
        console.log('Ошибка при получении данных с Akademika')
        return []
    }
    
}

const getOpenEduCoursesInfo = async(request = 'физика') => {
    
    try{
        viewConf = conf.view
        const browser = await puppeteer.launch(conf.launch)
        const page = await browser.newPage()
        await page.setViewport(viewConf)
        await page.goto(`https://openedu.ru/course/?status=all&q=${request}`)
        await page.waitForSelector('.courses-list')
        await page.waitForSelector('.course')
        await scrollDown(2, page)
        const result = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('.course')).map((el) => {
                return {
                    source : 'openedu.ru',
                    title : el.querySelector('.course-title').innerText,
                    url : `https://openedu.ru` + el.querySelector('.course-title').querySelector('a').getAttribute('href'),
                    //img : el.querySelector('img').getAttribute('src') 
                }
            })
        })
        await browser.close()
        
        return result
    }catch(err){
        console.log('Ошибка при получении данных с OpenEdu')
        return []
    }
}
const getAllCoursesInfo = async(request = 'физика') => {
        //console.log(555)
        const [res1] = await Promise.all([
             getStepikCoursesInfo(request),
             //getAcademikaCoursesInfo(request),
             //getOpenEduCoursesInfo(request),
            //getAcademikaCoursesInfo(request)

        ])
        return res1
        //console.log(res3)
        /*let result = []
        result = result.concat(await getStepikCoursesInfo(request))
        result = result.concat(await getOpenEduCoursesInfo(request))
        result = result.concat(await getAcademikaCoursesInfo(request))
        console.log(result)*/
    

}

/*const imposibleF = async(request='физика') => {
    const [res1, res2, res3, res4, res5] = await Promise.all([
        getAllCoursesInfo(request),
        getAllCoursesInfo(request),
        getAllCoursesInfo(request),
        getAllCoursesInfo(request),
        getAllCoursesInfo(request)
    ])
    return [res1, res2, res3, res4, res5]
}*/
const getRandomQuote = async() =>{
    try{
        viewConf = conf.view
        const browser = await puppeteer.launch(conf.launch)
        const page = await browser.newPage()
        await page.setViewport(viewConf)
        await page.goto('https://citaty.info/random')
        await page.waitForSelector('.field-item')
        const result = await page.evaluate(() => {
            const quote = document.querySelector('.field-item').querySelector('p').innerText
            return quote
        })
        return result
    }catch(err){
        
        return 'Ошибки всегда прощаются, если есть смелость признать их.'
    }
}
const GetWorkTime = async (func, model = false) => {
    const start = new Date().getTime()
    const result = await func()
    const end = new Date().getTime()
    console.log(`Скорость выполнения программы: ${end - start} ms`)
    if(model) {console.log(result)}
}

//getAllCoursesInfo()
//GetWorkTime(imposibleF, model = true)
//GetWorkTime(getStepikCoursesInfo, model = true)
//GetWorkTime(getAcademikaCoursesInfo, model=true)
//GetWorkTime(getOpenEduCoursesInfo, model = true)

/*(async () => {
    //await getOpenEduCoursesInfo('математика')
    console.log(await getStepikCoursesInfo())
})();*/

/*

(async () => {
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage()

    await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1');
    await page.setViewport({ width: 375, height: 812 });

    await page.goto('https://stepik.org/catalog/search?q=физика');
    await page.waitForSelector('title')
    const title = await page.title();
    console.info(`The title is: ${title}`)
    await browser.close()
})();*/
module.exports = {
    getAllCoursesInfo,
    getRandomQuote,
}
