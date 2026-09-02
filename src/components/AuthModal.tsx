import { useState, FormEvent } from 'react';
import { X, Mail, Lock, User, CheckCircle, ShieldAlert } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (userName: string, userEmail: string) => void;
}

export default function AuthModal({ isOpen, onClose, onLoginSuccess }: AuthModalProps) {
  const [isLoginView, setIsLoginView] = useState<boolean>(true);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic Validations
    if (!email || !password) {
      setError('कृपया ईमेल और पासवर्ड भरें। (Please fill out email & password)');
      return;
    }

    if (!isLoginView && !name) {
      setError('कृपया अपना नाम दर्ज करें। (Please enter your name)');
      return;
    }

    if (password.length < 6) {
      setError('पासवर्ड कम से कम 6 अक्षरों का होना चाहिए। (Password must be 6+ characters)');
      return;
    }

    try {
      const storedUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');

      if (isLoginView) {
        // Handle Login
        const foundUser = storedUsers.find(
          (u: any) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
        );

        if (foundUser) {
          setSuccess(true);
          setTimeout(() => {
            onLoginSuccess(foundUser.name, foundUser.email);
            onClose();
            // Reset states
            setEmail('');
            setPassword('');
            setSuccess(false);
          }, 1200);
        } else {
          // If no users registered yet or mismatch, let's allow a seamless quick-start account
          if (storedUsers.length === 0) {
            setError('यह ईमेल पंजीकृत नहीं है। कृपया "नया अकाउंट बनाएं" चुनें। (Email not registered; please select Sign Up)');
          } else {
            setError('गलत ईमेल या पासवर्ड! (Incorrect email or password!)');
          }
        }
      } else {
        // Handle Registration
        const userExists = storedUsers.some((u: any) => u.email.toLowerCase() === email.toLowerCase());

        if (userExists) {
          setError('यह ईमेल पहले से ही पंजीकृत है! (Email already registered!)');
          return;
        }

        const newUser = { name, email, password };
        localStorage.setItem('registered_users', JSON.stringify([...storedUsers, newUser]));
        
        setSuccess(true);
        setTimeout(() => {
          onLoginSuccess(name, email);
          onClose();
          // Reset states
          setName('');
          setEmail('');
          setPassword('');
          setSuccess(false);
        }, 1200);
      }
    } catch (err) {
      setError('लॉगिन करने में त्रुटि आई। (Authentication error occurred)');
    }
  };

  const handleDemoLogin = () => {
    onLoginSuccess('Guest User', 'guest@example.com');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in" id="auth-modal">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative overflow-hidden" id="auth-card">
        
        {/* Background glow effects */}
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Modal Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-all cursor-pointer"
          id="auth-close-btn"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Branding */}
        <div className="text-center mb-6">
          <h3 className="text-xl font-black text-slate-950">
            {isLoginView ? 'लॉगिन करें (Sign In)' : 'नया अकाउंट बनाएं (Sign Up)'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            {isLoginView 
              ? 'अपने सहेजे गए स्कैन और इतिहास को सुरक्षित रखने के लिए साइन इन करें।'
              : 'मुफ़्त पंजीकरण करें और असीमित एआई स्कैन तक पहुंच पाएं।'
            }
          </p>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-100 rounded-xl flex gap-2 text-rose-800 text-xs font-semibold leading-relaxed" id="auth-error">
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex gap-2 text-emerald-800 text-xs font-semibold items-center" id="auth-success">
            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>सफलतापूर्वक प्रमाणित! कृपया प्रतीक्षा करें...</span>
          </div>
        )}

        {/* Interactive Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4" id="auth-form">
          
          {!isLoginView && (
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5">पूरा नाम (Full Name)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="उदा. अमित शर्मा (e.g. Amit Sharma)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-xl py-2.5 pl-9 pr-4 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5">ईमेल (Email Address)</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                placeholder="example@mail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200/80 rounded-xl py-2.5 pl-9 pr-4 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5">पासवर्ड (Password)</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200/80 rounded-xl py-2.5 pl-9 pr-4 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={success}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-extrabold text-sm rounded-xl cursor-pointer active:scale-95 transition-all shadow-md mt-2"
            id="auth-submit-btn"
          >
            {isLoginView ? 'प्रवेश करें (Login)' : 'रजिस्टर करें (Register)'}
          </button>
        </form>

        {/* View Switcher Controls */}
        <div className="mt-4 text-center" id="auth-switcher">
          <button
            type="button"
            onClick={() => {
              setIsLoginView(!isLoginView);
              setError(null);
            }}
            className="text-xs font-extrabold text-indigo-600 hover:text-indigo-800 cursor-pointer transition-colors"
          >
            {isLoginView 
              ? 'नया अकाउंट बनाना चाहते हैं? यहाँ क्लिक करें (Create New Account)' 
              : 'पहले से ही अकाउंट है? लॉगिन करें (Already have an account? Login)'
            }
          </button>
        </div>

        {/* Divider line */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200/80"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-3 text-slate-400 font-semibold">या (OR)</span>
          </div>
        </div>

        {/* Demo Quick login button */}
        <button
          type="button"
          onClick={handleDemoLogin}
          className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-extrabold text-xs rounded-xl cursor-pointer active:scale-95 transition-all"
          id="demo-guest-btn"
        >
          बिना अकाउंट अतिथि के रूप में जारी रखें (Continue as Guest)
        </button>

      </div>
    </div>
  );
}
