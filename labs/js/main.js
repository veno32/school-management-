let tasks = [];

function loadTasks() {
    const savedTasks = localStorage.getItem('labTasks');
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
        renderTasks();
    }
}

function saveTasks() {
    localStorage.setItem('labTasks', JSON.stringify(tasks));
}

function createTask() {
    const taskInput = document.getElementById('taskInput');
    const task = taskInput.value.trim();
    
    if (task) {
        tasks.push({ id: Date.now(), name: task });
        taskInput.value = '';
        saveTasks();
        renderTasks();
    }
}

function renderTasks() {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = ''; 

    tasks.forEach(task => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${task.name}</td>
            <td>
                <a href="view.html?id=${task.id}" class="btn btn-info btn-sm">View</a>
                <button onclick="editTask(${task.id})" class="btn btn-warning btn-sm">Edit</button>
                <button onclick="deleteTask(${task.id})" class="btn btn-danger btn-sm">Delete</button>
            </td>`;
        taskList.appendChild(tr);
    });
}

// Update operation: Edit a task
function editTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const newTaskName = prompt("Enter the new lab name:", task.name);
    if (newTaskName && newTaskName.trim()) {
        tasks = tasks.map(task => 
            task.id === id ? { ...task, name: newTaskName.trim() } : task
        );
        saveTasks();
        renderTasks();
    }
}

function deleteTask(id) {
    if (confirm('Are you sure you want to delete this lab?')) {
        tasks = tasks.filter(task => task.id !== id);
        saveTasks();  
        renderTasks();
    }
}
loadTasks();

getLabId() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

loadComponents() {
    const labId = this.getLabId();
    if (!labId) return;

    const savedComponents = localStorage.getItem(`lab_${labId}_components`);
    if (savedComponents) {
        this.components = JSON.parse(savedComponents);
        this.renderComponents();
    }
}

saveComponents() {
    const labId = this.getLabId();
    if (!labId) return;
    localStorage.setItem(`lab_${labId}_components`, JSON.stringify(this.components));
}

createComponent() {
    const typeInput = document.getElementById('typeInput');
    const quantityInput = document.getElementById('quantityInput');
    const commentsInput = document.getElementById('commentsInput');
    const runningInput = document.getElementById('runningInput');
    const damageInput = document.getElementById('damageInput');

    const type = typeInput.value.trim();
    const quantity = parseInt(quantityInput.value) || 0;
    const comments = commentsInput.value.trim();
    const running = parseInt(runningInput.value) || 0;
    const damage = parseInt(damageInput.value) || 0;

    if (type && quantity > 0) {
        const newComponent = {
            id: Date.now(),
            type,
            quantity,
            comments,
            running,
            damage
        };

        this.components.push(newComponent);
        this.saveComponents();
        this.renderComponents();

        // Clear form and close modal
        [typeInput, quantityInput, commentsInput, runningInput, damageInput]
            .forEach(input => input.value = '');

        const modal = bootstrap.Modal.getInstance(document.getElementById('exampleModal'));
        modal?.hide();
    } else {
        alert('Please fill in at least the type and quantity fields');
    }
}

renderComponents() {
    const tbody = document.getElementById('componentsTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';
    this.components.forEach((component, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${component.type}</td>
            <td>${component.quantity}</td>
            <td>${component.running}</td>
            <td>${component.damage}</td>
            <td>${component.comments || 'no comments'}</td>
            <td>
                <button class="btn btn-info btn-sm" onclick="labManager.openCommentModal(${component.id})">
                    Add Comment
                </button>
            </td>
            <td><button class="btn btn-warning btn-sm" onclick="labManager.editComponent(${component.id})">Edit</button></td>
            <td><button class="btn btn-danger btn-sm" onclick="labManager.deleteComponent(${component.id})">Remove</button></td>
        `;
        tbody.appendChild(tr);
    });
}

initializeEventListeners() {
    document.addEventListener('DOMContentLoaded', () => {
        // Initialize for labs.html
        const createTaskBtn = document.getElementById('createTaskBtn');
        if (createTaskBtn) {
            createTaskBtn.addEventListener('click', () => this.createTask());
            this.loadTasks();
        }

        // Initialize for view.html
        if (document.getElementById('componentsTableBody')) {
            const createComponentBtn = document.getElementById('createComponentBtn');
            const addCommentBtn = document.getElementById('addCommentBtn');

            if (createComponentBtn) {
                createComponentBtn.addEventListener('click', () => this.createComponent());
            }
            if (addCommentBtn) {
                addCommentBtn.addEventListener('click', () => this.addComment());
            }

            this.loadComponents();
        }
    });
}

openCommentModal(componentId) {
    this.currentComponentId = componentId;
    const modalElement = document.getElementById('modal');
    const modal = new bootstrap.Modal(modalElement);
    const commentInput = document.getElementById('commentInput');
    commentInput.value = '';
    modal.show();
}

addComment() {
    if (!this.currentComponentId) return;

    const commentInput = document.getElementById('commentInput');
    const comment = commentInput.value.trim();

    if (comment) {
        this.components = this.components.map(component => {
            if (component.id === this.currentComponentId) {
                return { ...component, comments: comment };
            }
            return component;
        });

        this.saveComponents();
        this.renderComponents();

        const modal = bootstrap.Modal.getInstance(document.getElementById('modal'));
        modal?.hide();
        this.currentComponentId = null;
    }
}

editComponent(id) {
    const component = this.components.find(c => c.id === id);
    if (!component) return;

    const newType = prompt('Enter new type:', component.type);
    if (newType === null) return;

    const newQuantity = parseInt(prompt('Enter new quantity:', component.quantity));
    if (isNaN(newQuantity)) return;

    const newRunning = parseInt(prompt('Enter new running count:', component.running));
    if (isNaN(newRunning)) return;

    const newDamage = parseInt(prompt('Enter new damage count:', component.damage));
    if (isNaN(newDamage)) return;

    this.components = this.components.map(c => {
        if (c.id === id) {
            return {
                ...c,
                type: newType.trim(),
                quantity: newQuantity,
                running: newRunning,
                damage: newDamage
            };
        }
        return c;
    });

    this.saveComponents();
    this.renderComponents();
}

deleteComponent(id) {
    if (confirm('Are you sure you want to delete this component?')) {
        this.components = this.components.filter(component => component.id !== id);
        this.saveComponents();
        this.renderComponents();
    }
}
}

// Initialize the lab manager
const labManager = new LabManager();