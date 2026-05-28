import { HlsVideoPlayer } from "./HlsVideoPlayer";

interface LessonVideoPlayerProps {
  lessonId: string | number;
  videoUrl?: string;
  title?: string;
  className?: string;
}

export function LessonVideoPlayer({ lessonId, videoUrl, title, className }: LessonVideoPlayerProps) {
  return <HlsVideoPlayer lessonId={lessonId} title={title || videoUrl} className={className} />;
}
