import { useState } from 'react';
import { db } from '../firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import { LEVELS, SPECIALTIES } from '../utils/grading';

export default function AddStudent() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name:'', level:'Form 1', classSection:'', admissionNumber:'', gender:'Male', dateOfBirth:'', section:'Grammar', specialty:'' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'students'), { ...form, createdAt: serverTimestamp() });
      navigate('/');
    } catch (err) { setError('Failed to add student. Please try again.'); }
    setLoading(false);
  };

  return (
    <div className='min-h-screen bg-slate-950 text-white'>
      <nav className='bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center gap-4'>
        <Link to='/' className='text-slate-400 hover:text-white text-sm'>← Back</Link>
        <span className='font-bold text-white'>Add New Student</span>
      </nav>
      <div className='max-w-xl mx-auto px-4 py-10'>
        <div className='bg-slate-900 border border-slate-800 rounded-2xl p-8'>
          {error && <div className='bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3 mb-6'>{error}</div>}
          <form onSubmit={handleSubmit} className='space-y-5'>
            <div>
              <label className='block text-sm font-medium text-slate-300 mb-1.5'>Full Name *</label>
              <input name='name' value={form.name} onChange={handleChange} className='w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-amber-500' placeholder='e.g. Neba Gerald Fru' required />
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-slate-300 mb-1.5'>Level *</label>
                <select name='level' value={form.level} onChange={handleChange} className='w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-amber-500'>
                  {LEVELS.map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium text-slate-300 mb-1.5'>Gender</label>
                <select name='gender' value={form.gender} onChange={handleChange} className='w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-amber-500'>
                  <option>Male</option><option>Female</option>
                </select>
              </div>
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-slate-300 mb-1.5'>Class Section *</label>
                <input name='classSection' value={form.classSection} onChange={handleChange} className='w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-amber-500' placeholder='e.g. Form 1A' required />
              </div>
              <div>
                <label className='block text-sm font-medium text-slate-300 mb-1.5'>Admission No.</label>
                <input name='admissionNumber' value={form.admissionNumber} onChange={handleChange} className='w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-amber-500' placeholder='e.g. 2026/001' />
              </div>
            </div>
            <div>
              <label className='block text-sm font-medium text-slate-300 mb-1.5'>Section</label>
              <select name='section' value={form.section} onChange={handleChange} className='w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-amber-500'>
                <option>Grammar</option><option>Technical</option>
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium text-slate-300 mb-1.5'>Specialty (Technical students)</label>
              <select name='specialty' value={form.specialty} onChange={handleChange} className='w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-amber-500'>
                <option value=''>-- Select Specialty --</option>
                {Object.keys(SPECIALTIES).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium text-slate-300 mb-1.5'>Date of Birth</label>
              <input type='date' name='dateOfBirth' value={form.dateOfBirth} onChange={handleChange} className='w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-amber-500' />
            </div>
            <button type='submit' disabled={loading} className='w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 rounded-lg text-sm disabled:opacity-60'>
              {loading ? 'Adding Student...' : 'Add Student'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
