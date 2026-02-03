import React, { useState } from 'react';
import { 
  ChevronDown, ArrowRight, ArrowLeft, Sparkles, 
  Heart, Settings, Users, Gift, X, Check, Plus, Trash2, User, Lock, Mail
} from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';

const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    // Hardcoded credentials
    if (email === 'admin' && password === 'password123') {
      onLogin();
    } else {
      setError('Invalid credentials. (Try admin / password123)');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="flex-1 flex flex-col justify-center"
    >
      <div className="text-center mb-10">
        <div className="w-20 h-20 bg-purple-600 rounded-[2rem] flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-purple-200">
          <Gift size={40} />
        </div>
        <h1 className="text-3xl font-black text-slate-900 leading-tight">Welcome Back</h1>
        <p className="text-gray-400 font-medium">Log in to find the perfect gift</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-5">
        <Field label="Username">
          <div className="relative">
            <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="admin"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-50 border-none rounded-2xl pl-12 pr-5 py-4 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
            />
          </div>
        </Field>

        <Field label="Password">
          <div className="relative">
            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-50 border-none rounded-2xl pl-12 pr-5 py-4 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
            />
          </div>
        </Field>

        {error && <p className="text-red-500 text-xs font-bold ml-1">{error}</p>}

        <button 
          type="submit"
          className="w-full bg-[#7C3AED] text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-purple-200 active:scale-95 transition-all mt-4"
        >
          Sign In <ArrowRight size={20}/>
        </button>
      </form>
      
      <p className="text-center text-gray-400 text-sm mt-8">
        Don't have an account? <span className="text-purple-600 font-bold cursor-pointer">Sign Up</span>
      </p>
    </motion.div>
  );
};

