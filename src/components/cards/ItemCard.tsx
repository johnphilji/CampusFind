import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Building2 } from 'lucide-react';
import type { CampusItem } from '../../types';
import { StatusBadge, TypeBadge, SecurityBadge } from './Badges';
import { ResponsiveImage } from './ResponsiveImage';

interface ItemCardProps {
  item: CampusItem;
}

export const ItemCard: React.FC<ItemCardProps> = ({ item }) => {
  return (
    <Link
      to={`/item/${item.id}`}
      className="group flex flex-col justify-between bg-white rounded-2xl border border-slate-200/80 p-3 sm:p-4 card-shadow card-shadow-hover focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/30 active:scale-[0.99] transition-all"
    >
      <div className="flex gap-3 sm:gap-4">
        {/* Photo Thumbnail */}
        <div className="relative w-22 h-22 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-xl overflow-hidden flex-shrink-0 border border-slate-200/70 bg-slate-50">
          <ResponsiveImage
            src={item.imageUrl}
            alt={item.title}
            showMatchBadge={Boolean(item.possibleMatchCount)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {item.isHighValue && (
            <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-amber-600/90 backdrop-blur-xs text-white text-[9px] font-bold uppercase tracking-wider">
              Valuable
            </span>
          )}
        </div>

        {/* Details Column */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
              <TypeBadge type={item.type} />
              <StatusBadge status={item.status} />
              {item.securityLevel && <SecurityBadge level={item.securityLevel} />}
            </div>

            <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-[#1E3A8A] transition-colors truncate">
              {item.title}
            </h3>

            <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
              {item.description}
            </p>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 gap-2">
            <div className="flex items-center gap-1 min-w-0 text-slate-700 font-medium truncate">
              <MapPin className="w-3.5 h-3.5 text-[#0284C7] flex-shrink-0" />
              <span className="truncate">{item.location}</span>
            </div>
            
            {item.custodyLocation && (
              <div className="hidden lg:flex items-center gap-1 text-[11px] text-slate-500">
                <Building2 className="w-3 h-3 text-slate-400" />
                <span className="truncate max-w-[120px]">{item.custodyLocation.split('(')[0]}</span>
              </div>
            )}

            <div className="flex items-center gap-1 flex-shrink-0 text-[11px] text-slate-400">
              <Clock className="w-3 h-3 flex-shrink-0" />
              <span>{item.timeAgo}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};
