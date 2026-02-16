import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

export interface UserType {
  _id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  permissions: {
    resource: string;
    actions: string[];
  }[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserTypeData {
  name: string;
  description: string;
  icon?: string;
  color?: string;
}

export interface UpdateUserTypeData {
  name?: string;
  description?: string;
  icon?: string;
  color?: string;
}

class UserTypeService {
  private baseURL = `${API_BASE_URL}/user-types`;

  async getUserTypes(): Promise<UserType[]> {
    try {
      const response = await axios.get(this.baseURL);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getUserType(id: string): Promise<UserType> {
    try {
      const response = await axios.get(`${this.baseURL}/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async createUserType(userTypeData: CreateUserTypeData): Promise<UserType> {
    try {
      const response = await axios.post(this.baseURL, userTypeData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async updateUserType(id: string, userTypeData: UpdateUserTypeData): Promise<UserType> {
    try {
      const response = await axios.put(`${this.baseURL}/${id}`, userTypeData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async deleteUserType(id: string): Promise<void> {
    try {
      await axios.delete(`${this.baseURL}/${id}`);
    } catch (error) {
      throw error;
    }
  }
}

const userTypeService = new UserTypeService();
export default userTypeService; 