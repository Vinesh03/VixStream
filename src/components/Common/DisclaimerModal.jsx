import React, { useState } from 'react';
import { AlertTriangle, ExternalLink, X } from 'lucide-react';

const DisclaimerModal = ({ onAccept }) => {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleAccept = () => {
    if (dontShowAgain) {
      localStorage.setItem('vixsrc_disclaimer_accepted', 'true');
    }
    onAccept();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="glass-panel border border-theme rounded-[var(--radius-m3)] max-w-lg w-full p-6 md:p-8 shadow-2xl">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-accent/10">
              <AlertTriangle className="w-7 h-7 text-accent" />
            </div>
            <h2 className="text-xl font-bold text-white">Avvertenza</h2>
          </div>
        </div>

        <div className="space-y-4 text-gray-300 leading-relaxed">
          <p>
            Questa app è un <strong className="text-white">semplice catalogo/interfaccia</strong> che
            si appoggia a servizi di terze parti (<span className="text-white">TMDB</span> per i dati
            e <span className="text-white">VixSrc</span> per la riproduzione).
          </p>
          <p>
            I contenuti video sono forniti e gestiti interamente da VixSrc:{' '}
            <strong className="text-white">non dipendono da noi</strong>. Il player potrebbe
            reindirizzarti su pagine esterne, mostrare pubblicità o non essere sempre disponibile.
          </p>
          <p className="text-sm text-gray-400">
            Usa l'app in modo consapevole e nel rispetto delle leggi del tuo paese.
          </p>
        </div>

        <label className="flex items-center gap-3 mt-6 cursor-pointer select-none group">
          <input
            type="checkbox"
            checked={dontShowAgain}
            onChange={(e) => setDontShowAgain(e.target.checked)}
            className="w-5 h-5 accent-red-600 cursor-pointer"
          />
          <span className="text-gray-300 group-hover:text-white transition-colors">
            Non mostrare più questo messaggio
          </span>
        </label>

        <button
          onClick={handleAccept}
          className="btn-primary w-full mt-6 flex items-center justify-center gap-2 text-lg py-3"
        >
          <ExternalLink className="w-5 h-5" />
          Ho capito, continua
        </button>
      </div>
    </div>
  );
};

export default DisclaimerModal;
