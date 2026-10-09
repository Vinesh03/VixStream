import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import tmdbService from '../services/tmdb';
import VideoPlayer from '../components/VideoPlayer/VideoPlayer';
import Loading from '../components/Common/Loading';
import useStore from '../store/useStore';

const Player = () => {
  const { mediaType, id, season, episode } = useParams();
  const navigate = useNavigate();
  const settings = useStore((s) => s.settings);
  const [meta, setMeta] = useState(null); // UN solo fetch: titolo + poster + backdrop
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMeta();
  }, [id, mediaType, season, episode]);

  const loadMeta = async () => {
    try {
      setLoading(true);
      const details = mediaType === 'movie'
        ? await tmdbService.getMovieDetails(id)
        : await tmdbService.getTVShowDetails(id);
      setMeta(details);
    } catch (error) {
      console.error('Error loading details:', error);
      setMeta(null);
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

  let displayTitle = meta?.title || meta?.name || 'Riproduzione';
  if (mediaType === 'tv' && season && episode) {
    displayTitle += ` - S${season}E${episode}`;
  }

  return (
    <VideoPlayer
      tmdbId={id}
      mediaType={mediaType}
      season={season ? parseInt(season) : null}
      episode={episode ? parseInt(episode) : null}
      title={displayTitle}
      posterPath={meta?.poster_path || null}
      backdropPath={meta?.backdrop_path || null}
      onClose={handleClose}
      autoPlay={settings.autoplay} // dal toggle nelle Impostazioni (prima fisso true)
    />
  );
};

export default Player;
