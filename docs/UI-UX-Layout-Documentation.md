# NexusPath Portal UI/UX Layout Documentation

## Overview
This document outlines the standardized UI/UX layout structure for all NexusPath portals (Student, Admin, Faculty). The design follows a consistent pattern that ensures familiarity across different user roles while maintaining role-specific functionality.

## 🎨 Design System

### Color Palette
- **Primary Blue**: `#3B82F6` (blue-500)
- **Secondary Gray**: `#6B7280` (gray-500)
- **Background**: `#F9FAFB` (gray-50)
- **Surface**: `#FFFFFF` (white)
- **Border**: `#E5E7EB` (gray-200)
- **Text Primary**: `#111827` (gray-900)
- **Text Secondary**: `#6B7280` (gray-500)

### Typography
- **Headings**: `text-xl font-semibold` (20px, 600 weight)
- **Subheadings**: `text-lg font-semibold` (18px, 600 weight)
- **Body Text**: `text-sm` (14px)
- **Small Text**: `text-xs` (12px)

### Spacing System
- **Padding**: `p-6` (24px) for main content
- **Margin**: `mb-8` (32px) for section spacing
- **Gap**: `gap-6` (24px) for grid layouts
- **Border Radius**: `rounded-lg` (8px) for cards

## 🏗️ Layout Structure

### Main Layout Pattern
```
┌─────────────────────────────────────────────────────────┐
│ Sidebar (256px) │ Header (Full Width)                   │
│                 ├─────────────────────────────────────┤
│                 │ Main Content Area (Scrollable)       │
│                 │ - Dashboard/Profile/etc.             │
│                 │ - Cards, Forms, Tables               │
└─────────────────────────────────────────────────────────┘
```

### Detailed Layout Structure
```
┌─────────────────────────────────────────────────────────────────┐
│                    NEXUSPATH PORTAL LAYOUT                      │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────────────────────────────────────┐ │
│ │   SIDEBAR   │ │                HEADER                         │ │
│ │             │ │  ┌─────────────────────────────────────────┐ │ │
│ │ 📊 Dashboard│ │  │ Title: "Student Dashboard"               │ │ │
│ │ 🎯 Career   │ │  │                    [🔔] [👤 Profile ▼]   │ │ │
│ │ 🗺️ Roadmaps │ │  └─────────────────────────────────────────┘ │ │
│ │ 📝 Quiz     │ ├─────────────────────────────────────────────┤ │
│ │ 📈 Analytics│ │              MAIN CONTENT                    │ │
│ │ 💬 Messages │ │  ┌─────────────────────────────────────────┐ │ │
│ │ 📚 Resources│ │  │ Welcome back, John! 👋                  │ │ │
│ │             │ │  │                                         │ │ │
│ │             │ │  │ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐        │ │ │
│ │             │ │  │ │Stats│ │Stats│ │Stats│ │Stats│        │ │ │
│ │             │ │  │ └─────┘ └─────┘ └─────┘ └─────┘        │ │ │
│ │             │ │  │                                         │ │ │
│ │             │ │  │ ┌─────────┐ ┌─────────┐ ┌─────────┐   │ │ │
│ │             │ │  │ │ Quick   │ │ Quick   │ │ Quick   │   │ │ │
│ │             │ │  │ │ Action 1 │ │ Action 2│ │ Action 3│   │ │ │
│ │             │ │  │ └─────────┘ └─────────┘ └─────────┘   │ │ │
│ │             │ │  │                                         │ │ │
│ │             │ │  │ ┌─────────────────────────────────────┐ │ │ │
│ │             │ │  │ │        Content Sections             │ │ │ │
│ │             │ │  │ │     (Role-specific content)         │ │ │ │
│ │             │ │  │ └─────────────────────────────────────┘ │ │ │
│ │             │ │  └─────────────────────────────────────────┘ │ │
│ └─────────────┘ └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### 1. Sidebar Navigation (Left Side)
- **Width**: `w-64` (256px)
- **Background**: `bg-white`
- **Shadow**: `shadow-lg`
- **Position**: Fixed left side

#### Sidebar Components:
```jsx
<div className="w-64 bg-white shadow-lg">
  <div className="p-6">
    <h1 className="text-2xl font-bold text-gray-900 mb-8">
      {PortalName} // "NexusPath", "Admin Panel", "Faculty Portal"
    </h1>
    
    <nav className="space-y-2">
      {navigationItems.map((item) => (
        <button
          onClick={() => handleNavigate(item.section)}
          className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
            activeSection === item.section 
              ? 'bg-blue-100 text-blue-700' 
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          <span className="mr-3">{item.icon}</span>
          {item.title}
        </button>
      ))}
    </nav>
  </div>
