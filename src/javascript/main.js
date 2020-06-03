//To Do:
//Styling chart
//Info
//ev dashboard med olika typer av statistik, t.ex. deaths, active, recovered cases + world?
//Lägg till felmeddelande, t.ex. om nån dataarray är tom eller nåt --> if array.length == 0 --> felmeddelande
//about
//statistics



import Chart from '../../node_modules/chart.js/dist/Chart.bundle.js'
import * as countryData from '../../node_modules/country-json/src/country-by-population.json'
import * as countryNames from '../../node_modules/country-json/src/country-by-abbreviation.json'
import * as flags from '../../node_modules/country-json/src/country-by-flag.json'
import $ from 'jquery';
import 'select2';
import 'bootstrap'


//Loads country names and abbreviations from json-file --> check whether those have to be global
var countryCodes = countryNames.default 
var flagImgs = flags.default

//Data which is used to create charts
var chartData = {
  coronaDatasets: []
}

var comparisonChart = null
//check if this is necessary
var countries = []
var currentPlace = ""
var comparisonCountry = ""
let myChart = document.getElementById('myChart').getContext('2d');
let options = {
  timeout: 5000
}

//On load the current position is retrieved and the select list is populated with countries
$(document).ready(function(){
  //lägg till spinner
  console.log("Retrieving position")
  navigator.geolocation.getCurrentPosition(success, error, options);
  getCountries(countryCodes)
  $('#countrySelector').select2();
});

//Select country: creates an array with abbreviation and name of comparison country
$("#countrySelector").on("change", function() {
  comparisonCountry = [$("#countrySelector").val(), $("#countrySelector option:selected").text()]
  console.log(comparisonCountry)
  $("#getStats").attr("disabled", false)
})

//Show Chart: destroys chart if it exists, retrieves corona statistics for current location and comparison country and populates chart
$("#getStats").on("click", function() {
  chartData.coronaDatasets = []
  if (comparisonChart != null) {
    comparisonChart.destroy()
    console.log("Old chart destroyed")
    $('input:checked').removeProp('checked');
  }
  $("#chartType").css("display", "inline")
  $("#confirmed").prop("checked")
  let resultCurrentPlace = getCovidData(currentPlace)
  let resultComparisonCountry = getCovidData(comparisonCountry[0])
  let promisesComplete = $.when(resultCurrentPlace, resultComparisonCountry);
  promisesComplete.done(function() {
    console.log("Promises done")
    populateChartData(resultCurrentPlace.responseJSON, currentPlace)
    populateChartData(resultComparisonCountry.responseJSON, comparisonCountry[1])
    
  }).done(function() {
    console.log(chartData)
    buildChart("confirmed")
  })
})

//Change chart type
$('input[type="radio"]').on('click change', function() {
  let type = this.value
  console.log(this.value);
  if (comparisonChart != null) {
    comparisonChart.destroy()
  }
  buildChart(type)
});

//Retrieves the current date, needed to get up to date statistics from the Covid-19 API
function getTodaysDate() {
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth()+1; 
  var yyyy = today.getFullYear();
  if(dd<10) 
  {
      dd='0'+dd;
  } 
  if(mm<10) 
  {
      mm='0'+mm;
  } 
  today = yyyy+'-'+mm+'-'+dd;
  return today;
}

//Creates datasets based on API response which are then used to populate the chart
function populateChartData(result, country) {
  let population = countryData.find(x => x.country === country).population;
  console.log(country, population)
  let dates = []
  let active = []
  let deaths = []
  let confirmed = []
  let recovered = []
  $.each(result, function() {
    //result per 100 000 inhabitants
    let activePC = Math.round((this.Active/population) * 100000)
    let deathsPC = Math.round((this.Deaths/population) * 100000)
    let confirmedPC = Math.round((this.Confirmed/population) * 100000)
    let recoveredPC = Math.round((this.Recovered/population) * 100000)
    active.push(activePC)
    deaths.push(deathsPC)
    confirmed.push(confirmedPC)
    recovered.push(recoveredPC)
    dates.push(this.Date.substr(0, 10))
  })

  let dataset = {
    country: country,
    active: active,
    deaths: deaths,
    confirmed: confirmed,
    recovered: recovered,
    dates: dates
  }
  chartData.coronaDatasets.push(dataset)
  }

//Chart builder
function buildChart(type) {
  comparisonChart = new Chart (myChart, {
    type: 'line',
    data: {
      labels: chartData.coronaDatasets[0].dates,
      datasets: [
        {
          label: chartData.coronaDatasets[0].country,
          data: chartData.coronaDatasets[0][type]
        },
        {
          label: chartData.coronaDatasets[1].country,
          data: chartData.coronaDatasets[1][type]
        }
      ]
    },
    options: {
      title: {
        display: true,
        text: "Covid-19 cases per 100 000 inhabitants",
        fontSize: 20,
        padding: 20,


      }
    },
  
  })

};

//Geolocation: retrieves name of the current location
function success(position) {
  console.log("This is your position: ", position);
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
  let today = getTodaysDate()
  let url = `https://api.covid19api.com/total/country/${country}?from=2020-03-01T00:00:00Z&to=${today}T00:00:00Z`
  console.log(url)
  return $.ajax({
    url: url,
    //url: `https://api.covid19api.com/dayone/country/${country}/status/deaths/live`,
    method: "GET",
    timeout: 0
  })
 
}

//Populates the select list
function getCountries(countryCodes) {
  $.each(countryCodes, function () {
    let country = {name: this.country, code: this.abbreviation}
    //check if this is necessary
    countries.push(country)
    $("#countrySelector").append(`<option value=${this.abbreviation}>${this.country}</option>`)
  })
}

//Countries API call
/* function getCountries() {
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
} */

//Geolocaton API call
function getCountry(lat, lng) {
  let url = `https://secure.geonames.org/countryCode?lat=${lat}&lng=${lng}&username=christina3107&type=JSON`
  $.ajax({
      url: `${url}`
  }).done(function(data) {
    console.log("Success: ", data)
    $("#currentLocation").text(`Your current location is ${data.countryName}`)
    currentPlace = data.countryName
    let flag = flagImgs.find(x => x.country === data.countryName).flag_base64;
    $("#flag").append(`<img src=${flag}>`)

  }).fail(function(data) {
      console.log(data);
  });
}

