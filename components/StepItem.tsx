import Link from "next/link";
import { Check } from "lucide-react";

interface StepItemProps {
  index: number;
  id: string;
  title: string;
  active: boolean;
  done: boolean;
  isLast: boolean;
  onNavigate?: () => void;
}

export function StepItem({
  index,
  id,
  title,
  active,
  done,
  isLast,
  onNavigate,
}: StepItemProps) {
  return (
    <Link
      href={`/lessons/${id}`}
      onClick={onNavigate}
      className="relative flex w-full items-start gap-3 rounded-lg py-2 pl-1 pr-2 text-left transition-colors hover:bg-black/[.03]"
    >
      {!isLast && (
        <span
          className={`absolute left-[20px] top-[34px] -bottom-1.5 w-0.5 ${
            done ? "bg-accent" : "bg-line"
          }`}
        />
      )}
      <span
        className={`z-1 flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold ${
          done
            ? "border-accent bg-accent text-white"
            : active
              ? "border-accent bg-card text-accent"
              : "border-line bg-canvas text-faint"
        }`}
      >
        {done ? <Check size={14} strokeWidth={3} /> : index + 1}
      </span>
      <span className="pt-[3px]">
        <span
          className={`block text-sm leading-snug ${
            active ? "font-bold text-ink" : "font-medium text-sub"
          }`}
        >
          {title}
        </span>
      </span>
    </Link>
  );
}
