import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

import axios from 'axios';
import { useRecoilValue } from 'recoil';

import { epState } from '../State/epState';
import { lefSideIsOpen } from '../State/leftRoomSpace';
import { userInfo } from '../State/userState';
import getSocket from '../services/getSocket';
import Sfu from './Sfu';

const socket = getSocket();

export default function Series({ 
  screenShare,
  id,
  type,
  animeId = '',
}: {
  screenShare: boolean;
  id: number | string;
  type: string;
  title?: string | undefined;
  animeId?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const leftIsOpen = useRecoilValue(lefSideIsOpen);
  const [lastTime, setLastTime] = useState(0);
  const [hasAccess, setHasAccess] = useState(false);
  const Info = useRecoilValue(userInfo);
  const { roomId } = useParams();
  const { episode_number, season_number } = useRecoilValue(epState);
  const [AnimeId, setAnimeId] = useState<string>('');
  console.log(isPlaying)
  useEffect(() => {
    if (videoRef.current) {
      const video = videoRef.current;
      const handlePlayPause = (isPlaying: boolean) => {
        if (isPlaying) {
          videoRef.current?.play();
        } else {
          videoRef.current?.pause();
        }

        // Synchronize local state with the received state
        setIsPlaying(isPlaying);
      };

      const handleTimeUpdate = () => {
        if (videoRef?.current) {
          const currentTime = videoRef.current?.currentTime;
          const timeDifference = Math.abs(currentTime - lastTime);

          // Detect skip (e.g., time jump > 2 seconds)
          if (timeDifference > 2) {
            if (currentTime !== undefined) {
              const timeString = new Date().toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });

              socket.emit('seek', { currentTime, roomId });
              socket.emit('send-message', {
                type: 'normal',
                displayname: Info.displayname || Info.username,
                time: timeString,
                message: `Skipped to ${currentTime.toFixed(2)} seconds`,
                roomId: roomId,
              });
            }
          }

          setLastTime(() => currentTime);
        }
      };

      const handleplaypause = () => {
        const isCurrentlyPlaying = !videoRef.current?.paused;
        setIsPlaying(isCurrentlyPlaying);

        const time = new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        });

        // Emit play/pause event
        socket.emit('playPause', { isPlaying: isCurrentlyPlaying, roomId });
        const currentTime = Math.abs(videoRef.current?.currentTime || 0);

        // Convert to minutes and hours as needed
        const minutes = Math.floor(currentTime / 60); // Minutes part
        const seconds = Math.floor(currentTime % 60); // Seconds part

        // Format as "x min y sec" or "x hour y min"
        let formattedTime: string;

        if (minutes >= 60) {
          const hours = Math.floor(minutes / 60);
          const remainingMinutes = minutes % 60;
          formattedTime = `${hours} hr ${remainingMinutes} min`; // Display hours if more than 60 minutes
        } else {
          formattedTime = `${minutes} min ${seconds} sec`; // Display minutes and seconds
        }
        // Emit message to the chat
        socket.emit('send-message', {
          type: 'normal',
          displayname: Info.displayname || Info.username,
          time,
          message: `${isCurrentlyPlaying ? 'Started' : 'Paused'} the video at ${formattedTime}`,
          roomId,
        });
      };

      function handleSeek({ currentTime }: { currentTime: number }) {
        video.currentTime = currentTime;
      }

      // Socket event listener
      socket.on('receivePlayPause', handlePlayPause);
      socket.on('receiveSeek', handleSeek);

      // Video element event listener
      video.addEventListener('timeupdate', handleTimeUpdate);
      video.addEventListener('play', handleplaypause);
      video.addEventListener('pause', handleplaypause);
      // Cleanup on component unmount or dependency change
      return () => {
        socket.off('receivePlayPause', handlePlayPause);
        socket.off('receiveSeek', handleSeek);

        // Remove video event listener
        video.removeEventListener('timeupdate', handleTimeUpdate);
        video.removeEventListener('play', handleplaypause);
        video.removeEventListener('pause', handleplaypause);
      };
    }
  }, [id, roomId, Info.displayname, Info.username, lastTime, hasAccess]);

  useEffect(() => {
    if ((id && type === 'Anime') || type === 'AniMov') {
      if (season_number > 1) {
        const getDifferentSeasonLink = async () => {
          try {
            const result = await axios.get(
              `/api/search?q=${animeId.replace(/-/g, ' ') + ' season ' + season_number}`
            );
            if (result.data[0]?.link_url) {
              const newId = result.data[0]?.link_url?.split('-dub')[0];
              console.log(newId); // Logs correctly
              setAnimeId(newId);
            }
          } catch (error) {
            console.error('Error fetching season link:', error);
          }
        };

        getDifferentSeasonLink();
      }
    }

  }, [animeId, season_number, type]);

  const handleAccessClick = async () => {
    setHasAccess(true);
    socket.emit('join-player', { roomId });
    const response = await axios.get(
      `${import.meta.env.VITE_BACKEND_APP_API_BASE_URL}/api/v1/room/currentState/${roomId}`,
      { 
        headers: {
          authorization: localStorage.getItem('token'),
        },
      }
    );

    const { isPlaying, currentTime } = response.data;

    if (videoRef.current && currentTime) {
      videoRef.current.currentTime = currentTime;
      if (isPlaying) {
        videoRef.current.play(); // Restore play state
      }
    }
  };

  // If no id is provided, show a message
  if(screenShare){
    return (
      <div>
        <Sfu />
      </div>
    )
  }

  if (!id) {
    return (
      <div className="flex justify-center items-center text-lg md:text-2xl lg:text-3xl mt-36 lg:mt-72 text-center px-4 font-medium text-zinc-600">
        There is no media link or any IMDb ID present
      </div>
    );
  }

  // For direct video sources (not iframes)
  if (type !== 'Anime' && type !== 'AniMov' && type !== 'Series' && type !== 'Movie') {
    return (
      <div>
        {!hasAccess ? (
          <button
            onClick={handleAccessClick}
            className="px-4 py-2 bg-orange-600 text-white rounded"
          >
            Get Access to the Video
          </button>
        ) : (
          <div>
            <video ref={videoRef} controls className="h-64 lg:h-[600px] sm:h-full">
              <source src={id.toString()} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        )}
      </div>
    );
  }

  // For iframe sources
  const getIframeSource = () => {
    if ((id && type === 'Anime') || type === 'AniMov') {
      return `https://2anime.xyz/embed/${AnimeId}-episode-${episode_number}`;
    } else if (id && type === 'Series') {
      return `https://www.2embed.cc/embedtv/${id}&s=${season_number}&e=${episode_number}`;
    } else if (id && type === 'Movie') {
      return `https://www.2embed.cc/embed/${id}`;
    }
    return '';
  };

  const iframeSource = getIframeSource();
  if (!iframeSource) {
    return (
      <div className="flex justify-center items-center text-lg md:text-2xl lg:text-3xl mt-36 lg:mt-72 text-center px-4 font-medium text-zinc-600">
        There is no media link or any IMDb ID present
      </div>
    );
  }

  // Determine iframe height based on type
  const getIframeHeight = () => {
    if (type === 'Anime' || type === 'AniMov') {
      return leftIsOpen ? 'sm:h-full' : 'sm:h-full';
    } else if (type === 'Series') {
      return 'h-56 lg:h-full sm:h-full';
    } else if (type === 'Movie') {
      return 'h-52 lg:h-full sm:h-full';
    }
    return 'h-52 lg:h-full sm:h-full';
  };

  return (
    <iframe
      className={`w-full ${getIframeHeight()} max-w-[73rem] rounded`}
      src={iframeSource}
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    ></iframe>
  );
}
