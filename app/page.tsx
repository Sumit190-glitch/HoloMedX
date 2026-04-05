"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';
import ThreeViewer from '@/components/ThreeViewer';
import { UploadCloud, AlertTriangle, Cpu, Home, ArrowRight, Wand2, Download, Zap, Shield, Layers, Code2 } from 'lucide-react';

type ClashResult = {
  id: string;
  element_a_id: string;
  element_b_id: string;
  severity: "critical" | "major" | "minor" | "clear";
  clash_type: "hard" | "soft";
  distance_mm: number;
  required_distance_mm: number;
  summary: string;
};

export default function App() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
  const [activeView, setActiveView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Pipeline Simulation State
  const [workflowStage, setWorkflowStage] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [clashStatus, setClashStatus] = useState<"critical" | "rerouted" | "clear">("clear");
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [fileType, setFileType] = useState<"ifc" | "rvt" | null>(null);
  const [previewSupported, setPreviewSupported] = useState(true);
  const [clashes, setClashes] = useState<ClashResult[]>([]);
  const [stats, setStats] = useState<Record<string, number> | null>(null);
  const [rerouteSummary, setRerouteSummary] = useState<string | null>(null);
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    setUploadError(null);
    setClashes([]);
    setStats(null);
    setRerouteSummary(null);
    setDownloadUrl(null);
    setUploadedFileName(file.name);

    const extension = file.name.toLowerCase().endsWith(".rvt") ? "rvt" : "ifc";
    setFileType(extension);
    setPreviewSupported(extension === "ifc");
    setModelUrl(extension === "ifc" ? URL.createObjectURL(file) : null);
    setActiveView('viewer');
    setWorkflowStage(1);
    setClashStatus("clear");
    setStatusMessage(`1. Uploading ${extension.toUpperCase()} model to local backend...`);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await axios.post(`${API_URL}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setActiveJobId(uploadResponse.data.job_id);
      setFileType(uploadResponse.data.file_type);
      setPreviewSupported(Boolean(uploadResponse.data.preview_supported));
      setStats(uploadResponse.data.stats || null);
      setWorkflowStage(2);
      setStatusMessage(`2. Backend accepted ${file.name} and started structural analysis...`);

      const clashResponse = await axios.post(`${API_URL}/detect-clashes/${uploadResponse.data.job_id}`);
      setClashes(clashResponse.data.clashes || []);
      setStats(clashResponse.data.stats || uploadResponse.data.stats || null);
      setWorkflowStage(3);
      setClashStatus((clashResponse.data.clashes || []).some((clash: ClashResult) => clash.severity === "critical") ? "critical" : "clear");
      setStatusMessage("3. Analysis complete. Clash results are ready for review and rerouting.");
    } catch (error) {
      setUploadError("Upload failed. Check that the backend is running on localhost:8000.");
      setStatusMessage("Upload failed. Backend connection or processing error.");
      setWorkflowStage(0);
    }
  };

  const executeOpenSourceRerouting = async () => {
    if (!activeJobId) {
      setUploadError("Please upload a model first.");
      return;
    }

    setWorkflowStage(4);
    setStatusMessage("4. AI Math Engine calculating detours honoring 1:100 slope and 150mm clearance...");

    try {
      const rerouteResponse = await axios.post(`${API_URL}/reroute/${activeJobId}`);
      setDownloadUrl(rerouteResponse.data.output_rvt_url || null);
      setRerouteSummary(rerouteResponse.data.summary || null);
      setTimeout(() => {
          setWorkflowStage(5);
          setClashStatus("rerouted");
          setStatusMessage("5. Remodeling complete. Local workflow finished and reroute result generated.");
      }, 1500);
    } catch (error) {
      setUploadError("Reroute failed. The backend could not finish the remodel request.");
      setStatusMessage("Reroute failed. Please retry after checking the backend window.");
      setWorkflowStage(3);
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 font-sans text-slate-100 overflow-hidden">
      
      {/* Sidebar Component */}
      <aside className={`w-72 border-r border-slate-800 glass-panel flex flex-col transition-all duration-300 ${!sidebarOpen ? '-ml-72' : ''}`}>
        <div className="p-6 border-b border-slate-800 flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-500 shadow-[0_0_15px_rgba(56,189,248,0.5)]" />
          <h1 className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
            OpenBIM Rerouter
          </h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => setActiveView('dashboard')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg ${activeView === 'dashboard' ? 'bg-sky-500/10 text-sky-400' : 'text-slate-400'}`}>
            <Home size={20} /><span>Project Dashboard</span>
          </button>
          <button onClick={() => setActiveView('viewer')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg ${activeView === 'viewer' ? 'bg-sky-500/10 text-sky-400' : 'text-slate-400'}`}>
            <Cpu size={20} /><span>3D WebXR View</span>
          </button>
          <button onClick={() => setActiveView('upload')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg ${activeView === 'upload' ? 'bg-sky-500/10 text-sky-400' : 'text-slate-400'}`}>
            <UploadCloud size={20} /><span>Upload Model</span>
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative">
        <header className="h-20 glass-panel border-b border-slate-800 flex items-center justify-between px-8">
          <div>
            <div className="text-sm font-mono text-sky-400 animate-pulse">
              {statusMessage && `> ${statusMessage}`}
            </div>
            {uploadError && (
              <div className="mt-1 text-sm text-rose-400">{uploadError}</div>
            )}
          </div>
          <button onClick={executeOpenSourceRerouting} disabled={workflowStage !== 3} className={`px-6 py-2 rounded-lg font-medium shadow-lg transition-all flex items-center space-x-2 ${workflowStage === 3 ? 'bg-gradient-to-r from-sky-500 to-indigo-500 text-white' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}>
            <Wand2 size={18} /><span>Analyze & Fix Pipeline</span>
          </button>
        </header>

        <div className="flex-1 p-8 overflow-y-auto">
          {activeView === 'dashboard' && (
             <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                {/* Hero Section */}
                <div className="relative overflow-hidden rounded-3xl glass-panel p-12 border border-slate-800/60 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 shadow-2xl">
                    {/* Glowing Orbs */}
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-sky-600/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4 pointer-events-none" />
                    
                    <div className="relative z-10 flex flex-col xl:flex-row items-center justify-between gap-12">
                        <div className="flex-1 space-y-8">
                            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-sm font-semibold tracking-wide">
                                <Zap size={16} className="animate-pulse text-amber-400" />
                                <span>Version 2.0 - 100% Free OpenBIM Core</span>
                            </div>
                            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
                                Automate MEP <br/>
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-400 to-purple-400 drop-shadow-sm">
                                   Clash Resolution.
                                </span>
                            </h1>
                            <p className="text-xl text-slate-400 max-w-2xl leading-relaxed">
                                Bypass Autodesk APS tokens entirely. Upload native <strong className="text-white bg-slate-800 px-2 py-1 rounded">.RVT</strong> or <strong className="text-white bg-slate-800 px-2 py-1 rounded">.IFC</strong> files and let our backend Python math engine physically reconstruct pipe networks around collisions.
                            </p>
                            <div className="pt-4 flex flex-wrap items-center gap-4">
                                <button onClick={() => setActiveView('upload')} className="bg-white text-slate-950 hover:bg-slate-200 px-8 py-4 rounded-xl font-bold transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)] flex items-center space-x-3 group">
                                    <span>Initialize Engine</span>
                                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                                <button onClick={() => setActiveView('viewer')} className="glass-panel hover:bg-slate-800/80 text-white px-8 py-4 rounded-xl font-bold transition-all border border-slate-700 hover:border-slate-500">
                                    View 3D Matrix
                                </button>
                            </div>
                        </div>
                        
                        {/* Hero Stats */}
                        <div className="w-full xl:w-5/12 grid grid-cols-2 gap-4">
                            <div className="glass-panel p-6 lg:p-8 rounded-2xl border border-slate-800/60 bg-black/40 backdrop-blur-xl shadow-lg hover:-translate-y-1 transition-transform">
                                <div className="text-sky-400 mb-3"><Shield size={28} /></div>
                                <div className="text-4xl font-black text-white mb-1">$0</div>
                                <div className="text-xs text-slate-400 font-bold tracking-widest uppercase">Cloud Billing</div>
                            </div>
                            <div className="glass-panel p-6 lg:p-8 rounded-2xl border border-slate-800/60 bg-black/40 backdrop-blur-xl shadow-lg hover:-translate-y-1 transition-transform">
                                <div className="text-indigo-400 mb-3"><Wand2 size={28} /></div>
                                <div className="text-4xl font-black text-white mb-1">~0.4s</div>
                                <div className="text-xs text-slate-400 font-bold tracking-widest uppercase">AI Reroute Time</div>
                            </div>
                            <div className="glass-panel p-6 lg:p-8 rounded-2xl border border-slate-800/60 bg-black/40 backdrop-blur-xl shadow-lg hover:-translate-y-1 transition-transform">
                                <div className="text-purple-400 mb-3"><Layers size={28} /></div>
                                <div className="text-4xl font-black text-white mb-1">AABB</div>
                                <div className="text-xs text-slate-400 font-bold tracking-widest uppercase">Collision Engine</div>
                            </div>
                            <div className="glass-panel p-6 lg:p-8 rounded-2xl border border-slate-800/60 bg-black/40 backdrop-blur-xl shadow-lg hover:-translate-y-1 transition-transform">
                                <div className="text-emerald-400 mb-3"><Code2 size={28} /></div>
                                <div className="text-4xl font-black text-white mb-1">Local</div>
                                <div className="text-xs text-slate-400 font-bold tracking-widest uppercase">Python Backend</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Architecture Feature Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="glass-panel p-8 rounded-3xl border border-slate-800 hover:border-sky-500/30 transition-all group overflow-hidden relative shadow-lg hover:shadow-sky-500/10">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-sky-500/10 rounded-full blur-3xl group-hover:bg-sky-500/20 transition-colors" />
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-3">
                            <span className="w-10 h-10 rounded-lg bg-sky-500/20 flex items-center justify-center text-sky-400"><Cpu size={20} /></span>
                            <span>AABB Math Engine</span>
                        </h3>
                        <p className="text-slate-400 leading-relaxed text-sm">We abandoned standard Navisworks Navigators for pure mathematical Axis-Aligned Bounding Box (AABB) intersection detection natively compiled in local memory for zero latency.</p>
                    </div>
                    
                    <div className="glass-panel p-8 rounded-3xl border border-slate-800 hover:border-indigo-500/30 transition-all group overflow-hidden relative shadow-lg hover:shadow-indigo-500/10">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-colors" />
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-3">
                            <span className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400"><Layers size={20} /></span>
                            <span>IfcOpenShell Wrapper</span>
                        </h3>
                        <p className="text-slate-400 leading-relaxed text-sm">Direct geometry extraction without intermediate web APIs. Our pipeline parses strict physical representations and generates constraint-bound 1:100 slope detour maps dynamically.</p>
                    </div>
                    
                    <div className="glass-panel p-8 rounded-3xl border border-slate-800 hover:border-purple-500/30 transition-all group overflow-hidden relative shadow-lg hover:shadow-purple-500/10">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-colors" />
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-3">
                            <span className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400"><UploadCloud size={20} /></span>
                            <span>Universal Ingestion</span>
                        </h3>
                        <p className="text-slate-400 leading-relaxed text-sm">Directly upload both Autodesk .RVT and generic Industry Foundation Classes (.IFC) without preprocessing. We automatically normalize the BIM node structural hierarchies.</p>
                    </div>
                </div>
             </div>
          )}

          {activeView === 'viewer' && (
             <div className="h-full flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-white">Three.js / React-Three-Fiber WebGL</h2>
                        <p className="text-sm text-slate-400">Open this app at http://localhost:3000. IFC files get a local 3D preview, while RVT files still upload and return analysis results.</p>
                    </div>
                    {workflowStage === 5 && (
                        <button className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded flex items-center space-x-2" disabled={!downloadUrl}>
                            <Download size={18} /> <span>Download Remodeled Output (.ifc)</span>
                        </button>
                    )}
                </div>
                {uploadedFileName && (
                    <div className="glass-panel rounded-xl p-4">
                        <div className="text-xs uppercase tracking-wide text-slate-400">Uploaded File</div>
                        <div className="mt-2 text-lg font-semibold text-white">{uploadedFileName}</div>
                        <div className="mt-1 text-sm text-slate-400">
                            File type: {fileType?.toUpperCase() ?? "Unknown"} {previewSupported ? "| 3D preview enabled" : "| analysis-only local mode"}
                        </div>
                    </div>
                )}
                {fileType === "rvt" && (
                    <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                        RVT upload is accepted for local analysis. Direct browser preview is not available here, so the viewer shows a placeholder while clash detection and reroute results are generated.
                    </div>
                )}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="glass-panel rounded-xl p-4">
                            <div className="text-xs uppercase tracking-wide text-slate-400">Elements Scanned</div>
                            <div className="mt-2 text-2xl font-bold text-white">{stats.elements_scanned ?? 0}</div>
                        </div>
                        <div className="glass-panel rounded-xl p-4">
                            <div className="text-xs uppercase tracking-wide text-slate-400">Critical Clashes</div>
                            <div className="mt-2 text-2xl font-bold text-rose-400">{stats.critical_clashes ?? 0}</div>
                        </div>
                        <div className="glass-panel rounded-xl p-4">
                            <div className="text-xs uppercase tracking-wide text-slate-400">Major Clashes</div>
                            <div className="mt-2 text-2xl font-bold text-amber-300">{stats.major_clashes ?? 0}</div>
                        </div>
                        <div className="glass-panel rounded-xl p-4">
                            <div className="text-xs uppercase tracking-wide text-slate-400">Reroute Candidates</div>
                            <div className="mt-2 text-2xl font-bold text-emerald-400">{stats.reroute_candidates ?? 0}</div>
                        </div>
                    </div>
                )}
                {workflowStage >= 2 ? (
                    <ThreeViewer clash_status={clashStatus} modelUrl={previewSupported ? modelUrl : null} />
                ) : (
                    <div className="flex-1 glass-panel rounded-xl flex items-center justify-center text-slate-500">Waiting for Upload...</div>
                )}
                {clashes.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {clashes.map((clash) => (
                            <div key={clash.id} className="glass-panel rounded-xl p-4">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="text-base font-semibold text-white">{clash.element_a_id} vs {clash.element_b_id}</div>
                                    <div className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${clash.severity === "critical" ? "bg-rose-500/20 text-rose-300" : "bg-amber-500/20 text-amber-200"}`}>
                                        {clash.severity}
                                    </div>
                                </div>
                                <div className="mt-3 inline-flex rounded-full bg-sky-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-300">
                                    {clash.clash_type} clash
                                </div>
                                <p className="mt-3 text-sm text-slate-300">{clash.summary}</p>
                                <div className="mt-3 text-sm text-slate-400">
                                    Clearance delta: {clash.distance_mm} mm, required: {clash.required_distance_mm} mm
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {rerouteSummary && (
                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                        {rerouteSummary}
                    </div>
                )}
             </div>
          )}

          {activeView === 'upload' && (
            <div className="h-full flex flex-col items-center justify-center">
               <div className="glass-panel p-12 rounded-3xl text-center max-w-lg w-full">
                  <UploadCloud size={40} className="mx-auto text-sky-400 mb-6" />
                  <h3 className="text-2xl font-bold text-white mb-2">Initialize Architecture Flow</h3>
                  <p className="text-slate-400 mb-4">Use one common local link: http://localhost:3000</p>
                  <p className="text-slate-400 mb-8">Upload `.IFC` for local preview or `.RVT` for local clash analysis and reroute results.</p>
                  
                  <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-white px-8 py-4 rounded-xl border border-slate-700 transition-colors block w-full">
                    <span>Upload & Convert (.RVT / .IFC)</span>
                    <input type="file" className="hidden" onChange={handleFileUpload} accept=".ifc,.rvt" />
                  </label>
               </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
