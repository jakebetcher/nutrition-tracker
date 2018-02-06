'use strict'

function storeTheFood() {
	let theFood = $('.js-food-query').val();
	return theFood;
}

function onFoodSearchFormSubmit () {
        $('.nutrition-search-form').val('');
        return true; 
    }

function handleNutritionSearchClick() {
	$('.nutrition-search-button').on('click', function(event) {
		$('.nutrition-search-form').removeClass('hidden');
		$('.signup-form').addClass('hidden');
	});
}

function handleSubmitSearchFoods() {
	$('.nutrition-search-form').submit(function(event) {
		event.preventDefault();
		getDataFromAPI(renderFoodResult);
	});
}

function getDataFromAPI(callback) {
	const food = storeTheFood();
	const nutrientsURL = `https://api.nal.usda.gov/ndb/search/?format=json&q=${food}&sort=n&max=25&offset=0&api_key=70ONpAfW6gpIaUBzICUb8m2mRnXzs0pqI4hel3L3`;
        const settings = {
        url: nutrientsURL,
        dataType: 'json',
        type: 'GET',
        success: callback
        //error: displayErrorMessage()
        };
        $.ajax(settings);
}


function renderFoodResult(data) {
	const foodListLength = data.list.item.length;
	for (let i = 0; i < foodListLength; i++) {
		$('.js-results-div').append(`<div class='theFoods'><span>Food Name: </span> <button value=${data.list.item[i].ndbno} class='food-name'>${data.list.item[i].name}</button></div>`);
	}
	
}

function displayModal() {
	$('.js-results-div').on('click', '.food-name', function(event) {
		let theId = '';
		theId = $(this).val();
		getDetailedDataFromAPI(theId, renderDetailedData);
	});
}



function getDetailedDataFromAPI(id, callback) {
	const theURL = `https://api.nal.usda.gov/ndb/nutrients/?format=json&api_key=70ONpAfW6gpIaUBzICUb8m2mRnXzs0pqI4hel3L3&nutrients=208&nutrients=203&nutrients=204&nutrients=205&nutrients=291&nutrients=269&nutrients=301&nutrients=306&nutrients=401&nutrients=606&nutrients=430&nutrients=303&nutrients=307&nutrients=318&nutrients=324&nutrients=418&nutrients=415&nutrients=431&nutrients=323&ndbno=${id}`;
	const settings = {
		url: theURL,
		dataType: 'json',
		type: 'GET',
		success: callback
	};
	$.ajax(settings);
}

function renderDetailedData(result) {
	let theModal = `<div class='pop-outer'><div class='pop-inner'><button class='close'>X</button><h2>Nutritional Facts</h2>`;
	for (let i = 0; i < result.report.foods[0].nutrients.length; i++) {
		theModal += `<p><span>${result.report.foods[0].nutrients[i].nutrient}: </span> <span>${result.report.foods[0].nutrients[i].value} ${result.report.foods[0].nutrients[i].unit}</span></p>`
	}
	theModal += `<button>Add Food Item</button></div></div>`;
	$('.js-results-div').append(theModal);
	$('.pop-outer').fadeIn();
	$('.js-results-div').on('click', '.close', function(event) {
    $('.pop-outer').fadeOut();
  });
}





function initApp() {
 	handleNutritionSearchClick();
 	handleSubmitSearchFoods();
 	displayModal();
}

$(initApp);





































/*function renderProfilePage() {
	return `

	`;
}

function backToHome() {
	$('h1').on('click', function() {
		$('.nutrition-search-form').addClass('hidden');
		$('.signup-form').removeClass('hidden');
	});
}

function handleNutritionSearchClick() {
	$('.nutrition-search-button').on('click', function() {
		$('.signup-form').addClass('hidden');
		$('body').append(renderNutritionSearchPage());
	});
	backToHome();
	handleSearchFoods();
}


function handleSearchFoods() {
	$('.nutrition-search-form').submit(function() {
		$('body').append('<p>yay</p>');
	});
}

//handleNutritionSearchClick();*/