import React, { useEffect, useRef, useState } from "react";

import { Input } from "@/components/ui/input";

interface NumericInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "onChange" | "type" | "value"
  > {
  readonly onValueChange: (next: number) => void;
  readonly value: number;
}

export function NumericInput({
  onValueChange,
  value,
  ...props
}: Readonly<NumericInputProps>) {
  const [draft, setDraft] = useState<string | null>(null);
  const lastSentRef = useRef(value);

  useEffect(() => {
    if (value !== lastSentRef.current) {
      lastSentRef.current = value;
      setDraft(null);
    }
  }, [value]);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const raw = event.target.value;
    setDraft(raw);

    if (raw.trim() === "") {
      lastSentRef.current = 0;
      onValueChange(0);
      return;
    }

    const next = Number(raw);

    if (Number.isFinite(next)) {
      lastSentRef.current = next;
      onValueChange(next);
    }
  }

  return (
    <Input
      {...props}
      type="number"
      value={draft ?? String(value)}
      onChange={handleChange}
    />
  );
}
