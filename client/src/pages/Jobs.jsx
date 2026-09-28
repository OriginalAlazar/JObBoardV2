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
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'highest-salary', label: 'Highest compensation' },
  { value: 'lowest-salary', label: 'Lowest compensation' },
];

const SALARY_TIERS = [
  { value: '', label: 'Any salary' },
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

  // Local state for search input
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

  useEffect(() => {
    setSearchInput(querySearch);
  }, [querySearch]);

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
      if (!('page' in newParams)) {
        updated.delete('page');
      }
      return updated;
    });
  }, [setSearchParams]);

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
    <div style={{ padding: '48px 0 80px' }}>
      <div className="container">
        
        {/* Left-Aligned Editorial Header */}
        <div style={{ marginBottom: '36px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
            <div>
              <div style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>
                Directory
              </div>
              <h1 style={{ fontSize: '2.4rem', margin: 0, lineHeight: 1.15 }}>Open Opportunities</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '6px' }}>
                Showing <strong>{pagination.total}</strong> active {pagination.total === 1 ? 'position' : 'positions'}
              </p>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="btn btn-outline"
                style={{ fontSize: '0.85rem', padding: '6px 14px' }}
              >
                Clear all filters
              </button>
            )}
          </div>

          {/* Search bar input */}
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px', maxWidth: '640px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search by title, company, skill, or location..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              style={{ fontSize: '0.95rem', padding: '11px 16px' }}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '0 20px', flexShrink: 0 }}>
              Search →
            </button>
          </form>
        </div>

        {/* 2-Column Layout: Filter Sidebar + Large List Rows */}
        <div className="jobs-layout">
          
          {/* Left Sidebar Filter Panel */}
          <aside className="filter-sidebar">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Filters
              </span>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  style={{ background: 'transparent', border: 'none', color: 'var(--accent)', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 500 }}
                >
                  Reset
                </button>
              )}
            </div>

            {/* Sort Filter */}
            <div className="filter-section">
              <label className="filter-title" htmlFor="sort-select">Sort by</label>
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
                    {cat === 'ALL' ? 'All categories' : cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Job Type Filter */}
            <div className="filter-section">
              <label className="filter-title" htmlFor="type-select">Employment type</label>
              <select
                id="type-select"
                className="form-select"
                value={queryType}
                onChange={(e) => updateParams({ type: e.target.value })}
              >
                {JOB_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t === 'ALL' ? 'All employment types' : t}
                  </option>
                ))}
              </select>
            </div>

            {/* Minimum Salary Filter */}
            <div className="filter-section">
              <label className="filter-title" htmlFor="salary-select">Minimum compensation</label>
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

          {/* Right Main Content: Large List Rows */}
          <main>
            {error && (
              <div className="alert alert-error" style={{ marginBottom: '24px' }}>
                {error}
              </div>
            )}

            {loading && showSkeleton ? (
              <div className="job-directory">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="job-row" style={{ opacity: 0.5 }}>
                    <div className="job-row-main" style={{ width: '100%' }}>
                      <div style={{ width: '35%', height: '18px', background: 'var(--border)', borderRadius: '4px', marginBottom: '8px' }} />
                      <div style={{ width: '50%', height: '12px', background: 'var(--border)', borderRadius: '4px' }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : !loading && jobs.length === 0 ? (
              <div className="card" style={{ padding: '48px 32px' }}>
                <h3 style={{ marginBottom: '6px' }}>No positions found</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '20px', maxWidth: '440px' }}>
                  No open job postings match your active filter criteria. Try expanding your search or resetting filters.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="btn btn-secondary"
                >
                  Clear all filters
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
