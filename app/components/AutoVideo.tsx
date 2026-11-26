import { useEffect, useRef } from "react";

/**
 * Vidéo muette en boucle, posée sur une photo. Elle n'apparaît qu'une fois lancée
 * (les navigateurs d'Instagram / TikTok ou le mode économie peuvent bloquer l'autoplay),
 * relance au premier toucher, et se met en pause hors de l'écran.
 */
export function AutoVideo({ src, poster, alt, className }: { src: string; poster: string; alt: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    video.muted = true;
    video.defaultMuted = true;
    const play = () => {
      const promise = video.play();
      if (promise) promise.catch(() => {});
    };
    const onPlaying = () => video.classList.add("t-ok");
    const kick = () => {
      if (video.paused) play();
    };
    video.addEventListener("playing", onPlaying);
    video.addEventListener("loadeddata", play, { once: true });
    const events = ["touchstart", "pointerdown", "scroll"] as const;
    events.forEach((name) => addEventListener(name, kick, { once: true, passive: true }));
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => (entry.isIntersecting ? play() : video.pause())),
      { threshold: 0.2 },
    );
    observer.observe(video);
    play();
    return () => {
      video.removeEventListener("playing", onPlaying);
      events.forEach((name) => removeEventListener(name, kick));
      observer.disconnect();
    };
  }, [src]);

  return (
    <>
      <img src={poster} alt={alt} className={className} fetchPriority="high" />
      <video
        ref={ref}
        className={`t-hv ${className ?? ""}`}
        src={src}
        muted
        playsInline
        loop
        autoPlay
        preload="auto"
        aria-hidden="true"
        webkit-playsinline="true"
      />
    </>
  );
}
