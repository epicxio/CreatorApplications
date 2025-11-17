const axios = require('axios');

const API_BASE = 'http://localhost:5001/api';

async function testRoleSystem() {
  console.log('🧪 Testing Role Assignment System...\n');

  try {
    // 1. Get all roles
    console.log('1. Fetching roles...');
    const rolesResponse = await axios.get(`${API_BASE}/roles`);
    const roles = rolesResponse.data;
    console.log(`✅ Found ${roles.length} roles`);
    console.log('Roles:', roles.map(r => ({ id: r._id, name: r.name })));

    // 2. Get all users
    console.log('\n2. Fetching users...');
    const usersResponse = await axios.get(`${API_BASE}/users`);
    const users = usersResponse.data;
    console.log(`✅ Found ${users.length} users`);
    
    // 3. Check for users without roles
    const usersWithoutRoles = users.filter(u => !u.role);
    console.log(`\n3. Users without roles: ${usersWithoutRoles.length}`);
    if (usersWithoutRoles.length > 0) {
      console.log('❌ Users missing roles:', usersWithoutRoles.map(u => u.email));
    } else {
      console.log('✅ All users have roles assigned!');
    }

    // 4. Test user creation validation (should fail without role)
    console.log('\n4. Testing user creation validation...');
    try {
      await axios.post(`${API_BASE}/users`, {
        name: 'Test User',
        email: 'test-validation@example.com',
        password: 'Test123!',
        userType: users[0]?.userType?._id || 'test'
        // Missing role - should fail
      });
      console.log('❌ User creation should have failed without role');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ User creation properly rejected without role');
        console.log('Error message:', error.response.data.message);
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }

    console.log('\n🎉 Role system testing completed!');

  } catch (error) {
    console.error('❌ Test failed:');
    console.error('Error message:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    if (error.code === 'ECONNREFUSED') {
      console.error('Backend server is not running. Please start the server first.');
    }
  }
}

testRoleSystem(); 