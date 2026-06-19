import { type FormEvent, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../App';
import axios from 'axios';

export function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [company, setCompany] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register({ name, email, password, company, phoneNumber });
      navigate('/dashboard');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Registration failed');
      } else {
        setError('Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#030712] px-4 py-12 sm:py-8">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-[#6366f1]/20 rounded-full blur-3xl"/>
        <div className="absolute bottom-1/4 left-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-[#0077ff]/15 rounded-full blur-3xl"/>
      </div>
      
      <div className="relative w-full max-w-md mx-4 sm:mx-0">
        <div className="text-center mb-6 sm:mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--indigo)] to-[var(--secondary)] flex items-center justify-center">
              <span className="text-white font-bold">A</span>
            </div>
            <span className="text-2xl font-bold gradient-text">Autoniv</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Create your account</h1>
          <p className="text-[var(--slate-light)]">Start your free trial today</p>
        </div>

        <form onSubmit={handleSubmit} className="relative bg-[var(--s1)]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5 sm:p-8 space-y-4 sm:space-y-5">
          {error && (
            <div className="p-4 bg-[#ef4444]/10 border border-[var(--red)]/30 rounded-xl text-[var(--red)] text-sm flex items-center gap-3">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--slate-light)]">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
              className="w-full px-4 py-3.5 bg-[var(--surface-light)]/50 border border-white/10 rounded-xl text-white placeholder-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#0077ff] focus:border-transparent transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--slate-light)]">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
              className="w-full px-4 py-3.5 bg-[var(--surface-light)]/50 border border-white/10 rounded-xl text-white placeholder-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#0077ff] focus:border-transparent transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--slate-light)]">Phone Number</label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+1 (555) 123-4567"
              className="w-full px-4 py-3.5 bg-[var(--surface-light)]/50 border border-white/10 rounded-xl text-white placeholder-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#0077ff] focus:border-transparent transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--slate-light)]">Company (optional)</label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Your Company"
              className="w-full px-4 py-3.5 bg-[var(--surface-light)]/50 border border-white/10 rounded-xl text-white placeholder-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#0077ff] focus:border-transparent transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--slate-light)]">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a strong password"
              required
              minLength={6}
              className="w-full px-4 py-3.5 bg-[var(--surface-light)]/50 border border-white/10 rounded-xl text-white placeholder-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#0077ff] focus:border-transparent transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-cta w-full py-3.5 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                Creating account...
              </>
            ) : 'Create account'}
          </button>

          <p className="text-center text-sm text-[var(--slate-gray)]">
            Already have an account?{' '}
            <Link to="/login" className="text-[var(--indigo)] hover:text-[#00c8b4] font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}