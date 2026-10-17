import Link from "next/link";
import type { ComponentProps } from "react";
import { toneClasses } from "@/lib/theme";
import { cn } from "@/lib/utils";
import type { Tone } from "@/types";

type ButtonSize = "sm" | "md" | "lg";

interface ButtonStyleProps {
  tone?: Tone;
  size?: ButtonSize;
  className?: string;
}

const SIZES: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm [&_svg]:size-4",
  md: "h-12 px-5 text-base [&_svg]:size-5",
  lg: "h-16 px-7 text-lg [&_svg]:size-6",
};

/** Chunky pill with a hard shadow that "presses" into the page. */
export function buttonStyles({
  tone = "ink",
  size = "md",
  className,
}: ButtonStyleProps) {
  return cn(
    "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full border-2 border-ink font-display font-extrabold uppercase tracking-tight shadow-hard",
    "transition-[translate,box-shadow] duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-lg active:translate-x-1 active:translate-y-1 active:shadow-none",
    "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky disabled:pointer-events-none disabled:opacity-50",
    toneClasses[tone],
    SIZES[size],
    className,
  );
}

type ButtonProps = ComponentProps<"button"> & ButtonStyleProps;

export function Button({
  tone,
  size,
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonStyles({ tone, size, className })}
      {...props}
    />
  );
}

type LinkButtonProps = ComponentProps<typeof Link> & ButtonStyleProps;

export function LinkButton({
  tone,
  size,
  className,
  ...props
}: LinkButtonProps) {
  return (
    <Link className={buttonStyles({ tone, size, className })} {...props} />
  );
}
