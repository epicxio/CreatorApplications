import { useState, useRef, useEffect } from 'react';
import {
  Box,
  IconButton,
  Slider,
  Typography,
  List,
  ListItemText,
  Paper,
  styled,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  VolumeUp,
  VolumeOff,
  Fullscreen,
} from '@mui/icons-material';
import { MotionListItemComponent } from '../common/MotionComponents';

interface Chapter {
  id: string;
  title: string;
  duration: string;
  completed: boolean;
}

interface VideoPlayerProps {
  src: string;
  chapters: Chapter[];
  onChapterChange: (chapterId: string) => void;
  currentChapterId: string;
}

const VideoContainer = styled(Box)`
  position: relative;
  width: 100%;
  padding-top: 56.25%; /* 16:9 Aspect Ratio */
  background: #000;
  border-radius: 16px;
  overflow: hidden;
`;

const StyledVideo = styled('video')`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const Controls = styled(Box)`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  display: flex;
  align-items: center;
  gap: 16px;
`;

const ChapterList = styled(List)`
  margin-top: 24px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 16px;
`;

const StyledListItem = styled(MotionListItemComponent)<{ active: boolean }>`
  border-radius: 8px;
  margin-bottom: 8px;
  background: ${props => props.active ? 'rgba(255, 255, 255, 0.1)' : 'transparent'};
  
  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
`;

export const VideoPlayer = ({
  src,
  chapters,
  onChapterChange,
  currentChapterId,
}: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => setDuration(video.duration);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVolumeChange = (_: Event, newValue: number | number[]) => {
    const value = newValue as number;
    setVolume(value);
    if (videoRef.current) {
      videoRef.current.volume = value;
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeChange = (_: Event, newValue: number | number[]) => {
    const time = newValue as number;
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  return (
    <Box>
      <VideoContainer>
        <StyledVideo ref={videoRef} src={src} />
        <Controls>
          <IconButton onClick={togglePlay} color="primary">
            {isPlaying ? <Pause /> : <PlayArrow />}
          </IconButton>
          <Box sx={{ flex: 1, mx: 2 }}>
            <Slider
              value={currentTime}
              max={duration}
              onChange={handleTimeChange}
              aria-label="time-indicator"
              size="small"
              valueLabelDisplay="auto"
              valueLabelFormat={formatTime}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
              <Typography variant="caption">{formatTime(currentTime)}</Typography>
              <Typography variant="caption">{formatTime(duration)}</Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={toggleMute} color="primary">
              {isMuted ? <VolumeOff /> : <VolumeUp />}
            </IconButton>
            <Slider
              value={volume}
              onChange={handleVolumeChange}
              aria-label="Volume"
              min={0}
              max={1}
              step={0.1}
              sx={{ width: 100 }}
            />
            <IconButton onClick={toggleFullscreen} color="primary">
              <Fullscreen />
            </IconButton>
          </Box>
        </Controls>
      </VideoContainer>

      <ChapterList>
        <Typography variant="h6" gutterBottom>
          Chapters
        </Typography>
        {chapters.map((chapter) => (
          <StyledListItem
            key={chapter.id}
            active={chapter.id === currentChapterId}
            onClick={() => onChapterChange(chapter.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ListItemText
              primary={chapter.title}
              secondary={`Duration: ${chapter.duration}`}
            />
          </StyledListItem>
        ))}
      </ChapterList>
    </Box>
  );
}; 