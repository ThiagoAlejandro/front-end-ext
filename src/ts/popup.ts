import './controllers/scraper'
//import '../sass/index.scss'
import constants from './constant'
//import '../sass/spinner.scss'
import WorldWhiteWebClient, { Language } from 'www-client-js'
// import { Console } from 'console'
//import { Console } from 'console'
const client = new WorldWhiteWebClient(process.env.API_URL)
// import tuit from './tuit'


// interface SelectProtected {
//   readonly submitButtonElement: HTMLButtonElement;
// }


window.addEventListener('load', function load () {
  document.getElementById('submitButton').onclick= getCredibility
  document.getElementById('VerifyPageButtonScraperTW').onclick = ValidateTwitterTweetsScrapper
  document.getElementById('VerifyPageButtonTwitterApi').onclick = ValidateTwitterTweets
  document.getElementById('VerifyPageButtonScraperFB').onclick = ValidateFacebookScraper
})

function saveTransactionObj(TransactionObj: any){
  fetch('http://localhost:8080/calculate/usuario',{
    method: 'POST',
    headers:{
      'Content-Type':'text/html',
    },
    body: (TransactionObj),
  })
} 


document.addEventListener('DOMContentLoaded', function () {
  chrome.storage.sync.get([
    constants.WEIGHT_SPAM, constants.WEIGHT_BAD_WORDS, constants.WEIGHT_MISSPELLING,
    constants.WEIGHT_TEXT, constants.WEIGHT_USER, constants.WEIGHT_SOCIAL,
    constants.MAX_FOLLOWERS], function (filterOptions) {
    if (!filterOptions.weightSpam) {
      chrome.storage.sync.set({ weightSpam: 0.44 })
      chrome.storage.sync.set({ weightBadWords: 0.33 })
      chrome.storage.sync.set({ weightMisspelling: 0.23 })
      chrome.storage.sync.set({ weightText: 0.34 })
      chrome.storage.sync.set({ weightUser: 0.33 })
      chrome.storage.sync.set({ weightSocial: 0.33 })
      chrome.storage.sync.set({ maxFollowers: 2000000 })
    }
  })
  chrome.tabs.getSelected(null, function (tab) {
    const tabUrl = tab.url
    const elem = document.querySelector('#PageSensitiveButtons')
    const elemSCRTW = document.querySelector('#VerifyPageButtonScraperTW')
    const elemFB = document.querySelector('#PageSensitiveButtonsFB')
    const tuits = document.querySelector('#usrform1')

    const currentPage = <HTMLHeadingElement>document.querySelector('#currentPage')
    const usertuit = <HTMLHeadElement>document.querySelector('#usertuit')
    // const usertuit1 = <HTMLHeadElement>document.querySelector('#usertuit1')

    if (tabUrl.includes('https://twitter.com')) {
      currentPage.innerText = 'You are currently on Twitter'
      elemFB.parentNode.removeChild(elemFB) 
      if (tabUrl.includes('/home')){
        elemSCRTW.parentNode.removeChild(elemSCRTW)
        tuits.parentNode.removeChild(tuits)
      }
      else{
        elemSCRTW.parentNode.removeChild(elemSCRTW)
        const usernow = tabUrl.toString().split('https://twitter.com/',2).toString().replace(',','')
        usertuit.innerText = usernow
               
        
      }
    } else if (tabUrl.includes('https://www.facebook.com')) {
      currentPage.innerText = 'You are currently on Facebook'
      elem.parentNode.removeChild(elem)
      tuits.parentNode.removeChild(tuits)
    } else {
      document.querySelector('#firstHorBar').parentNode.removeChild(document.querySelector('#firstHorBar'))
      document.querySelector('#secondHorBar').parentNode.removeChild(document.querySelector('#secondHorBar'))
      elem.parentNode.removeChild(elem)
      elemFB.parentNode.removeChild(elemFB)
      tuits.parentNode.removeChild(tuits)
    }
  })
})

function getCredibility (): void {
  showSpinner()
  // Send Message asking for the scaped values
  chrome.tabs.query({ active: true, currentWindow: true    }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { sender: 'www', instruction: 'scrap' }, function () {
      const tweet = <HTMLTextAreaElement>document.querySelector('#text')
      chrome.storage.sync.get([
        constants.WEIGHT_SPAM, constants.WEIGHT_BAD_WORDS,
        constants.WEIGHT_MISSPELLING], function (filterOptions) {
        const e = <HTMLSelectElement>document.getElementById('language')
        var lang : Language = getLanguage(e.options[e.selectedIndex].value)
        client.getPlainTextCredibility(
          {weightBadWords: filterOptions.weightBadWords,
            weightMisspelling: filterOptions.weightMisspelling,
            weightSpam: filterOptions.weightSpam},
          {text: tweet.value,
            lang: lang })
          .then(function (credibility : { credibility: number }) {
            const credibilityText  =  <HTMLParagraphElement>document.querySelector('#credibility')
            credibilityText.innerText = credibility.credibility.toFixed(2) + '%'
            hideSpinner()
          }).catch(e => {
            hideSpinner()
            console.log(e)})
      })
    })
  })
}






