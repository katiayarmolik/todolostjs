document.addEventListener("DOMContentLoaded", () => {
    const API_URL = "http://localhost:3000/todos";
    const todoList = document.getElementById("todoList");
    const todoInput = document.getElementById("todoInput");
    const addTodoBtn = document.getElementById("addTodoBtn");
    const searchInput = document.getElementById("searchInput");
    const searchBtn = document.getElementById("searchBtn");

    async function fetchTodos(query = "") {
        const url = query ? `${API_URL}?q=${query}` : API_URL;
        const response = await fetch(url);
        const todos = await response.json();
        renderTodos(todos);
    }

    function renderTodos(todos) {
        todoList.innerHTML = "";
        todos.forEach(todo => {
            const li = document.createElement("li");

            const statusClass = getStatusClass(todo.completed);
            const statusText = getStatusText(todo.completed);

            li.innerHTML = `
                <span class="todo-text">${todo.text}</span>
                <span class="todo-status ${statusClass}" data-id="${todo.id}">${statusText}</span>
                <button data-id="${todo.id}">Delete</button>
            `;
            todoList.appendChild(li);
        });
    }

    function getStatusClass(completed) {
        if (completed === null) return 'status-pending';  // Статус очікування
        return completed ? 'status-completed' : 'status-in-progress';  // Готово чи в процесі
    }

    function getStatusText(completed) {
        if (completed === null) return 'Pending';
        return completed ? 'Completed' : 'In Progress';
    }

    todoList.addEventListener("click", async (e) => {
        if (e.target.classList.contains("todo-status")) {
            const id = e.target.getAttribute("data-id");
            const todo = await fetch(`${API_URL}/${id}`).then(response => response.json());
            const updatedStatus = !todo.completed;

            await fetch(`${API_URL}/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ completed: updatedStatus })
            });
            fetchTodos();
        } else if (e.target.tagName === "BUTTON") {
            const id = e.target.getAttribute("data-id");
            await fetch(`${API_URL}/${id}`, { method: "DELETE" });
            fetchTodos();
        }
    });

    addTodoBtn.addEventListener("click", async () => {
        const text = todoInput.value.trim();
        if (text) {
            await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text, completed: false }),
            });
            todoInput.value = "";
            fetchTodos();
        }
    });

    searchBtn.addEventListener("click", () => {
        const query = searchInput.value.trim();
        fetchTodos(query);
    });

    fetchTodos();
});
