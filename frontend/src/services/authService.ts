import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

class AuthService {
  private authURL = `${API_BASE_URL}/auth`;

  // Login with email and password
  async login(email: string, password: string) {
    try {
      const response = await axios.post(`${this.authURL}/login`, {
        email,
        password
      });
      // Return both token and user data for faster login
      return {
        token: response.data.token,
        user: response.data.user
      };
    } catch (error) {
      throw error;
    }
  }

  // Gets the profile of the currently logged-in user
  async getProfile() {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${this.authURL}/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

const authService = new AuthService();
export default authService; 