function ValidateTwitterTweets () {
  showSpinner()
  var x = document.getElementById('usrform1')
  var y = document.getElementById('usrform0')
  if (x.style.display === 'none') {
    x.style.display = 'block'
    y.style.display = 'none'
  } else {
    x.style.display = 'none'
    y.style.display = 'block' 
  }

  // Send Message asking for the scaped values
  chrome.tabs.executeScript(null, {
    file: 'popup.bundle.js' }, () => {
    connect(1)
  })
}

function ValidateTwitterTweetsScrapper () {
  showSpinner()
  chrome.tabs.executeScript(null, {
    file: 'popup.bundle.js' }, () => {
    connect(2)
  })
}

function ValidateFacebookScraper () {
  showSpinner()
  chrome.tabs.executeScript(null, {
    file: 'popup.bundle.js' }, () => {
    connect(3)
  })
}

function connect (method: number) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const port = chrome.tabs.connect(tabs[0].id)
    if (method === 1) {
      port.postMessage({ sender: 'www', instruction: 'api' })
    } else if (method === 2) {
      port.postMessage({ sender: 'www', instruction: 'scrapTW' })
    } else if (method === 3) {
      port.postMessage({ sender: 'www', instruction: 'scrapFB' })
    }
    port.onMessage.addListener((response) => {
      chrome.storage.sync.get([
        constants.WEIGHT_SPAM, constants.WEIGHT_BAD_WORDS, constants.WEIGHT_MISSPELLING,
        constants.WEIGHT_TEXT, constants.WEIGHT_USER, constants.WEIGHT_SOCIAL,
        constants.MAX_FOLLOWERS], function (filterOptions) {

          


        if (response.instruction === 'api') {

          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          let promiseList : Promise<{credibility : number}>[] = response.tweetIds.map((tweetId: number) => client.getTweetCredibility(
            tweetId.toString(),
            //'1450888371727966208',
            { weightBadWords: +filterOptions.weightBadWords,
              weightMisspelling: +filterOptions.weightMisspelling,
              weightSpam: +filterOptions.weightSpam,
              weightText: +filterOptions.weightText,
              weightSocial: +filterOptions.weightSocial,
              weightUser: +filterOptions.weightUser 
            },
            +filterOptions.maxFollowers))

            
          let TransactionObj = 'ingomoranv'
          saveTransactionObj(TransactionObj)
         
  
          /*         
         // console.time('constants.DEBUG_REQUEST_TIME_LABEL')
          Promise.all(promiseList)
            .then(values => {
        //      console.timeEnd('constants.DEBUG_REQUEST_TIME_LABEL')
              port.postMessage({

                sender: 'www',
                instruction: 'update',
                credList: values.map(credibility => credibility.credibility)
                
              })  
              
            })  
*/
          // esto si funciona
          showSpinner()
          // Send Message asking for the scaped values
          chrome.tabs.query({ active: true, currentWindow: true    }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { sender: 'www', instruction: 'scrap' }, function () {
                  
              const area = document.getElementById('myDIV') as HTMLTextAreaElement
              area.value = 'Debido a los fuertes vientos esta cascada "fluye" hacia arriba.'
              const tweet = area.value
              const area1 = document.getElementById('myDIV1') as HTMLTextAreaElement
              area1.value = 'Yaaaaa llego mi nave humanos! 😎😎'
              const tweet1 = area1.value
              const area2 = document.getElementById('myDIV2') as HTMLTextAreaElement
              area2.value = '❤️❤️❤️'
              const tweet2 = area2.value

              chrome.storage.sync.get([
                constants.WEIGHT_SPAM, constants.WEIGHT_BAD_WORDS,
                constants.WEIGHT_MISSPELLING], function (filterOptions) {
                const Language = <HTMLSelectElement>document.getElementById('language')//aca lee idioma
                var lang : Language = 'es'
                client.getPlainTextCredibility(
                  {weightBadWords: filterOptions.weightBadWords,
                    weightMisspelling: filterOptions.weightMisspelling,
                    weightSpam: filterOptions.weightSpam},
                  {text: tweet, 
                    lang: lang })
                  .then(function (credibility1 : { credibility: number }) {
                    const credibilityText1  =  <HTMLParagraphElement>document.querySelector('#credibility1')
                    credibilityText1.innerText = credibility1.credibility.toFixed(2) + '%'
                    const credibilityText2  =  <HTMLParagraphElement>document.querySelector('#newcred1')
                    credibilityText2.innerText = credibility1.credibility.toFixed(2) + '%'
                    hideSpinner()
                  }).catch(e => {
                    hideSpinner()
                    console.log(e)})
                client.getPlainTextCredibility(
                  {weightBadWords: filterOptions.weightBadWords,
                    weightMisspelling: filterOptions.weightMisspelling,
                    weightSpam: filterOptions.weightSpam},
                  {text: tweet1, 
                    lang: lang })
                  .then(function (credibility2 : { credibility: number }) {
                    const credibilityText3  =  <HTMLParagraphElement>document.querySelector('#credibility2')
                    credibilityText3.innerText = credibility2.credibility.toFixed(2) + '%'
                    const credibilityText4  =  <HTMLParagraphElement>document.querySelector('#newcred2')
                    credibilityText4.innerText = credibility2.credibility.toFixed(2) + '%'
                    hideSpinner()
                  }).catch(e => {
                    hideSpinner()
                    console.log(e)})
                client.getPlainTextCredibility(
                  {weightBadWords: filterOptions.weightBadWords,
                    weightMisspelling: filterOptions.weightMisspelling,
                    weightSpam: filterOptions.weightSpam},
                  {text: tweet2, 
                    lang: lang })
                  .then(function (credibility3 : { credibility: number }) {
                    const credibilityText5  =  <HTMLParagraphElement>document.querySelector('#credibility3')
                    credibilityText5.innerText = credibility3.credibility.toFixed(2) + '%'
                    const credibilityText6  =  <HTMLParagraphElement>document.querySelector('#newcred3')
                    credibilityText6.innerText = credibility3.credibility.toFixed(2) + '%'
                    hideSpinner()


                            
                  }).catch(e => {
                    hideSpinner()
                    console.log(e)})
              })
            })
          })




          /*  document.querySelector('#PageSensitiveButtons').removeChild

              hideSpinner()
            })
            .catch(error => {
              console.timeEnd(constants.DEBUG_REQUEST_TIME_LABEL)
              window.alert(JSON.stringify(error))
              console.error(error)
              hideSpinner()
            })*/
        } else if (response.instruction === 'scrapTW') {
          var lang : Language = getLanguage(response.lang)
          let promiseList : Promise<{credibility : number}>[] = []
          response.tweetTexts.map((tweetText: string) =>
            promiseList.push(client.getTweetCredibilityWithScraping(
              { text: tweetText,
                lang: lang
              },
              { weightBadWords: +filterOptions.weightBadWords,
                weightMisspelling: +filterOptions.weightMisspelling,
                weightSpam: +filterOptions.weightSpam,
                weightText: +filterOptions.weightText,
                weightSocial: +filterOptions.weightSocial,
                weightUser: +filterOptions.weightUser
              },
              {
                name: response.name,
                verified: response.verified,
                yearJoined: +response.joinedDate,
                followersCount: +response.followers,
                friendsCount: +response.following
              },
              +filterOptions.maxFollowers)))
          console.time(constants.DEBUG_REQUEST_TIME_LABEL)
          Promise.all(promiseList)
            .then(values => {
              console.timeEnd(constants.DEBUG_REQUEST_TIME_LABEL)
              port.postMessage({
                sender: 'www',
                instruction: 'update',
                credList: values.map(credibility => credibility.credibility)
              })
              hideSpinner()
            })
            .catch(error => {
              console.timeEnd(constants.DEBUG_REQUEST_TIME_LABEL)
              if(JSON.stringify(error.message)== '"Request failed with status code 400"'){
                window.alert('The credibility analysis is only available for English, Spanish and French')
                hideSpinner()
              }else{
                window.alert('Errorf: '+JSON.stringify(error))
                hideSpinner()
              }
            })
        } else if (response.instruction === 'scrapFB'){
          var lang : Language = getLanguage(response.lang)
          let promiseList : Promise<{credibility : number}>[] = []
          response.tweetTexts.map((tweetText: string) => {
            promiseList.push(client.getTweetCredibilityWithScraping(
              { text: tweetText,
                lang: lang
              },
              { weightBadWords: +filterOptions.weightBadWords,
                weightMisspelling: +filterOptions.weightMisspelling,
                weightSpam: +filterOptions.weightSpam,
                weightText: +filterOptions.weightText,
                weightSocial: +filterOptions.weightSocial,
                weightUser: +filterOptions.weightUser
              },
              {
                name: response.name,
                verified: response.verified,
                yearJoined: 2011,
                followersCount: +response.followers,
                friendsCount: +response.following
              },
              +filterOptions.maxFollowers))
          })
          console.time(constants.DEBUG_REQUEST_TIME_LABEL)
          Promise.all(promiseList)
            .then(values => {
              console.timeEnd(constants.DEBUG_REQUEST_TIME_LABEL)
              port.postMessage({
                sender: 'www',
                instruction: 'update',
                credList: values.map(credibility => credibility.credibility)
              })
              hideSpinner()
            })
            .catch(error => {
              console.timeEnd(constants.DEBUG_REQUEST_TIME_LABEL)
              window.alert('Error: '+JSON.stringify(error))
              console.error(error)
              hideSpinner()
            })
        }
      })
    })
  })
}

