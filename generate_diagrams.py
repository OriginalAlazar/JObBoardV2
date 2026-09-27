import os
from PIL import Image, ImageDraw, ImageFont

os.makedirs("docs/diagrams", exist_ok=True)

def create_system_architecture_diagram():
    # SVG version
    svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 520" width="100%" height="100%">
  <defs>
    <linearGradient id="grad-client" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0284c7"/>
      <stop offset="100%" stop-color="#0369a1"/>
    </linearGradient>
    <linearGradient id="grad-server" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#334155"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
    <linearGradient id="grad-db" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#059669"/>
      <stop offset="100%" stop-color="#047857"/>
    </linearGradient>
    <filter id="shadow" x="-5%" y="-5%" width="110%" height="115%" filterUnits="userSpaceOnUse">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000" flood-opacity="0.25"/>
    </filter>
  </defs>

  <rect width="900" height="520" fill="#090d16" rx="16"/>

  <text x="450" y="42" fill="#f8fafc" font-family="Arial, sans-serif" font-size="20" font-weight="bold" text-anchor="middle">
    MERN Job Board — 3-Tier System Architecture
  </text>
  <text x="450" y="66" fill="#94a3b8" font-family="Arial, sans-serif" font-size="12" text-anchor="middle">
    Decoupled React SPA ➔ Express REST API ➔ Mongoose ➔ MongoDB Atlas
  </text>

  <!-- Client Layer -->
  <g filter="url(#shadow)">
    <rect x="50" y="100" width="240" height="360" rx="12" fill="#0f172a" stroke="#0284c7" stroke-width="2"/>
    <rect x="50" y="100" width="240" height="44" rx="12" fill="url(#grad-client)"/>
    <text x="170" y="128" fill="#fff" font-family="Arial, sans-serif" font-size="15" font-weight="bold" text-anchor="middle">Client Tier (React SPA)</text>
    
    <rect x="70" y="165" width="200" height="42" rx="8" fill="#1e293b" stroke="#334155"/>
    <text x="170" y="191" fill="#f8fafc" font-family="Arial, sans-serif" font-size="13" text-anchor="middle">Pages &amp; Views (React Router)</text>

    <rect x="70" y="225" width="200" height="42" rx="8" fill="#1e293b" stroke="#334155"/>
    <text x="170" y="251" fill="#f8fafc" font-family="Arial, sans-serif" font-size="13" text-anchor="middle">Global AuthContext</text>

    <rect x="70" y="285" width="200" height="42" rx="8" fill="#1e293b" stroke="#334155"/>
    <text x="170" y="311" fill="#f8fafc" font-family="Arial, sans-serif" font-size="13" text-anchor="middle">UI Components &amp; Badges</text>

    <rect x="70" y="345" width="200" height="42" rx="8" fill="#1e293b" stroke="#38bdf8"/>
    <text x="170" y="371" fill="#38bdf8" font-family="Arial, sans-serif" font-size="13" font-weight="bold" text-anchor="middle">Axios (withCredentials: true)</text>

    <text x="170" y="430" fill="#64748b" font-family="Arial, sans-serif" font-size="11" text-anchor="middle">Hosted on Vercel</text>
  </g>

  <!-- Connect 1 -->
  <line x1="290" y1="280" x2="350" y2="280" stroke="#38bdf8" stroke-width="3" stroke-dasharray="4"/>
  <polygon points="350,275 360,280 350,285" fill="#38bdf8"/>
  <text x="325" y="265" fill="#38bdf8" font-family="Arial, sans-serif" font-size="10" text-anchor="middle">HTTPS</text>
  <text x="325" y="305" fill="#94a3b8" font-family="Arial, sans-serif" font-size="9" text-anchor="middle">+ Cookie</text>

  <!-- Server Layer -->
  <g filter="url(#shadow)">
    <rect x="360" y="100" width="260" height="360" rx="12" fill="#0f172a" stroke="#64748b" stroke-width="2"/>
    <rect x="360" y="100" width="260" height="44" rx="12" fill="url(#grad-server)"/>
    <text x="490" y="128" fill="#fff" font-family="Arial, sans-serif" font-size="15" font-weight="bold" text-anchor="middle">Express Application Server</text>

    <rect x="380" y="160" width="220" height="36" rx="6" fill="#1e293b" stroke="#334155"/>
    <text x="490" y="183" fill="#cbd5e1" font-family="Arial, sans-serif" font-size="11" text-anchor="middle">cors({ credentials: true }) + cookieParser</text>

    <rect x="380" y="205" width="220" height="36" rx="6" fill="#1e293b" stroke="#fbbf24"/>
    <text x="490" y="228" fill="#fbbf24" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">requireAuth (Session Lookup)</text>

    <rect x="380" y="250" width="220" height="36" rx="6" fill="#1e293b" stroke="#38bdf8"/>
    <text x="490" y="273" fill="#38bdf8" font-family="Arial, sans-serif" font-size="11" text-anchor="middle">requireRole ('JOB_SEEKER' | 'EMPLOYER')</text>

    <rect x="380" y="295" width="220" height="42" rx="6" fill="#1e293b" stroke="#334155"/>
    <text x="490" y="315" fill="#f8fafc" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">Route Controllers</text>
    <text x="490" y="330" fill="#94a3b8" font-family="Arial, sans-serif" font-size="10" text-anchor="middle">/api/auth │ /api/jobs │ /api/applications</text>

    <rect x="380" y="348" width="220" height="36" rx="6" fill="#1e293b" stroke="#059669"/>
    <text x="490" y="371" fill="#34d399" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">Mongoose ODM Models</text>

    <text x="490" y="430" fill="#64748b" font-family="Arial, sans-serif" font-size="11" text-anchor="middle">Hosted on Render (Free Service)</text>
  </g>

  <!-- Connect 2 -->
  <line x1="620" y1="280" x2="670" y2="280" stroke="#10b981" stroke-width="3" stroke-dasharray="4"/>
  <polygon points="670,275 680,280 670,285" fill="#10b981"/>
  <text x="645" y="270" fill="#10b981" font-family="Arial, sans-serif" font-size="10" text-anchor="middle">Driver TLS</text>

  <!-- Database Layer -->
  <g filter="url(#shadow)">
    <rect x="680" y="100" width="180" height="360" rx="12" fill="#0f172a" stroke="#059669" stroke-width="2"/>
    <rect x="680" y="100" width="180" height="44" rx="12" fill="url(#grad-db)"/>
    <text x="770" y="128" fill="#fff" font-family="Arial, sans-serif" font-size="15" font-weight="bold" text-anchor="middle">MongoDB Atlas</text>

    <rect x="695" y="165" width="150" height="38" rx="6" fill="#1e293b" stroke="#059669"/>
    <text x="770" y="189" fill="#f8fafc" font-family="Arial, sans-serif" font-size="12" text-anchor="middle">users collection</text>

    <rect x="695" y="215" width="150" height="38" rx="6" fill="#1e293b" stroke="#059669"/>
    <text x="770" y="239" fill="#f8fafc" font-family="Arial, sans-serif" font-size="12" text-anchor="middle">jobs collection</text>

    <rect x="695" y="265" width="150" height="38" rx="6" fill="#1e293b" stroke="#059669"/>
    <text x="770" y="289" fill="#f8fafc" font-family="Arial, sans-serif" font-size="12" text-anchor="middle">applications</text>

    <rect x="695" y="315" width="150" height="38" rx="6" fill="#1e293b" stroke="#fbbf24"/>
    <text x="770" y="339" fill="#fbbf24" font-family="Arial, sans-serif" font-size="12" text-anchor="middle">sessions (TTL)</text>

    <text x="770" y="430" fill="#64748b" font-family="Arial, sans-serif" font-size="11" text-anchor="middle">M0 Free Cluster (512 MB)</text>
  </g>

  <!-- Strict Warning Banner -->
  <rect x="50" y="475" width="810" height="30" rx="6" fill="rgba(244, 63, 94, 0.1)" stroke="rgba(244, 63, 94, 0.3)"/>
  <text x="455" y="495" fill="#f43f5e" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">
    &#x26A0; STRICT ARCHITECTURAL PRINCIPLE: Browser never connects directly to MongoDB (React ➔ Express ➔ Mongoose ➔ Atlas)
  </text>
