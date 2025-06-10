// Global variables and functions
let todos = [];
let currentFilter = 'all';

function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

function renderTodos() {
    const todoList = document.getElementById('todoList');
    todoList.innerHTML = '';
    const filteredTodos = filterTodos(todos, currentFilter);
    filteredTodos.forEach((todo) => {
        const realIndex = todos.indexOf(todo);
        const li = document.createElement('li');
        li.dataset.id = realIndex;
        li.className = `flex flex-col gap-1 p-3 rounded-xl transition-all duration-200 ${
            todo.completed ? 'bg-neutral-100 opacity-70' : 'bg-white'
        } hover:shadow-md border border-neutral-200`;
        li.innerHTML = `
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <input type="checkbox" ${todo.completed ? 'checked' : ''} 
                        class="w-5 h-5 text-neutral-600 rounded focus:ring-neutral-500 cursor-pointer toggle-checkbox">
                    <span class="${todo.completed ? 'line-through text-neutral-400' : 'text-neutral-700'}">
                        ${todo.text}
                    </span>
                </div>
                <button class="delete-btn text-neutral-400 hover:text-neutral-700 focus:outline-none transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                </button>
            </div>
            <div class="flex flex-wrap gap-2 text-sm text-neutral-500 mt-1">
                <span>📍 ${todo.place ? todo.place : '-'}</span>
                <span>🕒 ${todo.time ? todo.time.replace('T', ' ') : '-'}</span>
            </div>
        `;
        todoList.appendChild(li);
    });
    // 이벤트 위임
    todoList.querySelectorAll('.toggle-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', function(e) {
            const li = e.target.closest('li');
            const idx = parseInt(li.dataset.id);
            todos[idx].completed = !todos[idx].completed;
            saveTodos();
            renderTodos();
        });
    });
    todoList.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            const li = e.target.closest('li');
            const idx = parseInt(li.dataset.id);
            todos.splice(idx, 1);
            saveTodos();
            renderTodos();
        });
    });
}

function filterTodos(todos, filter) {
    switch(filter) {
        case 'active':
            return todos.filter(todo => !todo.completed);
        case 'completed':
            return todos.filter(todo => todo.completed);
        default:
            return todos;
    }
}

// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', () => {
    const todoInput = document.getElementById('todoInput');
    const addTodoBtn = document.getElementById('addTodo');
    const todoList = document.getElementById('todoList');
    const filterAll = document.getElementById('filterAll');
    const filterActive = document.getElementById('filterActive');
    const filterCompleted = document.getElementById('filterCompleted');
    const placeInput = document.getElementById('placeInput');
    const timeInput = document.getElementById('timeInput');
    // flatpickr 적용
    flatpickr(timeInput, {
        enableTime: true,
        dateFormat: "Y-m-d H:i",
        time_24hr: true,
        locale: "ko",
        allowInput: true,
        minuteIncrement: 5,
    });
    const searchAddressBtn = document.getElementById('searchAddressBtn');
    const addressModal = document.getElementById('addressModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    // Load todos from localStorage
    todos = JSON.parse(localStorage.getItem('todos')) || [];

    // Initialize Sortable
    new Sortable(todoList, {
        animation: 150,
        ghostClass: 'bg-neutral-100',
        onEnd: () => {
            const items = todoList.querySelectorAll('li');
            const newTodos = [];
            items.forEach(item => {
                const idx = parseInt(item.dataset.id);
                newTodos.push(todos[idx]);
            });
            todos = newTodos;
            saveTodos();
            renderTodos();
        }
    });

    function addTodo() {
        const text = todoInput.value.trim();
        const place = placeInput.value.trim();
        const time = timeInput.value;
        if (text) {
            todos.push({ text, place, time, completed: false });
            todoInput.value = '';
            placeInput.value = '';
            timeInput.value = '';
            saveTodos();
            renderTodos();
        }
    }

    addTodoBtn.addEventListener('click', addTodo);
    todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTodo();
        }
    });

    // 카카오 주소검색 모달
    searchAddressBtn.addEventListener('click', () => {
        addressModal.classList.remove('hidden');
        new daum.Postcode({
            oncomplete: function(data) {
                placeInput.value = data.address;
                addressModal.classList.add('hidden');
            },
            onclose: function() {
                addressModal.classList.add('hidden');
            }
        }).embed(document.getElementById('daumPostcode'));
    });
    closeModalBtn.addEventListener('click', () => {
        addressModal.classList.add('hidden');
    });
    addressModal.addEventListener('click', (e) => {
        if (e.target === addressModal) addressModal.classList.add('hidden');
    });

    filterAll.addEventListener('click', () => {
        currentFilter = 'all';
        updateFilterButtons();
        renderTodos();
    });
    filterActive.addEventListener('click', () => {
        currentFilter = 'active';
        updateFilterButtons();
        renderTodos();
    });
    filterCompleted.addEventListener('click', () => {
        currentFilter = 'completed';
        updateFilterButtons();
        renderTodos();
    });

    function updateFilterButtons() {
        [filterAll, filterActive, filterCompleted].forEach(btn => {
            btn.className = 'px-3 py-1 rounded-lg ' + 
                (btn.id.toLowerCase().includes(currentFilter) || (currentFilter === 'all' && btn.id === 'filterAll')
                    ? 'bg-neutral-800 text-white'
                    : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300');
        });
    }

    updateFilterButtons();
    renderTodos();
});