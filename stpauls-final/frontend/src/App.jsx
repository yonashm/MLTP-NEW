import { useState, useMemo } from "react";

const USERS = [
  { email:"admin@stpauls.et",      password:"admin123",  name:"Dr. Almaz Bekele",  role:"Admin",      initials:"AB" },
  { email:"tigist@stpauls.et",     password:"staff123",  name:"Tigist Mengistu",   role:"Staff",      initials:"TM" },
  { email:"supervisor@stpauls.et", password:"super123",  name:"Dawit Assefa",      role:"Supervisor", initials:"DA" },
];

const INITIAL_INQUIRIES = [
  { id:"INQ-2024-081", source:"Court",  party:"Federal High Court – Div. 3",   patient:"Abebe Girma",      cardId:"SPH-09142", type:"Medical records subpoena", received:"2024-11-02", deadline:"2024-11-10", status:"Legal review",      assignee:"Tigist M.", priority:"High",   notes:"Subpoena issued for civil case #4821.", response:"" },
  { id:"INQ-2024-082", source:"Police", party:"Addis Ababa Police – CID",       patient:"Meron Tadesse",    cardId:"SPH-03871", type:"Identity verification",    received:"2024-11-03", deadline:"2024-11-12", status:"Records located",   assignee:"Dawit A.", priority:"High",   notes:"CID case reference: AA-CID-2209.", response:"" },
  { id:"INQ-2024-083", source:"Office", party:"Ministry of Health",              patient:"Selamawit Bekele", cardId:"SPH-11205", type:"Admission history",        received:"2024-11-04", deadline:"2024-11-18", status:"Logged & assigned", assignee:"Hana T.",  priority:"Normal", notes:"Routine ministry audit request.", response:"" },
  { id:"INQ-2024-084", source:"Court",  party:"Oromia Regional Court",           patient:"Tesfaye Alemu",    cardId:"SPH-07634", type:"Surgical records",         received:"2024-11-01", deadline:"2024-11-08", status:"Overdue",           assignee:"Tigist M.", priority:"Urgent", notes:"Urgent — judge's order pending.", response:"" },
  { id:"INQ-2024-085", source:"Police", party:"Bole Sub-city Police",            patient:"Almaz Haile",      cardId:"SPH-02290", type:"Injury documentation",     received:"2024-11-05", deadline:"2024-11-14", status:"Response prepared", assignee:"Yonas B.", priority:"Normal", notes:"Report ready for dispatch.", response:"Injury report compiled and signed." },
  { id:"INQ-2024-086", source:"Office", party:"Ethio Insurance Corp.",           patient:"Biruk Mengistu",   cardId:"SPH-15043", type:"Treatment verification",   received:"2024-11-03", deadline:"2024-11-09", status:"Overdue",           assignee:"Hana T.",  priority:"High",   notes:"Insurance deadline missed.", response:"" },
  { id:"INQ-2024-087", source:"Court",  party:"Supreme Court – Civil Division",  patient:"Yordanos Kifle",   cardId:"SPH-08821", type:"Psychiatric assessment",   received:"2024-11-06", deadline:"2024-11-20", status:"Logged & assigned", assignee:"Dawit A.", priority:"Normal", notes:"No urgency flagged.", response:"" },
  { id:"INQ-2024-088", source:"Police", party:"Yeka District Police",            patient:"Sintayehu Worku",  cardId:"SPH-04517", type:"Toxicology report",        received:"2024-11-06", deadline:"2024-11-15", status:"Records located",   assignee:"Yonas B.", priority:"High",   notes:"Substance case.", response:"" },
  { id:"INQ-2024-089", source:"Office", party:"Civil Service Commission",        patient:"Frehiwot Desta",   cardId:"SPH-19304", type:"Fitness certificate",      received:"2024-11-07", deadline:"2024-11-22", status:"Logged & assigned", assignee:"Tigist M.", priority:"Normal", notes:"Employee fitness check.", response:"" },
  { id:"INQ-2024-090", source:"Court",  party:"Kirkos Woreda Court",             patient:"Kassahun Lemma",   cardId:"SPH-06112", type:"Discharge summary",        received:"2024-10-28", deadline:"2024-11-04", status:"Closed",            assignee:"Hana T.",  priority:"Normal", notes:"Case resolved.", response:"Discharge summary issued and delivered." },
  { id:"INQ-2024-091", source:"Police", party:"Lideta Police Station",           patient:"Lidya Assefa",     cardId:"SPH-12308", type:"Birth record request",     received:"2024-10-29", deadline:"2024-11-05", status:"Closed",            assignee:"Dawit A.", priority:"Normal", notes:"Record confirmed.", response:"Birth record verified and sent." },
  { id:"INQ-2024-092", source:"Office", party:"Addis Ababa City Admin.",         patient:"Mikias Getu",      cardId:"SPH-07091", type:"Residency health check",   received:"2024-11-01", deadline:"2024-11-16", status:"Response prepared", assignee:"Tigist M.", priority:"Normal", notes:"Health check complete.", response:"Health summary prepared for city admin." },
];

const REPORT_DATA = [
  { month:"Aug", court:5, police:4, office:6, closed:12 },
  { month:"Sep", court:7, police:6, office:5, closed:15 },
  { month:"Oct", court:9, police:7, office:8, closed:21 },
  { month:"Nov", court:6, police:5, office:5, closed:10 },
];

const SRC = {
  Court:  { bg:"#EFF6FF", text:"#1D4ED8", dot:"#3B82F6", border:"#BFDBFE" },
  Police: { bg:"#FEF2F2", text:"#B91C1C", dot:"#EF4444", border:"#FECACA" },
  Office: { bg:"#FFFBEB", text:"#92400E", dot:"#F59E0B", border:"#FDE68A" },
};

const ST = {
  "Overdue":            { bg:"#FEF2F2", text:"#B91C1C" },
  "Logged & assigned":  { bg:"#F1F5F9", text:"#475569" },
  "Records located":    { bg:"#EFF6FF", text:"#1D4ED8" },
  "Legal review":       { bg:"#F5F3FF", text:"#6D28D9" },
  "Response prepared":  { bg:"#ECFDF5", text:"#065F46" },
  "Closed":             { bg:"#F0FDF4", text:"#15803D" },
};

const PC = { Urgent:"#DC2626", High:"#D97706", Normal:"#059669" };
const STAFF = ["Tigist M.","Dawit A.","Hana T.","Yonas B."];
const NAV = [
  { key:"dashboard", icon:"⊞", label:"Dashboard" },
  { key:"inquiries", icon:"☰", label:"All inquiries" },
  { key:"new",       icon:"＋", label:"New inquiry" },
  { key:"responses", icon:"↑", label:"Responses" },
  { key:"overdue",   icon:"⚑", label:"Overdue alerts" },
  { key:"search",    icon:"⊙", label:"Search records" },
  { key:"reports",   icon:"⬚", label:"Reports" },
  { key:"settings",  icon:"⚙", label:"Settings" },
];

// ── tiny components ──────────────────────────────────────────────────────────

