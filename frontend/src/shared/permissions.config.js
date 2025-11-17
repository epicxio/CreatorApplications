/**
 * ============================================================================
 * SHARED PERMISSIONS CONFIGURATION
 * ============================================================================
 * 
 * This is the SINGLE SOURCE OF TRUTH for all permission resources in the application.
 * 
 * ✅ HOW TO ADD A NEW MODULE:
 * 
 * 1. Add your module to the permissionResources array below
 * 2. Restart the backend server (or it will auto-sync on next permission fetch)
 * 3. That's it! The system will automatically:
 *    - Create permissions in MongoDB Atlas
 *    - Assign all permissions to Super Admin
 *    - Make them available in Role Management UI
 * 
 * 📝 MODULE FORMAT:
 * 
 * Simple module (no sub-menus):
 *   { name: 'Module Name', path: '/module-path' }
 * 
 * Module with sub-menus:
 *   {
 *     name: 'Module Name',
 *     path: '/module-path',
 *     children: [
 *       { name: 'Sub Menu 1', path: '/module-path/sub1' },
 *       { name: 'Sub Menu 2', path: '/module-path/sub2' },
 *     ]
 *   }
 * 
 * ⚠️ IMPORTANT NOTES:
 * - The 'name' field is used as the resource identifier
 * - The 'path' field is used for routing (should match your route)
 * - ✅ AUTOMATIC: Each module (parent and children) automatically gets 4 permissions:
 *     • View - Can view the module
 *     • Create - Can create items in the module
 *     • Edit - Can edit items in the module
 *     • Delete - Can delete items in the module
 * - ✅ AUTOMATIC: Super Admin automatically gets ALL permissions (View, Create, Edit, Delete) for ALL modules
 * - ✅ AUTOMATIC: Permissions are created in MongoDB Atlas when you restart the backend server
 * 
 * ============================================================================
 */

module.exports = {
  permissionResources: [
    // ==================== CORE MODULES ====================
    { name: 'Dashboard', path: '/dashboard' },
    
    // ==================== USER MANAGEMENT ====================
    {
      name: 'User',
      path: '/user-management',
      children: [
        { name: 'User List', path: '/user-management/list' },
        { name: 'Invitation', path: '/user-management/invitations' },
      ],
    },
    
    // ==================== CREATOR MANAGEMENT ====================
    {
      name: 'Creator',
      path: '/academic-management',
      children: [
        { name: 'Creator Management', path: '/academic-management/students' },
        { name: 'Account Management', path: '/academic-management/account-managers' },
        { name: 'Brand Management', path: '/corporate-management/brands' },
      ],
    },
    
    // ==================== ROLES & PERMISSIONS ====================
    {
      name: 'Roles & Permissions',
      path: '/roles-permissions',
      children: [
        { name: 'Role Management', path: '/roles-permissions/roles' },
        { name: 'User Type', path: '/roles-permissions/user-type' },
        { name: 'Notification Control Center', path: '/roles-permissions/notifications' },
      ],
    },
    
    // ==================== CONTENT & CAMPAIGNS ====================
    { name: 'Content', path: '/content' },
    { name: 'Campaign', path: '/campaign' },
    { name: 'Analytics', path: '/analytics' },
    
    // ==================== ADDITIONAL RESOURCES ====================
    { name: 'Brand', path: '/corporate-management/brands' },
    { name: 'Role', path: '/roles-permissions/roles' },
    { name: 'User Types', path: '/roles-permissions/user-type' },
    { name: 'Notification Control Center', path: '/roles-permissions/notifications' },
    { name: 'KYC', path: '/kyc' },
    
    // ==================== LEARNING & EDUCATION ====================
    { name: 'Get To Know', path: '/get-to-know' },
    { name: 'Learning', path: '/learning' },
    { name: 'Courses', path: '/courses' },
    { name: 'Data Board', path: '/data-board' },
    
    // ==================== CREATOR TOOLS ====================
    {
      name: 'Canvas Creator',
      path: '/canvas-creator',
      children: [
        { name: 'Pages', path: '/canvas-creator/pages' },
        { name: 'Storefront', path: '/canvas-creator/storefront' },
      ],
    },
    
    // ==================== ENGAGEMENT FEATURES ====================
    {
      name: 'Love',
      path: '/love',
      children: [
        { name: 'LearnLoop', path: '/love/learnloop' },
        { name: 'VibeLab', path: '/love/vibelab' },
        { name: 'GlowCall', path: '/love/glowcall' },
        { name: 'IRL Meet', path: '/love/irl-meet' },
        { name: 'TapIn', path: '/love/tapin' },
      ],
    },
    
    // ==================== REVENUE & MONETIZATION ====================
    {
      name: 'Revenue Desk',
      path: '/revenue-desk',
      children: [
        { name: 'Earnings', path: '/revenue-desk/earnings' },
        { name: 'Transactions', path: '/revenue-desk/transactions' },
        { name: 'Subscriptions', path: '/revenue-desk/subscriptions' },
        { name: 'Withdrawals', path: '/revenue-desk/withdrawals' },
      ],
    },
    
    // ==================== MARKETING TOOLS ====================
    {
      name: 'PromoBoost',
      path: '/promoboost',
      children: [
        { name: 'Lead Generation', path: '/promoboost/lead-generation' },
        { name: 'Broadcasts', path: '/promoboost/broadcasts' },
        { name: 'Coupons', path: '/promoboost/coupons' },
        { name: 'Unsubscribed Users', path: '/promoboost/unsubscribed-users' },
      ],
    },
    
    // ==================== SUBSCRIPTION MANAGEMENT ====================
    {
      name: 'Subscription Center',
      path: '/subscription-center',
      children: [
        { name: 'Tiers', path: '/subscription-center/tiers' },
        { name: 'TaxDeck', path: '/subscription-center/taxdeck' },
      ],
    },
    
    // ==================== DONATIONS ====================
    { name: 'Fan Fund & Donations', path: '/fan-fund-donations' },
    
    // ============================================================================
    // ✅ ADD NEW MODULES BELOW THIS LINE
    // ============================================================================
    // 
    // Example 1: Simple module without sub-menus
    // { name: 'My New Module', path: '/my-new-module' },
    //
    // Example 2: Module with sub-menus
    // {
    //   name: 'My New Module',
    //   path: '/my-new-module',
    //   children: [
    //     { name: 'Sub Menu 1', path: '/my-new-module/sub1' },
    //     { name: 'Sub Menu 2', path: '/my-new-module/sub2' },
    //   ],
    // },
    //
    // After adding, restart the backend server and the new module will be:
    // - ✅ Automatically synced to MongoDB Atlas
    // - ✅ Automatically gets 4 permissions: View, Create, Edit, Delete
    // - ✅ Automatically assigned to Super Admin with ALL 4 permissions
    // - ✅ Available in the Role Management UI
    //
    // Example: If you add { name: 'My Module', path: '/my-module' }
    // The system automatically creates:
    //   - My Module:View
    //   - My Module:Create
    //   - My Module:Edit
    //   - My Module:Delete
    // And Super Admin gets all 4 automatically!
    //
    // ============================================================================
  ],
  
  // Permission actions that will be created for each resource
  permissionActions: ['View', 'Create', 'Edit', 'Delete']
};

