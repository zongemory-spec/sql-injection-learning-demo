
import React, { useState, useEffect } from 'react';
import { Lock, Shield, Terminal, Database, ChevronRight, AlertTriangle, Eye, EyeOff, BookOpen, Ghost, Zap, Bug } from 'lucide-react';
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

  const handleLogin = (e?: React.FormEvent) => {
    e?.preventDefault();
    setError('');
    
    const result = executeVulnerableLogin(username, password);
    setLastQuery(result.executedQuery);

    if (result.success && result.rows.length > 0) {
      setCurrentUser(result.rows[0]);
      setView(SecurityView.DASHBOARD);
      fetchArchiveData(result.rows[0].role);
    } else {
      setError(result.error || '身份验证失败');
    }
  };

  const fetchArchiveData = async (role: string) => {
    setLoading(true);
    const docs = await getSecretArchiveContent(role);
    setArchiveDocs(docs);
    setLoading(false);
  };

  const quickExploit = (payload: string) => {
    setUsername(payload);
    setPassword('');
    setError('');
    // 自动触发登录以演示
    setTimeout(() => {
        const result = executeVulnerableLogin(payload, '');
        setLastQuery(result.executedQuery);
        if (result.success) {
            setCurrentUser(result.rows[0]);
            setView(SecurityView.DASHBOARD);
            fetchArchiveData(result.rows[0].role);
        } else {
            setError(result.error || '失败');
        }
    }, 500);
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
    <div className="min-h-screen flex flex-col bg-black text-zinc-300">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="scanline"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(34,197,94,0.05)_0%,_rgba(0,0,0,0)_70%)]"></div>
      </div>

      <header className="z-10 bg-zinc-950/80 border-b border-zinc-800 p-4 backdrop-blur-md sticky top-0">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/20 p-2 rounded-lg border border-emerald-500/50">
              <Shield className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-zinc-100 uppercase">
                Aegis <span className="text-emerald-500">Vault</span> 实验室
              </h1>
              <p className="text-[10px] mono text-zinc-500 uppercase tracking-widest">SQL 注入漏洞演示环境</p>
            </div>
          </div>

          <nav className="flex items-center gap-4">
            <button 
              onClick={() => setView(SecurityView.LAB_GUIDE)}
              className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              教程指南
            </button>
            {currentUser && (
              <button onClick={logout} className="text-xs font-semibold px-3 py-1.5 rounded bg-red-950/50 border border-red-900/50 text-red-400 hover:bg-red-900 transition-colors">
                登出系统
              </button>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1 z-10 p-6 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8">
          {view === SecurityView.LOGIN && (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden backdrop-blur-sm shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="p-6 border-b border-zinc-800 bg-zinc-900/80 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-zinc-100 flex items-center gap-3">
                  <Terminal className="w-6 h-6 text-emerald-500" /> 
                  鉴权终端
                </h2>
                <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded text-[10px] text-red-500 font-bold">
                  <Bug className="w-3 h-3" /> 漏洞：字符串拼接注入
                </div>
              </div>

              <div className="p-8">
                <form onSubmit={handleLogin} className="space-y-6 max-w-md mx-auto">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">用户名 (尝试注入载荷)</label>
                    <div className="relative">
                      <Terminal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                      <input 
                        type="text" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="' OR '1'='1"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-3 pl-10 pr-4 focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all mono text-zinc-200"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">密码 (可留空测试注入)</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                      <input 
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="任意字符"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-3 pl-10 pr-12 focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all mono text-zinc-200"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="p-4 rounded bg-red-950/30 border border-red-500/50 text-red-400 text-xs flex items-start gap-3 animate-bounce">
                      <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="font-bold">拦截到错误！</p>
                        <p className="opacity-80">{error}</p>
                      </div>
                    </div>
                  )}

                  <button type="submit" className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-all shadow-lg flex justify-center items-center gap-2 group active:scale-[0.98]">
                    登录系统
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </form>

                <div className="mt-12 space-y-4">
                  <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <Zap className="w-3 h-3 text-yellow-500" /> 快捷攻击演示 (Payloads)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button onClick={() => quickExploit("' OR '1'='1")} className="text-left p-3 bg-zinc-950 border border-zinc-800 rounded hover:border-emerald-500/50 transition-all group border-l-2 border-l-blue-500">
                      <span className="text-[10px] text-zinc-500 block mb-1 font-bold">1. 恒真式绕过 (逻辑破坏)</span>
                      <code className="text-xs text-blue-400 group-hover:text-blue-300">' OR '1'='1</code>
                    </button>
                    <button onClick={() => quickExploit("admin' -- ")} className="text-left p-3 bg-zinc-950 border border-zinc-800 rounded hover:border-emerald-500/50 transition-all group border-l-2 border-l-orange-500">
                      <span className="text-[10px] text-zinc-500 block mb-1 font-bold">2. 注释截断 (万能账号)</span>
                      <code className="text-xs text-orange-400 group-hover:text-orange-300">admin' -- </code>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {view === SecurityView.DASHBOARD && currentUser && (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
              <div className="bg-emerald-900/10 border border-emerald-500/30 p-6 rounded-xl flex flex-col sm:flex-row items-center gap-6 backdrop-blur-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 bg-emerald-500 text-black text-[10px] font-black uppercase transform rotate-45 translate-x-8 -translate-y-2 w-32 text-center shadow-lg">
                  Pwned!
                </div>
                <div className="bg-emerald-500/20 p-4 rounded-full border border-emerald-500/40">
                  <Ghost className="w-10 h-10 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-zinc-100 uppercase tracking-tighter italic">
                    Access Granted: <span className="text-emerald-500">{currentUser.username}</span>
                  </h2>
                  <p className="text-emerald-400/80 text-sm mono flex items-center gap-2">
                    <Shield className="w-4 h-4" /> 权限级别: {currentUser.role} (系统已沦陷)
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 relative group">
                  <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Database className="w-4 h-4 text-emerald-500" /> 检索到的秘密数据
                  </h3>
                  <div className="p-4 bg-zinc-950 rounded border border-zinc-800 italic text-zinc-100 text-lg leading-relaxed border-l-4 border-l-emerald-500 shadow-inner">
                    "{currentUser.secret_data}"
                  </div>
                </div>

                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                  <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500" /> 漏洞分析
                  </h3>
                  <div className="space-y-3">
                    <p className="text-xs text-zinc-400">你刚才执行的恶意查询让原本的 SQL 逻辑变成了：</p>
                    <div className="p-3 bg-black rounded mono text-[10px] text-red-400 break-all border border-red-900/30">
                      {lastQuery}
                    </div>
                    <p className="text-[10px] text-zinc-500 italic">
                      由于 <span className="text-emerald-500">OR '1'='1'</span> 永远成立，数据库在验证身份时直接跳过了密码比对。
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/80">
                  <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-emerald-500" /> 深度加密档案 (AI 生成)
                  </h3>
                  {loading && <div className="animate-spin h-4 w-4 border-2 border-emerald-500 border-t-transparent rounded-full"></div>}
                </div>
                <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
                  {archiveDocs.map((doc, idx) => (
                    <div key={idx} className="p-5 bg-zinc-950 border border-zinc-800 rounded-lg border-l-2 border-l-emerald-900 hover:border-l-emerald-500 transition-all">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-emerald-400 font-bold uppercase tracking-tight">{doc.title}</h4>
                        <span className="px-2 py-0.5 bg-red-950 text-red-500 text-[9px] rounded border border-red-900 uppercase font-black">{doc.classification}</span>
                      </div>
                      <p className="text-zinc-400 text-xs leading-relaxed mb-4 font-mono">
                        {doc.content}
                      </p>
                      <div className="flex justify-between text-[9px] mono text-zinc-600 border-t border-zinc-900 pt-3">
                        <span>ARCHIVE_REF: {Math.random().toString(16).slice(2, 10).toUpperCase()}</span>
                        <span>DATE: {doc.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {view === SecurityView.LAB_GUIDE && (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8 space-y-8 animate-in fade-in duration-500">
              <div className="border-b border-zinc-800 pb-6">
                <h2 className="text-3xl font-black text-white mb-2 uppercase italic tracking-tighter">
                  SQL Injection <span className="text-emerald-500 underline decoration-wavy underline-offset-8">Handbook</span>
                </h2>
                <p className="text-zinc-400">一步步教你如何“黑”进这个模拟系统。</p>
              </div>

              <div className="grid grid-cols-1 gap-8">
                <section className="bg-zinc-950 p-6 rounded-lg border border-zinc-800">
                  <h3 className="text-lg font-bold text-emerald-400 mb-3 flex items-center gap-2">
                    攻击方式 A: 万能密码 (Tautology)
                  </h3>
                  <p className="text-sm text-zinc-400 mb-4 leading-relaxed">
                    在用户名输入 <code className="text-emerald-500">' OR '1'='1</code>。原本的 SQL 逻辑是：
                  </p>
                  <div className="bg-black p-4 rounded text-xs mono text-zinc-500 mb-4">
                    SELECT * FROM users WHERE username = <span className="text-red-400">'admin'</span> AND password = <span className="text-red-400">'...'</span>
                  </div>
                  <p className="text-sm text-zinc-400 mb-4 leading-relaxed">注入后变成了：</p>
                  <div className="bg-black p-4 rounded text-xs mono text-emerald-400 mb-4">
                    SELECT * FROM users WHERE username = '' OR <span className="underline italic text-white">'1'='1'</span> -- 
                  </div>
                  <p className="text-xs text-zinc-500 bg-emerald-500/5 p-3 rounded border border-emerald-500/20 italic">
                    因为 <code className="text-white">'1'='1'</code> 永远成立，数据库会直接返回表中的第一行数据（通常是 Admin）。
                  </p>
                </section>

                <section className="bg-zinc-950 p-6 rounded-lg border border-zinc-800">
                  <h3 className="text-lg font-bold text-orange-400 mb-3 flex items-center gap-2">
                    攻击方式 B: 注释符攻击 (Commenting Out)
                  </h3>
                  <p className="text-sm text-zinc-400 mb-4 leading-relaxed">
                    如果你知道用户名（如 <code className="text-white">admin</code>），可以使用 <code className="text-orange-400">admin' -- </code> 
                    将后面的密码校验语句全部变成“注释”，从而直接登录。
                  </p>
                  <div className="bg-black p-4 rounded text-xs mono text-zinc-500">
                    SELECT * FROM users WHERE username = 'admin' <span className="opacity-20 line-through">-- ' AND password = '...'</span>
                  </div>
                </section>
              </div>

              <div className="pt-6 border-t border-zinc-800 flex justify-end">
                <button onClick={() => setView(SecurityView.LOGIN)} className="px-8 py-3 bg-emerald-600 rounded-lg text-white font-bold hover:bg-emerald-500 transition-all shadow-lg">
                  现在去试试！
                </button>
              </div>
            </div>
          )}
        </div>

        <aside className="lg:col-span-4 space-y-6 sticky top-24">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 backdrop-blur-sm shadow-xl relative overflow-hidden">
             <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-500" /> 实时 SQL 监测
            </h3>
            <div className="space-y-4">
              <div className="p-3 bg-black/80 rounded border border-zinc-800 mono text-[10px] leading-relaxed break-all">
                {lastQuery ? (
                   <span className="text-zinc-400 animate-in fade-in"><span className="text-emerald-500 font-bold">$</span> {lastQuery}</span>
                ) : (
                   <span className="text-zinc-700 italic">等待注入数据流...</span>
                )}
              </div>
              <div className="flex items-center justify-between text-[10px] mono text-zinc-600">
                <span>STATUS: {lastQuery ? 'INJECTED' : 'IDLE'}</span>
                <span>DB: SQLITE_MOCK_v2</span>
              </div>
            </div>
          </div>

          <div className="bg-red-950/20 border border-red-900/30 rounded-xl p-6">
            <h3 className="text-red-500 font-bold text-sm mb-3 flex items-center gap-2 uppercase tracking-tighter">
              <Shield className="w-4 h-4" /> 如何修复这个漏洞？
            </h3>
            <p className="text-zinc-400 text-xs leading-relaxed mb-4">
              开发者绝对不能直接拼接 SQL 字符串。正确做法是使用 <strong>参数化查询 (Prepared Statements)</strong>：
            </p>
            <div className="bg-black/50 p-3 rounded mono text-[9px] text-zinc-500">
              db.query("SELECT * FROM users WHERE user = ?", [userInput]);
            </div>
            <p className="text-zinc-500 text-[9px] mt-4 italic">
              这样输入的数据只会被当作纯文本处理，永远无法改变 SQL 指令的逻辑。
            </p>
          </div>
        </aside>
      </main>

      <footer className="z-10 p-6 text-center border-t border-zinc-800 bg-zinc-950/50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[10px] mono text-zinc-600 uppercase tracking-widest">
              SecLab Aegis © 2025 | Cybersecurity Educational Tool
            </p>
            <div className="flex gap-4">
                <div className="flex items-center gap-2 text-[10px] text-emerald-500/50 mono">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                    DATABASE_CONNECTED
                </div>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
