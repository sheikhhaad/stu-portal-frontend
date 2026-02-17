'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  BookOpen,
  Award,
  Settings,
  Edit2,
  Save,
  X,
  Camera,
  Lock,
  Bell,
  Moon,
  Globe,
  LogOut,
  ChevronRight,
  Download,
  Upload,
  Shield,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useStudent } from '@/app/context/StudentContext';

export default function ProfilePage() {
  const { student, notifications } = useStudent();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    name: 'John Student',
    email: 'john@student.edu',
    phone: '+1 234 567 8900',
    address: '123 University Ave, Campus Town',
    bio: 'Computer Science student passionate about web development and machine learning.',
    department: 'Computer Science',
    year: '3rd Year',
    studentId: '2023001',
    dateOfBirth: '2002-05-15',
    emergencyContact: '+1 987 654 3210'
  });

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState(formData);

  const stats = [
    { label: 'Queries Submitted', value: '24', icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Resolved', value: '18', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Pending', value: '4', icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100' },
    { label: 'Courses', value: '6', icon: Award, color: 'text-purple-600', bg: 'bg-purple-100' },
  ];

  const recentActivity = [
    { id: 1, action: 'Submitted query: Assignment Extension Request', time: '2 hours ago', type: 'query' },
    { id: 2, action: 'Received reply from Dr. Smith', time: '5 hours ago', type: 'message' },
    { id: 3, action: 'Query resolved: Lab Equipment Issue', time: '1 day ago', type: 'resolved' },
    { id: 4, action: 'Updated profile information', time: '2 days ago', type: 'profile' },
    { id: 5, action: 'Enrolled in Machine Learning course', time: '1 week ago', type: 'course' },
  ];

  const courses = [
    { code: 'CS101', name: 'Introduction to Computer Science', grade: 'A', credits: 3, status: 'completed' },
    { code: 'CS201', name: 'Data Structures', grade: 'B+', credits: 4, status: 'completed' },
    { code: 'CS301', name: 'Algorithms', grade: 'A-', credits: 4, status: 'in-progress' },
    { code: 'CS401', name: 'Machine Learning', grade: '-', credits: 3, status: 'in-progress' },
    { code: 'MATH201', name: 'Linear Algebra', grade: 'A', credits: 3, status: 'completed' },
  ];

  const handleSaveProfile = () => {
    setFormData(profileForm);
    setIsEditingProfile(false);
    // Here you would typically make an API call to update the profile
  };

  const handleCancelEdit = () => {
    setProfileForm(formData);
    setIsEditingProfile(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
  };

  const TabButton = ({ id, label, icon: Icon }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
        activeTab === id
          ? 'bg-indigo-50 text-indigo-700 shadow-sm'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      <Icon className="h-4 w-4 mr-2" />
      {label}
    </button>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your personal information and preferences</p>
        </div>
        <Link
          href="/dashboard/home"
          className="inline-flex items-center px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
        >
          <ChevronRight className="h-4 w-4 mr-2 rotate-180" />
          Back to Dashboard
        </Link>
      </div>

      {/* Profile Header Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Cover Photo */}
        <div className="h-32 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative">
          <button className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-lg shadow-lg hover:bg-white transition-colors">
            <Camera className="h-4 w-4 text-gray-700" />
          </button>
        </div>

        {/* Profile Info */}
        <div className="px-6 pb-6">
          <div className="flex flex-col md:flex-row md:items-end -mt-12">
            {/* Avatar */}
            <div className="relative">
              <div className="h-24 w-24 rounded-2xl border-4 border-white shadow-xl overflow-hidden bg-white">
                <img
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=John"
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              </div>
              <button className="absolute -bottom-2 -right-2 bg-indigo-600 text-white p-1.5 rounded-lg shadow-lg hover:bg-indigo-700 transition-colors">
                <Camera className="h-3 w-3" />
              </button>
            </div>

            {/* Name and Basic Info */}
            <div className="mt-4 md:mt-0 md:ml-6 flex-1">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{formData.name}</h2>
                  <p className="text-gray-500 flex items-center mt-1">
                    <Mail className="h-4 w-4 mr-1" />
                    {formData.email}
                  </p>
                </div>
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit Profile
                </button>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center space-x-3">
                    <div className={`${stat.bg} p-2 rounded-lg`}>
                      <Icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <p className="text-xs text-gray-500">{stat.label}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-4">
        <TabButton id="profile" label="Profile Information" icon={User} />
        <TabButton id="courses" label="Courses & Grades" icon={BookOpen} />
        <TabButton id="activity" label="Recent Activity" icon={Clock} />
        <TabButton id="settings" label="Settings" icon={Settings} />
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {/* Profile Information Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
              {!isEditingProfile && (
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center"
                >
                  <Edit2 className="h-4 w-4 mr-1" />
                  Edit
                </button>
              )}
            </div>

            {isEditingProfile ? (
              // Edit Mode
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={profileForm.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={profileForm.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={profileForm.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={profileForm.dateOfBirth}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input
                      type="text"
                      name="address"
                      value={profileForm.address}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                    <textarea
                      name="bio"
                      rows="3"
                      value={profileForm.bio}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-3 pt-4">
                  <button
                    onClick={handleSaveProfile}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium flex items-center"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              // View Mode
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start">
                    <User className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Full Name</p>
                      <p className="text-gray-900 font-medium">{formData.name}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Mail className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Email Address</p>
                      <p className="text-gray-900 font-medium">{formData.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Phone className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Phone Number</p>
                      <p className="text-gray-900 font-medium">{formData.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="text-gray-900 font-medium">{formData.address}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start">
                    <BookOpen className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Department</p>
                      <p className="text-gray-900 font-medium">{formData.department}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Calendar className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Year of Study</p>
                      <p className="text-gray-900 font-medium">{formData.year}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Award className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Student ID</p>
                      <p className="text-gray-900 font-medium">{formData.studentId}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Phone className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Emergency Contact</p>
                      <p className="text-gray-900 font-medium">{formData.emergencyContact}</p>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <div className="flex items-start">
                    <User className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Bio</p>
                      <p className="text-gray-700">{formData.bio}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Courses & Grades Tab */}
        {activeTab === 'courses' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Course History & Grades</h3>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course Code</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Credits</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {courses.map((course, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{course.code}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{course.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{course.credits}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          course.grade === 'A' || course.grade === 'A-' ? 'bg-green-100 text-green-700' :
                          course.grade === 'B+' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {course.grade}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          course.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {course.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* GPA Summary */}
            <div className="bg-indigo-50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-indigo-600 font-medium">Cumulative GPA</p>
                  <p className="text-3xl font-bold text-indigo-700">3.75</p>
                </div>
                <div>
                  <p className="text-sm text-indigo-600 font-medium">Credits Completed</p>
                  <p className="text-3xl font-bold text-indigo-700">17</p>
                </div>
                <div>
                  <p className="text-sm text-indigo-600 font-medium">Credits In Progress</p>
                  <p className="text-3xl font-bold text-indigo-700">7</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Activity Tab */}
        {activeTab === 'activity' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className={`p-2 rounded-lg ${
                    activity.type === 'query' ? 'bg-blue-100' :
                    activity.type === 'message' ? 'bg-green-100' :
                    activity.type === 'resolved' ? 'bg-purple-100' :
                    'bg-gray-100'
                  }`}>
                    {activity.type === 'query' && <BookOpen className="h-4 w-4 text-blue-600" />}
                    {activity.type === 'message' && <Mail className="h-4 w-4 text-green-600" />}
                    {activity.type === 'resolved' && <CheckCircle className="h-4 w-4 text-purple-600" />}
                    {activity.type === 'profile' && <User className="h-4 w-4 text-gray-600" />}
                    {activity.type === 'course' && <Award className="h-4 w-4 text-yellow-600" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full py-2 text-indigo-600 hover:text-indigo-800 text-sm font-medium border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors">
              View All Activity
            </button>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Account Settings</h3>
            
            <div className="space-y-4">
              {/* Notification Settings */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 flex items-center mb-4">
                  <Bell className="h-5 w-5 mr-2 text-indigo-600" />
                  Notification Preferences
                </h4>
                <div className="space-y-3">
                  {['Email notifications', 'Push notifications', 'SMS alerts', 'Query updates'].map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{item}</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked={index < 2} />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Privacy Settings */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 flex items-center mb-4">
                  <Shield className="h-5 w-5 mr-2 text-indigo-600" />
                  Privacy & Security
                </h4>
                <div className="space-y-3">
                  <button className="w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors">
                    <span className="text-sm text-gray-700">Change Password</span>
                    <Lock className="h-4 w-4 text-gray-400" />
                  </button>
                  <button className="w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors">
                    <span className="text-sm text-gray-700">Two-Factor Authentication</span>
                    <Shield className="h-4 w-4 text-gray-400" />
                  </button>
                  <button className="w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors">
                    <span className="text-sm text-gray-700">Privacy Policy</span>
                    <Globe className="h-4 w-4 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Appearance */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 flex items-center mb-4">
                  <Moon className="h-5 w-5 mr-2 text-indigo-600" />
                  Appearance
                </h4>
                <div className="flex items-center space-x-4">
                  <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm">Light</button>
                  <button className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-50">Dark</button>
                  <button className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-50">System</button>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                <h4 className="font-medium text-red-600 flex items-center mb-4">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  Danger Zone
                </h4>
                <div className="space-y-3">
                  <button className="w-full text-left px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium">
                    Deactivate Account
                  </button>
                  <button className="w-full text-left px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}