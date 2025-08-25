/**
 * This script defines the CRUD operations for Recipe objects in the Recipe Management Application.
 */

const BASE_URL = "http://localhost:8081"; // backend URL

let recipes = [];

// Wait for DOM to fully load before accessing elements
window.addEventListener("DOMContentLoaded", () => {

    // Get references to various DOM elements
    const addRecipeNameInput = document.getElementById('add-recipe-name-input');
    const addRecipeInstructionsInput = document.getElementById('add-recipe-instructions-input');
    const addRecipeSubmitButton = document.getElementById('add-recipe-submit-input');
    
    const updateRecipeNameInput = document.getElementById('update-recipe-name-input');
    const updateRecipeInstructionsInput = document.getElementById('update-recipe-instructions-input');
    const updateRecipeSubmitButton = document.getElementById('update-recipe-submit-input');
    
    const deleteRecipeNameInput = document.getElementById('delete-recipe-name-input');
    const deleteRecipeSubmitButton = document.getElementById('delete-recipe-submit-input');
    
    const recipeListContainer = document.getElementById('recipe-list');
    const adminLink = document.getElementById('admin-link');
    const logoutButton = document.getElementById('logout-button');
    
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');

    // Show logout button if auth-token exists in sessionStorage
    if (sessionStorage.getItem('auth-token')) {
        logoutButton.style.display = 'block';
    }

    // Show admin link if is-admin flag in sessionStorage is "true"
    if (sessionStorage.getItem('is-admin') === 'true') {
        adminLink.style.display = 'block';
    }

    // Attach event handlers
    addRecipeSubmitButton.addEventListener('click', addRecipe);
    updateRecipeSubmitButton.addEventListener('click', updateRecipe);
    deleteRecipeSubmitButton.addEventListener('click', deleteRecipe);
    searchButton.addEventListener('click', searchRecipes);
    logoutButton.addEventListener('click', processLogout);

    // On page load, call getRecipes() to populate the list
    getRecipes();

    /**
     * Search Recipes Function
     * - Read search term from input field
     * - Send GET request with name query param
     * - Update the recipe list using refreshRecipeList()
     * - Handle fetch errors and alert user
     */
    async function searchRecipes() {
        try {
            const searchTerm = searchInput.value.trim();
            
            // If search term is empty, get all recipes
            if (!searchTerm) {
                await getRecipes();
                return;
            }
            
            const token = sessionStorage.getItem('auth-token');
            
            const response = await fetch(`${BASE_URL}/recipes?name=${encodeURIComponent(searchTerm)}`, {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                recipes = await response.json();
                refreshRecipeList();
            } else if (response.status === 404) {
                recipes = [];
                refreshRecipeList();
            } else {
                alert('Error searching recipes');
            }
        } catch (error) {
            console.error('Search error:', error);
            alert('Failed to search recipes');
        }
    }

    /**
     * Add Recipe Function
     * - Get values from add form inputs
     * - Validate both name and instructions
     * - Send POST request to /recipes
     * - Use Bearer token from sessionStorage
     * - On success: clear inputs, fetch latest recipes, refresh the list
     */
    async function addRecipe() {
        try {
            const name = addRecipeNameInput.value.trim();
            const instructions = addRecipeInstructionsInput.value.trim();
            
            // Validate inputs
            if (!name || !instructions) {
                alert('Please provide both recipe name and instructions');
                return;
            }
            
            const token = sessionStorage.getItem('auth-token');
            
            const response = await fetch(`${BASE_URL}/recipes`, {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: name,
                    instructions: instructions
                })
            });
            
            if (response.status === 201) {
                // Clear inputs
                addRecipeNameInput.value = '';
                addRecipeInstructionsInput.value = '';
                
                // Fetch latest recipes and refresh list
                await getRecipes();
            } else if (response.status === 401) {
                alert('Unauthorized: Please login again');
            } else {
                alert('Failed to add recipe');
            }
        } catch (error) {
            console.error('Add recipe error:', error);
            alert('Error adding recipe');
        }
    }

    /**
     * Update Recipe Function
     * - Get values from update form inputs
     * - Validate both name and updated instructions
     * - Fetch current recipes to locate the recipe by name
     * - Send PUT request to update it by ID
     * - On success: clear inputs, fetch latest recipes, refresh the list
     */
    async function updateRecipe() {
        try {
            const name = updateRecipeNameInput.value.trim();
            const instructions = updateRecipeInstructionsInput.value.trim();
            
            // Validate inputs
            if (!name || !instructions) {
                alert('Please provide both recipe name and new instructions');
                return;
            }
            
            // Find the recipe by name to get its ID
            const recipe = recipes.find(r => r.name === name);
            if (!recipe) {
                alert('Recipe not found');
                return;
            }
            
            const token = sessionStorage.getItem('auth-token');
            
            const response = await fetch(`${BASE_URL}/recipes/${recipe.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: recipe.id,
                    name: recipe.name,
                    instructions: instructions,
                    author: recipe.author
                })
            });
            
            if (response.ok) {
                // Clear inputs
                updateRecipeNameInput.value = '';
                updateRecipeInstructionsInput.value = '';
                
                // Fetch latest recipes and refresh list
                await getRecipes();
            } else if (response.status === 401) {
                alert('Unauthorized: Please login again');
            } else {
                alert('Failed to update recipe');
            }
        } catch (error) {
            console.error('Update recipe error:', error);
            alert('Error updating recipe');
        }
    }

    /**
     * Delete Recipe Function
     * - Get recipe name from delete input
     * - Find matching recipe in list to get its ID
     * - Send DELETE request using recipe ID
     * - On success: refresh the list
     */
    async function deleteRecipe() {
        try {
            const name = deleteRecipeNameInput.value.trim();
            
            // Validate input
            if (!name) {
                alert('Please provide a recipe name to delete');
                return;
            }
            
            // Find the recipe by name to get its ID
            const recipe = recipes.find(r => r.name === name);
            if (!recipe) {
                alert('Recipe not found');
                return;
            }
            
            const token = sessionStorage.getItem('auth-token');
            
            const response = await fetch(`${BASE_URL}/recipes/${recipe.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            });
            
            if (response.ok) {
                // Clear input
                deleteRecipeNameInput.value = '';
                
                // Fetch latest recipes and refresh list
                await getRecipes();
            } else if (response.status === 401) {
                alert('Unauthorized: Please login again');
            } else if (response.status === 403) {
                alert('Forbidden: Admin access required');
            } else {
                alert('Failed to delete recipe');
            }
        } catch (error) {
            console.error('Delete recipe error:', error);
            alert('Error deleting recipe');
        }
    }

    /**
     * Get Recipes Function
     * - Fetch all recipes from backend
     * - Store in recipes array
     * - Call refreshRecipeList() to display
     */
    async function getRecipes() {
        try {
            const token = sessionStorage.getItem('auth-token');
            
            const response = await fetch(`${BASE_URL}/recipes`, {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            });
            
            if (response.ok) {
                recipes = await response.json();
                refreshRecipeList();
            } else if (response.status === 401) {
                alert('Unauthorized: Please login');
                window.location.href = '../login/login-page.html';
            } else {
                alert('Failed to fetch recipes');
            }
        } catch (error) {
            console.error('Get recipes error:', error);
            alert('Error fetching recipes');
        }
    }

    /**
     * Refresh Recipe List Function
     * - Clear current list in DOM
     * - Create <li> elements for each recipe with name + instructions
     * - Append to list container
     */
    function refreshRecipeList() {
        // Clear the current list
        recipeListContainer.innerHTML = '';
        
        // Create and append list items for each recipe
        recipes.forEach(recipe => {
            const listItem = document.createElement('li');
            const recipeParagraph = document.createElement('p');
            recipeParagraph.textContent = `${recipe.name}: ${recipe.instructions}`;
            listItem.appendChild(recipeParagraph);
            recipeListContainer.appendChild(listItem);
        });
    }

    /**
     * Logout Function
     * - Send POST request to /logout
     * - Use Bearer token from sessionStorage
     * - On success: clear sessionStorage and redirect to login
     * - On failure: alert the user
     */
    async function processLogout() {
        try {
            const token = sessionStorage.getItem('auth-token');
            
            const response = await fetch(`${BASE_URL}/logout`, {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            });
            
            if (response.ok) {
                // Clear sessionStorage
                sessionStorage.removeItem('auth-token');
                sessionStorage.removeItem('is-admin');
                
                // Redirect to login page
                window.location.href = '../login/login-page.html';
            } else {
                alert('Logout failed');
            }
        } catch (error) {
            console.error('Logout error:', error);
            alert('Error during logout');
        }
    }

});