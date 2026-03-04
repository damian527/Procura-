import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://mhztlmgycnmszhoipsef.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1oenRsbWd5Y25tc3pob2lwc2VmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1ODYyMDksImV4cCI6MjA4ODE2MjIwOX0.sbcQENEDMOeXTUr_PhHZMOhYYZBsuPFddwE-5-Q6220";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const ANALYSTS = [
  { id: "MM", name: "Miguel Mendieta", color: "#3b82f6", bg: "#1e3a5f" },
  { id: "LP", name: "Laura Pérez",     color: "#8b5cf6", bg: "#1c1a40" },
  { id: "CR", name: "Carlos Ruiz",     color: "#10b981", bg: "#0c2e1e" },
  { id: "JG", name: "Juliana García",  color: "#f59e0b", bg: "#2e1f08" },
];

const STAGES = [
  { id: "radicada",    label: "Radicada",    icon: "📋", color: "#94a3b8", sla: 1 },
  { id: "revision",   label: "Revisión",    icon: "🔍", color: "#c084fc", sla: 1 },
  { id: "cotizando",  label: "Cotizando",   icon: "📤", color: "#06b6d4", sla: 5 },
  { id: "cotizada",   label: "Cotizada",    icon: "📬", color: "#f59e0b", sla: 1 },
  { id: "comparativo",label: "Comparativo", icon: "📊", color: "#f97316", sla: 1 },
  { id: "aprobada",   label: "Aprobada",    icon: "✅", color: "#10b981", sla: 2 },
  { id: "oc",         label: "OC SINCO",    icon: "🏷️", color: "#0ea5e9", sla: 1 },
];

const SINCO_STEPS = [
  { id: 1, label: "Solicitud\nCompra",     icon: "📋" },
  { id: 2, label: "Aprobación\nSC",       icon: "✅" },
  { id: 3, label: "Selección\nProveedor", icon: "🔍" },
  { id: 4, label: "Generación\nOC",       icon: "📝" },
  { id: 5, label: "Envío\nProveedor",     icon: "📤" },
  { id: 6, label: "Recepción\nMaterial",  icon: "📦" },
];

const stageToSinco = { radicada:1, revision:1, cotizando:2, cotizada:2, comparativo:3, aprobada:4, oc:5 };
const EMPTY_RQ = { id:"", descripcion:"", cwa:"", cwp:"", iwp:"", analyst:"MM", stage:"radicada", oc:"", observations:"", stage_history:[] };
const C = { bg:"#07090f", bg2:"#0d1118", surface:"#111827", border:"#1f2d45", text:"#e2e8f0", muted:"#94a3b8", dim:"#475569" };

function nowISO() { return new Date().toISOString(); }
function slaInfo(rq) {
  const si = STAGES.findIndex(s => s.id === rq.stage);
  const entry = (rq.stage_history||[]).find(h => h.stage === rq.stage);
  const entered = entry ? new Date(entry.ts) : new Date(rq.created_at || Date.now());
  const spent = (Date.now() - entered.getTime()) / 3600000;
  const limit = (STAGES[si]?.sla || 1) * 8;
  if (spent >= limit)       return { bg:"#2e0c0c", text:"#ef4444", label:`🔴 +${(spent-limit).toFixed(0)}h` };
  if (spent >= limit * 0.8) return { bg:"#2e1f08", text:"#f59e0b", label:`⚡ ${(limit-spent).toFixed(0)}h` };
  return                           { bg:"#0c2e1e", text:"#10b981", label:`✓ ${(limit-spent).toFixed(0)}h` };
}
function getAnalyst(id) { return ANALYSTS.find(a => a.id === id) || ANALYSTS[0]; }
function getStage(id)   { return STAGES.find(s => s.id === id)   || STAGES[0]; }
function nextId(rqs) {
  const nums = rqs.map(r => parseInt((r.id||"").split("-")[2]||"0")).filter(Boolean);
  return `RQ-${new Date().getFullYear()}-${String((nums.length?Math.max(...nums):0)+1).padStart(3,"0")}`;
}
function useWidth() {
  const [w, setW] = useState(window.innerWidth);
  useEffect(() => { const h=()=>setW(window.innerWidth); window.addEventListener("resize",h); return()=>window.removeEventListener("resize",h); },[]);
  return w;
}

const iS = { width:"100%", background:C.bg2, border:`1px solid ${C.border}`, borderRadius:8, padding:"10px 12px", color:C.text, fontFamily:"inherit", fontSize:"16px", outline:"none", boxSizing:"border-box" };
const sS = { ...iS, cursor:"pointer" };

