import React from 'react'

// Dashboard
const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))

// Master (PRD 02)
const Themes = React.lazy(() => import('./views/master/themes/Themes'))
const Music = React.lazy(() => import('./views/master/music/Music'))

// Undangan (PRD 02)
const Invitations = React.lazy(() => import('./views/invitations/Invitations'))
const CreateInvitation = React.lazy(() => import('./views/invitations/CreateInvitation'))

// Tamu & RSVP (PRD 05)
const GuestBook = React.lazy(() => import('./views/guests/GuestBook'))
const RsvpList = React.lazy(() => import('./views/guests/RsvpList'))

// Layanan Bantuan (PRD 06)
const ServiceOrders = React.lazy(() => import('./views/serviceOrders/ServiceOrders'))

// Setup
const Company = React.lazy(() => import('./views/setup/company/Company'))
const Users = React.lazy(() => import('./views/setup/users/Users'))
const Roles = React.lazy(() => import('./views/setup/roles/Roles'))
const Menus = React.lazy(() => import('./views/setup/menus/Menus'))
const RolePermissions = React.lazy(() => import('./views/setup/rolePermissions/Rolepermissions'))
const ChangePassword = React.lazy(() => import('./views/setup/changePassword/Changepassword'))

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },

  // Master (PRD 02)
  { path: '/master', exact: true, name: 'Master', element: Themes },
  { path: '/master/themes', name: 'Tema Desain', element: Themes },
  { path: '/master/music', name: 'Musik Latar', element: Music },

  // Undangan (PRD 02)
  { path: '/invitations', exact: true, name: 'Undangan', element: Invitations },
  { path: '/invitations/list', name: 'Daftar Undangan', element: Invitations },
  { path: '/invitations/create', name: 'Buat Undangan Baru', element: CreateInvitation },

  // Tamu & RSVP (PRD 05)
  { path: '/guests', exact: true, name: 'Tamu & RSVP', element: GuestBook },
  { path: '/guests/list', name: 'Buku Tamu', element: GuestBook },
  { path: '/guests/rsvp', name: 'Rekap RSVP & Doa', element: RsvpList },

  // Layanan Bantuan (PRD 06)
  { path: '/service-orders', name: 'Layanan Bantuan', element: ServiceOrders },

  // Setup
  { path: '/setup/users', name: 'Users', element: Users },
  { path: '/setup/roles', name: 'Roles', element: Roles },
  { path: '/setup/menus', name: 'Menus', element: Menus },
  { path: '/setup/role-permissions', name: 'Role Permissions', element: RolePermissions },
  { path: '/setup/change-password', name: 'Change Password', element: ChangePassword },
  { path: '/setup/company', name: 'Company', element: Company },
]

export default routes
