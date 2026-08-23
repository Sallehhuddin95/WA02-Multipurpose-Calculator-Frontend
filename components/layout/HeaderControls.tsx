"use client";

import React from "react";

import { cn } from "@/lib/utils";

import { LanguageSwitch } from "./LanguageSwitch";
import { ThemeToggle } from "./ThemeToggle";

interface HeaderControlsProps {
  readonly className?: string;
}

export function HeaderControls({ className }: HeaderControlsProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <ThemeToggle />
      <LanguageSwitch />
    </div>
  );
}
