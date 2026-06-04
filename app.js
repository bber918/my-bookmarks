/**
 * bookmark-site - 我的收藏面板
 * 数据文件: bookmarks.json
 * 可手动编辑，也可通过页面上的面板添加后导出 JSON
 */

// ============================================================
// 1. 数据层 — 从 bookmarks.json 加载
// ============================================================
let bookmarks = [];

async function loadBookmarks() {
    try {
        const res = await fetch('bookmarks.json');
        if (!res.ok) throw new Error('Not found');
        const data = await res.json();
        bookmarks = data.bookmarks || [];
    } catch (e) {
        console.warn('bookmarks.json not found, starting empty.');
        bookmarks = [];
    }
    renderBookmarks();
}

// ============================================================
// 2. 分类名映射
// ============================================================
const categoryLabels = {
    tech: '技术',
    life: '生活',
    design: '设计',
    other: '其他'
};

// ============================================================
// 3. 渲染
// ============================================================
function getCategoryClass(cat) {
    const map = { tech: 'cat-tech', life: 'cat-life', design: 'cat-design' };
    return map[cat] || 'cat-other';
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}/${pad(d.getMonth()+1)}/${pad(d.getDate())}`;
}

function renderBookmarks() {
    const grid = document.getElementById('bookmarksGrid');
    const search = (document.getElementById('searchInput').value || '').toLowerCase().trim();
    const activeFilter = document.querySelector('.filter-btn.active');
    const filter = activeFilter ? activeFilter.dataset.filter : 'all';

    let filtered = bookmarks.filter(b => {
        if (filter !== 'all' && b.category !== filter) return false;
        if (search) {
            const haystack = (b.title + ' ' + (b.desc || '') + ' ' + (b.source || '')).toLowerCase();
            if (!haystack.includes(search)) return false;
        }
        return true;
    });

    // Update stats
    document.getElementById('totalCount').textContent = filtered.length;
    const cats = new Set(filtered.map(b => b.category));
    document.getElementById('categoryCount').textContent = cats.size;

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🔖</div>
                <h3>还没有收藏</h3>
                <p>点击右下角的 + 按钮添加你的第一个收藏吧</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = filtered.map((b, i) => {
        const realIndex = bookmarks.indexOf(b);
        return `
            <div class="bookmark-card" onclick="window.open('${escapeJs(b.url)}', '_blank')" title="${escapeHtml(b.title)}">
                <div class="card-actions" onclick="event.stopPropagation()">
                    <button class="card-action-btn" onclick="editBookmark(${realIndex})" title="编辑">✏️</button>
                    <button class="card-action-btn delete" onclick="deleteBookmark(${realIndex})" title="删除">🗑️</button>
                </div>
                <span class="card-category ${getCategoryClass(b.category)}">${categoryLabels[b.category] || b.category}</span>
                <div class="card-title">${escapeHtml(b.title)}</div>
                ${b.desc ? `<div class="card-desc">${escapeHtml(b.desc)}</div>` : ''}
                <div class="card-meta">
                    <span class="card-source">${b.source ? `📡 ${escapeHtml(b.source)}` : '🔗 链接'}</span>
                    <span class="card-date">${b.date ? formatDate(b.date) : ''}</span>
                </div>
            </div>
        `;
    }).join('');
}

// ============================================================
// 4. 工具函数
// ============================================================
function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function escapeJs(str) {
    if (!str) return '';
    return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

// ============================================================
// 5. 筛选 & 搜索
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelector('.filter-btn.active').classList.remove('active');
            btn.classList.add('active');
            renderBookmarks();
        });
    });
});

// ============================================================
// 6. 添加/编辑/删除 (前台操作)
// ============================================================
function toggleAddPanel() {
    const panel = document.getElementById('addPanel');
    const fab = document.getElementById('fabBtn');
    panel.classList.toggle('open');
    fab.classList.toggle('open');
    if (!panel.classList.contains('open')) {
        clearForm();
    }
}

function clearForm() {
    document.getElementById('addUrl').value = '';
    document.getElementById('addTitle').value = '';
    document.getElementById('addDesc').value = '';
    document.getElementById('addSource').value = '';
    document.getElementById('addCategory').value = 'tech';
    document.getElementById('codeSnippet').style.display = 'none';
    document.getElementById('addUrl').dataset.editingIndex = '';
}

function addBookmark() {
    const url = document.getElementById('addUrl').value.trim();
    const title = document.getElementById('addTitle').value.trim();
    const desc = document.getElementById('addDesc').value.trim();
    const category = document.getElementById('addCategory').value;
    const source = document.getElementById('addSource').value.trim();

    if (!url || !title) {
        showToast('请至少填写链接和标题', 'error');
        return;
    }

    const editIndex = document.getElementById('addUrl').dataset.editingIndex;
    const entry = {
        url,
        title,
        desc,
        category,
        source: source || '',
        date: new Date().toISOString().split('T')[0]
    };

    if (editIndex !== undefined && editIndex !== '') {
        bookmarks[parseInt(editIndex)] = entry;
        showToast('✅ 已更新收藏');
    } else {
        bookmarks.push(entry);
        showToast('✅ 已添加收藏');
    }

    clearForm();
    renderBookmarks();
    toggleAddPanel();
}

function editBookmark(index) {
    const b = bookmarks[index];
    document.getElementById('addUrl').value = b.url;
    document.getElementById('addTitle').value = b.title;
    document.getElementById('addDesc').value = b.desc || '';
    document.getElementById('addCategory').value = b.category || 'other';
    document.getElementById('addSource').value = b.source || '';
    document.getElementById('addUrl').dataset.editingIndex = String(index);

    const panel = document.getElementById('addPanel');
    const fab = document.getElementById('fabBtn');
    panel.classList.add('open');
    fab.classList.add('open');
}

function deleteBookmark(index) {
    if (!confirm('确定删除这条收藏吗？')) return;
    bookmarks.splice(index, 1);
    renderBookmarks();
    showToast('🗑️ 已删除');
}

// ============================================================
// 7. 自动抓取网页信息 (通过 Open Graph / 标题)
// ============================================================
async function autoFetchMeta() {
    const url = document.getElementById('addUrl').value.trim();
    if (!url) return;

    // 尝试通过 CORS proxy 获取页面标题
    // 这里使用了一个公共的 CORS 代理（生产环境建议换成自己的）
    try {
        // 先从 URL 尝试推断来源
        try {
            const u = new URL(url);
            const domain = u.hostname.replace('www.', '').split('.')[0];
            if (!document.getElementById('addSource').value) {
                document.getElementById('addSource').value = domain;
            }
        } catch(e) {}

        // 尝试用 fetch 获取页面 title (同源限制可能失败)
        try {
            const resp = await fetch(url, { mode: 'no-cors' });
            // no-cors 模式下拿不到内容，但至少尝试了
        } catch(e) {
            // 跨域，跳过
        }
    } catch(e) {
        console.warn('Auto-fetch failed:', e);
    }
}

// ============================================================
// 8. 生成 JSON 代码片段（方便复制到 bookmarks.json）
// ============================================================
function generateCodeSnippet() {
    const url = document.getElementById('addUrl').value.trim();
    const title = document.getElementById('addTitle').value.trim();
    const desc = document.getElementById('addDesc').value.trim();
    const category = document.getElementById('addCategory').value;
    const source = document.getElementById('addSource').value.trim();

    if (!url || !title) {
        showToast('请至少填写链接和标题', 'error');
        return;
    }

    const entry = {
        url,
        title,
        desc,
        category,
        source: source || '',
        date: new Date().toISOString().split('T')[0]
    };

    document.getElementById('snippetContent').textContent = JSON.stringify(entry, null, 2);
    document.getElementById('codeSnippet').style.display = 'block';
}

function copySnippet() {
    const text = document.getElementById('snippetContent').textContent;
    navigator.clipboard.writeText(text).then(() => {
        showToast('📋 已复制到剪贴板');
    }).catch(() => {
        // fallback
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        showToast('📋 已复制到剪贴板');
    });
}

// ============================================================
// 9. Toast 消息
// ============================================================
function showToast(msg, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// ============================================================
// 10. 初始化
// ============================================================
document.addEventListener('DOMContentLoaded', loadBookmarks);
