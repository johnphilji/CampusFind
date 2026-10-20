import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock } from 'lucide-react';
import type { CampusItem } from '../../types';
import { StatusBadge, TypeBadge } from './Badges';
import { ResponsiveImage } from './ResponsiveImage';

interface ItemCardProps {
  item: CampusItem;
}

export const ItemCard: React.FC<ItemCardProps> = ({ item }) => {
  return (
    <Link
      to={`/item/${item.id}`}
      className="group flex flex-col justify-between bg-white rounded-2xl border border-[#E7EAF1] p-3 sm:p-3.5 card-shadow card-shadow-hover focus:outline-none focus:ring-2 focus:ring-[#3559C7]/50 active:scale-[0.99] transition-all"
    >
      <div className="flex gap-3 sm:gap-3.5">
        {/* Photo Thumbnail with Responsive Image and Fallback */}
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-xl overflow-hidden flex-shrink-0 border border-[#E7EAF1]/70">
          <ResponsiveImage
            src={item.imageUrl}
            alt={item.title}
            showMatchBadge={Boolean(item.possibleMatchCount)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Details Column */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-1.5 mb-1.5 flex-wrap">
              <TypeBadge type={item.type} />
              <StatusBadge status={item.status} />
            </div>

            <h3 className="text-xs sm:text-sm md:text-base font-bold text-[#172033] group-hover:text-[#243B8A] transition-colors truncate">
              {item.title}
            </h3>

            <p className="text-[11px] sm:text-xs text-[#70798B] line-clamp-2 mt-0.5 leading-snug">
              {item.description}
            </p>
          </div>

          <div className="mt-2 pt-2 border-t border-[#E7EAF1]/60 flex items-center justify-between text-[11px] sm:text-xs text-[#70798B] gap-2">
            <div className="flex items-center gap-1 min-w-0 text-[#172033]/80 font-medium">
              <MapPin className="w-3.5 h-3.5 text-[#3559C7] flex-shrink-0" />
              <span className="truncate">{item.location}</span>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0 text-[10px] sm:text-[11px] text-[#70798B]">
              <Clock className="w-3 h-3 flex-shrink-0" />
              <span>{item.timeAgo}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};
