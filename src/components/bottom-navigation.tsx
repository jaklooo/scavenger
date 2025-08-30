"use client";

import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  Home, 
  Map, 
  Camera,
  User
} from "lucide-react";

const navigationItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    name: "Journey",
    href: "/journey",
    icon: Map,
  },
  {
    name: "Gallery",
    href: "/gallery",
    icon: Camera,
  },
  {
    name: "Profile",
    href: "/profile",
    icon: User,
  },
];

export function BottomNavigation() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="mx-auto max-w-lg rounded-t-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-around px-2 py-2 bg-white/40 backdrop-blur-[10px] border-t border-gray-200" style={{backdropFilter:'blur(16px) saturate(1.2)'}}>
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <button
                key={item.name}
                onClick={() => router.push(item.href)}
                className={cn(
                  "flex flex-col items-center space-y-0.5 h-auto py-2 px-2 min-w-0 flex-1 rounded-xl transition-all relative",
                  isActive
                    ? "text-[#BB133A] bg-[#BB133A]/10 font-bold shadow-sm"
                    : "text-gray-500 hover:text-[#BB133A]/80"
                )}
                style={{ fontFamily: 'Inter, Poppins, sans-serif' }}
              >
                {/* Active dot */}
                {isActive && (
                  <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#BB133A] shadow-md"></span>
                )}
                <Icon className={cn("w-6 h-6 mb-0.5", isActive ? "text-[#BB133A]" : "")} />
                <span className={cn("text-xs", isActive ? "text-[#BB133A]" : "")}>{item.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
