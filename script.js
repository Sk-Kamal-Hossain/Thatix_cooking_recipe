// DOM Elements
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const recipeGrid = document.getElementById('recipeGrid');
const modal = document.getElementById('recipeModal');
const modalBody = document.getElementById('modalBody');
const closeBtn = document.querySelector('.close');

// API Base URL
const API_BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    loadLatestRecipes();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
    closeBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
}

// Load latest recipes on page load
async function loadLatestRecipes() {
    try {
        showLoading();
        // Search for common ingredients to get a variety of recipes
        const commonSearches = ['chicken', 'beef', 'pasta', 'salad', 'dessert'];
        const randomSearch = commonSearches[Math.floor(Math.random() * commonSearches.length)];
        const response = await fetch(`${API_BASE_URL}/search.php?s=${randomSearch}`);
        const data = await response.json();
        
        if (data.meals) {
            displayRecipes(data.meals);
        } else {
            // Try another search if first one fails
            const fallbackResponse = await fetch(`${API_BASE_URL}/search.php?s=`);
            const fallbackData = await fallbackResponse.json();
            if (fallbackData.meals) {
                displayRecipes(fallbackData.meals.slice(0, 12));
            } else {
                showError('No recipes found. Please try searching for something specific.');
            }
        }
    } catch (error) {
        console.error('Error loading latest recipes:', error);
        showError('Failed to load recipes. Please try again later.');
    }
}

// Handle search functionality
async function handleSearch() {
    const searchTerm = searchInput.value.trim();
    
    if (!searchTerm) {
        loadLatestRecipes();
        return;
    }
    
    try {
        showLoading();
        const response = await fetch(`${API_BASE_URL}/search.php?s=${searchTerm}`);
        const data = await response.json();
        
        if (data.meals) {
            displayRecipes(data.meals);
        } else {
            showError(`No recipes found for "${searchTerm}". Try searching for something else.`);
        }
    } catch (error) {
        console.error('Error searching recipes:', error);
        showError('Failed to search recipes. Please try again.');
    }
}

// Display recipes in the grid
function displayRecipes(recipes) {
    recipeGrid.innerHTML = '';
    
    recipes.forEach(recipe => {
        const recipeCard = createRecipeCard(recipe);
        recipeGrid.appendChild(recipeCard);
    });
}

// Create a recipe card element
function createRecipeCard(recipe) {
    const card = document.createElement('div');
    card.className = 'recipe-card';
    
    const imageUrl = recipe.strMealThumb || 'https://via.placeholder.com/300x200?text=No+Image';
    const title = recipe.strMeal || 'Unknown Recipe';
    const description = recipe.strInstructions ? 
        recipe.strInstructions.substring(0, 100) + '...' : 
        'No description available';
    
    card.innerHTML = `
        <img src="${imageUrl}" alt="${title}" onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
        <div class="recipe-card-content">
            <h3>${title}</h3>
            <p>${description}</p>
            <button class="view-details-btn" onclick="viewRecipeDetails('${recipe.idMeal}')">
                VIEW DETAILS
            </button>
        </div>
    `;
    
    return card;
}

// View recipe details in modal
async function viewRecipeDetails(mealId) {
    try {
        const response = await fetch(`${API_BASE_URL}/lookup.php?i=${mealId}`);
        const data = await response.json();
        
        if (data.meals && data.meals[0]) {
            displayRecipeDetails(data.meals[0]);
            openModal();
        } else {
            showError('Recipe details not found.');
        }
    } catch (error) {
        console.error('Error fetching recipe details:', error);
        showError('Failed to load recipe details.');
    }
}

// Display recipe details in modal
function displayRecipeDetails(recipe) {
    const imageUrl = recipe.strMealThumb || 'https://via.placeholder.com/400x300?text=No+Image';
    const title = recipe.strMeal || 'Unknown Recipe';
    const category = recipe.strCategory || 'Unknown Category';
    const area = recipe.strArea || 'Unknown Origin';
    const instructions = recipe.strInstructions || 'No instructions available';
    
    // Get ingredients
    const ingredients = getIngredients(recipe);
    
    modalBody.innerHTML = `
        <img src="${imageUrl}" alt="${title}" class="modal-recipe-img" onerror="this.src='https://via.placeholder.com/400x300?text=No+Image'">
        <h2 class="modal-recipe-title">${title}</h2>
        <div>
            <span class="modal-recipe-category">${category}</span>
            <span class="modal-recipe-category" style="background: #3498db; margin-left: 0.5rem;">${area}</span>
        </div>
        
        <div class="modal-recipe-ingredients">
            <h3>Ingredients</h3>
            <ul>
                ${ingredients.map(ingredient => `<li>${ingredient}</li>`).join('')}
            </ul>
        </div>
        
        <div class="modal-recipe-instructions">
            <h3>Instructions</h3>
            <p>${instructions}</p>
        </div>
    `;
}

// Extract ingredients from recipe data
function getIngredients(recipe) {
    const ingredients = [];
    
    for (let i = 1; i <= 20; i++) {
        const ingredient = recipe[`strIngredient${i}`];
        const measure = recipe[`strMeasure${i}`];
        
        if (ingredient && ingredient.trim()) {
            const fullIngredient = measure ? 
                `${measure} ${ingredient}` : 
                ingredient;
            ingredients.push(fullIngredient);
        }
    }
    
    return ingredients;
}

// Modal functions
function openModal() {
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Loading state
function showLoading() {
    recipeGrid.innerHTML = '<div class="loading">Loading delicious recipes...</div>';
}

// Error message
function showError(message) {
    recipeGrid.innerHTML = `<div class="error-message">${message}</div>`;
}

// Make viewRecipeDetails globally accessible
window.viewRecipeDetails = viewRecipeDetails;
