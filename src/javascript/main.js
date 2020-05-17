import * as test from './testmodule'
import Chart from '../../node_modules/chart.js/dist/Chart.bundle.js'


window.alert(test)
console.log(Chart)


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

