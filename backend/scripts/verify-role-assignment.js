const axios = require('axios');

const API_BASE = 'http://localhost:5001/api';

async function verifyRoleAssignment() {
  console.log('🔍 Verifying Role Assignment Storage...\n');

  try {
    // 1. Get all roles
    const rolesResponse = await axios.get(`${API_BASE}/roles`);
    const roles = rolesResponse.data;
    
    // 2. Get all users
    const usersResponse = await axios.get(`${API_BASE}/users`);
    const users = usersResponse.data;

    console.log('📊 Current State:');
    console.log(`- Total Roles: ${roles.length}`);
    console.log(`- Total Users: ${users.length}`);

    // 3. Check each role's assignedUsers
    console.log('\n📋 Roles and their assigned users:');
    for (const role of roles) {
      console.log(`\nRole: ${role.name} (${role._id})`);
      console.log(`Assigned Users: ${role.assignedUsers?.length || 0}`);
      
      if (role.assignedUsers && role.assignedUsers.length > 0) {
        for (const userId of role.assignedUsers) {
          const user = users.find(u => u._id === userId);
          console.log(`  - ${user?.email || userId} (${user?.name || 'Unknown'})`);
        }
      }
    }

    // 4. Check each user's role
    console.log('\n👥 Users and their roles:');
    for (const user of users) {
      const role = roles.find(r => r._id === user.role?._id);
      console.log(`- ${user.email}: ${role?.name || 'No role'} (${user.role?._id || 'None'})`);
    }

    // 5. Check for inconsistencies
    console.log('\n🔍 Checking for inconsistencies...');
    let inconsistencies = 0;
    
    for (const role of roles) {
      if (role.assignedUsers) {
        for (const userId of role.assignedUsers) {
          const user = users.find(u => u._id === userId);
          if (!user) {
            console.log(`❌ Role ${role.name} has assigned user ${userId} but user not found`);
            inconsistencies++;
          } else if (user.role?._id !== role._id) {
            console.log(`❌ User ${user.email} assigned to role ${role.name} but has role ${user.role?.name || 'None'}`);
            inconsistencies++;
          }
        }
      }
    }

    if (inconsistencies === 0) {
      console.log('✅ No inconsistencies found! Role assignments are properly synchronized.');
    } else {
      console.log(`❌ Found ${inconsistencies} inconsistencies in role assignments.`);
    }

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  }
}

verifyRoleAssignment(); 