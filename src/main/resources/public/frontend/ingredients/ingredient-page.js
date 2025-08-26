/**
 * This script defines the add, view, and delete operations for Ingredient objects in the Recipe Management Application.
 */

const BASE_URL = "http://localhost:8081"; // backend URL

// Array to keep track of ingredients
let ingredients = [];

// Wait for DOM to fully load before accessing elements
window.addEventListener("DOMContentLoaded", () => {
    
    // Get references to various DOM elements
    const addIngredientNameInput = document.getElementById('add-ingredient-name-input');
    const deleteIngredientNameInput = document.getElementById('delete-ingredient-name-input');
    const ingredientListContainer = document.getElementById('ingredient-list');
    const addIngredientSubmitButton = document.getElementById('add-ingredient-submit-button');
    const deleteIngredientSubmitButton = document.getElementById('delete-ingredient-submit-button');
    
    // Attach 'onclick' events to buttons
    addIngredientSubmitButton.addEventListener('click', addIngredient);
    deleteIngredientSubmitButton.addEventListener('click', deleteIngredient);
    
    // On page load, call getIngredients()
    getIngredients();

    /**
     * Add Ingredient Function
     * 
     * Requirements:
     * - Read and trim value from addIngredientNameInput
     * - Validate input is not empty
     * - Send POST request to /ingredients
     * - Include Authorization token from sessionStorage
     * - On success: clear input, call getIngredients() and refreshIngredientList()
     * - On failure: alert the user
     */
    async function addIngredient() {
        try {
            // Read and trim value from input
            const ingredientName = addIngredientNameInput.value.trim();
            
            // Validate input is not empty
            if (!ingredientName) {
                alert('Please enter an ingredient name');
                return;
            }
            
            // Get auth token from sessionStorage
            const token = sessionStorage.getItem('auth-token');
            
            // Send POST request to /ingredients
            const response = await fetch(`${BASE_URL}/ingredients`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify({
                    name: ingredientName
                })
            });
            
            if (response.status === 201) {
                // Clear input
                addIngredientNameInput.value = '';
                // Refresh the ingredients list
                await getIngredients();
                refreshIngredientList();
            } else if (response.status === 401) {
                alert('Unauthorized: Please login again');
            } else if (response.status === 403) {
                alert('Forbidden: Admin access required');
            } else {
                alert('Failed to add ingredient');
            }
            
        } catch (error) {
            console.error('Add ingredient error:', error);
            alert('Error adding ingredient');
        }
    }

    /**
     * Get Ingredients Function
     * 
     * Requirements:
     * - Fetch all ingredients from backend
     * - Store result in `ingredients` array
     * - Call refreshIngredientList() to display them
     * - On error: alert the user
     */
    async function getIngredients() {
        try {
            // Get auth token from sessionStorage
            const token = sessionStorage.getItem('auth-token');
            
            // Fetch all ingredients from backend
            const response = await fetch(`${BASE_URL}/ingredients`, {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            });
            
            if (response.ok) {
                // Store result in ingredients array
                ingredients = await response.json();
                // Call refreshIngredientList to display them
                refreshIngredientList();
            } else if (response.status === 401) {
                alert('Unauthorized: Please login');
                window.location.href = '../login/login-page.html';
            } else {
                alert('Failed to fetch ingredients');
            }
            
        } catch (error) {
            console.error('Get ingredients error:', error);
            alert('Error fetching ingredients');
        }
    }

    /**
     * Delete Ingredient Function
     * 
     * Requirements:
     * - Read and trim value from deleteIngredientNameInput
     * - Search ingredientListContainer's <li> elements for matching name
     * - Determine ID based on index (or other backend logic)
     * - Send DELETE request to /ingredients/{id}
     * - On success: call getIngredients() and refreshIngredientList(), clear input
     * - On failure or not found: alert the user
     */
    async function deleteIngredient() {
        try {
            // Read and trim value from input
            const ingredientName = deleteIngredientNameInput.value.trim();
            
            // Validate input is not empty
            if (!ingredientName) {
                alert('Please enter an ingredient name to delete');
                return;
            }
            
            // Find the ingredient by name to get its ID
            const ingredient = ingredients.find(i => i.name === ingredientName);
            
            if (!ingredient) {
                alert('Ingredient not found');
                return;
            }
            
            // Get auth token from sessionStorage
            const token = sessionStorage.getItem('auth-token');
            
            // Send DELETE request to /ingredients/{id}
            const response = await fetch(`${BASE_URL}/ingredients/${ingredient.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            });
            
            if (response.status === 204 || response.status === 200) {
                // Clear input
                deleteIngredientNameInput.value = '';
                // Refresh the ingredients list
                await getIngredients();
                refreshIngredientList();
            } else if (response.status === 401) {
                alert('Unauthorized: Please login again');
            } else if (response.status === 403) {
                alert('Forbidden: Admin access required');
            } else if (response.status === 404) {
                alert('Ingredient not found');
            } else {
                alert('Failed to delete ingredient');
            }
            
        } catch (error) {
            console.error('Delete ingredient error:', error);
            alert('Error deleting ingredient');
        }
    }

    /**
     * Refresh Ingredient List Function
     * 
     * Requirements:
     * - Clear ingredientListContainer
     * - Loop through `ingredients` array
     * - For each ingredient:
     *   - Create <li> and inner <p> with ingredient name
     *   - Append to container
     */
    function refreshIngredientList() {
        // Clear ingredientListContainer
        ingredientListContainer.innerHTML = '';
        
        // Loop through ingredients array
        ingredients.forEach(ingredient => {
            // Create <li> element
            const listItem = document.createElement('li');
            // Create inner <p> element with ingredient name
            const paragraph = document.createElement('p');
            paragraph.textContent = ingredient.name;
            // Append <p> to <li>
            listItem.appendChild(paragraph);
            // Append <li> to container
            ingredientListContainer.appendChild(listItem);
        });
    }

});