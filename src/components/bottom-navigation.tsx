"use client";

import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  Home, 
  Map, 
  Camera 
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
];

export function BottomNavigation() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border md:hidden">
      <div className="flex items-center justify-around px-4 py-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Button
              key={item.name}
              onClick={() => router.push(item.href)}
              variant="ghost"
              size="sm"
              className={cn(
                "flex flex-col items-center space-y-1 h-auto py-2 px-3 min-w-0 flex-1",
                isActive && "text-primary bg-primary/10"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium truncate">
                {item.name}
              </span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
