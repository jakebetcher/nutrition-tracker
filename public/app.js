'use strict'

function renderNutritionSearchPage() {
	return `
		<form class='nutrition-search-form'>
		<legend class='nutrition-search-legend'>Search for all kinds of foods and find their nutritional information.</legend>
			<div>
				<label for='search-nutrition'>Enter Food Name Here: </label>
				<input name='search-nutrition' id='search-nutrition' class='search-nutrition-input' placeholder="Reese's Puffs" required>
			</div>
			<div>
				<button class='food-search-button' type="submit">Search Foods</button>
			</div>	
		</form>
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
}

handleNutritionSearchClick();