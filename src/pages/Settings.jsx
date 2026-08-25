import React, { useEffect, useState } from 'react';
import { Settings as SettingsIcon, Key, Trash2, Save, RefreshCw, Heart, Info, RotateCw } from 'lucide-react';
import tmdbService from '../services/tmdb';
import useStore from '../store/useStore';
import { applyRotationSetting } from '../services/orientation';
import { THEMES, applyTheme } from '../services/themes';
import { Capacitor } from '@capacitor/core';
import { Palette } from 'lucide-react';

const Settings = () => {
  const { settings, updateSettings, clearAllData, resetSettings } = useStore();
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const isNative = Capacitor.isNativePlatform?.();

  const handleToggleRotate = async () => {
    const newValue = !settings.autoRotate;
    updateSettings({ autoRotate: newValue });
    await applyRotationSetting(newValue);
  };

  const handleSaveApiKey = () => {
    if (apiKey.trim()) {
      tmdbService.setApiKey(apiKey.trim());
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const handleResetApiKey = () => {
    if (confirm('Sei sicuro di voler ripristinare la chiave API predefinita?')) {
      tmdbService.resetApiKey();
      setApiKey('');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const handleClearData = () => {
    if (confirm('Sei sicuro di voler cancellare tutti i dati? Questa azione non può essere annullata.')) {
      clearAllData();
      alert('Tutti i dati sono stati cancellati.');
    }
  };

  const handleResetSettings = () => {
    if (confirm('Sei sicuro di voler ripristinare le impostazioni predefinite?')) {
      resetSettings();
      alert('Impostazioni ripristinate.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen max-w-4xl">
      <div className="flex items-center gap-3 mb-8">
        <SettingsIcon className="w-8 h-8 text-accent" />
        <h1 className="text-3xl font-bold text-white">Impostazioni</h1>
      </div>

      <div className="space-y-6">
        {/* Tema */}
        <section className="bg-app-light rounded-card p-6 border border-theme">
          <div className="flex items-center gap-2 mb-4">
            <Palette className="w-5 h-5 text-accent" />
            <h2 className="text-xl font-semibold text-white">Tema</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(THEMES).map(([id, theme]) => {
              const active = (settings.theme || 'cinema') === id;
              return (
                <button
                  key={id}
                  onClick={() => {
                    updateSettings({ theme: id });
                    applyTheme(id);
                  }}
                  className={`rounded-card p-3 text-left border transition-all duration-200 active:scale-[.97] ${
                    active
                      ? 'border-accent ring-2 ring-[var(--c-accent-soft)]'
                      : 'border-theme hover:border-white/25'
                  }`}
                  style={{ backgroundColor: 'var(--c-surface)' }}
                >
                  {/* Anteprima mini */}
                  <div
                    className="h-10 rounded-xl mb-2 relative overflow-hidden"
                    style={{
                      background:
                        id === 'glass'
                          ? 'linear-gradient(135deg,#1e2a4a 0%,#0a84ff33 60%),#0d0d12'
                          : id === 'amoled'
                          ? '#000'
                          : id === 'oneui'
                          ? '#010101'
                          : '#101014',
                    }}
                  >
                    <span
                      className="absolute bottom-1.5 left-1.5 w-6 h-6 rounded-md"
                      style={{ backgroundColor: theme.vars['--c-accent'] }}
                    />
                    {id === 'glass' && (
                      <span
                        className="absolute top-1.5 right-1.5 left-8 bottom-6 rounded-md"
                        style={{ background: 'rgba(255,255,255,.12)', backdropFilter: 'blur(2px)' }}
                      />
                    )}
                  </div>
                  <p className="text-sm font-medium text-white leading-tight">{theme.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{active ? 'In uso' : theme.hint}</p>
                </button>
              );
            })}
          </div>
        </section>

        {/* Auto-rotazione (solo su app nativa) */}
        {isNative && (
          <section className="bg-app-light rounded-card p-6 border border-theme">
            <div className="flex items-center gap-2 mb-4">
              <RotateCw className="w-5 h-5 text-accent" />
              <h2 className="text-xl font-semibold text-white">Schermo</h2>
            </div>

            <label className="flex items-center justify-between cursor-pointer select-none py-1">
              <div>
                <p className="text-white font-medium">Auto-rotazione</p>
                <p className="text-gray-400 text-sm mt-0.5">
                  Consenti la rotazione in orizzontale ruotando il telefono
                </p>
              </div>
              <button
                role="switch"
                aria-checked={!!settings.autoRotate}
                onClick={handleToggleRotate}
                className={`relative w-14 h-8 rounded-full transition-colors duration-200 flex-shrink-0 ml-4 ${
                  settings.autoRotate ? 'bg-accent' : 'bg-secondary'
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow transition-transform duration-200 ${
                    settings.autoRotate ? 'translate-x-6' : ''
                  }`}
                />
              </button>
            </label>
          </section>
        )}

        {/* API Key Section */}
        <section className="bg-app-light rounded-card p-6 border border-theme">
          <div className="flex items-center gap-2 mb-4">
            <Key className="w-5 h-5 text-accent" />
            <h2 className="text-xl font-semibold text-white">Chiave API TMDB</h2>
          </div>
          
          <p className="text-gray-400 mb-4 text-sm">
            Inserisci una chiave API personalizzata di The Movie Database. Se lasci vuoto, verrà utilizzata la chiave predefinita.
          </p>

          <div className="space-y-4">
            <div>
              <input
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Inserisci la tua API key..."
                className="input-field w-full"
              />
              <div className="mt-2">
                <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showApiKey}
                    onChange={(e) => setShowApiKey(e.target.checked)}
                    className="rounded"
                  />
                  Mostra API key
                </label>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSaveApiKey}
                className="btn-primary flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Salva
              </button>
              
              <button
                onClick={handleResetApiKey}
                className="btn-secondary flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Ripristina predefinita
              </button>
            </div>

            {saved && (
              <p className="text-green-500 text-sm">✓ Chiave API salvata con successo!</p>
            )}
          </div>
        </section>

        {/* Playback Settings */}
        <section className="bg-app-light rounded-card p-6 border border-theme">
          <h2 className="text-xl font-semibold text-white mb-4">Riproduzione</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Autoplay</p>
                <p className="text-sm text-gray-400">Avvia automaticamente la riproduzione</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoplay}
                  onChange={(e) => updateSettings({ autoplay: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-accent rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Sottotitoli</p>
                <p className="text-sm text-gray-400">Mostra i sottotitoli quando disponibili</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.subtitles}
                  onChange={(e) => updateSettings({ subtitles: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-accent rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
              </label>
            </div>

            <div>
              <label className="block text-white font-medium mb-2">Qualità video</label>
              <select
                value={settings.quality}
                onChange={(e) => updateSettings({ quality: e.target.value })}
                className="input-field w-full"
              >
                <option value="auto">Automatica</option>
                <option value="1080p">1080p</option>
                <option value="720p">720p</option>
                <option value="480p">480p</option>
              </select>
            </div>

            <div>
              <label className="block text-white font-medium mb-2">Lingua</label>
              <select
                value={settings.language}
                onChange={(e) => updateSettings({ language: e.target.value })}
                className="input-field w-full"
              >
                <option value="it">Italiano</option>
                <option value="en">Inglese</option>
                <option value="es">Spagnolo</option>
                <option value="fr">Francese</option>
                <option value="de">Tedesco</option>
              </select>
            </div>
          </div>
        </section>

        {/* Data Management */}
        <section className="bg-app-light rounded-card p-6 border border-theme">
          <h2 className="text-xl font-semibold text-white mb-4">Gestione dati</h2>
          
          <div className="space-y-4">
            <button
              onClick={handleResetSettings}
              className="btn-secondary flex items-center gap-2 w-full justify-center"
            >
              <RefreshCw className="w-4 h-4" />
              Ripristina impostazioni predefinite
            </button>

            <button
              onClick={handleClearData}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-200 flex items-center gap-2 w-full justify-center"
            >
              <Trash2 className="w-4 h-4" />
              Cancella tutti i dati (preferiti, cronologia, ecc.)
            </button>

            <button
              onClick={() => {
                localStorage.removeItem('vixsrc_disclaimer_accepted');
                window.location.reload();
              }}
              className="btn-secondary flex items-center gap-2 w-full justify-center"
            >
              <Info className="w-4 h-4" />
              Mostra di nuovo l'avvertenza all'avvio
            </button>
          </div>
        </section>

        {/* About / Branding */}
        <section className="bg-app-light rounded-card p-6 border border-theme">
          <h2 className="text-xl font-semibold text-white mb-4">Informazioni</h2>
          
          <div className="space-y-2 text-sm text-gray-400">
            <p>VixSrc Streaming App</p>
            <p>Versione 1.0.0</p>
            <p className="flex items-center gap-2 pt-4 border-t border-theme mt-4">
              <Heart className="w-4 h-4 text-accent fill-accent" />
              <span>Fatto con <span className="text-accent font-semibold">vibecoding</span> e amore da <span className="text-white font-semibold">SheetSeeker1486</span></span>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Settings;
