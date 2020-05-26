//To Do:
//Skapa slotmachine, länder = från country-json???
//Styling chart
//Info
//ev dashboard med olika typer av statistik, t.ex. deaths, active, recovered cases + world?
//ändra datasets: date: {country: cases, country: cases}
//kolla de olika API-endpoints, välj den som är lämplig!

import Chart from '../../node_modules/chart.js/dist/Chart.bundle.js'
import * as countryData from '../../node_modules/country-json/src/country-by-population.json'
var chartData = {
  type: "",
  coronaDatasets: []
}
var comparisonChart = null
var countries = []
var currentPlace = ""
var comparisonCountry 
let myChart = document.getElementById('myChart').getContext('2d');
let options = {
  timeout: 5000
}

$(document).ready(function(){
  //lägg till spinner
  console.log("Retrieving position")
  navigator.geolocation.getCurrentPosition(success, error, options);
  getCountries()
});

//Select country
$("#countrySelector").on("change", function() {
  comparisonCountry = [$("#countrySelector").val(), $("#countrySelector option:selected").text()]
  console.log(comparisonCountry)
})

//Show Chart
$("#getStats").on("click", function() {
  chartData.coronaDatasets = []
  if (comparisonChart != null) {
    comparisonChart.destroy()
    console.log("Old chart destroyed")
  }

  let resultCurrentPlace = getCovidData(currentPlace)
  let resultComparisonCountry = getCovidData(comparisonCountry[0])
  let promisesComplete = $.when(resultCurrentPlace, resultComparisonCountry);
  promisesComplete.done(function() {
    console.log("Promises done")
    populateChartData(resultCurrentPlace.responseJSON, currentPlace)
    populateChartData(resultComparisonCountry.responseJSON, comparisonCountry[1])
    
  }).done(function() {
    console.log(chartData)
    buildChart()
  })
})
  
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
  comparisonChart = new Chart (myChart, {
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

//Countries API call
function getCountries() {
  return $.ajax({
    url: `https://api.covid19api.com/countries`,
    method: "GET",
    timeout: 0
  }).done(function(result) {
    console.log(result)
    countries = result
    $.each(result, function() {
      $("#countrySelector").append(`<option value=${this.Slug}>${this.Country}</option>`)
    })
  })
}

//Geolocaton API call
function getCountry(lat, lng) {
  let url = `https://secure.geonames.org/countryCode?lat=${lat}&lng=${lng}&username=christina3107&type=JSON`
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

