//To Do:
//Skapa slotmachine, länder = från country-json???
//Styling chart
//Info
import Chart from '../../node_modules/chart.js/dist/Chart.bundle.js'
import * as countryData from '../../node_modules/country-json/src/country-by-population.json'
var chartData = {
  type: "",
  coronaDatasets: []
}
console.log(chartData)
console.log(chartData.datasets)

var currentPlace = ""
var comparisonCountry = "Germany"
let myChart = document.getElementById('myChart').getContext('2d');
let options = {
  timeout: 5000
}


$(document).ready(function(){
  //lägg till spinner
  console.log("Retrieving position")
  navigator.geolocation.getCurrentPosition(success, error, options);
});


//Show Chart
$("#getStats").on("click", function() {
  //töm chartData ifall man vill göra en ny..., disable button tills man har valt nytt land
  let resultCurrentPlace = getCovidData(currentPlace)
  let resultComparisonCountry = getCovidData(comparisonCountry)
  let promisesComplete = $.when(resultCurrentPlace, resultComparisonCountry);
  promisesComplete.done(function() {
    console.log("Promises done")
    populateChartData(resultCurrentPlace.responseJSON, currentPlace)
    populateChartData(resultComparisonCountry.responseJSON, comparisonCountry)
    
  }).done(function() {
    console.log(chartData)
    buildChart()
  })

  //Problem: skriver ut chartData innan populate är klar, måste använda deferred? för att för köra chartBuilder när det finns data
})
  //$.when(getCovidData(currentPlace)).done(function() {
  //console.log(chartData.coronaDatasets[0].cases)
    //console.log(chartData.coronaDatasets[0])
    //let cases = chartData.coronaDatasets[0]["cases"]
    //let dates = chartData.coronaDatasets[0].dates
    //buildChart(cases, dates)
  //lägg in when --> två ajax anrop, när de är klara kalla på buildChart med data från chartData
  

function populateChartData(result, country) {
  let population = countryData.find(x => x.country === country).population;
  console.log(country, population)
  let dates = []
  let cases = []
  $.each(result, function() {
    let perCapita = (this.Cases/population)* 100000
    cases.push(perCapita)
    dates.push(this.Date.substr(0, 10))
  })

  let dataset = {
    country: country,
    cases: cases,
    dates: dates
  }
  chartData.coronaDatasets.push(dataset)
  }

//Chart builder
function buildChart() {
  let comparisonChart = new Chart (myChart, {
    type: 'line',
    data: {
      labels: chartData.coronaDatasets[0].dates,
      datasets: [
        {
          label: chartData.coronaDatasets[0].country,
          data: chartData.coronaDatasets[0].cases
        },
        {
          label: chartData.coronaDatasets[1].country,
          data: chartData.coronaDatasets[1].cases
        }
      ]
    },
    options: {},
  
  })

};

//Geolocation
function success(position) {
  console.log("This is our position: ", position);
  let lat = position.coords.latitude
  let lng = position.coords.longitude
  getCountry(lat, lng)
}

function error(err) {
  console.warn("Something went wrong: ", err.message);
  $("#currentLocation").text(`You have to activate location services in order to use this website. Please reload the page!`)

}

//Covid19 API call
function getCovidData(country) {
  return $.ajax({
    url: `https://api.covid19api.com/dayone/country/${country}/status/deaths/live`,
    method: "GET",
    timeout: 0
  })
}

//Geolocaton API call
function getCountry(lat, lng) {
  let url = `http://api.geonames.org/countryCode?lat=${lat}&lng=${lng}&username=christina3107&type=JSON`
  $.ajax({
      url: `${url}`
  }).done(function(data) {
    console.log("Success: ", data)
    $("#currentLocation").text(`Your current location is ${data.countryName}`)
    currentPlace = data.countryName
    $("#getStats").attr("disabled", false)
  }).fail(function(data) {
      console.log(data);
  });
}

