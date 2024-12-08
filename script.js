// Get references to the DOM elements
const taskInput = document.getElementById('taskInput');
const categoryInput = document.getElementById('categoryInput');
const addCategoryBtn = document.getElementById('addCategoryBtn');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const categoryFilter = document.getElementById('categoryFilter');
const taskCategory = document.getElementById('taskCategory');
const taskTimeframe = document.getElementById('taskTimeframe');
const downloadBtn = document.getElementById('downloadBtn');

// Event listener for adding a category
addCategoryBtn.addEventListener('click', addCategory);

// Event listener for adding a task
addTaskBtn.addEventListener('click', addTask);

// Event listener for category filter change
categoryFilter.addEventListener('change', renderTasks);

// Event listener for download button
downloadBtn.addEventListener('click', downloadPDF);

// Load categories and tasks from localStorage on page load
document.addEventListener('DOMContentLoaded', loadApp);

// Function to add a new category
function addCategory() {
    const categoryName = categoryInput.value.trim();
    if (categoryName === "") {
        alert("Please enter a category.");
        return;
    }

    const categories = getCategoriesFromStorage();
    if (categories.includes(categoryName)) {
        alert("Category already exists.");
        return;
    }

    categories.push(categoryName);
    saveCategoriesToStorage(categories);
    renderCategories();
    categoryInput.value = ""; // Clear input field
}

// Function to add a task
function addTask() {
    const taskText = taskInput.value.trim();
    const selectedCategory = taskCategory.value;
    const timeframe = taskTimeframe.value; // This now captures both date and time
    if (taskText === "" || selectedCategory === "" || !timeframe) {
        alert("Please enter a task, select a category, and set a timeframe.");
        return;
    }

    const task = {
        text: taskText,
        category: selectedCategory,
        timeframe: timeframe,
        completed: false
    };

    const tasks = getTasksFromStorage();
    tasks.push(task);
    saveTasksToStorage(tasks);

    renderTasks();
    taskInput.value = ""; // Clear task input
    taskTimeframe.value = ""; // Clear timeframe input
}

// Function to render tasks based on category filter
function renderTasks() {
    const tasks = getTasksFromStorage();
    const filter = categoryFilter.value;

    taskList.innerHTML = "";
    tasks.forEach((task, index) => {
        if (filter && task.category !== filter) return;

        const li = document.createElement('li');
        if (task.completed) {
            li.classList.add('completed');
        }

        // Convert the timeframe to a readable format
        const date = new Date(task.timeframe);
        const formattedDate = date.toLocaleString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });

        li.innerHTML = `
            <span class="task-text">${task.text} (${task.category}) - Due: ${formattedDate}</span>
            <button class="complete-btn" onclick="toggleComplete(${index})">✓</button>
            <button class="delete-btn" onclick="deleteTask(${index})">Delete</button>
        `;
        taskList.appendChild(li);
    });
}

// Function to render categories in the dropdown
function renderCategories() {
    const categories = getCategoriesFromStorage();
    categoryFilter.innerHTML = '<option value="">All Categories</option>'; // Reset filter
    taskCategory.innerHTML = '<option value="">Select Category</option>'; // Reset task category dropdown

    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);

        const taskOption = document.createElement('option');
        taskOption.value = category;
        taskOption.textContent = category;
        taskCategory.appendChild(taskOption);
    });
}

// Function to toggle task completion
function toggleComplete(index) {
    const tasks = getTasksFromStorage();
    tasks[index].completed = !tasks[index].completed;
    saveTasksToStorage(tasks);
    renderTasks();
}

// Function to delete a task
function deleteTask(index) {
    const tasks = getTasksFromStorage();
    tasks.splice(index, 1);
    saveTasksToStorage(tasks);
    renderTasks();
}

// Function to get tasks from localStorage
function getTasksFromStorage() {
    const tasks = localStorage.getItem('tasks');
    return tasks ? JSON.parse(tasks) : [];
}

// Function to get categories from localStorage
function getCategoriesFromStorage() {
    const categories = localStorage.getItem('categories');
    return categories ? JSON.parse(categories) : [];
}

// Function to save tasks to localStorage
function saveTasksToStorage(tasks) {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Function to save categories to localStorage
function saveCategoriesToStorage(categories) {
    localStorage.setItem('categories', JSON.stringify(categories));
}

// Function to load categories and tasks on page load
function loadApp() {
    renderCategories();
    renderTasks();
}

// Function to download tasks as a PDF
function downloadPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const tasks = getTasksFromStorage();
    const filter = categoryFilter.value;

    let y = 10; // Starting Y position

    // Add a title to the PDF
    doc.setFontSize(18);
    doc.text('Task Manager Report', 10, y);
    y += 10;

    // Add a list of tasks
    doc.setFontSize(12);
    tasks.forEach((task, index) => {
        if (filter && task.category !== filter) return;
        doc.text(`${task.text} (${task.category}) - Due: ${task.timeframe} - ${task.completed ? 'Completed' : 'Pending'}`, 10, y);
        y += 10;

        // Check if the page is full and add a new page if necessary
        if (y > 270) {
            doc.addPage();
            y = 10;
        }
    });

    // Save the PDF to the user's device
    doc.save('task-manager-report.pdf');
}
