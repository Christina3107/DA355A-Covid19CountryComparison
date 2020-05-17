import * as test from './testmodule'
import Chart from '/Users/christina/Google Drive/Malmö Universitet/vt20/Flerplattformsapplikationer, vt20/Inlämningsuppgifter/Inlämningsuppgift 3/DA355A-Inl3/node_modules/chart.js/dist/Chart.js'
//let test = require('./testmodule.js')
window.alert(test)
console.log(Chart)

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

