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
  const [meta, setMeta] = useState(null);
  const [seasonEpisodes, setSeasonEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);

  const curSeason = season ? parseInt(season, 10) : null;
  const curEpisode = episode ? parseInt(episode, 10) : null;

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        setLoading(true);
        const details = mediaType === 'movie'
          ? await tmdbService.getMovieDetails(id)
          : await tmdbService.getTVShowDetails(id);
        if (!live) return;
        setMeta(details);

        if (mediaType === 'tv' && curSeason) {
          const sData = await tmdbService.getTVSeasonDetails(id, curSeason);
          if (live) setSeasonEpisodes(sData.episodes || []);
        } else {
          if (live) setSeasonEpisodes([]);
        }
      } catch (error) {
        console.error('Error loading details:', error);
      } finally {
        if (live) setLoading(false);
      }
    })();
    return () => { live = false; };
  }, [id, mediaType, curSeason]);

  const handleClose = () => {
    navigate(-1);
  };

  const handleSelectEpisode = (epNum, sNum = curSeason) => {
    navigate(`/player/tv/${id}/${sNum}/${epNum}`);
  };

  const nextEpObj = seasonEpisodes.find((e) => e.episode_number === curEpisode + 1);

  const handleNextEpisode = () => {
    if (nextEpObj) {
      handleSelectEpisode(nextEpObj.episode_number);
    }
  };

  if (loading && !meta) {
    return <Loading fullScreen text="Preparazione player..." />;
  }

  let displayTitle = meta?.title || meta?.name || 'Riproduzione';
  if (mediaType === 'tv' && curSeason && curEpisode) {
    displayTitle += ` - S${curSeason}E${curEpisode}`;
  }

  return (
    <VideoPlayer
      tmdbId={id}
      mediaType={mediaType}
      season={curSeason}
      episode={curEpisode}
      title={displayTitle}
      posterPath={meta?.poster_path || null}
      backdropPath={meta?.backdrop_path || null}
      onClose={handleClose}
      autoPlay={settings.autoplay}
      episodes={seasonEpisodes}
      hasNextEpisode={Boolean(nextEpObj)}
      onNextEpisode={nextEpObj ? handleNextEpisode : null}
      onSelectEpisode={handleSelectEpisode}
    />
  );
};

export default Player;
