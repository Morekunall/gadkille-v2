import { resolveMediaUrl } from '../lib/api';

const VideoModal = ({ isOpen, onClose, video, language }) => {
  if (!isOpen || !video) return null;

  const rawUrl = video.videoUrl || '';
  const isYouTube = rawUrl.includes('youtube.com') || rawUrl.includes('youtu.be');
  const isVimeo = rawUrl.includes('vimeo.com');
  const mediaUrl = resolveMediaUrl(rawUrl);

  let embedUrl = rawUrl;
  if (isYouTube) {
    const videoId = rawUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
    embedUrl = `https://www.youtube.com/embed/${videoId}`;
  } else if (isVimeo) {
    const videoId = rawUrl.match(/vimeo\.com\/(\d+)/)?.[1];
    embedUrl = `https://player.vimeo.com/video/${videoId}`;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="relative w-full max-w-4xl rounded-2xl bg-black">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white text-black hover:bg-gray-200"
        >
          ✕
        </button>

        {/* Video Container */}
        <div className="relative w-full pt-[56.25%]">
          {isYouTube || isVimeo ? (
            <iframe
              className="absolute inset-0 h-full w-full rounded-2xl"
              src={embedUrl}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={video.title}
            />
          ) : (
            <video
              className="absolute inset-0 h-full w-full rounded-2xl"
              controls
              autoPlay
            >
              <source src={mediaUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}
        </div>

        {/* Video Info */}
        <div className="p-4 text-white">
          <h3 className="text-xl font-semibold">{video.title}</h3>
          <p className="mt-2 text-sm text-gray-300">{video.description}</p>
          {video.duration && (
            <p className="mt-1 text-xs text-gray-400">
              {language === 'en' ? 'Duration: ' : 'अवधि: '}{video.duration}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoModal;