function Avatar({ id, size=24 }) {
  const a = getAnalyst(id);
  return <div style={{ width:size, height:size, borderRadius:size/4, background:a.bg, color:a.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:size*0.38, fontWeight:700, flexShrink:0 }}>{a.id}</div>;
}
function SlaBadge({ rq }) {
  const c = slaInfo(rq);
  return <span style={{ fontSize:"0.65rem", fontWeight:700, padding:"3px 8px", borderRadius:4, background:c.bg, color:c.text, whiteSpace:"nowrap" }}>{c.label}</span>;
}
function Modal({ title, onClose, children }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.8)", zIndex:9999, display:"flex", alignItems:"flex-end", justifyContent:"center" }} onClick={onClose}>
      <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:"16px 16px 0 0", width:"100%", maxWidth:600, maxHeight:"92vh", overflow:"auto", boxShadow:"0 -8px 40px rgba(0,0,0,0.6)" }} onClick={e=>e.stopPropagation()}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 20px", borderBottom:`1px solid ${C.border}`, position:"sticky", top:0, background:C.surface }}>
          <span style={{ fontWeight:700, fontSize:"1rem" }}>{title}</span>
          <button onClick={onClose} style={{ background:"none", border:"none", color:C.muted, fontSize:"1.3rem", cursor:"pointer" }}>✕</button>
        </div>
        <div style={{ padding:20 }}>{children}</div>
      </div>
    </div>
  );
}
function Field({ label, children, required }) {
  return (
    <div style={{ marginBottom:14 }}>
      <label style={{ display:"block", fontSize:"0.72rem", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", color:C.dim, marginBottom:5 }}>
        {label}{required && <span style={{ color:"#ef4444" }}> *</span>}
      </label>
      {children}
    </div>
  );
}
function RQForm({ initial, onSave, onClose, allRqs }) {
  const [form, setForm] = useState({ ...EMPTY_RQ, ...initial });
  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  async function handleSave() {
    if (!form.descripcion.trim()) { alert("La descripción es requerida"); return; }
    const isNew = !form.id;
    const id = isNew ? nextId(allRqs) : form.id;
    const now = nowISO();
    const history = form.stage_history?.length ? form.stage_history : [{ stage:form.stage, ts:now }];
    await onSave({ ...form, id, created_at:form.created_at||now, stage_history:history });
    onClose();
  }
  return (
    <>
      <Field label="Descripción" required>
        <input style={iS} value={form.descripcion} onChange={e=>set("descripcion",e.target.value)} placeholder="Ej: Válvulas de control" />
      </Field>
      <Field label="Analista Responsable" required>
        <select style={sS} value={form.analyst} onChange={e=>set("analyst",e.target.value)}>
          {ANALYSTS.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
      </Field>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
        <Field label="CWA"><input style={iS} value={form.cwa} onChange={e=>set("cwa",e.target.value)} placeholder="CWA-001"/></Field>
        <Field label="CWP"><input style={iS} value={form.cwp} onChange={e=>set("cwp",e.target.value)} placeholder="CWP-01A"/></Field>
        <Field label="IWP"><input style={iS} value={form.iwp} onChange={e=>set("iwp",e.target.value)} placeholder="IWP-01"/></Field>
      </div>
      <Field label="Estado Inicial">
        <select style={sS} value={form.stage} onChange={e=>set("stage",e.target.value)}>
          {STAGES.map(s=><option key={s.id} value={s.id}>{s.icon} {s.label}</option>)}
        </select>
      </Field>
      <Field label="Observaciones">
        <textarea style={{ ...iS, minHeight:72, resize:"vertical" }} value={form.observations} onChange={e=>set("observations",e.target.value)} placeholder="Notas, motivo de retraso..."/>
      </Field>
      <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
        <button onClick={onClose} style={{ background:C.bg2, border:`1px solid ${C.border}`, borderRadius:8, color:C.muted, padding:"11px 20px", fontFamily:"inherit", fontWeight:600, cursor:"pointer" }}>Cancelar</button>
        <button onClick={handleSave} style={{ background:"#3b82f6", border:"none", borderRadius:8, color:"#fff", padding:"11px 24px", fontFamily:"inherit", fontWeight:700, cursor:"pointer" }}>💾 Guardar</button>
      </div>
    </>
  );
}
function AdvanceModal({ rq, onAdvance, onClose }) {
  const si = STAGES.findIndex(s=>s.id===rq.stage);
  const next = STAGES[si+1];
  const [obs, setObs] = useState("");
  const [oc, setOc] = useState(rq.oc||"");
  if (!next) return (
    <Modal title="Estado Final" onClose={onClose}>
      <p style={{ color:C.muted, marginBottom:20 }}>Esta RQ llegó al estado final: <b>OC SINCO</b> 🏁</p>
      <button onClick={onClose} style={{ background:"#3b82f6", border:"none", borderRadius:8, color:"#fff", padding:"11px 24px", fontFamily:"inherit", fontWeight:700, cursor:"pointer" }}>Cerrar</button>
    </Modal>
  );
  return (
    <Modal title={`Avanzar ${rq.id}`} onClose={onClose}>
      <div style={{ background:C.bg2, border:`1px solid ${C.border}`, borderRadius:12, padding:16, marginBottom:16, display:"flex", alignItems:"center", gap:16 }}>
        <div style={{ textAlign:"center" }}><div style={{ fontSize:"2rem" }}>{getStage(rq.stage).icon}</div><div style={{ fontSize:"0.7rem", color:C.dim, marginTop:3 }}>{getStage(rq.stage).label}</div></div>
        <div style={{ fontSize:"2rem", color:"#3b82f6" }}>→</div>
        <div style={{ textAlign:"center" }}><div style={{ fontSize:"2rem" }}>{next.icon}</div><div style={{ fontSize:"0.7rem", color:next.color, marginTop:3, fontWeight:700 }}>{next.label}</div></div>
        <div style={{ marginLeft:"auto" }}><SlaBadge rq={rq}/></div>
      </div>
      {next.id==="oc" && <Field label="N° OC SINCO" required><input style={iS} value={oc} onChange={e=>setOc(e.target.value)} placeholder="Ej: OC-10051"/></Field>}
      <Field label="Observación (opcional)">
        <textarea style={{ ...iS, minHeight:72, resize:"vertical" }} value={obs} onChange={e=>setObs(e.target.value)} placeholder="Describe el resultado de esta etapa..."/>
      </Field>
      <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
        <button onClick={onClose} style={{ background:C.bg2, border:`1px solid ${C.border}`, borderRadius:8, color:C.muted, padding:"11px 20px", fontFamily:"inherit", fontWeight:600, cursor:"pointer" }}>Cancelar</button>
        <button onClick={()=>{ onAdvance(next.id,obs,oc); onClose(); }} style={{ background:"#10b981", border:"none", borderRadius:8, color:"#fff", padding:"11px 24px", fontFamily:"inherit", fontWeight:700, cursor:"pointer" }}>✅ Confirmar</button>
      </div>
    </Modal>
  );
}
function RQCard({ rq, onAdvance, onEdit, onDelete }) {
  const st = getStage(rq.stage);
  return (
    <div style={{ background:C.bg2, border:`1px solid ${C.border}`, borderRadius:12, padding:14, marginBottom:10 }}>
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:8 }}>
        <div><div style={{ fontFamily:"monospace", fontSize:"0.72rem", color:"#3b82f6", fontWeight:600, marginBottom:3 }}>{rq.id}</div>
          <div style={{ fontWeight:600, fontSize:"0.9rem", lineHeight:1.3 }}>{rq.descripcion}</div></div>
        <SlaBadge rq={rq}/>
      </div>
      {rq.observations && <div style={{ fontSize:"0.75rem", color:C.dim, marginBottom:8, fontStyle:"italic" }}>{rq.observations}</div>}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:6 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <Avatar id={rq.analyst} size={22}/>
          <span style={{ fontSize:"0.75rem", color:C.muted }}>{getAnalyst(rq.analyst).name.split(" ")[0]}</span>
          <span style={{ fontSize:"0.75rem", fontWeight:600, color:st.color }}>{st.icon} {st.label}</span>
        </div>
        <div style={{ display:"flex", gap:6 }}>
          <button onClick={()=>onAdvance(rq)} style={{ background:"#1e3a5f", border:"none", borderRadius:8, color:"#3b82f6", padding:"7px 14px", fontFamily:"inherit", fontWeight:700, fontSize:"0.8rem", cursor:"pointer" }}>▶ Avanzar</button>
          <button onClick={()=>onEdit(rq)} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:8, color:C.muted, padding:"7px 10px", cursor:"pointer" }}>✏️</button>
          <button onClick={()=>onDelete(rq.id)} style={{ background:"#2e0c0c", border:"none", borderRadius:8, color:"#ef4444", padding:"7px 10px", cursor:"pointer" }}>🗑</button>
        </div>
      </div>
      {rq.oc && <div style={{ marginTop:8, paddingTop:8, borderTop:`1px solid ${C.border}`, fontFamily:"monospace", fontSize:"0.72rem", color:"#0ea5e9" }}>OC: {rq.oc}</div>}
    </div>
  );
}

