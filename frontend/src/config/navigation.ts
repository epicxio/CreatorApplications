export const menuHierarchy = [
    {
        resource: 'Get To Know',
        path: '/get-to-know',
    },
    {
        resource: 'Learning',
        path: '/learning',
    },
    {
        resource: 'Courses',
        path: '/courses',
    },
    {
        resource: 'Data Board',
        path: '/data-board',
    },
    {
        resource: 'Canvas Creator',
        path: '/canvas-creator',
        children: [
            { title: 'Pages', path: '/canvas-creator/pages', resource: 'Pages' },
            { title: 'Storefront', path: '/canvas-creator/storefront', resource: 'Storefront' },
        ],
    },
    {
        resource: 'Love',
        path: '/love',
        children: [
            { title: 'LearnLoop', path: '/love/learnloop', resource: 'LearnLoop' },
            { title: 'VibeLab', path: '/love/vibelab', resource: 'VibeLab' },
            { title: 'GlowCall', path: '/love/glowcall', resource: 'GlowCall' },
            { title: 'IRL Meet', path: '/love/irl-meet', resource: 'IRL Meet' },
            { title: 'TapIn', path: '/love/tapin', resource: 'TapIn' },
        ],
    },
    {
        resource: 'Revenue Desk',
        path: '/revenue-desk',
        children: [
            { title: 'Earnings', path: '/revenue-desk/earnings', resource: 'Earnings' },
            { title: 'Transactions', path: '/revenue-desk/transactions', resource: 'Transactions' },
            { title: 'Subscriptions', path: '/revenue-desk/subscriptions', resource: 'Subscriptions' },
            { title: 'Withdrawals', path: '/revenue-desk/withdrawals', resource: 'Withdrawals' },
        ],
    },
    {
        resource: 'PromoBoost',
        path: '/promoboost',
        children: [
            { title: 'Lead Generation', path: '/promoboost/lead-generation', resource: 'Lead Generation' },
            { title: 'Broadcasts', path: '/promoboost/broadcasts', resource: 'Broadcasts' },
            { title: 'Coupons', path: '/promoboost/coupons', resource: 'Coupons' },
            { title: 'Unsubscribed Users', path: '/promoboost/unsubscribed-users', resource: 'Unsubscribed Users' },
        ],
    },
    {
        resource: 'Subscription Center',
        path: '/subscription-center',
        children: [
            { title: 'Tiers', path: '/subscription-center/tiers', resource: 'Tiers' },
            { title: 'TaxDeck', path: '/subscription-center/taxdeck', resource: 'TaxDeck' },
        ],
    },
    {
        resource: 'Fan Fund & Donations',
        path: '/fan-fund-donations',
    },
    {
        resource: 'Dashboard',
        path: '/dashboard',
    },
    {
        resource: 'User',
        path: '/user-management',
        children: [
            { title: 'User List', path: '/user-management/list', resource: 'User' },
            { title: 'Invitations', path: '/user-management/invitations', resource: 'User' },
        ],
    },
    {
        resource: 'Creator',
        path: '/academic-management',
        children: [
            { title: 'Creator Management', path: '/academic-management/students', resource: 'Creator' },
            { title: 'Account Management', path: '/academic-management/account-managers', resource: 'User' },
            { title: 'Brand Management', path: '/corporate-management/brands', resource: 'Brand' },
        ],
    },
    {
        resource: 'Roles & Permissions',
        path: '/roles-permissions',
        children: [
            { title: 'Role Management', path: '/roles-permissions/roles', resource: 'Role' },
            { title: 'User Types', path: '/roles-permissions/user-type', resource: 'User Types' },
            { title: 'Notification Control Center', path: '/roles-permissions/notifications', resource: 'Notification Control Center' },
        ],
    },
    {
        resource: 'Content',
        path: '/content',
    },
    {
        resource: 'Campaign',
        path: '/campaigns',
    },
    {
        resource: 'Analytics',
        path: '/analytics',
    },
    {
        resource: 'KYC',
        path: '/kyc',
    },
]; 