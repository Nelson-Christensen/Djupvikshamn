//Gathers weather data from SMHI and displays result in the weather widget.
const lat = 57.3081;
const lon = 18.1489;
const timesToTrack = ["6", "12", "18"];
const daysToTrack = 2;
const DOMAINURL = "https://opendata-download-metfcst.smhi.se";
const DESTINATIONURL = "/api/category/pmp3g/version/2/geotype/point/lon/"+lon+"/lat/"+lat+"/data.json";
const container = $("#weather-content");
var dayCodeBlock = ['<span class="weather-item weather-day" id="today">Idag</span>', 
'<span class="weather-item weather-day" id="tomorrow">Imorgon</span>'];
const dayCodeBlockEnglish = ['<span class="weather-item weather-day" id="today">Today</span>', 
'<span class="weather-item weather-day" id="tomorrow">Tomorrow</span>'];
if(document.documentElement.lang == 'en') {
    dayCodeBlock = dayCodeBlockEnglish;
}

// Object with the attributes required to present all necessary data.
function WeatherObj(time, day, temp, coverage, windDir, windSpeed){
    this.time = time;
    this.day = day;
    this.temp = temp;
    this.coverage = coverage;
    this.windDir = windDir;
    this.windSpeed = windSpeed;
}

function getResult(){
    return fetch(DOMAINURL + DESTINATIONURL)
        .then(function(response){
            return response.json();
        })
        .then(function(response){
            return response;
        })
}

function getWeatherData(){
    getResult().then(function(response){
        retrieveWeatherObjects(response);
    })
}
getWeatherData();


// Takes a timeSeries object and extracts the neccecary data and returns a WeatherObj with that data.
function createWeatherObject(obj){
    var date = new Date(obj.validTime).toISOString().replace(/[a-zA-Z]/g, " ").substr(0, 16);
    var time = date.substring(11, 13);
    var day = date.substring(0, 10);
    var temp = obj.parameters[11].values[0];
    var cov = obj.parameters[18].values[0];
    var windDir = obj.parameters[13].values[0];
    var windSpeed = obj.parameters[14].values[0];
    jQuery.each(obj.parameters, function(index, param) {
        switch (param.name){
            case "t":
                temp = param.values[0];
                break;
            case "Wsymb2":
                cov = param.values[0];
                break;
            case "wd":
                windDir = param.values[0];
                break;
            case "ws":
                windSpeed = param.values[0];
                break;
        }
    });
    return new WeatherObj(time, day, temp, cov, windDir, windSpeed);
}

// Takes a PMP JSON object gathers the objects that meet the timesToTrack and daysToTrack criteria.
// Then delegates print assignment for those objects to other functions.
function retrieveWeatherObjects(result){
    var timeStamps = [];
    var i = 0;
    var now = new Date();

    if (timeStamps.length % timesToTrack.length == 0){
        $("#weather-content").append(dayCodeBlock[timeStamps.length/timesToTrack.length]);
    }
    var daysInMonth = 32 - new Date(now.getFullYear(), now.getMonth(), 32).getDate();
    //i = 19; //(?)DEBUG TOOL WHEN YOU WANT TO SIMULATE A TIME VALUE HIGHER THAN 06:00
    while(timeStamps.length < timesToTrack.length * daysToTrack){
        var daysAhead = Math.floor(timeStamps.length / timesToTrack.length);
        var targetHour = timesToTrack[timeStamps.length % timesToTrack.length];
        var targetDay = daysAhead + now.getDate();
        if (targetDay > daysInMonth){
            targetDay -= daysInMonth;
        }
        var obj = result.timeSeries[i];
        var dateString = new Date(obj.validTime).toISOString().replace(/[a-zA-Z]/g, " ").substr(0, 16);
        var dateDay = parseInt(dateString.substr(8, 2), 10);
        var dateHour = parseInt(dateString.substr(11, 2), 10);
        
        // Will take the object if it is the right day and as long as the time is targetTime or over.
        if (dateDay == targetDay && dateHour >= targetHour){
            let currentTimeStamp = createWeatherObject(obj);
            timeStamps.push(currentTimeStamp);
            printWeatherObject(currentTimeStamp);
            // If you have added all times for the first day.
            if (timeStamps.length == timesToTrack.length){
                $("#weather-content").append(dayCodeBlock[timeStamps.length/timesToTrack.length]);
            }
        }
        // If you passed the first day without adding all times.
        else if(dateDay > targetDay && timeStamps.length < timesToTrack.length){
            console.dir("No more times for targetDay. Replicating last timeSeries");
            // Make the obj the last timeSeries from the previous day.
            obj = result.timeSeries[i-dateDay-1];
            let currentTimeStamp = createWeatherObject(obj);
            timeStamps.push(currentTimeStamp);
            printWeatherObject(currentTimeStamp);
            // If you have added all times for the first day.
            if (timeStamps.length == timesToTrack.length){
                $("#weather-content").append(dayCodeBlock[timeStamps.length/timesToTrack.length]);
            }
        }
        i++;
        if (i >= result.timeSeries.length){
            console.dir("Error. Could not find enough timeStamps.");
            break;
        }
    }
}