</svg>'''
    with open("docs/diagrams/system-architecture.svg", "w", encoding="utf-8") as f:
        f.write(svg)

def create_database_erd_diagram():
    svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 920 540" width="100%" height="100%">
  <rect width="920" height="540" fill="#090d16" rx="16"/>
  <text x="460" y="38" fill="#f8fafc" font-family="Arial, sans-serif" font-size="20" font-weight="bold" text-anchor="middle">
    MERN Job Board — Entity-Relationship Diagram (ERD)
  </text>

  <!-- USER TABLE -->
  <g transform="translate(40, 70)">
    <rect width="240" height="240" rx="8" fill="#0f172a" stroke="#0284c7" stroke-width="2"/>
    <rect width="240" height="36" rx="8" fill="#0284c7"/>
    <text x="120" y="24" fill="#fff" font-family="Arial, sans-serif" font-size="14" font-weight="bold" text-anchor="middle">User</text>
    <text x="15" y="60" fill="#f8fafc" font-family="Courier, monospace" font-size="11">_id: ObjectId [PK]</text>
    <text x="15" y="85" fill="#f8fafc" font-family="Courier, monospace" font-size="11">name: String</text>
    <text x="15" y="110" fill="#38bdf8" font-family="Courier, monospace" font-size="11">email: String [UNIQUE]</text>
    <text x="15" y="135" fill="#f8fafc" font-family="Courier, monospace" font-size="11">passwordHash: String</text>
    <text x="15" y="160" fill="#fbbf24" font-family="Courier, monospace" font-size="11">role: 'SEEKER'|'EMPLOYER'</text>
    <text x="15" y="185" fill="#f8fafc" font-family="Courier, monospace" font-size="11">company: String [opt]</text>
    <text x="15" y="210" fill="#64748b" font-family="Courier, monospace" font-size="11">createdAt, updatedAt: Date</text>
  </g>

  <!-- SESSION TABLE -->
  <g transform="translate(40, 350)">
    <rect width="240" height="150" rx="8" fill="#0f172a" stroke="#fbbf24" stroke-width="2"/>
    <rect width="240" height="36" rx="8" fill="#d97706"/>
    <text x="120" y="24" fill="#fff" font-family="Arial, sans-serif" font-size="14" font-weight="bold" text-anchor="middle">Session (TTL)</text>
    <text x="15" y="60" fill="#f8fafc" font-family="Courier, monospace" font-size="11">_id: ObjectId [PK]</text>
    <text x="15" y="85" fill="#38bdf8" font-family="Courier, monospace" font-size="11">sessionId: String [INDEX]</text>
    <text x="15" y="110" fill="#f8fafc" font-family="Courier, monospace" font-size="11">user: ObjectId [FK ➔ User]</text>
    <text x="15" y="135" fill="#fbbf24" font-family="Courier, monospace" font-size="11">expiresAt: Date [TTL INDEX]</text>
  </g>

  <!-- JOB TABLE -->
  <g transform="translate(640, 70)">
    <rect width="240" height="280" rx="8" fill="#0f172a" stroke="#10b981" stroke-width="2"/>
    <rect width="240" height="36" rx="8" fill="#059669"/>
    <text x="120" y="24" fill="#fff" font-family="Arial, sans-serif" font-size="14" font-weight="bold" text-anchor="middle">Job</text>
    <text x="15" y="60" fill="#f8fafc" font-family="Courier, monospace" font-size="11">_id: ObjectId [PK]</text>
    <text x="15" y="85" fill="#f8fafc" font-family="Courier, monospace" font-size="11">title: String</text>
    <text x="15" y="110" fill="#f8fafc" font-family="Courier, monospace" font-size="11">description: String</text>
    <text x="15" y="135" fill="#f8fafc" font-family="Courier, monospace" font-size="11">company, location: String</text>
    <text x="15" y="160" fill="#f8fafc" font-family="Courier, monospace" font-size="11">type, category: String</text>
    <text x="15" y="185" fill="#f8fafc" font-family="Courier, monospace" font-size="11">salary: Number</text>
    <text x="15" y="210" fill="#f8fafc" font-family="Courier, monospace" font-size="11">requirements: [String]</text>
    <text x="15" y="235" fill="#38bdf8" font-family="Courier, monospace" font-size="11">postedBy: ObjectId [FK]</text>
    <text x="15" y="260" fill="#34d399" font-family="Courier, monospace" font-size="11">status: 'OPEN'|'CLOSED'</text>
  </g>

  <!-- APPLICATION TABLE -->
  <g transform="translate(340, 260)">
    <rect width="250" height="230" rx="8" fill="#0f172a" stroke="#a855f7" stroke-width="2"/>
    <rect width="250" height="36" rx="8" fill="#7e22ce"/>
    <text x="125" y="24" fill="#fff" font-family="Arial, sans-serif" font-size="14" font-weight="bold" text-anchor="middle">Application</text>
    <text x="15" y="60" fill="#f8fafc" font-family="Courier, monospace" font-size="11">_id: ObjectId [PK]</text>
    <text x="15" y="85" fill="#a855f7" font-family="Courier, monospace" font-size="11">job: ObjectId [FK ➔ Job]</text>
    <text x="15" y="110" fill="#38bdf8" font-family="Courier, monospace" font-size="11">applicant: ObjectId [FK]</text>
    <text x="15" y="135" fill="#f8fafc" font-family="Courier, monospace" font-size="11">coverLetter: String (&gt;=20)</text>
    <text x="15" y="160" fill="#f8fafc" font-family="Courier, monospace" font-size="11">resumeLink: String (URL)</text>
    <text x="15" y="185" fill="#fbbf24" font-family="Courier, monospace" font-size="11">status: PENDING|REVIEWED..</text>
    <text x="15" y="210" fill="#f43f5e" font-family="Courier, monospace" font-size="10">UNIQUE: { job, applicant }</text>
  </g>

  <!-- Relationships Lines -->
  <!-- User to Session -->
  <line x1="160" y1="310" x2="160" y2="350" stroke="#fbbf24" stroke-width="2"/>
  <text x="175" y="335" fill="#fbbf24" font-family="Arial, sans-serif" font-size="11">1 : N</text>

  <!-- User to Job (postedBy) -->
  <path d="M 280,140 L 640,140" fill="none" stroke="#0284c7" stroke-width="2"/>
  <text x="460" y="130" fill="#0284c7" font-family="Arial, sans-serif" font-size="11" text-anchor="middle">1 : N (postedBy)</text>

  <!-- User to Application (applicant) -->
  <path d="M 280,240 L 340,300" fill="none" stroke="#38bdf8" stroke-width="2"/>
  <text x="290" y="280" fill="#38bdf8" font-family="Arial, sans-serif" font-size="11">1 : N</text>

  <!-- Job to Application -->
  <path d="M 640,300 L 590,300" fill="none" stroke="#10b981" stroke-width="2"/>
  <text x="615" y="290" fill="#10b981" font-family="Arial, sans-serif" font-size="11">1 : N</text>
</svg>'''
    with open("docs/diagrams/database-erd.svg", "w", encoding="utf-8") as f:
        f.write(svg)

