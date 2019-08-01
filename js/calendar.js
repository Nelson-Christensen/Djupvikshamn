/* Solution inspired by https://medium.com/@nitinpatel_20236/challenge-of-building-a-calendar-with-pure-javascript-a86f1303267d */

const eventContent = $("#calendar-event");
const calendarDays = document.getElementById("calendar-days");
const monthNames = ["Januari", "Februari", "Mars", "April", "Maj", "Juni", "Juli", "Augusti", "September", "Oktober", "November", "December"];
const currentTime = new Date();
const currentYear = currentTime.getFullYear();
const currentMonth = currentTime.getMonth();
const currentDate = currentTime.getDate();
var selectedYear = currentYear;
var selectedMonth = currentMonth;
var selectedDate = currentDate;

// Object with the attributes required to present all necessary data. Specified by a date string as ID (ex 28052019), and a string array as texts
function EventObject(id, texts){
	this.id = id;
	this.texts = texts;
}

const exampleText = ["<h2>Exempel på event</h2>"+
"<p>Det här är ett exempel på ett event i kalendern."+
"</p>", "<h2>Flera event denna dag</h2>"+
"<p>Ett annat exempel"+
"</p>"
];

const maj282019 = new EventObject("28052019", ["<h2>Lorem Ipsum</h2>"+
"<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."+
"Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."+
"Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."+
"Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."+
"</p>"]);
const maj102019 = new EventObject("10052019", ["<h2>Hamnjobb</h2>"+
"<p>Lördagen den 6 april samlades ett antal av föreningens medlemmar för arbete i hamnen."+
"Kiosken, kajerna och stranden städades. Kajer lagades och gräs brändes. Diverse fix på många håll."+
"Vädret var bra och korven god. Det som återstår inför säsongen är att ta bort släke från stranden,"+
"att sätta upp ramp vid kiosken och att fylla kiosken med varor."+
"</p>", "<h2>Städning</h2>"+
"<p>Det blev lite städning på stranden."+
"</p>"]);

const juni102019 = new EventObject("10062019", ["<h2>Lorem Ipsum</h2>"+
"<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."+
"Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."+
"Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."+
"Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."+
"</p>"]);

const juni202019 = new EventObject("20062019", exampleText);
const juli212019 = new EventObject("21072019", exampleText);


const eventObjects = [maj282019, maj102019, juni102019, juni202019, juli212019];
var lastSelectedElement;

$(document).ready(function() {
	showCalendar(currentMonth, currentYear);
	$("#month-text").html(monthNames[selectedMonth]);
	$("#year-text").html(selectedYear);
});

function selectDay(elem, dateString) {
	if (lastSelectedElement != null){
		lastSelectedElement.classList.remove("selected");
	}
	elem.parentElement.classList.add("selected");
	lastSelectedElement = elem.parentElement;
	var dateContent = searchEvent(dateString).texts;
	$(eventContent).slideUp(500, function(){
		$(eventContent).html("");
		for(var i = 0; i < dateContent.length; i++){
			$(eventContent).append(dateContent[i]);
		}
		$(eventContent).slideDown(500);
	});
}

function clearSelection(){
	$(eventContent).slideUp(500, function(){
		$(eventContent).html("");});
}

function nextMonth(){
	selectedMonth++;
	if (selectedMonth > 11){
		selectedYear++;
		selectedMonth = 0;
	}
	$("#month-text").html(monthNames[selectedMonth]);
	$("#year-text").html(selectedYear);
	showCalendar(selectedMonth, selectedYear);
	clearSelection();
}

function previousMonth(){
	selectedMonth--;
	if (selectedMonth < 0){
		selectedYear--;
		selectedMonth = 11;
	}
	$("#month-text").html(monthNames[selectedMonth]);
	$("#year-text").html(selectedYear);
	showCalendar(selectedMonth, selectedYear);
	clearSelection();
}

// Turns the calendar to display the specified month and year
function showCalendar(month, year){
	let firstDay = (new Date(year, month)).getDay(); /* Gets a 0-6 value representing which weekday the month starts on*/
	firstDay -= 1;
	firstDay = firstDay < 0 ? 6 : firstDay; /* Adjust so the week starts from monday (0 is monday, 6 is sunday) */
	let lastDay = daysInMonth(month, year);
	let date = 1;
	let item = document.createElement("li");
	let itemText = document.createTextNode("");
	let dateString = "";
	$(calendarDays).html("");
	for (let i = 0; i < 42; i++){
		if (i < firstDay){
			item = document.createElement("li");
			itemText = document.createTextNode(daysInMonth(month-1, year)+(i+1)-firstDay)
			item.classList.add("invalidMonth");
			item.appendChild(itemText);
			calendarDays.appendChild(item);
		}
		else if(date > lastDay){
			if(i % 7 == 0){
				break;
			}
			item = document.createElement("li");
			itemText = document.createTextNode((i+1)-lastDay-firstDay);
			item.classList.add("invalidMonth");
			item.appendChild(itemText);
			calendarDays.appendChild(item);
		}
	else{
			item = document.createElement("li");
			itemText = document.createTextNode(date)
			if(year == currentYear && month == currentMonth && date == currentDate){
				item.classList.add("current");
			}
			dateString = date.toString() + (selectedMonth+1).toLocaleString(undefined, {minimumIntegerDigits: 2}) + selectedYear.toString();
			if (searchEvent(dateString) != null){
				link = document.createElement("a");
				link.id = dateString;
				link.href = "#";
				link.setAttribute("onclick","selectDay(this, "+dateString+");");
				link.appendChild(itemText);
				item.appendChild(link);
				item.classList.add("event");
			}
			else
			{
				item.appendChild(itemText);
			}
			calendarDays.appendChild(item);
			date++;
		}
	}
}

// Returns the eventObject for the specified id
function searchEvent(idString){
	for(var i = 0; i < eventObjects.length; i++){
		if (eventObjects[i].id == idString){
			return eventObjects[i];
		}
	}
	return null;
}

// check how many days in a month 
function daysInMonth(iMonth, iYear) 
{ 
    return 32 - new Date(iYear, iMonth, 32).getDate();
}