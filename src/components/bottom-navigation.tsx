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
        <div className="flex items-center justify-around px-2 py-2 glass-nav" style={{backdropFilter:'blur(16px) saturate(1.2)'}}>
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
                    ? "text-[var(--text-primary)] bg-[var(--secondary-color)]/30 font-bold shadow-sm"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                )}
                style={{ 
                  fontFamily: 'Inter, Poppins, sans-serif',
                  boxShadow: isActive ? `0 0 20px var(--glow-color), 0 0 40px var(--glow-color), inset 0 0 20px rgba(255,255,255,0.1)` : 'none'
                }}
              >
                {/* Active dot */}
                {isActive && (
                  <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white shadow-md"></span>
                )}
                <Icon className={cn("w-6 h-6 mb-0.5", isActive ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]")} />
                <span className={cn("text-xs", isActive ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]")}>{item.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