</div>
```

### 2. Header (Top Right)
- **Height**: `h-16` (64px)
- **Background**: `bg-white`
- **Border**: `border-b border-gray-200`
- **Shadow**: `shadow-sm`

#### Header Components:
```jsx
<header className="bg-white shadow-sm border-b border-gray-200 px-6 py-3">
  <div className="flex items-center justify-between">
    <h1 className="text-xl font-semibold text-gray-900">
      {getSectionTitle(activeSection)}
    </h1>
    
    {/* Profile Menu */}
    <div className="flex items-center space-x-4">
      <NotificationCenter />
      <ProfileDropdown />
    </div>
  </div>
</header>
```

### 3. Main Content Area
- **Layout**: `flex-1 overflow-y-auto`
- **Padding**: `p-6` for main content
- **Max Width**: `max-w-7xl mx-auto` for content centering

## 📱 Responsive Design

### Breakpoints
- **Mobile**: `< 768px` - Sidebar collapses to hamburger menu
- **Tablet**: `768px - 1024px` - Sidebar remains visible
- **Desktop**: `> 1024px` - Full sidebar and content layout

### Mobile Adaptations
```jsx
// Mobile sidebar toggle
const [sidebarOpen, setSidebarOpen] = useState(false);

// Mobile header with hamburger
<div className="lg:hidden">
  <button onClick={() => setSidebarOpen(!sidebarOpen)}>
    <MenuIcon className="w-6 h-6" />
  </button>
</div>
```

## 🎯 Navigation Patterns

### Sidebar Navigation Items
Each portal should have role-specific navigation items:

#### Student Portal
- 📊 Dashboard
- 🎯 Career Paths
- 🗺️ Roadmaps
- 📝 Daily Quiz
- 📈 Analytics
- 💬 Messages
- 📚 Learning Resources

#### Admin Portal
- 📊 Dashboard
- 👥 User Management
- 🎯 Career Path Management
- 🗺️ Roadmap Management
- 📝 Quiz Management
- 📈 System Analytics
- ⚙️ Settings

#### Faculty Portal
- 📊 Dashboard
- 👥 Student Management
- 🎯 Career Path Assignment
- 🗺️ Roadmap Creation
- 📝 Quiz Creation
- 📈 Student Analytics
- 💬 Communication

### Navigation State Management
```jsx
const [activeSection, setActiveSection] = useState('dashboard');

const handleNavigate = (section) => {
  setActiveSection(section);
  // Update URL hash for bookmarking
  window.history.replaceState(null, '', `#${section}`);
};
```

## 🎨 Component Patterns

### 1. Dashboard Cards
```jsx
<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">Label</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </CardContent>
  </Card>
</div>
```

### 2. Quick Actions Grid
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {quickActions.map((action) => (
    <Card 
      key={action.id}
      className="hover:shadow-lg transition-shadow cursor-pointer group"
      onClick={() => handleNavigate(action.section)}
    >
      <CardContent className="p-6">
        <div className="flex items-center">
          <div className={`p-3 rounded-lg ${action.color} text-white`}>
            <action.icon className="w-6 h-6" />
          </div>
          <div className="ml-4">
            <h4 className="font-semibold text-gray-900 group-hover:text-blue-600">
              {action.title}
            </h4>
            <p className="text-sm text-gray-600">{action.description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  ))}
</div>
```