def create_use_case_diagram():
    svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 620" width="100%" height="100%">
  <rect width="900" height="620" fill="#090d16" rx="16"/>
  <text x="450" y="38" fill="#f8fafc" font-family="Arial, sans-serif" font-size="20" font-weight="bold" text-anchor="middle">
    MERN Job Board — Use Case Architecture
  </text>

  <!-- System Boundary Box -->
  <rect x="250" y="70" width="400" height="520" rx="14" fill="#0f172a" stroke="#334155" stroke-width="2"/>
  <text x="450" y="96" fill="#38bdf8" font-family="Arial, sans-serif" font-size="14" font-weight="bold" text-anchor="middle">Job Board Application Boundary</text>

  <!-- ACTORS -->
  <!-- Guest -->
  <g transform="translate(100, 150)">
    <circle cx="20" cy="20" r="16" fill="#0284c7"/>
    <text x="20" y="55" fill="#f8fafc" font-family="Arial, sans-serif" font-size="13" font-weight="bold" text-anchor="middle">Guest</text>
  </g>

  <!-- Job Seeker -->
  <g transform="translate(100, 320)">
    <circle cx="20" cy="20" r="16" fill="#10b981"/>
    <text x="20" y="55" fill="#f8fafc" font-family="Arial, sans-serif" font-size="13" font-weight="bold" text-anchor="middle">Job Seeker</text>
  </g>

  <!-- Employer -->
  <g transform="translate(760, 320)">
    <circle cx="20" cy="20" r="16" fill="#f59e0b"/>
    <text x="20" y="55" fill="#f8fafc" font-family="Arial, sans-serif" font-size="13" font-weight="bold" text-anchor="middle">Employer</text>
  </g>

  <!-- Use Case Bubbles -->
  <!-- Public -->
  <ellipse cx="450" cy="130" rx="100" ry="20" fill="#1e293b" stroke="#0284c7" stroke-width="1.5"/>
  <text x="450" y="135" fill="#f8fafc" font-family="Arial, sans-serif" font-size="11" text-anchor="middle">UC-04/05/06 Browse &amp; Search Jobs</text>

  <ellipse cx="450" cy="180" rx="80" ry="18" fill="#1e293b" stroke="#0284c7" stroke-width="1.5"/>
  <text x="450" y="184" fill="#f8fafc" font-family="Arial, sans-serif" font-size="11" text-anchor="middle">UC-01 Register / UC-02 Login</text>

  <!-- Seeker -->
  <ellipse cx="450" cy="240" rx="90" ry="20" fill="#1e293b" stroke="#10b981" stroke-width="1.5"/>
  <text x="450" y="244" fill="#f8fafc" font-family="Arial, sans-serif" font-size="11" text-anchor="middle">UC-09 Apply with resumeLink</text>

  <ellipse cx="450" cy="295" rx="85" ry="18" fill="#1e293b" stroke="#10b981" stroke-width="1.5"/>
  <text x="450" y="299" fill="#f8fafc" font-family="Arial, sans-serif" font-size="11" text-anchor="middle">UC-10 Track Applications</text>

  <!-- Employer -->
  <ellipse cx="450" cy="360" rx="80" ry="18" fill="#1e293b" stroke="#f59e0b" stroke-width="1.5"/>
  <text x="450" y="364" fill="#f8fafc" font-family="Arial, sans-serif" font-size="11" text-anchor="middle">UC-12 Post &amp; Manage Jobs</text>

  <ellipse cx="450" cy="415" rx="85" ry="18" fill="#1e293b" stroke="#f59e0b" stroke-width="1.5"/>
  <text x="450" y="419" fill="#f8fafc" font-family="Arial, sans-serif" font-size="11" text-anchor="middle">UC-15 Review Candidates</text>

  <ellipse cx="450" cy="470" rx="90" ry="18" fill="#1e293b" stroke="#f59e0b" stroke-width="1.5"/>
  <text x="450" y="474" fill="#f8fafc" font-family="Arial, sans-serif" font-size="11" text-anchor="middle">UC-16 Decision Status Update</text>

  <!-- Shared -->
  <ellipse cx="450" cy="535" rx="85" ry="18" fill="#1e293b" stroke="#a855f7" stroke-width="1.5"/>
  <text x="450" y="539" fill="#f8fafc" font-family="Arial, sans-serif" font-size="11" text-anchor="middle">UC-18 View Dashboard Stats</text>

  <!-- Connectors -->
  <!-- Guest to Public -->
  <line x1="140" y1="165" x2="350" y2="135" stroke="#64748b"/>
  <line x1="140" y1="165" x2="370" y2="180" stroke="#64748b"/>

  <!-- Seeker to Actions -->
  <line x1="140" y1="335" x2="360" y2="240" stroke="#10b981"/>
  <line x1="140" y1="335" x2="365" y2="295" stroke="#10b981"/>
  <line x1="140" y1="335" x2="365" y2="535" stroke="#a855f7"/>

  <!-- Employer to Actions -->
  <line x1="760" y1="335" x2="530" y2="360" stroke="#f59e0b"/>
  <line x1="760" y1="335" x2="535" y2="415" stroke="#f59e0b"/>
  <line x1="760" y1="335" x2="540" y2="470" stroke="#f59e0b"/>
  <line x1="760" y1="335" x2="535" y2="535" stroke="#a855f7"/>
