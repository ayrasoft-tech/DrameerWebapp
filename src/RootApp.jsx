import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download } from 'lucide-react';
import App from './App';
import ReceptionApp from './ReceptionApp';

export default function RootApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState(null); // 'doctor' or 'reception'
  const [loginForm, setLoginInput] = useState({ username: '', password: '' });

  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showIosModal, setShowIosModal] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  // PWA install prompt capture
  useEffect(() => {
    // Hide button if already running as installed PWA
    if (window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true) {
      setIsInstalled(true);
      return;
    }
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setIsInstalled(true));
    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
    if (isIos) {
      setShowIosModal(true);
    } else if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setIsInstalled(true);
      setDeferredPrompt(null);
    } else {
      alert('To install this app:\n\n📱 Android: tap the browser menu (⋮) → "Add to Home screen"\n🍎 iPhone: tap Share (⎙) → "Add to Home Screen"');
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginForm.username === 'doctor' && loginForm.password === 'secure123') {
      setRole('doctor');
      setIsAuthenticated(true);
    } else if (loginForm.username === 'reception' && loginForm.password === 'secure123') {
      setRole('reception');
      setIsAuthenticated(true);
    } else {
      alert('Invalid Credentials');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setRole(null);
    setLoginInput({ username: '', password: '' });
  };

  if (!isAuthenticated) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f0fdfa', padding: '20px' }}>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ background: 'white', padding: '40px', borderRadius: '30px', boxShadow: '0 20px 50px rgba(13, 148, 136, 0.15)', textAlign: 'center', width: '100%', maxWidth: '400px' }}>
          <img src="/clinic-logo.png" alt="Clinic Logo" style={{ width: '70px', height: 'auto', marginBottom: '10px' }} />
          <h2 style={{ color: '#0d9488', marginBottom: '30px', fontWeight: '800' }}>Peoples Dental Care</h2>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input type="text" placeholder="Username" value={loginForm.username} onChange={(e) => setLoginInput({ ...loginForm, username: e.target.value })} style={{ padding: '14px', borderRadius: '12px', border: '2px solid #f0fdfa', backgroundColor: '#f9fafb', fontSize: '16px', outline: 'none', color: '#1f2937' }} />
            <input type="password" placeholder="Password" value={loginForm.password} onChange={(e) => setLoginInput({ ...loginForm, password: e.target.value })} style={{ padding: '14px', borderRadius: '12px', border: '2px solid #f0fdfa', backgroundColor: '#f9fafb', fontSize: '16px', outline: 'none', color: '#1f2937' }} />
            <button type="submit" style={{ padding: '14px', background: '#0d9488', color: 'white', border: 'none', borderRadius: '15px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', marginTop: '10px' }}>Sign In</button>
          </form>

          {/* Install App Button on Login Screen - always visible until installed */}
          {!isInstalled && (
            <div style={{ margin: '24px 0 0', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
              <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#94a3b8' }}>📲 Add to your home screen for quick access</p>
              <button
                id="loginInstallBtn"
                onClick={handleInstallClick}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: 'linear-gradient(135deg, #0d9488, #0f766e)', color: 'white', border: 'none', borderRadius: '15px', cursor: 'pointer', fontWeight: '700', fontSize: '15px', boxShadow: '0 4px 15px rgba(13,148,136,0.3)' }}
              >
                <Download size={17} /> Install App
              </button>
            </div>
          )}
        </motion.div>

        {/* iOS Install Instructions Modal */}
        {showIosModal && (
          <div onClick={() => setShowIosModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 9999, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
            <motion.div initial={{ y: 100 }} animate={{ y: 0 }} onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: '20px 20px 0 0', padding: '28px 24px 40px', width: '100%', maxWidth: '480px' }}>
              <h3 style={{ margin: '0 0 6px', fontSize: '18px', color: '#1f2937' }}>📲 Install on iPhone / iPad</h3>
              <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#6b7280' }}>Follow these steps to add to your home screen:</p>
              {[
                { n: 1, text: <>Tap the <strong style={{ color: '#0d9488' }}>Share</strong> button <strong style={{ color: '#0d9488' }}>⎙</strong> at the bottom of Safari</> },
                { n: 2, text: <>Scroll down and tap <strong style={{ color: '#0d9488' }}>&ldquo;Add to Home Screen&rdquo;</strong></> },
                { n: 3, text: <>Tap <strong style={{ color: '#0d9488' }}>&ldquo;Add&rdquo;</strong> — the app icon appears on your home screen!</> },
              ].map(s => (
                <div key={s.n} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '18px' }}>
                  <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#0d9488', color: 'white', fontWeight: '700', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{s.n}</div>
                  <div style={{ fontSize: '14px', color: '#374151', lineHeight: 1.5 }}>{s.text}</div>
                </div>
              ))}
              <button onClick={() => setShowIosModal(false)} style={{ width: '100%', padding: '13px', background: '#f3f4f6', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '600', color: '#374151', cursor: 'pointer' }}>Got it ✓</button>
            </motion.div>
          </div>
        )}
      </div>
    );
  }

  if (role === 'doctor') {
    return <App onLogout={handleLogout} />;
  }

  if (role === 'reception') {
    return <ReceptionApp onLogout={handleLogout} />;
  }

  return null;
}
