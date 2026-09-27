# UI/UX Interface Specification

**Project:** MERN Job Board Platform  
**Target Design Standard:** Modern, accessible, responsive Single Page Application (SPA)  
**CSS Architecture:** Vanilla CSS with unified CSS custom properties (tokens)  

---

## 1. Global Design System & Tokens

### 1.1 Typography
- **Primary Body Font:** `'Inter'`, system-ui, -apple-system, sans-serif.
- **Display & Headings:** `'Outfit'`, `'Inter'`, sans-serif (Weights: 600, 700, 800).
- **Monospace (Code / Badges):** `'Fira Code'`, Consolas, monospace.

### 1.2 Color Palette (CSS Variables)
```css
:root {
  --primary: #0284c7;           /* Sky Blue 600 */
  --primary-hover: #0369a1;     /* Sky Blue 700 */
  --primary-glow: rgba(2, 132, 199, 0.2);
  
  --bg-canvas: #090d16;         /* Deep Slate Base */
  --bg-surface: #0f172a;        /* Card & Panel Base */
  --bg-surface-elevated: #1e293b;/* Inputs & Modals */
  --bg-surface-hover: #273549;

  --text-primary: #f8fafc;      /* Crisp Heading White */
  --text-secondary: #94a3b8;    /* Subtitle & Body Slate */
  --text-muted: #64748b;        /* Placeholder & Inactive */

  --border-subtle: rgba(255, 255, 255, 0.08);
  --border-strong: rgba(255, 255, 255, 0.16);

  --accent-green: #10b981;      /* Accepted / Open / Success */
  --accent-amber: #f59e0b;      /* Pending / Warning */
  --accent-rose: #f43f5e;       /* Rejected / Closed / Error */
  --accent-purple: #a855f7;     /* Reviewed */
}
```

---

## 2. Public Pages

### 2.1 Home Page (`/`)
- **Purpose:** Platform landing page showcasing top categories and recent job opportunities.
- **Access Level:** Public (All users).
- **Core Components:** `Navbar`, `HeroSection`, `CategoryPills`, `FeaturedJobList`, `CallToActionCard`, `Footer`.
- **Primary Actions:** Search keyword input, category chip click, "Browse Jobs" button, "Post a Job" prompt.
- **Loading State:** Skeleton cards matching the dimensions of 3 featured job cards.
- **Empty State:** N/A (Always shows hero content and fallback category links).
- **Error State:** Error banner with "Retry loading featured jobs" button.
- **Success State:** Displays hero search bar and 3–6 latest active jobs.

---

### 2.2 Jobs Directory (`/jobs`)
- **Purpose:** Searchable and filterable master directory of all open job postings.
- **Access Level:** Public.
- **Core Components:** `SearchBar`, `FilterPanel` (category, type, salary range), `SortDropdown`, `JobList`, `JobCard`, `Pagination`.
- **Primary Actions:** Type search query, toggle category/type filters, adjust salary slider, click page number, click job card to open details.
- **Loading State:** Shimmer skeleton cards replacing the job list during API query execution.
- **Empty State:** Clean illustration with message: *"No matching jobs found. Try adjusting your search or filters."* and a "Reset All Filters" button.
- **Error State:** Red toast notification: *"Failed to fetch job postings. Please check your connection."*
- **Success State:** Grid of 9 job cards with title, company, salary badge, location tag, and pagination buttons at bottom.

---

### 2.3 Job Details Page (`/jobs/:id`)
- **Purpose:** In-depth view of role requirements, description, company details, and application submission trigger.
- **Access Level:** Public.
- **Core Components:** `JobHeaderCard`, `CompanyBio`, `RequirementsChecklist`, `ApplyModal` or `ApplicationForm`.
- **Primary Actions:**
  - If Guest: "Apply Now" redirects to `/login` with return state.
  - If Seeker: "Apply Now" opens the `ApplicationForm` modal.
  - If Employer (Owner): Displays "Edit Job" and "View Applicants" buttons instead of "Apply Now".
- **Loading State:** Centered pulsing loader.
- **Empty State:** N/A.
- **Error State:** If ID is invalid or job does not exist: *"Job Posting Not Found (404)"* with a button back to `/jobs`.
- **Success State:** Comprehensive markdown/rendered role description, bulleted requirements, and application trigger.

---

### 2.4 Login Page (`/login`)
- **Purpose:** Account authentication for returning Job Seekers and Employers.
- **Access Level:** Public (Redirects to dashboard if already authenticated).
- **Core Components:** `AuthCard`, `LoginForm`, `EmailInput`, `PasswordInput`, `SubmitButton`.
- **Primary Actions:** Submit email/password, navigate to `/register`.
- **Loading State:** Spinner inside submit button (`"Logging in..."`); inputs disabled.
- **Error State:** Alert banner above form: *"Invalid email or password."*
- **Success State:** Instantly updates `AuthContext` and redirects to `/seeker/dashboard` or `/employer/dashboard`.

---

