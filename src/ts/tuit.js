const config = require('./popup');
const Twit = require('twit');

let T1 = new Twit({
  consumer_key:         'z0XeSg03hdntbhLxZZS6Ouzcf',
  consumer_secret:      '2CK3fqz6CsQ1FKCnzD7bhvFUypslKQYOXnTwJpjZ5Wh6jiRtFN',
  access_token:         '1450888371727966208-X37dN7F4U98AG2GJ0mFh8Zi5GCaKro',
  access_token_secret:  'u1emTUxsllmIB7Ed7d3CYgo45iEyXAPxwjD7USlM5ef4x'
})

function buscar(usernow){
  let textToSearch = usernow

  T1.get('search/tweets', { q: textToSearch, count: 3 }, function(err, data, response) {

    let id1 = data.statuses[0].id_str
    let name1 = data.statuses[0].user.screen_name
    let lang1 = data.statuses[0].lang
    let text1 = data.statuses[0].text
    
  })
}


export default {
  buscar,
  id1,
  name1,
  lang1,
  text1,
}