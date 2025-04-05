import React from "react";
import AppHeader from "@/components/AppHeader";
import BottomNavigation from "@/components/BottomNavigation";
import { Icon } from "@/components/ui/icon";

export default function Profile() {
  return (
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-6">
      <AppHeader />
      
      <main className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">My Profile</h1>
        
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <Icon name="account_circle" className="text-6xl text-gray-300 mb-4" />
          <h2 className="text-xl font-medium mb-2">Profile Settings Coming Soon</h2>
          <p className="text-gray-500 mb-4">
            In the future, you'll be able to manage your account settings, preferences, and saved payment methods here.
          </p>
        </div>
      </main>
      
      <BottomNavigation activeTab="profile" />
    </div>
  );
}
