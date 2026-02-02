import React, { useState } from 'react';
import { ChevronDown, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const GiftFinder = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // 1. STATE TO HOLD ALL FORM DATA
  const [formData, setFormData] = useState({
    relation: '',
    age: '',
    gender: '',
    hobbies: '',
    personality: '',
    minBudget: '',
    maxBudget: '',
    occasion: ''
  });

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 3));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  // 2. HANDLER TO UPDATE STATE
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // 3. BACKEND COMMUNICATION (POST REQUEST)
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/generate-gifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log("AI Recommendations:", data.result);
      alert("AI Response: " + data.result); // Replace this with a result screen later!
    } catch (error) {
      console.error("Connection error:", error);
    } finally {
      setLoading(false);
    }
  };

  const variants = {
    enter: (direction) => ({ x: direction > 0 ? 50 : -50, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction) => ({ x: direction < 0 ? 50 : -50, opacity: 0 }),
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 overflow-hidden">
        
        <div className="flex gap-2 h-1.5 mb-10">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`flex-1 rounded-full transition-colors duration-500 ${step >= i ? 'bg-[#7C3AED]' : 'bg-purple-100'}`} />
          ))}
        </div>

        <div className="relative min-h-[420px]">
          <AnimatePresence mode="wait" custom={step}>
            <motion.div
              key={step}
              custom={step}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="space-y-8"
            >
              {step === 1 && (
                <div className="space-y-8">
                  <div className="space-y-2">
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Who is this for?</h1>
                    <p className="text-gray-400 font-medium text-lg">Tell us about the lucky recipient.</p>
                  </div>
                  <div className="space-y-6">
                    <Field label="Relation to you">
                      <Select 
                        placeholder="Select relation" 
                        value={formData.relation} 
                        onChange={(val) => handleChange('relation', val)}
                        options={['Parent', 'Partner', 'Friend', 'Sibling']}
                      />
                    </Field>
                    <div className="flex gap-4">
                      <Field label="Age">
                        <Input type="number" value={formData.age} onChange={(val) => handleChange('age', val)} />
                      </Field>
                      <Field label="Gender">
                        <Select 
                            placeholder="Gender" 
                            value={formData.gender} 
                            onChange={(val) => handleChange('gender', val)} 
                            options={['Male', 'Female', 'Non-binary', 'Other']}
                        />
                      </Field>
                    </div>
                  </div>
                  <NextButton onClick={nextStep} />
                </div>
              )}

              {step === 2 && (
                <div className="space-y-8">
                  <div className="space-y-2">
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">What are they like?</h1>
                    <p className="text-gray-400 font-medium text-lg">Their hobbies and personality.</p>
                  </div>
                  <div className="space-y-6">
                    <Field label="Hobbies & Interests" hint="List as many as you can think of!">
                      <Input 
                        placeholder="e.g. Hiking, Coding, Cooking" 
                        value={formData.hobbies} 
                        onChange={(val) => handleChange('hobbies', val)} 
                      />
                    </Field>
                    <Field label="Personality Traits">
                      <Input 
                        placeholder="e.g. Introvert, Creative, Funny" 
                        value={formData.personality} 
                        onChange={(val) => handleChange('personality', val)} 
                      />
                    </Field>
                  </div>
                  <div className="flex gap-4 pt-2">
                    <BackButton onClick={prevStep} />
                    <NextButton onClick={nextStep} />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-8">
                  <div className="space-y-2">
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">The logistics</h1>
                    <p className="text-gray-400 font-medium text-lg">Budget and occasion.</p>
                  </div>
                  <div className="space-y-6">
                    <Field label="Budget Range ($)">
                      <div className="flex items-center gap-3">
                        <Input placeholder="0" value={formData.minBudget} onChange={(val) => handleChange('minBudget', val)} />
                        <span className="text-gray-300">—</span>
                        <Input placeholder="100" value={formData.maxBudget} onChange={(val) => handleChange('maxBudget', val)} />
                      </div>
                    </Field>
                    <Field label="Occasion">
                      <Input placeholder="Birthday" value={formData.occasion} onChange={(val) => handleChange('occasion', val)} />
                    </Field>
                  </div>
                  <div className="flex gap-4 pt-2">
                    <BackButton onClick={prevStep} />
                    <button 
                      onClick={handleSubmit}
                      disabled={loading}
                      className="flex-[1.2] bg-gradient-to-r from-[#7C3AED] to-[#EC4899] hover:opacity-90 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 disabled:grayscale"
                    >
                      {loading ? "Thinking..." : <><Sparkles size={18} /> Find Gifts</>}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

// --- Updated Sub-components ---

const Field = ({ label, children, hint }) => (
  <div className="space-y-2">
    <label className="block text-slate-800 font-bold">{label}</label>
    {children}
    {hint && <p className="text-sm text-gray-400">{hint}</p>}
  </div>
);

const Input = ({ value, onChange, ...props }) => (
  <input 
    {...props} 
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="w-full bg-[#F9FAFB] border border-gray-200 rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all placeholder:text-gray-400" 
  />
);

const Select = ({ placeholder, value, onChange, options = [] }) => (
  <div className="relative">
    <select 
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full appearance-none bg-[#F9FAFB] border border-gray-200 rounded-xl px-4 py-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
    >
      <option value="" disabled>{placeholder}</option>
      {options.map(opt => <option key={opt} value={opt.toLowerCase()}>{opt}</option>)}
    </select>
    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
  </div>
);

const NextButton = ({ onClick }) => (
  <button onClick={onClick} className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md">
    Next <ArrowRight size={20} />
  </button>
);

const BackButton = ({ onClick }) => (
  <button onClick={onClick} className="flex-1 bg-white border border-slate-200 text-slate-900 font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50 transition-all active:scale-95">
    <ArrowLeft size={20} /> Back
  </button>
);

export default GiftFinder;