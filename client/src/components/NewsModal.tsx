import { X, ExternalLink, Clock, Tag } from 'lucide-react';
import { NewsItem } from '../api';
import { formatDate } from '../hooks';

interface NewsModalProps {
  news: NewsItem | null;
  onClose: () => void;
}

export default function NewsModal({ news, onClose }: NewsModalProps) {
  if (!news) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative bg-surface-card border border-surface-border rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden animate-slide-up shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 p-5 border-b border-surface-border">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-spherex-700/30 text-spherex-300">
                {news.source}
              </span>
              {news.region === 'tr' && (
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-red-500/20 text-red-400">
                  🇹🇷 Türkiye
                </span>
              )}
              {news.category && (
                <span className="text-[10px] px-2 py-0.5 rounded bg-surface-hover text-gray-400 flex items-center gap-1">
                  <Tag className="w-3 h-3" /> {news.category}
                </span>
              )}
            </div>
            <h2 className="text-lg font-bold text-white leading-snug">{news.title}</h2>
            <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              {formatDate(news.date)}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-surface-hover text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto max-h-[50vh]">
          {news.image && (
            <img
              src={news.image}
              alt=""
              className="w-full h-48 object-cover rounded-lg mb-4"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          )}
          <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
            {news.description || 'Bu haber için özet bulunmuyor. Orijinal kaynağı ziyaret ederek tam içeriği okuyabilirsiniz.'}
          </p>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-surface-border flex gap-3">
          <a
            href={news.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-spherex-700 hover:bg-spherex-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Orijinal Haberi Aç
          </a>
          <button
            onClick={onClose}
            className="px-4 py-3 bg-surface-hover hover:bg-surface-border text-gray-300 text-sm rounded-lg transition-colors"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
