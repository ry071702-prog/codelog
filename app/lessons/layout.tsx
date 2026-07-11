import { AppShell } from "@/components/AppShell";

export default function LessonsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
