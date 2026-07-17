(function () {
	const state = { store: null, activeTab: 'pages', activeItem: null };
	const qs = selector => document.querySelector(selector);
	const qsa = selector => Array.from(document.querySelectorAll(selector));
	const api = async (path, options = {}) => {
		const response = await fetch(path, {
			credentials: 'same-origin',
			headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
			...options
		});
		const data = await response.json().catch(() => ({}));
		if (!response.ok) throw new Error(data.message || data.error || `Request failed: ${response.status}`);
		return data;
	};

	document.addEventListener('DOMContentLoaded', init);

	async function init() {
		bindEvents();
		try {
			const status = await api('/api/cms/status');
			if (status.authenticated) await unlock();
		} catch (error) {
			showLogin(error.message);
		}
	}

	function bindEvents() {
		qs('[data-cms-login-form]')?.addEventListener('submit', login);
		qs('[data-cms-logout]')?.addEventListener('click', logout);
		qs('[data-cms-refresh]')?.addEventListener('click', loadStore);
		qs('[data-cms-new]')?.addEventListener('click', () => editItem(newItem('blog')));
		qs('[data-cms-new-page]')?.addEventListener('click', () => editItem(newItem('page')));
		qs('[data-cms-filter]')?.addEventListener('input', renderList);
		qs('[data-cms-editor]')?.addEventListener('submit', saveItem);
		qs('[data-cms-preview]')?.addEventListener('click', previewItem);
		qs('[data-cms-media-form]')?.addEventListener('submit', uploadMedia);
		qsa('[data-cms-tab]').forEach(button => button.addEventListener('click', () => setTab(button.dataset.cmsTab)));
		qsa('[data-command]').forEach(button => button.addEventListener('click', () => document.execCommand(button.dataset.command, false, button.dataset.value || null)));
		qs('[data-cms-link]')?.addEventListener('click', () => {
			const href = prompt('Link URL');
			if (href) document.execCommand('createLink', false, href);
		});
		qsa('[data-cms-block]').forEach(button => button.addEventListener('click', () => insertBlock(button.dataset.cmsBlock)));
	}

	async function login(event) {
		event.preventDefault();
		const token = new FormData(event.currentTarget).get('token');
		try {
			await api('/api/cms/login', { method: 'POST', body: JSON.stringify({ token }) });
			await unlock();
		} catch (error) {
			qs('[data-cms-login-status]').textContent = error.message;
		}
	}

	async function logout() {
		await api('/api/cms/logout', { method: 'POST', body: '{}' }).catch(() => {});
		showLogin('');
	}

	async function unlock() {
		qs('[data-cms-login-panel]').hidden = true;
		qs('[data-cms-workspace]').hidden = false;
		await loadStore();
	}

	function showLogin(message) {
		qs('[data-cms-login-panel]').hidden = false;
		qs('[data-cms-workspace]').hidden = true;
		if (message) qs('[data-cms-login-status]').textContent = message;
	}

	async function loadStore() {
		state.store = await api('/api/cms/content');
		renderList();
		renderMedia();
		if (!state.activeItem) editItem(filteredItems()[0] || newItem(state.activeTab === 'pages' ? 'page' : 'blog'));
	}

	function setTab(tab) {
		state.activeTab = tab;
		qsa('[data-cms-tab]').forEach(button => button.classList.toggle('active', button.dataset.cmsTab === tab));
		qs('[data-cms-media-panel]').hidden = tab !== 'media';
		qs('[data-cms-editor]').hidden = tab === 'media';
		qs('[data-cms-list-title]').textContent = tabLabel(tab);
		qs('[data-cms-list-label]').textContent = tab === 'seo' ? 'Optimization' : 'Content';
		renderList();
	}

	function renderList() {
		const list = qs('[data-cms-list]');
		if (!list || !state.store) return;
		const items = filteredItems();
		list.innerHTML = items.map(item => `
			<button type="button" class="cms-list-item ${state.activeItem?.id === item.id ? 'active' : ''}" data-id="${escapeHtml(item.id)}">
				<span>${escapeHtml(item.type)}</span>
				<strong>${escapeHtml(item.title)}</strong>
				<small>${escapeHtml(item.status)} / ${escapeHtml(item.slug)}</small>
			</button>
		`).join('') || '<p class="brief-copy">No content found.</p>';
		list.querySelectorAll('[data-id]').forEach(button => button.addEventListener('click', () => editItem(state.store.items.find(item => item.id === button.dataset.id))));
	}

	function filteredItems() {
		if (!state.store) return [];
		const filter = String(qs('[data-cms-filter]')?.value || '').toLowerCase();
		let items = state.store.items || [];
		if (state.activeTab === 'pages') items = items.filter(item => item.type === 'page');
		else if (state.activeTab === 'blog') items = items.filter(item => item.type === 'blog');
		else if (state.activeTab === 'faqs') items = items.filter(item => item.faqs?.length || item.type === 'faq');
		else if (state.activeTab === 'seo') items = items.filter(item => item.type === 'page' || item.type === 'blog');
		else if (state.activeTab === 'categories') items = (state.store.categories || []).map(name => ({ id: `category-${name}`, type: 'category', title: name, slug: name, status: 'managed' }));
		else if (state.activeTab === 'tags') items = (state.store.tags || []).map(name => ({ id: `tag-${name}`, type: 'tag', title: name, slug: name, status: 'managed' }));
		if (filter) items = items.filter(item => `${item.title} ${item.slug} ${item.status}`.toLowerCase().includes(filter));
		return items;
	}

	function editItem(item) {
		if (!item || item.type === 'category' || item.type === 'tag') return;
		state.activeItem = item;
		const form = qs('[data-cms-editor]');
		form.hidden = false;
		form.elements.id.value = item.id || '';
		form.elements.type.value = item.type || 'blog';
		form.elements.title.value = item.title || '';
		form.elements.slug.value = item.slug || '';
		form.elements.status.value = item.status || 'draft';
		form.elements.scheduledAt.value = item.scheduledAt ? item.scheduledAt.slice(0, 16) : '';
		form.elements.metaTitle.value = item.metaTitle || '';
		form.elements.metaDescription.value = item.metaDescription || '';
		form.elements.openGraphTitle.value = item.openGraphTitle || '';
		form.elements.openGraphDescription.value = item.openGraphDescription || '';
		form.elements.canonicalUrl.value = item.canonicalUrl || '';
		form.elements.categories.value = (item.categories || []).join(', ');
		form.elements.tags.value = (item.tags || []).join(', ');
		form.elements.author.value = item.author || 'ApexOneIQ';
		form.elements.featuredImage.value = item.featuredImage || '';
		form.elements.imageAlt.value = item.imageAlt || '';
		form.elements.excerpt.value = item.excerpt || '';
		form.elements.faqs.value = JSON.stringify(item.faqs || [], null, 2);
		qs('[data-cms-body]').innerHTML = item.bodyHtml || '<p></p>';
		qs('[data-cms-editor-title]').textContent = item.id ? `Edit ${item.type}` : `New ${item.type}`;
		renderAnalysis(item);
		renderList();
	}

	async function saveItem(event) {
		event.preventDefault();
		const form = event.currentTarget;
		const item = formItem(form);
		const id = form.elements.id.value;
		const result = id
			? await api(`/api/cms/content/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(item) })
			: await api('/api/cms/content', { method: 'POST', body: JSON.stringify(item) });
		state.activeItem = result.item;
		await loadStore();
		editItem(result.item);
	}

	function formItem(form) {
		let faqs = [];
		try { faqs = JSON.parse(form.elements.faqs.value || '[]'); } catch (error) { faqs = []; }
		return {
			type: form.elements.type.value,
			title: form.elements.title.value,
			slug: form.elements.slug.value,
			status: form.elements.status.value,
			scheduledAt: form.elements.scheduledAt.value ? new Date(form.elements.scheduledAt.value).toISOString() : '',
			metaTitle: form.elements.metaTitle.value,
			metaDescription: form.elements.metaDescription.value,
			openGraphTitle: form.elements.openGraphTitle.value,
			openGraphDescription: form.elements.openGraphDescription.value,
			canonicalUrl: form.elements.canonicalUrl.value,
			categories: csv(form.elements.categories.value),
			tags: csv(form.elements.tags.value),
			author: form.elements.author.value,
			featuredImage: form.elements.featuredImage.value,
			imageAlt: form.elements.imageAlt.value,
			excerpt: form.elements.excerpt.value,
			bodyHtml: qs('[data-cms-body]').innerHTML,
			faqs
		};
	}

	function previewItem() {
		const item = formItem(qs('[data-cms-editor]'));
		const win = window.open('', '_blank');
		win.document.write(`<!doctype html><title>${escapeHtml(item.title)}</title><link rel="stylesheet" href="/css/app.css"><body><main class="main"><section class="brief-panel cms-article"><h1>${escapeHtml(item.title)}</h1><div class="cms-body">${item.bodyHtml}</div></section></main></body>`);
		win.document.close();
	}

	function renderAnalysis(item) {
		const words = textOnly(item.bodyHtml).split(/\s+/).filter(Boolean).length;
		const missing = [!item.metaTitle && 'Meta title', !item.metaDescription && 'Meta description', item.featuredImage && !item.imageAlt && 'Image alt text', !/href=["']\//i.test(item.bodyHtml) && 'Internal link'].filter(Boolean);
		const score = Math.min(100, Math.round((item.metaTitle ? 25 : 5) + (item.metaDescription ? 25 : 5) + (words >= 300 ? 20 : 8) + ((item.faqs || []).length ? 15 : 0) + (!missing.length ? 15 : 4)));
		qs('[data-cms-analysis]').innerHTML = `
			<div><span class="table-label">SEO Score</span><strong>${score}/100</strong></div>
			<div><span class="table-label">Readability</span><strong>${words >= 150 ? 'Good' : 'Needs depth'}</strong></div>
			<div><span class="table-label">AI Visibility</span><strong>${/(<h2|<h3)/i.test(item.bodyHtml) || item.faqs?.length ? 'Ready' : 'Needs structure'}</strong></div>
			<div><span class="table-label">Schema</span><strong>${item.type === 'blog' ? 'Article ready' : 'Page ready'}</strong></div>
			<p>${missing.length ? `Missing: ${missing.join(', ')}` : 'No blocking metadata issues detected.'}</p>
		`;
	}

	function insertBlock(type) {
		const blocks = {
			quote: '<blockquote>Important executive insight goes here.</blockquote>',
			callout: '<div class="drawer-callout"><span>Callout text</span></div>',
			table: '<table><thead><tr><th>Signal</th><th>Status</th></tr></thead><tbody><tr><td>Trust</td><td>Ready</td></tr></tbody></table>',
			code: '<pre><code>Code example</code></pre>',
			button: '<p><a class="button" href="/pricing">View Plans</a></p>',
			faq: '<h2>Frequently Asked Question</h2><p>Answer the question clearly.</p>'
		};
		document.execCommand('insertHTML', false, blocks[type] || '<p></p>');
	}

	async function uploadMedia(event) {
		event.preventDefault();
		const file = event.currentTarget.elements.file.files[0];
		if (!file) return;
		const data = await fileToDataUrl(file);
		await api('/api/cms/media', { method: 'POST', body: JSON.stringify({ filename: file.name, mime: file.type, data, alt: event.currentTarget.elements.alt.value }) });
		await loadStore();
	}

	function renderMedia() {
		const grid = qs('[data-cms-media-grid]');
		if (!grid || !state.store) return;
		grid.innerHTML = (state.store.media || []).map(media => `
			<div class="cms-media-card">
				${media.mime?.startsWith('image/') ? `<img src="${escapeHtml(media.url)}" alt="${escapeHtml(media.alt || media.filename)}">` : '<div class="cms-file-icon">FILE</div>'}
				<strong>${escapeHtml(media.filename)}</strong>
				<button type="button" class="ghost-button" data-copy="${escapeHtml(media.url)}">Copy URL</button>
			</div>
		`).join('') || '<p class="brief-copy">No media uploaded yet.</p>';
		grid.querySelectorAll('[data-copy]').forEach(button => button.addEventListener('click', () => navigator.clipboard?.writeText(button.dataset.copy)));
	}

	function newItem(type) {
		return { type, title: '', slug: '', status: 'draft', categories: [], tags: [], faqs: [], bodyHtml: '<p></p>', author: 'ApexOneIQ' };
	}

	function fileToDataUrl(file) {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => resolve(reader.result);
			reader.onerror = reject;
			reader.readAsDataURL(file);
		});
	}

	function csv(value) {
		return String(value || '').split(',').map(item => item.trim()).filter(Boolean);
	}

	function textOnly(html) {
		const div = document.createElement('div');
		div.innerHTML = html || '';
		return div.textContent || '';
	}

	function tabLabel(tab) {
		return ({ pages: 'Pages', blog: 'Blog', faqs: 'FAQs', categories: 'Categories', tags: 'Tags', media: 'Media', seo: 'SEO' })[tab] || 'Content';
	}

	function escapeHtml(value) {
		return String(value || '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
	}
})();
