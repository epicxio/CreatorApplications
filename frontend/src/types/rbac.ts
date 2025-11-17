export type UserRole = 
  | 'superadmin'
  | 'school_admin' 
  | 'corporate_admin'
  | 'department_head'
  | 'hrbp'
  | 'teacher'
  | 'parent'
  | 'student'
  | 'employee';

export type Permission = 'view' | 'edit' | 'create' | 'delete' | 'assign';

export interface MenuAction {
  view: boolean;
  edit: boolean;
  create: boolean;
  delete: boolean;
  assign?: boolean;
}

export interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  path?: string;
  actions: {
    view: boolean;
    edit: boolean;
    create: boolean;
    delete: boolean;
    assign?: boolean;
  };
  children?: MenuItem[];
  roles?: UserRole[];
}

export interface RolePermission {
  roleId: string;
  menuItems: Record<string, MenuAction>;
}

export interface Department {
  id: string;
  name: string;
  type: 'school' | 'corporate';
  head?: string; // User ID of department head
}

export interface UserDepartment {
  userId: string;
  departmentId: string;
  role: UserRole;
}

// For parent-student relationship
export interface StudentParentLink {
  studentId: string;
  parentId: string;
}

// For corporate structure
export interface DepartmentEmployee {
  employeeId: string;
  departmentId: string;
  role: 'employee' | 'department_head' | 'hrbp';
}

// For school structure
export interface SchoolClass {
  id: string;
  grade: string;
  section: string;
  teacherId: string;
}

export interface StudentClass {
  studentId: string;
  classId: string;
}

export interface MenuPermissionTemplate {
  id: string;
  name: string;
  description: string;
  role: UserRole;
  permissions: Record<string, MenuAction>;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'corporate_admin' | 'employee' | 'department_head' | 'hrbp';
  organizationName?: string;
  photoURL?: string;  // For profile image
  department?: string;
  position?: string;
  employeeId?: string;
  status?: 'active' | 'inactive';
} 