</svg>'''
    with open("docs/diagrams/use-case-diagram.svg", "w", encoding="utf-8") as f:
        f.write(svg)

def create_deployment_diagram():
    svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 920 480" width="100%" height="100%">
  <rect width="920" height="480" fill="#090d16" rx="16"/>
  <text x="460" y="38" fill="#f8fafc" font-family="Arial, sans-serif" font-size="20" font-weight="bold" text-anchor="middle">
    MERN Job Board — Free Academic Cloud Deployment Topology
  </text>

  <!-- GitHub -->
  <g transform="translate(360, 70)">
    <rect width="200" height="70" rx="10" fill="#0f172a" stroke="#fff" stroke-width="2"/>
    <text x="100" y="32" fill="#fff" font-family="Arial, sans-serif" font-size="14" font-weight="bold" text-anchor="middle">&#x1F4E6; GitHub Repository</text>
    <text x="100" y="52" fill="#94a3b8" font-family="Arial, sans-serif" font-size="11" text-anchor="middle">main branch (CI/CD Webhooks)</text>
  </g>

  <!-- Vercel Frontend -->
  <g transform="translate(80, 200)">
    <rect width="260" height="150" rx="12" fill="#0f172a" stroke="#0284c7" stroke-width="2"/>
    <rect width="260" height="36" rx="12" fill="#0284c7"/>
    <text x="130" y="24" fill="#fff" font-family="Arial, sans-serif" font-size="13" font-weight="bold" text-anchor="middle">Vercel (Hobby Tier: $0)</text>
    <text x="130" y="65" fill="#f8fafc" font-family="Arial, sans-serif" font-size="12" font-weight="bold" text-anchor="middle">React SPA Client (Vite)</text>
    <text x="130" y="90" fill="#94a3b8" font-family="Courier, monospace" font-size="10" text-anchor="middle">https://&lt;app&gt;.vercel.app</text>
    <text x="130" y="115" fill="#38bdf8" font-family="Arial, sans-serif" font-size="10" text-anchor="middle">Edge CDN &bull; vercel.json rewrites</text>
  </g>

  <!-- Render Backend -->
  <g transform="translate(580, 200)">
    <rect width="260" height="150" rx="12" fill="#0f172a" stroke="#6366f1" stroke-width="2"/>
    <rect width="260" height="36" rx="12" fill="#4f46e5"/>
    <text x="130" y="24" fill="#fff" font-family="Arial, sans-serif" font-size="13" font-weight="bold" text-anchor="middle">Render (Free Web Service)</text>
    <text x="130" y="65" fill="#f8fafc" font-family="Arial, sans-serif" font-size="12" font-weight="bold" text-anchor="middle">Express.js Node.js API</text>
    <text x="130" y="90" fill="#94a3b8" font-family="Courier, monospace" font-size="10" text-anchor="middle">https://&lt;api&gt;.onrender.com</text>
    <text x="130" y="115" fill="#fbbf24" font-family="Arial, sans-serif" font-size="10" text-anchor="middle">&#x23F1; 15-min Idle Sleep (~60s wake)</text>
  </g>

  <!-- MongoDB Atlas -->
  <g transform="translate(580, 390)">
    <rect width="260" height="65" rx="8" fill="#0f172a" stroke="#10b981" stroke-width="2"/>
    <text x="130" y="28" fill="#34d399" font-family="Arial, sans-serif" font-size="12" font-weight="bold" text-anchor="middle">&#x1F33F; MongoDB Atlas M0 Cluster</text>
    <text x="130" y="48" fill="#94a3b8" font-family="Courier, monospace" font-size="10" text-anchor="middle">mongodb+srv://... (512 MB Free)</text>
  </g>

  <!-- Connectors -->
  <!-- GitHub to Vercel -->
  <path d="M 410,140 L 210,200" fill="none" stroke="#fff" stroke-width="1.5" stroke-dasharray="4"/>
  <text x="290" y="160" fill="#94a3b8" font-family="Arial, sans-serif" font-size="10">Auto-deploy</text>

  <!-- GitHub to Render -->
  <path d="M 510,140 L 710,200" fill="none" stroke="#fff" stroke-width="1.5" stroke-dasharray="4"/>
  <text x="630" y="160" fill="#94a3b8" font-family="Arial, sans-serif" font-size="10">Auto-deploy</text>

  <!-- Vercel to Render (Cross-Origin HTTPS) -->
  <line x1="340" y1="275" x2="580" y2="275" stroke="#38bdf8" stroke-width="3"/>
  <polygon points="570,270 580,275 570,280" fill="#38bdf8"/>
  <text x="460" y="265" fill="#38bdf8" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">Cross-Origin HTTPS REST</text>
  <text x="460" y="295" fill="#cbd5e1" font-family="Courier, monospace" font-size="9" text-anchor="middle">Cookie: SameSite=None; Secure</text>

  <!-- Render to MongoDB -->
  <line x1="710" y1="350" x2="710" y2="390" stroke="#10b981" stroke-width="2"/>
  <text x="730" y="375" fill="#10b981" font-family="Arial, sans-serif" font-size="10">TLS Mongoose</text>
</svg>'''
    with open("docs/diagrams/deployment-diagram.svg", "w", encoding="utf-8") as f:
        f.write(svg)

create_system_architecture_diagram()
create_database_erd_diagram()
create_use_case_diagram()
create_deployment_diagram()
print("Successfully generated all SVG diagrams in docs/diagrams/")

import subprocess

edge_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if not os.path.exists(edge_path):
    edge_path = r"C:\Program Files\Microsoft\Edge\Application\msedge.exe"

cwd = os.path.abspath(".")
diagrams = [
    ("system-architecture.svg", "system-architecture.png", "920,540"),
    ("database-erd.svg", "database-erd.png", "940,560"),
    ("use-case-diagram.svg", "use-case-diagram.png", "920,640"),
    ("deployment-diagram.svg", "deployment-diagram.png", "940,500"),
]

for svg_name, png_name, win_size in diagrams:
    svg_file = os.path.join(cwd, "docs", "diagrams", svg_name).replace("\\", "/")
    png_file = os.path.join(cwd, "docs", "diagrams", png_name)
    cmd = [
        edge_path,
        "--headless",
        "--disable-gpu",
        f"--screenshot={png_file}",
        f"--window-size={win_size}",
        f"file:///{svg_file}"
    ]
    subprocess.run(cmd, check=True)
    print(f"Generated PNG: {png_name}")
