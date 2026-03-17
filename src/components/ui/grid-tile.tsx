"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface GridTileProps extends React.HTMLAttributes<HTMLDivElement> {
  gridClassName?: string;
  as?: "div" | "button" | "a";
  href?: string;
}

export const GridTile = forwardRef<HTMLDivElement, GridTileProps>(
  (
    {
      gridClassName = "col-span-4",
      as: Component = "div",
      href,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const baseClass = cn(
      "min-w-0 p-6 md:p-8 flex flex-col justify-center min-h-0",
      "border-b border-r border-[var(--border)] border-dashed",
      "bg-[var(--surface)]",
      Component === "button" &&
        "cursor-pointer text-left w-full transition-colors duration-200 hover:bg-[var(--surface-elevated)] active:bg-[var(--border-subtle)]",
      Component === "div" && "transition-colors duration-200",
      Component === "a" &&
        "cursor-pointer no-underline transition-colors duration-200 hover:bg-[var(--surface-elevated)]",
      gridClassName,
      className
    );

    if (Component === "button") {
      return (
        <button
          ref={ref as React.Ref<HTMLButtonElement>}
          type="button"
          className={baseClass}
          {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
        >
          {children}
        </button>
      );
    }

    if (Component === "a" && href) {
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          className={baseClass}
          {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {children}
        </a>
      );
    }

    return (
      <div ref={ref} className={baseClass} {...props}>
        {children}
      </div>
    );
  }
);

GridTile.displayName = "GridTile";
