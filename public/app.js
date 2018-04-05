const foodEntry = (function() {
	const consumedFood = {
		foodName: '',
		consumedCalories: 0,
		consumedFat: 0,
		consumedProtein: 0,
		consumedCarbs: 0
	};

	function getConsumedFood() {
		return Object.assign({}, consumedFood);
	}

	function setFoodName(food) {
		consumedFood.foodName = food;
	}

	function setCalories(calories) {
		consumedFood.consumedCalories = calories;
	}

	function setFat(fat) {
		consumedFood.consumedFat = fat;
	}

	function setProtein(protein) {
		consumedFood.consumedProtein = protein;
	}

	function setCarbs(carbs) {
		consumedFood.consumedCarbs = carbs;
	}

	return Object.freeze({
		getConsumedFood: getConsumedFood,
		setCalories: setCalories,
		setFat: setFat,
		setProtein: setProtein,
		setCarbs: setCarbs,
		setFoodName: setFoodName
	});
})();

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

function storeUserInfo() {
	let user = 	{
		username: $('.username-input').val(),
		password: $('.password-input').val(),
		firstName: $('.first-name-input').val(),
		lastName: $('.last-name-input').val()
	}
	//console.log(user);
	return user;
}


function onSignupFormSubmit() {
	$('.signup-form').val('');
        return true; 
}

function storeUserInfoLogIn() {
	return {
		username: $('.username-input-login').val(),
		password: $('.password-input-login').val()
	}
}

function onLogInFormSubmit() {
	$('.login-form').val('');
	return true;
}

function logIn() {
	let theUser = storeUserInfoLogIn();

	$.ajax({
		url: '/api/auth/login',
		dataType: 'json',
		method: 'POST',
		contentType: 'application/json',
		data: JSON.stringify(theUser),
		success: function(data) {
			//alert(data.authToken);
			$('.log-in-button').remove();
			$('.options').append(`
					<button class='header-button goals-button'>My Goals</button>
					<button class='header-button progress-button'>My Progress</button>
					<button class='header-button food-search-header-button'>Food Search</button>
				`);
			//$('.options').append(`<button class='header-button profile-name-button'>${theUser.username}</button>`);
			console.log('success');
			localStorage.setItem('token', data.authToken);
		}

	});

}

function signUp() {
	let user = storeUserInfo();
	$.ajax({
		url: '/api/users',
		dataType: 'json',
		method: 'POST',
		contentType: 'application/json',
		data: JSON.stringify(user),
		success: function(data) {
			console.log(data);
			loginFirstTime();
		}

	});
}

function loginFirstTime() {
	let user = {
		username: $('.username-input').val(),
		password: $('.password-input').val()
	};

	$.ajax({
		url: '/api/auth/login',
		dataType: 'json',
		method: 'POST',
		contentType: 'application/json',
		data: JSON.stringify(user),
		success: function(data) {
			$('.log-in-button').remove();
			$('.options').append(`
					<button class='header-button goals-button'>My Goals</button>
					<button class='header-button progress-button'>My Progress</button>
					<button class='header-button food-search-header-button'>Food Search</button>
				`);
			//$('.options').append(`<button class='header-button profile-name-button'>${user.username}</button>`);
			console.log('success');
			console.log(data);
			localStorage.setItem('token', data.authToken);
			console.log(localStorage.getItem('token'));
		}

	});
}

function getGoals(callback) {
	$.ajax({
		url: '/goals',
		dataType: 'json',
		method: 'GET',
		headers: {
			Authorization: `Bearer ${localStorage.getItem('token')}`
		},
		success: callback
	});
}

function displayGoals(data) {
	console.log(data);
	$('.goals-list-div').empty();
	$('.goals-list-div').append(`
		<div class='goals-amount-range'>	
				<h4 class='goals-list-nutrient-header'>Calories:</h4>
				<p class='goals-list-nutrient-paragraph'><span>Amount: </span><span>${data[0].calories.amount}</span></p>
				<p class='goals-list-nutrient-paragraph'><span>Range: </span><span>${data[0].calories.range}</span></p>
		</div>
		<div class='goals-amount-range'>
				<h4 class='goals-list-nutrient-header'>Fat:</h4>
				<p class='goals-list-nutrient-paragraph'><span>Amount: </span><span>${data[0].fat.amount}</span></p>
				<p class='goals-list-nutrient-paragraph'><span>Range: </span><span>${data[0].fat.range}</span></p>
		</div>
		<div class='goals-amount-range'>
				<h4 class='goals-list-nutrient-header'>Protein:</h4>
				<p class='goals-list-nutrient-paragraph'><span>Amount: </span><span>${data[0].protein.amount}</span></p>
				<p class='goals-list-nutrient-paragraph'><span>Range: </span><span>${data[0].protein.range}</span></p>
    </div>
    <div class='goals-amount-range'>
				<h4 class='goals-list-nutrient-header'>Carbs:</h4>
				<p class='goals-list-nutrient-paragraph'><span>Amount: </span><span>${data[0].carbs.amount}</span></p>
				<p class='goals-list-nutrient-paragraph'><span>Range: </span><span>${data[0].carbs.range}</span></p>
		</div>
		`);
}



