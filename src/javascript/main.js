import Chart from '../../node_modules/chart.js/dist/Chart.bundle.js'
import * as countryData from '../../node_modules/country-json/src/country-by-population.json'
import * as countryNames from '../../node_modules/country-json/src/country-by-abbreviation.json'
import * as flags from '../../node_modules/country-json/src/country-by-flag.json'
import $ from 'jquery';
import 'select2';
import 'popper.js';
import 'bootstrap';

//Loads country names and abbreviations from json-file --> check whether those have to be global
var countryCodes = countryNames.default 
var flagImgs = flags.default
let options = {
  timeout: 5000
  }
//Data which is used to create charts
var chartData = {
  coronaDatasets: []
}

var comparisonChart = null
//check if this is necessary
var countries = []
var currentPlace = ""
var comparisonCountry = ""

//On load the current position is retrieved and the select list is populated with countries
$(document).ready(function(){
  if (sessionStorage.getItem("location") == null) {
    console.log("Retrieving position")
    navigator.geolocation.getCurrentPosition(success, error, options);
  } else {
    currentPlace = sessionStorage.getItem("location")
    let flag = sessionStorage.getItem("flag")
    $(".loader").remove()
    $("#currentLocation").text(`Current location: ${currentPlace}`)
    getCountries(countryCodes)
    $("#currentLocation").append(`<img src=${flag}>`)
    $(`#countrySelector option:contains("${currentPlace}")`).remove()
    //gör allt som annars ligger i geolocation
  }
  var winWidth =  $(window).width();
  var maxWidth = 600;

  //if the window width is less than the maxWidth pixels on document loading
  if(winWidth < maxWidth){//begin if then
  //add class to button group        
    $(".btn-group").addClass("btn-group-sm");
  }
  $("#canvas-wrapper").hide()
  $('#countrySelector').select2();
});

//Change button group on resize
$(window).resize(function(){
   var winWidth =  $(window).width();
   var maxWidth = 600;    

if(winWidth < maxWidth){       
  $(".btn-group").addClass("btn-group-sm");

  } else{
    $(".btn-group").removeClass("btn-group-sm");

   }
});

//Scroll down when button is clicked
$("#startButton").on("click", function() {
  $('html, body').animate({
      scrollTop: $("#startButton").offset().top
  }, 800);
});

//Select country: creates an array with abbreviation and name of comparison country
$("#countrySelector").on("change", function() {
  comparisonCountry = [$("#countrySelector").val(), $("#countrySelector option:selected").text()]
  console.log(comparisonCountry)
  //Button is enabled when country is selected
  $("#getStats").attr("disabled", false)
})

//Show Chart: destroys chart if it exists, retrieves corona statistics for current location and comparison country and populates chart
$("#getStats").on("click", function() {
  //Remove placeholder quote
  $(".blockquote-wrapper").remove()
  $("#canvas-wrapper").show()
  $("#datasource").show()
  $("#APIError").remove()
  //Scroll down to statistics section when button is clicked
  $('html, body').animate({
    scrollTop: $("#statsSection").offset().top
}, 800);
  chartData.coronaDatasets = []
  //Destroy chart if exists
  if (comparisonChart != null) {
    comparisonChart.destroy()
    console.log("Old chart destroyed")
    //Make confirmed button active
    $("label").removeClass("active")
    $("#confirmedlabel").addClass("active")
  }
  //Display chart type buttons + tooltip for first time visitors
  $("#chartType").css("display", "inline")
  if(isFirstTimeVisitor() == true) {
    if($(window).width() < 600) {
      var popPlace
      popPlace = "bottom"
    } else {
      popPlace = "right"
    }
    $('#chartType').popover( {
      placement: popPlace,
      trigger: 'focus',
      content: 'Use the buttons to switch between different datasets.'
    })
    $('#chartType').popover('show')
  }
  
  //Get CovidData based on current place and comparison country
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

//Check whether user is first time visitor, if true, item is set in local storage
function isFirstTimeVisitor() {
  if (localStorage.getItem("firstTime") == null) {
    localStorage.setItem("firstTime", true)
    return true
  } else {
    return false
  }
}
//Change chart type
$('input[type="radio"]').on('click change', function() {
  $('#chartType').popover('dispose')
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
  let myChart = document.getElementById('myChart').getContext('2d');
  
  if (type == "deaths") {
    var titleText = "Covid-19 deaths per 100 000 inhabitants"
  } else {
    var titleText = `Covid-19 ${type} cases per 100 000 inhabitants`
  }
  if (chartData.coronaDatasets[1][type].length == 0) {
    var comparisonLabel = `No data for ${chartData.coronaDatasets[1].country} available.`
  } else {
    var comparisonLabel = chartData.coronaDatasets[1].country
  }
  comparisonChart = new Chart (myChart, {
    type: 'line',
    data: {
      labels: chartData.coronaDatasets[0].dates,
      datasets: [
        {
          label: chartData.coronaDatasets[0].country,
          data: chartData.coronaDatasets[0][type],
          borderColor: "red",
          backgroundColor: "rgba(241, 130, 141,0.6)"

        },
        {
          label: comparisonLabel,
          data: chartData.coronaDatasets[1][type],
          borderColor: "black",
          backgroundColor: "rgba(0, 0, 0, 0.6)"
        }
      ]
    },
    options: {
      title: {
        display: true,
        text: titleText,
        fontSize: 20,
        padding: 20,
      },
      responsive: true,
      maintainAspectRatio: false,
      legend: {
        labels: {
          fontSize: 16,
        }
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
  $("#currentLocation").css("color", "#dc3545")

}

//Covid19 API call
function getCovidData(country) {
  let today = getTodaysDate()
  let url = `https://api.covid19api.com/total/country/${country}?from=2020-03-01T00:00:00Z&to=${today}T00:00:00Z`
  console.log(url)
  return $.ajax({
    url: url,
    method: "GET",
    timeout: 0
  }).fail(function(data) {
    console.log("API returned error: " + data);
    $("#chartType").append(`<h2 id="APIError">Sorry, could not retrieve any data for the selected country, please select another one!`)
    $("#datasource").hide()
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

//Geolocaton API call
function getCountry(lat, lng) {
  let url = `https://secure.geonames.org/countryCode?lat=${lat}&lng=${lng}&username=christina3107&type=JSON`
  $.ajax({
      url: `${url}`
  }).done(function(data) {
    console.log("Success: ", data)
    $("#currentLocation").text(`Current location: ${data.countryName}`)
    currentPlace = data.countryName
    sessionStorage.setItem("location", currentPlace)
    let flag = flagImgs.find(x => x.country === data.countryName).flag_base64;
    sessionStorage.setItem("flag", flag)
    $(".loader").remove()
    getCountries(countryCodes)
    $("#currentLocation").append(`<img src=${flag}>`)
    $(`#countrySelector option:contains("${data.countryName}")`).remove()
  }).fail(function(data) {
      console.log(data);
      $("#getStats").attr("disabled", true)
  });
}

