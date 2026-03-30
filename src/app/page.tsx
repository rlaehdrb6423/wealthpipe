"use client";
import { useState, useEffect, useRef } from "react";

export default function Home() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [contact, setContact] = useState({ name: "", email: "", msg: "" });
  const [contactSent, setContactSent] = useState(false);
  const [visible, setVisible] = useState<Record<string, boolean>>({});
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener("resize", resize);
    const draw = (t: number) => {
      const w = canvas.offsetWidth, h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);
      const cx = w * 0.5, cy = h * 0.54, angle = t * 0.00035;
      for (let i = 7; i >= 0; i--) {
        const z = i / 7, sc = 0.55 + z * 0.55, alpha = 0.025 + z * 0.055;
        const ox = Math.sin(angle + i * 0.45) * 28 * z, oy = Math.cos(angle * 0.6 + i * 0.3) * 14 * z;
        const pw = 400 * sc, ph = 290 * sc, rx = cx + ox - pw / 2, ry = cy + oy - ph / 2, rr = 24 * sc;
        ctx.save();
        ctx.translate(cx + ox, cy + oy); ctx.rotate(angle * 0.25 + i * 0.12); ctx.translate(-(cx + ox), -(cy + oy));
        ctx.beginPath();
        ctx.moveTo(rx + rr, ry); ctx.lineTo(rx + pw - rr, ry); ctx.quadraticCurveTo(rx + pw, ry, rx + pw, ry + rr);
        ctx.lineTo(rx + pw, ry + ph - rr); ctx.quadraticCurveTo(rx + pw, ry + ph, rx + pw - rr, ry + ph);
        ctx.lineTo(rx + rr, ry + ph); ctx.quadraticCurveTo(rx, ry + ph, rx, ry + ph - rr);
        ctx.lineTo(rx, ry + rr); ctx.quadraticCurveTo(rx, ry, rx + rr, ry); ctx.closePath();
        const g = ctx.createRadialGradient(cx + ox, cy + oy, 0, cx + ox, cy + oy, pw * 0.6);
        g.addColorStop(0, "rgba(255,255,255," + (alpha * 1.8) + ")");
        g.addColorStop(0.6, "rgba(255,255,255," + (alpha * 0.5) + ")");
        g.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = g; ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255," + (alpha * 2.5) + ")"; ctx.lineWidth = 0.8; ctx.stroke();
        ctx.restore();
      }
      const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 240);
      cg.addColorStop(0, "rgba(255,255,255,0.06)"); cg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = cg; ctx.fillRect(0, 0, w, h);
    };
    const loop = (t: number) => { draw(t); animRef.current = requestAnimationFrame(loop); };
    animRef.current = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener("resize", resize); };
  }, []);

  useEffect(() => {
    const els = document.querySelectorAll("[data-r]");
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setVisible(p => ({ ...p, [e.target.getAttribute("data-r")!]: true }));
    }, { threshold: 0.08 });
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const r = (key: string, delay = 0) => ({
    "data-r": key,
    style: { opacity: visible[key] ? 1 : 0, transform: visible[key] ? "none" : "translateY(36px)", transition: "opacity 0.7s " + delay + "s, transform 0.7s " + delay + "s" } as React.CSSProperties,
  });

  return (
    <main style={{ background:"#000", color:"#fff", minHeight:"100vh", fontFamily:"'DM Sans','Helvetica Neue',sans-serif", overflowX:"hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,700;0,900&display=swap');
        *{margin:0;padding:0;box-sizing:border-box}
        ::selection{background:#fff;color:#000}
        ::-webkit-scrollbar{width:1px}
        ::-webkit-scrollbar-thumb{background:#333}
        @keyframes up{from{opacity:0;transform:translateY(56px)}to{opacity:1;transform:none}}
        @keyframes in{from{opacity:0}to{opacity:1}}
        @keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        .big{font-size:clamp(76px,13vw,180px);font-weight:900;line-height:0.84;letter-spacing:-0.045em;text-transform:uppercase}
        .stroke{-webkit-text-stroke:1.5px #fff;color:transparent}
        .btn-w{display:inline-flex;align-items:center;gap:10px;background:#fff;color:#000;padding:18px 44px;border:none;cursor:pointer;font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;font-family:inherit;transition:all 0.18s}
        .btn-w:hover{background:#e0e0e0;transform:scale(1.02)}
        .btn-ghost{display:inline-flex;align-items:center;gap:10px;background:transparent;color:#fff;padding:17px 44px;border:1px solid #333;cursor:pointer;font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;font-family:inherit;transition:all 0.18s}
        .btn-ghost:hover{border-color:#fff;background:rgba(255,255,255,0.05)}
        .tool-card{border-top:1px solid #1a1a1a;padding:36px 0;display:grid;grid-template-columns:80px 1fr auto;gap:32px;align-items:start;cursor:pointer;position:relative}
        .tool-card::after{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:#fff;transform:scaleX(0);transform-origin:left;transition:transform 0.35s cubic-bezier(0.16,1,0.3,1)}
        .tool-card:hover::after{transform:scaleX(1)}
        .tool-card:hover .card-title{color:#fff}
        .tool-card:hover .card-arrow{opacity:1;transform:translate(0,0)}
        .card-title{color:#666;font-size:22px;font-weight:700;transition:color 0.2s;line-height:1.2}
        .card-arrow{opacity:0;transform:translate(-6px,6px);transition:all 0.25s;font-size:20px;color:#fff;margin-top:4px}
        .form-input{width:100%;background:transparent;border:none;border-bottom:1px solid #222;color:#fff;padding:16px 0;font-size:15px;font-family:inherit;outline:none;transition:border-color 0.2s}
        .form-input:focus{border-color:#fff}
        .form-input::placeholder{color:#333}
        .marquee-track{display:flex;width:max-content;animation:marquee 22s linear infinite}
        .m-item{font-size:12px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;padding:0 36px;color:#1e1e1e;white-space:nowrap}
        .m-dot{color:#444}
        .nav-a{font-size:13px;font-weight:500;color:#444;text-decoration:none;transition:color 0.2s}
        .nav-a:hover{color:#fff}
        .nl-row{display:flex;align-items:center;gap:16px;padding:18px 0;border-bottom:1px solid #111;font-size:14px;color:#444;transition:color 0.2s}
        .nl-row:hover{color:#fff}
        .lang-btn{font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#333;text-decoration:none;padding:6px 12px;border:1px solid #1a1a1a;transition:all 0.2s}
        .lang-btn:hover{color:#fff;border-color:#444}
        .lang-active{color:#fff !important;border-color:#fff !important}
        @media(max-width:768px){.two-col{grid-template-columns:1fr!important;gap:48px!important}.stats-grid{grid-template-columns:1fr 1fr!important}}
      `}</style>

      {/* NAV */}
      <nav style={{ position:"sticky",top:0,zIndex:100,background:"rgba(0,0,0,0.92)",backdropFilter:"blur(16px)",borderBottom:"1px solid #111",padding:"0 52px" }}>
        <div style={{ maxWidth:1200,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",height:68 }}>
          <div style={{ display:"flex",alignItems:"center",gap:10 }}>
            <span style={{ display:"block",width:7,height:7,background:"#fff",animation:"blink 3s ease infinite" }} />
            <span style={{ fontSize:18,fontWeight:900,letterSpacing:"-0.02em",textTransform:"uppercase" }}>WealthPipe</span>
          </div>
          <div style={{ display:"flex",gap:36 }}>
            <a href="#tools" className="nav-a">Tools</a>
            <a href="#newsletter" className="nav-a">Newsletter</a>
            <a href="#contact" className="nav-a">Agency</a>
          </div>
          <div style={{ display:"flex",gap:10,alignItems:"center" }}>
            <a href="/ko" className="lang-btn">KO</a>
            <a href="/" className="lang-btn lang-active">EN</a>
            <a href="#newsletter"><button className="btn-w" style={{ padding:"10px 28px",fontSize:12 }}>Subscribe Free</button></a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ position:"relative",minHeight:"100vh",display:"flex",flexDirection:"column",justifyContent:"center",overflow:"hidden" }}>
        <canvas ref={canvasRef} style={{ position:"absolute",inset:0,width:"100%",height:"100%",zIndex:1,pointerEvents:"none" }} />
        <div style={{ position:"absolute",inset:0,background:"radial-gradient(ellipse 55% 45% at 50% 52%, rgba(255,255,255,0.04) 0%, transparent 70%)",zIndex:0,pointerEvents:"none" }} />
        <div style={{ position:"relative",zIndex:10,padding:"0 52px",maxWidth:1200,margin:"0 auto",width:"100%" }}>
          <div style={{ marginBottom:48,animation:"in 1s 0.1s both" }}>
            <span style={{ fontSize:11,fontWeight:700,letterSpacing:"0.22em",textTransform:"uppercase",color:"#444" }}>— AI Pipeline Platform</span>
          </div>
          <div className="big" style={{ animation:"up 0.9s 0.05s cubic-bezier(0.16,1,0.3,1) both" }}>
            <div>DATA</div><div>FLOWS.</div>
          </div>
          <div style={{ height:48 }} />
          <div className="big" style={{ animation:"up 0.9s 0.2s cubic-bezier(0.16,1,0.3,1) both" }}>
            <div className="stroke">WEALTH</div><div className="stroke">FOLLOWS.</div>
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:80,marginTop:72,paddingTop:48,borderTop:"1px solid #111",alignItems:"center" }} className="two-col">
            <p style={{ fontSize:17,lineHeight:1.9,color:"#555",fontWeight:300,animation:"up 0.9s 0.35s both" }}>
              AI automatically collects and analyzes critical data across finance, investment, and marketing.<br />
              <span style={{ color:"#fff",fontWeight:500 }}>You just make the call.</span>
            </p>
            <div style={{ display:"flex",gap:14,flexWrap:"wrap",animation:"up 0.9s 0.45s both" }}>
              <a href="#tools"><button className="btn-w">Start Free Tools →</button></a>
              <a href="#newsletter"><button className="btn-ghost">Subscribe</button></a>
            </div>
          </div>
        </div>
        <div style={{ position:"absolute",bottom:0,left:0,right:0,height:100,background:"linear-gradient(transparent,#000)",zIndex:5,pointerEvents:"none" }} />
      </section>

      {/* MARQUEE */}
      <div style={{ borderTop:"1px solid #111",borderBottom:"1px solid #111",padding:"14px 0",overflow:"hidden" }}>
        <div className="marquee-track">
          {Array(4).fill(["AI PIPELINE","WEALTH SIGNAL","DATA FLOW","MARKET INTEL","ALPHA ENGINE","SEO POWER","AUTO CRAWL","INVEST DATA"]).flat().map((t,i) => (
            <span key={i} className="m-item">{t}<span className="m-dot"> · </span></span>
          ))}
        </div>
      </div>

      {/* STATS */}
      <section style={{ padding:"80px 52px",maxWidth:1200,margin:"0 auto",borderBottom:"1px solid #111" }}>
        <div className="stats-grid" style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:0 }}>
          {[["24/7","AI market monitoring"],["100%","Automated pipeline"],["3+","Free analysis tools"],["Global","Korea + Worldwide"]].map(([n,l],i) => (
            <div key={i} {...r("s"+i, i*0.08)} style={{ ...r("s"+i, i*0.08).style, borderLeft:i===0?"2px solid #fff":"1px solid #1a1a1a",paddingLeft:28 }}>
              <div style={{ fontSize:"clamp(40px,4.5vw,64px)",fontWeight:900,lineHeight:1,letterSpacing:"-0.03em",color:i===0?"#fff":"#333" }}>{n}</div>
              <div style={{ fontSize:12,color:"#333",marginTop:10,letterSpacing:"0.06em",textTransform:"uppercase" }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* TOOLS */}
      <section id="tools" style={{ padding:"100px 52px",maxWidth:1200,margin:"0 auto" }}>
        <div {...r("th")} style={{ ...r("th").style, display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:60 }}>
          <h2 style={{ fontSize:"clamp(40px,7vw,96px)",fontWeight:900,lineHeight:0.88,letterSpacing:"-0.04em",textTransform:"uppercase" }}>
            FREE<br /><span className="stroke">TOOLS</span>
          </h2>
          <p style={{ fontSize:14,color:"#444",maxWidth:280,lineHeight:1.8,textAlign:"right" }}>No login. No credit card.<br />Use right now.</p>
        </div>
        <div>
          {[
            { n:"01", tag:"SEO", title:"Keyword Analyzer", desc:"Search volume, competition, and revenue potential in one shot. Essential for bloggers and marketers.", status:"LIVE" },
            { n:"02", tag:"MARKET", title:"Economic News Digest", desc:"AI distills global economic headlines daily. Get the full picture in under 10 minutes.", status:"SOON" },
            { n:"03", tag:"INVEST", title:"Asset Signal Tracker", desc:"AI detects signals across stocks, crypto, and real estate before the crowd moves.", status:"SOON" },
          ].map((t,i) => (
            <div key={i} className="tool-card" {...r("tc"+i, i*0.1)}>
              <div style={{ fontFamily:"monospace",fontSize:12,color:"#2a2a2a",paddingTop:6,letterSpacing:"0.1em" }}>{t.n}</div>
              <div>
                <div style={{ fontSize:10,fontWeight:700,letterSpacing:"0.2em",color:"#333",textTransform:"uppercase",marginBottom:12 }}>{t.tag}</div>
                <h3 className="card-title">{t.title}</h3>
                <p style={{ fontSize:13,color:"#333",lineHeight:1.7,marginTop:10 }}>{t.desc}</p>
              </div>
              <div style={{ display:"flex",flexDirection:"column",alignItems:"flex-end",gap:12 }}>
                <span style={{ fontSize:10,fontWeight:700,letterSpacing:"0.15em",padding:"5px 14px",background:t.status==="LIVE"?"#fff":"transparent",color:t.status==="LIVE"?"#000":"#2a2a2a",border:t.status==="LIVE"?"none":"1px solid #1a1a1a" }}>{t.status}</span>
                <span className="card-arrow">↗</span>
              </div>
            </div>
          ))}
          <div style={{ borderTop:"1px solid #1a1a1a" }} />
        </div>
      </section>

      {/* NEWSLETTER */}
      <section id="newsletter" style={{ background:"#fff",padding:"100px 52px" }}>
        <div style={{ maxWidth:1200,margin:"0 auto",display:"grid",gridTemplateColumns:"1fr 1fr",gap:100,alignItems:"start" }} className="two-col">
          <div {...r("nl")}>
            <span style={{ fontSize:11,fontWeight:700,letterSpacing:"0.2em",textTransform:"uppercase",color:"#999" }}>— Every Monday</span>
            <h2 style={{ fontSize:"clamp(40px,6vw,80px)",fontWeight:900,lineHeight:0.88,letterSpacing:"-0.04em",textTransform:"uppercase",color:"#000",marginTop:16 }}>
              WEALTH<br />INTEL<br />WEEKLY
            </h2>
            <div style={{ marginTop:48 }}>
              {["Global economic trends, distilled","AI-powered finance & invest signals","Automation tips you can use today","Exclusive early tool access"].map((item,i) => (
                <div key={i} className="nl-row" style={{ borderColor:"#e8e8e8",color:"#aaa" }}
                  onMouseEnter={e=>e.currentTarget.style.color="#000"}
                  onMouseLeave={e=>e.currentTarget.style.color="#aaa"}>
                  <span style={{ width:5,height:5,background:"#000",borderRadius:"50%",flexShrink:0 }} />
                  <span style={{ fontWeight:500,color:"inherit" }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div {...r("nlf")} style={{ ...r("nlf").style, paddingTop:8 }}>
            <p style={{ fontSize:13,color:"#aaa",marginBottom:40,letterSpacing:"0.04em" }}>Free · No spam · Unsubscribe anytime</p>
            {!submitted ? (
              <form onSubmit={e=>{e.preventDefault();if(email)setSubmitted(true);}} style={{ display:"flex",flexDirection:"column",gap:20 }}>
                <input style={{ width:"100%",background:"transparent",border:"none",borderBottom:"1px solid #ddd",color:"#000",padding:"16px 0",fontSize:15,fontFamily:"inherit",outline:"none" }} type="text" placeholder="Name" />
                <input style={{ width:"100%",background:"transparent",border:"none",borderBottom:"1px solid #ddd",color:"#000",padding:"16px 0",fontSize:15,fontFamily:"inherit",outline:"none" }} type="email" placeholder="Email address" value={email} onChange={e=>setEmail(e.target.value)} required />
                <button type="submit" style={{ background:"#000",color:"#fff",border:"none",padding:"18px",fontSize:12,letterSpacing:"0.14em",textTransform:"uppercase",cursor:"pointer",fontFamily:"inherit",fontWeight:700,marginTop:8 }}
                  onMouseEnter={e=>e.currentTarget.style.background="#222"}
                  onMouseLeave={e=>e.currentTarget.style.background="#000"}>
                  Start Free Subscription →
                </button>
              </form>
            ) : (
              <div style={{ padding:"24px 0" }}>
                <div style={{ fontSize:40,marginBottom:16 }}>✓</div>
                <p style={{ fontSize:18,fontWeight:700,color:"#000" }}>You're in.</p>
                <p style={{ fontSize:14,color:"#aaa",marginTop:10 }}>First issue lands next Monday.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* AGENCY */}
      <section id="contact" style={{ padding:"100px 52px",maxWidth:1200,margin:"0 auto" }}>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:80 }} className="two-col">
          <div {...r("ag")}>
            <span style={{ fontSize:11,fontWeight:700,letterSpacing:"0.2em",textTransform:"uppercase",color:"#333" }}>— Agency</span>
            <h2 style={{ fontSize:"clamp(40px,6vw,80px)",fontWeight:900,lineHeight:0.88,letterSpacing:"-0.04em",textTransform:"uppercase",marginTop:16 }}>
              AI<br />PIPE<br /><span className="stroke">LINE</span>
            </h2>
            <p style={{ fontSize:15,color:"#444",lineHeight:1.9,marginTop:28,fontWeight:300,maxWidth:360 }}>
              From crawling automation to AI agents. We design and ship data systems your business actually needs — fast.
            </p>
            <div style={{ marginTop:40 }}>
              {["Crawling & Scraping","AI Agents","Data Pipelines","SEO Automation","Chatbot Development","Analytics Dashboard"].map((s,i) => (
                <div key={i} style={{ padding:"14px 0",borderBottom:"1px solid #111",fontSize:13,color:"#444",display:"flex",gap:16,alignItems:"center" }}>
                  <span style={{ fontFamily:"monospace",fontSize:10,color:"#2a2a2a" }}>{String(i+1).padStart(2,"0")}</span>{s}
                </div>
              ))}
            </div>
          </div>
          <div {...r("agf")}>
            {!contactSent ? (
              <form onSubmit={e=>{e.preventDefault();if(contact.name&&contact.email&&contact.msg)setContactSent(true);}} style={{ display:"flex",flexDirection:"column",gap:20,paddingTop:8 }}>
                <p style={{ fontSize:11,fontWeight:700,letterSpacing:"0.2em",textTransform:"uppercase",color:"#333",marginBottom:12 }}>Project Inquiry</p>
                <input className="form-input" placeholder="Name / Company" value={contact.name} onChange={e=>setContact({...contact,name:e.target.value})} required />
                <input className="form-input" type="email" placeholder="Email" value={contact.email} onChange={e=>setContact({...contact,email:e.target.value})} required />
                <textarea className="form-input" placeholder="Tell us about your project" rows={5} value={contact.msg} onChange={e=>setContact({...contact,msg:e.target.value})} required style={{ resize:"none" }} />
                <button type="submit" className="btn-w" style={{ marginTop:8,width:"100%",justifyContent:"center" }}>Send Inquiry →</button>
              </form>
            ) : (
              <div style={{ paddingTop:8 }}>
                <div style={{ fontSize:40,color:"#fff",marginBottom:16 }}>✓</div>
                <p style={{ fontSize:18,fontWeight:700 }}>Received.</p>
                <p style={{ fontSize:14,color:"#444",marginTop:10 }}>We'll get back to you shortly.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop:"1px solid #111",padding:"36px 52px" }}>
        <div style={{ maxWidth:1200,margin:"0 auto",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:20 }}>
          <span style={{ fontSize:16,fontWeight:900,letterSpacing:"-0.02em",textTransform:"uppercase" }}>
            WealthPipe<span style={{ color:"#222",fontWeight:300,fontSize:12 }}>.net</span>
          </span>
          <span style={{ fontSize:11,color:"#222",letterSpacing:"0.08em" }}>© 2026 WEALTHPIPE · AI Intelligence for Wealth</span>
          <div style={{ display:"flex",gap:32,alignItems:"center" }}>
            {[["Tools","#tools"],["Newsletter","#newsletter"],["Agency","#contact"]].map(([l,h]) => (
              <a key={l} href={h} className="nav-a">{l}</a>
            ))}
            <a href="/ko" className="lang-btn">한국어</a>
          </div>
        </div>
      </footer>
    </main>
  );
}