function handleSignUpForm() {
	$('.signup-form').submit(function(event) {
		event.preventDefault();
		signUp();
		$('.signup-div').addClass('hidden');
		//$('.login-form').removeClass('hidden');
		$('.main-header').addClass('transparent-background');
		$('.pop-outer-goals').fadeIn();
		
	});
}



function handleLogInForm() {
	$('.login-form').submit(function(event) {
		event.preventDefault();
		logIn();
		$('.signup-div').addClass('hidden');
		$('.login-form-div').addClass('hidden');
		getGoals(displayGoals);
		$('.goals-page').removeClass('hidden');
	});
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
	$('.main-header').on('click', '.food-search-header-button', function(event) {
		$('.nutrition-search-form-div').removeClass('hidden');
		$('.signup-div, .goals-page, .login-form, .progress-page').addClass('hidden');
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

function displayLogInPage() {
	$('.log-in-button').on('click', function(event) {
		$('.nutrition-search-form-div, .signup-div').addClass('hidden');
		$('.js-results-div').empty();
		$('.login-form-div').removeClass('hidden');
	});
		
}

function displayGoalsModal() {
	$('.edit-goals-button').on('click', function(event) {
		$('.main-header, .goals-page').addClass('transparent-background');
		$('.pop-outer-goals').fadeIn();
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
	$('.js-results-div').append(`<h2 class='food-results-header'>Results</h2>`)
	for (let i = 0; i < foodListLength; i++) {
		$('.js-results-div').append(`<div class='theFoods'><button value=${data.list.item[i].ndbno} class='food-name'>${data.list.item[i].name}</button></div>`);
	}
	
}

function backToHome() {
	$('h1').on('click', function() {
		$('.nutrition-search-form-div, .goals-page, .login-form-div, progress-page').addClass('hidden');
		$('.js-results-div').empty();
		$('.signup-div').removeClass('hidden');
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
	let theNutrients = ['Calories', 'Protein', 'Fat', 'Carbs']
	let theModal = `<div class='pop-outer'><div class='pop-inner'><div class='pop-inner-content'><button class='close'>X</button><h2 class='food-modal-header'>Nutritional Facts</h2>`; 
	for (let i = 0; i < result.report.foods[0].nutrients.length; i++) {
		theModal += `<p class='food-modal-text'><span>${theNutrients[i]}: </span> <span>${result.report.foods[0].nutrients[i].value} ${result.report.foods[0].nutrients[i].unit}</span></p>`;
		nutrientArray.push(result.report.foods[0].nutrients[i].nutrient);
		nutrientAmountArray.push(result.report.foods[0].nutrients[i].value);
	}
	theModal += `<button class='add-a-food'>Add Food Item</button></div></div></div>`;
	$('.div-for-modal').append(theModal);
	$('.js-results-div, .nutrition-search-form-div').addClass('transparent-background');
	$('.pop-outer').fadeIn();
	
	let calories = Number(result.report.foods[0].nutrients[0].value);
	let protein = Number(result.report.foods[0].nutrients[1].value);
	let fat = Number(result.report.foods[0].nutrients[2].value);
	let carbs = Number(result.report.foods[0].nutrients[3].value);
	let theNutrientValues = [calories, protein, fat, carbs];

	for (let i = 0; i < theNutrientValues.length; i++) {
		if (isNaN(theNutrientValues[i]) === true) {
			theNutrientValues[i] = 0;
		}
	}
	

	console.log(fat);
	console.log(theNutrientValues);

	foodEntry.setCalories(theNutrientValues[0]);
	foodEntry.setProtein(theNutrientValues[1]);
	foodEntry.setFat(theNutrientValues[2]);
	foodEntry.setCarbs(theNutrientValues[3]);
	foodEntry.setFoodName(result.report.foods[0].name);   	
}	

function handleCloseAddFoodModal() {
	$('.div-for-modal').on('click', '.close', function(event) {
   $('.js-results-div, .nutrition-search-form-div').removeClass('transparent-background');
   $('.pop-outer').fadeOut();
  });
	
}

function handleAddFood() {
	$('.div-for-modal').on('click', '.add-a-food', function(event) {
  	let food = foodEntry.getConsumedFood();
  	let theDate = new Date();
		let theDay = theDate.toDateString();
		food.date = theDate;
		food.day = theDay;
		addFood(food, addFoodCallback);
  });  	
}

function addFood(food, callback) {
	$.ajax({
		url: '/entries/',
		dataType: 'json',
		method: 'POST',
		contentType: 'application/json',
		headers: {
			Authorization: `Bearer ${localStorage.getItem('token')}`
		},
		data: JSON.stringify(food),
		success: callback
	});
}

function addFoodCallback(data) {
	$('.js-results-div, .nutrition-search-form-div').removeClass('transparent-background');
	$('.pop-outer').fadeOut();

}

function postGoalsData() {
	let theGoals = storeGoals();
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
		headers: {
			Authorization: `Bearer ${localStorage.getItem('token')}`
		},
		data: JSON.stringify(goal),
		success: function(data) {
			console.log(data);
			
		}

	});
}

function getTodayProgressData(callback) {
	$.ajax({
		url: '/entries/total',
		dataType: 'json',
		method: 'GET',
		contentType: 'application/json',
		headers: {
			Authorization: `Bearer ${localStorage.getItem('token')}`
		},
		success: callback
	});
}

function displayTodayProgressData(data) {
	if (data.length === 0) {
		$('.nutrition-tracking').empty();
		$('.nutrition-tracking').append(`
		<p class='calories-today' style='color: green'>Calories: 0</p>
		<p class='fat-today' style='color: green'>Fat: 0 g</p>
		<p class='protein-today' style='color: green'>Protein: 0 g</p>
		<p class='carbs-today' style='color: green'>Carbs: 0 g</p>
	`);
	} else {
			$('.nutrition-tracking').empty();
			$('.nutrition-tracking').append(`
			<p class='calories-today'>Calories: ${data[0].consumedCalories}</p>
			<p class='fat-today'>Fat: ${data[0].consumedFat} g</p>
			<p class='protein-today'>Protein: ${data[0].consumedProtein} g</p>
			<p class='carbs-today'>Carbs: ${data[0].consumedCarbs} g</p>
		`);

			if (data[0].caloriesResult === 'met Goal') {
				$('.calories-today').addClass('red-color');
			}	else if (data[0].caloriesResult === 'below goal') {
				$('.calories-today').addClass('green-color');
			} else {
				$('.calories-today').addClass('line-through');
			}

			if (data[0].fatResult === 'met goal') {
				$('.fat-today').addClass('red-color');
			}	else if (data[0].fatResult === 'below goal') {
				$('.fat-today').addClass('green-color');
			} else {
				$('.fat-today').addClass('line-through');
			}

			if (data[0].proteinResult === 'met goal') {
				$('.protein-today').addClass('red-color');
			}	else if (data[0].proteinResult === 'below goal') {
				$('.protein-today').addClass('green-color');
			} else {
				$('.protein-today').addClass('line-through');
			}

			if (data[0].carbsResult === 'met goal') {
				$('.carbs-today').addClass('red-color');
			}	else if (data[0].carbsResult === 'below goal') {
				$('.carbs-today').addClass('green-color');
			} else {
				$('.carbs-today').addClass('line-through');
			}
	}		
}

function getLongTermProgressData(callback) {
	$.ajax({
		url: '/stats',
		dataType: 'json',
		method: 'GET',
		contentType: 'application/json',
		headers: {
			Authorization: `Bearer ${localStorage.getItem('token')}`
		},
		success: callback
	});
}

function displayLongTermProgressData(data) {
	$('.long-term-progress').empty();
	$('.long-term-progress').append(`
		<div>
			<p class='long-term-progress-paragraph long-term-progress-title'>Met Calories Goals: </p>
			<p class='long-term-progress-paragraph long-term-progress-number'>${data.timesMetCaloriesGoals} times</p>
			<p class='long-term-progress-paragraph long-term-progress-title'>Met Fat Goals: </p>
			<p class='long-term-progress-paragraph long-term-progress-number'>${data.timesMetFatGoals} times</p>
			<p class='long-term-progress-paragraph long-term-progress-title'>Met Protein Goals: </p>
			<p class='long-term-progress-paragraph long-term-progress-number'>${data.timesMetProteinGoals} times</p>
			<p class='long-term-progress-paragraph long-term-progress-title'>Met Carbs Goals: </p>
			<p class='long-term-progress-paragraph long-term-progress-number'>${data.timesMetCarbsGoals} times</p>
			<p class='long-term-progress-paragraph long-term-progress-title'>Met All Goals: </p>
			<p class='long-term-progress-paragraph long-term-progress-number'>${data.timesMetAllGoals} times</p>
			<p class='long-term-progress-paragraph long-term-progress-title'>Met At Least One Goal: </p>
			<p class='long-term-progress-paragraph long-term-progress-number'>${data.timesMetAtLeastOneGoal} times</p>
			<p class='long-term-progress-paragraph long-term-progress-title'>Days I've Been Tracking Current Goal: ${data.daysGoalsHaveBeenTracked} day(s)</p>
			<p class='long-term-progress-paragraph long-term-progress-number'>${data.daysGoalsHaveBeenTracked} day(s)</p>
		</div>
	`);
}

function handleClickMyProgress() {
	$('.main-header').on('click', '.progress-button', function(event) {
		$('.goals-page').addClass('hidden');
		$('.nutrition-search-form-div').addClass('hidden');
		$('.js-results-div').empty();
		getTodayProgressData(displayTodayProgressData);
		getLongTermProgressData(displayLongTermProgressData);
		$('.progress-page').removeClass('hidden');
	});
	
}

function handleClickMyGoalsPage() {
	$('.main-header').on('click', '.goals-button', function(event) {
		$('.nutrition-search-form-div').addClass('hidden');
		$('.progress-page').addClass('hidden');
		$('.js-results-div').empty();
		$('.goals-page').removeClass('hidden');
	});
}

function handleSubmitGoals() {
	$('.nutrients-goals-form').submit(function(event) {
		event.preventDefault();
		postGoalsData();
		getGoals(displayGoals);
		$('.pop-outer-goals').fadeOut();
		$('.goals-page').removeClass('hidden');
		$('.main-header, .goals-page').removeClass('transparent-background');
	});
}

function handleSeeAllFoodButton() {
	$('.see-all-food-button').on('click', function(event) {
		$('.food-entries').empty();
		$('.progress-page, .main-header').addClass('transparent-background');
		$('.pop-outer-food-entries').fadeIn();
		getFoodList(displayFoodList);
	});
}

function handleCloseFoodList() {
	$('.close-food-entries').on('click', function(event) {
		$('.pop-outer-food-entries').fadeOut();
		$('.progress-page, .main-header').removeClass('transparent-background');
	});
}

function getFoodList(callback) {
	$.ajax({
		url: '/entries/list',
		dataType: 'json',
		method: 'GET',
		contentType: 'application/json',
		headers: {
			Authorization: `Bearer ${localStorage.getItem('token')}`
		},
		success: callback
	});
}

function displayFoodList(data) {
	if (data.length === 0) {
		$('.food-entries').append(`
			<div>
				<h2 class='food-list-text-header'>No Food Eaten Today</h2>
			</div>	
	`);
	} else {
		$('.food-entries').append(`
			<h2 class='food-list-text-header'>Food Eaten Today</h2>
		`);
		data.forEach(food => {
			$('.food-entries').append(`
				<div class='food-entry-div'>
					<h3 class='food-list-name'>${food.foodName}</h3>
					<p class='food-list-paragraph'>Calories: ${food.consumedCalories}</p>
					<p class='food-list-paragraph'>Fat: ${food.consumedFat} g</p>
					<p class='food-list-paragraph'>Protein: ${food.consumedProtein} g</p>
					<p class='food-list-paragraph'>Carbs: ${food.consumedCarbs} g</p>
					<button class='delete-food-button' value=${food._id}>delete</button>
				</div>	
		`);
	});
	}
}

function handleDeleteEntry() {
	$('.food-entries').on('click', '.delete-food-button', function(event) {
		let theId = $(this).val();
		let entryDiv = $(this).parent('.food-entry-div');
		deleteEntry(theId, removeEntryFromList, entryDiv);
	});
}

function deleteEntry(id, callback, argument) {
	$.ajax({
		url: `/entries/${id}`,
		method: 'DELETE',
		headers: {
		Authorization: `Bearer ${localStorage.getItem('token')}`
		},
		success: callback(argument)
	});
}

function removeEntryFromList(argument) {
	argument.remove();
	getTodayProgressData(displayTodayProgressData);
	getLongTermProgressData(displayLongTermProgressData);
}

function initApp() {
	handleCloseAddFoodModal();
	handleDeleteEntry();
	handleSeeAllFoodButton();
	handleCloseFoodList();
	handleAddFood();
	handleClickMyProgress();
	handleClickMyGoalsPage();
	handleSignUpForm();
	handleLogInForm();
 	handleNutritionSearchClick();
 	displayLogInPage();
 	backToHome();
 	handleSubmitSearchFoods();
 	displayModal();
 	displayGoalsModal();
 	handleSubmitGoals(); 
}

$(initApp);












































