
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import Layout from './components/Layout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import JobCard from './components/JobCard';
import { User, UserRole, Job, Language, Message } from './types';
import { MOCK_JOBS, GEORGIAN_CITIES } from './constants';
import { getSmartRecommendations } from './services/geminiService';
import { Search, Loader2, X, Filter, CheckCircle, Zap, Briefcase, MapPin, ChevronRight, MessageSquare, Send, UserCircle, Phone, Globe, Navigation } from 'lucide-react';
import { translations } from './translations';
import { supabase } from './supabase';

// Real-time Chat Window Component
const ChatWindow: React.FC<{
  job: Job;
  currentUser: any;
  onClose: () => void;
  language: Language;
}> = ({ job, currentUser, onClose, language }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const t = translations[language].chat;

  useEffect(() => {
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('job_id', job.id)
        .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${job.posterId}),and(sender_id.eq.${job.posterId},receiver_id.eq.${currentUser.id})`)
        .order('created_at', { ascending: true });
      
      if (data) setMessages(data);
      setLoading(false);
    };

    fetchMessages();

    const channel = supabase
      .channel(`chat:${job.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `job_id=eq.${job.id}` }, (payload) => {
        const msg = payload.new as Message;
        if (msg.sender_id === currentUser.id || msg.receiver_id === currentUser.id) {
          setMessages(prev => [...prev, msg]);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [job.id, currentUser.id]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const { error } = await supabase.from('messages').insert({
      job_id: job.id,
      sender_id: currentUser.id,
      receiver_id: job.posterId,
      content: newMessage.trim()
    });

    if (error) alert(error.message);
    setNewMessage('');
  };

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white dark:bg-[#0f172a] rounded-[2rem] shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col z-[200] animate-in slide-in-from-bottom-4 duration-300">
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-orange-500 text-white rounded-t-[2rem]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center font-black">
            {job.title[0]}
          </div>
          <div>
            <p className="font-black text-xs uppercase tracking-widest">{job.title}</p>
            <p className="text-[10px] opacity-80">{t.activeTitle}</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg"><X size={20} /></button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4">
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="animate-spin text-orange-500" /></div>
        ) : messages.length === 0 ? (
          <p className="text-[10px] text-slate-400 text-center font-black uppercase tracking-widest py-10">{language === 'GE' ? 'შეტყობინებები არ არის' : 'No messages yet'}</p>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender_id === currentUser.id ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-4 rounded-[1.5rem] text-sm font-medium ${msg.sender_id === currentUser.id ? 'bg-orange-500 text-white rounded-tr-none' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none'}`}>
                {msg.content}
              </div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSendMessage} className="p-5 border-t border-slate-100 dark:border-slate-800 flex gap-2">
        <input 
          type="text" 
          placeholder={t.placeholder}
          className="flex-1 bg-slate-50 dark:bg-slate-900 px-4 py-3 rounded-xl border-none focus:ring-2 focus:ring-orange-500 text-sm font-bold"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button type="submit" className="p-3 bg-orange-500 text-white rounded-xl shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition-all"><Send size={18} /></button>
      </form>
    </div>
  );
};

// Map Component for picking or showing location
const MapView: React.FC<{ 
  interactive?: boolean; 
  coords: { lat: number; lng: number }; 
  onChange?: (coords: { lat: number; lng: number }) => void;
}> = ({ interactive = false, coords, onChange }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);
  const marker = useRef<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mapRef.current && !leafletMap.current) {
      // @ts-ignore
      const L = window.L;
      if (!L) return;

      leafletMap.current = L.map(mapRef.current, {
        scrollWheelZoom: interactive,
        dragging: interactive,
        touchZoom: interactive,
        doubleClickZoom: interactive,
        zoomControl: interactive
      }).setView([coords.lat, coords.lng], 13);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      }).addTo(leafletMap.current);

      marker.current = L.marker([coords.lat, coords.lng]).addTo(leafletMap.current);

      if (interactive) {
        leafletMap.current.on('click', (e: any) => {
          const { lat, lng } = e.latlng;
          marker.current.setLatLng([lat, lng]);
          if (onChange) onChange({ lat, lng });
        });
      }
    }

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, []);

  // Update marker position when coords change externally
  useEffect(() => {
    if (leafletMap.current && marker.current) {
      marker.current.setLatLng([coords.lat, coords.lng]);
      leafletMap.current.setView([coords.lat, coords.lng], 13);
    }
  }, [coords.lat, coords.lng]);

  // Handle outside clicks for suggestions dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }
    try {
      // Photon API for fast autocomplete
      const response = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5`);
      const data = await response.json();
      if (data && data.features) {
        setSuggestions(data.features);
      }
    } catch (err) {
      console.error("Photon suggestion error:", err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    setShowSuggestions(true);
    fetchSuggestions(val);
  };

  const handleSelectSuggestion = (feature: any) => {
    const [lng, lat] = feature.geometry.coordinates;
    const name = [
      feature.properties.name,
      feature.properties.city,
      feature.properties.street
    ].filter(Boolean).join(', ');
    
    setSearchQuery(name);
    setShowSuggestions(false);
    
    if (onChange) onChange({ lat, lng });
    if (leafletMap.current && marker.current) {
      marker.current.setLatLng([lat, lng]);
      leafletMap.current.setView([lat, lng], 15);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=ge`);
      const data = await response.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const newLat = parseFloat(lat);
        const newLng = parseFloat(lon);
        if (onChange) onChange({ lat: newLat, lng: newLng });
        setShowSuggestions(false);
      } else {
        alert("მისამართი ვერ მოიძებნა");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
      <div ref={mapRef} className="w-full h-full min-h-[250px]" />
      {interactive && (
        <div className="absolute top-4 left-4 right-4 z-[1000] space-y-2" ref={suggestionRef}>
          <form 
            onSubmit={handleSearch}
            className="flex gap-2"
          >
            <div className="relative flex-1">
              <input 
                type="text" 
                placeholder="მოძებნე მისამართი..." 
                value={searchQuery}
                onChange={handleInputChange}
                onFocus={() => searchQuery.length >= 3 && setShowSuggestions(true)}
                className="w-full px-4 py-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-orange-500 shadow-xl font-bold text-sm"
              />
              {isSearching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-orange-500" size={18} />}
            </div>
            <button 
              type="submit"
              className="p-3 bg-orange-500 text-white rounded-xl shadow-lg hover:bg-orange-600 transition-colors"
            >
              <Search size={20} />
            </button>
          </form>

          {showSuggestions && suggestions.length > 0 && (
            <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              {suggestions.map((feat, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectSuggestion(feat)}
                  className="w-full text-left px-4 py-3 hover:bg-orange-50 dark:hover:bg-orange-900/20 flex items-center gap-3 transition-colors border-b last:border-b-0 border-slate-100 dark:border-slate-800"
                >
                  <MapPin size={16} className="text-orange-500 shrink-0" />
                  <div className="truncate">
                    <p className="text-xs font-black text-slate-900 dark:text-white">
                      {feat.properties.name || feat.properties.street || 'მისამართი'}
                    </p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                      {[feat.properties.city, feat.properties.country].filter(Boolean).join(', ')}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [hasSelectedRole, setHasSelectedRole] = useState(false);
  const [activePage, setActivePage] = useState('home');
  const [userRole, setUserRole] = useState<UserRole>('WORKER');
  
  // Onboarding states
  const [onboardingStep, setOnboardingStep] = useState(0); 
  const [userName, setUserName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('თბილისი');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [language, setLanguage] = useState<Language>('GE');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [recommendedJobIds, setRecommendedJobIds] = useState<string[]>([]);
  const [isApplying, setIsApplying] = useState(false);
  const [applicationSuccess, setApplicationSuccess] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [isSignUpMode, setIsSignUpMode] = useState(true);
  const [authSuccessMessage, setAuthSuccessMessage] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

  // Chat related states
  const [activeChatJob, setActiveChatJob] = useState<Job | null>(null);
  const [recentChats, setRecentChats] = useState<any[]>([]);
  const [isLoadingChats, setIsLoadingChats] = useState(false);
  
  const [jobForm, setJobForm] = useState({
    title: '',
    budget: '',
    location: '',
    city: 'თბილისი',
    description: '',
    coordinates: { lat: 41.7151, lng: 44.8271 } 
  });
  
  const t = translations[language];

  const currentUser: User = {
    id: session?.user?.id || 'guest-id',
    name: userName || (language === 'GE' ? 'სტუმარი' : 'Guest'),
    role: userRole,
    avatar: `https://picsum.photos/seed/${session?.user?.id || 'guest'}/100/100`,
    location: city,
    rating: 5.0,
    earnings: 450,
    completedTasks: 12,
    verified: true,
    skills: ['moving', 'delivery', 'cleaning']
  };

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session: existingSession } } = await supabase.auth.getSession();
      if (existingSession) {
        setSession(existingSession);
        setHasSelectedRole(true);
        setActivePage('home');
        fetchProfile(existingSession.user.id);
      }
    };
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      setSession(currentSession);
      if (currentSession) {
        setHasSelectedRole(true);
        if (activePage === 'login') setActivePage('home');
        fetchProfile(currentSession.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (data) {
        setUserName(data.name);
        setUserRole(data.role as UserRole);
        setPhone(data.phone || '');
        setCity(data.city || 'თბილისი');
      }
    } catch (e) {
      console.warn("Profile fetch error.");
    }
  };

  const fetchJobs = async () => {
    setIsLoadingJobs(true);
    try {
      let query = supabase.from('jobs').select('*').order('created_at', { ascending: false });
      
      if (selectedCity) {
        query = query.eq('city', selectedCity);
      }

      const { data, error } = await query;
      if (error) throw error;

      if (data && data.length > 0) {
        const mappedJobs: Job[] = data.map((j: any) => ({
          ...j,
          posterId: j.poster_id,
          startTime: j.start_time || '00:00',
          endTime: j.end_time || '00:00',
          isUrgent: j.is_urgent || false,
          isFeatured: j.is_featured || false,
          coordinates: { 
            lat: j.latitude !== undefined && j.latitude !== null ? j.latitude : (j.coordinates?.lat || 41.7151), 
            lng: j.longitude !== undefined && j.longitude !== null ? j.longitude : (j.coordinates?.lng || 44.8271)
          }
        }));
        setJobs(mappedJobs);
      } else {
        setJobs(MOCK_JOBS);
      }
    } catch (e) {
      console.error("Fetch Jobs Error:", e);
      setJobs(MOCK_JOBS);
    }
    setIsLoadingJobs(false);
  };

  const fetchRecentChats = async () => {
    if (!session) return;
    setIsLoadingChats(true);
    try {
      const { data } = await supabase
        .from('messages')
        .select('*, jobs(title), sender:profiles!messages_sender_id_fkey(name, avatar_url), receiver:profiles!messages_receiver_id_fkey(name, avatar_url)')
        .or(`sender_id.eq.${session.user.id},receiver_id.eq.${session.user.id}`)
        .order('created_at', { ascending: false });

      if (data) {
        // Group by job and participant to show unique conversations
        const uniqueConversations: any[] = [];
        const seen = new Set();
        data.forEach(msg => {
          const otherId = msg.sender_id === session.user.id ? msg.receiver_id : msg.sender_id;
          const key = `${msg.job_id}:${otherId}`;
          if (!seen.has(key)) {
            seen.add(key);
            uniqueConversations.push(msg);
          }
        });
        setRecentChats(uniqueConversations);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingChats(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [selectedCity]);

  useEffect(() => {
    if (activePage === 'messages') fetchRecentChats();
  }, [activePage, session]);

  const handleAuth = async () => {
    if (!email || !password) return;
    setIsAuthenticating(true);

    try {
      if (isSignUpMode) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) {
          alert(`შეცდომა: ${error.message}`);
          setIsAuthenticating(false);
          return;
        }
        if (data.user) {
          try {
            await supabase.from('profiles').upsert({
              id: data.user.id,
              name: userName,
              phone: phone,
              city: city,
              role: userRole
            });
          } catch (pe) {}
          if (data.session) {
            setAuthSuccessMessage('წარმატებით დარეგისტრირდით!');
            setTimeout(() => {
              setSession(data.session);
              setHasSelectedRole(true);
              setActivePage('home');
            }, 1000);
          } else {
            alert(language === 'GE' ? 'შეამოწმეთ მეილი და დაადასტურეთ რეგისტრაცია!' : 'Please confirm your email!');
            setIsSignUpMode(false);
            setOnboardingStep(2);
          }
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          alert(`შეცდომა: ${error.message}`);
          setIsAuthenticating(false);
          return;
        }
        if (data.session) {
          setAuthSuccessMessage('მოგესალმებით!');
          setTimeout(() => {
            setSession(data.session);
            setHasSelectedRole(true);
            setActivePage('home');
          }, 1000);
        }
      }
    } catch (e: any) {
      alert(`სისტემური შეცდომა: ${e.message}`);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (e: any) {
      alert(`Google Login Error: ${e.message}`);
    }
  };

  const handlePostJob = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id || session?.user?.id;

    if (!userId) {
      alert(language === 'GE' ? 'გთხოვთ გაიაროთ ავტორიზაცია' : 'Please log in to post');
      setActivePage('login');
      return;
    }
    
    const budgetVal = parseFloat(jobForm.budget);
    if (!jobForm.title || !jobForm.location || isNaN(budgetVal)) {
      alert(language === 'GE' ? 'გთხოვთ შეავსოთ ყველა აუცილებელი ველი' : 'Please fill all required fields');
      return;
    }

    setIsPosting(true);
    try {
      const { error } = await supabase.from('jobs').insert({ 
        title: jobForm.title, 
        description: jobForm.description, 
        budget: budgetVal, 
        category: 'moving', 
        location: jobForm.location, 
        city: jobForm.city,
        poster_id: userId, 
        status: 'OPEN', 
        date: new Date().toISOString().split('T')[0], 
        start_time: '10:00:00', 
        end_time: '18:00:00',
        latitude: jobForm.coordinates.lat,
        longitude: jobForm.coordinates.lng
      });
      
      if (error) {
        alert('Database Error (Insert): ' + error.message);
      } else {
        alert(language === 'GE' ? 'ვაკანსია წარმატებით დაემატა!' : 'Job posted successfully!');
        setJobForm({
          title: '',
          budget: '',
          location: '',
          city: 'თბილისი',
          description: '',
          coordinates: { lat: 41.7151, lng: 44.8271 }
        });
        setActivePage('home'); 
        fetchJobs(); 
      }
    } catch (e: any) {
      alert('System Error (Insert): ' + e.message);
    } finally {
      setIsPosting(false);
    }
  };

  const handleDeleteJob = async (job: Job) => {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id || session?.user?.id;

    if (!userId) {
      alert(language === 'GE' ? 'გთხოვთ გაიაროთ ავტორიზაცია' : 'Please log in to delete');
      return;
    }

    if (!confirm(language === 'GE' ? 'ნამდვილად გსურთ განცხადების წაშლა?' : 'Are you sure you want to delete this job?')) return;
    
    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', job.id)
        .eq('poster_id', userId);
        
      if (error) {
        alert('Database Error (Delete): ' + error.message);
        return;
      }
      
      alert(language === 'GE' ? 'წარმატებით წაიშალა' : 'Success');
      setSelectedJob(null);
      fetchJobs();
    } catch (e: any) {
      console.error("Delete job error:", e);
      alert('System Error (Delete): ' + e.message);
    }
  };

  const renderOnboarding = () => {
    const isLoginPage = activePage === 'login';

    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 transition-all duration-700">
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-600 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-900/50 blur-[120px] rounded-full"></div>
        </div>
        
        <div className="max-w-md w-full bg-[#0f172a]/80 backdrop-blur-2xl rounded-[3rem] p-10 shadow-2xl border border-slate-800 animate-in fade-in zoom-in-95 duration-500 relative z-10">
          <div className="flex justify-center mb-8">
            <img 
              src="https://i.ibb.co/7J8Yn0kW/image.png" 
              alt="DAYPAY" 
              className="h-20 w-auto object-contain"
              onError={(e) => {
                (e.target as any).style.display = 'none';
                const parent = (e.target as any).parentElement;
                const placeholder = document.createElement('div');
                placeholder.className = "w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center shadow-xl shadow-orange-500/20";
                placeholder.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-zap text-white"><path d="M4 14.71 13.14 2.63a.58.58 0 0 1 .86.64L11.71 10h6.29a.58.58 0 0 1 .43 1l-9.14 11.08a.58.58 0 0 1-.86-.64L11 14H4.71a.58.58 0 0 1-.43-1Z"/></svg>';
                parent.appendChild(placeholder);
              }}
            />
          </div>
          
          {onboardingStep === 0 && !isLoginPage && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-black mb-2 text-center text-white">{t.onboarding.title}</h2>
              <p className="text-slate-400 text-center mb-8 text-xs font-medium leading-relaxed">{t.onboarding.subtitle}</p>
              
              <button onClick={() => { setUserRole('WORKER'); setHasSelectedRole(true); setActivePage('home'); }} className="w-full p-6 rounded-3xl border border-slate-800 bg-slate-900/50 text-left hover:border-red-600 transition-all group flex items-center gap-4">
                <div className="p-4 bg-slate-800 rounded-2xl group-hover:bg-red-600 text-slate-500 group-hover:text-white transition-colors"><Zap size={24} /></div>
                <div>
                  <h3 className="font-bold text-white text-base">{t.onboarding.workerTitle}</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">{t.onboarding.workerDesc}</p>
                </div>
              </button>
              
              <button onClick={() => { setUserRole('POSTER'); setHasSelectedRole(true); setActivePage('home'); }} className="w-full p-6 rounded-3xl border border-slate-800 bg-slate-900/50 text-left hover:border-blue-500 transition-all group flex items-center gap-4">
                <div className="p-4 bg-slate-800 rounded-2xl group-hover:bg-blue-600 text-slate-500 group-hover:text-white transition-colors"><Briefcase size={24} /></div>
                <div>
                  <h3 className="font-bold text-white text-base">{t.onboarding.posterTitle}</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">{t.onboarding.posterDesc}</p>
                </div>
              </button>
              
              <button onClick={() => { setIsSignUpMode(false); setActivePage('login'); setOnboardingStep(2); }} className="w-full py-4 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] hover:text-white transition-colors">
                უკვე გაქვს ექაუნთი? შესვლა
              </button>
            </div>
          )}

          {onboardingStep === 1 && !isLoginPage && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-black text-white">პერსონალური მონაცემები</h2>
                <p className="text-slate-400 text-xs mt-2 font-medium">გთხოვთ შეავსოთ ინფორმაცია გასაგრძელებლად</p>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input type="text" placeholder="სახელი და გვარი" className="w-full p-4 pl-12 bg-slate-900 text-white rounded-2xl border border-slate-800 focus:border-red-600 focus:outline-none transition-all placeholder:text-slate-600 text-sm font-bold" value={userName} onChange={(e) => setUserName(e.target.value)} />
                </div>
                
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input type="tel" placeholder="ტელეფონის ნომერი" className="w-full p-4 pl-12 bg-slate-900 text-white rounded-2xl border border-slate-800 focus:border-red-600 focus:outline-none transition-all placeholder:text-slate-600 text-sm font-bold" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>

                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <select className="w-full p-4 pl-12 bg-slate-900 text-white rounded-2xl border border-slate-800 focus:border-red-600 focus:outline-none transition-all text-sm font-bold appearance-none cursor-pointer" value={city} onChange={(e) => setCity(e.target.value)}>
                    {GEORGIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <button onClick={() => setOnboardingStep(2)} disabled={!userName || !phone} className="w-full py-5 bg-orange-500 hover:bg-orange-400 text-white font-black rounded-2xl transition-all shadow-lg shadow-orange-500/20 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50">
                  გაგრძელება <ChevronRight size={18} />
                </button>
                
                <button onClick={() => setOnboardingStep(0)} className="w-full text-slate-600 text-[10px] font-black uppercase tracking-widest hover:text-slate-400">
                  უკან დაბრუნება
                </button>
              </div>
            </div>
          )}

          {(onboardingStep === 2 || isLoginPage) && (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-black text-white">{isSignUpMode ? 'რეგისტრაცია' : 'შესვლა'}</h2>
                <p className="text-slate-400 text-xs mt-2 font-medium">
                  {isSignUpMode ? 'დაასრულეთ რეგისტრაცია ელ-ფოსტით' : 'მოგესალმებით, სასიამოვნოა თქვენი ნახვა'}
                </p>
              </div>

              {authSuccessMessage ? (
                <div className="py-8 text-center animate-in zoom-in-95">
                  <CheckCircle className="text-emerald-500 mx-auto mb-4" size={56} />
                  <p className="text-xl font-black text-emerald-500">{authSuccessMessage}</p>
                </div>
              ) : (
                <>
                  <input type="email" placeholder="ელ-ფოსტა" className="w-full p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 focus:border-orange-500 focus:outline-none transition-all placeholder:text-slate-600 text-sm font-bold" value={email} onChange={(e) => setEmail(e.target.value)} />
                  <input type="password" placeholder="პაროლი" className="w-full p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 focus:border-orange-500 focus:outline-none transition-all placeholder:text-slate-600 text-sm font-bold" value={password} onChange={(e) => setPassword(e.target.value)} />
                  
                  <button onClick={handleAuth} disabled={isAuthenticating} className="w-full py-5 bg-orange-500 hover:bg-orange-400 text-white font-black rounded-2xl transition-all shadow-lg shadow-orange-500/20 active:scale-95 flex items-center justify-center gap-2">
                    {isAuthenticating ? <Loader2 className="animate-spin" size={20} /> : (isSignUpMode ? 'დასრულება' : 'შესვლა')}
                  </button>

                  <button 
                    onClick={handleGoogleLogin} 
                    className="w-full py-5 bg-white text-slate-900 font-black rounded-2xl border border-slate-200 hover:bg-slate-50 transition-all shadow-sm active:scale-95 flex items-center justify-center gap-3"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Google-ით შესვლა
                  </button>

                  <div className="flex flex-col gap-3 mt-4 text-center">
                    <button onClick={() => { setIsSignUpMode(!isSignUpMode); if (isSignUpMode) setOnboardingStep(0); }} className="text-slate-400 text-xs font-bold hover:text-white transition-colors underline underline-offset-4">
                      {isSignUpMode ? 'გაქვს ექაუნთი? შესვლა' : 'არ გაქვს ექაუნთი? რეგისტრაცია'}
                    </button>
                    <button onClick={() => { setHasSelectedRole(true); setActivePage('home'); }} className="text-slate-600 text-[10px] font-black uppercase tracking-[0.2em] hover:text-slate-400 flex items-center justify-center gap-2 pt-2">
                      <UserCircle size={14} /> სტუმრად გაგრძელება
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch(activePage) {
      case 'login': return renderOnboarding();
      case 'home': return <Home jobs={jobs} onFindWork={() => setActivePage('jobs')} onPostJob={() => session ? setActivePage('admin') : setActivePage('login')} onSelectJob={setSelectedJob} language={language} userRole={userRole} onSwitchRole={() => setUserRole(userRole === 'WORKER' ? 'POSTER' : 'WORKER')} />;
      case 'dashboard': return session ? <Dashboard user={currentUser} recommendedJobIds={recommendedJobIds} language={language} /> : renderOnboarding();
      case 'messages': return session ? (
        <div className="space-y-8 animate-in fade-in duration-500">
           <h2 className="text-3xl font-black">{language === 'GE' ? 'თქვენი მესიჯები' : 'Your Messages'}</h2>
           {isLoadingChats ? <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-orange-500" size={40} /></div> : recentChats.length === 0 ? (
             <div className="text-center py-20 bg-white dark:bg-[#0f172a] rounded-[3rem] border border-slate-100 dark:border-slate-800">
                <MessageSquare className="mx-auto text-slate-300 mb-4" size={50} />
                <p className="text-slate-500 font-bold">{language === 'GE' ? 'მესიჯები ჯერ არ გაქვთ' : 'No messages yet'}</p>
             </div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {recentChats.map((chat) => {
                 const otherUser = chat.sender_id === session.user.id ? chat.receiver : chat.sender;
                 const job = { id: chat.job_id, title: chat.jobs.title, posterId: chat.sender_id === session.user.id ? chat.receiver_id : chat.sender_id };
                 return (
                   <div key={chat.id} onClick={() => setActiveChatJob(job as any)} className="bg-white dark:bg-[#0f172a] p-6 rounded-3xl border border-slate-100 dark:border-slate-800 hover:border-orange-500 transition-all cursor-pointer shadow-sm">
                      <div className="flex items-center gap-4 mb-4">
                        <img src={otherUser.avatar_url || `https://picsum.photos/seed/${otherUser.name}/40/40`} className="w-12 h-12 rounded-2xl object-cover" />
                        <div>
                          <p className="font-black text-sm">{otherUser.name}</p>
                          <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{job.title}</p>
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 truncate italic">"{chat.content}"</p>
                   </div>
                 );
               })}
             </div>
           )}
        </div>
      ) : renderOnboarding();
      case 'jobs': return (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input type="text" placeholder={t.filters.search} className="w-full pl-16 pr-6 py-5 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 focus:outline-none font-bold" />
            </div>
            <div className="relative">
              <Filter className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <select 
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="pl-16 pr-10 py-5 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 focus:outline-none font-bold appearance-none cursor-pointer min-h-[48px]"
              >
                <option value="">{language === 'GE' ? 'ყველა ქალაქი' : 'All Cities'}</option>
                {GEORGIAN_CITIES.slice(0, 4).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          {isLoadingJobs ? <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-orange-500" size={40} /></div> : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {jobs.map(job => <JobCard key={job.id} job={job} onClick={setSelectedJob} language={language} isRecommended={recommendedJobIds.includes(job.id)} />)}
            </div>
          )}
        </div>
      );
      case 'admin': return session ? (
        <div className="max-w-2xl mx-auto bg-white dark:bg-[#0f172a] p-12 rounded-[3.5rem] shadow-2xl border border-slate-200 dark:border-slate-800">
          <h2 className="text-3xl font-black mb-10 text-slate-900 dark:text-white">დავალების განთავსება</h2>
          <div className="space-y-6">
            <input type="text" placeholder="დავალების სათაური" className="w-full p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 focus:border-orange-500 outline-none transition-all font-bold" value={jobForm.title} onChange={e => setJobForm(prev => ({...prev, title: e.target.value}))} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <input type="number" placeholder="ბიუჯეტი ₾" className="w-full p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 focus:border-orange-500 outline-none transition-all font-bold min-h-[48px]" value={jobForm.budget} onChange={e => setJobForm(prev => ({...prev, budget: e.target.value}))} />
              <select 
                className="w-full p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 focus:border-orange-500 outline-none transition-all font-bold appearance-none cursor-pointer min-h-[48px]" 
                value={jobForm.city} 
                onChange={e => setJobForm(prev => ({...prev, city: e.target.value}))}
              >
                {GEORGIAN_CITIES.slice(0, 4).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <input type="text" placeholder="მისამართი" className="w-full p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 focus:border-orange-500 outline-none transition-all font-bold min-h-[48px]" value={jobForm.location} onChange={e => setJobForm(prev => ({...prev, location: e.target.value}))} />
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">მონიშნე მდებარეობა რუკაზე</label>
              <div className="h-64 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
                <MapView 
                  interactive 
                  coords={jobForm.coordinates} 
                  onChange={(coords) => setJobForm(prev => ({...prev, coordinates: coords}))} 
                />
              </div>
            </div>

            <textarea placeholder="დეტალური აღწერა..." rows={5} className="w-full p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 focus:border-orange-500 outline-none transition-all font-bold" value={jobForm.description} onChange={e => setJobForm(prev => ({...prev, description: e.target.value}))} />
            
            <button 
              onClick={handlePostJob} 
              disabled={isPosting}
              className="w-full py-5 bg-orange-500 text-white font-black rounded-2xl shadow-xl shadow-orange-500/20 hover:bg-orange-600 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isPosting ? <Loader2 className="animate-spin" size={20} /> : 'დავალების განთავსება'}
            </button>
          </div>
        </div>
      ) : renderOnboarding();
      default: return null;
    }
  };

  if (!hasSelectedRole && !session) return renderOnboarding();

  return (
    <Layout activePage={activePage} setActivePage={setActivePage} userRole={userRole} toggleRole={() => setUserRole(userRole === 'WORKER' ? 'POSTER' : 'WORKER')} language={language} onLanguageChange={setLanguage} userName={userName} session={session}>
      {renderContent()}
      
      {activeChatJob && session && (
        <ChatWindow job={activeChatJob} currentUser={session.user} onClose={() => setActiveChatJob(null)} language={language} />
      )}

      {selectedJob && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-white dark:bg-[#0f172a] w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-[3rem] shadow-2xl relative border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-300">
            <button onClick={() => setSelectedJob(null)} className="fixed top-8 right-8 md:absolute md:top-6 md:right-6 p-2 bg-slate-100 dark:bg-slate-800 rounded-full z-[1001] hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors shadow-lg"><X size={24} /></button>
            <img src={`https://picsum.photos/seed/${selectedJob.id}/800/400`} className="w-full h-48 object-cover" />
            <div className="p-10 space-y-6">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white">{selectedJob.title}</h2>
              <div className="flex gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl flex-1 text-center border border-slate-100 dark:border-slate-800"><p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">ბიუჯეტი</p><p className="text-2xl font-black text-orange-500">₾{selectedJob.budget}</p></div>
                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl flex-1 text-center border border-slate-100 dark:border-slate-800"><p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">თარიღი</p><p className="text-lg font-black">{selectedJob.date}</p></div>
              </div>
              
              <div className="space-y-4">
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{selectedJob.description}</p>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <MapPin size={14} className="text-orange-500" /> {selectedJob.location}
                  </div>
                  <div className="h-48 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
                    <MapView coords={selectedJob.coordinates || { lat: 41.7151, lng: 44.8271 }} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => {
                        if (!session) return setActivePage('login');
                        const lat = selectedJob.coordinates?.lat || 41.7151;
                        const lng = selectedJob.coordinates?.lng || 44.8271;
                        window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank');
                      }}
                      className="w-full py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-black rounded-xl text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all min-h-[48px]"
                    >
                      <Navigation size={14} /> {t.modal.openInMaps}
                    </button>
                    <button 
                      onClick={() => {
                        if (!session) return setActivePage('login');
                        setActiveChatJob(selectedJob);
                        setSelectedJob(null);
                      }}
                      className="w-full py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-black rounded-xl text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all min-h-[48px]"
                    >
                      <MessageSquare size={14} /> {t.modal.chat}
                    </button>
                  </div>
                </div>
              </div>

              <button onClick={async () => {
                if (!session) return setActivePage('login');
                setIsApplying(true);
                const { error } = await supabase.from('applications').insert({ job_id: selectedJob.id, worker_id: session.user.id, status: 'PENDING' });
                setIsApplying(false);
                if (error) {
                   alert(error.message);
                } else { 
                   setApplicationSuccess(true); 
                   // Open chat on successful application as requested
                   setActiveChatJob(selectedJob);
                   setTimeout(() => { 
                     setApplicationSuccess(false); 
                     setSelectedJob(null); 
                   }, 1500); 
                }
              }} className="w-full py-5 bg-orange-500 text-white font-black rounded-2xl shadow-xl shadow-orange-500/20 hover:bg-orange-600 transition-all flex items-center justify-center gap-2 active:scale-95 min-h-[48px]">
                {isApplying ? <Loader2 className="animate-spin" /> : applicationSuccess ? <CheckCircle /> : 'მიმართვა დავალებაზე'}
              </button>

              {session?.user?.id === selectedJob.posterId && (
                <button 
                  onClick={() => handleDeleteJob(selectedJob)}
                  className="w-full py-5 bg-red-600 text-white font-black rounded-2xl shadow-xl shadow-red-600/20 hover:bg-red-700 transition-all flex items-center justify-center gap-2 active:scale-95 min-h-[48px]"
                >
                  განცხადების წაშლა
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;