### 2.5 Register Page (`/register`)
- **Purpose:** Account creation with role selection.
- **Access Level:** Public (Redirects to dashboard if logged in).
- **Core Components:** `RoleSelectorTabs` (`Job Seeker` vs. `Employer`), `RegisterForm`, `CompanyInput` (conditional).
- **Primary Actions:** Select role tab, fill name/email/password, fill company name if Employer, submit.
- **Loading State:** Submit button displays `"Creating account..."` with disabled inputs.
- **Error State:**
  - 409 Conflict: *"An account with this email address already exists."*
  - 400 Bad Request: Field validation error messages under respective inputs.
- **Success State:** Redirects directly to the user's new dashboard.

---

## 3. Job Seeker Protected Pages

### 3.1 Seeker Dashboard (`/seeker/dashboard`)
- **Purpose:** Overview of application pipeline and quick links to continue applying.
- **Access Level:** Authenticated (`JOB_SEEKER` only).
- **Core Components:** `MetricCardGrid` (Total Applications, Pending, Reviewed, Accepted, Rejected), `RecentApplicationsTable`, `QuickSearchLink`.
- **Primary Actions:** Click metric card to filter applications table; click job title to view details.
- **Loading State:** Metric card skeletons.
- **Empty State:** When 0 applications submitted: *"You haven't submitted any applications yet. Explore open jobs to start your journey."* with a `"Browse Jobs"` CTA.
- **Error State:** Banner: *"Could not load dashboard statistics."*

---

### 3.2 My Applications (`/seeker/applications`)
- **Purpose:** Full historical list of all jobs applied to by the seeker.
- **Access Level:** Authenticated (`JOB_SEEKER` only).
- **Core Components:** `ApplicationTable`, `StatusBadge`, `ResumeLinkAnchor`, `CoverLetterSnippetModal`.
- **Primary Actions:** Click status badge to inspect details, open external resume link.
- **Loading State:** Shimmer table rows.
- **Empty State:** *"No applications recorded."*
- **Success State:** Displays Job Title, Company, Applied Date, Submitted Resume Link, and Status (`PENDING`, `REVIEWED`, `ACCEPTED`, `REJECTED`).

---

### 3.3 Seeker Profile (`/seeker/profile`)
- **Purpose:** Profile management and password updates.
- **Access Level:** Authenticated (`JOB_SEEKER` only).
- **Core Components:** `ProfileDetailsForm`, `PasswordChangeForm`.
- **Primary Actions:** Update full name, update password with current password verification.
- **Loading State:** Disabled inputs with save indicators.
- **Success State:** Green toast: *"Profile updated successfully."*

---

## 4. Employer Protected Pages

### 4.1 Employer Dashboard (`/employer/dashboard`)
- **Purpose:** Command center displaying recruitment pipeline, active jobs, and total applicants.
- **Access Level:** Authenticated (`EMPLOYER` only).
- **Core Components:** `KPIStatsCards` (Total Jobs, Open Jobs, Closed Jobs, Total Applicants, Pending Reviews, Accepted Hires), `RecentJobsList`, `CandidateActivityStream`.
- **Primary Actions:** Click "Post New Job", click a job to view its applicants.
- **Loading State:** Shimmer cards.
- **Empty State:** *"You haven't posted any jobs yet. Create your first listing to start receiving candidates."*

---

### 4.2 My Jobs Management (`/employer/jobs`)
- **Purpose:** Manage, edit, close, and delete jobs posted by the employer.
- **Access Level:** Authenticated (`EMPLOYER` only).
- **Core Components:** `JobsTable`, `StatusToggle` (OPEN/CLOSED), `EditButton`, `DeleteConfirmModal`, `ApplicantsCountBadge`.
- **Primary Actions:** Toggle job between OPEN and CLOSED, navigate to edit form, delete job, view applicants.
- **Loading State:** Skeleton table rows.
- **Empty State:** *"No jobs created yet."* with "Create Job" button.

---

### 4.3 Create Job (`/employer/jobs/create`) & Edit Job (`/employer/jobs/:id/edit`)
- **Purpose:** Form for publishing or updating a job posting.
- **Access Level:** Authenticated (`EMPLOYER` only).
- **Core Components:** `JobForm`, `CategorySelect`, `TypeSelect`, `RequirementsTagInput`, `SalaryNumberInput`, `StatusRadioGroup`.
- **Primary Actions:** Submit form, add/remove requirement tags, save draft.
- **Loading State:** Save button shows spinner; inputs disabled.
- **Success State:** Redirects to `/employer/jobs` with toast *"Job posted/updated successfully."*

---

### 4.4 Job Applicants Board (`/employer/jobs/:id/applicants`)
- **Purpose:** Dedicated decision board for reviewing candidate applications for a specific job.
- **Access Level:** Authenticated (`EMPLOYER` only; must own the target job).
- **Core Components:** `ApplicantCard`, `CandidateEmail`, `CoverLetterViewer`, `ResumeExternalLink`, `StatusDropdownSelector`.
- **Primary Actions:** Click resume link (opens in new tab), change status dropdown from `PENDING` to `REVIEWED`, `ACCEPTED`, or `REJECTED`.
- **Loading State:** Candidate card skeletons.
- **Empty State:** *"No candidates have applied for this position yet."*
- **Success State:** Immediate visual update of status badge upon dropdown selection.
