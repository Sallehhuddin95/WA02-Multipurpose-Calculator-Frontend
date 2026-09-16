import React, { useId } from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";

import { RadioGroup } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

export interface SegmentedControlOption {
  value: string;
  label: string;
}

export interface SegmentedControlProps {
  readonly disabled?: boolean;
  readonly label: string;
  readonly name?: string;
  readonly onValueChange: (value: string) => void;
  readonly options: readonly SegmentedControlOption[];
  readonly value: string;
}

export function SegmentedControl({
  disabled,
  label,
  name,
  onValueChange,
  options,
  value,
}: Readonly<SegmentedControlProps>) {
  const legendId = useId();

  return (
    <fieldset className="min-w-0">
      <legend
        id={legendId}
        className="text-(--foreground) text-sm font-semibold"
      >
        {label}
      </legend>
      <RadioGroup
        aria-labelledby={legendId}
        className="mt-3 flex flex-col gap-2 sm:flex-row sm:gap-0 sm:rounded-xl sm:border sm:border-border sm:bg-muted sm:p-1"
        disabled={disabled}
        name={name}
        onValueChange={onValueChange}
        value={value}
      >
        {options.map((option) => {
          const isActive = option.value === value;

          return (
            <RadioGroupPrimitive.Item
              key={option.value}
              value={option.value}
              className={cn(
                "min-h-11 w-full min-w-0 whitespace-normal break-words rounded-2xl border px-4 py-2.5 text-left text-sm transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                "disabled:cursor-not-allowed disabled:opacity-50",
                "sm:min-h-0 sm:flex-1 sm:rounded-lg sm:border-0 sm:px-3 sm:py-2",
                isActive
                  ? "border-primary bg-primary font-medium text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:text-foreground sm:bg-transparent",
              )}
            >
              {option.label}
            </RadioGroupPrimitive.Item>
          );
        })}
      </RadioGroup>
    </fieldset>
  );
}
