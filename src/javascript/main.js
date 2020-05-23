//To Do:
//Skapa slotmachine, länder = från country-json???
//kolla upp hur man bygger Chart med flera datasets
//Styling chart
//Info
import Chart from '../../node_modules/chart.js/dist/Chart.bundle.js'
import * as countryData from '../../node_modules/country-json/src/country-by-population.json'
var currentPlace = ""
let myChart = document.getElementById('myChart').getContext('2d');
let options = {
  timeout: 5000
}


$(document).ready(function(){
  console.log("Retrieving position")
  navigator.geolocation.getCurrentPosition(success, error, options);
});

//Show Chart
$("#getStats").on("click", function() {
  getCovidData(currentPlace)
  
})

//Chart builder
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
  $.ajax({
    url: `https://api.covid19api.com/dayone/country/${country}/status/deaths/live`,
    method: "GET",
    timeout: 0
  }).done(function (response) {
    let cases = []
    let dates = []
    let population = countryData.find(x => x.country === country).population;
    $.each(response, function() {
      //console.log(this.Cases)
      let perCapita = (this.Cases/population)* 100000
      cases.push(perCapita)
      dates.push(this.Date.substr(0, 10))
    })
  //console.log(currentPlaceCases)
  //console.log(currentPlaceDates)
  buildChart(cases, dates)
   
  
  }).fail(function(response) {
    console.log(response)
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