// Takes a weatherObject and adds that information into the DOM.
function printWeatherObject(weatherObject){
    var symbol = getSymbolFromValue(weatherObject.coverage);
    var codeBlock = '<span class="weather-item weather-time">'+weatherObject.time+':00</span>'+
    '<span class="weather-item weather-symbol"><i class="wi '+symbol.img+'" title="'+symbol.text+'"></i></span>'+
    '<span class="weather-item weather-temp">'+weatherObject.temp+'&deg</span>'+
    '<span class="weather-item weather-wind"><i class="fas fa-arrow-up" style="transform: rotate('+weatherObject.windDir+'deg);"></i>('+weatherObject.windSpeed+')</span>';
    container.innerHTML = codeBlock;
    $("#weather-content").append(codeBlock);
}

// Takes a value that represents the forecast and returns an icon to symbolize the weather.
// icon syntax is based on weather icons by Erik Flowers (https://erikflowers.github.io/weather-icons/)
function getSymbolFromValue(value){
    var icon = new Object();
    switch(value){
        case 1:
            icon.img = "wi-day-sunny";
            icon.text = "Klar himmel";
            break;
        case 2:
            icon.img = "wi-day-sunny";
            icon.text = "Nästan klar himmel";
            break;
        case 3:
            icon.img = "wi-day-cloudy";
            icon.text = "Växlande molnighet";
            break;
        case 4:
            icon.img = "wi-day-cloudy";
            icon.text = "Halvklar himmel";
            break;
        case 5:
            icon.img = "wi-cloudy";
            icon.text = "Molnigt";
            break;
        case 6:
            icon.img = "wi-cloud";
            icon.text = "Mulet";
            break;
        case 7:
            icon.img = "wi-fog";
            icon.text = "Dimma";
            break;
        case 8:
            icon.img = "wi-day-showers";
            icon.text = "Svaga regnskurar";
            break;
        case 9:
            icon.img = "wi-day-showers";
            icon.text = "Måttliga regnskurar";
            break;
        case 10:
            icon.img = "wi-showers";
            icon.text = "Kraftiga regnskurar";
            break;
        case 11:
            icon.img = "wi-thunderstorm";
            icon.text = "Åskväder";
            break;
        case 12:
            icon.img = "wi-day-sleet";
            icon.text = "Lite snöblandat regn";
            break;
        case 13:
            icon.img = "wi-day-sleet";
            icon.text = "Snöblandat regn";
            break;
        case 14:
            icon.img = "wi-sleet";
            icon.text = "Mycket Snöblandat regn";
            break;
        case 15:
            icon.img = "wi-day-snow";
            icon.text = "Svaga snöskurar";
            break;
        case 16:
            icon.img = "wi-day-snow";
            icon.text = "Måttliga snöskurar";
            break;
        case 17:
            icon.img = "wi-day-showers";
            icon.text = "Kraftiga snöskurar";
            break;
        case 18:
            icon.img = "wi-day-showers";
            icon.text = "Duggregn";
            break;
        case 19:
            icon.img = "wi-rain";
            icon.text = "Regn";
            break;
        case 20:
            icon.img = "wi-rain";
            icon.text = "Kraftigt regn";
            break;
        case 21:
            icon.img = "wi-thunderstorm";
            icon.text = "Åskväder";
            break;
        case 22:
            icon.img = "wi-day-sleet";
            icon.text = "Lite snöblandat regn";
            break;
        case 23:
            icon.img = "wi-day-sleet";
            icon.text = "Snöblandat regn";
            break;
        case 24:
            icon.img = "wi-sleet";
            icon.text = "Mycket snöblandat regn";
            break;
        case 25:
            icon.img = "wi-snow";
            icon.text = "Lätt snöfall";
            break;
        case 26:
            icon.img = "wi-snow";
            icon.text = "Måttligt snöfall";
            break;
        case 27:
            icon.img = "wi-snow-wind";
            icon.text = "Kraftigt snöfall";
            break;
        default:
            icon.img = "wi-na";
            icon.text = "Väderinformation saknas";
            Console.log("Could not find a symbol to represent weather for value: " + value);
            break;
    }
    return icon;
}


/* Weather Widget Navigation and media query adjustments */

/* Weather Widget */
var slidedRight = false; 
function weatherNextDay() {
    $("#left-slider").css("visibility", "visible");
    $("#right-slider").css("visibility", "hidden");
    $("#weather-content").animate({
        marginLeft: "-100%"
    }, 500);
    slidedRight = true;
}

function weatherPrevDay() {
    $("#left-slider").css("visibility", "hidden");
    $("#right-slider").css("visibility", "visible");
    $("#weather-content").animate({
        marginLeft: "0"
    }, 500);
    slidedRight = false;
}

/* Media Query adjustments */

var mediaQuery1 = window.matchMedia("(min-width: 500px)");
mediaQuery1.addListener(widthChange);
var mediaQuery2 = window.matchMedia("(min-width: 768px)");
mediaQuery2.addListener(widthChange);
function widthChange() {
    if (mediaQuery1.matches) {
        $("nav").show();
    }
    else{
        $("nav").hide();
    }
    // Remove change day arrows when both days are displayed at the same time
    if (mediaQuery1.matches && !mediaQuery2.matches) { // If media query matches
        $("#left-slider").css("visibility", "hidden");
        $("#right-slider").css("visibility", "hidden");
        $("#weather-content").css("marginLeft", "0");
    } 
    else {
        if (slidedRight){
            $("#left-slider").css("visibility", "visible");
            $("#weather-content").css("marginLeft", "-100%");
        }
        else{
            $("#right-slider").css("visibility", "visible");
        }
    }
}