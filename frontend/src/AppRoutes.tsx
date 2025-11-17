import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './components/home/Home';
import { Login } from './components/auth/Login';
import { PricingPage } from './components/pricing/PricingPage';
import Dashboard from './components/corporate/Dashboard';
import { EmployeeDashboard } from './components/dashboard/EmployeeDashboard';
import Profile from './components/profile/Profile';
import AuthGuard from './components/layout/AuthGuard';
import PublicRoute from './components/layout/PublicRoute';
import UserManagement from './components/corporate/UserManagement';
import InvitationManagement from './components/corporate/InvitationManagement';
import StudentCourseAllocation from './components/academic/StudentCourseAllocation';
import CorporateDashboard from './components/corporate/CorporateDashboard';
import RoleManagement from './components/roles/RoleManagement';
import UserTypeManagement from './components/roles/UserTypeManagement';
import NotificationControlCenter from './components/notifications/NotificationControlCenter';
import Creator from './components/academic/Creator';
import AccountManagement from './components/academic/AccountManagement';
import BrandManagement from './components/brand/BrandManagement';
import CreatorProfile from './components/academic/CreatorProfile';
import KYCPage from './components/kyc/KYCPage';
import GetToKnow from './pages/GetToKnow';
import LearnLoopCourseManager from './components/learnloop/LearnLoopCourseManager';
import CourseBuilderPage from './components/learnloop/CourseBuilderPage';
import CoursesPage from './pages/CoursesPage';
import CourseDetailPage from './pages/CourseDetailPage';
import LessonPlayerPage from './pages/LessonPlayerPage';
import LearningDashboard from './pages/LearningDashboard';

const GetToKnowPage = () => <div>Get To Know</div>;
const DataBoardPage = () => <div>Data Board</div>;
const CanvasCreatorPage = () => <div>Canvas Creator</div>;
const LovePage = () => <div>Love</div>;
const RevenueDeskPage = () => <div>Revenue Desk</div>;
const PromoBoostPage = () => <div>PromoBoost</div>;
const SubscriptionCenterPage = () => <div>Subscription Center</div>;
const FanFundDonationsPage = () => <div>Fan Fund & Donations</div>;

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public routes - Marketing homepage and login page */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/pricing" element={<PricingPage />} />
      
      {/* Public routes wrapped in PublicRoute to handle redirection */}
      <Route element={<PublicRoute />}>
        {/* Add other public routes here if needed */}
      </Route>

      {/* Protected routes are wrapped in AuthGuard */}
      <Route element={<AuthGuard />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/employee" element={<EmployeeDashboard />} />
        <Route path="/profile" element={<Profile />} />
        
        {/* User Management Routes */}
        <Route path="/user-management/*">
          <Route path="list" element={<UserManagement />} />
          <Route path="invitations" element={<InvitationManagement />} />
          <Route path="invites" element={<InvitationManagement />} />
          <Route index element={<Navigate to="list" replace />} />
        </Route>
        
        {/* Brand Management Routes */}
        <Route path="/corporate-management/*">
          <Route index element={<CorporateDashboard />} />
          <Route path="dashboard" element={<CorporateDashboard />} />
          <Route path="brands" element={<BrandManagement />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="users/list" element={<UserManagement />} />
        </Route>
        
        {/* Creator Management Routes */}
        <Route path="/academic-management/*">
          <Route path="students" element={<Creator />} />
          <Route path="account-managers" element={<AccountManagement />} />
          <Route path="course-allocation" element={<StudentCourseAllocation />} />
          <Route path="*" element={<Navigate to="students" replace />} />
        </Route>
        
        {/* Roles & Permissions Routes */}
        <Route path="/roles-permissions/*">
          <Route path="roles" element={<RoleManagement />} />
          <Route path="user-type" element={<UserTypeManagement />} />
          <Route path="notifications" element={<NotificationControlCenter />} />
          <Route index element={<Navigate to="roles" replace />} />
        </Route>

        {/* User Type Management Route */}
        <Route path="/user-types" element={<UserTypeManagement />} />

        {/* Creator Profile Route */}
        <Route path="/creators/:id" element={<CreatorProfile />} />

        {/* KYC Route */}
        <Route path="/kyc" element={<KYCPage />} />

        {/* New main menu items */}
        <Route path="/get-to-know" element={<GetToKnow />} />
        <Route path="/data-board" element={<DataBoardPage />} />
        <Route path="/canvas-creator" element={<CanvasCreatorPage />} />
        <Route path="/love" element={<LovePage />} />
        <Route path="/love/learnloop" element={<LearnLoopCourseManager />} />
        <Route path="/love/learnloop/create/:courseId?" element={<CourseBuilderPage />} />
        <Route path="/revenue-desk" element={<RevenueDeskPage />} />
        <Route path="/promoboost" element={<PromoBoostPage />} />
        <Route path="/subscription-center" element={<SubscriptionCenterPage />} />
        <Route path="/fan-fund-donations" element={<FanFundDonationsPage />} />

        {/* Learner Course Routes */}
        <Route path="/learning" element={<LearningDashboard />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/courses/:courseId" element={<CourseDetailPage />} />
        <Route path="/courses/:courseId/lesson/:lessonId" element={<LessonPlayerPage />} />
      </Route>

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}; 