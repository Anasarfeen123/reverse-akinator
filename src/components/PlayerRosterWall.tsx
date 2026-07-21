import { PLAYER_ROSTER } from '../data/playerRoster';
import { getPlayerPortraitSrc } from '../services/playerArt';

export const PlayerRosterWall = () => {
  return (
    <div className="pointer-events-auto w-full rounded-[1.75rem] border border-slate-800/80 bg-slate-950/78 backdrop-blur-md shadow-[0_0_35px_rgba(2,6,23,0.35)] overflow-hidden">
      <div className="flex flex-col gap-3 px-4 py-4 border-b border-slate-800/80 bg-slate-900/70">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-slate-500">35 Star Roster</div>
            <div className="text-sm font-semibold text-white">Downloaded portraits and generated fallback art</div>
          </div>
          <div className="text-[11px] uppercase tracking-[0.28em] text-emerald-300 font-bold text-right">
            Compact preview
          </div>
        </div>
        <div className="text-xs text-slate-400 leading-relaxed max-w-2xl">
          The full roster is available, but this hero keeps the focus on kickoff and match flow.
        </div>
      </div>
      <div className="overflow-x-auto p-3">
        <div className="flex gap-3 pb-1 min-w-max">
          {PLAYER_ROSTER.map((name) => (
            <figure
              key={name}
              className="group w-24 sm:w-28 shrink-0 rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/80 hover:border-emerald-400/50 transition shadow-lg"
            >
              <img
                src={getPlayerPortraitSrc(name)}
                alt={name}
                loading="lazy"
                className="block w-full aspect-[4/5] object-cover group-hover:scale-[1.03] transition-transform duration-300"
              />
              <figcaption className="px-2 py-1.5 text-[10px] uppercase tracking-[0.2em] text-slate-300 truncate border-t border-slate-800/70 bg-slate-950/70">
                {name}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </div>
  );
};