function showSpinner(){
  //document.body.style.background = 'rgba(0,0,0,.5)';
  const verifyBtn = <HTMLButtonElement>document.getElementById('submitButton')
  //verifyBtn.disabled =  true
  const verifyPageBtn = <HTMLButtonElement>document.getElementById('VerifyPageButtonScraperTW')
  const verifyPageTwitterApiBtn = <HTMLButtonElement>document.getElementById('VerifyPageButtonTwitterApi')
  const verifyPageBtnFB = <HTMLButtonElement>document.getElementById('VerifyPageButtonScraperFB')

  if(verifyPageBtn != null && verifyPageTwitterApiBtn != null){
    
    
    verifyPageBtn.disabled  = true
    verifyPageTwitterApiBtn.disabled  = true
    verifyBtn.style.backgroundColor = 'rgba(0,123,255,.7)'
    verifyBtn.style.borderColor = 'rgba(255,255,255,.7)'

    verifyPageBtn.style.backgroundColor = 'rgba(0,123,255,.7)'
    verifyPageBtn.style.borderColor = 'rgba(255,255,255,.7)'

    verifyPageTwitterApiBtn.style.backgroundColor = 'rgba(0,123,255,.7)'
    verifyPageTwitterApiBtn.style.borderColor = 'rgba(255,255,255,.7)'
  }else if (verifyPageBtnFB != null){
    verifyPageBtnFB.disabled  = true
    verifyPageBtnFB.style.backgroundColor = 'rgba(0,123,255,.7)'
    verifyPageBtnFB.style.borderColor = 'rgba(255,255,255,.7)'
  }

  const spinner = <HTMLDivElement>document.getElementById('sp-content')
  spinner.style.display = 'block'
}