const GiftFinder = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // Navigation & View State
  const [activeTab, setActiveTab] = useState('find'); 
  const [view, setView] = useState('form'); 
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Data Persistence
  const [results, setResults] = useState([]);
  const [profiles, setProfiles] = useState([]); 
  const [savedGifts, setSavedGifts] = useState({}); 
  
  const [formData, setFormData] = useState({
    name: '', relation: '', age: '', gender: '', hobbies: '', 
    personality: '', minBudget: '', maxBudget: '', occasion: ''
  });

  const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const handleSwipe = (gift, direction) => {
    if (direction === 'right') {
      const personName = formData.name || "Mystery Person";
      if (!profiles.find(p => p.name === personName)) {
        setProfiles(prev => [...prev, { ...formData }]);
      }
      setSavedGifts(prev => ({
        ...prev,
        [personName]: [...(prev[personName] || []), gift]
      }));
    }
    setResults(prev => prev.filter(item => item.id !== gift.id));
  };

  const handleSubmit = async () => {
    setLoading(true);
    const pastGifts = savedGifts[formData.name]?.map(g => g.title) || [];
    try {
      const response = await fetch('http://localhost:5000/generate-gifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, alreadyRecommended: pastGifts }),
      });
      const data = await response.json();
      setResults(data.result || []); 
      setView('swipe');
    } catch (error) {
      console.error("Backend unreachable", error);
      setResults([
        { id: 101, title: "Custom Portrait", description: "Hand-painted based on a photo.", category: "Arts" },
        { id: 102, title: "Tech Organizer", description: "Leather roll for cables.", category: "Technology" }
      ]);
      setView('swipe');
    } finally { setLoading(false); }
  };

  const loadProfile = (profile) => {
    setFormData(profile);
    setStep(1);
    setView('form');
    setActiveTab('find');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans pb-24 text-slate-900">
      <div className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col min-h-[620px] relative">
        <div className="p-8 flex-1 flex flex-col overflow-y-auto">
          
          <AnimatePresence mode="wait">
            {!isLoggedIn ? (
              <LoginPage onLogin={() => setIsLoggedIn(true)} />
            ) : (
              <>
                {/* FIND TAB */}
                {activeTab === 'find' && (
                  <motion.div key="find" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col">
                    {view === 'form' ? (
                      <div className="flex-1 flex flex-col">
                        <div className="flex gap-2 h-1.5 mb-10">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className={`flex-1 rounded-full transition-all duration-500 ${step >= i ? 'bg-[#7C3AED]' : 'bg-purple-100'}`} />
                          ))}
                        </div>

                        {step === 1 && (
                          <StepWrapper title="Who is it for?" sub="Pick a name to save to your Circle.">
                            <Field label="Name"><Input placeholder="e.g. Dad" value={formData.name} onChange={(v) => handleChange('name', v)} /></Field>
                            <Field label="Relation"><Select placeholder="Select" value={formData.relation} onChange={(v) => handleChange('relation', v)} options={['Partner', 'Friend', 'Parent', 'Sibling']} /></Field>
                            <NextButton onClick={() => setStep(2)} />
                          </StepWrapper>
                        )}

                        {step === 2 && (
                          <StepWrapper title="Personalize" sub="What do they enjoy?">
                            <Field label="Hobbies"><Input placeholder="Cooking, Gaming" value={formData.hobbies} onChange={(v) => handleChange('hobbies', v)} /></Field>
                            <Field label="Age"><Input type="number" placeholder="25" value={formData.age} onChange={(v) => handleChange('age', v)} /></Field>
                            <div className="flex gap-4"><BackButton onClick={() => setStep(1)} /><NextButton onClick={() => setStep(3)} /></div>
                          </StepWrapper>
                        )}

                        {step === 3 && (
                          <StepWrapper title="Logistics" sub="Set your boundaries.">
                            <div className="flex gap-4">
                              <Field label="Min $"><Input type="number" value={formData.minBudget} onChange={(v) => handleChange('minBudget', v)} /></Field>
                              <Field label="Max $"><Input type="number" value={formData.maxBudget} onChange={(v) => handleChange('maxBudget', v)} /></Field>
                            </div>
                            <Field label="Occasion"><Input placeholder="Christmas" value={formData.occasion} onChange={(v) => handleChange('occasion', v)} /></Field>
                            <div className="flex gap-4">
                              <BackButton onClick={() => setStep(2)} />
                              <button onClick={handleSubmit} className="flex-[1.5] bg-[#7C3AED] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all">
                                {loading ? "Thinking..." : <><Sparkles size={18} /> Get Ideas</>}
                              </button>
                            </div>
                          </StepWrapper>
                        )}
                      </div>
                    ) : (
                      <div className="relative w-full h-[450px]">
                        <AnimatePresence>
                          {results.map((gift, idx) => (
                            <TinderCard key={gift.id || idx} gift={gift} onSwipe={(dir) => handleSwipe(gift, dir)} />
                          ))}
                        </AnimatePresence>
                        {results.length === 0 && (
                          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="h-full flex flex-col items-center justify-center text-center">
                            <div className="bg-purple-50 p-6 rounded-full mb-4 text-purple-500"><Gift size={40}/></div>
                            <p className="font-bold text-slate-800 text-lg">More ideas?</p>
                            <p className="text-gray-400 text-sm px-10">Generate another set or change the criteria.</p>
                            <button onClick={() => setView('form')} className="mt-6 bg-slate-900 text-white px-8 py-3 rounded-full font-bold shadow-lg">New Search</button>
                          </motion.div>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* CIRCLE TAB */}
                {activeTab === 'people' && (
                  <motion.div key="people" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1">
                    <h2 className="text-2xl font-black mb-6 flex items-center gap-2"><Users className="text-purple-600"/> Circle</h2>
                    <div className="space-y-3">
                      {profiles.map((p, i) => (
                        <button key={i} onClick={() => loadProfile(p)} className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-purple-200 transition-all group">
                          <div className="flex items-center gap-4 text-left">
                            <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">{p.name[0]}</div>
                            <div>
                              <p className="font-bold text-slate-800">{p.name}</p>
                              <p className="text-xs text-gray-500">{p.relation} • {p.hobbies}</p>
                            </div>
                          </div>
                          <ArrowRight size={18} className="text-gray-300 group-hover:text-purple-500" />
                        </button>
                      ))}
                      <button onClick={() => { setFormData({name:'', relation:'', hobbies:''}); setView('form'); setStep(1); setActiveTab('find'); }} className="w-full p-4 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center gap-2 text-gray-400 font-bold hover:bg-gray-50 transition-all">
                        <Plus size={18} /> New Person
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* SAVED TAB */}
                {activeTab === 'saved' && (
                  <motion.div key="saved" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1">
                    <h2 className="text-2xl font-black mb-6 flex items-center gap-2"><Heart className="text-pink-500"/> Saved</h2>
                    {Object.keys(savedGifts).length === 0 ? (
                      <p className="text-center text-gray-400 mt-20">Nothing saved yet. Try swiping right!</p>
                    ) : (
                      Object.entries(savedGifts).map(([name, gifts]) => (
                        <div key={name} className="mb-6">
                          <h3 className="font-bold text-slate-800 border-b pb-2 mb-3">{name}</h3>
                          <div className="space-y-2">
                            {gifts.map((g, i) => (
                              <div key={i} className="p-4 bg-white border border-gray-100 rounded-xl flex justify-between items-center shadow-sm">
                                <div className="pr-4">
                                  <p className="font-bold text-slate-800 text-sm">{g.title}</p>
                                  <p className="text-[10px] uppercase font-bold text-purple-400">{g.category}</p>
                                </div>
                                <Heart size={14} className="text-pink-500 fill-pink-500 shrink-0" />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    )}
                  </motion.div>
                )}

                {/* SETTINGS TAB */}
                {activeTab === 'settings' && (
                  <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1">
                    <h2 className="text-2xl font-black mb-6">Settings</h2>
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 rounded-2xl flex items-center justify-between">
                        <span className="font-medium text-slate-700">Dark Mode</span>
                        <div className="w-12 h-6 bg-gray-300 rounded-full"></div>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-2xl flex items-center justify-between">
                        <span className="font-medium text-slate-700">Notifications</span>
                        <div className="w-12 h-6 bg-purple-500 rounded-full"></div>
                      </div>
                      <button onClick={() => setIsLoggedIn(false)} className="w-full p-4 text-red-500 font-bold bg-red-50 rounded-2xl">Log Out</button>
                    </div>
                  </motion.div>
                )}
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Nav Bar (Only show if logged in) */}
      {isLoggedIn && (
        <div className="fixed bottom-6 w-full max-w-md px-4">
          <div className="bg-white/90 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl flex justify-around p-3">
            <TabButton active={activeTab === 'find'} icon={<Gift />} label="Find" onClick={() => setActiveTab('find')} />
            <TabButton active={activeTab === 'saved'} icon={<Heart />} label="Saved" onClick={() => setActiveTab('saved')} />
            <TabButton active={activeTab === 'people'} icon={<Users />} label="Circle" onClick={() => setActiveTab('people')} />
            <TabButton active={activeTab === 'settings'} icon={<Settings />} label="Settings" onClick={() => setActiveTab('settings')} />
          </div>
        </div>
      )}
    </div>
  );
};

// Reusable Components
const StepWrapper = ({ title, sub, children }) => (
  <div className="space-y-8 flex-1">
    <div><h1 className="text-3xl font-black text-slate-900 leading-tight">{title}</h1><p className="text-gray-400 font-medium">{sub}</p></div>
    <div className="space-y-5">{children}</div>
  </div>
);

const Field = ({ label, children }) => (
  <div className="space-y-2"><label className="block text-slate-800 font-bold text-sm ml-1">{label}</label>{children}</div>
);

const Input = ({ value, onChange, ...props }) => (
  <input {...props} value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-purple-500 outline-none transition-all" />
);

const Select = ({ placeholder, value, onChange, options = [] }) => (
  <div className="relative">
    <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full appearance-none bg-gray-50 border-none rounded-2xl px-5 py-4 text-gray-700 outline-none focus:ring-2 focus:ring-purple-500">
      <option value="" disabled>{placeholder}</option>
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
  </div>
);

const TabButton = ({ active, icon, label, onClick }) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-all ${active ? 'text-[#7C3AED] scale-110' : 'text-gray-400'}`}>
    {React.cloneElement(icon, { size: 22 })}
    <span className="text-[10px] font-bold uppercase">{label}</span>
  </button>
);

const NextButton = ({ onClick }) => (
  <button onClick={onClick} className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all">Next <ArrowRight size={20}/></button>
);

const BackButton = ({ onClick }) => (
  <button onClick={onClick} className="flex-1 bg-gray-100 text-slate-900 font-bold py-4 rounded-2xl flex items-center justify-center gap-2">Back</button>
);

const TinderCard = ({ gift, onSwipe }) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);

  const catStyles = {
    "Home": "bg-orange-400", "Technology": "bg-blue-500", "Food & Drink": "bg-emerald-500",
    "Arts": "bg-purple-500", "Entertainment": "bg-red-500", "Self-care": "bg-pink-400"
  };

  return (
    <motion.div 
      style={{ x, rotate, opacity }}
      drag="x" dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={(_, info) => {
        if (info.offset.x > 100) onSwipe('right');
        else if (info.offset.x < -100) onSwipe('left');
      }}
      exit={{ scale: 0.8, opacity: 0 }}
      className="absolute inset-0 bg-white border border-gray-100 rounded-[2.5rem] shadow-2xl cursor-grab active:cursor-grabbing overflow-hidden flex flex-col"
    >
      <div className={`h-1/2 w-full ${catStyles[gift.category] || 'bg-slate-800'} flex items-center justify-center relative`}>
        <div className="absolute top-6 left-6 bg-white/20 backdrop-blur-md px-4 py-1 rounded-full text-[10px] font-black text-white uppercase tracking-widest">
          {gift.category}
        </div>
        <Sparkles className="text-white/20" size={80} />
      </div>
      <div className="p-8 flex-1 flex flex-col">
        <h3 className="text-2xl font-black text-slate-800 mb-2 leading-tight">{gift.title}</h3>
        <p className="text-gray-500 text-sm leading-relaxed line-clamp-3">{gift.description}</p>
        <div className="mt-auto flex justify-between gap-4 pt-4">
          <div className="flex-1 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center border border-red-100"><X size={20}/></div>
          <div className="flex-1 h-12 rounded-full bg-green-50 text-green-500 flex items-center justify-center border border-green-100"><Check size={20}/></div>
        </div>
      </div>
    </motion.div>
  );
};

export default GiftFinder;