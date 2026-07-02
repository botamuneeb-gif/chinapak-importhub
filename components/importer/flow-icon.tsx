type FlowIconProps = {
  name: "photo" | "text" | "link" | "mic" | "check" | "box";
};

export function FlowIcon({ name }: FlowIconProps) {
  const commonProps = {
    "aria-hidden": true,
    className: "h-5 w-5",
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 2,
    viewBox: "0 0 24 24",
  };

  if (name === "photo") {
    return (
      <svg {...commonProps}>
        <rect height="16" rx="2" width="18" x="3" y="4" />
        <circle cx="8" cy="9" r="1.5" />
        <path d="m21 16-5-5L5 22" />
      </svg>
    );
  }

  if (name === "text") {
    return (
      <svg {...commonProps}>
        <path d="M5 6h14" />
        <path d="M5 12h14" />
        <path d="M5 18h8" />
      </svg>
    );
  }

  if (name === "link") {
    return (
      <svg {...commonProps}>
        <path d="M10 13a5 5 0 0 0 7.1 0l2-2a5 5 0 0 0-7.1-7.1l-1 1" />
        <path d="M14 11a5 5 0 0 0-7.1 0l-2 2A5 5 0 0 0 12 20.1l1-1" />
      </svg>
    );
  }

  if (name === "mic") {
    return (
      <svg {...commonProps}>
        <rect height="11" rx="4" width="7" x="8.5" y="3" />
        <path d="M5 11a7 7 0 0 0 14 0" />
        <path d="M12 18v3" />
      </svg>
    );
  }

  if (name === "check") {
    return (
      <svg {...commonProps}>
        <path d="m5 12 4 4L19 6" />
      </svg>
    );
  }

  return (
    <svg {...commonProps}>
      <path d="m21 16-9 5-9-5V8l9-5 9 5Z" />
      <path d="m3.3 7.5 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  );
}