function Badge({ source }) {
  const c = SRC[source] || { bg:"#F1F5F9", text:"#64748B", dot:"#94A3B8", border:"transparent" };
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, background:c.bg, color:c.text, border:`1px solid ${c.border}`, fontSize:11, fontWeight:600, padding:"2px 8px", borderRadius:20 }}>
      <span style={{ width:6, height:6, borderRadius:"50%", background:c.dot, flexShrink:0 }} />{source}
    </span>
  );
}

function SPill({ status }) {
  const s = ST[status] || { bg:"#F1F5F9", text:"#475569" };
  return <span style={{ background:s.bg, color:s.text, fontSize:11, fontWeight:500, padding:"3px 10px", borderRadius:20, whiteSpace:"nowrap" }}>{status}</span>;
}

function FInput({ label, error, ...p }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
      {label && <label style={{ fontSize:12, fontWeight:600, color:"#374151" }}>{label}</label>}
      <input {...p} style={{ padding:"10px 14px", border:`1.5px solid ${error?"#FCA5A5":"#E5E7EB"}`, borderRadius:8, fontSize:14, color:"#111827", outline:"none", width:"100%", boxSizing:"border-box", ...p.style }}
        onFocus={e=>e.target.style.borderColor="#1D6FB8"} onBlur={e=>e.target.style.borderColor=error?"#FCA5A5":"#E5E7EB"} />
      {error && <p style={{ margin:0, fontSize:11, color:"#DC2626" }}>{error}</p>}
    </div>
  );
}

function FSelect({ label, options, ...p }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
      {label && <label style={{ fontSize:12, fontWeight:600, color:"#374151" }}>{label}</label>}
      <select {...p} style={{ padding:"10px 14px", border:"1.5px solid #E5E7EB", borderRadius:8, fontSize:14, color:"#111827", background:"#fff", outline:"none", width:"100%", boxSizing:"border-box" }}
        onFocus={e=>e.target.style.borderColor="#1D6FB8"} onBlur={e=>e.target.style.borderColor="#E5E7EB"}>
        {options.map(o => <option key={o.v||o} value={o.v||o}>{o.l||o}</option>)}
      </select>
    </div>
  );
}

function Btn({ children, v="primary", ...p }) {
  const vs = {
    primary:   { background:"#0C1A2E", color:"#fff", border:"none" },
    secondary: { background:"transparent", color:"#374151", border:"1.5px solid #E2E8F0" },
    danger:    { background:"#DC2626", color:"#fff", border:"none" },
    success:   { background:"#059669", color:"#fff", border:"none" },
  };
  return (
    <button {...p} style={{ padding:"9px 18px", borderRadius:8, fontSize:13, fontWeight:600, cursor:"pointer", display:"inline-flex", alignItems:"center", gap:6, ...vs[v], ...p.style }}>
      {children}
    </button>
  );
}

function Card({ children, style }) {
  return <div style={{ background:"#fff", border:"1px solid #E2E8F0", borderRadius:14, padding:"20px 22px", ...style }}>{children}</div>;
}

function PH({ title, sub, children }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:22 }}>
      <div>
        <h1 style={{ margin:0, fontSize:20, fontWeight:700, color:"#0F172A" }}>{title}</h1>
        {sub && <p style={{ margin:"3px 0 0", fontSize:13, color:"#94A3B8" }}>{sub}</p>}
      </div>
      {children && <div style={{ display:"flex", gap:8 }}>{children}</div>}
    </div>
  );
}

function Toast({ msg, onClose }) {
  return (
    <div style={{ position:"fixed", bottom:24, right:24, background:"#0C1A2E", color:"#fff", padding:"12px 20px", borderRadius:10, fontSize:13, fontWeight:500, zIndex:9999, display:"flex", alignItems:"center", gap:12, boxShadow:"0 4px 20px rgba(0,0,0,.3)" }}>
      <span style={{ color:"#4ADE80" }}>✓</span>{msg}
      <button onClick={onClose} style={{ background:"none", border:"none", color:"#94A3B8", cursor:"pointer", fontSize:18, lineHeight:1 }}>×</button>
    </div>
  );
}

// ── inquiry detail modal ─────────────────────────────────────────────────────

function DetailModal({ inq, onClose }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.45)", zIndex:50, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }} onClick={onClose}>
      <div style={{ background:"#fff", borderRadius:16, padding:28, width:520, maxWidth:"100%", maxHeight:"85vh", overflowY:"auto" }} onClick={e=>e.stopPropagation()}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
          <div>
            <p style={{ margin:0, fontSize:12, color:"#94A3B8" }}>{inq.id}</p>
            <h2 style={{ margin:"4px 0 0", fontSize:18, fontWeight:700, color:"#0F172A" }}>{inq.patient}</h2>
          </div>
          <button onClick={onClose} style={{ background:"#F1F5F9", border:"none", borderRadius:8, width:32, height:32, cursor:"pointer", fontSize:18, color:"#64748B" }}>×</button>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14 }}>
          {[["Source",<Badge source={inq.source}/>],["Card ID",inq.cardId],["Requesting party",inq.party],["Request type",inq.type],["Received",inq.received],["Deadline",inq.deadline],["Assigned to",inq.assignee],["Priority",inq.priority]].map(([k,v])=>(
            <div key={k} style={{ background:"#F8FAFC", borderRadius:8, padding:"10px 12px" }}>
              <p style={{ margin:"0 0 3px", fontSize:11, color:"#94A3B8", fontWeight:600 }}>{k.toUpperCase()}</p>
              <p style={{ margin:0, fontSize:13, color:"#0F172A", fontWeight:500 }}>{v}</p>
            </div>
          ))}
        </div>
        <div style={{ background:"#F8FAFC", borderRadius:8, padding:"12px 14px", marginBottom:10 }}>
          <p style={{ margin:"0 0 4px", fontSize:11, color:"#94A3B8", fontWeight:600 }}>STATUS</p>
          <SPill status={inq.status} />
        </div>
        {inq.notes && <div style={{ background:"#F8FAFC", borderRadius:8, padding:"12px 14px", marginBottom:10 }}>
          <p style={{ margin:"0 0 4px", fontSize:11, color:"#94A3B8", fontWeight:600 }}>NOTES</p>
          <p style={{ margin:0, fontSize:13, color:"#374151" }}>{inq.notes}</p>
        </div>}
        {inq.response && <div style={{ background:"#ECFDF5", borderRadius:8, padding:"12px 14px", border:"1px solid #A7F3D0" }}>
          <p style={{ margin:"0 0 4px", fontSize:11, color:"#065F46", fontWeight:600 }}>RESPONSE</p>
          <p style={{ margin:0, fontSize:13, color:"#065F46" }}>{inq.response}</p>
        </div>}
      </div>
    </div>
  );
}

// ── shared inquiry table ─────────────────────────────────────────────────────

