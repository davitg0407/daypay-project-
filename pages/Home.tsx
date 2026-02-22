
import React from 'react';
import { ArrowRight, Zap, Target, ShieldCheck, TrendingUp, Users, Briefcase, UserPlus } from 'lucide-react';
import { CATEGORIES } from '../constants';
import JobCard from '../components/JobCard';
import { Job, Language, UserRole } from '../types';
import { translations } from '../translations';

interface HomeProps {
  jobs: Job[];
  onFindWork: () => void;
  onPostJob: () => void;
  onSelectJob: (job: Job) => void;
  language: Language;
  userRole: UserRole;
  onSwitchRole: () => void;
}

const Home: React.FC<HomeProps> = ({ jobs, onFindWork, onPostJob, onSelectJob, language, userRole, onSwitchRole }) => {
  const t = translations[language];
  const isWorker = userRole === 'WORKER';
  const featuredJobs = jobs.slice(0, 3);

  return (
    <div className="space-y-32">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[4rem] bg-[#020617] py-32 px-10 shadow-3xl">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-600/20 to-amber-600/5 opacity-60" />
        <div className="absolute top-0 right-0 w-1/2 h-full georgian-pattern opacity-10" />
        
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-white/5 text-white text-[10px] font-black uppercase tracking-[0.3em] mb-10 border border-white/10 backdrop-blur-md">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" /> {t.hero.tag}
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-8xl font-black text-white leading-[1.3] md:leading-[1.1] mb-10 tracking-tight">
            {isWorker ? (language === 'GE' ? 'მოძებნე საქმე,' : 'Find Work,') : t.hero.title} <br />
            <span className="bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">
              {isWorker ? (language === 'GE' ? 'მიიღე ანაზღაურება.' : 'Get Paid.') : t.hero.titleHighlight}
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-400 mb-14 leading-relaxed max-w-2xl mx-auto font-medium">
            {t.hero.subtitle}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            {isWorker ? (
              <>
                <button 
                  onClick={onFindWork}
                  className="w-full sm:w-auto px-12 py-6 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-[1.8rem] transition-all shadow-2xl shadow-orange-500/20 flex items-center justify-center gap-3 group text-base active:scale-95"
                >
                  <Briefcase size={22} /> {t.hero.btnFind} <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={onSwitchRole}
                  className="w-full sm:w-auto px-12 py-6 bg-white/5 hover:bg-white/10 text-white font-black rounded-[1.8rem] border border-white/10 transition-all backdrop-blur-xl flex items-center justify-center gap-3 text-base active:scale-95"
                >
                  <UserPlus size={22} /> {language === 'GE' ? 'მინდა დაქირავება' : 'I want to Hire'}
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={onPostJob}
                  className="w-full sm:w-auto px-12 py-6 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-[1.8rem] transition-all shadow-2xl shadow-blue-600/20 flex items-center justify-center gap-3 group text-base active:scale-95"
                >
                  <Zap size={22} /> {t.hero.btnPost} <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={onFindWork}
                  className="w-full sm:w-auto px-12 py-6 bg-white/5 hover:bg-white/10 text-white font-black rounded-[1.8rem] border border-white/10 transition-all backdrop-blur-xl flex items-center justify-center gap-3 text-base active:scale-95"
                >
                  <Users size={22} /> {t.nav.workers}
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section>
        <div className="flex justify-between items-end mb-16 px-4">
          <div>
            <h2 className="text-4xl font-black mb-3 text-slate-900 dark:text-white">{t.categories.title}</h2>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">{t.categories.subtitle}</p>
          </div>
          <button onClick={onFindWork} className="text-orange-500 font-black flex items-center gap-2 hover:translate-x-1 transition-transform uppercase text-xs tracking-[0.2em] min-h-[48px] px-4">
            {t.categories.viewAll} <ArrowRight size={18} />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {CATEGORIES.map((cat) => (
            <div key={cat.id} className="group p-8 bg-white dark:bg-[#0f172a] rounded-[2.5rem] border border-slate-100 dark:border-slate-800 hover:border-orange-500 hover:shadow-2xl transition-all duration-500 text-center cursor-pointer active:scale-95">
              <div className={`mx-auto w-16 h-16 ${cat.color} text-white rounded-[1.5rem] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-black/10`}>
                {cat.icon}
              </div>
              <h4 className="font-black text-sm text-slate-900 dark:text-white leading-tight mb-2">
                {language === 'GE' ? cat.name : cat.id.charAt(0).toUpperCase() + cat.id.slice(1)}
              </h4>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">200+ {t.categories.active}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="bg-slate-100 dark:bg-[#020617]/50 -mx-6 sm:-mx-12 px-6 sm:px-12 py-32 rounded-[5rem]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-6 px-4">
            <div className="text-center md:text-left">
              <h2 className="text-4xl font-black mb-3 text-slate-900 dark:text-white">{t.featured.title}</h2>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">{t.featured.subtitle}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {featuredJobs.map((job) => (
              <JobCard key={job.id} job={job} onClick={onSelectJob} language={language} />
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {[
          { icon: <Target className="text-orange-500" />, title: '50k+', label: t.stats.jobs },
          { icon: <Users className="text-blue-500" />, title: '120k+', label: t.stats.users },
          { icon: <ShieldCheck className="text-emerald-500" />, title: '100%', label: t.stats.safety },
          { icon: <TrendingUp className="text-amber-500" />, title: '₾2.4M', label: t.stats.paid },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-[#0f172a] p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 flex items-center gap-8 shadow-sm hover:shadow-xl transition-all duration-500">
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl shadow-inner">{stat.icon}</div>
            <div>
              <p className="text-3xl font-black text-slate-900 dark:text-white mb-1">{stat.title}</p>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] leading-tight">{stat.label}</p>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};

export default Home;
