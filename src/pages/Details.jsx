import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Play, Heart, Clock, ArrowLeft, ListVideo, X, Users, Calendar, Award } from 'lucide-react';
import tmdbService from '../services/tmdb';
import useStore from '../store/useStore';
import Loading from '../components/Common/Loading';
import ErrorMessage from '../components/Common/ErrorMessage';
import MediaGrid from '../components/MediaGrid/MediaGrid';

function formatRuntime(mins) {
  if (!mins) return null;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

const Details = () => {
  const { mediaType, id } = useParams();
  const navigate = useNavigate();
  const [details, setDetails] = useState(null);
  const [seasons, setSeasons] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [episodesLoading, setEpisodesLoading] = useState(false);
  const [showEpisodes, setShowEpisodes] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { isFavorite, addFavorite, removeFavorite, continueWatching, removeContinueWatching } = useStore();
  const isFav = details ? isFavorite(details.id, mediaType) : false;

  const watchEntry = continueWatching.find(
    (w) => String(w.id) === String(id) && w.media_type === mediaType && w.media_type === 'tv'
  );

  useEffect(() => {
    loadDetails();
  }, [id, mediaType]);

  useEffect(() => {
    if (mediaType !== 'tv' || !selectedSeason) return;
    let cancelled = false;
    setEpisodesLoading(true);
    tmdbService.getTVSeasonDetails(id, selectedSeason.season_number)
      .then((data) => {
        if (!cancelled) setEpisodes(data.episodes || []);
      })
      .catch(() => { if (!cancelled) setEpisodes([]); });
    return () => { cancelled = true; };
  }, [id, mediaType, selectedSeason]);

  const loadDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = mediaType === 'movie'
        ? await tmdbService.getMovieDetails(id)
        : await tmdbService.getTVShowDetails(id);

      setDetails(data);

      if (mediaType === 'tv' && data.seasons) {
        const validSeasons = data.seasons.filter((s) => s.season_number > 0 && s.episode_count > 0);
        setSeasons(validSeasons);
        setSelectedSeason(validSeasons[0] || null);
      }
    } catch (err) {
      console.error('Error loading details:', err);
      setError('Impossibile caricare i dettagli. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = () => {
    if (mediaType === 'movie') {
      navigate(`/player/movie/${id}`);
      return;
    }

    if (watchEntry && watchEntry.season != null && watchEntry.episode != null) {
      const seasonExists = seasons.some((s) => s.season_number === watchEntry.season);
      if (seasonExists) {
        navigate(`/player/tv/${id}/${watchEntry.season}/${watchEntry.episode}`);
        return;
      }
    }

    const firstSeason = seasons.find((s) => s.episode_count > 0);
    if (firstSeason) {
      navigate(`/player/tv/${id}/${firstSeason.season_number}/1`);
    }
  };

  const playEpisode = (episodeNumber) => {
    if (!selectedSeason) return;
    navigate(`/player/tv/${id}/${selectedSeason.season_number}/${episodeNumber}`);
  };

  const getPlayLabel = () => {
    if (mediaType !== 'tv') return 'Riproduci';
    if (watchEntry && watchEntry.season != null && watchEntry.episode != null
        && seasons.some((s) => s.season_number === watchEntry.season)) {
      return `Riprendi S${watchEntry.season}E${watchEntry.episode}`;
    }
    return 'Riproduci S1E1';
  };

  const handleToggleFavorite = () => {
    if (isFav) {
      removeFavorite(details.id, mediaType);
    } else {
      addFavorite({
        ...details,
        media_type: mediaType,
      });
    }
  };

  if (loading) {
    return <Loading fullScreen text="Caricamento dettagli..." />;
  }

  if (error || !details) {
    return <ErrorMessage message={error} onRetry={loadDetails} fullScreen />;
  }

  const title = details.title || details.name;
  const releaseDate = details.release_date || details.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : '';
  const rating = details.vote_average ? details.vote_average.toFixed(1) : null;
  const runtime = formatRuntime(details.runtime || details.episode_run_time?.[0]);
  const backdropUrl = tmdbService.getImageUrl(details.backdrop_path, 'w780');
  const posterUrl = tmdbService.getImageUrl(details.poster_path, 'w342');
  const cast = details.credits?.cast?.slice(0, 14) || [];

  const currentEp = (watchEntry && selectedSeason &&
                     watchEntry.season === selectedSeason.season_number) ? watchEntry.episode : null;

  return (
    <div className="min-h-screen pb-16">
      {/* Hero Header */}
      <div className="relative min-h-[50vh] md:h-[68vh] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${backdropUrl})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/85 to-primary/40" />

        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 z-20 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-all active:scale-95 tv-focusable border border-white/10"
          aria-label="Torna indietro"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="relative container mx-auto px-4 py-16 md:py-12 flex items-center min-h-[50vh]">
          <div className="flex flex-col md:flex-row gap-5 md:gap-8 w-full items-start">
            <div className="flex-shrink-0 self-center md:self-auto">
              <img
                src={posterUrl}
                alt={title}
                className="w-36 md:w-52 rounded-2xl shadow-2xl border border-white/10 object-cover aspect-[2/3]"
                onError={(e) => { e.target.src = '/placeholder.svg'; }}
              />
            </div>

            <div className="flex-1 w-full">
              <h1 className="text-2xl md:text-4xl font-bold text-white mb-2 leading-tight">
                {title}
              </h1>

              {/* Badge metadata */}
              <div className="flex flex-wrap items-center gap-2 mb-4 text-xs md:text-sm text-gray-300">
                {rating && rating !== '0.0' && (
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-yellow-400/20 text-yellow-400 font-semibold border border-yellow-400/30">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{rating}</span>
                  </div>
                )}
                {year && (
                  <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 font-mono">
                    {year}
                  </span>
                )}
                {runtime && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 border border-white/10 font-mono">
                    <Clock className="w-3 h-3 text-gray-400" />
                    {runtime}
                  </span>
                )}
                <span className="uppercase text-[10px] tracking-wider px-2 py-0.5 rounded-md bg-accent/20 border border-accent/30 text-accent font-semibold font-mono">
                  {mediaType === 'tv' ? 'Serie TV' : 'Film'}
                </span>
                {details.genres?.map((genre) => (
                  <span key={genre.id} className="px-2.5 py-0.5 bg-white/5 hover:bg-white/15 rounded-full text-xs text-gray-300 border border-white/10 transition-colors">
                    {genre.name}
                  </span>
                ))}
              </div>

              {/* Bottoni d'azione */}
              <div className="flex flex-wrap gap-2.5 mb-5">
                <button
                  onClick={handlePlay}
                  disabled={mediaType === 'tv' && !seasons.length}
                  className="btn-primary flex items-center gap-2 text-sm md:text-base px-6 py-2.5 disabled:opacity-50 active:scale-95 transition-transform shadow-lg"
                >
                  <Play className="w-4 h-4 fill-current" />
                  {getPlayLabel()}
                </button>

                {mediaType === 'tv' && seasons.length > 0 && (
                  <button
                    onClick={() => setShowEpisodes((v) => !v)}
                    className={`btn-secondary flex items-center gap-2 text-sm px-4 py-2.5 active:scale-95 transition-transform ${
                      showEpisodes ? 'bg-accent/30 border-accent/50 text-accent' : ''
                    }`}
                  >
                    <ListVideo className="w-4 h-4" />
                    Episodi
                  </button>
                )}

                <button
                  onClick={handleToggleFavorite}
                  className={`btn-secondary flex items-center gap-2 text-sm px-4 py-2.5 active:scale-95 transition-transform ${
                    isFav ? 'bg-red-600 hover:bg-red-700 text-white' : ''
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                  {isFav ? 'Nei preferiti' : 'Salva'}
                </button>
              </div>

              {details.overview && (
                <div className="max-w-3xl">
                  <h3 className="text-sm font-semibold text-white/90 uppercase tracking-wider mb-1.5">Trama</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {details.overview}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Striscia Cast (Attori) */}
      {cast.length > 0 && (
        <section className="container mx-auto px-4 mt-8">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-accent" />
            <h2 className="text-base md:text-lg font-bold text-white tracking-tight">Cast principale</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
            {cast.map((actor) => (
              <div key={actor.id} className="flex-shrink-0 w-24 text-center">
                <div className="w-20 h-20 mx-auto rounded-full overflow-hidden bg-secondary border border-white/10 mb-1.5 shadow-md">
                  {actor.profile_path ? (
                    <img
                      src={tmdbService.getImageUrl(actor.profile_path, 'w185')}
                      alt={actor.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500 text-xl font-bold">
                      {actor.name.charAt(0)}
                    </div>
                  )}
                </div>
                <p className="text-xs font-medium text-white truncate">{actor.name}</p>
                <p className="text-[10px] text-gray-400 truncate">{actor.character || '—'}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Selettore Stagioni ed Episodi */}
      {showEpisodes && seasons.length > 0 && (
        <section className="container mx-auto px-4 mt-6 animate-fade-in">
          <h2 className="text-lg font-bold text-white mb-3">Stagioni ed episodi</h2>

          {/* Selettore stagione */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {seasons.map((season) => (
              <button
                key={season.id}
                onClick={() => setSelectedSeason(season)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition-all tv-focusable ${
                  selectedSeason?.id === season.id
                    ? 'bg-accent text-white shadow-md'
                    : 'bg-surface text-gray-300 hover:bg-white/10 border border-white/5'
                }`}
              >
                Stagione {season.season_number}
              </button>
            ))}
          </div>

          {/* Lista episodi con still preview */}
          <div className="space-y-2 mt-3">
            {episodesLoading ? (
              <Loading text="Caricamento episodi..." />
            ) : episodes.length === 0 ? (
              <p className="text-gray-400 text-xs">Nessun episodio disponibile per questa stagione.</p>
            ) : (
              episodes.map((ep) => {
                const isCurrent = currentEp === ep.episode_number;
                return (
                  <div
                    key={ep.id}
                    onClick={() => playEpisode(ep.episode_number)}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-xl border transition-all cursor-pointer hover:bg-white/10 ${
                      isCurrent ? 'border-accent bg-[var(--c-accent-soft)]' : 'border-white/5 bg-surface'
                    }`}
                  >
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      isCurrent ? 'bg-accent text-white' : 'bg-secondary text-gray-300'
                    }`}>
                      {ep.episode_number}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs md:text-sm font-medium truncate">
                        {ep.name || `Episodio ${ep.episode_number}`}
                        {isCurrent && <span className="text-accent text-[11px] ml-2">● in corso</span>}
                      </p>
                      {ep.air_date && <p className="text-[11px] text-gray-400">{ep.air_date}</p>}
                    </div>

                    {ep.still_path && (
                      <img
                        src={tmdbService.getImageUrl(ep.still_path, 'w185')}
                        alt=""
                        loading="lazy"
                        className="w-20 md:w-24 aspect-video object-cover rounded-md flex-shrink-0 bg-secondary"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </section>
      )}

      {/* Contenuti simili e raccomandati */}
      <div className="container mx-auto px-4 mt-10 space-y-10">
        {details.similar?.results?.length > 0 && (
          <section>
            <h2 className="text-base md:text-lg font-bold text-white mb-4">Contenuti simili</h2>
            <MediaGrid items={details.similar.results.slice(0, 12)} mediaType={mediaType} />
          </section>
        )}

        {details.recommendations?.results?.length > 0 && (
          <section>
            <h2 className="text-base md:text-lg font-bold text-white mb-4">Consigliati per te</h2>
            <MediaGrid items={details.recommendations.results.slice(0, 12)} mediaType={mediaType} />
          </section>
        )}
      </div>
    </div>
  );
};

export default Details;
