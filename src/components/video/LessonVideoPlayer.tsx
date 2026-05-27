import { HlsVideoPlayer } from "./HlsVideoPlayer";
import { SignedVideoPlayer } from "./SignedVideoPlayer";

interface LessonVideoPlayerProps {
  lessonId: string | number;
  videoUrl?: string;
  title?: string;
  className?: string;
}

export function LessonVideoPlayer({ lessonId, videoUrl, title, className }: LessonVideoPlayerProps) {
  if (String(videoUrl || "").toLowerCase().endsWith(".m3u8")) {
    return <HlsVideoPlayer lessonId={lessonId} title={title} className={className} />;
  }

  return <SignedVideoPlayer lessonId={lessonId} title={title} className={className} />;
}