function ITable({ rows, compact }) {
  const [sel, setSel] = useState(null);
  return (
    <>
      <div style={{ overflowX:"auto" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ background:"#F8FAFC" }}>
              {["Inquiry #","Source","Patient","Type","Deadline","Assignee","Status","Priority"].map(h=>(
                <th key={h} style={{ padding:"9px 16px", textAlign:"left", fontSize:11, fontWeight:600, color:"#94A3B8", whiteSpace:"nowrap", borderBottom:"1px solid #F1F5F9" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r,i)=>(
              <tr key={r.id} style={{ background: r.status==="Overdue"?"#FFF5F5": i%2===0?"#fff":"#FAFBFC", borderBottom:"1px solid #F1F5F9", cursor:"pointer", transition:"background .1s" }}
                onMouseEnter={e=>e.currentTarget.style.background="#EFF6FF"}
                onMouseLeave={e=>e.currentTarget.style.background=r.status==="Overdue"?"#FFF5F5":i%2===0?"#fff":"#FAFBFC"}
                onClick={()=>setSel(r)}>
                <td style={{ padding:"10px 16px", fontSize:12, fontWeight:600, color:"#1D6FB8", whiteSpace:"nowrap" }}>{r.id}</td>
                <td style={{ padding:"10px 16px" }}><Badge source={r.source}/></td>
                <td style={{ padding:"10px 16px" }}>
                  <p style={{ margin:0, fontSize:13, fontWeight:500, color:"#0F172A" }}>{r.patient}</p>
                  {!compact && <p style={{ margin:0, fontSize:11, color:"#94A3B8" }}>{r.cardId}</p>}
                </td>
                <td style={{ padding:"10px 16px", fontSize:12, color:"#475569", maxWidth:160, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{r.type}</td>
                <td style={{ padding:"10px 16px", fontSize:12, fontWeight:r.status==="Overdue"?600:400, color:r.status==="Overdue"?"#DC2626":"#64748B", whiteSpace:"nowrap" }}>{r.deadline}</td>
                <td style={{ padding:"10px 16px", fontSize:12, color:"#475569", whiteSpace:"nowrap" }}>{r.assignee}</td>
                <td style={{ padding:"10px 16px" }}><SPill status={r.status}/></td>
                <td style={{ padding:"10px 16px" }}>
                  <span style={{ display:"inline-flex", alignItems:"center", gap:5, fontSize:12, color:PC[r.priority] }}>
                    <span style={{ width:7, height:7, borderRadius:"50%", background:PC[r.priority] }}/>{r.priority}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {sel && <DetailModal inq={sel} onClose={()=>setSel(null)}/>}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOGIN
// ═══════════════════════════════════════════════════════════════════════════════

function Login({ onLogin }) {
  const [email,setEmail]=useState(""); const [pw,setPw]=useState("");
  const [err,setErr]=useState(""); const [loading,setLoading]=useState(false); const [showPw,setShowPw]=useState(false);

  const submit = () => {
    setErr("");
    if (!email||!pw) { setErr("Please enter your email and password."); return; }
    setLoading(true);
    setTimeout(()=>{
      const u=USERS.find(u=>u.email===email&&u.password===pw);
      if(u) onLogin(u); else { setErr("Invalid credentials. Try the demo accounts below."); setLoading(false); }
    },800);
  };

  return (
    <div style={{ display:"flex", height:"100vh", fontFamily:"'DM Sans','Segoe UI',sans-serif" }}>
      {/* left */}
      <div style={{ width:"44%", background:"#0C1A2E", display:"flex", flexDirection:"column", justifyContent:"space-between", padding:"48px 52px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:-100, right:-100, width:340, height:340, borderRadius:"50%", border:"1px solid rgba(255,255,255,.05)" }}/>
        <div style={{ position:"absolute", bottom:-140, left:-70, width:400, height:400, borderRadius:"50%", border:"1px solid rgba(255,255,255,.04)" }}/>
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:60 }}>
            <div style={{ width:40, height:40, borderRadius:10, background:"#1D6FB8", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <span style={{ color:"#fff", fontSize:20, fontWeight:700 }}>✚</span>
            </div>
            <div>
              <p style={{ margin:0, color:"#F8FAFC", fontSize:14, fontWeight:700 }}>St. Paul's Hospital</p>
              <p style={{ margin:0, color:"#64A0CC", fontSize:10, letterSpacing:.7 }}>MILLENNIUM MEDICAL COLLEGE</p>
            </div>
          </div>
          <h2 style={{ margin:"0 0 16px", color:"#fff", fontSize:34, fontWeight:700, lineHeight:1.2 }}>Card Department<br/>Inquiry System</h2>
          <p style={{ margin:0, color:"#94A3B8", fontSize:14, lineHeight:1.75 }}>Track and respond to medical record requests from courts, police, and government offices — securely and on schedule.</p>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          {[["100+","Inquiries/year"],["3","External sources"],["<48h","Avg. response"],["100%","Audit tracked"]].map(([v,l])=>(
            <div key={l} style={{ background:"rgba(255,255,255,.05)", borderRadius:10, padding:"14px 16px", border:"1px solid rgba(255,255,255,.07)" }}>
              <p style={{ margin:"0 0 3px", fontSize:20, fontWeight:700, color:"#fff" }}>{v}</p>
              <p style={{ margin:0, fontSize:11, color:"#64A0CC" }}>{l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* right */}
      <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", background:"#F8FAFC", padding:40 }}>
        <div style={{ width:"100%", maxWidth:400 }}>
          <h2 style={{ margin:"0 0 6px", fontSize:24, fontWeight:700, color:"#0F172A" }}>Sign in</h2>
          <p style={{ margin:"0 0 28px", fontSize:14, color:"#94A3B8" }}>Access your department portal</p>

          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <FInput label="Email address" type="email" placeholder="you@stpauls.et" value={email} onChange={e=>setEmail(e.target.value)}/>
            <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
              <label style={{ fontSize:12, fontWeight:600, color:"#374151" }}>Password</label>
              <div style={{ position:"relative" }}>
                <input type={showPw?"text":"password"} placeholder="••••••••" value={pw}
                  onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()}
                  style={{ padding:"10px 42px 10px 14px", border:"1.5px solid #E5E7EB", borderRadius:8, fontSize:14, color:"#111827", outline:"none", width:"100%", boxSizing:"border-box" }}
                  onFocus={e=>e.target.style.borderColor="#1D6FB8"} onBlur={e=>e.target.style.borderColor="#E5E7EB"}/>
                <button onClick={()=>setShowPw(!showPw)} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"#9CA3AF", fontSize:16 }}>{showPw?"🙈":"👁"}</button>
              </div>
            </div>
            {err && <div style={{ background:"#FEF2F2", border:"1px solid #FECACA", borderRadius:8, padding:"10px 14px", fontSize:13, color:"#B91C1C" }}>⚠ {err}</div>}
            <button onClick={submit} disabled={loading}
              style={{ padding:"12px", background:loading?"#64748B":"#0C1A2E", color:"#fff", border:"none", borderRadius:8, fontSize:14, fontWeight:600, cursor:loading?"not-allowed":"pointer", transition:"background .2s" }}>
              {loading?"Signing in…":"Sign in →"}
            </button>
          </div>

          <div style={{ marginTop:28, background:"#fff", border:"1px solid #E2E8F0", borderRadius:12, padding:"16px 18px" }}>
            <p style={{ margin:"0 0 10px", fontSize:11, fontWeight:700, color:"#94A3B8", letterSpacing:.5 }}>DEMO CREDENTIALS — click to autofill</p>
            {USERS.map(u=>(
              <div key={u.email} onClick={()=>{setEmail(u.email);setPw(u.password);}}
                style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:"1px solid #F1F5F9", cursor:"pointer" }}
                onMouseEnter={e=>e.currentTarget.style.background="#F8FAFC"}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <div>
                  <p style={{ margin:0, fontSize:12, fontWeight:500, color:"#0F172A" }}>{u.email}</p>
                  <p style={{ margin:0, fontSize:11, color:"#94A3B8" }}>{u.role} · password: {u.password}</p>
                </div>
                <span style={{ fontSize:11, color:"#1D6FB8", fontWeight:600 }}>Use →</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SHELL
// ═══════════════════════════════════════════════════════════════════════════════

function Shell({ user, page, setPage, onLogout, children, overdueCount }) {
  const [col,setCol]=useState(false);
  return (
    <div style={{ display:"flex", height:"100vh", fontFamily:"'DM Sans','Segoe UI',sans-serif", background:"#F8FAFC", fontSize:14 }}>
      <aside style={{ width:col?60:222, flexShrink:0, background:"#0C1A2E", display:"flex", flexDirection:"column", transition:"width .22s ease", overflow:"hidden" }}>
        <div style={{ padding:"20px 14px 16px", borderBottom:"1px solid rgba(255,255,255,.07)", flexShrink:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:32, height:32, borderRadius:8, background:"#1D6FB8", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <span style={{ color:"#fff", fontSize:18, fontWeight:700 }}>✚</span>
            </div>
            {!col && <div>
              <p style={{ margin:0, color:"#F8FAFC", fontSize:12, fontWeight:700 }}>St. Paul's Hospital</p>
              <p style={{ margin:0, color:"#64A0CC", fontSize:10, letterSpacing:.6 }}>CARD DEPARTMENT</p>
            </div>}
          </div>
        </div>

        <nav style={{ flex:1, padding:"10px 8px", overflowY:"auto" }}>
          {NAV.map(n=>{
            const active=page===n.key;
            const alert=n.key==="overdue"&&overdueCount>0;
            return (
              <button key={n.key} onClick={()=>setPage(n.key)}
                style={{ width:"100%", display:"flex", alignItems:"center", gap:10, padding:"9px 10px", borderRadius:8, border:"none", cursor:"pointer", marginBottom:2, background:active?"rgba(29,111,184,.4)":"transparent", color:active?"#93C5FD":"#94A3B8", textAlign:"left", fontSize:13, fontWeight:active?600:400, transition:"all .15s", position:"relative" }}>
                <span style={{ fontSize:14, flexShrink:0, width:22, textAlign:"center" }}>{n.icon}</span>
                {!col && <span style={{ flex:1, whiteSpace:"nowrap" }}>{n.label}</span>}
                {!col && alert && <span style={{ background:"#DC2626", color:"#fff", fontSize:10, fontWeight:700, padding:"1px 6px", borderRadius:10 }}>{overdueCount}</span>}
                {col && alert && <span style={{ position:"absolute", top:6, right:6, width:7, height:7, borderRadius:"50%", background:"#DC2626" }}/>}
              </button>
            );
          })}
        </nav>

        <div style={{ borderTop:"1px solid rgba(255,255,255,.07)", padding:"12px 10px", flexShrink:0 }}>
          {!col && (
            <div style={{ display:"flex", alignItems:"center", gap:8, padding:"6px", marginBottom:8 }}>
              <div style={{ width:30, height:30, borderRadius:"50%", background:"#1D6FB8", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:11, fontWeight:700, flexShrink:0 }}>{user.initials}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ margin:0, fontSize:12, fontWeight:600, color:"#F8FAFC", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{user.name}</p>
                <p style={{ margin:0, fontSize:10, color:"#64A0CC" }}>{user.role}</p>
              </div>
              <button onClick={onLogout} title="Sign out" style={{ background:"none", border:"none", color:"#64748B", cursor:"pointer", fontSize:16 }}>⏻</button>
            </div>
          )}
          <button onClick={()=>setCol(!col)} style={{ width:"100%", padding:"7px", borderRadius:7, border:"1px solid rgba(255,255,255,.1)", background:"transparent", color:"#64748B", fontSize:12, cursor:"pointer" }}>
            {col?"→":"← Collapse"}
          </button>
        </div>
      </aside>

      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
        <header style={{ background:"#fff", borderBottom:"1px solid #E2E8F0", padding:"0 28px", height:56, display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
          <p style={{ margin:0, fontSize:15, fontWeight:700, color:"#0F172A" }}>{NAV.find(n=>n.key===page)?.label}</p>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            {overdueCount>0 && <button onClick={()=>setPage("overdue")} style={{ background:"#FEF2F2", color:"#B91C1C", fontSize:12, fontWeight:600, padding:"5px 13px", borderRadius:20, border:"1px solid #FECACA", cursor:"pointer" }}>⚑ {overdueCount} overdue</button>}
            <span style={{ fontSize:12, color:"#94A3B8" }}>Nov 2024</span>
            <div style={{ width:32, height:32, borderRadius:"50%", background:"#1D6FB8", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:12, fontWeight:700 }}>{user.initials}</div>
          </div>
        </header>
        <main style={{ flex:1, overflowY:"auto", padding:"24px 28px" }}>{children}</main>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGES
// ═══════════════════════════════════════════════════════════════════════════════

function Dashboard({ setPage, inqs }) {
  const open=inqs.filter(i=>i.status!=="Closed");
  const overdue=inqs.filter(i=>i.status==="Overdue");
  const ready=inqs.filter(i=>i.status==="Response prepared");
  const closed=inqs.filter(i=>i.status==="Closed");
  const bySource=["Court","Police","Office"].map(s=>({ s, total:inqs.filter(i=>i.source===s).length, open:inqs.filter(i=>i.source===s&&i.status!=="Closed").length }));

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 }}>
        {[
          { label:"Open inquiries",    val:open.length,   sub:"Active this month",   accent:"#1D6FB8", icon:"📋", pg:"inquiries" },
          { label:"Overdue",           val:overdue.length,sub:"Past deadline",        accent:"#DC2626", icon:"⚑",  pg:"overdue" },
          { label:"Pending response",  val:ready.length,  sub:"Ready to send",       accent:"#D97706", icon:"↑",  pg:"responses" },
          { label:"Closed this month", val:closed.length, sub:"Finalized & locked",  accent:"#059669", icon:"✓",  pg:"inquiries" },
        ].map(c=>(
          <div key={c.label} onClick={()=>setPage(c.pg)} style={{ background:"#fff", border:"1px solid #E2E8F0", borderRadius:14, padding:"18px 20px", cursor:"pointer", position:"relative", overflow:"hidden", transition:"border-color .15s" }}
            onMouseEnter={e=>e.currentTarget.style.borderColor=c.accent}
            onMouseLeave={e=>e.currentTarget.style.borderColor="#E2E8F0"}>
            <div style={{ position:"absolute", top:14, right:16, fontSize:20, opacity:.1 }}>{c.icon}</div>
            <p style={{ margin:"0 0 8px", fontSize:11, fontWeight:600, color:"#94A3B8", letterSpacing:.5, textTransform:"uppercase" }}>{c.label}</p>
            <p style={{ margin:"0 0 6px", fontSize:34, fontWeight:700, color:c.accent, lineHeight:1 }}>{c.val}</p>
            <p style={{ margin:0, fontSize:12, color:"#64748B" }}>{c.sub}</p>
          </div>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14 }}>
        <Card>
          <p style={{ margin:"0 0 16px", fontSize:13, fontWeight:600, color:"#0F172A" }}>By source</p>
          {bySource.map(d=>{
            const c=SRC[d.s]; const pct=inqs.length?Math.round(d.total/inqs.length*100):0;
            return (
              <div key={d.s} style={{ marginBottom:14 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}><Badge source={d.s}/><span style={{ fontSize:12, color:"#64748B" }}>{d.open} open / {d.total}</span></div>
                <div style={{ background:"#F1F5F9", borderRadius:4, height:7 }}><div style={{ width:`${pct}%`, background:c.dot, height:"100%", borderRadius:4 }}/></div>
              </div>
            );
          })}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginTop:6 }}>
            {bySource.map(d=>{ const c=SRC[d.s]; return <div key={d.s} style={{ background:c.bg, borderRadius:8, padding:"10px 8px", textAlign:"center" }}><p style={{ margin:"0 0 2px", fontSize:18, fontWeight:700, color:c.text }}>{d.total}</p><p style={{ margin:0, fontSize:10, color:c.text }}>{d.s}</p></div>; })}
          </div>
        </Card>

        <Card style={{ border:"1px solid #FECACA" }}>
          <p style={{ margin:"0 0 12px", fontSize:13, fontWeight:600, color:"#B91C1C" }}>⚑ Overdue</p>
          {overdue.length===0 ? <p style={{ color:"#94A3B8", fontSize:13 }}>No overdue items 🎉</p>
          : overdue.map(i=>(
            <div key={i.id} style={{ paddingBottom:10, marginBottom:10, borderBottom:"1px solid #FEE2E2" }}>
              <div style={{ display:"flex", justifyContent:"space-between" }}><span style={{ fontSize:11, fontWeight:600, color:"#B91C1C" }}>{i.id}</span><Badge source={i.source}/></div>
              <p style={{ margin:"3px 0 1px", fontSize:13, fontWeight:500, color:"#0F172A" }}>{i.patient}</p>
              <p style={{ margin:0, fontSize:11, color:"#94A3B8" }}>{i.type} · Due {i.deadline}</p>
            </div>
          ))}
        </Card>

        <Card>
          <p style={{ margin:"0 0 12px", fontSize:13, fontWeight:600, color:"#065F46" }}>✓ Recently closed</p>
          {closed.length===0 ? <p style={{ color:"#94A3B8", fontSize:13 }}>None yet.</p>
          : closed.map(i=>(
            <div key={i.id} style={{ paddingBottom:10, marginBottom:10, borderBottom:"1px solid #F1F5F9" }}>
              <div style={{ display:"flex", justifyContent:"space-between" }}><span style={{ fontSize:11, color:"#94A3B8" }}>{i.id}</span><Badge source={i.source}/></div>
              <p style={{ margin:"3px 0 1px", fontSize:13, fontWeight:500, color:"#0F172A" }}>{i.patient}</p>
              <p style={{ margin:0, fontSize:11, color:"#94A3B8" }}>{i.type}</p>
            </div>
          ))}
        </Card>
      </div>

      <Card style={{ padding:0, overflow:"hidden" }}>
        <div style={{ padding:"16px 22px", borderBottom:"1px solid #F1F5F9", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <p style={{ margin:0, fontSize:13, fontWeight:600, color:"#0F172A" }}>Recent inquiries</p>
          <button onClick={()=>setPage("inquiries")} style={{ fontSize:12, color:"#1D6FB8", background:"none", border:"none", cursor:"pointer", fontWeight:500 }}>View all →</button>
        </div>
        <ITable rows={inqs.slice(0,6)} compact/>
      </Card>
    </div>
  );
}

function AllInquiries({ inqs }) {
  const [src,setSrc]=useState("All"); const [st,setSt]=useState("All"); const [staff,setStaff]=useState("All");
  const rows=inqs.filter(i=>(src==="All"||i.source===src)&&(st==="All"||i.status===st)&&(staff==="All"||i.assignee===staff));
  const statuses=["All",...new Set(inqs.map(i=>i.status))];
  return (
    <div>
      <PH title="All inquiries" sub={`${rows.length} of ${inqs.length} shown`}/>
      <Card style={{ padding:0, overflow:"hidden" }}>
        <div style={{ padding:"14px 20px", borderBottom:"1px solid #F1F5F9", display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>
          <div style={{ display:"flex", gap:6 }}>
            {["All","Court","Police","Office"].map(s=>(
              <button key={s} onClick={()=>setSrc(s)} style={{ padding:"5px 13px", borderRadius:20, border:src===s?"none":"1px solid #E2E8F0", background:src===s?"#0C1A2E":"transparent", color:src===s?"#fff":"#64748B", fontSize:12, fontWeight:500, cursor:"pointer" }}>{s}</button>
            ))}
          </div>
          <select value={st} onChange={e=>setSt(e.target.value)} style={{ padding:"5px 10px", borderRadius:8, border:"1px solid #E2E8F0", fontSize:12, color:"#64748B", background:"#fff", cursor:"pointer" }}>
            {statuses.map(s=><option key={s}>{s}</option>)}
          </select>
          <select value={staff} onChange={e=>setStaff(e.target.value)} style={{ padding:"5px 10px", borderRadius:8, border:"1px solid #E2E8F0", fontSize:12, color:"#64748B", background:"#fff", cursor:"pointer" }}>
            {["All",...STAFF].map(s=><option key={s}>{s}</option>)}
          </select>
        </div>
        <ITable rows={rows}/>
        <div style={{ padding:"12px 20px", borderTop:"1px solid #F1F5F9", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ fontSize:12, color:"#94A3B8" }}>{rows.length} result{rows.length!==1?"s":""}</span>
          <Btn v="secondary" style={{ padding:"5px 14px", fontSize:12 }}>⬇ Export CSV</Btn>
        </div>
      </Card>
    </div>
  );
}

function NewInquiry({ onAdd, setPage }) {
  const [f,setF]=useState({ source:"Court", party:"", patient:"", cardId:"", type:"Medical records", received:new Date().toISOString().slice(0,10), deadline:"", assignee:"Tigist M.", priority:"Normal", notes:"" });
  const [done,setDone]=useState(false); const [errs,setErrs]=useState({});
  const up=k=>e=>setF(p=>({...p,[k]:e.target.value}));

  const submit=()=>{
    const e={};
    if(!f.party.trim())e.party="Required"; if(!f.patient.trim())e.patient="Required";
    if(!f.cardId.trim())e.cardId="Required"; if(!f.deadline)e.deadline="Required";
    if(Object.keys(e).length){setErrs(e);return;}
    onAdd({...f, id:`INQ-2024-${Math.floor(Math.random()*900)+100}`, status:"Logged & assigned", response:""});
    setDone(true);
  };

  if(done) return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"60vh", gap:14 }}>
      <div style={{ width:64, height:64, borderRadius:"50%", background:"#ECFDF5", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28 }}>✓</div>
      <h2 style={{ margin:0, fontSize:20, fontWeight:700, color:"#0F172A" }}>Inquiry logged</h2>
      <p style={{ margin:0, color:"#64748B", fontSize:14 }}>It has been assigned and is now tracked.</p>
      <div style={{ display:"flex", gap:10 }}>
        <Btn onClick={()=>{setDone(false);setF({source:"Court",party:"",patient:"",cardId:"",type:"Medical records",received:new Date().toISOString().slice(0,10),deadline:"",assignee:"Tigist M.",priority:"Normal",notes:""});}}>Log another</Btn>
        <Btn v="secondary" onClick={()=>setPage("inquiries")}>View all →</Btn>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth:680 }}>
      <PH title="Log new inquiry" sub="Record an incoming request from court, police, or office"/>
      <Card>
        <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
          <div>
            <label style={{ fontSize:12, fontWeight:600, color:"#374151", display:"block", marginBottom:8 }}>Source *</label>
            <div style={{ display:"flex", gap:10 }}>
              {["Court","Police","Office"].map(s=>{
                const c=SRC[s]; const active=f.source===s;
                return (
                  <button key={s} onClick={()=>setF(p=>({...p,source:s}))}
                    style={{ flex:1, padding:"14px 10px", borderRadius:10, border:active?`2px solid ${c.dot}`:"1.5px solid #E5E7EB", background:active?c.bg:"#fff", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:5 }}>
                    <span style={{ fontSize:22 }}>{s==="Court"?"⚖":s==="Police"?"🛡":"🏢"}</span>
                    <span style={{ fontSize:13, fontWeight:600, color:active?c.text:"#374151" }}>{s}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <FInput label="Requesting party *" placeholder="e.g. Federal High Court – Div. 3" value={f.party} onChange={up("party")} error={errs.party}/>
            <FSelect label="Request type *" value={f.type} onChange={up("type")} options={["Medical records","Identity verification","Admission history","Surgical records","Injury documentation","Treatment verification","Psychiatric assessment","Toxicology report","Fitness certificate","Discharge summary","Birth record","Other"]}/>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <FInput label="Patient full name *" placeholder="e.g. Abebe Girma" value={f.patient} onChange={up("patient")} error={errs.patient}/>
            <FInput label="Card ID *" placeholder="e.g. SPH-09142" value={f.cardId} onChange={up("cardId")} error={errs.cardId}/>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14 }}>
            <FInput label="Date received" type="date" value={f.received} onChange={up("received")}/>
            <FInput label="Response deadline *" type="date" value={f.deadline} onChange={up("deadline")} error={errs.deadline}/>
            <FSelect label="Priority" value={f.priority} onChange={up("priority")} options={["Normal","High","Urgent"]}/>
          </div>
          <FSelect label="Assign to" value={f.assignee} onChange={up("assignee")} options={STAFF}/>
          <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
            <label style={{ fontSize:12, fontWeight:600, color:"#374151" }}>Notes / context</label>
            <textarea value={f.notes} onChange={up("notes")} placeholder="Any additional context…" rows={3}
              style={{ padding:"10px 14px", border:"1.5px solid #E5E7EB", borderRadius:8, fontSize:14, color:"#111827", resize:"vertical", fontFamily:"inherit", outline:"none" }}
              onFocus={e=>e.target.style.borderColor="#1D6FB8"} onBlur={e=>e.target.style.borderColor="#E5E7EB"}/>
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <Btn onClick={submit}>Log inquiry →</Btn>
            <Btn v="secondary" onClick={()=>setPage("inquiries")}>Cancel</Btn>
          </div>
        </div>
      </Card>
    </div>
  );
}

function Responses({ inqs, onUpdate, toast }) {
  const rows=inqs.filter(i=>["Response prepared","Legal review","Records located"].includes(i.status));
  const [editing,setEditing]=useState(null); const [txt,setTxt]=useState("");

  const send=inq=>{
    onUpdate(inq.id,{ status:"Closed", response:txt||"Response dispatched." });
    toast("Inquiry closed — response recorded.");
    setEditing(null);
  };

  return (
    <div>
      <PH title="Responses" sub="Inquiries under review or ready to dispatch"/>
      {rows.length===0 ? <Card><p style={{ color:"#94A3B8", textAlign:"center", padding:"32px 0" }}>No pending responses.</p></Card>
      : <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
        {rows.map(inq=>(
          <Card key={inq.id}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:12 }}>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6, flexWrap:"wrap" }}>
                  <span style={{ fontSize:12, fontWeight:700, color:"#1D6FB8" }}>{inq.id}</span>
                  <Badge source={inq.source}/><SPill status={inq.status}/>
                  <span style={{ fontSize:11, color:PC[inq.priority], fontWeight:600 }}>● {inq.priority}</span>
                </div>
                <p style={{ margin:"0 0 2px", fontSize:15, fontWeight:600, color:"#0F172A" }}>{inq.patient} <span style={{ fontWeight:400, color:"#94A3B8", fontSize:13 }}>· {inq.cardId}</span></p>
                <p style={{ margin:"0 0 2px", fontSize:13, color:"#475569" }}>{inq.party} — {inq.type}</p>
                <p style={{ margin:0, fontSize:12, color:"#94A3B8" }}>Deadline: {inq.deadline} · {inq.assignee}</p>
                {inq.notes && <p style={{ margin:"8px 0 0", fontSize:12, color:"#64748B", background:"#F8FAFC", padding:"8px 10px", borderRadius:6 }}>📎 {inq.notes}</p>}
              </div>
              <div style={{ display:"flex", gap:8, flexShrink:0 }}>
                <Btn v="secondary" onClick={()=>{ setEditing(editing===inq.id?null:inq.id); setTxt(inq.response||""); }}>✏ Draft</Btn>
                <Btn v="success" onClick={()=>{ setTxt(inq.response||"Response dispatched."); send(inq); }}>✓ Close</Btn>
              </div>
            </div>
            {editing===inq.id && (
              <div style={{ marginTop:14, paddingTop:14, borderTop:"1px solid #F1F5F9" }}>
                <label style={{ fontSize:12, fontWeight:600, color:"#374151", display:"block", marginBottom:6 }}>Response notes</label>
                <textarea value={txt} onChange={e=>setTxt(e.target.value)} rows={3} placeholder="Describe what was provided…"
                  style={{ width:"100%", padding:"10px 12px", border:"1.5px solid #E5E7EB", borderRadius:8, fontSize:13, fontFamily:"inherit", resize:"vertical", outline:"none", boxSizing:"border-box" }}
                  onFocus={e=>e.target.style.borderColor="#1D6FB8"} onBlur={e=>e.target.style.borderColor="#E5E7EB"}/>
                <div style={{ display:"flex", gap:8, marginTop:10 }}>
                  <Btn v="success" onClick={()=>send(inq)}>✓ Submit &amp; close</Btn>
                  <Btn v="secondary" onClick={()=>setEditing(null)}>Cancel</Btn>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>}
    </div>
  );
}

function Overdue({ inqs, onUpdate, toast }) {
  const rows=inqs.filter(i=>i.status==="Overdue");
  return (
    <div>
      <PH title="Overdue alerts" sub={`${rows.length} inquir${rows.length===1?"y":"ies"} past deadline`}/>
      {rows.length===0
        ? <Card><p style={{ color:"#059669", textAlign:"center", padding:"40px 0", fontSize:15 }}>✓ All inquiries are within deadline.</p></Card>
        : <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {rows.map(i=>(
            <div key={i.id} style={{ background:"#FFF5F5", border:"1.5px solid #FECACA", borderRadius:14, padding:"18px 22px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:10 }}>
                <div>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                    <span style={{ fontSize:12, fontWeight:700, color:"#DC2626" }}>⚑ {i.id}</span>
                    <Badge source={i.source}/>
                    <span style={{ fontSize:11, fontWeight:700, color:"#DC2626", background:"#FEE2E2", padding:"2px 8px", borderRadius:20 }}>OVERDUE</span>
                  </div>
                  <p style={{ margin:"0 0 2px", fontSize:15, fontWeight:600, color:"#0F172A" }}>{i.patient} <span style={{ fontWeight:400, color:"#94A3B8", fontSize:13 }}>· {i.cardId}</span></p>
                  <p style={{ margin:"0 0 2px", fontSize:13, color:"#475569" }}>{i.party} — {i.type}</p>
                  <p style={{ margin:"6px 0 0", fontSize:12, color:"#DC2626", fontWeight:600 }}>Was due: {i.deadline} · Assigned: {i.assignee}</p>
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  <Btn v="secondary" onClick={()=>{ onUpdate(i.id,{status:"Response prepared"}); toast("Marked as in progress."); }}>Mark in progress</Btn>
                  <Btn v="danger" onClick={()=>{ onUpdate(i.id,{status:"Closed",response:"Closed after overdue period."}); toast("Inquiry force-closed."); }}>Force close</Btn>
                </div>
              </div>
            </div>
          ))}
        </div>}
    </div>
  );
}

function Search({ inqs }) {
  const [q,setQ]=useState("");
  const results=useMemo(()=>{
    const lq=q.toLowerCase().trim();
    if(!lq) return [];
    return inqs.filter(i=>i.id.toLowerCase().includes(lq)||i.patient.toLowerCase().includes(lq)||i.cardId.toLowerCase().includes(lq)||i.party.toLowerCase().includes(lq)||i.type.toLowerCase().includes(lq));
  },[q,inqs]);

  return (
    <div>
      <PH title="Search records" sub="Search by patient, card ID, inquiry #, or requesting party"/>
      <Card style={{ marginBottom:16 }}>
        <div style={{ position:"relative" }}>
          <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:"#94A3B8", fontSize:16 }}>⊙</span>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Type to search across all records…"
            style={{ width:"100%", padding:"12px 14px 12px 42px", border:"1.5px solid #E5E7EB", borderRadius:10, fontSize:14, color:"#111827", outline:"none", boxSizing:"border-box" }}
            onFocus={e=>e.target.style.borderColor="#1D6FB8"} onBlur={e=>e.target.style.borderColor="#E5E7EB"}/>
        </div>
      </Card>
      {!q.trim()
        ? <div style={{ textAlign:"center", padding:"52px 0", color:"#94A3B8" }}><p style={{ fontSize:32, margin:"0 0 12px" }}>⊙</p><p style={{ margin:0 }}>Start typing to search all inquiry records.</p></div>
        : results.length===0
          ? <div style={{ textAlign:"center", padding:"52px 0", color:"#94A3B8" }}><p>No results for "<strong>{q}</strong>".</p></div>
          : <Card style={{ padding:0, overflow:"hidden" }}>
              <div style={{ padding:"12px 20px", borderBottom:"1px solid #F1F5F9" }}><span style={{ fontSize:12, color:"#64748B" }}>{results.length} result{results.length!==1?"s":""} for "{q}"</span></div>
              <ITable rows={results}/>
            </Card>}
    </div>
  );
}

function Reports({ inqs }) {
  const total=inqs.length; const closed=inqs.filter(i=>i.status==="Closed").length; const overdue=inqs.filter(i=>i.status==="Overdue").length;
  const pct=s=>total?Math.round(inqs.filter(i=>i.source===s).length/total*100):0;
  const barMax=Math.max(...REPORT_DATA.map(d=>d.court+d.police+d.office));

  return (
    <div>
      <PH title="Reports" sub="Performance summary — November 2024"><Btn v="secondary">⬇ Export PDF</Btn></PH>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:20 }}>
        {[["Total inquiries",total,"#1D6FB8"],["Closed",closed,"#059669"],["Overdue",overdue,"#DC2626"],["Closure rate",`${total?Math.round(closed/total*100):0}%`,"#7C3AED"]].map(([l,v,c])=>(
          <Card key={l} style={{ textAlign:"center" }}>
            <p style={{ margin:"0 0 6px", fontSize:11, fontWeight:600, color:"#94A3B8", letterSpacing:.4, textTransform:"uppercase" }}>{l}</p>
            <p style={{ margin:0, fontSize:30, fontWeight:700, color:c }}>{v}</p>
          </Card>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:14, marginBottom:20 }}>
        <Card>
          <p style={{ margin:"0 0 18px", fontSize:13, fontWeight:600, color:"#0F172A" }}>Monthly volume</p>
          {REPORT_DATA.map(d=>{
            const t=d.court+d.police+d.office;
            return (
              <div key={d.month} style={{ marginBottom:14 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                  <span style={{ fontSize:12, fontWeight:600, color:"#374151" }}>{d.month} 2024</span>
                  <span style={{ fontSize:12, color:"#64748B" }}>{t} inquiries · {d.closed} closed</span>
                </div>
                <div style={{ display:"flex", height:10, borderRadius:5, overflow:"hidden", gap:2 }}>
                  {[[SRC.Court.dot,d.court],[SRC.Police.dot,d.police],[SRC.Office.dot,d.office]].map(([col,v],i)=>(
                    <div key={i} style={{ width:`${v/barMax*100}%`, background:col, borderRadius:3 }}/>
                  ))}
                </div>
              </div>
            );
          })}
          <div style={{ display:"flex", gap:16, marginTop:14 }}>
            {[["Court",SRC.Court.dot],["Police",SRC.Police.dot],["Office",SRC.Office.dot]].map(([l,c])=>(
              <span key={l} style={{ display:"flex", alignItems:"center", gap:5, fontSize:12, color:"#64748B" }}>
                <span style={{ width:10, height:10, borderRadius:2, background:c }}/>{l}
              </span>
            ))}
          </div>
        </Card>

        <Card>
          <p style={{ margin:"0 0 14px", fontSize:13, fontWeight:600, color:"#0F172A" }}>Source split</p>
          {["Court","Police","Office"].map(s=>{
            const p=pct(s); const c=SRC[s];
            return (
              <div key={s} style={{ marginBottom:14 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                  <span style={{ fontSize:13, fontWeight:500, color:"#374151" }}>{s}</span>
                  <span style={{ fontSize:13, fontWeight:700, color:c.dot }}>{p}%</span>
                </div>
                <div style={{ background:"#F1F5F9", borderRadius:4, height:8 }}><div style={{ width:`${p}%`, background:c.dot, height:"100%", borderRadius:4 }}/></div>
              </div>
            );
          })}
          <div style={{ marginTop:16, paddingTop:14, borderTop:"1px solid #F1F5F9" }}>
            <p style={{ margin:"0 0 8px", fontSize:11, fontWeight:600, color:"#94A3B8" }}>BY STAFF</p>
            {STAFF.map(s=>{
              const n=inqs.filter(i=>i.assignee===s).length;
              return <div key={s} style={{ display:"flex", justifyContent:"space-between", padding:"5px 0", borderBottom:"1px solid #F8FAFC", fontSize:13 }}><span style={{ color:"#374151" }}>{s}</span><span style={{ fontWeight:600 }}>{n}</span></div>;
            })}
          </div>
        </Card>
      </div>

      <Card style={{ padding:0, overflow:"hidden" }}>
        <div style={{ padding:"14px 20px", borderBottom:"1px solid #F1F5F9" }}><p style={{ margin:0, fontSize:13, fontWeight:600, color:"#0F172A" }}>Status breakdown</p></div>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead><tr style={{ background:"#F8FAFC" }}>{["Status","Court","Police","Office","Total"].map(h=><th key={h} style={{ padding:"9px 18px", textAlign:"left", fontSize:11, fontWeight:600, color:"#94A3B8", borderBottom:"1px solid #F1F5F9" }}>{h}</th>)}</tr></thead>
          <tbody>
            {Object.keys(ST).map(st=>{
              const r={Court:inqs.filter(i=>i.source==="Court"&&i.status===st).length, Police:inqs.filter(i=>i.source==="Police"&&i.status===st).length, Office:inqs.filter(i=>i.source==="Office"&&i.status===st).length};
              const t=r.Court+r.Police+r.Office; if(!t) return null;
              return <tr key={st} style={{ borderBottom:"1px solid #F1F5F9" }}>
                <td style={{ padding:"10px 18px" }}><SPill status={st}/></td>
                <td style={{ padding:"10px 18px", fontSize:13, color:"#374151" }}>{r.Court||"—"}</td>
                <td style={{ padding:"10px 18px", fontSize:13, color:"#374151" }}>{r.Police||"—"}</td>
                <td style={{ padding:"10px 18px", fontSize:13, color:"#374151" }}>{r.Office||"—"}</td>
                <td style={{ padding:"10px 18px", fontSize:13, fontWeight:700, color:"#0F172A" }}>{t}</td>
              </tr>;
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function Settings({ user }) {
  const [saved,setSaved]=useState(false);
  const [notif,setNotif]=useState({ overdue:true, newInq:true, daily:false });
  return (
    <div style={{ maxWidth:600 }}>
      <PH title="Settings" sub="Account preferences and department configuration"/>
      <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
        <Card>
          <p style={{ margin:"0 0 16px", fontSize:14, fontWeight:600, color:"#0F172A" }}>Account</p>
          <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:20 }}>
            <div style={{ width:48, height:48, borderRadius:"50%", background:"#1D6FB8", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:15, fontWeight:700 }}>{user.initials}</div>
            <div>
              <p style={{ margin:0, fontSize:15, fontWeight:600, color:"#0F172A" }}>{user.name}</p>
              <p style={{ margin:0, fontSize:13, color:"#94A3B8" }}>{user.email} · {user.role}</p>
            </div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <FInput label="Full name" defaultValue={user.name}/>
            <FInput label="Email" defaultValue={user.email} type="email"/>
            <FInput label="New password" placeholder="Leave blank to keep current" type="password"/>
            <FInput label="Confirm password" placeholder="Repeat new password" type="password"/>
          </div>
        </Card>

        <Card>
          <p style={{ margin:"0 0 14px", fontSize:14, fontWeight:600, color:"#0F172A" }}>Notifications</p>
          {[
            {k:"overdue",l:"Overdue alerts",d:"Alert when an inquiry passes its deadline"},
            {k:"newInq",l:"New inquiry logged",d:"Alert when a new inquiry is added"},
            {k:"daily",l:"Daily summary",d:"End-of-day summary of all activity"},
          ].map(n=>(
            <div key={n.k} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 0", borderBottom:"1px solid #F1F5F9" }}>
              <div><p style={{ margin:0, fontSize:13, fontWeight:500, color:"#0F172A" }}>{n.l}</p><p style={{ margin:0, fontSize:12, color:"#94A3B8" }}>{n.d}</p></div>
              <button onClick={()=>setNotif(p=>({...p,[n.k]:!p[n.k]}))}
                style={{ width:40, height:22, borderRadius:11, border:"none", cursor:"pointer", background:notif[n.k]?"#1D6FB8":"#E2E8F0", position:"relative", transition:"background .2s", flexShrink:0 }}>
                <span style={{ position:"absolute", top:2, left:notif[n.k]?20:2, width:18, height:18, borderRadius:"50%", background:"#fff", transition:"left .2s" }}/>
              </button>
            </div>
          ))}
        </Card>

        <Card>
          <p style={{ margin:"0 0 14px", fontSize:14, fontWeight:600, color:"#0F172A" }}>Department info</p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <FInput label="Hospital name" defaultValue="St. Paul's Hospital"/>
            <FInput label="Department" defaultValue="Card Department"/>
            <FInput label="Contact email" defaultValue="cardrecords@stpauls.et"/>
            <FInput label="Phone" defaultValue="+251 11 275 3050"/>
          </div>
        </Card>

        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
          <Btn onClick={()=>setSaved(true)}>Save changes</Btn>
          {saved && <span style={{ fontSize:13, color:"#059669", fontWeight:500 }}>✓ Saved successfully</span>}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROOT
// ═══════════════════════════════════════════════════════════════════════════════

export default function App() {
  const [user,setUser]=useState(null);
  const [page,setPage]=useState("dashboard");
  const [inqs,setInqs]=useState(INITIAL_INQUIRIES);
  const [toastMsg,setToastMsg]=useState(null);

  const toast=msg=>{ setToastMsg(msg); setTimeout(()=>setToastMsg(null),3500); };
  const addInq=inq=>{ setInqs(p=>[inq,...p]); toast(`${inq.id} logged successfully.`); };
  const upInq=(id,u)=>setInqs(p=>p.map(i=>i.id===id?{...i,...u}:i));
  const overdueCount=inqs.filter(i=>i.status==="Overdue").length;

  if(!user) return <Login onLogin={u=>{ setUser(u); setPage("dashboard"); }}/>;

  const pages={
    dashboard: <Dashboard setPage={setPage} inqs={inqs}/>,
    inquiries: <AllInquiries inqs={inqs}/>,
    new:       <NewInquiry onAdd={addInq} setPage={setPage}/>,
    responses: <Responses inqs={inqs} onUpdate={upInq} toast={toast}/>,
    overdue:   <Overdue inqs={inqs} onUpdate={upInq} toast={toast}/>,
    search:    <Search inqs={inqs}/>,
    reports:   <Reports inqs={inqs}/>,
    settings:  <Settings user={user}/>,
  };

  return (
    <>
      <Shell user={user} page={page} setPage={setPage} onLogout={()=>{ setUser(null); setPage("dashboard"); }} overdueCount={overdueCount}>
        {pages[page] || pages.dashboard}
      </Shell>
      {toastMsg && <Toast msg={toastMsg} onClose={()=>setToastMsg(null)}/>}
    </>
  );
}
