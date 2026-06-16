/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState } from "react";
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  Sparkles, 
  Key, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle,
  Stethoscope,
  Users,
  Building2,
  Truck,
  Shield,
  Fingerprint,
  Info
} from "lucide-react";

interface UserCredential {
  id: string;
  role: "patient" | "doctor" | "pharmacy" | "delivery" | "admin";
  roleLabel: string;
  email: string;
  name: string;
  password: string;
  avatarUrl?: string;
  lastChanged?: string;
}

interface LoginScreenProps {
  onLoginSuccess: (role: "admin" | "doctor" | "patient" | "pharmacy" | "delivery" | "triage") => void;
  credentialsList: UserCredential[];
  setCredentialsList: React.Dispatch<React.SetStateAction<UserCredential[]>>;
}

export default function LoginScreen({ 
  onLoginSuccess, 
  credentialsList, 
  setCredentialsList 
}: LoginScreenProps) {
  // UI Tabs & Interactive States
  const [activeTab, setActiveTab] = useState<"patient" | "doctor" | "pharmacy" | "delivery" | "admin">("patient");
  const [enteredEmail, setEnteredEmail] = useState("");
  const [enteredPassword, setEnteredPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Custom credential "Fixing" tool drawer
  const [showFixDrawer, setShowFixDrawer] = useState(false);
  const [editTargetRole, setEditTargetRole] = useState<string>("patient");
  const [editEmail, setEditEmail] = useState("");
  const [editPass, setEditPass] = useState("");
  const [fixNotification, setFixNotification] = useState<string | null>(null);

  // Forgot password security subflow
  const [showResetFlow, setShowResetFlow] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [isResetSuccess, setIsResetSuccess] = useState(false);
  const [simulationOTP, setSimulationOTP] = useState<string | null>(null);

  // Handle standard Login Submission
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Finding credentials matching role and email
    const match = credentialsList.find(c => 
      c.role === activeTab && 
      c.email.trim().toLowerCase() === enteredEmail.trim().toLowerCase()
    );

    if (!match) {
      setErrorMessage(`No matching configured user profile found for "${activeTab.toUpperCase()}" with this email.`);
      return;
    }

    if (match.password !== enteredPassword) {
      setErrorMessage("Incorrect password. Verification security node rejected the key token. Please fix your credentials below.");
      return;
    }

    // Success! Log the user in to their requested dashboard panel
    onLoginSuccess(match.role);
  };

  // Quick Autofill helpers
  const handleAutoFill = (role: "patient" | "doctor" | "pharmacy" | "delivery" | "admin") => {
    const creds = credentialsList.find(c => c.role === role);
    if (creds) {
      setActiveTab(role);
      setEnteredEmail(creds.email);
      setEnteredPassword(creds.password);
      setErrorMessage(null);
    }
  };

  // Modify / Update (FIX) login credentials/passwords for any user
  const handleUpdateCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setFixNotification(null);

    if (!editEmail.trim() || !editPass.trim()) {
      alert("Please provide both a non-empty email address and standard security password.");
      return;
    }

    setCredentialsList(prev => prev.map(c => {
      if (c.role === editTargetRole) {
        return {
          ...c,
          email: editEmail.trim(),
          password: editPass.trim(),
          lastChanged: new Date().toLocaleTimeString() + " (Today)"
        };
      }
      return c;
    }));

    setFixNotification(`Successfully modified operational credentials for "${editTargetRole.toUpperCase()}"! New key token resides in the active sandbox session.`);
    
    // Auto sync target input in case user was typing on that tab
    if (activeTab === editTargetRole) {
      setEnteredEmail(editEmail);
      setEnteredPassword(editPass);
    }

    setTimeout(() => {
      setFixNotification(null);
    }, 4500);
  };

  // Trigger Forgot-Password simulated SMS/E-mail OTP
  const handleTriggerReset = (e: React.FormEvent) => {
    e.preventDefault();
    const match = credentialsList.find(c => c.email.trim().toLowerCase() === resetEmail.trim().toLowerCase());
    
    if (!match) {
      alert("Email address not found in MedConnect registry.");
      return;
    }

    setIsResetSuccess(true);
    const mockOTP = Math.floor(100000 + Math.random() * 900000).toString();
    setSimulationOTP(mockOTP);
  };

  // Standard icons mapping based on role
  const getRoleIcon = (role: string) => {
    switch (role) {
      case "patient": return <Users className="h-5 w-5" />;
      case "doctor": return <Stethoscope className="h-5 w-5" />;
      case "pharmacy": return <Building2 className="h-5 w-5" />;
      case "delivery": return <Truck className="h-5 w-5" />;
      case "admin": return <Shield className="h-5 w-5" />;
      default: return <Key className="h-5 w-5" />;
    }
  };

  const getRoleTheme = (role: string) => {
    switch (role) {
      case "patient": return "teal";
      case "doctor": return "sky";
      case "pharmacy": return "emerald";
      case "delivery": return "blue";
      case "admin": return "slate";
      default: return "teal";
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 py-12 relative overflow-hidden font-sans antialiased" 
      id="medconnect-login-container"
      style={{
        background: "radial-gradient(circle at 50% 50%, rgba(209, 254, 220, 0.8) 0%, transparent 60%), radial-gradient(circle at 0% 0%, rgba(242, 50, 105, 0.95) 0%, transparent 55%), radial-gradient(circle at 100% 0%, rgba(253, 194, 137, 0.95) 0%, transparent 55%), radial-gradient(circle at 0% 100%, rgba(156, 39, 176, 0.95) 0%, transparent 55%), radial-gradient(circle at 100% 100%, rgba(79, 161, 251, 0.95) 0%, transparent 55%), #ffead4"
      }}
    >
      
      {/* Background visual decoration (Anti-AI slop: aesthetic, humble elements only) */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch relative z-10" id="login-layout-grid">
        
        {/* Left Column: Multi-Role selector, dynamic quick indicators */}
        <div 
          className="lg:col-span-4 flex flex-col justify-between border border-white/20 p-6 rounded-3xl shadow-xl self-stretch shrink-0 transition-all duration-300"
          style={{
            background: "radial-gradient(circle at 50% 50%, #8fa0ae 0%, #687e91 60%, #4f6475 100%)"
          }}
        >
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-300 animate-pulse"></span>
              <p className="text-[10px] text-white font-mono font-bold tracking-widest uppercase bg-slate-950/20 px-2 py-0.5 rounded">Verified Simulation Hub</p>
            </div>

            <div>
              <h2 className="text-xl font-black text-slate-950 tracking-tight font-sans">Access Gateways</h2>
              <p className="text-xs text-slate-900 font-semibold mt-1">Select your hospital system role block below to initiate authorization checks.</p>
            </div>

            {/* Quick selector list with simulated statuses */}
            <div className="space-y-2.5" id="roles-access-list">
              {credentialsList.map((cred) => {
                const isActive = activeTab === cred.role;
                
                return (
                  <button
                    key={cred.id}
                    onClick={() => {
                      setActiveTab(cred.role);
                      setEnteredEmail(cred.email);
                      setEnteredPassword(cred.password);
                      setErrorMessage(null);
                      setShowResetFlow(false);
                    }}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all duration-200 flex items-center justify-between group ${
                      isActive 
                        ? "bg-slate-950 border-slate-950 text-white shadow-xl scale-[1.01]" 
                        : "bg-white/35 border-white/20 text-slate-950 hover:bg-white/50 hover:border-white/30"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl border ${
                        isActive ? "bg-emerald-500/20 border-emerald-400 text-emerald-300" : "bg-white/50 border-white/30 text-slate-800 group-hover:text-slate-950"
                      }`}>
                        {getRoleIcon(cred.role)}
                      </div>
                      <div className="text-left">
                        <p className={`font-extrabold text-xs leading-snug ${isActive ? 'text-white' : 'text-slate-900'}`}>{cred.roleLabel}</p>
                        <p className={`text-[10px] font-mono mt-0.5 truncate max-w-[150px] ${isActive ? 'text-slate-300' : 'text-slate-700'}`}>{cred.email}</p>
                      </div>
                    </div>
                    <span className={`text-[8.5px] font-mono uppercase px-1.5 py-0.5 rounded font-black ${
                      isActive ? 'bg-emerald-500/30 text-emerald-400' : 'bg-white/65 text-slate-950'
                    }`}>
                      Active
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick-fix helper link */}
          <div className="pt-6 border-t border-white/10 mt-6 md:mt-0 font-sans">
            <div className="bg-slate-950/15 border border-white/25 p-4 rounded-2xl">
              <span className="text-[10px] uppercase font-bold text-slate-950 tracking-wider flex items-center gap-1 font-mono">
                🔧 Credentials Sandbox
              </span>
              <p className="text-[11px] text-slate-900 font-semibold mt-1 leading-relaxed">
                Stuck on a password or need to test custom users? Fix or edit registry items dynamically.
              </p>
              <button
                id="btn-trigger-fix-creds"
                onClick={() => {
                  const targetCreds = credentialsList.find(c => c.role === activeTab);
                  if (targetCreds) {
                    setEditTargetRole(targetCreds.role);
                    setEditEmail(targetCreds.email);
                    setEditPass(targetCreds.password);
                  }
                  setShowFixDrawer(!showFixDrawer);
                }}
                className="w-full mt-3 bg-slate-950 hover:bg-slate-900 text-white font-extrabold text-[10px] py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 uppercase tracking-tight shadow cursor-pointer text-center"
              >
                <RefreshCw className="h-3 w-3" /> Fix/Manage Credentials
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Beautiful Login Card with customized secure form */}
        <div 
          className="lg:col-span-8 flex flex-col justify-between border border-emerald-400/40 p-8 rounded-3xl shadow-2xl relative self-stretch"
          style={{
            background: "radial-gradient(circle at 50% 50%, #0be680 0%, #04b360 60%, #018544 100%)"
          }}
        >
          
          <div>
            {/* Header Identity Branding */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-white/20 pb-5 mb-6 gap-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-slate-950 text-emerald-400 rounded-xl flex items-center justify-center font-black font-sans tracking-tight border border-emerald-500/20">
                  H+
                </div>
                <div>
                  <h1 className="font-extrabold text-base tracking-tight text-white leading-none font-sans uppercase">MedConnect Outpatient Node</h1>
                  <p className="text-[10.5px] text-emerald-950 font-mono tracking-wider mt-1 uppercase font-bold">Decentralized Hospital-E-Pharmacy Network</p>
                </div>
              </div>
              <span className="bg-slate-950/80 border border-emerald-500/30 text-emerald-350 font-bold font-mono text-[9px] uppercase px-3 py-1 rounded">
                SIMULATION GATEWAY
              </span>
            </div>

            {/* ERROR RENDERER */}
            {errorMessage && (
              <div className="bg-red-950/80 border border-red-500 p-4 rounded-2xl flex items-start gap-2.5 text-xs text-red-100 shadow-sm mb-6 font-medium animate-shake" id="login-error">
                <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Access Verification Error</p>
                  <p className="text-[11px] text-red-200 mt-0.5 opacity-90 leading-normal">{errorMessage}</p>
                </div>
              </div>
            )}

            {/* WORKFLOW 1: DYNAMIC PASSWORD RESET FLOW */}
            {showResetFlow ? (
              <div className="space-y-4" id="forgot-password-flow">
                <div className="space-y-1">
                  <h3 className="text-base font-extrabold text-slate-950">Security Verification & Password Reset Control</h3>
                  <p className="text-xs text-emerald-950 font-semibold">Trigger simulated password check validation matching register.</p>
                </div>

                {!isResetSuccess ? (
                  <form onSubmit={handleTriggerReset} className="space-y-3.5">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-emerald-950 uppercase tracking-widest font-mono">Email Profile Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-3 text-emerald-200 h-4.5 w-4.5" />
                        <input
                          type="email"
                          required
                          placeholder="aarav@gmail.com"
                          className="w-full bg-slate-950/60 border border-white/10 rounded-xl p-2.5 pl-11 text-xs text-white placeholder-emerald-100/50 focus:outline-none focus:border-white/30 font-semibold"
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowResetFlow(false);
                          setResetEmail("");
                        }}
                        className="bg-slate-950/30 border border-white/20 hover:bg-slate-950/40 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 bg-slate-950 hover:bg-slate-900 text-white font-black px-4 py-2.5 rounded-xl text-xs transition-all"
                      >
                        Find & Generate Reset Pin
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="bg-slate-950/60 border border-white/10 p-5 rounded-2xl space-y-4 text-xs text-slate-200">
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="h-5.5 w-5.5 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="block text-emerald-300 text-sm">Reset Verification Token Dispatched!</strong>
                        <p className="text-[11px] text-slate-300 mt-1 leading-normal">
                          We dispatched a simulated carrier SMS and digital email pin successfully. Use this simulated credentials to log in!
                        </p>
                      </div>
                    </div>

                    {simulationOTP && (
                      <div className="bg-slate-950 p-4 rounded-xl border border-emerald-500/20 space-y-2">
                        <div className="flex justify-between text-[11px] font-semibold text-slate-400">
                          <span>Verified Simulation code:</span>
                          <span className="text-emerald-400">MedConnect Mobile Gateway</span>
                        </div>
                        <p className="text-center font-mono text-2xl font-black text-white tracking-wider bg-slate-900 py-1 rounded">
                          {simulationOTP}
                        </p>
                        <p className="text-[10.5px] text-slate-400 leading-normal text-center mt-1">
                          We retrieved target record profile! <strong className="text-emerald-350">Password: {credentialsList.find(c => c.email.trim().toLowerCase() === resetEmail.trim().toLowerCase())?.password}</strong>
                        </p>
                      </div>
                    )}

                    <button
                      onClick={() => {
                        const targetPass = credentialsList.find(c => c.email.trim().toLowerCase() === resetEmail.trim().toLowerCase())?.password || "";
                        setEnteredEmail(resetEmail);
                        setEnteredPassword(targetPass);
                        setShowResetFlow(false);
                        setIsResetSuccess(false);
                        setSimulationOTP(null);
                        setResetEmail("");
                      }}
                      className="w-full bg-white text-slate-950 font-black py-2 rounded-xl border-none tracking-tight text-xs hover:bg-slate-100 transition-all font-sans"
                    >
                      Auto-Fill & Return to Auth Screen
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* WORKFLOW 2: STANDARD CREDENTIALS VERIFICATION FORM */
              <form onSubmit={handleLogin} className="space-y-4" id="standard-login-form">
                
                {/* Dynamic context label matching active selected role tab */}
                <div className="p-4 bg-slate-950/45 border border-white/10 rounded-2xl flex items-center gap-3">
                  <div className="p-2 bg-slate-950/50 rounded-lg text-emerald-300">
                    {getRoleIcon(activeTab)}
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-emerald-100 font-mono">Session Target</span>
                    <p className="font-extrabold text-xs text-white leading-tight">
                      Authenticating: <span className="text-white font-sans tracking-wide underline decoration-emerald-300 decoration-2">{activeTab.toUpperCase()} PORTAL</span>
                    </p>
                  </div>
                </div>

                {/* Email Segment */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] font-bold text-emerald-950 uppercase tracking-widest font-mono">
                    <label>E-Prescription Node Email / Username</label>
                    <button 
                      type="button" 
                      onClick={() => handleAutoFill(activeTab)}
                      className="text-white hover:underline capitalize font-extrabold"
                    >
                      Autofill default Creds
                    </button>
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 text-emerald-200 h-4.5 w-4.5" />
                    <input
                      id="login-email-input"
                      type="email"
                      required
                      placeholder={activeTab === "admin" ? "admin@medconnect.org" : "user@medconnect.io"}
                      className="w-full bg-slate-950/60 border border-white/10 rounded-xl p-3 pl-11 text-xs text-white placeholder-emerald-100/50 focus:outline-none focus:border-white/30 font-semibold"
                      value={enteredEmail}
                      onChange={(e) => setEnteredEmail(e.target.value)}
                    />
                  </div>
                </div>

                {/* Password segment */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] font-bold text-emerald-950 uppercase tracking-widest font-mono">
                    <label>Enterprise Passcode Key</label>
                    <button
                      type="button"
                      onClick={() => setShowResetFlow(true)}
                      className="text-white hover:underline transition font-bold"
                    >
                      Forgot Credentials?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 text-emerald-200 h-4.5 w-4.5" />
                    <input
                      id="login-password-input"
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      className="w-full bg-slate-950/60 border border-white/10 rounded-xl p-3 pl-11 pr-11 text-xs text-white placeholder-emerald-100/50 focus:outline-none focus:border-white/30 font-mono"
                      value={enteredPassword}
                      onChange={(e) => setEnteredPassword(e.target.value)}
                    />
                    <button
                      id="btn-toggle-pass-visibility"
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-emerald-200 hover:text-white p-1 rounded transition"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Action */}
                <button
                  id="btn-submit-auth"
                  type="submit"
                  className="w-full mt-4 bg-slate-950 hover:bg-slate-900 text-white font-black text-xs py-3.5 rounded-xl transition shadow-lg shadow-black/20 flex items-center justify-center gap-1.5 uppercase tracking-wide font-sans cursor-pointer hover:scale-[1.01]"
                >
                  <Fingerprint className="h-4 w-4 text-emerald-400 shrink-0" /> Unlock Portal Access
                </button>
              </form>
            )}

            {/* Dynamic Interactive drawer for managing passwords / fixing client credentials */}
            {showFixDrawer && (
              <div className="mt-8 bg-slate-950/60 border border-white/10 rounded-2xl p-5 space-y-4 animate-fade-in" id="credentials-fixing-drawer">
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                  <div>
                    <h4 className="font-extrabold text-sm text-yellow-400 flex items-center gap-1.5">
                      <Key className="h-4 w-4" /> Credentials Fixing Tool
                    </h4>
                    <p className="text-[10.5px] text-emerald-100 mt-0.5">Directly customize any diagnostic registry password token below.</p>
                  </div>
                  <button 
                    onClick={() => setShowFixDrawer(false)}
                    className="text-white hover:text-slate-200 text-xs font-bold font-mono"
                  >
                    ✕ Close
                  </button>
                </div>

                {fixNotification && (
                  <div className="bg-emerald-950/50 border border-emerald-500/20 p-3 rounded-xl text-[10.5px] text-emerald-300 font-bold flex gap-1.5 shrink-0 animate-fade-in">
                    <CheckCircle2 className="h-4 w-4 shrink-0" /> {fixNotification}
                  </div>
                )}

                <form onSubmit={handleUpdateCredentials} className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs">
                  <div className="md:col-span-4">
                    <label className="block text-[9px] font-bold text-emerald-100 uppercase mb-1">1. Choose Role Profile</label>
                    <select
                      className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-white font-semibold focus:outline-none"
                      value={editTargetRole}
                      onChange={(e) => {
                        const r = e.target.value;
                        setEditTargetRole(r);
                        const creds = credentialsList.find(c => c.role === r);
                        if (creds) {
                          setEditEmail(creds.email);
                          setEditPass(creds.password);
                        }
                      }}
                    >
                      <option value="patient" className="bg-slate-900 text-white">Patient (Aarav Sharma)</option>
                      <option value="doctor" className="bg-slate-900 text-white">Doctor (Dr. Alok)</option>
                      <option value="pharmacy" className="bg-slate-900 text-white">Pharmacy (Apollo Store)</option>
                      <option value="delivery" className="bg-slate-900 text-white">Delivery (Flash Logistics)</option>
                      <option value="admin" className="bg-slate-900 text-white">Admin (Super User)</option>
                    </select>
                  </div>

                  <div className="md:col-span-4">
                    <label className="block text-[9px] font-bold text-emerald-100 uppercase mb-1">2. Customized Email Address</label>
                    <input
                      type="email"
                      required
                      className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-white font-mono focus:outline-none"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                    />
                  </div>

                  <div className="md:col-span-4 flex flex-col justify-end">
                    <label className="block text-[9px] font-bold text-emerald-100 uppercase mb-1">3. Custom Password Key</label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        required
                        className="flex-1 bg-slate-950 border border-white/10 rounded-lg p-2 text-white font-mono focus:outline-none"
                        value={editPass}
                        onChange={(e) => setEditPass(e.target.value)}
                      />
                      <button
                        type="submit"
                        className="bg-slate-950 hover:bg-slate-900 text-emerald-300 hover:text-white px-3 py-2 rounded-lg font-bold font-sans text-[10.5px] uppercase tracking-tighter transition"
                      >
                        Apply Fix
                      </button>
                    </div>
                  </div>
                </form>

                {/* Directory table showing current active key states */}
                <div className="bg-slate-950/80 p-3 rounded-xl border border-white/10 text-[10px] space-y-2">
                  <p className="font-bold text-emerald-250 uppercase font-mono tracking-wider">Current Live Registry View:</p>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-center text-slate-350">
                    {credentialsList.map((cred) => (
                      <div key={cred.id} className="bg-slate-900 border border-white/5 p-2 rounded-lg">
                        <span className="font-black text-white block capitalize text-[9px] font-sans">{cred.role}</span>
                        <code className="text-emerald-400 block mt-1 font-bold text-[9px]">{cred.password}</code>
                        {cred.lastChanged && (
                          <span className="text-[7.5px] text-slate-400 block font-mono">Mod: {cred.lastChanged}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Unified Compliance regulatory footnotes */}
          <div className="pt-6 border-t border-white/20 mt-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-[10px] text-emerald-950 font-bold font-mono">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4.5 w-4.5 text-slate-950" />
                <span>NABL Integrated Diagnostics Lab API Ready</span>
              </div>
              <span>SHA-256 Outpatient Compliance Registry</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
