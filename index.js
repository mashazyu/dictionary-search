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

const main = async () => {

    process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0
    
    const config = dotenv.config()
    const ABBYKey = process.env.ABBY_KEY
    const SystranKey = process.env.SYSTRAN_KEY
    const YandexKey = process.env.YANDEX_KEY

    if (YandexKey===undefined || SystranKey=== undefined || ABBYKey) {
        console.log('Please add ABBYKey, SystranKey, YandexKey variables to your environment.')
        return
    }

    let response

    console.log('We are looking for translation of word ')

    figlet(word, function(err, data) {
        if (err) {
            console.log(word);
        }
        console.log(data.rainbow)
    })
    
    const ABBYAuth = axios.create({
        baseURL: ABBYAuthEndpointURL,
        headers: {
            "Authorization": `Basic ${ABBYKey}`
        }
    })

    const ABBYToken = await ABBYAuth.post('/authenticate')

    const ABBYAgent = axios.create({
        baseURL: ABBYEndpointURL,
        headers: {
            "Authorization": `Bearer ${ABBYToken.data}`
        }
    })

    const ABBYUri = url.format({
        query: {
            text: word,
            srcLang: 1031,
            dstLang: 1049       
        }
    })

    response = await ABBYAgent.get(ABBYUri)
        .catch(error => applyStyle('/// ABBY ', error))
    if (response && response.data.Translation.Translation) {
        const ABBYTranslation = response.data.Translation.Translation
        applyStyle('/// ABBYTranslation ', ABBYTranslation)
    }

    const SystranURI = url.format({
        pathname: SystranEndpointURL,
        query: {
            key: SystranKey,
            input: word,
            target: 'en',
            source: 'de'
        }
    })

    response = await axios.get(SystranURI)
        .catch(error => applyStyle('/// SystranTrans ', error))
    if (response && response.data.outputs.length>0) {
        const SystranTranslation = response.data.outputs[0].output
        applyStyle('/// SystranTranslation ', SystranTranslation)
    }

    const YandexURI = url.format({
        pathname: YandexEndpointURL,
        query: {
            key: YandexKey,
            text: word,
            lang: 'de-en'
        }
    })

    response = await axios.get(YandexURI)
        .catch(error => applyStyle('/// Yandex ', error))
    if (response && response.data.def.length>0) {
        const YandexTranslation = response.data.def[0].tr[0].text
        applyStyle('/// YandexTranslation ', YandexTranslation)
    }

    const GlosbeUri = url.format({
        pathname: GlosbeEndpointUrl, 
        query: {
            from: 'deu',
            dest: 'eng',
            format: 'json',
            phrase: word,
            pretty: true
        }
    })

    response = await axios.get(GlosbeUri)
        .catch(error => applyStyle('/// GlosbeTrans '.underline, error))
    if (response && response.data.tuc.length>0) {
        const GlosbeTranslation = response.data.tuc[0].phrase.text
        applyStyle('/// GlosbeTranslation ', GlosbeTranslation)
    }

    const OpenThesaurusUri = url.format({
        pathname: OpenThesaurusEndpointUrl,
        query: {
            q: word,
            format: 'application/json'
        }
    })

    response = await axios.get(OpenThesaurusUri)
        .catch(error => applyStyle('/// OpenThesaurus ', error))
    if (response && response.data.synsets.length>0) {
        const OpenThesaurusSynonims = response.data.synsets[0].terms
        OpenThesaurusSynonims.forEach(syn => applyStyle('/// OpenThesaurusSynonims ', syn.term))
    }
    
}

 
main()
 