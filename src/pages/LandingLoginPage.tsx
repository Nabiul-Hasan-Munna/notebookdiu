import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Sparkles, Check, ArrowRight } from 'lucide-react';

export const LandingLoginPage: React.FC = () => {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Form fields
  const [emailOrId, setEmailOrId] = useState('student@diu.edu.bd');
  const [password, setPassword] = useState('password123');
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [department, setDepartment] = useState('Software Engineering');
  const [batch, setBatch] = useState('43');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegistering) {
        await register({
          name,
          email: emailOrId,
          studentId,
          password,
          department,
          batch
        });
      } else {
        await login(emailOrId, password);
      }
      navigate('/feed');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (role: 'student' | 'admin') => {
    if (role === 'admin') {
      setEmailOrId('admin@diu.edu.bd');
      setPassword('admin123');
    } else {
      setEmailOrId('student@diu.edu.bd');
      setPassword('password123');
    }
    setIsRegistering(false);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#060e22] text-white flex flex-col justify-between selection:bg-blue-500 selection:text-white">
      {/* Background Campus and Cosmic Overlays */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -right-20 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-t from-[#060e22] via-[#060e22]/80 to-transparent z-10"></div>
        <img
          src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1600&auto=format&fit=crop&q=80"
          alt="DIU Campus"
          className="w-full h-full object-cover object-bottom opacity-20 filter contrast-125"
        />
      </div>

      {/* Top Navbar */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 p-0.5 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <div className="w-full h-full bg-[#0b1a3c] rounded-[10px] flex items-center justify-center">
              <svg className="w-6 h-6 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="6"/>
                <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(-30 12 12)"/>
              </svg>
            </div>
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight text-white">Universe<span className="text-cyan-400">DIU</span></span>
            <p className="text-[10px] text-cyan-300 font-semibold tracking-widest uppercase">Learn • Share • Grow</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-semibold">
          <button
            onClick={() => handleDemoFill('admin')}
            className="text-slate-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            Demo Admin Credentials
          </button>
          <button
            onClick={() => navigate('/feed')}
            className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl backdrop-blur-sm border border-white/15 transition-all"
          >
            Explore as Guest
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <main className="relative z-20 w-full max-w-7xl mx-auto px-6 py-8 my-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Hero */}
        <section className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/30 text-cyan-300 text-xs font-semibold backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            DIU Exclusive Academic Platform
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-white">
            Your Knowledge <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-300">
              Our Universe
            </span>
          </h1>

          <p className="text-base md:text-lg text-slate-300 max-w-xl leading-relaxed">
            A university-exclusive platform where Daffodil International University students share verified lecture resources, ask academic questions, access lab tutorials, and build knowledge together.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={() => { setIsRegistering(false); setEmailOrId('student@diu.edu.bd'); setPassword('password123'); }}
              className="px-7 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2"
            >
              <span>Login as Student</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => { setIsRegistering(true); setName('New Student'); setEmailOrId('student2@diu.edu.bd'); setStudentId('201-15-99999'); }}
              className="px-7 py-3.5 bg-white/10 hover:bg-white/15 text-white font-semibold rounded-xl border border-white/20 backdrop-blur-md transition-all"
            >
              Create Account
            </button>
          </div>

          {/* Campus Footer Attribution */}
          <div className="pt-8 border-t border-slate-700/50 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-cyan-400 font-bold text-lg">
              DIU
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-200">Daffodil International University</h4>
              <p className="text-[11px] text-slate-400">Ashulia Permanent Campus • Exclusive for DIU Students</p>
            </div>
          </div>
        </section>

        {/* Right Auth Card */}
        <section className="lg:col-span-5">
          <div className="bg-white text-slate-800 rounded-3xl p-8 shadow-2xl shadow-black/50 border border-slate-100 relative">
            <div className="mb-6">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                {isRegistering ? 'Join UniverseDIU' : 'Welcome Back'}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {isRegistering ? 'Register using your university email (@diu.edu.bd)' : 'Login to your UniverseDIU account'}
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegistering && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Nabiul Hasan"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-sm text-slate-800 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Student ID</label>
                    <input
                      type="text"
                      required
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      placeholder="e.g. 201-15-14231"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-sm text-slate-800 outline-none font-mono"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isRegistering ? 'DIU University Email' : 'Student ID or University Email'}
                </label>
                <input
                  type="text"
                  required
                  value={emailOrId}
                  onChange={(e) => setEmailOrId(e.target.value)}
                  placeholder="student@diu.edu.bd"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-sm text-slate-800 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-sm text-slate-800 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {!isRegistering && (
                <div className="flex items-center justify-between text-xs pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-blue-600 border-slate-300" />
                    <span className="text-slate-600">Remember me</span>
                  </label>
                  <a href="#" className="text-blue-600 hover:text-blue-700 font-semibold">Forgot password?</a>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md shadow-blue-500/20 transition-all active:scale-[0.99] mt-2 disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : isRegistering ? 'Create Account' : 'Login'}
              </button>

              <div className="relative flex items-center justify-center my-4">
                <div className="border-t border-slate-200 w-full"></div>
                <span className="bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">OR</span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEmailOrId('student@diu.edu.bd');
                  setPassword('password123');
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all flex items-center justify-center gap-3 text-xs font-semibold text-slate-700"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Continue with DIU Email</span>
              </button>
            </form>

            <p className="text-center text-xs text-slate-500 mt-6">
              {isRegistering ? 'Already have an account? ' : "Don't have an account? "}
              <button
                type="button"
                onClick={() => { setIsRegistering(!isRegistering); setError(null); }}
                className="text-blue-600 font-semibold hover:underline"
              >
                {isRegistering ? 'Login' : 'Register'}
              </button>
            </p>
          </div>
        </section>
      </main>

      <footer className="relative z-20 w-full max-w-7xl mx-auto px-6 py-4 text-center text-[11px] text-slate-500">
        UniverseDIU Platform • Daffodil International University • Designed for DIU Academic Excellence
      </footer>
    </div>
  );
};
