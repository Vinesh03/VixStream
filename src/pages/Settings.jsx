import React, { useState } from 'react';
import { Settings as SettingsIcon, Key, Trash2, Save, RefreshCw, Heart } from 'lucide-react';
import tmdbService from '../services/tmdb';
import useStore from '../store/useStore';

const Settings = () => {
  const { settings, updateSettings, clearAllData, resetSettings } = useStore();
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [saved, setSaved] = useState(false);

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
        {/* API Key Section */}
        <section className="bg-primary-light rounded-lg p-6 border border-secondary">
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
        <section className="bg-primary-light rounded-lg p-6 border border-secondary">
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
        <section className="bg-primary-light rounded-lg p-6 border border-secondary">
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
          </div>
        </section>

        {/* About / Branding */}
        <section className="bg-primary-light rounded-lg p-6 border border-secondary">
          <h2 className="text-xl font-semibold text-white mb-4">Informazioni</h2>
          
          <div className="space-y-2 text-sm text-gray-400">
            <p>VixSrc Streaming App</p>
            <p>Versione 1.0.0</p>
            <p className="flex items-center gap-2 pt-4 border-t border-secondary mt-4">
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
