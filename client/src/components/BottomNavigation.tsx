import React from "react";
import { Link, useLocation } from "wouter";
import { Icon } from "./ui/icon";
import { cn } from "@/lib/utils";

type Tab = "home" | "lists" | "stores" | "profile";

interface BottomNavigationProps {
  activeTab: Tab;
}

export default function BottomNavigation({ activeTab }: BottomNavigationProps) {
  const [location, setLocation] = useLocation();
  
  const tabs: { id: Tab; label: string; icon: string; path: string }[] = [
    { id: "home", label: "Home", icon: "home", path: "/" },
    { id: "lists", label: "Lists", icon: "list", path: "/lists" },
    { id: "stores", label: "Stores", icon: "store", path: "/stores" },
    { id: "profile", label: "Profile", icon: "person", path: "/profile" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 md:hidden bg-white shadow-lg border-t border-gray-200 z-10">
      <div className="flex justify-around">
        {tabs.map(tab => (
          <Link 
            key={tab.id}
            href={tab.path}
            className={cn(
              "p-2 flex flex-col items-center justify-center flex-1",
              activeTab === tab.id ? "text-primary" : "text-gray-500"
            )}
          >
            <Icon name={tab.icon} />
            <span className="text-xs mt-1">{tab.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
