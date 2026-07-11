import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLesson, lessons } from "@/lib/lessons";
import { LessonContent } from "@/components/LessonContent";

export function generateStaticParams() {
  return lessons.map((l) => ({ id: l.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const lesson = getLesson(id);
  return {
    title: lesson ? lesson.title : "レッスン",
    description: lesson?.paras[0],
  };
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!getLesson(id)) notFound();
  // key でレッスンごとに state を作り直す（実行結果やヒント表示の持ち越し防止）
  return <LessonContent key={id} lessonId={id} />;
}
