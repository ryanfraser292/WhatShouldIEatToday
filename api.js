export const getFeaturedRecipes = async() => {
	const url = "https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/random?number=5";
	const response = await fetch(url, 
		{
			"method":"GET",
			"headers":{
				"x-rapidapi-key": "5fa26855abmshaaf88e28fe0feddp13f243jsn81540a1786b2",
				"x-rapidapi-host": "spoonacular-recipe-food-nutrition-v1.p.rapidapi.com"
			}
		});
	const result = await response.json();
	return result;
}

export const searchRecipes = async(parameters) => {
	var query = parameters;
	var split = query.split(" ");
	var newquery = '';
	for(var i=0;i<split.length;i++){
		var newquery = newquery.concat(split[i]+'%20')
	}
	const url = "https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/search?query="+newquery+"&number=5";
	const response = await fetch(url,
		{
			"method":"GET",
			"headers":{
				"x-rapidapi-key": "5fa26855abmshaaf88e28fe0feddp13f243jsn81540a1786b2",
				"x-rapidapi-host": "spoonacular-recipe-food-nutrition-v1.p.rapidapi.com"
			}
		});
	const result = await response.json();
	return result;
}