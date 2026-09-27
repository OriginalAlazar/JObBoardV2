import os
import sys
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_number(num_pages)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def draw_page_number(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748b"))
        # Header (pages > 1)
        if self._pageNumber > 1:
            self.drawString(54, 755, "MERN Job Board — Finalized Technical Decisions & Action Plan")
            self.setStrokeColor(colors.HexColor("#cbd5e1"))
            self.setLineWidth(0.5)
            self.line(54, 748, 558, 748)

        # Footer
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(558, 36, page_str)
        self.drawString(54, 36, "WEB II Academic Year 2026 — Team Reference Plan v2.1")
        self.setStrokeColor(colors.HexColor("#cbd5e1"))
        self.setLineWidth(0.5)
        self.line(54, 48, 558, 48)
        self.restoreState()

def build_pdf(filename="FINALIZED_DECISIONS_AND_ACTIONS.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()
    
    # Custom Palette
    c_primary = colors.HexColor("#0284c7")
    c_dark = colors.HexColor("#0f172a")
    c_text = colors.HexColor("#334155")
    c_bg_callout = colors.HexColor("#f0f9ff")
    c_border_callout = colors.HexColor("#bae6fd")
    c_bg_warn = colors.HexColor("#fef3c7")
    c_border_warn = colors.HexColor("#fde68a")
    
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=c_dark,
        spaceAfter=6
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        leading=15,
        textColor=colors.HexColor("#64748b"),
        spaceAfter=15
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=c_dark,
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=c_primary,
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=c_text,
        spaceAfter=6
    )

    bullet_style = ParagraphStyle(
        'Bullet_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=c_text,
        leftIndent=15,
        firstLineIndent=-10,
        spaceAfter=3
    )

    code_style = ParagraphStyle(
        'Code_Custom',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor("#0f172a")
    )

    story = []

    # Title & Metadata Banner
    story.append(Paragraph("MERN Job Board Platform", title_style))
    story.append(Paragraph("<b>Finalized Technical Decisions & Team Action Plan</b> &bull; WEB II Project (v2.1 Lock-Down)", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=c_primary, spaceBefore=0, spaceAfter=12))

    # Executive Overview
    overview_text = (
        "This document contains the locked-down technical decisions, architectural rules, route ordering, "
        "status transition state-machines, and parallel team task divisions finalized for implementation. "
        "No further architectural refactoring or technology changes should occur during the coding sprint."
    )
    story.append(Paragraph(overview_text, body_style))
    story.append(Spacer(1, 6))

    # SECTION 1: CRITICAL TECHNICAL DECISIONS
    story.append(Paragraph("1. Finalized Architectural & Technical Decisions", h1_style))
    
    decisions = [
        ("<b>Standardized API Naming:</b>", "Strictly use <font name='Courier'>GET /api/jobs/mine</font> (not <i>/employer/my-jobs</i>) and <font name='Courier'>GET /api/applications/me</font> (not <i>/my-applications</i>) for consistent, canonical REST conventions."),
        ("<b>Critical Route Ordering:</b>", "In Express, <font name='Courier'>router.get('/mine', ...)</font> <b>MUST</b> be registered BEFORE <font name='Courier'>router.get('/:id', ...)</font>. Otherwise, Express will match <font name='Courier'>'mine'</font> as an <font name='Courier'>:id</font> parameter and crash the query."),
        ("<b>Application Status State-Machine:</b>", "Allowed transitions are strictly: <font name='Courier'>PENDING &rarr; REVIEWED, ACCEPTED, REJECTED</font> and <font name='Courier'>REVIEWED &rarr; ACCEPTED, REJECTED</font>. Direct jumps from PENDING to ACCEPTED/REJECTED are permitted. Any other value or reverse transition returns <font name='Courier'>400 Bad Request</font>."),
        ("<b>Job Closing Business Rule:</b>", "When an employer closes a job (<font name='Courier'>status: 'CLOSED'</font>), the job remains viewable publicly for historical context and applicant tracking, but new applications are rejected with <font name='Courier'>400 Bad Request</font>. Existing applications remain accessible to the employer."),
        ("<b>Mandatory Application Fields:</b>", "Applications require: <font name='Courier'>job</font> (ObjectId), <font name='Courier'>applicant</font> (ObjectId), <font name='Courier'>coverLetter</font> (required, min 20 chars), and <font name='Courier'>resumeLink</font> (required, valid HTTP/HTTPS URL). Applications with missing fields are rejected with <font name='Courier'>400 Bad Request</font>."),
        ("<b>Middleware Pruning:</b>", "Omit <font name='Courier'>express.urlencoded()</font> and <font name='Courier'>express.static()</font>. Include strictly: <font name='Courier'>express.json()</font>, <font name='Courier'>cors({ origin, credentials: true })</font>, and <font name='Courier'>cookieParser()</font>."),
        ("<b>Cookie & CORS Architecture:</b>", "Frontend Axios instance configured with <font name='Courier'>withCredentials: true</font>. Backend CORS explicitly allows frontend origin (<font name='Courier'>http://localhost:5173</font>) and <font name='Courier'>credentials: true</font>. Cookie attributes: <font name='Courier'>httpOnly: true, sameSite: 'lax', secure: (production)</font>."),
        ("<b>Minimal Profile Management:</b>", "Keep profile management focused strictly on: View profile, Edit name, Edit company (for employers), and Change password (verified with bcrypt). Do not add avatars, resume storage, or social links."),
        ("<b>Focused Dashboard Statistics:</b>", "Keep dashboards functional: Seeker (Total, Pending, Reviewed, Accepted, Rejected); Employer (Total Jobs, Open Jobs, Total Applicants, Pending, Accepted, Rejected). Powered by MongoDB aggregation pipelines."),
        ("<b>Standard Email Regex:</b>", "Use standard general RFC email formatting regex. Do not restrict email domains to specific providers (no forced Gmail/Yahoo)."),
        ("<b>Database Level Constraints:</b>", "1) Compound unique index on Application schema: <font name='Courier'>{ job: 1, applicant: 1 }</font> returning <font name='Courier'>409 Conflict</font>. 2) MongoDB TTL index on Session schema: <font name='Courier'>{ expiresAt: 1 }, { expireAfterSeconds: 0 }</font>."),
        ("<b>Password Security & Hashing:</b>", "bcrypt with fixed salt rounds = 10. Passwords stored only as <font name='Courier'>passwordHash</font>."),
        ("<b>Updates & Verbs:</b>", "Use <font name='Courier'>PUT</font> consistently for all resource modifications (Job edits, Status updates, Profile updates).")
    ]

    for title, desc in decisions:
        story.append(Paragraph(f"&bull; {title} {desc}", bullet_style))

    story.append(Spacer(1, 8))

    # SECTION 2: APPLICATION STATUS STATE MACHINE TABLE
    story.append(Paragraph("2. Application Status Transition Rules", h1_style))
    status_data = [
        ["Current Status", "Allowed Next Statuses", "Backend Enforcement"],
        ["PENDING", "REVIEWED, ACCEPTED, REJECTED", "Employer can review or directly accept/reject"],
        ["REVIEWED", "ACCEPTED, REJECTED", "Final candidate evaluation decision"],
        ["ACCEPTED", "None (Final State)", "Terminal state; changes rejected with 400 Bad Request"],
        ["REJECTED", "None (Final State)", "Terminal state; changes rejected with 400 Bad Request"]
    ]
    t_status = Table(status_data, colWidths=[100, 180, 224])
    t_status.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#0f172a")),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,0), 8.5),
        ('BOTTOMPADDING', (0,0), (-1,0), 5),
        ('TOPPADDING', (0,0), (-1,0), 5),
        ('BACKGROUND', (0,1), (-1,-1), colors.HexColor("#f8fafc")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('FONTNAME', (0,1), (-1,-1), 'Helvetica'),
        ('FONTSIZE', (0,1), (-1,-1), 8),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,1), (-1,-1), 4),
        ('BOTTOMPADDING', (0,1), (-1,-1), 4),
    ]))
    story.append(t_status)
    story.append(Spacer(1, 10))

    # SECTION 3: TEAM DIVISION & MODULE OWNERSHIP
    story.append(Paragraph("3. Parallel Team Work Breakdown & Ownership", h1_style))
    team_data = [
        ["Member / Role", "Primary Responsibilities", "Core Deliverables"],
        ["Member 1\n(Auth & Sessions)", "User model, bcrypt hashing, Session model with TTL index, auth middleware (requireAuth), role middleware (requireRole), auth routes (register, login, logout, me, profile).", "server/models/User.js\nserver/models/Session.js\nserver/middleware/auth.js\nserver/routes/auth.js"],
        ["Member 2\n(Jobs & Search)", "Job model, Job CRUD endpoints with strict ownership checks, route ordering (/mine before /:id), search query regex, filter logic, sort options, and server-side pagination.", "server/models/Job.js\nserver/routes/jobs.js\nOwnership authorization logic"],
        ["Member 3\n(Applications & Review)", "Application model with compound unique index ({job, applicant}), application submission validation (resumeLink URL regex), closed job check, status transitions, applicant listing.", "server/models/Application.js\nserver/routes/applications.js\n409 Conflict & 400 Bad Request handlers"],
        ["Member 4\n(Frontend & UI)", "React application setup (Vite), React Router setup, AuthContext state management, Axios client (withCredentials: true), ProtectedRoute guards, Job search/filter UI, seeker & employer dashboards.", "client/src/context/AuthContext.jsx\nclient/src/services/api.js\nclient/src/components/ProtectedRoute.jsx\nDashboard & Job pages"]
    ]
    t_team = Table(team_data, colWidths=[110, 234, 160])
    t_team.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#0284c7")),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,0), 8.5),
        ('BOTTOMPADDING', (0,0), (-1,0), 5),
        ('TOPPADDING', (0,0), (-1,0), 5),
        ('BACKGROUND', (0,1), (-1,-1), colors.white),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#f8fafc")]),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('FONTNAME', (0,1), (-1,-1), 'Helvetica'),
        ('FONTSIZE', (0,1), (-1,-1), 8),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,1), (-1,-1), 5),
        ('BOTTOMPADDING', (0,1), (-1,-1), 5),
    ]))
    story.append(t_team)
    story.append(Spacer(1, 10))

    # SECTION 4: SECURITY-SPECIFIC TEST MATRIX
    story.append(Paragraph("4. Security-Specific Testing Matrix", h1_style))
    test_data = [
        ["Category", "Test Scenario", "Expected Status & Behavior"],
        ["Authentication", "Login with invalid password", "401 Unauthorized ('Invalid email or password')"],
        ["Authentication", "Access protected route without cookie", "401 Unauthorized ('Authentication required')"],
        ["Authentication", "Access protected route with expired session", "401 Unauthorized (Session deleted, cookie cleared)"],
        ["Authentication", "Logout destroys session", "200 OK (Session deleted from MongoDB collection)"],
        ["Authorization", "Guest attempts to create job", "401 Unauthorized"],
        ["Authorization", "Job Seeker attempts to create job", "403 Forbidden ('Requires role: EMPLOYER')"],
        ["Authorization", "Employer A attempts to edit Employer B's job", "403 Forbidden ('You do not own this job')"],
        ["Authorization", "Employer A views applicants for Employer B's job", "403 Forbidden ('Unauthorized applicant access')"],
        ["Business Rule", "Job Seeker applies twice to same job", "409 Conflict ('You have already applied for this job')"],
        ["Business Rule", "Job Seeker applies to CLOSED job", "400 Bad Request ('Job posting is closed')"],
        ["Business Rule", "Invalid status value passed to update", "400 Bad Request ('Invalid status value or transition')"],
        ["Business Rule", "Malformed MongoDB ObjectId parameter", "404 Not Found or 400 Bad Request handled gracefully"]
    ]
    t_test = Table(test_data, colWidths=[90, 224, 190])
    t_test.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#334155")),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,0), 8.5),
        ('BOTTOMPADDING', (0,0), (-1,0), 5),
        ('TOPPADDING', (0,0), (-1,0), 5),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('FONTNAME', (0,1), (-1,-1), 'Helvetica'),
        ('FONTSIZE', (0,1), (-1,-1), 7.8),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#f8fafc")]),
        ('TOPPADDING', (0,1), (-1,-1), 3.5),
        ('BOTTOMPADDING', (0,1), (-1,-1), 3.5),
    ]))
    story.append(t_test)
    story.append(Spacer(1, 10))

    # SECTION 5: IMMEDIATE ACTION CHECKLIST
    story.append(Paragraph("5. Immediate Next Actions (Phase 1 Execution)", h1_style))
    actions = [
        "<b>Action 1 (Scaffolding):</b> Initialize Vite React app in <font name='Courier'>client/</font> and Express server in <font name='Courier'>server/</font>.",
        "<b>Action 2 (Dependencies):</b> Backend installs: <font name='Courier'>express mongoose bcrypt cookie-parser cors dotenv</font> and <font name='Courier'>nodemon</font> (dev). Frontend installs: <font name='Courier'>react-router-dom axios</font>.",
        "<b>Action 3 (Database Connection):</b> Configure <font name='Courier'>server/config/db.js</font> and connect to MongoDB.",
        "<b>Action 4 (Seed Script):</b> Prepare <font name='Courier'>server/seed.js</font> with the 4 demo accounts (Sara, Dawit, Alazar, Beth) and 8 diverse jobs.",
        "<b>Action 5 (Core Sprints):</b> Member 1 launches Auth & Sessions, Member 2 builds Job CRUD, Member 3 handles Applications, Member 4 prepares React layouts."
    ]
    for act in actions:
        story.append(Paragraph(f"&bull; {act}", bullet_style))

    # Build Document with custom canvas
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully generated: {filename}")

if __name__ == "__main__":
    out_file = sys.argv[1] if len(sys.argv) > 1 else "FINALIZED_DECISIONS_AND_ACTIONS.pdf"
    build_pdf(out_file)
