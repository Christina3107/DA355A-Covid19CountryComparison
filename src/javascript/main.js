//To Do:
//Get geolocation
//find out current location: http://api.geonames.org/countryCode?lat=47.03&lng=10.2&username=christina3107&type=JSON
//om platstjänster ej är aktiverade jämför med Sverige
//Skapa slotmachine, länder = från country-json???


import Chart from '../../node_modules/chart.js/dist/Chart.bundle.js'
import * as countryData from '../../node_modules/country-json/src/country-by-population.json'
let myChart = document.getElementById('myChart').getContext('2d');


let population = countryData.find(x => x.country === 'Italy').population;
console.log(population)
/* let comparisonChart = new Chart (myChart, {
  type: 'line',
  data: {
    labels: ['January', 'February', 'March', 'April', 'May', 'June'],
    datasets: [{
      label: 'Confirmed cases',
      data: [
        2,
        15,
        398,
        897,
        3567,
        10255
      ]
    }]
  },
  options: {},

}) */


function buildChart(Cases, Dates) {
  let comparisonChart = new Chart (myChart, {
    type: 'line',
    data: {
      labels: Dates,
      datasets: [{
        label: 'Confirmed cases',
        data: Cases
      }]
    },
    options: {},
  
  })

}



  var settings = {
    "url": "https://api.covid19api.com/dayone/country/italy/status/deaths/live",
    "method": "GET",
    "timeout": 0,
  };
  
  var currentPlaceCases = []
  var currentPlaceDates = []

  $.ajax(settings).done(function (response) {
    $.each(response, function() {
      console.log(this.Cases)
      let perCapita = (this.Cases/population)* 100000
      currentPlaceCases.push(perCapita)
      currentPlaceDates.push(this.Date.substr(0, 10))
    }),
  console.log(currentPlaceCases)
  console.log(currentPlaceDates)
  buildChart(currentPlaceCases, currentPlaceDates)

  }).fail(function(response) {
    console.log(response)
  })
