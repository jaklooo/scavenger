import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "todo" | "in_review" | "done" | "destructive";
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
        {
          "bg-primary/10 text-primary": variant === "default",
          "bg-gray-100 text-gray-600": variant === "todo",
          "bg-yellow-100 text-yellow-600": variant === "in_review",
          "bg-green-100 text-green-600": variant === "done",
          "bg-red-100 text-red-600": variant === "destructive",
        },
        className
      )}
    >
      {children}
    </span>
  );
}
