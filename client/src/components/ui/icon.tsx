import React from "react";
import { cn } from "@/lib/utils";

interface IconProps extends React.HTMLAttributes<HTMLSpanElement> {
  name: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
}

const sizeClassMap = {
  xs: "text-xs",
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
  xl: "text-xl",
  "2xl": "text-2xl",
  "3xl": "text-3xl",
  "4xl": "text-4xl",
};

export function Icon({ name, size = "md", className, ...props }: IconProps) {
  return (
    <span
      className={cn(
        "material-icons",
        size && sizeClassMap[size],
        className
      )}
      {...props}
    >
      {name}
    </span>
  );
}
