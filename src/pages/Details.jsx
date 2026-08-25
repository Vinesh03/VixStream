import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Play, Heart, Clock, ArrowLeft, ListVideo } from 'lucide-react';
import tmdbService from '../services/tmdb';
import useStore from '../store/useStore';
import Loading from '../components/Common/Loading';
import ErrorMessage from '../components/Common/ErrorMessage';
import MediaGrid from '../components/MediaGrid/MediaGrid';

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

  const { isFavorite, addFavorite, removeFavorite, continueWatching } = useStore();
  const isFav = details ? isFavorite(details.id, mediaType) : false;

  // Ultimo progresso per questa serie (per "riprendi da dove eri")
  const watchEntry = continueWatching.find(
    (w) => String(w.id) === String(id) && w.media_type === mediaType && w.media_type === 'tv'
  );

  useEffect(() => {
    loadDetails();
  }, [id, mediaType]);

  // Carica gli episodi quando cambia la stagione selezionata
  useEffect(() => {
    if (mediaType !== 'tv' || !selectedSeason) return;
    let cancelled = false;
    setEpisodesLoading(true);
    tmdbService.getTVSeasonDetails(id, selectedSeason.season_number)
      .then((data) => {
        if (!cancelled) setEpisodes(data.episodes || []);
      })
      .catch(() => { if (!cancelled) setEpisodes([]); })
      .finally(() => { if (!cancelled) setEpisodesLoading(false); });
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
        const validSeasons = data.seasons.filter(s => s.season_number > 0 && s.episode_count > 0);
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

  /**
   * Play intelligente per le serie TV:
   * 1. Se la serie è in "Continua a guardare" con stagione/episodio validi → riprendi da lì
   * 2. Altrimenti parte dal primo episodio della prima stagione disponibile
   */
  const handlePlay = () => {
    if (mediaType === 'movie') {
      navigate(`/player/movie/${id}`);
      return;
    }

    // Riprendi: usa l'ultima posizione salvata se ha senso
    if (watchEntry && watchEntry.season != null && watchEntry.episode != null) {
      const seasonExists = seasons.some(s => s.season_number === watchEntry.season);
      if (seasonExists) {
        navigate(`/player/tv/${id}/${watchEntry.season}/${watchEntry.episode}`);
        return;
      }
    }

    // Prima visione: primo episodio della prima stagione con episodi
    const firstSeason = seasons.find(s => s.episode_count > 0);
    if (firstSeason) {
      navigate(`/player/tv/${id}/${firstSeason.season_number}/1`);
    }
  };

  const playEpisode = (episodeNumber) => {
    if (!selectedSeason) return;
    navigate(`/player/tv/${id}/${selectedSeason.season_number}/${episodeNumber}`);
  };

  /** Etichetta del pulsante play principale */
  const getPlayLabel = () => {
    if (mediaType !== 'tv') return 'Riproduci';
    if (watchEntry && watchEntry.season != null && watchEntry.episode != null
        && seasons.some(s => s.season_number === watchEntry.season)) {
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
        media_type: mediaType
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
  const rating = details.vote_average ? details.vote_average.toFixed(1) : 'N/A';
  const runtime = details.runtime || details.episode_run_time?.[0];
  const backdropUrl = tmdbService.getImageUrl(details.backdrop_path, 'original');
  const posterUrl = tmdbService.getImageUrl(details.poster_path, 'w500');

  // Episodio corrente in corso (per evidenziarlo nella lista)
  const currentEp = (watchEntry && selectedSeason &&
                     watchEntry.season === selectedSeason.season_number) ? watchEntry.episode : null;

  return (
    <div className="min-h-screen pb-12">
      {/* Hero Section */}
      <div className="relative min-h-[70vh] md:h-[70vh] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${backdropUrl})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/80 to-primary/30" />

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 z-10 p-2 rounded-lg bg-black/50 hover:bg-black/70 transition-colors tv-focusable"
          aria-label="Torna indietro"
        >
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>

        <div className="relative container mx-auto px-4 pt-16 pb-12 md:pt-0 md:pb-12 flex items-end">
          <div className="flex flex-col md:flex-row gap-4 md:gap-8 w-full">
            {/* Poster */}
            <div className="flex-shrink-0 self-center md:self-auto">
              <img
                src={posterUrl}
                alt={title}
                className="w-32 md:w-48 rounded-lg shadow-2xl"
                onError={(e) => {
                  e.target.src = '/placeholder.svg';
                }}
              />
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-2xl md:text-5xl font-bold text-white mb-2 md:mb-4 break-words">
                {title}
              </h1>

              <div className="flex flex-wrap items-center gap-2 md:gap-4 mb-4 md:mb-6 text-gray-300">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="text-lg font-semibold">{rating}</span>
                </div>
                {year && <span>{year}</span>}
                {runtime && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{runtime} min</span>
                  </div>
                )}
                {details.genres?.map(genre => (
                  <span key={genre.id} className="px-3 py-1 bg-secondary rounded-full text-sm">
                    {genre.name}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap gap-3 md:gap-4 mb-4">
                <button
                  onClick={handlePlay}
                  disabled={mediaType === 'tv' && !seasons.length}
                  className="btn-primary flex items-center gap-2 text-base md:text-lg flex-1 sm:flex-none justify-center disabled:opacity-50"
                >
                  <Play className="w-5 h-5 md:w-6 md:h-6" />
                  {getPlayLabel()}
                </button>

                <button
                  onClick={() => setShowEpisodes(v => !v)}
                  disabled={mediaType !== 'tv' || !seasons.length}
                  className={`btn-secondary flex items-center gap-2 text-sm md:text-base disabled:hidden ${
                    showEpisodes ? 'bg-accent/30' : ''
                  }`}
                >
                  <ListVideo className="w-4 h-4 md:w-5 md:h-5" />
                  Episodi
                </button>

                <button
                  onClick={handleToggleFavorite}
                  className={`btn-secondary flex items-center gap-2 text-sm md:text-base ${
                    isFav ? 'bg-red-600 hover:bg-red-700' : ''
                  }`}
                >
                  <Heart className={`w-4 h-4 md:w-5 md:h-5 ${isFav ? 'fill-current' : ''}`} />
                  {isFav ? 'Rimuovi' : 'Aggiungi'}
                </button>
              </div>

              {details.overview && (
                <div className="max-w-3xl">
                  <h3 className="text-lg font-semibold text-white mb-2">Trama</h3>
                  <p className="text-gray-300 leading-relaxed">
                    {details.overview}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Selettore Stagioni + Episodi */}
      {showEpisodes && seasons.length > 0 && (
        <section className="container mx-auto px-4 mt-6 animate-fade-in">
          <h2 className="text-xl font-bold text-white mb-4">Stagioni ed episodi</h2>

          {/* Selettore stagione */}
          <div className="flex gap-3 overflow-x-auto pb-4">
            {seasons.map(season => (
              <button
                key={season.id}
                onClick={() => setSelectedSeason(season)}
                className={`flex-shrink-0 px-6 py-3 rounded-lg font-semibold transition-all tv-focusable ${
                  selectedSeason?.id === season.id
                    ? 'bg-accent text-white'
                    : 'bg-secondary text-gray-300 hover:bg-white/10'
                }`}
              >
                Stagione {season.season_number}
              </button>
            ))}
          </div>

          {/* Lista episodi */}
          <div className="space-y-2 mt-4 pb-2">
            {episodesLoading ? (
              <Loading text="Caricamento episodi..." />
            ) : episodes.length === 0 ? (
              <p className="text-gray-400">Nessun episodio disponibile per questa stagione.</p>
            ) : (
              episodes.map(ep => {
                const isCurrent = currentEp === ep.episode_number;
                return (
                  <button
                    key={ep.id}
                    onClick={() => playEpisode(ep.episode_number)}
                    className={`w-full text-left flex items-center gap-4 p-3 rounded-card border transition-all duration-200 hover:bg-white/10 tv-focusable ${
                      isCurrent ? 'border-accent bg-[var(--c-accent-soft)]' : 'border-theme bg-surface-c'
                    }`}
                  >
                    {/* Numero episodio */}
                    <span className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center font-bold ${
                      isCurrent ? 'bg-accent text-white' : 'bg-secondary text-gray-300'
                    }`}>
                      {ep.episode_number}
                    </span>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">
                        {ep.name || `Episodio ${ep.episode_number}`}
                        {isCurrent && <span className="text-accent text-xs ml-2">● in corso</span>}
                      </p>
                      {ep.air_date && (
                        <p className="text-xs text-gray-400">{ep.air_date}</p>
                      )}
                    </div>

                    {/* Mini anteprima */}
                    {ep.still_path && (
                      <img
                        src={tmdbService.getImageUrl(ep.still_path, 'w185')}
                        alt=""
                        loading="lazy"
                        className="hidden sm:block w-24 aspect-video object-cover rounded-md flex-shrink-0"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    )}

                    <Play className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  </button>
                );
              })
            )}
          </div>
        </section>
      )}

      <div className="container mx-auto px-4 mt-12 space-y-12">
        {/* Similar Content */}
        {details.similar?.results?.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-white mb-6">Contenuti simili</h2>
            <MediaGrid
              items={details.similar.results.slice(0, 12)}
              mediaType={mediaType}
            />
          </section>
        )}

        {/* Recommendations */}
        {details.recommendations?.results?.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-white mb-6">Consigliati per te</h2>
            <MediaGrid
              items={details.recommendations.results.slice(0, 12)}
              mediaType={mediaType}
            />
          </section>
        )}
      </div>
    </div>
  );
};

export default Details;
