import axios from 'axios';
import { UserType } from './userTypeService';
import { Role } from './roleService';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

export interface User {
  _id: string;
  name: string;
  email: string;
  userType: UserType;
  role?: Role;
  status: 'active' | 'inactive' | 'deleted';
  
  // User IDs
  userId?: string; // Universal user ID for all types
  creatorId?: string; // Creator-specific ID
  
  // Authentication & security
  lastLogin?: Date;
  passwordResetRequired?: boolean;
  temporaryPassword?: string;
  
  // Organization/Corporate fields
  organization?: string;
  department?: string;
  grade?: string;
  class?: string;
  
  // Creator-specific fields
  bio?: string;
  socialMedia?: {
    instagram?: string;
    facebook?: string;
    youtube?: string;
    tiktok?: string;
    twitter?: string;
    linkedin?: string;
  };
  
  // Brand-specific fields
  companyName?: string;
  industry?: string;
  website?: string;
  
  // Account Manager specific fields
  assignedClients?: string[];
  assignedScreens?: string[];
  
  // Common metadata
  profileImage?: string;
  phoneNumber?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
  
  // Verification fields
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  verificationToken?: string;
  
  // Preferences
  preferences?: {
    notifications?: {
      email?: boolean;
      push?: boolean;
      sms?: boolean;
    };
    language?: string;
    timezone?: string;
  };
  
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserData {
  name: string;
  email: string;
  password?: string;
  userType: string;
  role: string;
  organization?: string;
  department?: string;
  status?: string;
  bio?: string;
  socialMedia?: {
    instagram?: string;
    facebook?: string;
    youtube?: string;
    tiktok?: string;
    twitter?: string;
    linkedin?: string;
  };
  companyName?: string;
  industry?: string;
  website?: string;
  phoneNumber?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
  profileImage?: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  userType?: string;
  role?: string;
  organization?: string;
  department?: string;
  status?: string;
  bio?: string;
  socialMedia?: {
    instagram?: string;
    facebook?: string;
    youtube?: string;
    tiktok?: string;
    twitter?: string;
    linkedin?: string;
  };
  companyName?: string;
  industry?: string;
  website?: string;
  phoneNumber?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
  profileImage?: string;
}

class UserService {
  private baseURL = `${API_BASE_URL}/users`;

  async getUsers(params?: { userType?: string; status?: string; search?: string }): Promise<User[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.userType) queryParams.append('userType', params.userType);
      if (params?.status) queryParams.append('status', params.status);
      if (params?.search) queryParams.append('search', params.search);
      
      const url = queryParams.toString() ? `${this.baseURL}?${queryParams.toString()}` : this.baseURL;
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  async getCreators(): Promise<User[]> {
    try {
      const response = await axios.get(`${this.baseURL}/creators`);
      return response.data;
    } catch (error) {
      console.error('Error fetching creators:', error);
      throw error;
    }
  }

  async getUserStats(): Promise<any> {
    try {
      const response = await axios.get(`${this.baseURL}/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw error;
    }
  }

  async createUser(userData: CreateUserData): Promise<User> {
    const response = await axios.post(this.baseURL, userData);
    return response.data;
  }

  async updateUser(id: string, userData: UpdateUserData): Promise<User> {
    const response = await axios.put(`${this.baseURL}/${id}`, userData);
    return response.data;
  }
  
  async deleteUser(id: string): Promise<void> {
    await axios.delete(`${this.baseURL}/${id}`);
  }

  async resetPassword(id: string): Promise<{ temporaryPassword: string }> {
    const response = await axios.post(`${this.baseURL}/${id}/reset-password`);
    return response.data;
  }
}

export default new UserService(); 