### 3. Profile Modal/Drawer
```jsx
{showProfileModal && (
  <div className="fixed inset-0 z-50 overflow-y-auto">
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
    <div className="flex min-h-full items-center justify-center p-4">
      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Profile Settings</h2>
          <button onClick={() => setShowProfileModal(false)}>
            <XIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="p-6 space-y-6">
            {/* Profile content */}
          </div>
        </div>
      </div>
    </div>
  </div>
)}
```

## 🔧 Implementation Guidelines

### 1. File Structure
```
app/
├── {role}/
│   ├── page.tsx                 // Main dashboard page
│   ├── layout.tsx              // Portal-specific layout
│   └── components/             // Role-specific components
├── components/
│   ├── ui/                     // Shared UI components
│   └── {role}/                 // Role-specific components
└── hooks/
    └── useAuth.ts              // Authentication hook
```

### 2. State Management Pattern
```jsx
// Portal state management
const [activeSection, setActiveSection] = useState('dashboard');
const [showProfileModal, setShowProfileModal] = useState(false);
const [sidebarOpen, setSidebarOpen] = useState(false);

// Navigation handler
const handleNavigate = (section) => {
  setActiveSection(section);
  // Role-specific navigation logic
  if (section === 'external') {
    router.push('/external-route');
  }
};
```

### 3. Content Rendering Pattern
```jsx
const renderContent = () => {
  switch (activeSection) {
    case 'dashboard':
      return <DashboardContent />;
    case 'profile':
      return <ProfileContent />;
    // Role-specific sections
    default:
      return <DashboardContent />;
  }
};
```

## 🎨 Visual Hierarchy

### 1. Information Architecture
- **Primary**: Dashboard overview
- **Secondary**: Navigation sections
- **Tertiary**: Profile and settings

### 2. Content Priority
1. **Quick Stats** - Key metrics at a glance
2. **Quick Actions** - Primary user tasks
3. **Recent Activity** - Latest updates
4. **Detailed Information** - Secondary content

### 3. Visual Flow
```
Header (Navigation Context)
    ↓
Quick Stats (Overview)
    ↓
Quick Actions (Primary Tasks)
    ↓
Content Sections (Detailed Information)
```

## 🚀 Best Practices

### 1. Consistency
- Use the same color palette across all portals
- Maintain consistent spacing and typography
- Follow the same navigation patterns

### 2. Accessibility
- Use semantic HTML elements
- Provide proper ARIA labels
- Ensure keyboard navigation support
- Maintain color contrast ratios

### 3. Performance
- Lazy load non-critical components
- Use proper image optimization
- Implement efficient state management
- Minimize bundle size

### 4. User Experience
- Provide clear navigation feedback
- Use loading states for async operations
- Implement proper error handling
- Maintain responsive design

## 📋 Portal-Specific Adaptations

### Student Portal
- **Focus**: Learning and progress tracking
- **Navigation**: Dashboard, Career Paths, Roadmaps, Quizzes
- **Quick Actions**: Take Quiz, View Resources, Check Progress

### Admin Portal
- **Focus**: System management and oversight
- **Navigation**: Dashboard, User Management, System Settings
- **Quick Actions**: Manage Users, View Analytics, System Config

### Faculty Portal
- **Focus**: Student management and content creation
- **Navigation**: Dashboard, Student Management, Content Creation
- **Quick Actions**: Assign Career Paths, Create Quizzes, View Reports

## 🔄 Migration Checklist

When implementing this layout for a new portal:

- [ ] Set up the main layout structure
- [ ] Implement sidebar navigation with role-specific items
- [ ] Create the header with profile dropdown
- [ ] Implement the main content rendering system
- [ ] Add responsive design considerations
- [ ] Implement profile modal/drawer
- [ ] Add role-specific dashboard content
- [ ] Test navigation and state management
- [ ] Verify responsive design across devices
- [ ] Implement accessibility features

## 📚 Resources

- **Tailwind CSS**: For styling and responsive design
- **Lucide React**: For consistent iconography
- **React Hooks**: For state management
- **Next.js**: For routing and page structure

This documentation provides a comprehensive guide for implementing consistent UI/UX across all NexusPath portals while allowing for role-specific customization.
