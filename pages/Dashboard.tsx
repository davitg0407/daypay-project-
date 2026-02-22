
import React, { useState, useEffect } from 'react';
import { Briefcase, Wallet, Star, Clock, CheckCircle, Bell, ChevronRight, TrendingUp, MapPin, Settings, UserCheck, Layers, Users, Loader2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { User, Job, Language } from '../types';
import { translations } from '../translations';
import { supabase } from '../supabase';

const getData = (lang: Language) => [
  { name: lang === 'GE' ? 'ორშ' : 'Mon', value: 120 },
  { name: lang === 'GE' ? 'სამ' : 'Tue', value: 210 },
  { name: lang === 'GE' ? 'ოთხ' : 'Wed', value: 150 },
  { name: lang === 'GE' ? 'ხუთ' : 'Thu', value: 300 },
  { name: lang === 'GE' ? 'პარ' : 'Fri', value: 450 },
];

interface DashboardProps {
  user: User;
  recommendedJobIds: string[];
  language: Language;
}

const Dashboard: React.FC<DashboardProps> = ({ user, recommendedJobIds, language }) => {
  const [userJobs, setUserJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const isPoster = user.role === 'POSTER';
  const t = translations[language].dashboard;
  const data = getData(language);

  const fetchData = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    if (isPoster) {
      const { data: jobs } = await supabase.from('jobs').select('*').eq('poster_id', session.user.id);
      setUserJobs(jobs || []);
      
      const jobIds = (jobs || []).map(j => j.id);
      if (jobIds.length > 0) {
        const { data: apps } = await supabase.from('applications').select('*, profiles(name, avatar_url)').in('job_id', jobIds).eq('status', 'PENDING');
        setApplications(apps || []);
      }
    } else {
      const { data: apps } = await supabase.from('applications').select('*, jobs(*)').eq('worker_id', session.user.id);
      setApplications(apps || []);
      const jobs = (apps || []).map(a => a.jobs);
      setUserJobs(jobs || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [user.role]);

  const handleAcceptWorker = async (appId: string, jobId: string, workerId: string) => {
    await supabase.from('applications').update({ status: 'ACCEPTED' }).eq('id', appId);
    await supabase.from('jobs').update({ status: 'IN_PROGRESS', worker_id: workerId }).eq('id', jobId);
    fetchData();
  };

  const handleCompleteJob = async (jobId: string) => {
    await supabase.from('jobs').update({ status: 'COMPLETED' }).eq('id', jobId);
    fetchData();
  };

  const stats = isPoster ? [
    { label: t.spent, value: '₾840', icon: <Wallet className="text-red-500" />, trend: '-₾120' },
    { label: t.activePosts, value: userJobs.filter(j => j.status === 'OPEN').length.toString(), icon: <Layers className="text-blue-500" />, trend: 'Live' },
    { label: t.hires, value: '12', icon: <UserCheck className="text-emerald-500" />, trend: 'Top 10%' },
    { label: t.rating, value: '4.9', icon: <Star className="text-amber-500" />, trend: 'Excellent' },
  ] : [
    { label: t.earnings, value: `₾${user.earnings}`, icon: <Wallet className="text-emerald-500" />, trend: '+12%' },
    { label: t.completed, value: userJobs.filter(j => j.status === 'COMPLETED').length, icon: <CheckCircle className="text-blue-500" />, trend: '+4' },
    { label: t.rating, value: user.rating, icon: <Star className="text-amber-500" />, trend: 'Top 5%' },
    { label: t.hours, value: '42.5', icon: <Clock className="text-purple-500" />, trend: 'Stable' },
  ];

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start gap-6">
        <div>
          <h1 className="text-3xl font-black">{t.welcome}, {user.name.split(' ')[0]}!</h1>
          <p className="text-slate-500 mt-1">{isPoster ? t.readyPoster : t.ready}</p>
        </div>
        <div className="flex gap-2">
          <button className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"><Settings size={20} /></button>
          <button className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl relative"><Bell size={20} /><span className="absolute top-2 right-2 w-2 h-2 bg-red-600 rounded-full" /></button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-slate-50 dark:bg-slate-700 rounded-lg">{stat.icon}</div>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{stat.trend}</span>
            </div>
            <p className="text-2xl font-black mb-1">{stat.value}</p>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Main Chart */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
            <h3 className="font-bold text-lg mb-8 flex items-center gap-2">
              <TrendingUp size={20} className={isPoster ? "text-red-500" : "text-emerald-500"} /> {isPoster ? t.trendPoster : t.trend}
            </h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                  <Tooltip contentStyle={{ borderRadius: '12px' }} />
                  <Area type="monotone" dataKey="value" stroke={isPoster ? "#ef4444" : "#10b981"} fillOpacity={0.1} fill={isPoster ? "#ef4444" : "#10b981"} strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pending Applications (If Poster) */}
          {isPoster && applications.length > 0 && (
            <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border-2 border-amber-400/30">
              <h3 className="font-black text-xl mb-6 flex items-center gap-3">
                <Users className="text-amber-500" /> {language === 'GE' ? 'ახალი კანდიდატები' : 'New Candidates'}
              </h3>
              <div className="space-y-4">
                {applications.map((app) => (
                  <div key={app.id} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <img src={app.profiles.avatar_url || `https://picsum.photos/seed/${app.worker_id}/40/40`} className="w-10 h-10 rounded-full" />
                      <div>
                        <p className="font-bold">{app.profiles.name}</p>
                        <p className="text-xs text-slate-500">{language === 'GE' ? 'დაინტერესდა თქვენი ვაკანსიით' : 'Applied for your job'}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleAcceptWorker(app.id, app.job_id, app.worker_id)}
                      className="px-4 py-2 bg-red-600 text-white font-bold rounded-xl text-xs hover:bg-red-700 transition-colors"
                    >
                      {language === 'GE' ? 'აყვანა' : 'Hire'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
            <Briefcase size={20} className="text-blue-500" /> {t.activeTasks}
          </h3>
          <div className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-10"><Loader2 className="animate-spin text-slate-300" /></div>
            ) : userJobs.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-10">{language === 'GE' ? 'აქტიური დავალებები არ არის' : 'No active tasks'}</p>
            ) : (
              userJobs.map((job) => (
                <div key={job.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-600">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-sm line-clamp-1">{job.title}</h4>
                    <span className="text-sm font-black">₾{job.budget}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${job.status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                      {job.status}
                    </span>
                    {job.status === 'IN_PROGRESS' && (
                      <button 
                        onClick={() => handleCompleteJob(job.id)}
                        className="text-[10px] font-black text-emerald-600 hover:underline"
                      >
                        {language === 'GE' ? 'დასრულება' : 'Complete'}
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
