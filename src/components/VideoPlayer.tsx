import React, { useState, useRef, useEffect } from 'react';
import { Play, X, Volume2, VolumeX } from 'lucide-react';

interface VideoPlayerProps {
  videoUrl: string;
  title?: string;
  thumbnail?: string;
  className?: string;
  autoplay?: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  videoUrl, 
  title = "Video", 
  thumbnail,
  className = "",
  autoplay = false
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Función mejorada para detectar y generar URLs de embed
  const getEmbedUrl = (url: string, isAutoplay: boolean = false) => {
    try {
      // YouTube - URLs más robustas
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        let videoId = '';
        
        if (url.includes('youtu.be/')) {
          videoId = url.split('youtu.be/')[1]?.split('?')[0]?.split('&')[0];
        } else if (url.includes('youtube.com/watch')) {
          const urlParams = new URLSearchParams(url.split('?')[1] || '');
          videoId = urlParams.get('v') || '';
        } else if (url.includes('youtube.com/embed/')) {
          videoId = url.split('youtube.com/embed/')[1]?.split('?')[0]?.split('&')[0];
        }
        
        if (!videoId) return url;
        
        // Usar nocookie domain para mejor compatibilidad
        let embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}`;
        
        const params = new URLSearchParams();
        params.set('rel', '0'); // No mostrar videos relacionados
        params.set('modestbranding', '1'); // Branding mínimo
        params.set('playsinline', '1'); // Para móviles
        
        if (isAutoplay) {
          params.set('autoplay', '1');
          params.set('mute', '1'); // Requerido para autoplay
        }
        
        return `${embedUrl}?${params.toString()}`;
      }
      
      // Vimeo
      if (url.includes('vimeo.com')) {
        let videoId = '';
        
        if (url.includes('vimeo.com/')) {
          videoId = url.split('vimeo.com/')[1]?.split('?')[0]?.split('/')[0];
        }
        
        if (!videoId) return url;
        
        let embedUrl = `https://player.vimeo.com/video/${videoId}`;
        
        const params = new URLSearchParams();
        params.set('dnt', '1'); // Do not track
        
        if (isAutoplay) {
          params.set('autoplay', '1');
          params.set('muted', '1');
        }
        
        return `${embedUrl}?${params.toString()}`;
      }
      
      // Video directo
      return url;
    } catch (error) {
      console.error('Error processing video URL:', error);
      return url;
    }
  };

  // Función para generar thumbnail de YouTube
  const getYouTubeThumbnail = (url: string) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      let videoId = '';
      
      if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1]?.split('?')[0]?.split('&')[0];
      } else if (url.includes('youtube.com/watch')) {
        const urlParams = new URLSearchParams(url.split('?')[1] || '');
        videoId = urlParams.get('v') || '';
      }
      
      if (videoId) {
        return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      }
    }
    return thumbnail;
  };

  // Autoplay para videos directos
  useEffect(() => {
    if (autoplay && videoRef.current && isDirectVideo) {
      videoRef.current.muted = true;
      videoRef.current.play().catch(console.error);
      setIsPlaying(true);
    }
  }, [autoplay]);

  const handlePlay = () => {
    setIsPlaying(true);
    setShowModal(true);
  };

  const handleClose = () => {
    setIsPlaying(false);
    setShowModal(false);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const videoThumbnail = thumbnail || getYouTubeThumbnail(videoUrl);
  const isDirectVideo = !videoUrl.includes('youtube.com') && 
                       !videoUrl.includes('youtu.be') && 
                       !videoUrl.includes('vimeo.com');

  // Si es autoplay y es un video directo, mostrar el video directamente
  if (autoplay && isDirectVideo) {
    return (
      <div className={`relative ${className}`}>
        <video
          ref={videoRef}
          className="w-full h-full object-cover rounded-lg"
          controls
          muted={isMuted}
          loop
          playsInline
          src={videoUrl}
        >
          Tu navegador no soporta el elemento de video.
        </video>
        
        {/* Control de sonido para autoplay */}
        <button
          onClick={toggleMute}
          className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
        >
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>
        
        {/* Indicador de autoplay */}
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs flex items-center">
          <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></div>
          AUTO
        </div>
      </div>
    );
  }

  // Si es autoplay y es YouTube/Vimeo, mostrar iframe directamente
  if (autoplay && !isDirectVideo) {
    const autoplayUrl = getEmbedUrl(videoUrl, true);

    return (
      <div className={`relative ${className}`}>
        <div className="relative w-full h-full">
          <iframe
            className="w-full h-full rounded-lg"
            src={autoplayUrl}
            title={title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
          
          {/* Indicador de autoplay */}
          <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs flex items-center pointer-events-none">
            <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></div>
            AUTO
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Video Thumbnail */}
      <div className={`relative cursor-pointer group ${className}`} onClick={handlePlay}>
        <div className="relative overflow-hidden rounded-lg">
          {videoThumbnail ? (
            <img
              src={videoThumbnail}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                // Fallback si la thumbnail falla
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          
          {/* Fallback cuando no hay thumbnail */}
          <div className={`w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center ${videoThumbnail ? 'hidden' : ''}`}>
            <Play className="h-16 w-16 text-white opacity-80" />
          </div>
          
          {/* Play Button Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center group-hover:bg-opacity-40 transition-all duration-300">
            <div className="bg-white bg-opacity-90 rounded-full p-4 group-hover:bg-opacity-100 group-hover:scale-110 transition-all duration-300">
              <Play className="h-8 w-8 text-gray-800 ml-1" />
            </div>
          </div>
          
          {/* Video Label */}
          <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
            VIDEO
          </div>
        </div>
      </div>

      {/* Video Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
          <div className="relative w-full max-w-4xl mx-4">
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <X className="h-8 w-8" />
            </button>
            
            {/* Video Container */}
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              {isDirectVideo ? (
                <video
                  className="absolute inset-0 w-full h-full"
                  controls
                  autoPlay
                  src={videoUrl}
                >
                  Tu navegador no soporta el elemento de video.
                </video>
              ) : (
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={getEmbedUrl(videoUrl, true)}
                  title={title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VideoPlayer;