function hideSpinner(){
  const verifyBtn = <HTMLButtonElement>document.getElementById('submitButton')
  verifyBtn.disabled =  false
  const verifyPageBtn = <HTMLButtonElement>document.getElementById('VerifyPageButtonScraperTW')
  const verifyPageTwitterApiBtn = <HTMLButtonElement>document.getElementById('VerifyPageButtonTwitterApi')
  const verifyPageBtnFB = <HTMLButtonElement>document.getElementById('VerifyPageButtonScraperFB')

  if(verifyPageBtn != null && verifyPageTwitterApiBtn != null){
    verifyPageBtn.disabled  = false
    verifyPageTwitterApiBtn.disabled  = false

    verifyBtn.style.backgroundColor = '#007bff'
    verifyBtn.style.borderColor = '#007bff'

    verifyPageBtn.style.backgroundColor = '#007bff'
    verifyPageBtn.style.borderColor = '#007bff'

    verifyPageTwitterApiBtn.style.backgroundColor = '#007bff'
    verifyPageTwitterApiBtn.style.borderColor = '#007bff'

  }else if (verifyPageBtnFB != null){
    verifyPageBtnFB.disabled = false

    verifyPageBtnFB.style.backgroundColor = '#007bff'
    verifyPageBtnFB.style.borderColor = '#007bff'

  }
  const spinner = <HTMLDivElement>document.getElementById('sp-content')
  spinner.style.display = 'none'
}

function getLanguage(language : string){
  var lang : Language
  if (language === 'es') {
    lang = 'es'
  } else if (language === 'fr') {
    lang = 'fr'
  } else {
    lang = 'en'
  }

  return lang
}


