const axios = require('axios')
const dotenv = require('dotenv')
const url = require('url')
const colors = require('colors')
const figlet = require('figlet')

const ABBYEndpointURL = 'https://developers.lingvolive.com/api/v1/Minicard'
const ABBYAuthEndpointURL = 'https://developers.lingvolive.com/api/v1.1'
const SystranEndpointURL = 'https://api-platform.systran.net/translation/text/translate'   
const YandexEndpointURL = 'https://dictionary.yandex.net/api/v1/dicservice.json/lookup' 
const GlosbeEndpointUrl = 'https://glosbe.com/gapi/translate'
const OpenThesaurusEndpointUrl = 'https://www.openthesaurus.de/synonyme/search'

const word = process.argv[2]
const textColors = ['gray', 'white']
let textColorsIndex = 0

const applyStyle = (text1, text2) => {
    console.log((text1.underline + text2)[textColors[textColorsIndex%2]])    
    textColorsIndex++
}

const lookupABBY = async (key) => {

    const ABBYAuth = axios.create({
        baseURL: ABBYAuthEndpointURL,
        headers: {
            "Authorization": `Basic ${key}`
        }
    })

    const token = await ABBYAuth.post('/authenticate')

    const agent = axios.create({
        baseURL: ABBYEndpointURL,
        headers: {
            "Authorization": `Bearer ${token.data}`
        }
    })

    const uri = url.format({
        query: {
            text: word,
            srcLang: 1031,
            dstLang: 1049       
        }
    })

    const response = await agent.get(uri)
        .catch(error => applyStyle('/// ABBY ', error))
    if (response && response.data.Translation.Translation) {
        const translation = response.data.Translation.Translation
        applyStyle('/// ABBYTranslation ', translation)
    }    

}

const lookupSystran = async (key) => {

    const uri = url.format({
        pathname: SystranEndpointURL,
        query: {
            key: key,
            input: word,
            target: 'en',
            source: 'de'
        }
    })

    const response = await axios.get(uri)
        .catch(error => applyStyle('/// SystranTrans ', error))
    if (response && response.data.outputs.length>0) {
        const translation = response.data.outputs[0].output
        applyStyle('/// SystranTranslation ', translation)
    }

}

const lookupYandex = async (key) => {

    const uri = url.format({
        pathname: YandexEndpointURL,
        query: {
            key: key,
            text: word,
            lang: 'de-en'
        }
    })

    const response = await axios.get(uri)
        .catch(error => applyStyle('/// Yandex ', error))
    if (response && response.data.def.length>0) {
        const translation = response.data.def[0].tr[0].text
        applyStyle('/// YandexTranslation ', translation)
    }

}

const lookupGlosbe = async () => {

    const uri = url.format({
        pathname: GlosbeEndpointUrl, 
        query: {
            from: 'deu',
            dest: 'eng',
            format: 'json',
            phrase: word,
            pretty: true
        }
    })

    const response = await axios.get(uri)
        .catch(error => applyStyle('/// GlosbeTrans '.underline, error))
    if (response && response.data.tuc.length>0) {
        const translation = response.data.tuc[0].phrase.text
        applyStyle('/// GlosbeTranslation ', translation)
    }

}

const lookupOpenThesaurus = async () => {

    const uri = url.format({
        pathname: OpenThesaurusEndpointUrl,
        query: {
            q: word,
            format: 'application/json'
        }
    })

    const response = await axios.get(uri)
        .catch(error => applyStyle('/// OpenThesaurus ', error))
    if (response && response.data.synsets.length>0) {
        const synonims = response.data.synsets[0].terms
        synonims.forEach(syn => applyStyle('/// OpenThesaurusSynonims ', syn.term))
    }

}

const main = async () => {

    process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0
    
    const config = dotenv.config()
    const ABBYKey = process.env.ABBY_KEY
    const SystranKey = process.env.SYSTRAN_KEY
    const YandexKey = process.env.YANDEX_KEY

    let response

    console.log('We are looking for translation of word ')

    figlet(word, function(err, data) {
        if (err) {
            console.log(word).rainbow;
        }
        console.log(data.rainbow)
    })
    
    if (ABBYKey) await lookupABBY(ABBYKey)
    if (SystranKey) await lookupSystran(SystranKey)
    if (YandexKey) await lookupYandex(YandexKey)
    await lookupGlosbe()
    await lookupOpenThesaurus()
    
}

main()
 