export default function App() {
  const [rqs,setRqs]=useState([]); const [activity,setActivity]=useState([]);
  const [view,setView]=useState("dashboard"); const [showNew,setShowNew]=useState(false);
  const [editRQ,setEditRQ]=useState(null); const [advRQ,setAdvRQ]=useState(null);
  const [detailRQ,setDetailRQ]=useState(null); const [fAnalyst,setFAnalyst]=useState("all");
  const [fStage,setFStage]=useState("all"); const [loading,setLoading]=useState(true);
  const [navOpen,setNavOpen]=useState(false); const [,setTick]=useState(0);
  const width = useWidth();
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;

  useEffect(()=>{ loadData(); const t=setInterval(()=>setTick(x=>x+1),30000); return()=>clearInterval(t); },[]);

  async function loadData() {
    setLoading(true);
    const { data:r } = await supabase.from("requisiciones").select("*").order("created_at",{ascending:false});
    const { data:a } = await supabase.from("actividad").select("*").order("created_at",{ascending:false}).limit(40);
    if(r) setRqs(r); if(a) setActivity(a); setLoading(false);
  }
  async function addLog(msg) {
    const { data } = await supabase.from("actividad").insert([{msg,created_at:nowISO()}]).select();
    if(data) setActivity(a=>[data[0],...a].slice(0,40));
  }
  async function saveRQ(rq) {
    const isNew = !rqs.find(r=>r.id===rq.id);
    if(isNew){ const{data}=await supabase.from("requisiciones").insert([rq]).select(); if(data) setRqs(p=>[data[0],...p]); }
    else{ const{data}=await supabase.from("requisiciones").update(rq).eq("id",rq.id).select(); if(data) setRqs(p=>p.map(r=>r.id===rq.id?data[0]:r)); }
    await addLog(isNew?`${getAnalyst(rq.analyst).name} radicó ${rq.id} — "${rq.descripcion}"`:
      `${getAnalyst(rq.analyst).name} editó ${rq.id}`);
  }
  async function advanceStage(rq,nextStage,obs,oc) {
    const now=nowISO();
    const updated={...rq,stage:nextStage,oc:oc||rq.oc,observations:obs||rq.observations,
      stage_history:[...(rq.stage_history||[]),{stage:nextStage,ts:now}]};
    const{data}=await supabase.from("requisiciones").update(updated).eq("id",rq.id).select();
    if(data){ setRqs(p=>p.map(r=>r.id===rq.id?data[0]:r)); if(detailRQ?.id===rq.id) setDetailRQ(data[0]); }
    await addLog(`${getAnalyst(rq.analyst).name} avanzó ${rq.id} → ${getStage(nextStage).icon} ${getStage(nextStage).label}${obs?` · "${obs}"`:"" }`);
  }
  async function deleteRQ(id) {
    if(!window.confirm(`¿Eliminar ${id}?`)) return;
    await supabase.from("requisiciones").delete().eq("id",id);
    setRqs(p=>p.filter(r=>r.id!==id)); await addLog(`RQ ${id} eliminada`);
  }

  const filtered=rqs.filter(r=>(fAnalyst==="all"||r.analyst===fAnalyst)&&(fStage==="all"||r.stage===fStage));
  const slaOver=rqs.filter(r=>slaInfo(r).text==="#ef4444");
  const slaWarn=rqs.filter(r=>slaInfo(r).text==="#f59e0b");
  function aStats(aid){ const mine=rqs.filter(r=>r.analyst===aid); const over=mine.filter(r=>slaInfo(r).text==="#ef4444");
    return{total:mine.length,over:over.length,pct:mine.length?Math.round((1-over.length/mine.length)*100):100,mine}; }

  const navItems=[{id:"dashboard",icon:"📊",label:"Dashboard"},{id:"kanban",icon:"🔄",label:"Kanban"},
    {id:"analistas",icon:"👥",label:"Analistas"},{id:"sinco",icon:"🔗",label:"SINCO"},{id:"actividad",icon:"⚡",label:"Actividad"}];
  const viewTitles={dashboard:"Panel de Control",kanban:"Pipeline Kanban",analistas:"Analistas",sinco:"SINCO ERP",actividad:"Actividad"};
  function navigate(id){ setView(id); setNavOpen(false); }
  const card={background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,overflow:"hidden",marginBottom:14};
  const btn=(bg,c="#fff",ex={})=>({background:bg,border:"none",borderRadius:8,color:c,padding:"10px 18px",fontFamily:"inherit",fontWeight:700,fontSize:"0.85rem",cursor:"pointer",display:"inline-flex",alignItems:"center",gap:6,...ex});

  if(loading) return(
    <div style={{background:C.bg,color:C.text,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16,fontFamily:"sans-serif"}}>
      <div style={{fontSize:"3rem"}}>⚙️</div><div style={{fontSize:"1.1rem",fontWeight:600}}>Conectando con Supabase...</div>
    </div>
  );

  return(
    <div style={{fontFamily:"'Segoe UI',system-ui,sans-serif",background:C.bg,color:C.text,minHeight:"100vh",display:"flex",flexDirection:"column",fontSize:14}}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}} *{box-sizing:border-box;-webkit-tap-highlight-color:transparent} ::-webkit-scrollbar{width:4px;height:4px} ::-webkit-scrollbar-thumb{background:#1f2d45;border-radius:2px}`}</style>

      {/* MOBILE HEADER */}
      {isMobile&&(
        <header style={{background:C.bg2,borderBottom:`1px solid ${C.border}`,padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100}}>
          <div style={{fontSize:"1rem",fontWeight:800,background:"linear-gradient(135deg,#3b82f6,#06b6d4)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>ProcuraControl</div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            {slaOver.length>0&&<span style={{background:"#ef4444",color:"#fff",fontSize:"0.65rem",fontWeight:700,padding:"2px 7px",borderRadius:10}}>{slaOver.length}</span>}
            <button onClick={()=>setShowNew(true)} style={{background:"#3b82f6",border:"none",borderRadius:8,color:"#fff",padding:"8px 14px",fontFamily:"inherit",fontWeight:700,fontSize:"0.8rem",cursor:"pointer"}}>+ RQ</button>
          </div>
        </header>
      )}

      <div style={{display:"flex",flex:1}}>
        {/* SIDEBAR desktop/tablet */}
        {!isMobile&&(
          <aside style={{width:isTablet?60:190,flexShrink:0,background:C.bg2,borderRight:`1px solid ${C.border}`,display:"flex",flexDirection:"column",position:"sticky",top:0,height:"100vh"}}>
            {!isTablet&&(
              <div style={{padding:"16px 14px 12px",borderBottom:`1px solid ${C.border}`}}>
                <div style={{fontSize:"1rem",fontWeight:800,background:"linear-gradient(135deg,#3b82f6,#06b6d4)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>ProcuraControl</div>
                <div style={{fontSize:"0.6rem",color:C.dim,marginTop:2,letterSpacing:"0.08em",textTransform:"uppercase"}}>🟢 Supabase</div>
              </div>
            )}
            <nav style={{padding:isTablet?"16px 8px":"10px 8px",flex:1}}>
              {navItems.map(n=>(
                <div key={n.id} onClick={()=>navigate(n.id)} title={n.label}
                  style={{display:"flex",alignItems:"center",gap:isTablet?0:8,justifyContent:isTablet?"center":"flex-start",
                    padding:isTablet?"12px 8px":"9px 10px",borderRadius:8,cursor:"pointer",marginBottom:4,
                    fontSize:"0.82rem",fontWeight:500,color:view===n.id?"#3b82f6":C.dim,
                    background:view===n.id?"#1e3a5f33":"transparent"}}>
                  <span style={{fontSize:isTablet?"1.3rem":"1rem"}}>{n.icon}</span>
                  {!isTablet&&n.label}
                  {!isTablet&&n.id==="dashboard"&&slaOver.length>0&&
                    <span style={{marginLeft:"auto",background:"#ef4444",color:"#fff",fontSize:"0.58rem",fontWeight:700,padding:"1px 5px",borderRadius:8}}>{slaOver.length}</span>}
                </div>
              ))}
            </nav>
            {!isTablet&&(
              <div style={{padding:10,borderTop:`1px solid ${C.border}`}}>
                <div style={{background:C.surface,borderRadius:8,padding:"8px 10px",display:"flex",alignItems:"center",gap:8}}>
                  <div style={{width:26,height:26,borderRadius:6,background:"#1e3a5f",color:"#3b82f6",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.65rem",fontWeight:700}}>KM</div>
                  <div><div style={{fontSize:"0.72rem",fontWeight:600}}>Karen Montoya</div><div style={{fontSize:"0.6rem",color:C.dim}}>Manager Procura</div></div>
                </div>
              </div>
            )}
          </aside>
        )}

        <main style={{flex:1,overflow:"auto",padding:isMobile?"16px 14px 80px":"20px 24px",minWidth:0}}>
          {/* TOPBAR */}
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16,flexWrap:"wrap",gap:8}}>
            <div>
              <div style={{fontSize:isMobile?"1.05rem":"1.2rem",fontWeight:800}}>{viewTitles[view]}</div>
              <div style={{fontSize:"0.7rem",color:C.dim,marginTop:2}}>
                <span style={{display:"inline-block",width:6,height:6,borderRadius:"50%",background:"#10b981",marginRight:5,verticalAlign:"middle",animation:"pulse 2s infinite"}}/>
                {rqs.length} RQs · {slaOver.length} incumplidas · {slaWarn.length} en riesgo
              </div>
            </div>
            {!isMobile&&(
              <div style={{display:"flex",gap:8}}>
                <button style={btn("#1f2d45",C.muted,{padding:"8px 12px"})} onClick={loadData}>🔄</button>
                <button style={btn("#3b82f6")} onClick={()=>setShowNew(true)}>+ Nueva RQ</button>
              </div>
            )}
          </div>

          {/* DASHBOARD */}
          {view==="dashboard"&&<>
            <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr 1fr":"repeat(5,1fr)",gap:10,marginBottom:14}}>
              {[{label:"RQs Activas",val:rqs.length,accent:"#3b82f6"},
                {label:"Cotizando",val:rqs.filter(r=>r.stage==="cotizando"||r.stage==="cotizada").length,accent:"#06b6d4"},
                {label:"OCs Emitidas",val:rqs.filter(r=>r.stage==="oc").length,accent:"#10b981"},
                {label:"En Riesgo",val:slaWarn.length,accent:"#f59e0b"},
                {label:"Incumplidas",val:slaOver.length,accent:"#ef4444"},
              ].map(k=>(
                <div key={k.label} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 14px",borderTop:`2px solid ${k.accent}`}}>
                  <div style={{fontSize:"0.6rem",color:C.dim,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:4}}>{k.label}</div>
                  <div style={{fontSize:"1.8rem",fontWeight:800,color:k.accent,lineHeight:1}}>{k.val}</div>
                </div>
              ))}
            </div>
            <div style={{display:"flex",gap:8,marginBottom:10,flexWrap:"wrap"}}>
              <select style={{...sS,width:"auto",padding:"8px 10px",fontSize:"0.82rem",flex:1,minWidth:140}} value={fAnalyst} onChange={e=>setFAnalyst(e.target.value)}>
                <option value="all">Todos los analistas</option>
                {ANALYSTS.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
              <select style={{...sS,width:"auto",padding:"8px 10px",fontSize:"0.82rem",flex:1,minWidth:140}} value={fStage} onChange={e=>setFStage(e.target.value)}>
                <option value="all">Todos los estados</option>
                {STAGES.map(s=><option key={s.id} value={s.id}>{s.icon} {s.label}</option>)}
              </select>
            </div>
            {filtered.length===0
              ?<div style={{...card,padding:32,textAlign:"center",color:C.dim}}>
                  <div style={{fontSize:"2.5rem",marginBottom:8}}>📭</div>
                  <div style={{fontWeight:600}}>No hay RQs{rqs.length===0?" registradas aún":" con ese filtro"}</div>
                  {rqs.length===0&&<div style={{fontSize:"0.85rem",marginTop:6}}>Toca <b>"+ RQ"</b> para comenzar</div>}
                </div>
              :isMobile
                ?<div>{filtered.map(rq=><RQCard key={rq.id} rq={rq} onAdvance={r=>setAdvRQ(r)} onEdit={r=>setEditRQ(r)} onDelete={deleteRQ}/>)}</div>
                :<div style={card}><div style={{overflow:"auto"}}>
                    <table style={{width:"100%",borderCollapse:"collapse"}}>
                      <thead><tr>{["RQ","Descripción","CWA","Analista","Etapa","SLA","OC","Acciones"].map(h=>(
                        <th key={h} style={{fontSize:"0.6rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.07em",color:C.dim,padding:"10px 12px",borderBottom:`1px solid ${C.border}`,textAlign:"left",whiteSpace:"nowrap"}}>{h}</th>
                      ))}</tr></thead>
                      <tbody>{filtered.map(rq=>{const st=getStage(rq.stage); return(
                        <tr key={rq.id} onMouseEnter={e=>e.currentTarget.style.background=C.bg2} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                          <td style={{padding:"10px 12px",borderBottom:`1px solid ${C.border}`}}><span style={{fontFamily:"monospace",fontSize:"0.72rem",color:"#3b82f6",fontWeight:600}}>{rq.id}</span></td>
                          <td style={{padding:"10px 12px",borderBottom:`1px solid ${C.border}`,fontSize:"0.82rem",maxWidth:200}}>
                            <div style={{fontWeight:500}}>{rq.descripcion}</div>
                            {rq.observations&&<div style={{fontSize:"0.68rem",color:C.dim,marginTop:1}}>{rq.observations}</div>}
                          </td>
                          <td style={{padding:"10px 12px",borderBottom:`1px solid ${C.border}`,fontFamily:"monospace",fontSize:"0.7rem",color:C.dim}}>{rq.cwa||"—"}</td>
                          <td style={{padding:"10px 12px",borderBottom:`1px solid ${C.border}`}}>
                            <div style={{display:"flex",alignItems:"center",gap:6}}><Avatar id={rq.analyst} size={22}/><span style={{fontSize:"0.78rem"}}>{getAnalyst(rq.analyst).name.split(" ")[0]}</span></div>
                          </td>
                          <td style={{padding:"10px 12px",borderBottom:`1px solid ${C.border}`}}><span style={{fontSize:"0.78rem",fontWeight:600,color:st.color}}>{st.icon} {st.label}</span></td>
                          <td style={{padding:"10px 12px",borderBottom:`1px solid ${C.border}`}}><SlaBadge rq={rq}/></td>
                          <td style={{padding:"10px 12px",borderBottom:`1px solid ${C.border}`,fontFamily:"monospace",fontSize:"0.7rem",color:"#0ea5e9"}}>{rq.oc||"—"}</td>
                          <td style={{padding:"10px 12px",borderBottom:`1px solid ${C.border}`}}>
                            <div style={{display:"flex",gap:5}}>
                              <button style={btn("#1e3a5f","#3b82f6",{padding:"6px 10px",fontSize:"0.75rem"})} onClick={()=>setAdvRQ(rq)}>▶</button>
                              <button style={btn(C.surface,C.muted,{padding:"6px 10px",border:`1px solid ${C.border}`})} onClick={()=>setEditRQ(rq)}>✏️</button>
                              <button style={btn("#2e0c0c","#ef4444",{padding:"6px 10px"})} onClick={()=>deleteRQ(rq.id)}>🗑</button>
                            </div>
                          </td>
                        </tr>
                      );})}</tbody>
                    </table>
                  </div></div>
            }
          </>}

          {/* KANBAN */}
          {view==="kanban"&&(
            <div style={card}>
              <div style={{padding:"12px 16px",borderBottom:`1px solid ${C.border}`,fontWeight:700,fontSize:"0.9rem"}}>🔄 Pipeline — {rqs.length} RQs</div>
              <div style={{display:"flex",gap:8,padding:12,overflowX:"auto",WebkitOverflowScrolling:"touch"}}>
                {STAGES.map(stage=>{const col=rqs.filter(r=>r.stage===stage.id); return(
                  <div key={stage.id} style={{flexShrink:0,width:isMobile?150:170}}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"5px 8px",borderRadius:6,marginBottom:6,background:`${stage.color}18`,border:`1px solid ${stage.color}30`}}>
                      <span style={{fontSize:"0.62rem",fontWeight:700,color:stage.color}}>{stage.icon} {stage.label}</span>
                      <span style={{background:C.surface,padding:"1px 6px",borderRadius:4,fontSize:"0.6rem",color:C.dim}}>{col.length}</span>
                    </div>
                    {col.length===0
                      ?<div style={{border:`1px dashed ${C.border}`,borderRadius:8,padding:"14px 10px",textAlign:"center",color:C.dim,fontSize:"0.7rem"}}>Vacío</div>
                      :col.map(rq=>(
                        <div key={rq.id} onClick={()=>setAdvRQ(rq)} style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 10px",marginBottom:5,cursor:"pointer"}}>
                          <div style={{fontFamily:"monospace",fontSize:"0.6rem",color:"#3b82f6",fontWeight:600,marginBottom:3}}>{rq.id}</div>
                          <div style={{fontSize:"0.72rem",fontWeight:500,lineHeight:1.3,marginBottom:5}}>{rq.descripcion}</div>
                          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}><Avatar id={rq.analyst} size={16}/><SlaBadge rq={rq}/></div>
                        </div>
                      ))
                    }
                  </div>
                );})}
              </div>
              <div style={{padding:"0 12px 10px",fontSize:"0.72rem",color:C.dim}}>💡 Toca una tarjeta para avanzar su etapa</div>
            </div>
          )}

          {/* ANALISTAS */}
          {view==="analistas"&&(
            <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:14}}>
              {ANALYSTS.map(a=>{const st=aStats(a.id); const pctC=st.pct>=80?"#10b981":st.pct>=60?"#f59e0b":"#ef4444"; return(
                <div key={a.id} style={card}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 16px",borderBottom:`1px solid ${C.border}`}}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}><Avatar id={a.id} size={36}/>
                      <div><div style={{fontWeight:700}}>{a.name}</div><div style={{fontSize:"0.68rem",color:C.dim}}>Analista de Procura</div></div>
                    </div>
                    <span style={{fontSize:"0.72rem",fontWeight:700,padding:"4px 10px",borderRadius:6,background:st.pct>=80?"#0c2e1e":st.pct>=60?"#2e1f08":"#2e0c0c",color:pctC}}>{st.pct}% SLA</span>
                  </div>
                  <div style={{padding:14}}>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:12}}>
                      {[{label:"Asignadas",val:st.total,c:"#3b82f6"},{label:"En SLA",val:st.total-st.over,c:"#10b981"},{label:"Vencidas",val:st.over,c:"#ef4444"}].map(k=>(
                        <div key={k.label} style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 8px",textAlign:"center"}}>
                          <div style={{fontSize:"1.5rem",fontWeight:800,color:k.c}}>{k.val}</div>
                          <div style={{fontSize:"0.62rem",color:C.dim,marginTop:2}}>{k.label}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{height:6,background:C.bg2,borderRadius:3,overflow:"hidden",marginBottom:12}}>
                      <div style={{height:"100%",borderRadius:3,background:pctC,width:`${st.pct}%`}}/>
                    </div>
                    {STAGES.map(stage=>{const count=st.mine.filter(r=>r.stage===stage.id).length; if(!count) return null; return(
                      <div key={stage.id} style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
                        <span style={{fontSize:"0.8rem",minWidth:20}}>{stage.icon}</span>
                        <div style={{flex:1,height:5,background:C.bg2,borderRadius:3,overflow:"hidden"}}>
                          <div style={{height:"100%",background:stage.color,borderRadius:3,width:`${(count/Math.max(st.total,1))*100}%`}}/>
                        </div>
                        <span style={{fontSize:"0.65rem",color:C.dim,minWidth:16}}>{count}</span>
                      </div>
                    );})}
                    {st.mine.length===0&&<div style={{textAlign:"center",color:C.dim,fontSize:"0.8rem",padding:8}}>Sin RQs asignadas</div>}
                  </div>
                </div>
              );})}
            </div>
          )}

          {/* SINCO */}
          {view==="sinco"&&<>
            <div style={card}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 16px",borderBottom:`1px solid ${C.border}`,flexWrap:"wrap",gap:8}}>
                <span style={{fontWeight:700,fontSize:"0.9rem"}}>🔗 Flujo SINCO ERP</span>
                <select style={{...sS,width:"auto",padding:"8px 10px",fontSize:"0.8rem",flex:1,maxWidth:260}} value={detailRQ?.id||""} onChange={e=>setDetailRQ(rqs.find(r=>r.id===e.target.value)||null)}>
                  <option value="">— Seleccionar RQ —</option>
                  {rqs.map(r=><option key={r.id} value={r.id}>{r.id} · {r.descripcion}</option>)}
                </select>
              </div>
              <div style={{padding:16,overflowX:"auto",WebkitOverflowScrolling:"touch"}}>
                <div style={{display:"flex",alignItems:"flex-start",gap:0,minWidth:400}}>
                  {SINCO_STEPS.map((step,i)=>{
                    const cur=detailRQ?stageToSinco[detailRQ.stage]:0; const done=cur>step.id; const act=cur===step.id;
                    return(<div key={step.id} style={{display:"flex",alignItems:"flex-start",flexShrink:0}}>
                      <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:5}}>
                        <div style={{width:52,height:52,borderRadius:12,background:done?"#0c2e1e":act?"#092a40":C.surface,
                          border:`2px solid ${done?"#10b981":act?"#0ea5e9":C.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.3rem",boxShadow:act?"0 0 16px #0ea5e940":"none"}}>
                          {done?"✅":step.icon}
                        </div>
                        <div style={{fontSize:"0.6rem",textAlign:"center",color:done?"#10b981":act?"#0ea5e9":C.dim,fontWeight:act?700:400,maxWidth:72,lineHeight:1.3,whiteSpace:"pre-line"}}>{step.label}</div>
                        <div style={{fontSize:"0.55rem",color:done?"#10b981":act?"#0ea5e9":"#334155",fontWeight:600}}>{done?"✓ Listo":act?"← Aquí":"Pendiente"}</div>
                      </div>
                      {i<SINCO_STEPS.length-1&&<div style={{width:24,height:2,marginTop:26,flexShrink:0,background:cur>step.id?"#10b981":C.border}}/>}
                    </div>);
                  })}
                </div>
              </div>
              {detailRQ
                ?<div style={{margin:"0 14px 14px",background:C.bg2,border:`1px solid ${C.border}`,borderRadius:10,padding:14}}>
                    <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr 1fr":"repeat(4,1fr)",gap:10,marginBottom:12}}>
                      {[{label:"RQ",val:detailRQ.id,mono:true,c:"#3b82f6"},{label:"Descripción",val:detailRQ.descripcion},
                        {label:"Analista",val:getAnalyst(detailRQ.analyst).name},
                        {label:"Etapa",val:`${getStage(detailRQ.stage).icon} ${getStage(detailRQ.stage).label}`,c:getStage(detailRQ.stage).color},
                        {label:"CWA",val:detailRQ.cwa||"—"},{label:"CWP",val:detailRQ.cwp||"—"},
                        {label:"IWP",val:detailRQ.iwp||"—"},{label:"OC SINCO",val:detailRQ.oc||"Pendiente",mono:true,c:detailRQ.oc?"#0ea5e9":C.dim},
                      ].map(f=>(
                        <div key={f.label}>
                          <div style={{fontSize:"0.6rem",color:C.dim,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:2}}>{f.label}</div>
                          <div style={{fontSize:"0.8rem",fontWeight:600,fontFamily:f.mono?"monospace":"inherit",color:f.c||C.text}}>{f.val}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                      <button style={btn("#10b981")} onClick={()=>setAdvRQ(detailRQ)}>▶ Avanzar</button>
                      <button style={btn("#1e3a5f","#3b82f6")} onClick={()=>setEditRQ(detailRQ)}>✏️ Editar</button>
                    </div>
                  </div>
                :<div style={{padding:"12px 16px 16px",textAlign:"center",color:C.dim,fontSize:"0.82rem"}}>Selecciona una RQ para ver su posición en el flujo SINCO</div>
              }
            </div>
            <div style={card}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 16px",borderBottom:`1px solid ${C.border}`}}>
                <span style={{fontWeight:700,fontSize:"0.9rem"}}>🏷️ OCs Emitidas</span>
                <span style={{fontSize:"0.65rem",background:"#092a40",color:"#0ea5e9",padding:"2px 8px",borderRadius:6,fontWeight:700}}>{rqs.filter(r=>r.stage==="oc"&&r.oc).length} OCs</span>
              </div>
              {rqs.filter(r=>r.stage==="oc"&&r.oc).length===0
                ?<div style={{padding:24,textAlign:"center",color:C.dim}}>Aún no hay OCs emitidas</div>
                :<div style={{padding:"8px 14px 14px"}}>
                    {rqs.filter(r=>r.stage==="oc"&&r.oc).map(rq=>(
                      <div key={rq.id} onClick={()=>setDetailRQ(rq)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:C.bg2,border:"1px solid #0c4a6e",borderRadius:8,padding:"10px 12px",marginBottom:6,cursor:"pointer"}}>
                        <div><div style={{fontFamily:"monospace",fontSize:"0.75rem",color:"#0ea5e9",fontWeight:600}}>{rq.oc}</div>
                          <div style={{fontSize:"0.75rem",color:C.muted,marginTop:1}}>{rq.descripcion} · {rq.id}</div></div>
                        <div style={{display:"flex",alignItems:"center",gap:8}}><Avatar id={rq.analyst} size={22}/>
                          <span style={{fontSize:"0.62rem",fontWeight:700,color:"#10b981",background:"#0c2e1e",padding:"2px 7px",borderRadius:5}}>SINCO ✓</span></div>
                      </div>
                    ))}
                  </div>
              }
            </div>
          </>}

          {/* ACTIVIDAD */}
          {view==="actividad"&&(
            <div style={card}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 16px",borderBottom:`1px solid ${C.border}`}}>
                <span style={{fontWeight:700,fontSize:"0.9rem"}}>⚡ Registro de Actividad</span>
                <span style={{fontSize:"0.65rem",background:"#1e3a5f",color:"#3b82f6",padding:"2px 8px",borderRadius:6,fontWeight:700}}>{activity.length} eventos</span>
              </div>
              {activity.length===0
                ?<div style={{padding:32,textAlign:"center",color:C.dim}}><div style={{fontSize:"2.5rem",marginBottom:8}}>📭</div><div style={{fontWeight:600}}>Sin actividad aún</div></div>
                :<div style={{padding:"4px 16px 16px"}}>
                    {activity.map((a,i)=>(
                      <div key={i} style={{display:"flex",gap:10,padding:"10px 0",borderBottom:`1px solid ${C.border}`}}>
                        <div style={{width:6,height:6,borderRadius:"50%",background:"#3b82f6",flexShrink:0,marginTop:6}}/>
                        <div><div style={{fontSize:"0.82rem",lineHeight:1.4}}>{a.msg}</div>
                          <div style={{fontFamily:"monospace",fontSize:"0.65rem",color:C.dim,marginTop:3}}>
                            {new Date(a.created_at).toLocaleString("es-CO",{hour:"2-digit",minute:"2-digit",day:"2-digit",month:"short"})}</div>
                        </div>
                      </div>
                    ))}
                  </div>
              }
            </div>
          )}
        </main>
      </div>

      {/* BOTTOM NAV mobile */}
      {isMobile&&(
        <nav style={{position:"fixed",bottom:0,left:0,right:0,background:C.bg2,borderTop:`1px solid ${C.border}`,display:"flex",justifyContent:"space-around",padding:"8px 0 12px",zIndex:100}}>
          {navItems.map(n=>(
            <button key={n.id} onClick={()=>navigate(n.id)} style={{background:"none",border:"none",display:"flex",flexDirection:"column",alignItems:"center",gap:3,color:view===n.id?"#3b82f6":C.dim,cursor:"pointer",padding:"4px 8px",minWidth:52,fontFamily:"inherit",position:"relative"}}>
              <span style={{fontSize:"1.3rem"}}>{n.icon}</span>
              <span style={{fontSize:"0.55rem",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em"}}>{n.label}</span>
              {n.id==="dashboard"&&slaOver.length>0&&<span style={{position:"absolute",top:0,right:6,background:"#ef4444",color:"#fff",fontSize:"0.5rem",fontWeight:700,padding:"1px 4px",borderRadius:8}}>{slaOver.length}</span>}
            </button>
          ))}
        </nav>
      )}

      {showNew&&<Modal title="➕ Nueva Requisición" onClose={()=>setShowNew(false)}><RQForm initial={{}} allRqs={rqs} onSave={saveRQ} onClose={()=>setShowNew(false)}/></Modal>}
      {editRQ&&<Modal title={`✏️ Editar ${editRQ.id}`} onClose={()=>setEditRQ(null)}><RQForm initial={editRQ} allRqs={rqs} onSave={saveRQ} onClose={()=>setEditRQ(null)}/></Modal>}
      {advRQ&&<AdvanceModal rq={advRQ} onAdvance={(next,obs,oc)=>advanceStage(advRQ,next,obs,oc)} onClose={()=>setAdvRQ(null)}/>}
    </div>
  );
}


