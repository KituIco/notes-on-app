export interface User {
    userId: string;
    userName: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    totalWorkspaces: number;
    icon: string;
    oldpassword: string;
}

export interface AuthResponse {
    data: {
        token: string; 
        userId: Pick<User,"userId">
    }
}