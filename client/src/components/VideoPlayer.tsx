import { useEffect, useRef } from "react";

interface VideoPlayerProps {
  videoId: string;
  onEnd?: () => void;
}

declare global {
  interface Window {
    YT: {
      Player: new (
        elementId: string,
        options: {
          videoId: string;
          events?: {
            onReady?: (event: any) => void;
            onStateChange?: (event: any) => void;
          };
        }
      ) => any;
    };
    onYouTubeIframeAPIReady: () => void;
  }
}

export default function VideoPlayer({ videoId, onEnd }: VideoPlayerProps) {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load the YouTube IFrame Player API code asynchronously
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    // Create YouTube player when API is ready
    window.onYouTubeIframeAPIReady = () => {
      if (containerRef.current) {
        playerRef.current = new window.YT.Player(containerRef.current, {
          videoId: videoId,
          events: {
            onReady: (event: any) => {
              event.target.playVideo();
            },
            onStateChange: (event: any) => {
              if (event.data === window.YT.PlayerState.ENDED && onEnd) {
                onEnd();
              }
            },
          },
        });
      }
    };

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
      // Remove the script tag
      const scriptTag = document.querySelector(
        'script[src="https://www.youtube.com/iframe_api"]'
      );
      if (scriptTag) {
        scriptTag.remove();
      }
    };
  }, [videoId, onEnd]);

  return <div ref={containerRef} style={{ width: "100%", height: "400px" }} />;
}
