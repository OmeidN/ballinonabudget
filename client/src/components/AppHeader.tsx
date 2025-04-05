import React from "react";
import { Icon } from "./ui/icon";

interface AppHeaderProps {
  user?: {
    initials: string;
  };
  notificationCount?: number;
}

export default function AppHeader({ user = { initials: "JD" }, notificationCount = 0 }: AppHeaderProps) {
  return (
    <header className="bg-primary text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Icon name="shopping_cart" className="mr-2" />
            <h1 className="text-xl font-medium">BallinOnABudget</h1>
          </div>
          <div className="flex items-center">
            <button 
              className="p-2 rounded-full hover:bg-primary-dark transition mr-2 relative overflow-hidden" 
              aria-label="Notifications"
            >
              <Icon name="notifications" />
              {notificationCount > 0 && (
                <span className="absolute top-[-6px] right-[-6px] bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {notificationCount}
                </span>
              )}
            </button>
            <div className="rounded-full bg-blue-400 w-8 h-8 flex items-center justify-center">
              <span>{user.initials}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
