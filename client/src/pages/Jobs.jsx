import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import JobCard from '../components/JobCard';

const CATEGORIES = [
  'ALL',
  'Technology',
  'Healthcare',
  'Finance & Banking',
  'Marketing',
  'Design',
  'Sales',
  'Customer Support',
  'Human Resources',
  'Other',
];

const JOB_TYPES = ['ALL', 'Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'highest-salary', label: 'Highest Salary' },
  { value: 'lowest-salary', label: 'Lowest Salary' },
];

const SALARY_TIERS = [
  { value: '', label: 'Any Salary' },
  { value: '50000', label: '$50,000+' },
  { value: '75000', label: '$75,000+' },
  { value: '100000', label: '$100,000+' },
  { value: '125000', label: '$125,000+' },
  { value: '150000', label: '$150,000+' },
];

const Jobs = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read query params from URL
  const querySearch = searchParams.get('search') || '';
  const queryCategory = searchParams.get('category') || 'ALL';
  const queryType = searchParams.get('type') || 'ALL';
  const queryMinSalary = searchParams.get('minSalary') || '';
  const querySort = searchParams.get('sort') || 'newest';
  const queryPage = parseInt(searchParams.get('page') || '1', 10);

  // Local state for search input to allow smooth typing
  const [searchInput, setSearchInput] = useState(querySearch);
  const [jobs, setJobs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 9, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [error, setError] = useState('');

  // 200ms delay before showing skeletons to avoid flash of loading on fast loads
  useEffect(() => {
    let timer;
    if (loading) {
      timer = setTimeout(() => setShowSkeleton(true), 200);
    } else {
      setShowSkeleton(false);
    }
    return () => clearTimeout(timer);
  }, [loading]);

  // Keep search input synced if URL search changes externally
  useEffect(() => {
    setSearchInput(querySearch);
  }, [querySearch]);

  // Helper to update specific search params in URL
  const updateParams = useCallback((newParams) => {
    setSearchParams((prev) => {
      const updated = new URLSearchParams(prev);
      Object.entries(newParams).forEach(([key, val]) => {
        if (val === '' || val === null || val === undefined || (val === 'ALL' && key !== 'sort')) {
          updated.delete(key);
        } else {
          updated.set(key, val);
        }
      });
      // Always reset to page 1 on filter changes unless page was explicitly modified
      if (!('page' in newParams)) {
        updated.delete('page');
      }
      return updated;
    });
  }, [setSearchParams]);

  // Fetch jobs whenever URL params change
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError('');

        const params = {
          page: queryPage,
          limit: 9,
          sort: querySort,
        };

        if (querySearch.trim()) params.search = querySearch.trim();
        if (queryCategory && queryCategory !== 'ALL') params.category = queryCategory;
        if (queryType && queryType !== 'ALL') params.type = queryType;
        if (queryMinSalary) params.minSalary = queryMinSalary;

        const res = await api.get('/jobs', { params });
        setJobs(res.data.jobs || []);
        setPagination(res.data.pagination || { page: 1, limit: 9, total: 0, totalPages: 1 });
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load job listings.');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [querySearch, queryCategory, queryType, queryMinSalary, querySort, queryPage]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateParams({ search: searchInput.trim() });
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setSearchParams({});
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    updateParams({ page: newPage });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const hasActiveFilters = Boolean(
    querySearch || (queryCategory && queryCategory !== 'ALL') || (queryType && queryType !== 'ALL') || queryMinSalary || querySort !== 'newest'
  );

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container">
        
        {/* Editorial Header & Live Opportunities Counter */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
            <div>
              <h1 style={{ fontSize: '2.5rem', marginBottom: '6px' }}>Browse Opportunities</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', margin: 0 }}>
                {loading && !showSkeleton ? (
                  'Filtering openings...'
                ) : (
                  <>
                    Showing <strong style={{ color: 'var(--text-primary)' }}>{pagination.total}</strong> active {pagination.total === 1 ? 'position' : 'positions'} across vetted employers
                  </>
                )}
              </p>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="btn btn-outline"
                style={{ fontSize: '0.85rem', padding: '6px 14px' }}
              >
                ✕ Clear All Filters
              </button>
            )}
          </div>

          {/* Search bar input */}
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search by job title, company, skills, or city..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              style={{ fontSize: '1rem', padding: '12px 18px' }}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '0 24px', flexShrink: 0 }}>
              Search
            </button>
          </form>
        </div>

        {/* 2-Column Layout: Sidebar Filters + Main Job Directory */}
        <div className="jobs-layout">
          
          {/* Left Sidebar Filter Panel */}
          <aside className="filter-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Filter Directory
              </span>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontSize: '0.82rem', cursor: 'pointer', fontWeight: 600 }}
                >
                  Reset
                </button>
              )}
            </div>

            {/* Sort Filter */}
            <div className="filter-section">
              <label className="filter-title" htmlFor="sort-select">Sort By</label>
              <select
                id="sort-select"
                className="form-select"
                value={querySort}
                onChange={(e) => updateParams({ sort: e.target.value })}
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div className="filter-section">
              <label className="filter-title" htmlFor="category-select">Category</label>
              <select
                id="category-select"
                className="form-select"
                value={queryCategory}
                onChange={(e) => updateParams({ category: e.target.value })}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'ALL' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Job Type Filter */}
            <div className="filter-section">
              <label className="filter-title" htmlFor="type-select">Job Type</label>
              <select
                id="type-select"
                className="form-select"
                value={queryType}
                onChange={(e) => updateParams({ type: e.target.value })}
              >
                {JOB_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t === 'ALL' ? 'All Employment Types' : t}
                  </option>
                ))}
              </select>
            </div>

            {/* Minimum Salary Filter */}
            <div className="filter-section">
              <label className="filter-title" htmlFor="salary-select">Minimum Annual Salary</label>
              <select
                id="salary-select"
                className="form-select"
                value={queryMinSalary}
                onChange={(e) => updateParams({ minSalary: e.target.value })}
              >
                {SALARY_TIERS.map((tier) => (
                  <option key={tier.value} value={tier.value}>{tier.label}</option>
                ))}
              </select>
            </div>

          </aside>

          {/* Right Main Content: Editorial Directory Rows */}
          <main>
            {error && (
              <div className="alert alert-error" style={{ marginBottom: '24px' }}>
                {error}
              </div>
            )}

            {/* Skeleton state (shown only after 200ms delay to prevent fast flash) */}
            {loading && showSkeleton ? (
              <div className="job-directory">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="job-directory-row" style={{ opacity: 0.6 }}>
                    <div className="row-main" style={{ width: '100%' }}>
                      <div style={{ width: '38%', height: '20px', background: 'var(--border-subtle)', borderRadius: 'var(--radius-sm)', marginBottom: '8px' }} />
                      <div style={{ width: '24%', height: '14px', background: 'var(--border-subtle)', borderRadius: 'var(--radius-sm)', marginBottom: '10px' }} />
                      <div style={{ width: '55%', height: '12px', background: 'var(--border-subtle)', borderRadius: 'var(--radius-sm)' }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : !loading && jobs.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔎</div>
                <h3 style={{ marginBottom: '8px' }}>No Matches Found</h3>
                <p style={{ color: 'var(--text-muted)', maxWidth: '440px', margin: '0 auto 24px' }}>
                  We couldn't find any job postings matching your current criteria. Try adjusting your search query or reset your filters.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="btn btn-primary"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <>
                <div className="job-directory">
                  {jobs.map((job) => (
                    <JobCard key={job._id} job={job} />
                  ))}
                </div>

                {/* Server-side Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="pagination">
                    <button
                      type="button"
                      className="page-btn"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page <= 1}
                      aria-label="Previous page"
                    >
                      ← Previous
                    </button>

                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        type="button"
                        className={`page-btn ${pageNum === pagination.page ? 'active' : ''}`}
                        onClick={() => handlePageChange(pageNum)}
                      >
                        {pageNum}
                      </button>
                    ))}

                    <button
                      type="button"
                      className="page-btn"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page >= pagination.totalPages}
                      aria-label="Next page"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </main>

        </div>

      </div>
    </div>
  );
};

export default Jobs;
