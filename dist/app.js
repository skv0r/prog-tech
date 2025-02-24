"use strict";
class UserModel {
    constructor() {
        this.users = [];
        this.loadFromStorage();
    }
    saveToStorage() {
        localStorage.setItem("users", JSON.stringify(this.users));
    }
    loadFromStorage() {
        const storedUsers = localStorage.getItem("users");
        if (storedUsers) {
            this.users = JSON.parse(storedUsers);
        }
    }
    addUser(user) {
        this.users.push(user);
        this.saveToStorage();
    }
    editUser(id, newUserData) {
        const userIndex = this.users.findIndex(user => user.id === id);
        if (userIndex !== -1) {
            this.users[userIndex] = Object.assign(Object.assign({}, this.users[userIndex]), newUserData);
            this.saveToStorage();
        }
    }
    deleteUser(id) {
        this.users = this.users.filter(user => user.id !== id);
        this.saveToStorage();
    }
    getUsers() {
        return this.users;
    }
}
class UserPresenter {
    constructor(model) {
        this.isSorted = false;
        this.model = model;
        this.tableBody = document.getElementById("user-table-body");
        this.form = document.getElementById("user-form");
        this.nameInput = document.getElementById("name");
        this.ageInput = document.getElementById("age");
        this.statusInput = document.getElementById("status");
        this.searchInput = document.getElementById("search");
        this.sortButton = document.getElementById("sort-age");
        this.filterSelect = document.getElementById("filter-status");
        this.init();
    }
    init() {
        this.form.addEventListener("submit", (e) => this.handleAddUser(e));
        this.searchInput.addEventListener("input", () => this.renderUsers());
        this.sortButton.addEventListener("click", () => this.toggleSort());
        this.filterSelect.addEventListener("change", () => this.renderUsers());
        this.renderUsers();
    }
    handleAddUser(event) {
        event.preventDefault();
        const name = this.nameInput.value.trim();
        const age = Number(this.ageInput.value);
        const status = this.statusInput.value;
        const editingId = this.form.dataset.editing;
        if (editingId) {
            this.model.editUser(Number(editingId), { name, age, status });
            delete this.form.dataset.editing;
        }
        else {
            this.model.addUser({ id: Date.now(), name, age, status });
        }
        this.renderUsers();
        this.form.reset();
    }
    renderUsers() {
        const searchTerm = this.searchInput.value.toLowerCase();
        const filterStatus = this.filterSelect.value;
        let users = this.model.getUsers().filter(user => user.name.toLowerCase().includes(searchTerm) &&
            (filterStatus === "all" || user.status === filterStatus));
        if (this.isSorted) {
            users = users.slice().sort((a, b) => a.age - b.age);
        }
        this.tableBody.innerHTML = "";
        users.forEach(user => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${user.id}</td>
                <td>${user.name}</td>
                <td>${user.age}</td>
                <td>${user.status}</td>
                <td>
                    <button class="edit-btn" data-id="${user.id}">✏ Редактировать</button>
                    <button class="delete-btn" data-id="${user.id}">❌ Удалить</button>
                </td>
            `;
            this.tableBody.appendChild(row);
        });
        document.querySelectorAll(".delete-btn").forEach(button => {
            button.addEventListener("click", (e) => this.handleDeleteUser(e));
        });
        document.querySelectorAll(".edit-btn").forEach(button => {
            button.addEventListener("click", (e) => this.handleEditUser(e));
        });
    }
    handleDeleteUser(event) {
        const button = event.target;
        const userId = Number(button.dataset.id);
        this.model.deleteUser(userId);
        this.renderUsers();
    }
    handleEditUser(event) {
        const button = event.target;
        const userId = Number(button.dataset.id);
        const user = this.model.getUsers().find(user => user.id === userId);
        if (user) {
            this.nameInput.value = user.name;
            this.ageInput.value = user.age.toString();
            this.statusInput.value = user.status;
            this.form.dataset.editing = userId.toString();
        }
    }
    toggleSort() {
        this.isSorted = !this.isSorted;
        this.renderUsers();
    }
}
const userModel = new UserModel();
const userPresenter = new UserPresenter(userModel);
