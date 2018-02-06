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
		$('.js-results-div').append(`<div class='theFoods'><span>Food Name: </span> <span class='food-name'>${data.list.item[i].name}</span></div>`);
	}
	
}


function logAPIData(data) {
	console.log(data);
}


function initApp() {
 	handleNutritionSearchClick();
 	handleSubmitSearchFoods();
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