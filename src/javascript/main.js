let test = require('./testmodule.js')
let axios
window.alert(test)

/* import axios from '../axios';
console.log("done")
axios.get('https://api.covid19api.com/summary')
  .then(function (response) {
    // handle success
    console.log(response);
  })
  .catch(function (error) {
    // handle error
    console.log(error);
  }) */

  var settings = {
    "url": "https://api.covid19api.com/summary",
    "method": "GET",
    "timeout": 0,
  };
  
  $.ajax(settings).done(function (response) {
    console.log(response);
  }).fail(function(response) {
    console.log(response)
  })

