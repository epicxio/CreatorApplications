import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Matches the Permission model on the backend
export interface Permission {
  _id: string;
  resource: string;
  action: string;
  description: string;
}

export interface Role {
  _id: string;
  name: string;
  description: string;
  permissions: Permission[]; // It's populated from the backend
  userTypes: string[];
  assignedUsers: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Data for creating/updating a role now uses an array of permission IDs
export interface CreateRoleData {
  name: string;
  description: string;
  permissions: string[];
  userTypes: string[];
  assignedUsers: string[];
}

export interface UpdateRoleData {
  name?: string;
  description?: string;
  permissions?: string[];
}

class RoleService {
  private roleURL = `${API_BASE_URL}/roles`;
  private permissionURL = `${API_BASE_URL}/permissions`;
  private userTypeURL = `${API_BASE_URL}/user-types`;

  async getRoles(): Promise<Role[]> {
    try {
      const response = await axios.get(this.roleURL);
      return response.data;
    } catch (error) {
      console.error('Error fetching roles:', error);
      throw error;
    }
  }

  // Fetches all available permissions from the dedicated permissions endpoint
  async getPermissions(): Promise<Permission[]> {
    try {
      const response = await axios.get(this.permissionURL);
      return response.data;
    } catch (error) {
      console.error('Error fetching available permissions:', error);
      throw error;
    }
  }

  async getUserTypes(): Promise<string[]> {
    try {
      const response = await axios.get(this.userTypeURL);
      // The API returns an array of UserType objects, we need to extract the name
      return response.data.map((userType: { name: string }) => userType.name);
    } catch (error) {
      console.error('Error fetching user types:', error);
      throw error;
    }
  }

  async getRole(id: string): Promise<Role> {
    try {
      const response = await axios.get(`${this.roleURL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching role:', error);
      throw error;
    }
  }

  async createRole(roleData: CreateRoleData): Promise<Role> {
    try {
      const response = await axios.post(this.roleURL, roleData);
      return response.data;
    } catch (error) {
      console.error('Error creating role:', error);
      throw error;
    }
  }

  async updateRole(id: string, roleData: Partial<CreateRoleData>): Promise<Role> {
    try {
      const response = await axios.put(`${this.roleURL}/${id}`, roleData);
      return response.data;
    } catch (error) {
      console.error('Error updating role:', error);
      throw error;
    }
  }

  async deleteRole(id: string): Promise<void> {
    try {
      await axios.delete(`${this.roleURL}/${id}`);
    } catch (error) {
      console.error('Error deleting role:', error);
      throw error;
    }
  }
}

export default new RoleService(); 