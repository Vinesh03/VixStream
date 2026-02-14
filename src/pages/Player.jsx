import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import tmdbService from '../services/tmdb';
import VideoPlayer from '../components/VideoPlayer/VideoPlayer';
import Loading from '../components/Common/Loading';

const Player = () => {
  const { mediaType, id, season, episode } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTitle();
  }, [id, mediaType, season, episode]);

  const loadTitle = async () => {
    try {
      setLoading(true);
      const details = mediaType === 'movie'
        ? await tmdbService.getMovieDetails(id)
        : await tmdbService.getTVShowDetails(id);
      
      let displayTitle = details.title || details.name;
      
      if (mediaType === 'tv' && season && episode) {
        displayTitle += ` - S${season}E${episode}`;
      }
      
      setTitle(displayTitle);
    } catch (error) {
      console.error('Error loading title:', error);
      setTitle('Riproduzione');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    navigate(-1);
  };

  if (loading) {
    return <Loading fullScreen text="Preparazione player..." />;
  }

  return (
    <VideoPlayer
      tmdbId={id}
      mediaType={mediaType}
      season={season ? parseInt(season) : null}
      episode={episode ? parseInt(episode) : null}
      title={title}
      onClose={handleClose}
      autoPlay={true}
    />
  );
};

export default Player;
