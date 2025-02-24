interface IUser {
    id: number;
    name: string;
    age: number;
    status: "active" | "blocked";
}

class UserModel {
    private users: IUser[] = [];

    constructor() {
        this.loadFromStorage();
    }

    private saveToStorage() {
        localStorage.setItem("users", JSON.stringify(this.users));
    }

    private loadFromStorage() {
        const storedUsers = localStorage.getItem("users");
        if (storedUsers) {
            this.users = JSON.parse(storedUsers);
        }
    }

    addUser(user: IUser): void {
        this.users.push(user);
        this.saveToStorage();
    }

    editUser(id: number, newUserData: Partial<IUser>): void {
        const userIndex = this.users.findIndex(user => user.id === id);
        if (userIndex !== -1) {
            this.users[userIndex] = { ...this.users[userIndex], ...newUserData };
            this.saveToStorage();
        }
    }

    deleteUser(id: number): void {
        this.users = this.users.filter(user => user.id !== id);
        this.saveToStorage();
    }

    getUsers(): IUser[] {
        return this.users;
    }
}


class UserPresenter {
    private model: UserModel;
    private tableBody: HTMLTableSectionElement;
    private form: HTMLFormElement;
    private nameInput: HTMLInputElement;
    private ageInput: HTMLInputElement;
    private statusInput: HTMLSelectElement;
    private searchInput: HTMLInputElement;
    private sortButton: HTMLButtonElement;
    private filterSelect: HTMLSelectElement;
    private isSorted: boolean = false;


    constructor (model: UserModel) {
        this.model = model;
        this.tableBody = document.getElementById("user-table-body") as HTMLTableSectionElement;
        this.form = document.getElementById("user-form") as HTMLFormElement;
        this.nameInput = document.getElementById("name") as HTMLInputElement;
        this.ageInput = document.getElementById("age") as HTMLInputElement;
        this.statusInput = document.getElementById("status") as HTMLSelectElement;
        this.searchInput = document.getElementById("search") as HTMLInputElement;
        this.sortButton = document.getElementById("sort-age") as HTMLButtonElement;
        this.filterSelect = document.getElementById("filter-status") as HTMLSelectElement

        this.init();
     }

     private init() {
        this.form.addEventListener("submit", (e) => this.handleAddUser(e));
        this.searchInput.addEventListener("input", () => this.renderUsers());
        this.sortButton.addEventListener("click", () => this.toggleSort());
        this.filterSelect.addEventListener("change", () => this.renderUsers());
        this.renderUsers();
     }

     private handleAddUser(event: Event) {
        event.preventDefault();
        const name = this.nameInput.value.trim();
        const age = Number(this.ageInput.value);
        const status = this.statusInput.value as "active" | "blocked";
    
        const editingId = this.form.dataset.editing;
    
        if (editingId) {
            
            this.model.editUser(Number(editingId), { name, age, status });
            delete this.form.dataset.editing;
        } else {
           
            this.model.addUser({ id: Date.now(), name, age, status });
        }
    
        this.renderUsers();
        this.form.reset();
    }
    

    private renderUsers() {
        const searchTerm = this.searchInput.value.toLowerCase();
        const filterStatus = this.filterSelect.value;
    
        let users = this.model.getUsers().filter(user => 
            user.name.toLowerCase().includes(searchTerm) &&
            (filterStatus === "all" || user.status === filterStatus)
        );
    
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
    

    private handleDeleteUser(event: Event) {
        const button = event.target as HTMLButtonElement;
        const userId = Number(button.dataset.id);
        this.model.deleteUser(userId);
        this.renderUsers();
    }

    

    private handleEditUser(event: Event) {
        const button = event.target as HTMLButtonElement;
        const userId = Number(button.dataset.id);
        const user = this.model.getUsers().find(user => user.id === userId);
    
        if (user) {
            this.nameInput.value = user.name;
            this.ageInput.value = user.age.toString();
            this.statusInput.value = user.status;
            this.form.dataset.editing = userId.toString();
        }
    }

    private toggleSort() {
        this.isSorted = !this.isSorted;
        this.renderUsers();
    }
    
    
    
}

const userModel = new UserModel();
const userPresenter = new UserPresenter(userModel)