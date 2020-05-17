
import Chart from '../../node_modules/chart.js/dist/Chart.bundle.js'

let myChart = document.getElementById('myChart').getContext('2d');

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
    "url": "https://api.covid19api.com/dayone/country/norway/status/confirmed/live",
    "method": "GET",
    "timeout": 0,
  };
  
  var currentPlaceCases = []
  var currentPlaceDates = []

  $.ajax(settings).done(function (response) {
    $.each(response, function() {
      console.log(this.Cases)
      currentPlaceCases.push(this.Cases)
      currentPlaceDates.push(this.Date)
    }),
  console.log(currentPlaceCases)
  console.log(currentPlaceDates)
  buildChart(currentPlaceCases, currentPlaceDates)

  }).fail(function(response) {
    console.log(response)
  })
