"use client";

import { Collapsible, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import React, { useEffect, useRef, useState } from "react";

interface CollapsibleAsideProps {
  children: React.ReactNode;
  streaming: boolean;
}

export function CollapsibleAside({
  children,
  streaming,
}: CollapsibleAsideProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [shouldCollapse, setShouldCollapse] = useState(false);
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const lineHeight = parseFloat(getComputedStyle(el).lineHeight) || 16;
    const height = el.scrollHeight;
    const lines = Math.round(height / lineHeight);
    const multi = lines > 1;

    setShouldCollapse(multi && !streaming);
    setOpen(false); // collapsed by default
    setReady(true);
  }, [children, streaming]);

  if (!ready) {
    // Render hidden for measurement
    return (
      <aside
        ref={ref}
        className="invisible absolute h-auto whitespace-pre-wrap leading-loose"
      >
        {children}
      </aside>
    );
  }

  if (!shouldCollapse) {
    return (
      <aside
        ref={ref}
        className="mb-2 italic text-muted-foreground leading-loose"
      >
        {children}
      </aside>
    );
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="mb-2">
      <CollapsibleTrigger asChild>
        <aside
          ref={ref}
          className={cn(
            "italic text-muted-foreground cursor-pointer transition-all overflow-hidden leading-loose",
            !open && "line-clamp-1"
          )}
        >
          {children}
          {!open && <span className="text-xs text-primary ml-2">...</span>}
        </aside>
      </CollapsibleTrigger>
    </Collapsible>
  );
}
