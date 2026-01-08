# NexusPath Portal Quick Reference Guide

## 🚀 Quick Start Checklist

### 1. Basic Layout Setup
```jsx
// Main portal layout structure
<div className="flex h-screen bg-gray-50">
  <Sidebar />
  <div className="flex-1 flex flex-col overflow-hidden">
    <Header />
    <main className="flex-1 overflow-y-auto">
      {renderContent()}
    </main>
  </div>
</div>
```

### 2. Required State Variables
```jsx
const [activeSection, setActiveSection] = useState('dashboard');
const [showProfileModal, setShowProfileModal] = useState(false);
const [sidebarOpen, setSidebarOpen] = useState(false); // For mobile
```

### 3. Navigation Handler
```jsx
const handleNavigate = (section) => {
  setActiveSection(section);
  window.history.replaceState(null, '', `#${section}`);
};
```

### 4. Content Renderer
```jsx
const renderContent = () => {
  switch (activeSection) {
    case 'dashboard': return <DashboardContent />;
    case 'profile': return <ProfileContent />;
    // Add role-specific cases
    default: return <DashboardContent />;
  }
};
```

## 🎨 Component Templates

### Sidebar Navigation
```jsx
const navigationItems = [
  { section: 'dashboard', title: 'Dashboard', icon: '📊' },
  { section: 'users', title: 'Users', icon: '👥' },
  { section: 'settings', title: 'Settings', icon: '⚙️' },
  // Add role-specific items
];

<nav className="space-y-2">
  {navigationItems.map((item) => (
    <button
      key={item.section}
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
```

### Dashboard Stats Cards
```jsx
const stats = [
  { label: 'Total Users', value: 150, icon: '👥', color: 'bg-blue-500' },
  { label: 'Active Sessions', value: 45, icon: '🟢', color: 'bg-green-500' },
  // Add role-specific stats
];

<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
  {stats.map((stat, index) => (
    <Card key={index}>
      <CardContent className="p-6">
        <div className="flex items-center">
          <div className={`p-2 ${stat.color.replace('bg-', 'bg-').replace('-500', '-100')} rounded-lg`}>
            <span className="text-lg">{stat.icon}</span>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  ))}
</div>
```

### Quick Actions Grid
```jsx
const quickActions = [
  { 
    title: 'Create User', 
    description: 'Add new user to system',
    icon: UserPlus,
    color: 'bg-blue-500',
    section: 'create-user'
  },
  // Add role-specific actions
];

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {quickActions.map((action, index) => (
    <Card 
      key={index}
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

### Profile Modal
```jsx
{showProfileModal && (
  <div className="fixed inset-0 z-50 overflow-y-auto">
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
    <div className="flex min-h-full items-center justify-center p-4">
      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Profile Settings</h2>
          <button onClick={() => setShowProfileModal(false)}>
            <X className="w-5 h-5" />
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

## 🎯 Role-Specific Adaptations

### Student Portal
```jsx
const studentNavigation = [
  { section: 'dashboard', title: 'Dashboard', icon: '📊' },
  { section: 'career-paths', title: 'Career Paths', icon: '🎯' },
  { section: 'roadmaps', title: 'Roadmaps', icon: '🗺️' },
  { section: 'daily-quiz', title: 'Daily Quiz', icon: '📝' },
  { section: 'analytics', title: 'Analytics', icon: '📈' },
  { section: 'messages', title: 'Messages', icon: '💬' },
  { section: 'learning-resources', title: 'Learning Resources', icon: '📚' },
];
```

### Admin Portal
```jsx
const adminNavigation = [
  { section: 'dashboard', title: 'Dashboard', icon: '📊' },
  { section: 'user-management', title: 'User Management', icon: '👥' },
  { section: 'career-paths', title: 'Career Paths', icon: '🎯' },
  { section: 'roadmaps', title: 'Roadmaps', icon: '🗺️' },
  { section: 'quiz-management', title: 'Quiz Management', icon: '📝' },
  { section: 'analytics', title: 'System Analytics', icon: '📈' },
  { section: 'settings', title: 'Settings', icon: '⚙️' },
];
```

### Faculty Portal
```jsx
const facultyNavigation = [
  { section: 'dashboard', title: 'Dashboard', icon: '📊' },
  { section: 'students', title: 'Student Management', icon: '👥' },
  { section: 'career-assignment', title: 'Career Assignment', icon: '🎯' },
  { section: 'roadmap-creation', title: 'Roadmap Creation', icon: '🗺️' },
  { section: 'quiz-creation', title: 'Quiz Creation', icon: '📝' },
  { section: 'analytics', title: 'Student Analytics', icon: '📈' },
  { section: 'communication', title: 'Communication', icon: '💬' },
];
```

## 📱 Responsive Breakpoints

```jsx
// Mobile sidebar toggle
const [sidebarOpen, setSidebarOpen] = useState(false);

// Mobile header
<div className="lg:hidden">
  <button onClick={() => setSidebarOpen(!sidebarOpen)}>
    <Menu className="w-6 h-6" />
  </button>
</div>

// Mobile sidebar overlay
{sidebarOpen && (
  <div className="fixed inset-0 z-40 lg:hidden">
    <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)} />
    <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
      {/* Sidebar content */}
    </div>
  </div>
)}
```

## 🎨 Styling Classes Reference

### Layout Classes
- `flex h-screen bg-gray-50` - Main container
- `w-64 bg-white shadow-lg` - Sidebar
- `flex-1 flex flex-col overflow-hidden` - Main content area
- `bg-white shadow-sm border-b border-gray-200` - Header

### Component Classes
- `grid grid-cols-1 md:grid-cols-4 gap-6` - Stats grid
- `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6` - Actions grid
- `hover:shadow-lg transition-shadow cursor-pointer` - Interactive cards
- `bg-blue-100 text-blue-700` - Active navigation state

### Modal Classes
- `fixed inset-0 z-50 overflow-y-auto` - Modal container
- `bg-black/50 backdrop-blur-sm` - Backdrop
- `bg-white rounded-lg shadow-xl max-w-2xl w-full` - Modal content
- `max-h-[90vh] overflow-hidden` - Modal height constraint

## 🔧 Common Patterns

### Loading States
```jsx
if (loading) {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  );
}
```

### Error States
```jsx
if (error) {
  return (
    <div className="text-center p-8">
      <div className="text-red-500 mb-4">⚠️</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h3>
      <p className="text-gray-600">{error.message}</p>
    </div>
  );
}
```

### Empty States
```jsx
<div className="text-center p-8">
  <div className="text-4xl mb-4">📭</div>
  <h3 className="text-lg font-semibold text-gray-900 mb-2">No data available</h3>
  <p className="text-gray-600">Get started by creating your first item.</p>
</div>
```

This quick reference guide provides all the essential code snippets and patterns needed to implement the NexusPath portal layout for any role (Student, Admin, Faculty).
