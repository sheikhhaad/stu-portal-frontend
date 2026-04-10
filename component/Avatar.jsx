"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";

export default function UserMenu({ user, onSignOut }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
    buttonRef.current?.focus();
  }, []);

  const toggleDropdown = () => setIsOpen(prev => !prev);

  // Handle click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        closeDropdown();
      }
    };

    const handleEscKey = (event) => {
      if (event.key === "Escape") closeDropdown();
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscKey);
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [isOpen, closeDropdown]);

  // Close on resize
  useEffect(() => {
    if (!isOpen) return;
    
    const handleResize = () => closeDropdown();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isOpen, closeDropdown]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleDropdown();
    }
  };

  // ✅ Fixed: Proper menu items structure
  const menuItems = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Profile", path: "/dashboard/profile" },
  ];

  // Don't render if no user
  if (!user) return null;

  return (
    <div className="relative inline-block">
      <div
        ref={buttonRef}
        tabIndex={0}
        onClick={toggleDropdown}
        onKeyDown={handleKeyDown}
        className="w-10 h-10 rounded-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-shadow"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="User menu"
      >
        <div className="relative w-full h-full rounded-full overflow-hidden bg-gray-100 border border-gray-100">
          {user?.profilePic && user.profilePic !== "" ? (
            <img
              src={user?.profilePic}
              alt={user.name || "User"}
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-600 text-xs font-bold uppercase">
              {user?.name ? user.name.split(" ").map(n => n[0]).join("").slice(0, 2) : "UN"}
            </div>
          )}
        </div>
      </div>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute right-0 mt-2 z-50 w-44 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
          role="menu"
          aria-orientation="vertical"
          aria-label="User menu options"
        >
          <div className="px-4 py-3 border-b border-gray-200 text-sm">
            <div className="font-medium text-gray-900 truncate">
              {user.name || "Guest"}
            </div>
            {user.email && (
              <div className="text-gray-500 truncate text-xs mt-0.5">
                {user.email}
              </div>
            )}
          </div>

          <ul className="py-2 text-sm font-medium text-gray-700" role="list">
            {/* ✅ Fixed: Each menu item in its own <li> */}
            {menuItems.map((item, index) => (
              <li key={index}>
                <Link
                  href={item.path}
                  onClick={closeDropdown}
                  className="block w-full px-4 py-2 hover:bg-gray-100 hover:text-gray-900 transition-colors text-left"
                  role="menuitem"
                >
                  {item.name}
                </Link>
              </li>
            ))}
          
            <li className="border-t border-gray-100 mt-1 pt-1">
              <button
                onClick={() => {
                  closeDropdown();
                  onSignOut?.();
                }}
                className="block w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 transition-colors"
                role="menuitem"
              >
                Sign out
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}