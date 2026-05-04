"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  User,
  Mail,
  Phone,
  Award,
  Edit2,
  Save,
  X,
  Camera,
  ChevronRight,
  AlertCircle,
  Loader2,
  CheckCircle,
  Upload,
} from "lucide-react";
import { useStudent } from "@/app/context/StudentContext";
import { useRouter } from "next/navigation";
import api from "@/app/lib/api";

export default function ProfilePage() {
  const { student, refreshStudent } = useStudent();
  const [activeTab, setActiveTab] = useState("profile");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [updateStatus, setUpdateStatus] = useState({ type: "", message: "" });
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    studentId: "",
    profilePic: "",
  });

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState(formData);

  // Update form data when student data loads
  useEffect(() => {
    if (student) {
      const newFormData = {
        name: student?.name || "",
        email: student?.email || "",
        phone: student?.phone || "",
        studentId: student?.rollNumber || "",
        profilePic: student?.profilePic || "",
      };
      setFormData(newFormData);
      setProfileForm(newFormData);
    }
  }, [student]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Preview the image locally
      const previewUrl = URL.createObjectURL(file);
      setProfileForm((prev) => ({ ...prev, profilePic: previewUrl }));
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    setUpdateStatus({ type: "", message: "" });

    try {
      let response;
      const updateData = {
        email: profileForm.email,
        phone: profileForm.phone,
      };

      if (selectedFile) {
        // Send as multipart/form-data
        const formDataToSend = new FormData();
        formDataToSend.append("email", profileForm.email);
        formDataToSend.append("phone", profileForm.phone);
        formDataToSend.append("profilePic", selectedFile);

        response = await api.put(
          `/auth/student/update/${student?._id}`,
          formDataToSend,
          {
            withCredentials: true,
          },
        );
      } else {
        // Send as JSON
        response = await api.put(
          `/auth/student/update/${student?._id}`,
          updateData,
          { withCredentials: true },
        );
      }

      if (response.status === 200) {
        // Update local state with new data from response
        const updatedStudent = response.data.student;
        const newFormData = {
          name: updatedStudent?.name || profileForm.name,
          email: updatedStudent?.email || profileForm.email,
          phone: updatedStudent?.phone || profileForm.phone,
          studentId: updatedStudent?.rollNumber || profileForm.studentId,
          profilePic: updatedStudent?.profilePic || profileForm.profilePic,
        };
        setFormData(newFormData);
        setProfileForm(newFormData);
        setIsEditingProfile(false);
        setSelectedFile(null);
        if (refreshStudent) await refreshStudent();
        setUpdateStatus({
          type: "success",
          message: "Profile updated successfully!",
        });
        setTimeout(() => setUpdateStatus({ type: "", message: "" }), 3000);
      }
    } catch (error) {
      console.error("Update error:", error);
      setUpdateStatus({
        type: "error",
        message: error.response?.data?.message || "Failed to update profile",
      });
      // Rollback preview if upload failed
      if (selectedFile) {
        setProfileForm((prev) => ({
          ...prev,
          profilePic: formData.profilePic,
        }));
      }
      setTimeout(() => setUpdateStatus({ type: "", message: "" }), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setProfileForm(formData);
    setIsEditingProfile(false);
    setSelectedFile(null);
    setUpdateStatus({ type: "", message: "" });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const TabButton = ({ id, label, icon: Icon }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center px-3 sm:px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
        activeTab === id
          ? "bg-blue-50 text-blue-700 shadow-sm"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      }`}
    >
      <Icon className="h-4 w-4 mr-2" />
      <span className="hidden sm:inline">{label}</span>
      <span className="sm:hidden">
        {id === "profile" ? "Info" : "Settings"}
      </span>
    </button>
  );

  if (!student) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            My Profile
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Manage your personal information and preferences
          </p>
        </div>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center px-3 sm:px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors w-full sm:w-auto"
        >
          <ChevronRight className="h-4 w-4 mr-2 rotate-180" />
          Back to Dashboard
        </Link>
      </div>

      {/* Status Message */}
      {updateStatus.message && (
        <div
          className={`p-3 sm:p-4 rounded-lg ${
            updateStatus.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          <div className="flex items-center">
            {updateStatus.type === "success" ? (
              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            ) : (
              <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            )}
            <span className="text-sm sm:text-base">{updateStatus.message}</span>
          </div>
        </div>
      )}

      {/* Profile Header Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Cover Photo */}
        <div className="h-24 sm:h-32 bg-gradient-to-r from-blue-600 via-sky-400 to-blue-500 relative">
          <button className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 bg-white/90 backdrop-blur-sm p-1.5 sm:p-2 rounded-lg shadow-lg hover:bg-white transition-colors">
            <Camera className="h-3 w-3 sm:h-4 sm:w-4 text-gray-700" />
          </button>
        </div>

        {/* Profile Info */}
        <div className="px-4 sm:px-6 pb-4 sm:pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end -mt-8 sm:-mt-12">
            {/* Avatar with file picker (always visible) */}
            <div className="relative mx-auto sm:mx-0">
              <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl border-4 border-white shadow-xl overflow-hidden bg-white">
                <img
                  src={profileForm.profilePic || "/default-avatar.png"}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              </div>
              <button
                onClick={triggerFileInput}
                className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-1 rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
              >
                <Camera className="h-2 w-2 sm:h-3 sm:w-3" />
              </button>
              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
            </div>

            {/* Name and Basic Info */}
            <div className="mt-3 sm:mt-0 sm:ml-6 flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
                    {formData.name}
                  </h2>
                  <p className="text-gray-500 flex items-center justify-center sm:justify-start text-xs sm:text-sm mt-1">
                    <Mail className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    {formData.email}
                  </p>
                </div>
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="inline-flex items-center justify-center px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm font-medium"
                >
                  <Edit2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 sm:gap-2 border-b border-gray-200 pb-4">
        <TabButton id="profile" label="Profile Information" icon={User} />
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
        {activeTab === "profile" && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                Personal Information
              </h3>
              {!isEditingProfile && (
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                >
                  <Edit2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  Edit
                </button>
              )}
            </div>

            {isEditingProfile ? (
              // Edit Mode with profile picture upload section
              <div className="space-y-6">
                {/* Profile Picture Upload Section (explicit in edit form) */}
                <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">
                    Profile Picture
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="h-16 w-16 rounded-full overflow-hidden bg-gray-200 border-2 border-gray-300">
                      <img
                        src={profileForm.profilePic || "/default-avatar.png"}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <button
                        type="button"
                        onClick={triggerFileInput}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <Upload className="h-4 w-4 mr-1" />
                        Change Picture
                      </button>
                      <p className="text-xs text-gray-500 mt-1">
                        JPG, PNG or GIF. Max 2MB.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Email and Phone fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={profileForm.email}
                      onChange={handleInputChange}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-sm text-gray-900 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={profileForm.phone}
                      onChange={handleInputChange}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-sm text-gray-900 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition-all"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
                  <button
                    onClick={handleSaveProfile}
                    disabled={isLoading}
                    className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    {isLoading ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="w-full sm:w-auto px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center justify-center"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              // View Mode
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-start">
                    <User className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 mr-2 sm:mr-3 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm text-gray-500">
                        Full Name
                      </p>
                      <p className="text-sm sm:text-base text-gray-900 font-medium break-words">
                        {formData.name || "Not provided"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 mr-2 sm:mr-3 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm text-gray-500">
                        Email Address
                      </p>
                      <p className="text-sm sm:text-base text-gray-900 font-medium break-words">
                        {formData.email || "Not provided"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 mr-2 sm:mr-3 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm text-gray-500">
                        Phone Number
                      </p>
                      <p className="text-sm sm:text-base text-gray-900 font-medium break-words">
                        {formData.phone || "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-start">
                    <Award className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 mr-2 sm:mr-3 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm text-gray-500">
                        Student ID
                      </p>
                      <p className="text-sm sm:text-base text-gray-900 font-medium break-words">
                        {formData.studentId || "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
