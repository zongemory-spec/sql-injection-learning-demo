
import React, { useState, useEffect } from 'react';
import { Lock, Shield, Terminal, Database, ChevronRight, AlertTriangle, Eye, EyeOff, BookOpen, Ghost } from 'lucide-react';
import { User, SecurityView, ArchiveDocument } from './types';
import { executeVulnerableLogin } from './database';
import { getSecretArchiveContent } from './services/geminiService';

const App: React.FC = () => {
  const [view, setView] = useState<SecurityView>(SecurityView.LOGIN);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [lastQuery, setLastQuery] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [archiveDocs, setArchiveDocs] = useState<ArchiveDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const result = executeVulnerableLogin(username, password);
    setLastQuery(result.executedQuery);

    if (result.success && result.rows.length > 0) {
      // Injected login usually returns the first user found
      setCurrentUser(result.rows[0]);
      setView(SecurityView.DASHBOARD);
      fetchArchiveData(result.rows[0].role);
    } else {
      setError(result.error || 'Access Denied');
    }
  };

  const fetchArchiveData = async (role: string) => {
    setLoading(true);
    const docs = await getSecretArchiveContent(role);
    setArchiveDocs(docs);
    setLoading(false);
  };

  const logout = () => {
    setCurrentUser(null);
    setView(SecurityView.LOGIN);
    setUsername('');
    setPassword('');
    setLastQuery('');
    setError('');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="scanline"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(34,197,94,0.05)_0%,_rgba(0,0,0,0)_70%)]"></div>
      </div>

      {/* Header */}
      <header className="z-10 bg-zinc-950/80 border-b border-zinc-800 p-4 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/20 p-2 rounded-lg border border-emerald-500/50">
              <Shield className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-zinc-100 uppercase">
                Aegis <span className="text-emerald-500">Vault</span> System
              </h1>
              <p className="text-[10px] mono text-zinc-500 uppercase tracking-widest">Secure Archive Interface v4.0.2</p>
            </div>
          </div>

          <nav className="flex items-center gap-4">
            <button 
              onClick={() => setView(SecurityView.LAB_GUIDE)}
              className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              LAB GUIDE
            </button>
            {currentUser && (
              <button 
                onClick={logout}
                className="text-xs font-semibold px-3 py-1.5 rounded bg-red-950/50 border border-red-900/50 text-red-400 hover:bg-red-900 transition-colors"
              >
                DISCONNECT
              </button>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1 z-10 p-6 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Section: Main Interface */}
        <div className="lg:col-span-8">
          {view === SecurityView.LOGIN && (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden backdrop-blur-sm shadow-2xl">
              <div className="p-6 border-b border-zinc-800 bg-zinc-900/80">
                <h2 className="text-2xl font-bold text-zinc-100 flex items-center gap-3">
                  <Lock className="w-6 h-6 text-emerald-500" /> 
                  Terminal Authentication
                </h2>
                <p className="text-zinc-500 text-sm mt-1">Enter your credentials to access the encrypted archives.</p>
              </div>

              <div className="p-8">
                <form onSubmit={handleLogin} className="space-y-6 max-w-md mx-auto">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Access Identifier</label>
                    <div className="relative">
                      <Terminal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                      <input 
                        type="text" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="e.g. j_smith"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-3 pl-10 pr-4 focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all mono text-zinc-200"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Passcode Hash</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                      <input 
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-3 pl-10 pr-12 focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all mono text-zinc-200"
                        required
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 rounded bg-red-900/20 border border-red-900/50 text-red-400 text-sm flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <button 
                    type="submit"
                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-all shadow-lg shadow-emerald-900/20 flex justify-center items-center gap-2 group"
                  >
                    AUTHORIZE CONNECTION
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </form>

                <div className="mt-12 p-4 bg-zinc-950/50 border border-zinc-800/50 rounded-lg">
                  <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Database className="w-3 h-3" /> System Logs (Live)
                  </h3>
                  <div className="mono text-[11px] space-y-1 overflow-x-auto">
                    <p className="text-zinc-600">&gt; Boot sequence completed</p>
                    <p className="text-zinc-600">&gt; Waiting for input...</p>
                    {lastQuery && (
                      <div className="mt-2 p-2 bg-zinc-900 border-l-2 border-emerald-500 overflow-hidden">
                        <p className="text-emerald-500/80">&gt; EXECUTING_SQL_QUERY:</p>
                        <p className="text-zinc-300 whitespace-pre-wrap">{lastQuery}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {view === SecurityView.DASHBOARD && currentUser && (
            <div className="space-y-6">
              <div className="bg-emerald-900/10 border border-emerald-500/30 p-6 rounded-xl flex items-center gap-6 backdrop-blur-sm">
                <div className="bg-emerald-500/20 p-4 rounded-full border border-emerald-500/40">
                  <Ghost className="w-8 h-8 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-zinc-100">Welcome, {currentUser.username}</h2>
                  <p className="text-emerald-400/80 text-sm mono">Role: {currentUser.role} | Clearance: Level {currentUser.id === 1 ? 'Black' : 'Green'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                  <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Database className="w-4 h-4 text-emerald-500" /> Personal Dossier
                  </h3>
                  <div className="p-4 bg-zinc-950 rounded border border-zinc-800 italic text-zinc-300">
                    "{currentUser.secret_data}"
                  </div>
                </div>

                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                  <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-500" /> Connection Info
                  </h3>
                  <div className="space-y-2 text-xs mono">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">ID Hash:</span>
                      <span className="text-zinc-300">0xAF{currentUser.id}DE99</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Node:</span>
                      <span className="text-zinc-300">US-EAST-VAULT-9</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Security Method:</span>
                      <span className="text-zinc-400 line-through">Parameterized Queries</span>
                      <span className="text-red-500">String Concatenation (FAIL)</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/80">
                  <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-emerald-500" /> Related Intelligence
                  </h3>
                  {loading && <div className="animate-spin h-4 w-4 border-2 border-emerald-500 border-t-transparent rounded-full"></div>}
                </div>
                <div className="p-4 space-y-4">
                  {archiveDocs.length === 0 && !loading && (
                    <p className="text-zinc-500 text-center py-8">No intelligence found for your sector.</p>
                  )}
                  {archiveDocs.map((doc, idx) => (
                    <div key={idx} className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg group hover:border-emerald-500/30 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-emerald-400 font-bold">{doc.title}</h4>
                        <span className="px-2 py-0.5 bg-red-950 text-red-500 text-[10px] rounded border border-red-900 uppercase font-bold">{doc.classification}</span>
                      </div>
                      <p className="text-zinc-400 text-sm leading-relaxed mb-3">
                        {doc.content}
                      </p>
                      <div className="text-[10px] mono text-zinc-600">Timestamp: {doc.date}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {view === SecurityView.LAB_GUIDE && (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8 space-y-8 animate-in fade-in duration-500">
              <div className="border-b border-zinc-800 pb-6">
                <h2 className="text-3xl font-bold text-white mb-2 underline decoration-emerald-500 underline-offset-8">Security Lab: SQL Injection</h2>
                <p className="text-zinc-400">Understanding why string concatenation in database queries is a catastrophic vulnerability.</p>
              </div>

              <section className="space-y-4">
                <h3 className="text-lg font-bold text-emerald-400 flex items-center gap-2">
                  <span className="w-6 h-6 bg-emerald-500/10 rounded flex items-center justify-center text-sm">1</span>
                  The Vulnerability
                </h3>
                <p className="text-zinc-300 leading-relaxed">
                  The backend code for this login page looks like this:
                </p>
                <div className="bg-black p-4 rounded-lg mono text-sm overflow-x-auto border border-zinc-800">
                  <span className="text-purple-400">const</span> query = <span className="text-emerald-400">`SELECT * FROM users WHERE username = '${username}' AND password = '${password}';`</span>;
                </div>
                <p className="text-zinc-400 text-sm italic bg-red-950/20 p-3 rounded-md border border-red-900/30">
                  Because the <code className="text-red-400 bg-red-400/10 px-1">username</code> variable is directly inserted into the SQL string without escaping, an attacker can input SQL commands as their "username".
                </p>
              </section>

              <section className="space-y-4">
                <h3 className="text-lg font-bold text-emerald-400 flex items-center gap-2">
                  <span className="w-6 h-6 bg-emerald-500/10 rounded flex items-center justify-center text-sm">2</span>
                  Exploit Attempt A: The "Always True" Condition
                </h3>
                <p className="text-zinc-300 leading-relaxed">
                  Try entering the following into the username field (you can leave the password blank):
                </p>
                <div className="flex gap-2">
                  <code className="bg-zinc-800 p-2 rounded text-emerald-400 flex-1 select-all">' OR '1'='1</code>
                  <button 
                    onClick={() => { setUsername("' OR '1'='1"); setView(SecurityView.LOGIN); }}
                    className="px-4 py-2 bg-emerald-600 rounded text-sm hover:bg-emerald-500"
                  >
                    Load into Login
                  </button>
                </div>
                <p className="text-sm text-zinc-500">
                  <strong>How it works:</strong> The query becomes: <br/>
                  <code className="text-zinc-400">... WHERE username = '' OR '1'='1' AND password = '';</code><br/>
                  Since <code className="text-emerald-500">'1'='1'</code> is always true, the database returns the first user in the table, effectively logging you in as Admin.
                </p>
              </section>

              <section className="space-y-4">
                <h3 className="text-lg font-bold text-emerald-400 flex items-center gap-2">
                  <span className="w-6 h-6 bg-emerald-500/10 rounded flex items-center justify-center text-sm">3</span>
                  Exploit Attempt B: Commenting Out Logic
                </h3>
                <p className="text-zinc-300 leading-relaxed">
                  If you know a username (like "admin"), you can bypass the password check entirely:
                </p>
                <div className="flex gap-2">
                  <code className="bg-zinc-800 p-2 rounded text-emerald-400 flex-1 select-all">admin' --</code>
                  <button 
                    onClick={() => { setUsername("admin' --"); setView(SecurityView.LOGIN); }}
                    className="px-4 py-2 bg-emerald-600 rounded text-sm hover:bg-emerald-500"
                  >
                    Load into Login
                  </button>
                </div>
                <p className="text-sm text-zinc-500">
                  <strong>How it works:</strong> In SQL, <code className="text-zinc-400">--</code> starts a comment. The query becomes:<br/>
                  <code className="text-zinc-400">... WHERE username = 'admin' <span className="text-zinc-700">--' AND password = '';</span></code><br/>
                  The password check is ignored!
                </p>
              </section>

              <div className="pt-6 border-t border-zinc-800">
                <button 
                  onClick={() => setView(SecurityView.LOGIN)}
                  className="px-6 py-2 bg-zinc-800 rounded text-white hover:bg-zinc-700 transition-colors"
                >
                  Back to Terminal
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Section: Lab Stats & Info */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 backdrop-blur-sm">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-500" /> Lab Status
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]"></div>
                <span className="text-sm text-zinc-200">System Vulnerable: YES</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div>
                <span className="text-sm text-zinc-200">WAF Protection: DISABLED</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>
                <span className="text-sm text-zinc-200">Session Encryption: ACTIVE</span>
              </div>
            </div>
          </div>

          <div className="bg-emerald-600/10 border border-emerald-500/20 rounded-xl p-6">
            <h3 className="text-emerald-400 font-bold mb-2 flex items-center gap-2">
              <Eye className="w-4 h-4" /> Did you know?
            </h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              SQL Injection was first discovered in 1998 but remains one of the top vulnerabilities on the OWASP Top 10 list today. Always use <strong>Parameterized Queries</strong> or <strong>ORMs</strong> to prevent this!
            </p>
          </div>

          {lastQuery && (
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden animate-in slide-in-from-right-4 duration-500">
               <div className="bg-zinc-900 px-4 py-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Inspector</div>
               <div className="p-4 mono text-[11px] space-y-3">
                 <div>
                   <span className="text-zinc-600 block mb-1">Payload:</span>
                   <span className="text-zinc-200 block truncate">{username || '(empty)'}</span>
                 </div>
                 <div>
                   <span className="text-zinc-600 block mb-1">Parsed Action:</span>
                   <span className={username.includes("'") ? "text-red-400" : "text-emerald-400"}>
                     {username.includes("'") ? "STRING_TERMINATION_DETECTED" : "STANDARD_AUTHENTICATION"}
                   </span>
                 </div>
               </div>
            </div>
          )}
        </aside>

      </main>

      {/* Footer */}
      <footer className="z-10 p-4 text-center border-t border-zinc-800 bg-zinc-950/50">
        <p className="text-[10px] mono text-zinc-600 uppercase tracking-tighter">
          This is a simulated environment. Data shown is fictional. Unauthorized access to real systems is illegal.
        </p>
      </footer>
    </div>
  );
};

export default App;
