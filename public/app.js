


	const STATE = {
		calories: 0,
		fat: 0,
		protein: 0,
		carbs: 0
	};
	
function storeGoals() {
	const goals = {
		caloriesAmount: $('#calories-amount').val(),
		caloriesRange: $('#calories-range').val(),
		fatAmount: $('#fat-amount').val(),
		fatRange: $('#fat-range').val(),
		proteinAmount: $('#protein-amount').val(),
		proteinRange: $('#protein-range').val(),
		carbsAmount: $('#carbs-amount').val(),
		carbsRange: $('#carbs-range').val()
	}
	return goals;
}

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
		$('.signup-form, .profile-page').addClass('hidden');
	});
}

function handleSubmitSearchFoods() {
	$('.nutrition-search-form').submit(function(event) {
		event.preventDefault();
		$('.js-results-div').empty();
		getDataFromAPI(renderFoodResult);
		const queryTarget = $(this).find('.js-food-query');
        queryTarget.val("");
	});
}

function displayProfilePage() {
	$('.log-in-button').on('click', function(event) {
		$('.nutrition-search-form, .signup-form').addClass('hidden');
		$('.js-results-div').empty();
		$('.profile-page').removeClass('hidden');
	});
		
}

function displayGoalsModal() {
	$('.edit-goals-button').on('click', function(event) {
		$('.main-header, .profile-page').addClass('transparent-background');
		$('.pop-outer-goals').fadeIn();
	});
}

function handleSaveGoalChanges() {
	//const nutrientsForTracking = Object.keys(STATE);
	$('.nutrition-tracking').append(`
			<p><span>Calories: </span><span>${STATE.calories}</span></p>
			<p><span>Fat: </span><span>${STATE.fat}</span></p>
			<p><span>Protein: </span><span>${STATE.protein}</span></p>
			<p><span>Carbs: </span><span>${STATE.carbs}</span></p>
	`);
	console.log(STATE.calories);
	$('.nutrients-goals-form').submit(function(event) {
		event.preventDefault();
		//$('.nutrition-tracking').empty();
		$('.goals-list-div').empty();
		const checkboxValues = [$('#calories').val(), $('#fat').val(), $('#protein').val(), $('#carbs').val()];
		const checked = [];
		for (let i=0; i < checkboxValues.length; i++) {
		if ($(`#${checkboxValues[i]}`).prop('checked')) {
			
			
			//$('.nutrition-tracking').append(`<p>${checkboxValues[i]}: <span class=${checkboxValues[i]}>${objectString}</span></p>`)
			checked.push(checkboxValues[i]);
		}
	}
	for (let i = 0; i < checked.length; i++) {
		let nutrient = checked[i];
		let nutrientAmount = $(`#${nutrient}-amount`).val();
		$('.goals-list-div').append(`<p><span>${nutrient}: </span><span class='${nutrient}-amount-span'>${nutrientAmount}</span></p>`)
	}
		$('.pop-outer-goals').fadeOut();
		$('.main-header, .profile-page').removeClass('transparent-background');
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

function backToHome() {
	$('h1').on('click', function() {
		$('.nutrition-search-form, .profile-page').addClass('hidden');
		$('.js-results-div').empty();
		$('.signup-form').removeClass('hidden');
	});
}

function displayModal() {
	$('.js-results-div').on('click', '.food-name', function(event) {
		let theId = '';
		theId = $(this).val();
		getDetailedDataFromAPI(theId, renderDetailedData);
	});
}



function getDetailedDataFromAPI(id, callback) {
	const theURL = `https://api.nal.usda.gov/ndb/nutrients/?format=json&api_key=70ONpAfW6gpIaUBzICUb8m2mRnXzs0pqI4hel3L3&nutrients=208&nutrients=203&nutrients=204&nutrients=205&ndbno=${id}`;
	const settings = {
		url: theURL,
		dataType: 'json',
		type: 'GET',
		success: callback
	};
	$.ajax(settings);
}

function renderDetailedData(result) {
	let nutrientArray = [];
	let nutrientAmountArray = [];
	let theModal = `<div class='pop-outer'><div class='pop-inner'><button class='close'>X</button><h2>Nutritional Facts</h2>`; 
	for (let i = 0; i < result.report.foods[0].nutrients.length; i++) {
		theModal += `<p><span>${result.report.foods[0].nutrients[i].nutrient}: </span> <span>${result.report.foods[0].nutrients[i].value} ${result.report.foods[0].nutrients[i].unit}</span></p>`;
		nutrientArray.push(result.report.foods[0].nutrients[i].nutrient);
		nutrientAmountArray.push(result.report.foods[0].nutrients[i].value);
	}
	theModal += `<button class='add-a-food'>Add Food Item</button></div></div>`;
	$('.js-results-div').append(theModal);
	$('.pop-outer').fadeIn();
	$('.js-results-div').on('click', '.close', function(event) {
    $('.pop-outer').fadeOut();
  });
	$('.js-results-div').on('click', '.add-a-food', function(event) {
    	$('.nutrition-tracking').empty();
    	console.log(STATE.calories);
    	console.log( Number(result.report.foods[0].nutrients[0].value));
    	console.log(STATE.calories + Number(result.report.foods[0].nutrients[0].value))
    	
    	STATE.calories +=  Number(result.report.foods[0].nutrients[0].value);
    	$('.nutrition-tracking').append(`<p><span>Calories: </span><span>${STATE.calories}</span></p>`);
    	
    	let newFatValue = STATE.fat + Number(result.report.foods[0].nutrients[1].value);
    	STATE.fat = newFatValue;
    	$('.nutrition-tracking').append(`<p><span>Fat: </span><span>${STATE.fat}</span></p>`);

    	let newProteinValue = STATE.protein + Number(result.report.foods[0].nutrients[2].value);
    	STATE.protein = newProteinValue;
    	$('.nutrition-tracking').append(`<p><span>Protein: </span><span>${STATE.protein}</span></p>`)
    	
    	let newCarbsValue = STATE.carbs + Number(result.report.foods[0].nutrients[3].value);
    	STATE.carbs = newCarbsValue;
    	$('.nutrition-tracking').append(`<p><span>Carbs: </span><span>${STATE.carbs}</span></p>`)

    	$('.pop-outer').fadeOut();
    });
		
 }

function postGoalsData() {
	let theGoals = storeGoals();
	//console.log(theGoals);
	const goal = {
		calories: {
			amount: theGoals.caloriesAmount,
			range: theGoals.caloriesRange
		},
		fat: {
			amount: theGoals.fatAmount,
			range: theGoals.fatRange
		},
		protein: {
			amount: theGoals.proteinAmount,
			range: theGoals.proteinRange
		},
		carbs: {
			amount: theGoals.carbsAmount,
			range: theGoals.carbsRange
		}

	}
	$.ajax({
		url: '/goals',
		dataType: 'json',
		method: 'POST',
		contentType: 'application/json',
		data: JSON.stringify(goal),
		success: function(data) {
			console.log(data);
			$('body').append(`<p>${data}</p>`)
		}

	});
}

function handleSubmitGoals() {
	$('.nutrients-goals-form').submit(function(event) {
		postGoalsData();
	});
}


function initApp() {
 	handleNutritionSearchClick();
 	displayProfilePage();
 	backToHome();
 	handleSubmitSearchFoods();
 	displayModal();
 	displayGoalsModal();
 	handleSubmitGoals();
 	//handleSaveGoalChanges(); 

}

$(initApp);

console.log(STATE.calories);










































