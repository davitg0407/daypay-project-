import React from 'react';
import { MapPin, Calendar, Clock, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { Job, Language } from '../types';
import { translations } from '../translations';

interface JobCardProps {
  job: Job;
  onClick: (job: Job) => void;
  isRecommended?: boolean;
  language: Language;
}

const JobCard: React.FC<JobCardProps> = ({ job, onClick, isRecommended, language }) => {
  const t = translations[language].jobCard;

  return (
    <div 
      onClick={() => onClick(job)}
      className={`group relative overflow-hidden bg-white dark:bg-[#0f172a] rounded-[2.5rem] border ${isRecommended ? 'border-orange-500 shadow-orange-500/10' : 'border-slate-200 dark:border-slate-800 shadow-sm'} hover:shadow-2xl hover:border-orange-400 transition-all duration-500 cursor-pointer flex flex-col h-full active:scale-[0.98]`}
    >
      {isRecommended && (
        <div className="absolute top-0 right-0 bg-orange-500 text-white text-[10px] font-black px-5 py-2 rounded-bl-[1.5rem] uppercase tracking-widest flex items-center gap-1.5 shadow-lg">
          <Zap size={12} fill="currentColor" /> {t.aiRecommended}
        </div>
      )}
      
      <div className="p-8 flex-1">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-2.5">
            <span className={`w-2.5 h-2.5 rounded-full ${job.isUrgent ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">{job.category}</span>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-slate-900 dark:text-white">₾{job.budget}</span>
          </div>
        </div>

        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3 line-clamp-1 group-hover:text-orange-500 transition-colors">
          {job.title}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-6 leading-relaxed font-medium">
          {job.description}
        </p>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center text-[11px] text-slate-500 dark:text-slate-400 gap-2 font-bold uppercase tracking-wider">
            <MapPin size={16} className="text-orange-500" />
            <span className="truncate">{job.location}</span>
          </div>
          <div className="flex items-center text-[11px] text-slate-500 dark:text-slate-400 gap-2 font-bold uppercase tracking-wider">
            <Calendar size={16} className="text-blue-500" />
            {job.date}
          </div>
        </div>
      </div>

      <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30 flex justify-between items-center group-hover:bg-orange-50 dark:group-hover:bg-orange-900/10 transition-colors">
        <div className="flex items-center gap-3">
          <img src={`https://picsum.photos/seed/${job.posterId}/32/32`} className="w-8 h-8 rounded-xl object-cover" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">{t.verified} <ShieldCheck size={14} className="text-orange-500" /></span>
        </div>
        <button className="text-orange-500 dark:text-orange-400 font-black text-xs uppercase tracking-widest flex items-center gap-2 group-hover:translate-x-1 transition-transform min-h-[48px] px-4">
          {t.apply} <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default JobCard;