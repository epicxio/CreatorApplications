export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'teacher' | 'parent' | 'employee';
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
  role: User['role'];
} 