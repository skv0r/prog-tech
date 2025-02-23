interface IUser {
    id: number;
    name: string;
    age: number;
    status: "active" | "blocked";
}

class UserModel {
    private users: IUser[] = []

    addUser(user: IUser): void {
        this.users.push(user);
    }

    editUser (id: number, newUserData: Partial<IUser>): void {
        const userIndex = this.users.findIndex(user => user.id === id);
        if (userIndex !== -1) {
            this.users[userIndex] = { ...this.users[userIndex], ...newUserData };
        } else {
            console.log(`User  with id ${id} not found.`);
        }
    }

    deleteUser(id: number): void {
        const users: IUser[] = this.users.filter((user) => user.id !== id);
        users.length === this.users.length ? console.error("No user in base") : this.users = users;
    }

    getUsers(): IUser[] {
        return this.users;
    }
}