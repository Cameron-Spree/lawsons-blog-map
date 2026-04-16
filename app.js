/* ═══════════════════════════════════════════
   APP ENGINE — Lawsons Blog Content Map
   ═══════════════════════════════════════════ */

(function () {
    'use strict';

    // ── State ──
    let posts = [];
    let categories = {};   // { name: { posts: [], topics: Set } }
    let sortCol = null;
    let sortDir = 'asc';

    const BLOG_PREFIX = 'https://www.lawsons.co.uk/blog/';

    // ── Colour palette for category cards ──
    const PALETTE = [
        '#66BB6A', '#42A5F5', '#AB47BC', '#FFA726',
        '#EF5350', '#26C6DA', '#EC407A', '#8D6E63',
        '#7E57C2', '#FFEE58', '#78909C', '#FF7043',
        '#5C6BC0', '#9CCC65', '#29B6F6', '#D4E157'
    ];

    // ── Extensive industry knowledge base for Gap Analysis ──
    const KNOWLEDGE_BASE = {
        'decking': [
            'Composite vs Timber decking comparison', 'How to build a decking subframe', 'Best decking oils & stains for 2025',
            'Decking maintenance checklist (seasonal)', 'How to clean and restore old decking', 'Non-slip decking options for safety',
            'Choosing the right decking boards for your garden', 'Deck decking ideas for small gardens', 'How long does timber decking last'
        ],
        'fencing': [
            'Closeboard vs lap panel fencing', 'How to install fence posts in concrete', 'Best fence panels for windy areas',
            'Garden privacy solutions with fencing', 'Decorative fencing ideas for front gardens', 'How long does timber fencing last?',
            'Fence maintenance tips by season', 'Trellis fencing ideas', 'Repairing a broken fence post'
        ],
        'landscaping': [
            'How to lay railway sleepers in the garden', 'Choosing decorative aggregates', 'Garden edging ideas with timber',
            'Raised bed construction guide', 'Retaining wall guide with sleepers', 'Using bark mulch vs gravel – pros and cons',
            'Topsoil guide: what you need to know', 'Laying a patio base'
        ],
        'building': [
            'A guide to building regulations for homeowners', 'Types of bricks and when to use them', 'Insulation buying guide',
            'Lintels explained – types and sizing', 'Understanding DPC and DPM', 'How to read a building plan for beginners',
            'Cement mixing ratios for beginners', 'Breeze blocks vs concrete blocks'
        ],
        'roofing': [
            'Felt vs membrane flat roofing', 'Common roof tile types in the UK', 'How to repair a leaking roof',
            'Roof insulation options and U-values', 'Lead flashing alternatives', 'EPDM rubber roofing benefits',
            'How to felt a shed roof properly'
        ],
        'timber': [
            'Treated vs untreated timber – which to choose', 'Timber grading explained (C16, C24)', 'How to store timber properly on site',
            'Sustainable timber sourcing and FSC certification', 'Warped timber: prevention and solutions',
            'Rough sawn vs planed timber'
        ],
        'sheet materials': [
            'Plywood grades explained', 'When to use OSB vs Plywood', 'MDF finishing techniques', 'Marine ply uses',
            'Chipboard flooring installation guide'
        ],
        'plumbing': [
            'Push-fit vs soldered plumbing fittings', 'How to install a radiator', 'Pipe sizing guide for domestic properties',
            'Underfloor heating system types', 'Clearing blocked external drains'
        ],
        'electrical': [
            'Wiring basics for outbuildings', 'Types of electrical cable explained', 'Outdoor lighting planning',
            'Safe bathroom electrical zones', 'Choosing external sockets'
        ],
        'tools': [
            'Essential tools for every tradesperson', 'Power tool safety guide', 'How to choose the right drill bits',
            'Hand tool vs power tool: when to use each', 'Maintaining your saw blades'
        ],
        'decorating': [
            'Best exterior paints for masonry', 'Preparing timber for painting', 'Wallpapering tips', 
            'Choosing brushes vs rollers', 'Woodcare finishes: Varnish vs Stain vs Oil'
        ],
        'insulation': [
            'Types of insulation and R-values', 'Cavity wall vs solid wall insulation', 'Loft insulation installation guide',
            'Thermal bridging – what it is and how to avoid it', 'PIR vs Mineral wool insulation'
        ],
        'drainage': [
            'Surface water drainage options for driveways', 'How to install a soakaway', 'Channel drain installation guide',
            'Land drainage for gardens'
        ],
        'garden buildings': [
            'How to build a shed base', 'Insulating a summerhouse', 'Maintaining timber sheds', 'Log cabin planning permission'
        ],
        'ironmongery': [
            'Types of door hinges', 'Security locks guide', 'Choosing door handles', 'Gate furniture guide'
        ],
        'doors & windows': [
            'Hanging an internal door', 'uPVC vs timber windows', 'Skylight installation', 'Fixing drafty windows'
        ],
        'flooring': [
            'Laying laminate flooring', 'Engineered wood vs solid wood', 'Underfloor heating for wood floors'
        ],
        'hardware': [
            'Screws guide: which to use', 'Wall plugs explained', 'Nails types and uses'
        ]
    };

    // ───────────────────────────────────────
    //  CSV PARSING
    // ───────────────────────────────────────
    function parseCSV(text) {
        const lines = text.split(/\r?\n/).filter(l => l.trim());
        if (lines.length < 2) return [];

        // Parse header (ignore topic column)
        const header = parseCSVLine(lines[0]).map(h => h.trim().toLowerCase().replace(/[^a-z0-9_]/g, ''));
        const slugIdx = header.indexOf('slug');
        const titleIdx = header.indexOf('title');
        const catIdx = header.indexOf('category');
        const dateIdx = header.indexOf('publisheddate');

        if (titleIdx === -1 || catIdx === -1) {
            alert('CSV must contain at least "title" and "category" columns.');
            return [];
        }

        const result = [];
        for (let i = 1; i < lines.length; i++) {
            const cols = parseCSVLine(lines[i]);
            const title = (cols[titleIdx] || '').trim();
            const categoryStr = (cols[catIdx] || '').trim();
            if (!title || !categoryStr) continue;

            // Split by comma or pipe, trim whitespace
            const cats = categoryStr.split(/[,\x7C]/).map(c => c.trim()).filter(c => c);
            const primaryCategory = cats.length > 0 ? cats[0] : 'Uncategorised';
            const secondaryCategories = cats.length > 1 ? cats.slice(1) : [];
            
            const dateRaw = dateIdx !== -1 ? (cols[dateIdx] || '').trim() : '';
            let parsedDate = null;
            if (dateRaw) {
               const match = dateRaw.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
               if (match) {
                   parsedDate = new Date(match[3], parseInt(match[2])-1, match[1]).getTime();
               }
            }

            result.push({
                idx: i,
                slug: slugIdx !== -1 ? (cols[slugIdx] || '').trim() : slugify(title),
                title: title,
                primaryCategory: primaryCategory,
                secondaryCategories: secondaryCategories,
                liveStatus: null,
                publishDateStr: dateRaw,
                publishTimestamp: parsedDate
            });
        }
        return result;
    }

    function parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
            const ch = line[i];
            if (inQuotes) {
                if (ch === '"' && line[i + 1] === '"') {
                    current += '"'; i++;
                } else if (ch === '"') {
                    inQuotes = false;
                } else {
                    current += ch;
                }
            } else {
                if (ch === '"') {
                    inQuotes = true;
                } else if (ch === ',') {
                    result.push(current); current = '';
                } else {
                    current += ch;
                }
            }
        }
        result.push(current);
        return result;
    }

    function slugify(str) {
        return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    }

    // ───────────────────────────────────────
    //  DATA PROCESSING
    // ───────────────────────────────────────
    function processData() {
        categories = {};
        posts.forEach(p => {
            const allCats = [p.primaryCategory, ...p.secondaryCategories];
            
            allCats.forEach(cat => {
                if (!categories[cat]) {
                    categories[cat] = { posts: [], secondaryOf: new Set() };
                }
                if (!categories[cat].posts.find(x => x.idx === p.idx)) {
                    categories[cat].posts.push(p);
                }
                if (cat !== p.primaryCategory) {
                    categories[cat].secondaryOf.add(p.primaryCategory);
                }
            });
        });
    }

    function getHealthClass(count, max) {
        const ratio = count / max;
        if (ratio <= 0.15) return 'health-critical';
        if (ratio <= 0.35) return 'health-warning';
        if (ratio <= 0.7)  return 'health-good';
        return 'health-great';
    }

    function getCatColor(index) {
        return PALETTE[index % PALETTE.length];
    }

    // ───────────────────────────────────────
    //  RENDER: STATS STRIP
    // ───────────────────────────────────────
    function renderStats() {
        const totalPosts = posts.length;
        const totalCats = Object.keys(categories).length;
        const counts = Object.values(categories).map(c => c.posts.length);
        const avgPosts = totalCats > 0 ? Math.round(totalPosts / totalCats) : 0;
        const thinCats = counts.filter(c => c <= Math.max(2, avgPosts * 0.3)).length;
        const maxCount = Math.max(...counts, 1);
        const minCount = Math.min(...counts, 0);

        document.getElementById('stats-strip').innerHTML = `
            <div class="stat-card"><div class="stat-value">${totalPosts}</div><div class="stat-label">Total Posts</div></div>
            <div class="stat-card"><div class="stat-value accent">${totalCats}</div><div class="stat-label">Categories</div></div>
            <div class="stat-card"><div class="stat-value">${avgPosts}</div><div class="stat-label">Avg per Category</div></div>
            <div class="stat-card"><div class="stat-value warning">${thinCats}</div><div class="stat-label">Thin Categories</div></div>
            <div class="stat-card"><div class="stat-value">${maxCount}</div><div class="stat-label">Largest Category</div></div>
            <div class="stat-card"><div class="stat-value critical">${minCount}</div><div class="stat-label">Smallest Category</div></div>
        `;
    }

    // ───────────────────────────────────────
    //  RENDER: CATEGORY GRID (Overview)
    // ───────────────────────────────────────
    function renderCategoryGrid() {
        const grid = document.getElementById('category-grid');
        const counts = Object.values(categories).map(c => c.posts.length);
        const maxCount = Math.max(...counts, 1);

        const sortedCats = Object.entries(categories).sort((a, b) => b[1].posts.length - a[1].posts.length);

        grid.innerHTML = sortedCats.map(([name, data], i) => {
            const count = data.posts.length;
            const pct = Math.round((count / maxCount) * 100);
            const health = getHealthClass(count, maxCount);
            const color = getCatColor(i);
            const secondaryPills = [...data.secondaryOf].slice(0, 3).map(t =>
                `<span class="topic-pill">Sub of: ${esc(t)}</span>`
            ).join('');

            return `
                <div class="cat-card ${health}" data-category="${esc(name)}" style="--card-color: ${color}">
                    <div class="cat-card-header">
                        <div class="cat-card-name">${esc(name)}</div>
                        <div class="cat-card-count">${count}</div>
                    </div>
                    <div class="cat-card-bar">
                        <div class="cat-card-bar-fill" style="width:${pct}%; background:${color};"></div>
                    </div>
                    ${secondaryPills ? `<div class="cat-card-topics">${secondaryPills}</div>` : '<div style="font-size:0.75rem;color:var(--text-muted);">Top Level Category</div>'}
                </div>
            `;
        }).join('');

        // Card click → modal
        grid.querySelectorAll('.cat-card').forEach(card => {
            card.addEventListener('click', () => openCategoryModal(card.dataset.category));
        });
    }

    // ───────────────────────────────────────
    //  RENDER: GAP ANALYSIS
    // ───────────────────────────────────────
    function renderGapAnalysis() {
        const chartEl = document.getElementById('gap-chart');
        const suggestionsEl = document.getElementById('gap-suggestions');

        const sorted = Object.entries(categories).sort((a, b) => a[1].posts.length - b[1].posts.length);
        const maxCount = sorted.length > 0 ? Math.max(...sorted.map(s => s[1].posts.length), 1) : 1;
        const avgCount = posts.length / Math.max(Object.keys(categories).length, 1);

        // Bar chart
        chartEl.innerHTML = sorted.map(([name, data], i) => {
            const count = data.posts.length;
            const pct = Math.round((count / maxCount) * 100);
            const color = getCatColor(Object.keys(categories).indexOf(name));
            let barColor;
            if (count <= Math.max(1, avgCount * 0.3)) barColor = 'var(--status-critical)';
            else if (count <= avgCount * 0.6) barColor = 'var(--status-warning)';
            else barColor = color;

            return `
                <div class="gap-row">
                    <div class="gap-label" title="${esc(name)}">${esc(name)}</div>
                    <div class="gap-bar-track">
                        <div class="gap-bar-fill" style="width:${pct}%; background:${barColor};"></div>
                    </div>
                    <div class="gap-count">${count}</div>
                </div>
            `;
        }).join('');

        // Suggestions
        const thinThreshold = Math.max(2, Math.round(avgCount * 0.4));
        const thinCats = sorted.filter(([, d]) => d.posts.length <= thinThreshold);

        let suggestionsHTML = '';

        if (thinCats.length === 0) {
            suggestionsHTML = `<div class="gap-suggestion-card"><h4>✅ Looking good!</h4><p>No critically thin categories detected. Consider deepening content in your smaller categories to maintain balance.</p></div>`;
        } else {
            suggestionsHTML = thinCats.map(([name, data]) => {
                const count = data.posts.length;
                const deficit = Math.round(avgCount) - count;
                const priority = count <= 1 ? 'high' : count <= thinThreshold / 2 ? 'medium' : 'low';
                const catKey = name.toLowerCase();

                // Find matching topic suggestions from the extensive KNOWLEDGE_BASE
                let ideas = [];
                for (const [key, suggestions] of Object.entries(KNOWLEDGE_BASE)) {
                    if (catKey.includes(key) || key.includes(catKey)) {
                        // Filter out ideas that already seem covered
                        const existingTitles = data.posts.map(p => p.title.toLowerCase());
                        ideas = suggestions.filter(s =>
                            !existingTitles.some(t => similarity(t, s.toLowerCase()) > 0.5)
                        ).slice(0, 5);
                        break;
                    }
                }

                // Generic suggestions if no match
                if (ideas.length === 0) {
                    ideas = [
                        `Beginner's guide to ${name.toLowerCase()}`,
                        `${name} buying guide for trade and DIY`,
                        `Top ${name.toLowerCase()} tips for 2025`,
                        `Common ${name.toLowerCase()} mistakes to avoid`,
                        `${name} maintenance and aftercare guide`
                    ];
                }

                return `
                    <div class="gap-suggestion-card">
                        <h4>${esc(name)} <span class="priority ${priority}">${priority} priority</span></h4>
                        <p>Currently ${count} post${count !== 1 ? 's' : ''}. Needs roughly <strong>${Math.max(deficit, 1)} more</strong> to reach the average of ${Math.round(avgCount)}.</p>
                        <ul class="suggestion-ideas">
                            ${ideas.map(idea => `<li>${esc(idea)}</li>`).join('')}
                        </ul>
                    </div>
                `;
            }).join('');
        }

        suggestionsEl.innerHTML = suggestionsHTML;
    }

    // Simple word-overlap similarity for filtering suggestions
    function similarity(a, b) {
        const wordsA = new Set(a.split(/\s+/).filter(w => w.length > 3));
        const wordsB = new Set(b.split(/\s+/).filter(w => w.length > 3));
        if (wordsA.size === 0 || wordsB.size === 0) return 0;
        let overlap = 0;
        wordsA.forEach(w => { if (wordsB.has(w)) overlap++; });
        return overlap / Math.max(wordsA.size, wordsB.size);
    }

    // ───────────────────────────────────────
    //  RENDER: INTERNAL LINKS
    // ───────────────────────────────────────
    function renderInternalLinks(filterCat) {
        const container = document.getElementById('link-suggestions');
        container.innerHTML = '';

        const catsToShow = filterCat === 'all'
            ? Object.keys(categories)
            : [filterCat];

        catsToShow.forEach(catName => {
            const data = categories[catName];
            if (!data || data.posts.length < 2) return;

            const postList = data.posts;
            const pairs = [];

            // Within-category pairing: each post should link to the most related posts
            for (let i = 0; i < postList.length; i++) {
                for (let j = i + 1; j < postList.length; j++) {
                    pairs.push({ from: postList[i], to: postList[j] });
                }
            }

            // Limit displayed pairs
            const displayPairs = pairs.slice(0, 15);

            if (displayPairs.length === 0) return;

            const groupHTML = `
                <div class="link-group">
                    <div class="link-group-header">
                        <h4>${esc(catName)}</h4>
                        <span class="link-badge">${displayPairs.length} link${displayPairs.length !== 1 ? 's' : ''}</span>
                    </div>
                    ${displayPairs.map(p => `
                        <div class="link-item">
                            <div class="link-from"><strong>${esc(p.from.title)}</strong><br><a href="${BLOG_PREFIX}${esc(p.from.slug)}" target="_blank" class="slug-link">${esc(p.from.slug)}</a></div>
                            <div class="link-arrow">⟷</div>
                            <div class="link-to"><strong>${esc(p.to.title)}</strong><br><a href="${BLOG_PREFIX}${esc(p.to.slug)}" target="_blank" class="slug-link">${esc(p.to.slug)}</a></div>
                        </div>
                    `).join('')}
                </div>
            `;
            container.insertAdjacentHTML('beforeend', groupHTML);
        });

        if (container.innerHTML === '') {
            container.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:40px;">No link suggestions available. Categories need at least 2 posts for linking.</p>';
        }

        // Cross-category links section
        if (filterCat === 'all' && Object.keys(categories).length > 1) {
            const crossLinks = generateCrossCategoryLinks();
            if (crossLinks.length > 0) {
                const crossHTML = `
                    <div class="link-group" style="border-color: var(--accent); border-width: 1px;">
                        <div class="link-group-header" style="background: rgba(102,187,106,0.08);">
                            <h4>🔗 Cross-Category Links</h4>
                            <span class="link-badge">${crossLinks.length} suggestion${crossLinks.length !== 1 ? 's' : ''}</span>
                        </div>
                        ${crossLinks.map(p => `
                            <div class="link-item">
                                <div class="link-from"><strong>${esc(p.from.title)}</strong><br><a href="${BLOG_PREFIX}${esc(p.from.slug)}" target="_blank" class="slug-link">${esc(p.from.primaryCategory)}</a></div>
                                <div class="link-arrow">→</div>
                                <div class="link-to"><strong>${esc(p.to.title)}</strong><br><a href="${BLOG_PREFIX}${esc(p.to.slug)}" target="_blank" class="slug-link">${esc(p.to.primaryCategory)}</a></div>
                            </div>
                        `).join('')}
                    </div>
                `;
                container.insertAdjacentHTML('beforeend', crossHTML);
            }
        }
    }

    function generateCrossCategoryLinks() {
        const results = [];
        const catNames = Object.keys(categories);

        // Find posts across categories that share significant title words
        for (let i = 0; i < catNames.length; i++) {
            for (let j = i + 1; j < catNames.length; j++) {
                const postsA = categories[catNames[i]].posts;
                const postsB = categories[catNames[j]].posts;

                for (const a of postsA) {
                    for (const b of postsB) {
                        const sim = similarity(a.title.toLowerCase(), b.title.toLowerCase());
                        if (sim >= 0.3) {
                            results.push({ from: a, to: b, score: sim });
                        }
                    }
                }
            }
        }

        // Sort by relevance and limit
        results.sort((a, b) => b.score - a.score);
        return results.slice(0, 20);
    }

    // ───────────────────────────────────────
    //  RENDER: TABLE
    // ───────────────────────────────────────
    function renderTable(filter, search) {
        const tbody = document.getElementById('posts-tbody');
        let filtered = [...posts];

        if (filter && filter !== 'all') {
            filtered = filtered.filter(p => [p.primaryCategory, ...p.secondaryCategories].includes(filter));
        }
        if (search) {
            const q = search.toLowerCase();
            filtered = filtered.filter(p =>
                p.title.toLowerCase().includes(q) ||
                p.slug.toLowerCase().includes(q) ||
                p.primaryCategory.toLowerCase().includes(q) ||
                p.secondaryCategories.some(c => c.toLowerCase().includes(q))
            );
        }

        if (sortCol) {
            filtered.sort((a, b) => {
                const va = (a[sortCol] || '').toLowerCase();
                const vb = (b[sortCol] || '').toLowerCase();
                return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
            });
        }

        tbody.innerHTML = filtered.map(p => {
            const badge = p.liveStatus === true ? '<span class="post-status status-live">Live</span>' :
                          p.liveStatus === false ? '<span class="post-status status-404">404</span>' : '';
            return `
            <tr>
                <td>${esc(p.title)} ${badge}</td>
                <td>${esc(p.primaryCategory)}</td>
                <td>${esc(p.secondaryCategories.join(', ') || '—')}</td>
                <td>${esc(p.publishDateStr || '—')}</td>
                <td><a href="${BLOG_PREFIX}${esc(p.slug)}" target="_blank" class="slug-link">${esc(p.slug)}</a></td>
            </tr>
            `;
        }).join('');
    }

    // ───────────────────────────────────────
    //  CATEGORY MODAL
    // ───────────────────────────────────────
    function openCategoryModal(catName) {
        const overlay = document.getElementById('modal-overlay');
        const content = document.getElementById('modal-content');
        const data = categories[catName];
        if (!data) return;

        const primaryPosts = data.posts.filter(p => p.primaryCategory === catName);
        const secondaryPosts = data.posts.filter(p => p.primaryCategory !== catName);

        let html = `<h3>${esc(catName)}</h3><p class="modal-subtitle">${data.posts.length} total post${data.posts.length !== 1 ? 's' : ''}</p>`;

        if (primaryPosts.length > 0) {
            html += `<h4 style="font-size:0.8rem;text-transform:uppercase;letter-spacing:0.08em;color:var(--text-muted);margin:20px 0 8px;">Primary Posts</h4><ul class="modal-post-list">`;
            primaryPosts.forEach(p => {
                const badge = p.liveStatus === true ? '<span class="post-status status-live">Live</span>' : 
                              p.liveStatus === false ? '<span class="post-status status-404">404</span>' : '';
                html += `<li><span class="modal-post-title">${esc(p.title)} ${badge}</span><a href="${BLOG_PREFIX}${esc(p.slug)}" target="_blank" class="slug-link">${esc(p.slug)}</a></li>`;
            });
            html += `</ul>`;
        }

        if (secondaryPosts.length > 0) {
            html += `<h4 style="font-size:0.8rem;text-transform:uppercase;letter-spacing:0.08em;color:var(--text-muted);margin:20px 0 8px;">Secondary Posts</h4><ul class="modal-post-list">`;
            secondaryPosts.forEach(p => {
                const badge = p.liveStatus === true ? '<span class="post-status status-live">Live</span>' : 
                              p.liveStatus === false ? '<span class="post-status status-404">404</span>' : '';
                html += `<li><span class="modal-post-title">${esc(p.title)} ${badge} <span style="font-size:0.7rem; color:var(--text-muted)">(Primary: ${esc(p.primaryCategory)})</span></span><a href="${BLOG_PREFIX}${esc(p.slug)}" target="_blank" class="slug-link">${esc(p.slug)}</a></li>`;
            });
            html += `</ul>`;
        }

        content.innerHTML = html;
        overlay.hidden = false;
    }

    // ───────────────────────────────────────
    //  RENDER: FRESHNESS
    // ───────────────────────────────────────
    function renderFreshness() {
        const listEl = document.getElementById('freshness-list');
        if (!listEl) return;
        
        const datedPosts = posts.filter(p => p.publishTimestamp).sort((a, b) => a.publishTimestamp - b.publishTimestamp);
        const now = new Date().getTime();
        const oneYear = 1000 * 60 * 60 * 24 * 365.25;

        listEl.innerHTML = datedPosts.map(p => {
            const ageMs = now - p.publishTimestamp;
            const yearsOld = (ageMs / oneYear).toFixed(1);
            const isStale = ageMs > oneYear;
            const badgeClass = isStale ? 'status-critical' : 'status-good';

            return `
                <div class="manage-card" style="display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <span class="manage-title">${esc(p.title)}</span>
                        ${p.liveStatus === true ? '<span class="post-status status-live">Live</span>' : 
                          p.liveStatus === false ? '<span class="post-status status-404">404</span>' : ''}
                        <span class="manage-slug" style="display:block; margin-top:6px;">Published: <strong>${esc(p.publishDateStr)}</strong> (${yearsOld} years ago)</span>
                    </div>
                    <div>
                        <span class="post-status" style="color:var(--${badgeClass}); border: 1px solid var(--border-light); background: var(--bg-card); padding:4px 8px; font-size:0.7rem;">${isStale ? '⚠️ Needs Update' : '✅ Fresh'}</span>
                    </div>
                </div>
            `;
        }).join('');
        
        if (datedPosts.length === 0) listEl.innerHTML = '<p style="padding:40px; text-align:center; color:var(--text-muted);">No published dates found in CSV.</p>';
    }

    // ───────────────────────────────────────
    //  POPULATE FILTERS
    // ───────────────────────────────────────
    function populateFilters() {
        const catNames = Object.keys(categories).sort();
        const options = '<option value="all">All Categories</option>' +
            catNames.map(c => `<option value="${esc(c)}">${esc(c)}</option>`).join('');

        document.getElementById('link-category-filter').innerHTML = options;
        document.getElementById('table-category-filter').innerHTML = options;
    }

    // ───────────────────────────────────────
    //  RENDER: MINDMAP (D3.js)
    // ───────────────────────────────────────
    function renderMindmap() {
        if (typeof d3 === 'undefined') return;
        const container = document.getElementById('mindmap-container');
        container.innerHTML = '';
        const width = container.clientWidth || 1000;
        const height = container.clientHeight || 600;
        
        const rootData = { name: "Lawsons Blog", children: [] };
        const cats = Object.keys(categories).sort();
        
        cats.forEach(catName => {
            const data = categories[catName];
            const primaryPosts = data.posts.filter(p => p.primaryCategory === catName);
            
            if (primaryPosts.length > 0) {
                const node = { 
                    name: catName, 
                    children: primaryPosts.map(p => ({ name: p.title }))
                };
                rootData.children.push(node);
            }
        });

        const root = d3.hierarchy(rootData);
        
        const svg = d3.select("#mindmap-container").append("svg")
            .attr("width", width)
            .attr("height", height)
            .call(d3.zoom().on("zoom", (e) => svg.select('g').attr("transform", e.transform)))
            .append("g")
            .attr("transform", "translate(120,50)");

        const treeLayout = d3.tree().nodeSize([20, 250]);
        treeLayout(root);

        // Add Links
        svg.selectAll('.link')
            .data(root.links())
            .join('path')
            .classed('link', true)
            .attr('d', d3.linkHorizontal().x(d => d.y).y(d => d.x));

        // Add Nodes
        const nodes = svg.selectAll('.node')
            .data(root.descendants())
            .join('g')
            .classed('node', true)
            .attr('transform', d => `translate(${d.y},${d.x})`);

        nodes.append('circle').attr('r', 5);
        nodes.append('text')
            .attr('dy', '0.31em')
            .attr('x', d => d.children ? -8 : 8)
            .attr('text-anchor', d => d.children ? 'end' : 'start')
            .text(d => d.data.name)
            .clone(true).lower()
            .attr('stroke', 'var(--bg-card)')
            .attr('stroke-width', 4);
    }

    // ───────────────────────────────────────
    //  RENDER: CATEGORY MANAGER
    // ───────────────────────────────────────
    function renderCategoryManager(searchQuery = '') {
        const listEl = document.getElementById('manage-list');
        const allCats = Array.from(new Set(posts.flatMap(p => [p.primaryCategory, ...p.secondaryCategories]))).sort();
        
        let filtered = posts;
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            filtered = posts.filter(p => p.title.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q));
        }

        listEl.innerHTML = filtered.map(p => {
            const selectOptions = allCats.map(c => 
                `<option value="${esc(c)}" ${c === p.primaryCategory ? 'selected' : ''}>${esc(c)}</option>`
            ).join('');

            const secondaryCheckboxes = allCats.map(c => {
                if (c === p.primaryCategory) return '';
                const checked = p.secondaryCategories.includes(c) ? 'checked' : '';
                return `
                    <label class="secondary-cat-item">
                        <input type="checkbox" class="chk-styled chk-secondary" data-post-idx="${p.idx}" value="${esc(c)}" ${checked}>
                        ${esc(c)}
                    </label>
                `;
            }).join('');

            return `
                <div class="manage-card">
                    <div class="manage-header">
                        <div>
                            <span class="manage-title">${esc(p.title)}</span>
                            ${p.liveStatus === true ? '<span class="post-status status-live">Live</span>' : 
                              p.liveStatus === false ? '<span class="post-status status-404">404</span>' : ''}
                            <span class="manage-slug">/${esc(p.slug)}</span>
                        </div>
                    </div>
                    <div class="manage-categories">
                        <div class="manage-select-wrapper">
                            <span class="manage-label">Primary Category</span>
                            <select class="input-styled sel-primary" data-post-idx="${p.idx}">
                                ${selectOptions}
                            </select>
                        </div>
                        <div class="manage-select-wrapper" style="flex:3;">
                            <span class="manage-label">Secondary Categories</span>
                            <div class="secondary-cat-grid">
                                ${secondaryCheckboxes}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Bind events
        listEl.querySelectorAll('.sel-primary').forEach(sel => {
            sel.addEventListener('change', e => {
                const idx = parseInt(e.target.dataset.postIdx);
                const post = posts.find(p => p.idx === idx);
                post.primaryCategory = e.target.value;
                post.secondaryCategories = post.secondaryCategories.filter(c => c !== post.primaryCategory);
                renderAll();
                renderCategoryManager(document.getElementById('manage-search').value);
            });
        });

        listEl.querySelectorAll('.chk-secondary').forEach(chk => {
            chk.addEventListener('change', e => {
                const idx = parseInt(e.target.dataset.postIdx);
                const post = posts.find(p => p.idx === idx);
                const val = e.target.value;
                
                if (e.target.checked) {
                    if (!post.secondaryCategories.includes(val)) post.secondaryCategories.push(val);
                } else {
                    post.secondaryCategories = post.secondaryCategories.filter(c => c !== val);
                }
                renderAll();
            });
        });
    }

    // ───────────────────────────────────────
    //  EXPORT TO CSV
    // ───────────────────────────────────────
    function exportCSV() {
        const header = ['slug', 'title', 'category'];
        const rows = posts.map(p => {
            const catStr = [p.primaryCategory, ...p.secondaryCategories].join(', ');
            return [
                `"${p.slug.replace(/"/g, '""')}"`,
                `"${p.title.replace(/"/g, '""')}"`,
                `"${catStr.replace(/"/g, '""')}"`
            ].join(',');
        });
        
        const csvContent = "data:text/csv;charset=utf-8," + [header.join(','), ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "lawsons-blog-map-export.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // ───────────────────────────────────────
    //  API INTEGRATION: STATUS CHECKER
    // ───────────────────────────────────────
    async function checkStatuses() {
        const btn = document.getElementById('btn-check-status');
        btn.innerHTML = `<span class="spinner" style="width:14px;height:14px;margin:0;border-width:2px;display:inline-block;vertical-align:middle;margin-right:8px;"></span> Checking...`;
        btn.disabled = true;

        const batchSize = 10;
        for (let i = 0; i < posts.length; i += batchSize) {
            const batch = posts.slice(i, i + batchSize);
            await Promise.all(batch.map(async p => {
                try {
                    const url = `${BLOG_PREFIX}${p.slug}`;
                    const res = await fetch(`/api/check?url=${encodeURIComponent(url)}`);
                    if (res.ok) {
                        const data = await res.json();
                        p.liveStatus = data.status === 200;
                    } else {
                        p.liveStatus = false;
                    }
                } catch(e) {
                    p.liveStatus = false;
                }
            }));
            
            // Re-render UI progressively
            renderAll();
        }

        btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> Check Status`;
        btn.disabled = false;
    }

    // ───────────────────────────────────────
    //  MAIN RENDER PIPELINE
    // ───────────────────────────────────────
    function renderAll() {
        processData();
        renderStats();
        renderCategoryGrid();
        renderGapAnalysis();
        renderInternalLinks('all');
        renderTable('all', '');
        renderFreshness();
        populateFilters();
        
        // Let Mindmap redraw if tab is active
        const mindmapTab = document.querySelector('.tab[data-tab="mindmap"]');
        if (mindmapTab && mindmapTab.classList.contains('active')) {
            renderMindmap();
        }
        
        // Re-render manage list if active
        const manageTab = document.querySelector('.tab[data-tab="manage"]');
        if (manageTab && manageTab.classList.contains('active')) {
            renderCategoryManager(document.getElementById('manage-search').value);
        }
    }

    // ───────────────────────────────────────
    //  EVENT HANDLERS
    // ───────────────────────────────────────
    function init() {
        const dropZone = document.getElementById('drop-zone');
        const csvInput = document.getElementById('csv-input');
        const uploadScreen = document.getElementById('upload-screen');
        const dashboard = document.getElementById('dashboard');

        // Theme logic
        const themeToggles = document.querySelectorAll('#theme-toggle, #theme-toggle-upload');

        function setTheme(theme) {
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('lawsons-theme', theme);
            
            const darkIcons = document.querySelectorAll('.theme-icon-dark, #theme-icon-dark');
            const lightIcons = document.querySelectorAll('.theme-icon-light, #theme-icon-light');
            
            if (theme === 'dark') {
                darkIcons.forEach(i => i.style.display = 'block');
                lightIcons.forEach(i => i.style.display = 'none');
            } else {
                darkIcons.forEach(i => i.style.display = 'none');
                lightIcons.forEach(i => i.style.display = 'block');
            }
        }

        const savedTheme = localStorage.getItem('lawsons-theme') || 'light';
        setTheme(savedTheme);

        themeToggles.forEach(btn => {
            btn.addEventListener('click', () => {
                const currentTheme = document.documentElement.getAttribute('data-theme');
                setTheme(currentTheme === 'dark' ? 'light' : 'dark');
            });
        });

        // Drop zone
        dropZone.addEventListener('click', () => csvInput.click());
        dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
        dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
        dropZone.addEventListener('drop', e => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
            const file = e.dataTransfer.files[0];
            if (file) handleFile(file);
        });

        csvInput.addEventListener('change', () => {
            if (csvInput.files[0]) handleFile(csvInput.files[0]);
        });

        function handleFile(file) {
            if (!file.name.endsWith('.csv')) {
                alert('Please upload a .csv file');
                return;
            }
            const reader = new FileReader();
            reader.onload = e => {
                posts = parseCSV(e.target.result);
                if (posts.length === 0) {
                    alert('No valid rows found. Check your CSV format.');
                    return;
                }
                renderAll();
                uploadScreen.classList.remove('active');
                dashboard.classList.add('active');
            };
            reader.readAsText(file);
        }

        // Re-upload
        document.getElementById('btn-new-upload').addEventListener('click', () => {
            dashboard.classList.remove('active');
            uploadScreen.classList.add('active');
            csvInput.value = '';
        });

        // Tabs
        document.getElementById('tab-nav').addEventListener('click', e => {
            const tab = e.target.closest('.tab');
            if (!tab) return;
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById('panel-' + tab.dataset.tab).classList.add('active');
            
            if (tab.dataset.tab === 'mindmap') {
                setTimeout(renderMindmap, 50); // Redraw map to container bounds
            }
            if (tab.dataset.tab === 'manage') {
                renderCategoryManager(document.getElementById('manage-search').value);
            }
            if (tab.dataset.tab === 'freshness') {
                renderFreshness();
            }
        });

        // Global Event Listeners for new features
        document.getElementById('btn-export-csv').addEventListener('click', exportCSV);
        document.getElementById('btn-check-status').addEventListener('click', checkStatuses);

        document.getElementById('btn-add-global-category').addEventListener('click', () => {
            const newCat = prompt('Enter name for the new category:');
            if (newCat && newCat.trim()) {
                const catName = newCat.trim();
                // Assign to first post safely to persist category structure initially
                if (posts.length > 0) {
                    if (!posts[0].secondaryCategories.includes(catName)) {
                        posts[0].secondaryCategories.push(catName);
                    }
                }
                renderAll();
                renderCategoryManager(document.getElementById('manage-search').value);
            }
        });

        document.getElementById('manage-search').addEventListener('input', e => {
            renderCategoryManager(e.target.value);
        });

        // Modal close
        document.getElementById('modal-close').addEventListener('click', () => {
            document.getElementById('modal-overlay').hidden = true;
        });
        document.getElementById('modal-overlay').addEventListener('click', e => {
            if (e.target === e.currentTarget) {
                document.getElementById('modal-overlay').hidden = true;
            }
        });

        // Link filter
        document.getElementById('link-category-filter').addEventListener('change', e => {
            renderInternalLinks(e.target.value);
        });

        // Table filter & search
        document.getElementById('table-category-filter').addEventListener('change', () => {
            renderTable(
                document.getElementById('table-category-filter').value,
                document.getElementById('table-search').value
            );
        });

        document.getElementById('table-search').addEventListener('input', () => {
            renderTable(
                document.getElementById('table-category-filter').value,
                document.getElementById('table-search').value
            );
        });

        // Table sort
        document.querySelectorAll('#posts-table th[data-sort]').forEach(th => {
            th.addEventListener('click', () => {
                const col = th.dataset.sort;
                if (sortCol === col) {
                    sortDir = sortDir === 'asc' ? 'desc' : 'asc';
                } else {
                    sortCol = col;
                    sortDir = 'asc';
                }
                renderTable(
                    document.getElementById('table-category-filter').value,
                    document.getElementById('table-search').value
                );
            });
        });
    }

    // ── Utility ──
    function esc(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // ── Bootstrap ──
    document.addEventListener('DOMContentLoaded', init);
})();
