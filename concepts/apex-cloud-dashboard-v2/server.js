const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const zlib = require('zlib');
const { plans, normalizePlanId, planFor, entitlementsFor } = require('./js/subscription-config.js');

const root = __dirname;
const port = Number(process.env.PORT || 4177);
const productionOrigin = 'https://apexoneiq.com';
const dataDir = path.join(root, 'data');
const subscriptionStorePath = path.join(dataDir, 'subscription-store.json');
const contentStorePath = path.join(dataDir, 'content-store.json');
const mediaDir = path.join(root, 'media');
const knowledgeCenterDir = path.join(root, 'content', 'knowledge-center');
const knowledgeCenterManifestPath = path.join(knowledgeCenterDir, 'knowledge-center-manifest.json');

loadEnvFile(path.join(root, '.env'));
loadEnvFile(path.join(root, '.env.sandbox'));

const contentTypes = {
	'.html': 'text/html; charset=utf-8',
	'.css': 'text/css; charset=utf-8',
	'.js': 'application/javascript; charset=utf-8',
	'.json': 'application/json; charset=utf-8',
	'.png': 'image/png',
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.svg': 'image/svg+xml; charset=utf-8',
	'.ico': 'image/x-icon',
	'.webp': 'image/webp',
	'.gif': 'image/gif',
	'.pdf': 'application/pdf',
	'.mp4': 'video/mp4',
	'.webm': 'video/webm',
	'.txt': 'text/plain; charset=utf-8',
	'.webmanifest': 'application/manifest+json; charset=utf-8'
};

const server = http.createServer(async (req, res) => {
	try {
		const url = new URL(req.url, `http://${req.headers.host || 'apexoneiq.com'}`);
		if (req.method === 'GET' && url.pathname === '/api/billing/config') return sendBillingConfig(res);
		if (req.method === 'GET' && url.pathname === '/api/billing/status') return sendBillingStatus(req, res, url);
		if (req.method === 'GET' && url.pathname === '/api/executive-scan') return handleExecutiveScan(req, res, url);
		if (req.method === 'POST' && url.pathname.startsWith('/api/billing/checkout/')) return handleCheckout(req, res, url);
		if (req.method === 'POST' && url.pathname === '/api/billing/portal') return handleCustomerPortal(req, res, url);
		if (req.method === 'POST' && (url.pathname === '/api/billing/webhook' || url.pathname === '/api/stripe/webhook')) return handleStripeWebhook(req, res);
		if (req.method === 'POST' && url.pathname === '/api/entitlements/check') return handleEntitlementCheck(req, res);
		if (req.method === 'POST' && url.pathname === '/api/enterprise/inquiry') return handleEnterpriseInquiry(req, res);
		if (url.pathname.startsWith('/api/cms/')) return handleCmsApi(req, res, url);
		if (req.method === 'GET' && normalizeRoutePath(url.pathname) === '/knowledge-center') return renderKnowledgeCenterIndex(req, res, url);
		if (req.method === 'GET' && normalizeRoutePath(url.pathname).startsWith('/knowledge-center/')) return renderKnowledgeCenterArticle(req, res, url);
		if (req.method === 'GET' && url.pathname === '/blog') return renderBlogIndex(req, res, url);
		if (req.method === 'GET' && url.pathname.startsWith('/blog/')) return renderBlogArticle(req, res, url);
		if (req.method === 'GET' && url.pathname === '/sitemap.xml') return renderSitemap(req, res, url);
		if (req.method === 'GET' && url.pathname === '/robots.txt') return renderRobots(req, res, url);
		if (req.method === 'GET' && normalizeRoutePath(url.pathname) === '/pricing') return serveStaticPath(req, res, '/subscription.html');
		if (req.method === 'GET' && normalizeRoutePath(url.pathname) === '/sign-in') return serveStaticPath(req, res, '/sign-in.html');
		if (req.method === 'GET' && cmsPageSlugForPath(url.pathname)) return renderCmsPage(req, res, url);
		if (req.method === 'GET' && normalizeRoutePath(url.pathname) === '/oauth/google') return handleGoogleOAuthStart(req, res, url);
		if (req.method === 'GET' && normalizeRoutePath(url.pathname) === '/oauth/google/callback') return handleGoogleOAuthCallback(req, res, url);
		if (req.method === 'GET' && isIndexNowKeyPath(url.pathname)) return renderIndexNowKey(req, res);
		if (req.method === 'POST' && url.pathname === '/api/indexnow/submit') return handleIndexNowSubmit(req, res);
		if (req.method !== 'GET' && req.method !== 'HEAD') {
			sendJson(res, 405, { error: 'method_not_allowed' });
			return;
		}
		serveStatic(req, res, url);
	} catch (error) {
		sendJson(res, 500, { error: 'server_error', message: error.message });
	}
});

server.listen(port, () => {
	console.log(`ApexOneIQ Node server listening on port ${port}`);
});

async function handleCmsApi(req, res, url) {
	if (req.method === 'POST' && url.pathname === '/api/cms/login') return handleCmsLogin(req, res);
	if (req.method === 'POST' && url.pathname === '/api/cms/logout') return handleCmsLogout(req, res);
	if (req.method === 'GET' && url.pathname === '/api/cms/status') return sendJson(res, 200, { authenticated: isCmsAuthenticated(req), authMode: 'cms_session' });
	if (!isCmsAuthenticated(req)) return sendJson(res, 401, { error: 'cms_auth_required', message: 'Admin content access requires a valid CMS session.' });
	if (req.method === 'GET' && url.pathname === '/api/cms/content') return sendJson(res, 200, readContentStore());
	if (req.method === 'GET' && url.pathname === '/api/cms/search') return handleCmsSearch(req, res, url);
	if (req.method === 'POST' && url.pathname === '/api/cms/media') return handleCmsMediaUpload(req, res);
	if (req.method === 'POST' && url.pathname === '/api/cms/content') return handleCmsContentCreate(req, res);
	if (req.method === 'PUT' && url.pathname.startsWith('/api/cms/content/')) return handleCmsContentUpdate(req, res, url);
	if (req.method === 'DELETE' && url.pathname.startsWith('/api/cms/content/')) return handleCmsContentDelete(req, res, url);
	sendJson(res, 404, { error: 'cms_route_not_found' });
}

async function handleCmsLogin(req, res) {
	const payload = await readJsonBody(req);
	const configuredToken = cmsAdminToken();
	if (!configuredToken) return sendJson(res, 503, { error: 'cms_admin_token_missing', message: 'Set APEX_CMS_ADMIN_TOKEN before using the CMS admin.' });
	if (String(payload.token || '') !== configuredToken) return sendJson(res, 401, { error: 'cms_auth_failed' });
	const session = signCmsSession({ role: 'owner', createdAt: Date.now() });
	res.writeHead(200, {
		'Content-Type': 'application/json; charset=utf-8',
		'Set-Cookie': cookieHeader('apex_cms_session', session, 60 * 60 * 12)
	});
	res.end(JSON.stringify({ authenticated: true }));
}

function handleCmsLogout(req, res) {
	res.writeHead(200, {
		'Content-Type': 'application/json; charset=utf-8',
		'Set-Cookie': cookieHeader('apex_cms_session', '', 0)
	});
	res.end(JSON.stringify({ authenticated: false }));
}

function isCmsAuthenticated(req) {
	const cookies = parseCookies(req.headers.cookie || '');
	const session = cookies.apex_cms_session || '';
	if (verifyCmsSession(session)) return true;
	const auth = String(req.headers.authorization || '');
	const token = cmsAdminToken();
	return Boolean(token && auth === `Bearer ${token}`);
}

function cmsAdminToken() {
	const token = process.env.APEX_CMS_ADMIN_TOKEN || process.env.ADMIN_CONTENT_TOKEN || '';
	if (token) return token;
	if (String(process.env.NODE_ENV || '').toLowerCase() !== 'production') return 'local-admin';
	return '';
}

function signCmsSession(payload) {
	const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
	const signature = crypto.createHmac('sha256', cmsSessionSecret()).update(encoded).digest('base64url');
	return `${encoded}.${signature}`;
}

function verifyCmsSession(value) {
	const [encoded, signature] = String(value || '').split('.');
	if (!encoded || !signature) return false;
	const expected = crypto.createHmac('sha256', cmsSessionSecret()).update(encoded).digest('base64url');
	if (!timingSafeStringEqual(signature, expected)) return false;
	try {
		const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
		return payload.role === 'owner' && Date.now() - Number(payload.createdAt || 0) < 60 * 60 * 12 * 1000;
	} catch (error) {
		return false;
	}
}

function cmsSessionSecret() {
	return process.env.SESSION_SECRET || process.env.APEX_CMS_SESSION_SECRET || 'apexoneiq-local-cms-session';
}

function timingSafeStringEqual(left, right) {
	const a = Buffer.from(String(left || ''));
	const b = Buffer.from(String(right || ''));
	return a.length === b.length && crypto.timingSafeEqual(a, b);
}

async function handleCmsContentCreate(req, res) {
	const payload = await readJsonBody(req);
	const store = readContentStore();
	const item = normalizeContentItem({ ...payload, id: createId(payload.type || 'content'), createdAt: new Date().toISOString() });
	store.items.push(item);
	writeContentStore(store);
	sendJson(res, 201, { item, analysis: analyzeContentItem(item, store) });
}

async function handleCmsContentUpdate(req, res, url) {
	const id = decodeURIComponent(url.pathname.split('/').pop() || '');
	const payload = await readJsonBody(req);
	const store = readContentStore();
	const index = store.items.findIndex(item => item.id === id);
	if (index === -1) return sendJson(res, 404, { error: 'content_not_found' });
	const previous = store.items[index];
	const item = normalizeContentItem({ ...previous, ...payload, id: previous.id, createdAt: previous.createdAt, updatedAt: new Date().toISOString() });
	store.items[index] = item;
	writeContentStore(store);
	sendJson(res, 200, { item, analysis: analyzeContentItem(item, store) });
}

function handleCmsContentDelete(req, res, url) {
	const id = decodeURIComponent(url.pathname.split('/').pop() || '');
	const store = readContentStore();
	const before = store.items.length;
	store.items = store.items.filter(item => item.id !== id);
	if (store.items.length === before) return sendJson(res, 404, { error: 'content_not_found' });
	writeContentStore(store);
	sendJson(res, 200, { deleted: true, id });
}

function handleCmsSearch(req, res, url) {
	const query = String(url.searchParams.get('q') || '').toLowerCase().trim();
	const store = readContentStore();
	const results = publicContentItems(store).filter(item => {
		const text = `${item.title} ${item.excerpt} ${stripHtml(item.bodyHtml)} ${item.tags.join(' ')}`.toLowerCase();
		return !query || text.includes(query);
	}).slice(0, 25);
	sendJson(res, 200, { query, results });
}

function renderKnowledgeCenterIndex(req, res) {
	const origin = originForRequest(req);
	const articles = readKnowledgeCenterArticles();
	const cards = articles.map(article => `
		<article class="knowledge-card">
			<img src="${escapeHtml(article.featuredImage)}" alt="${escapeHtml(article.imageAlt || article.title)}" loading="lazy" width="640" height="360">
			<div>
				<span class="eyebrow">${escapeHtml(article.category || 'Knowledge Center')}</span>
				<h2>${escapeHtml(article.title)}</h2>
				<p>${escapeHtml(article.excerpt || '')}</p>
				<div class="brief-meta">
					<div><span class="table-label">Reading Time</span><strong>${escapeHtml(article.readingTime || 'Pending')}</strong></div>
					<div><span class="table-label">Published</span><strong>${escapeHtml(article.publishDate)}</strong></div>
				</div>
				<a class="button" href="/knowledge-center/${escapeHtml(article.slug)}">Read Article</a>
			</div>
		</article>`).join('');
	const content = `
		<section class="landing-hero onboarding-hero knowledge-center-hero">
			<div class="landing-copy onboarding-copy">
				<div class="page-kicker"><span class="live-dot"></span>Knowledge Center</div>
				<h1>Executive SEO, AI Visibility, and Local Growth Guides.</h1>
				<p>Cornerstone resources built for business owners who want clear strategy, technical accuracy, and search visibility decisions they can trust.</p>
				<div class="onboarding-actions"><a class="button" href="/oauth/google/?redirect_to=/sign-in.html">Run Your Free Executive Intelligence Scan</a><a class="ghost-button" href="/faq">Read FAQ</a></div>
			</div>
		</section>
		<section class="landing-section">
			<div class="section-head">
				<div class="page-kicker">Pillar articles</div>
				<h2>Start with the guide that matches your biggest growth constraint.</h2>
			</div>
			<div class="knowledge-grid">${cards}</div>
		</section>`;
	sendHtml(res, marketingHtmlDocument({
		title: 'ApexOneIQ Knowledge Center',
		description: 'Executive SEO, AI visibility, local SEO, Google Business Profile, schema, website speed, and ranking recovery guides from ApexOneIQ.',
		canonical: `${origin}/knowledge-center`,
		body: content,
		active: 'knowledge',
		schema: [
			organizationJsonLd(origin),
			websiteJsonLd(origin),
			breadcrumbJsonLd(origin, [{ name: 'Knowledge Center', url: `${origin}/knowledge-center` }]),
			{
				'@context': 'https://schema.org',
				'@type': 'CollectionPage',
				name: 'ApexOneIQ Knowledge Center',
				url: `${origin}/knowledge-center`,
				hasPart: articles.map(article => ({ '@type': 'Article', headline: article.title, url: `${origin}/knowledge-center/${article.slug}` }))
			}
		]
	}));
}

function renderKnowledgeCenterArticle(req, res, url) {
	const slug = decodeURIComponent(normalizeRoutePath(url.pathname).replace(/^\/knowledge-center\//, ''));
	const origin = originForRequest(req);
	const articles = readKnowledgeCenterArticles();
	const article = articles.find(item => item.slug === slug);
	if (!article) return sendNotFound(res);
	const toc = knowledgeToc(article.markdown);
	const related = relatedKnowledgeArticles(article, articles).slice(0, 4);
	const relatedCards = related.map(item => `<a class="cms-card" href="/knowledge-center/${escapeHtml(item.slug)}"><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.excerpt || '')}</span></a>`).join('');
	const content = `
		<nav class="knowledge-breadcrumbs" aria-label="Breadcrumb">
			<a href="/">Home</a><span>/</span>
			<a href="/knowledge-center">Knowledge Center</a><span>/</span>
			<span>${escapeHtml(article.category || 'Knowledge Center')}</span><span>/</span>
			<strong>${escapeHtml(article.title)}</strong>
		</nav>
		<div class="knowledge-article-layout">
			<aside class="knowledge-toc-wrap">
				<details class="knowledge-toc" open>
					<summary>Table of Contents</summary>
					<nav>${toc.map(item => `<a href="#${escapeHtml(item.id)}" data-toc-link>${escapeHtml(item.text)}</a>`).join('')}</nav>
				</details>
			</aside>
			<article class="brief-panel cms-article knowledge-article">
				<div class="page-kicker">${escapeHtml(article.category || 'Knowledge Center')}</div>
				<h1>${escapeHtml(article.h1 || article.title)}</h1>
				<p class="brief-copy">${escapeHtml(article.excerpt || '')}</p>
				<div class="brief-meta">
					<div><span class="table-label">Author</span><strong>ApexOneIQ</strong></div>
					<div><span class="table-label">Reading Time</span><strong>${escapeHtml(article.readingTime || 'Pending')}</strong></div>
					<div><span class="table-label">Published</span><strong>${escapeHtml(article.publishDate)}</strong></div>
					<div><span class="table-label">Last Updated</span><strong>${escapeHtml(article.modifiedDateLabel)}</strong></div>
				</div>
				<img class="cms-featured-image" src="${escapeHtml(article.featuredImage)}" alt="${escapeHtml(article.imageAlt || article.title)}">
				<div class="knowledge-internal-links">
					<a href="/">Homepage</a>
					<a href="/faq">FAQ</a>
					<a href="/oauth/google/?redirect_to=/sign-in.html">Executive Scan</a>
					<a href="/knowledge-center">Knowledge Center</a>
				</div>
				<div class="cms-body knowledge-body">${markdownToHtml(article.markdown)}</div>
			</article>
		</div>
		<section class="brief-panel">
			<div class="panel-label">Related Articles</div>
			<div class="cms-grid compact">${relatedCards}</div>
		</section>
		<section class="landing-final knowledge-article-cta">
			<div><h2>Run Your Free Executive Intelligence Scan.</h2><p>Turn these SEO and AI visibility principles into a prioritized action plan for your own business.</p></div>
			<a class="button" href="/oauth/google/?redirect_to=/sign-in.html">Run Your Free Executive Intelligence Scan</a>
		</section>`;
	sendHtml(res, marketingHtmlDocument({
		title: article.metaTitle || article.title,
		description: article.metaDescription || article.excerpt || '',
		canonical: `${origin}/knowledge-center/${article.slug}`,
		body: content,
		active: 'knowledge',
		schema: [
			organizationJsonLd(origin),
			websiteJsonLd(origin),
			breadcrumbJsonLd(origin, [{ name: 'Knowledge Center', url: `${origin}/knowledge-center` }, { name: article.category || 'Knowledge Center', url: `${origin}/knowledge-center` }, { name: article.title, url: `${origin}/knowledge-center/${article.slug}` }]),
			knowledgeArticleJsonLd(origin, article)
		]
	}));
}

function readKnowledgeCenterArticles() {
	if (!fs.existsSync(knowledgeCenterManifestPath)) return [];
	const manifest = JSON.parse(fs.readFileSync(knowledgeCenterManifestPath, 'utf8'));
	return manifest.map(item => {
		const filePath = path.join(knowledgeCenterDir, item.file);
		const source = fs.readFileSync(filePath, 'utf8');
		const parsed = parseMarkdownWithFrontmatter(source);
		const stats = fs.statSync(filePath);
		return {
			...item,
			...parsed.data,
			file: item.file,
			title: parsed.data.title || item.title,
			slug: parsed.data.slug || item.slug,
			featuredImage: parsed.data.featuredImage || item.featuredImage || item.image || '',
			imageAlt: parsed.data.featured_image_alt || '',
			category: parsed.data.category || parsed.data.categories?.[0] || 'Knowledge Center',
			excerpt: parsed.data.excerpt || '',
			readingTime: parsed.data.reading_time || `${item.wordCount ? Math.max(1, Math.round(item.wordCount / 220)) : 20} min`,
			publishDate: formatDateOnly(stats.mtime),
			modifiedDateLabel: formatDateOnly(stats.mtime),
			modifiedDate: stats.mtime.toISOString(),
			markdown: parsed.body
		};
	});
}

function parseMarkdownWithFrontmatter(source) {
	const match = String(source || '').match(/^---\n([\s\S]*?)\n---\n?/);
	if (!match) return { data: {}, body: String(source || '') };
	const data = {};
	for (const line of match[1].split('\n')) {
		const index = line.indexOf(':');
		if (index === -1) continue;
		const key = line.slice(0, index).trim();
		let value = line.slice(index + 1).trim();
		if (/^\[.*\]$/.test(value)) {
			try {
				value = JSON.parse(value.replace(/'/g, '"'));
			} catch (error) {
				value = value.replace(/^\[|\]$/g, '').split(',').map(item => item.trim().replace(/^"|"$/g, '')).filter(Boolean);
			}
		} else {
			value = value.replace(/^"|"$/g, '');
		}
		data[key] = value;
	}
	return { data, body: source.slice(match[0].length) };
}

function markdownToHtml(markdown) {
	const lines = String(markdown || '').split('\n');
	const html = [];
	let paragraph = [];
	let list = [];
	let table = [];
	const headingIds = new Map();
	const flushParagraph = () => {
		if (!paragraph.length) return;
		html.push(`<p>${inlineMarkdown(paragraph.join(' '))}</p>`);
		paragraph = [];
	};
	const flushList = () => {
		if (!list.length) return;
		html.push(`<ul>${list.map(item => `<li>${inlineMarkdown(item)}</li>`).join('')}</ul>`);
		list = [];
	};
	const flushTable = () => {
		if (!table.length) return;
		const rows = table.map(line => line.split('|').slice(1, -1).map(cell => inlineMarkdown(cell.trim())));
		const bodyRows = rows.filter(row => !row.every(cell => /^:?-{3,}:?$/.test(stripHtml(cell).trim())));
		const [head, ...body] = bodyRows;
		html.push(`<div class="knowledge-table-wrap"><table><thead><tr>${(head || []).map(cell => `<th>${cell}</th>`).join('')}</tr></thead><tbody>${body.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`);
		table = [];
	};
	for (const line of lines) {
		const trimmed = line.trim();
		if (!trimmed) {
			flushParagraph(); flushList(); flushTable();
			continue;
		}
		if (/^\|.*\|$/.test(trimmed)) {
			flushParagraph(); flushList(); table.push(trimmed); continue;
		}
		flushTable();
		const heading = trimmed.match(/^(#{2,4})\s+(.+)$/);
		if (heading) {
			flushParagraph(); flushList();
			const level = heading[1].length;
			const id = uniqueHeadingId(stripMarkdown(heading[2]), headingIds);
			html.push(`<h${level} id="${escapeHtml(id)}">${inlineMarkdown(heading[2])}</h${level}>`);
			continue;
		}
		const item = trimmed.match(/^-\s+(.+)$/);
		if (item) {
			flushParagraph(); list.push(item[1]); continue;
		}
		flushList();
		paragraph.push(trimmed);
	}
	flushParagraph(); flushList(); flushTable();
	return html.join('\n');
}

function knowledgeToc(markdown) {
	const headingIds = new Map();
	return String(markdown || '').split('\n').map(line => {
		const match = line.trim().match(/^(#{2,3})\s+(.+)$/);
		if (!match) return null;
		const text = stripMarkdown(match[2]);
		return { level: match[1].length, text, id: uniqueHeadingId(text, headingIds) };
	}).filter(Boolean).slice(0, 24);
}

function uniqueHeadingId(value, headingIds) {
	const base = slugifyHeading(value);
	const count = headingIds.get(base) || 0;
	headingIds.set(base, count + 1);
	return count ? `${base}-${count + 1}` : base;
}

function slugifyHeading(value) {
	return String(value || '').toLowerCase().replace(/&amp;/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'section';
}

function stripMarkdown(value) {
	return String(value || '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/\*\*([^*]+)\*\*/g, '$1').replace(/[`*_]/g, '').trim();
}

function inlineMarkdown(value) {
	return escapeHtml(value)
		.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
		.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
}

function relatedKnowledgeArticles(article, articles) {
	const related = Array.isArray(article.related_articles) ? article.related_articles : [];
	const bySlug = new Map(articles.map(item => [item.slug, item]));
	const selected = related.map(slug => bySlug.get(slug)).filter(Boolean);
	if (selected.length) return selected;
	return articles.filter(item => item.slug !== article.slug && item.category === article.category);
}

function knowledgeArticleJsonLd(origin, article) {
	return {
		'@context': 'https://schema.org',
		'@type': 'Article',
		headline: article.title,
		description: article.meta_description || article.excerpt || '',
		author: { '@type': 'Organization', name: 'ApexOneIQ' },
		publisher: { '@type': 'Organization', name: 'ApexOneIQ', logo: { '@type': 'ImageObject', url: `${origin}/android-chrome-512x512.png` } },
		datePublished: article.publishDate,
		dateModified: article.modifiedDate,
		mainEntityOfPage: `${origin}/knowledge-center/${article.slug}`,
		image: article.featuredImage ? [absoluteUrl(origin, article.featuredImage)] : undefined
	};
}

function formatDateOnly(value) {
	return new Date(value).toISOString().slice(0, 10);
}

async function handleCmsMediaUpload(req, res) {
	const payload = await readJsonBody(req);
	const filename = safeFilename(payload.filename || 'upload.bin');
	const mime = String(payload.mime || 'application/octet-stream');
	const encoded = String(payload.data || '').replace(/^data:[^;]+;base64,/, '');
	if (!encoded) return sendJson(res, 400, { error: 'missing_media_data' });
	const allowed = /^(image\/(png|jpe?g|webp|gif|svg\+xml)|application\/pdf|video\/(mp4|webm)|text\/plain|application\/vnd\.openxmlformats-officedocument|application\/msword)/i;
	if (!allowed.test(mime)) return sendJson(res, 400, { error: 'unsupported_media_type', mime });
	const bytes = Buffer.from(encoded, 'base64');
	if (bytes.length > 12 * 1024 * 1024) return sendJson(res, 413, { error: 'media_too_large', limit: '12MB' });
	if (!fs.existsSync(mediaDir)) fs.mkdirSync(mediaDir, { recursive: true });
	const id = createId('media');
	const ext = path.extname(filename) || extensionForMime(mime);
	const storedName = `${id}${ext}`;
	const filePath = path.join(mediaDir, storedName);
	fs.writeFileSync(filePath, bytes);
	const store = readContentStore();
	const media = {
		id,
		type: 'media',
		filename,
		storedName,
		mime,
		size: bytes.length,
		url: `/media/${storedName}`,
		alt: String(payload.alt || ''),
		caption: String(payload.caption || ''),
		optimized: mime.startsWith('image/') ? 'Stored without recompression; dimensions and alt text are tracked.' : 'Not applicable',
		createdAt: new Date().toISOString()
	};
	store.media.push(media);
	writeContentStore(store);
	sendJson(res, 201, { media });
}

function renderBlogIndex(req, res, url) {
	const store = readContentStore();
	const page = Math.max(1, Number(url.searchParams.get('page') || 1));
	const query = String(url.searchParams.get('q') || '').trim();
	const category = String(url.searchParams.get('category') || '').trim();
	let posts = publicContentItems(store).filter(item => item.type === 'blog');
	if (query) posts = posts.filter(item => `${item.title} ${item.excerpt} ${stripHtml(item.bodyHtml)}`.toLowerCase().includes(query.toLowerCase()));
	if (category) posts = posts.filter(item => item.categories.includes(category));
	posts.sort((a, b) => String(b.publishedAt || b.updatedAt || b.createdAt).localeCompare(String(a.publishedAt || a.updatedAt || a.createdAt)));
	const perPage = 9;
	const paged = posts.slice((page - 1) * perPage, page * perPage);
	const origin = originForRequest(req);
	const cards = paged.map(post => `
		<article class="cms-card">
			<span class="eyebrow">${escapeHtml(post.categories[0] || 'ApexOneIQ')}</span>
			<h2><a href="/blog/${escapeHtml(post.slug)}">${escapeHtml(post.title)}</a></h2>
			<p>${escapeHtml(post.excerpt || plainExcerpt(post.bodyHtml))}</p>
			<div class="brief-meta"><div><span class="table-label">Reading Time</span><strong>${readingTime(post.bodyHtml)} min</strong></div><div><span class="table-label">Status</span><strong>${escapeHtml(post.status)}</strong></div></div>
		</article>`).join('');
	const content = `
		<section class="page-head"><div><div class="page-kicker">ApexOneIQ Blog</div><h1>Executive SEO and Business Growth Intelligence</h1></div></section>
		<section class="brief-panel"><form class="cms-search" action="/blog"><input name="q" value="${escapeHtml(query)}" placeholder="Search articles"><button class="button">Search</button></form></section>
		<section class="cms-grid">${cards || '<p class="brief-copy">No published articles yet.</p>'}</section>`;
	sendHtml(res, htmlDocument({
		title: 'ApexOneIQ Blog',
		description: 'Executive SEO, AI visibility, and business growth articles from ApexOneIQ.',
		canonical: `${origin}/blog`,
		body: content,
		schema: [organizationJsonLd(origin), websiteJsonLd(origin), breadcrumbJsonLd(origin, [{ name: 'Blog', url: `${origin}/blog` }])]
	}));
}

function renderBlogArticle(req, res, url) {
	const slug = decodeURIComponent(url.pathname.replace(/^\/blog\//, '').replace(/\/$/, ''));
	const store = readContentStore();
	const post = publicContentItems(store).find(item => item.type === 'blog' && item.slug === slug);
	if (!post) return sendNotFound(res);
	const origin = originForRequest(req);
	const related = relatedContent(post, store).slice(0, 3);
	const faq = post.faqs?.length ? `<section class="brief-panel"><div class="panel-label">FAQ</div>${post.faqs.map(item => `<details><summary>${escapeHtml(item.question)}</summary><p>${escapeHtml(item.answer)}</p></details>`).join('')}</section>` : '';
	const content = `
		<article class="brief-panel cms-article">
			<div class="page-kicker">${escapeHtml(post.categories[0] || 'ApexOneIQ')}</div>
			<h1>${escapeHtml(post.title)}</h1>
			<p class="brief-copy">${escapeHtml(post.excerpt || '')}</p>
			<div class="brief-meta"><div><span class="table-label">Author</span><strong>${escapeHtml(post.author || 'ApexOneIQ')}</strong></div><div><span class="table-label">Reading Time</span><strong>${readingTime(post.bodyHtml)} min</strong></div></div>
			${post.featuredImage ? `<img class="cms-featured-image" src="${escapeHtml(post.featuredImage)}" alt="${escapeHtml(post.imageAlt || post.title)}">` : ''}
			<div class="cms-body">${sanitizeHtml(post.bodyHtml)}</div>
		</article>
		${faq}
		<section class="brief-panel"><div class="panel-label">Related Articles</div><div class="cms-grid compact">${related.map(item => `<a class="cms-card" href="/blog/${escapeHtml(item.slug)}"><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.excerpt || plainExcerpt(item.bodyHtml))}</span></a>`).join('') || '<p class="brief-copy">Related articles will appear as the library grows.</p>'}</div></section>`;
	sendHtml(res, htmlDocument({
		title: post.metaTitle || post.title,
		description: post.metaDescription || post.excerpt || plainExcerpt(post.bodyHtml),
		canonical: `${origin}/blog/${post.slug}`,
		body: content,
		schema: [
			organizationJsonLd(origin),
			websiteJsonLd(origin),
			breadcrumbJsonLd(origin, [{ name: 'Blog', url: `${origin}/blog` }, { name: post.title, url: `${origin}/blog/${post.slug}` }]),
			articleJsonLd(origin, post),
			...(post.faqs?.length ? [faqJsonLd(post.faqs)] : [])
		]
	}));
}

function renderCmsPage(req, res, url) {
	const slug = cmsPageSlugForPath(url.pathname);
	const store = readContentStore();
	const page = publicContentItems(store).find(item => item.type === 'page' && item.slug === slug);
	if (!page) return serveStatic(req, res, url);
	const origin = originForRequest(req);
	const content = `
		<section class="page-head"><div><div class="page-kicker">ApexOneIQ</div><h1>${escapeHtml(page.title)}</h1></div></section>
		<section class="brief-panel cms-article">
			${page.featuredImage ? `<img class="cms-featured-image" src="${escapeHtml(page.featuredImage)}" alt="${escapeHtml(page.imageAlt || page.title)}">` : ''}
			<div class="cms-body">${sanitizeHtml(page.bodyHtml)}</div>
		</section>
		${page.faqs?.length ? `<section class="brief-panel"><div class="panel-label">FAQ</div>${page.faqs.map(item => `<details><summary>${escapeHtml(item.question)}</summary><p>${escapeHtml(item.answer)}</p></details>`).join('')}</section>` : ''}`;
	sendHtml(res, htmlDocument({
		title: page.metaTitle || page.title,
		description: page.metaDescription || page.excerpt || plainExcerpt(page.bodyHtml),
		canonical: `${origin}/${page.slug}`,
		body: content,
		schema: [
			organizationJsonLd(origin),
			websiteJsonLd(origin),
			breadcrumbJsonLd(origin, [{ name: page.title, url: `${origin}/${page.slug}` }]),
			...(page.faqs?.length ? [faqJsonLd(page.faqs)] : [])
		]
	}));
}

function renderSitemap(req, res) {
	const origin = originForRequest(req);
	const store = readContentStore();
	const now = new Date().toISOString();
	const staticUrls = ['', 'intelligence', 'faq', 'knowledge-center', 'pricing', 'sign-in', 'register', 'executive-brief.html', 'command-dashboard.html', 'mission-workspace.html', 'blog'].map(pathname => ({ pathname, lastmod: lastModifiedForPath(pathname) || now }));
	const knowledgeUrls = readKnowledgeCenterArticles().map(article => ({ pathname: `knowledge-center/${article.slug}`, lastmod: article.modifiedDate || now }));
	const cmsUrls = publicContentItems(store).map(item => ({ pathname: item.type === 'blog' ? `blog/${item.slug}` : item.slug, lastmod: item.updatedAt || item.publishedAt || item.createdAt || now })).filter(item => item.pathname);
	const urls = uniqueSitemapUrls([...staticUrls, ...knowledgeUrls, ...cmsUrls]);
	const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(item => `  <url><loc>${escapeXml(canonicalForPath(origin, item.pathname))}</loc><lastmod>${escapeXml(new Date(item.lastmod).toISOString())}</lastmod><changefreq>weekly</changefreq></url>`).join('\n')}\n</urlset>\n`;
	res.writeHead(200, { 'Content-Type': 'application/xml; charset=utf-8' });
	res.end(xml);
}

function renderRobots(req, res) {
	const origin = originForRequest(req);
	res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
	res.end(`User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /admin-content.html\nDisallow: /checkout/\nDisallow: /data/\nDisallow: /reports/\nSitemap: ${origin}/sitemap.xml\n`);
}

function uniqueSitemapUrls(items) {
	const seen = new Map();
	for (const item of items) {
		if (!seen.has(item.pathname)) seen.set(item.pathname, item);
	}
	return Array.from(seen.values());
}

function canonicalForPath(origin, pathname) {
	return `${origin}/${pathname || ''}`.replace(/\/$/, '') || origin;
}

function lastModifiedForPath(pathname) {
	const candidates = [
		pathname ? path.join(root, pathname) : path.join(root, 'index.html'),
		pathname ? path.join(root, pathname, 'index.html') : ''
	].filter(Boolean);
	for (const candidate of candidates) {
		if (fs.existsSync(candidate)) return fs.statSync(candidate).mtime.toISOString();
	}
	return '';
}

function isIndexNowKeyPath(pathname) {
	const key = indexNowKey();
	return Boolean(key && pathname === `/${key}.txt`);
}

function renderIndexNowKey(req, res) {
	res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' });
	res.end(indexNowKey());
}

async function handleIndexNowSubmit(req, res) {
	const key = indexNowKey();
	if (!key) return sendJson(res, 503, { error: 'indexnow_key_missing', message: 'Set INDEXNOW_KEY before submitting URLs.' });
	if (!isCmsAuthenticated(req)) return sendJson(res, 401, { error: 'indexnow_auth_required' });
	const payload = await readJsonBody(req);
	const origin = String(payload.host || process.env.APP_URL || process.env.APEXONEIQ_APP_URL || '').replace(/\/+$/, '') || originForRequest(req);
	const urls = Array.isArray(payload.urls) && payload.urls.length ? payload.urls : sitemapUrlsForIndexNow(origin);
	const body = {
		host: new URL(origin).host,
		key,
		keyLocation: `${origin}/${key}.txt`,
		urlList: urls.map(item => new URL(item, origin).toString())
	};
	try {
		const response = await fetch('https://api.indexnow.org/indexnow', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json; charset=utf-8' },
			body: JSON.stringify(body)
		});
		sendJson(res, response.ok ? 200 : response.status, { submitted: response.ok, status: response.status, count: body.urlList.length });
	} catch (error) {
		sendJson(res, 502, { error: 'indexnow_submit_failed', message: error.message });
	}
}

function indexNowKey() {
	return String(process.env.INDEXNOW_KEY || process.env.BING_INDEXNOW_KEY || '').trim();
}

function sitemapUrlsForIndexNow(origin) {
	return [
		canonicalForPath(origin, ''),
		canonicalForPath(origin, 'intelligence'),
		canonicalForPath(origin, 'faq'),
		canonicalForPath(origin, 'knowledge-center'),
		...readKnowledgeCenterArticles().map(article => canonicalForPath(origin, `knowledge-center/${article.slug}`))
	];
}

function readContentStore() {
	if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
	if (!fs.existsSync(contentStorePath)) {
		const initial = defaultContentStore();
		writeContentStore(initial);
		return initial;
	}
	try {
		const parsed = JSON.parse(fs.readFileSync(contentStorePath, 'utf8'));
		return {
			items: Array.isArray(parsed.items) ? parsed.items.map(normalizeContentItem) : [],
			media: Array.isArray(parsed.media) ? parsed.media : [],
			categories: Array.isArray(parsed.categories) ? parsed.categories : ['Business Growth', 'AI Visibility', 'Local SEO'],
			tags: Array.isArray(parsed.tags) ? parsed.tags : ['executive brief', 'seo', 'trust', 'ai visibility'],
			updatedAt: parsed.updatedAt || new Date().toISOString()
		};
	} catch (error) {
		return defaultContentStore();
	}
}

function writeContentStore(store) {
	if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
	fs.writeFileSync(contentStorePath, JSON.stringify({ ...store, updatedAt: new Date().toISOString() }, null, 2));
}

function defaultContentStore() {
	const now = new Date().toISOString();
	return {
		items: [
			normalizeContentItem({ id: 'page_home', type: 'page', title: 'Home', slug: 'home', status: 'draft', metaTitle: 'ApexOneIQ', metaDescription: 'Executive business intelligence and autonomous optimization.', bodyHtml: '<p>Homepage content is currently served by index.html. Use this record to prepare owner-managed homepage copy before publishing.</p>', createdAt: now, updatedAt: now }),
			normalizeContentItem({ id: 'page_pricing', type: 'page', title: 'Pricing', slug: 'pricing', status: 'draft', metaTitle: 'ApexOneIQ Pricing', metaDescription: 'Choose an ApexOneIQ growth plan.', bodyHtml: '<p>Pricing content is currently served by subscription.html. Use this record to draft future pricing copy.</p>', createdAt: now, updatedAt: now }),
			normalizeContentItem({ id: 'post_welcome', type: 'blog', title: 'What ApexOneIQ Measures Before Recommending Growth Work', slug: 'what-apexoneiq-measures', status: 'draft', metaTitle: 'What ApexOneIQ Measures Before Recommending Growth Work', metaDescription: 'A plain-English guide to ApexOneIQ scan evidence, trust signals, and growth recommendations.', excerpt: 'ApexOneIQ uses scan evidence before recommending growth work.', bodyHtml: '<h2>Evidence before recommendations</h2><p>ApexOneIQ starts with measurable website, trust, local, and AI visibility signals before recommending work.</p>', categories: ['Business Growth'], tags: ['executive brief', 'seo'], author: 'ApexOneIQ', createdAt: now, updatedAt: now })
		],
		media: [],
		categories: ['Business Growth', 'AI Visibility', 'Local SEO'],
		tags: ['executive brief', 'seo', 'trust', 'ai visibility'],
		updatedAt: now
	};
}

function normalizeContentItem(item = {}) {
	const type = ['page', 'blog', 'faq'].includes(item.type) ? item.type : 'blog';
	const title = String(item.title || 'Untitled').trim();
	const slug = slugify(item.slug || title);
	const status = ['draft', 'published', 'scheduled'].includes(item.status) ? item.status : 'draft';
	return {
		id: String(item.id || createId(type)),
		type,
		title,
		slug,
		status,
		metaTitle: String(item.metaTitle || title).slice(0, 90),
		metaDescription: String(item.metaDescription || item.excerpt || '').slice(0, 180),
		openGraphTitle: String(item.openGraphTitle || item.metaTitle || title).slice(0, 90),
		openGraphDescription: String(item.openGraphDescription || item.metaDescription || item.excerpt || '').slice(0, 220),
		canonicalUrl: String(item.canonicalUrl || ''),
		bodyHtml: sanitizeHtml(String(item.bodyHtml || '')),
		excerpt: String(item.excerpt || '').slice(0, 240),
		faqs: Array.isArray(item.faqs) ? item.faqs.map(faq => ({ question: String(faq.question || ''), answer: String(faq.answer || '') })).filter(faq => faq.question && faq.answer) : [],
		categories: arrayOfStrings(item.categories),
		tags: arrayOfStrings(item.tags),
		featuredImage: String(item.featuredImage || ''),
		imageAlt: String(item.imageAlt || ''),
		author: String(item.author || 'ApexOneIQ'),
		publishedAt: item.publishedAt || (status === 'published' ? new Date().toISOString() : ''),
		scheduledAt: String(item.scheduledAt || ''),
		schemaOptions: {
			article: item.schemaOptions?.article !== false,
			breadcrumb: item.schemaOptions?.breadcrumb !== false,
			faq: item.schemaOptions?.faq !== false,
			organization: item.schemaOptions?.organization !== false
		},
		createdAt: item.createdAt || new Date().toISOString(),
		updatedAt: item.updatedAt || new Date().toISOString()
	};
}

function analyzeContentItem(item, store = readContentStore()) {
	const words = stripHtml(item.bodyHtml).split(/\s+/).filter(Boolean);
	const hasMeta = Boolean(item.metaTitle && item.metaDescription);
	const hasInternalLink = /href=["']\/(?!\/)/i.test(item.bodyHtml);
	const hasImageAlt = !item.featuredImage || Boolean(item.imageAlt);
	const missing = [
		!item.metaTitle && 'Meta title',
		!item.metaDescription && 'Meta description',
		item.featuredImage && !item.imageAlt && 'Featured image alt text',
		!hasInternalLink && 'Internal link'
	].filter(Boolean);
	const related = relatedContent(item, store).slice(0, 5).map(relatedItem => ({ title: relatedItem.title, slug: relatedItem.slug, type: relatedItem.type }));
	return {
		seoScore: clampNumber((hasMeta ? 32 : 8) + (words.length >= 600 ? 22 : words.length >= 300 ? 14 : 5) + (hasInternalLink ? 18 : 4) + (item.faqs.length ? 12 : 0) + (hasImageAlt ? 16 : 4)),
		readability: words.length && averageSentenceLength(stripHtml(item.bodyHtml)) <= 24 ? 'Good' : 'Needs Review',
		aiVisibility: item.faqs.length || /<h2|<h3/i.test(item.bodyHtml) ? 'Strong' : 'Needs structured headings or FAQ blocks',
		schemaValidation: item.schemaOptions ? 'Ready' : 'Missing schema options',
		missingMetadata: missing,
		internalLinkSuggestions: related,
		imageAltSuggestions: item.featuredImage && !item.imageAlt ? [`Add alt text that describes ${item.title}.`] : []
	};
}

function publicContentItems(store) {
	const now = Date.now();
	return (store.items || []).filter(item => {
		if (item.status === 'published') return true;
		if (item.status === 'scheduled' && item.scheduledAt && Date.parse(item.scheduledAt) <= now) return true;
		return false;
	});
}

function relatedContent(item, store) {
	const tags = new Set(item.tags || []);
	const categories = new Set(item.categories || []);
	return publicContentItems(store)
		.filter(candidate => candidate.id !== item.id)
		.map(candidate => {
			const score = (candidate.tags || []).filter(tag => tags.has(tag)).length * 2
				+ (candidate.categories || []).filter(category => categories.has(category)).length;
			return { ...candidate, relatedScore: score };
		})
		.filter(candidate => candidate.relatedScore > 0)
		.sort((a, b) => b.relatedScore - a.relatedScore || String(b.publishedAt).localeCompare(String(a.publishedAt)));
}

function htmlDocument({ title, description, canonical, body, schema = [] }) {
	return `<!doctype html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>${escapeHtml(title)}</title>
	<meta name="description" content="${escapeHtml(description || '')}">
	<link rel="canonical" href="${escapeHtml(canonical || '')}">
	<meta property="og:title" content="${escapeHtml(title)}">
	<meta property="og:description" content="${escapeHtml(description || '')}">
	<meta property="og:type" content="website">
	<meta property="og:url" content="${escapeHtml(canonical || '')}">
	<meta name="twitter:card" content="summary_large_image">
	<meta name="twitter:title" content="${escapeHtml(title)}">
	<meta name="twitter:description" content="${escapeHtml(description || '')}">
	<link rel="stylesheet" href="/css/app.css">
	<link rel="icon" href="/favicon.ico" sizes="any">
	<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
	<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
	<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
	<link rel="manifest" href="/site.webmanifest">
	<meta name="theme-color" content="#020814">
	${schema.map(item => `<script type="application/ld+json">${JSON.stringify(item)}</script>`).join('\n\t')}
</head>
<body>
	<div class="app">
		<aside class="sidebar">
			<div class="brand"><div class="logo">IQ</div><div><strong>ApexOneIQ</strong><span>Content OS</span></div></div>
			<div class="site-card"><span class="eyebrow"><span class="live-dot"></span>Published Content</span><strong>ApexOneIQ</strong><p>Owner-managed content powered by the native CMS.</p></div>
			<div class="nav-section">Content</div>
			<nav class="nav-list"><a class="nav-link" href="/"><span>Home</span></a><a class="nav-link" href="/blog"><span>Blog</span></a><a class="nav-link" href="/pricing"><span>Pricing</span></a><a class="nav-link" href="/executive-brief.html"><span>Executive Brief</span></a></nav>
			<div class="system-card"><span class="eyebrow">Owner CMS</span><p>Use the secure Content Dashboard to edit pages, articles, FAQs, media, and SEO.</p><a class="button" href="/admin-content.html">Open Admin</a></div>
		</aside>
		<main class="main">${body}</main>
	</div>
</body>
</html>`;
}

function marketingHtmlDocument({ title, description, canonical, body, schema = [], active = '' }) {
	return `<!doctype html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>${escapeHtml(title)}</title>
	<meta name="description" content="${escapeHtml(description || '')}">
	<link rel="canonical" href="${escapeHtml(canonical || '')}">
	<meta property="og:title" content="${escapeHtml(title)}">
	<meta property="og:description" content="${escapeHtml(description || '')}">
	<meta property="og:type" content="website">
	<meta property="og:url" content="${escapeHtml(canonical || '')}">
	<meta name="twitter:card" content="summary_large_image">
	<meta name="twitter:title" content="${escapeHtml(title)}">
	<meta name="twitter:description" content="${escapeHtml(description || '')}">
	<link rel="stylesheet" href="/css/app.css">
	<link rel="icon" href="/favicon.ico" sizes="any">
	<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
	<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
	<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
	<link rel="manifest" href="/site.webmanifest">
	<meta name="theme-color" content="#020814">
	${schema.map(item => `<script type="application/ld+json">${JSON.stringify(item)}</script>`).join('\n\t')}
</head>
<body data-route="${escapeHtml(active || 'marketing')}" class="marketing-home onboarding-home">
	${landingNavHtml(active)}
	<main class="landing-main onboarding-landing">${body}</main>
	<script>
	(function(){
		var toc = document.querySelector('.knowledge-toc');
		if (!toc) return;
		if (window.matchMedia('(max-width: 780px)').matches) toc.removeAttribute('open');
		var links = Array.from(document.querySelectorAll('[data-toc-link]'));
		var sections = links.map(function(link){ return document.querySelector(link.getAttribute('href')); }).filter(Boolean);
		if (!('IntersectionObserver' in window) || !sections.length) return;
		var observer = new IntersectionObserver(function(entries){
			entries.forEach(function(entry){
				if (!entry.isIntersecting) return;
				links.forEach(function(link){ link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id); });
			});
		}, { rootMargin: '-20% 0px -65% 0px', threshold: 0.01 });
		sections.forEach(function(section){ observer.observe(section); });
	})();
	</script>
	<script src="/js/mission-engine.js"></script><script src="/js/app.js"></script>
</body>
</html>`;
}

function landingNavHtml(active = '') {
	const activeAttr = name => active === name ? ' aria-current="page"' : '';
	const links = `
		<a href="/">Home</a>
		<a href="/intelligence"${activeAttr('intelligence')}>Intelligence</a>
		<a href="/#reputation">Trust</a>
		<a href="/knowledge-center"${activeAttr('knowledge')}>Knowledge Center</a>
		<a href="/faq"${activeAttr('faq')}>FAQ</a>
		<a href="/dashboard.html?demo=1">Demo</a>
		<a class="nav-cta" href="/oauth/google/?redirect_to=/sign-in.html">My Workspace</a>`;
	return `<header class="landing-nav">
		<a class="landing-brand" href="/"><span class="landing-logo">IQ</span><span>ApexOneIQ</span></a>
		<nav class="desktop-landing-menu" aria-label="Primary">${links}</nav>
		<details class="mobile-landing-menu"><summary>Menu</summary><nav aria-label="Mobile Primary">${links}</nav></details>
	</header>`;
}

function organizationJsonLd(origin) {
	return {
		'@context': 'https://schema.org',
		'@type': 'Organization',
		name: 'ApexOneIQ',
		url: origin,
		logo: `${origin}/android-chrome-512x512.png`
	};
}

function websiteJsonLd(origin) {
	return {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		name: 'ApexOneIQ',
		url: origin
	};
}

function breadcrumbJsonLd(origin, crumbs) {
	const items = [{ name: 'Home', url: origin }, ...crumbs];
	return {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: items.map((item, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			name: item.name,
			item: item.url
		}))
	};
}

function articleJsonLd(origin, post) {
	return {
		'@context': 'https://schema.org',
		'@type': 'Article',
		headline: post.title,
		description: post.metaDescription || post.excerpt || plainExcerpt(post.bodyHtml),
		author: { '@type': 'Person', name: post.author || 'ApexOneIQ' },
		publisher: { '@type': 'Organization', name: 'ApexOneIQ', logo: { '@type': 'ImageObject', url: `${origin}/android-chrome-512x512.png` } },
		datePublished: post.publishedAt || post.createdAt,
		dateModified: post.updatedAt || post.publishedAt || post.createdAt,
		mainEntityOfPage: `${origin}/blog/${post.slug}`,
		image: post.featuredImage ? [absoluteUrl(origin, post.featuredImage)] : undefined
	};
}

function faqJsonLd(faqs) {
	return {
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		mainEntity: faqs.map(item => ({
			'@type': 'Question',
			name: item.question,
			acceptedAnswer: { '@type': 'Answer', text: item.answer }
		}))
	};
}

function cmsPageSlugForPath(pathname) {
	const clean = String(pathname || '').replace(/^\/+|\/+$/g, '');
	const map = {
		features: 'features',
		pricing: 'pricing',
		scanner: 'scanner',
		'executive-brief': 'executive-brief',
		about: 'about',
		contact: 'contact'
	};
	return map[clean] || '';
}

function originForRequest(req) {
	const configured = process.env.APP_URL || process.env.APEXONEIQ_APP_URL;
	if (configured) return configured.replace(/\/+$/, '');
	if (process.env.NODE_ENV === 'production') return productionOrigin;
	const proto = req.headers['x-forwarded-proto'] || 'https';
	const host = req.headers['x-forwarded-host'] || req.headers.host || 'apexoneiq.com';
	return `${proto}://${host}`;
}

function sendHtml(res, html) {
	const body = injectProductionHead(html);
	res.writeHead(200, productionHeaders({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' }));
	res.end(body);
}

function sendNotFound(res) {
	res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
	res.end('Not found');
}

function productionHeaders(headers = {}) {
	return {
		'X-Content-Type-Options': 'nosniff',
		'Referrer-Policy': 'strict-origin-when-cross-origin',
		'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
		...headers
	};
}

function cacheControlForExtension(ext) {
	if (['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.ico', '.woff', '.woff2'].includes(ext)) return 'public, max-age=31536000, immutable';
	if (['.css', '.js', '.json', '.webmanifest'].includes(ext)) return 'public, max-age=3600, stale-while-revalidate=86400';
	return 'no-cache';
}

function injectProductionHead(html) {
	let output = String(html || '');
	if (!/<head[^>]*>/i.test(output)) return output;
	const additions = productionHeadAdditions(output);
	if (additions) output = output.replace(/<head([^>]*)>/i, `<head$1>\n${additions}`);
	return output;
}

function productionHeadAdditions(html) {
	const additions = [];
	if (!/<meta\s+name=["']robots["']/i.test(html)) additions.push('\t<meta name="robots" content="index,follow">');
	if (!/<link\s+rel=["']preconnect["'][^>]+https:\/\/www\.googletagmanager\.com/i.test(html)) additions.push('\t<link rel="preconnect" href="https://www.googletagmanager.com" crossorigin>');
	if (!/<link\s+rel=["']preload["'][^>]+css\/app\.css/i.test(html)) additions.push('\t<link rel="preload" href="/css/app.css" as="style">');
	const googleVerification = process.env.GOOGLE_SITE_VERIFICATION || process.env.GOOGLE_SEARCH_CONSOLE_VERIFICATION || '';
	if (googleVerification && !/google-site-verification/i.test(html)) additions.push(`\t<meta name="google-site-verification" content="${escapeHtml(googleVerification)}">`);
	const bingVerification = process.env.BING_SITE_VERIFICATION || process.env.BING_WEBMASTER_VERIFICATION || '';
	if (bingVerification && !/msvalidate\.01/i.test(html)) additions.push(`\t<meta name="msvalidate.01" content="${escapeHtml(bingVerification)}">`);
	const gaId = process.env.GA4_MEASUREMENT_ID || process.env.GOOGLE_ANALYTICS_ID || '';
	if (gaId && !/googletagmanager\.com\/gtag\/js/i.test(html)) {
		additions.push(`\t<script async src="https://www.googletagmanager.com/gtag/js?id=${escapeHtml(gaId)}"></script>`);
		additions.push(`\t<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${escapeHtml(gaId)}');</script>`);
	}
	return additions.join('\n');
}

function createId(prefix) {
	return `${String(prefix || 'item').replace(/[^a-z0-9]/gi, '').toLowerCase()}_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
}

function slugify(value) {
	return String(value || '')
		.toLowerCase()
		.replace(/&/g, ' and ')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 90) || `content-${Date.now()}`;
}

function arrayOfStrings(value) {
	if (Array.isArray(value)) return value.map(item => String(item).trim()).filter(Boolean);
	if (typeof value === 'string') return value.split(',').map(item => item.trim()).filter(Boolean);
	return [];
}

function safeFilename(value) {
	const parsed = path.parse(String(value || 'upload.bin'));
	const name = parsed.name.replace(/[^a-z0-9._-]/gi, '-').replace(/-+/g, '-').slice(0, 80) || 'upload';
	const ext = parsed.ext.replace(/[^a-z0-9.]/gi, '').slice(0, 12);
	return `${name}${ext}`;
}

function extensionForMime(mime) {
	if (/png/i.test(mime)) return '.png';
	if (/jpe?g/i.test(mime)) return '.jpg';
	if (/webp/i.test(mime)) return '.webp';
	if (/gif/i.test(mime)) return '.gif';
	if (/svg/i.test(mime)) return '.svg';
	if (/pdf/i.test(mime)) return '.pdf';
	if (/mp4/i.test(mime)) return '.mp4';
	if (/webm/i.test(mime)) return '.webm';
	return '.bin';
}

function readingTime(html) {
	const words = stripHtml(html).split(/\s+/).filter(Boolean).length;
	return Math.max(1, Math.ceil(words / 220));
}

function plainExcerpt(html) {
	return stripHtml(html).slice(0, 155);
}

function averageSentenceLength(text) {
	const words = String(text || '').split(/\s+/).filter(Boolean).length;
	const sentences = String(text || '').split(/[.!?]+/).filter(Boolean).length || 1;
	return words / sentences;
}

function absoluteUrl(origin, value) {
	try {
		return new URL(value, origin).toString();
	} catch (error) {
		return value;
	}
}

function sanitizeHtml(html) {
	let safe = String(html || '');
	safe = safe.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '');
	safe = safe.replace(/\son[a-z]+=["'][^"']*["']/gi, '');
	safe = safe.replace(/\s(href|src)=["']javascript:[^"']*["']/gi, '');
	const allowed = /^(\/?(p|br|strong|b|em|i|ul|ol|li|h2|h3|h4|blockquote|pre|code|table|thead|tbody|tr|th|td|a|img|figure|figcaption|div|span|details|summary|section|article|hr))(\s|>|\/)/i;
	return safe.replace(/<\/?([a-z0-9-]+)([^>]*)>/gi, tag => allowed.test(tag) ? tag : '');
}

function escapeHtml(value) {
	return String(value || '').replace(/[&<>"']/g, char => ({
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#039;'
	}[char]));
}

function escapeXml(value) {
	return escapeHtml(value);
}

async function handleCheckout(req, res, url) {
	const requestedPlan = url.pathname.split('/').filter(Boolean).pop();
	const planId = normalizePlanId(requestedPlan);
	const plan = planFor(planId);
	const payload = await readJsonBody(req);

	if (!plan || !plan.purchaseAvailable) {
		sendJson(res, 400, {
			error: planId === 'enterprise' ? 'enterprise_request_information_only' : 'plan_not_purchasable',
			message: planId === 'enterprise' ? 'Enterprise is request-information only and does not use self-service Stripe Checkout.' : 'This plan cannot be purchased through self-service checkout.'
		});
		return;
	}

	const stripeCheck = stripeEnvironmentCheck(plan);
	if (stripeCheck) {
		sendJson(res, stripeCheck.status, stripeCheck.body);
		return;
	}

	const origin = publicOrigin(req, url);
	const userId = String(payload.userId || payload.user_id || payload.user?.id || 'local-user');
	const accountId = String(payload.accountId || payload.account_id || payload.account?.id || userId);
	const businessWebsite = String(payload.businessWebsite || payload.website || payload.profile?.website || '');
	const businessId = String(payload.businessId || payload.business_id || accountId);
	const price = process.env[plan.stripePriceEnv];
	const body = new URLSearchParams({
		mode: 'subscription',
		success_url: `${origin}/checkout/success.html?session_id={CHECKOUT_SESSION_ID}&plan=${encodeURIComponent(plan.id)}`,
		cancel_url: `${origin}/checkout/cancel.html?plan=${encodeURIComponent(plan.id)}`,
		'line_items[0][price]': price,
		'line_items[0][quantity]': '1',
		client_reference_id: accountId,
		'metadata[user_id]': userId,
		'metadata[account_id]': accountId,
		'metadata[internal_plan_id]': plan.id,
		'metadata[business_website]': businessWebsite,
		'metadata[business_id]': businessId,
		'metadata[environment]': String(process.env.STRIPE_MODE || 'test').toLowerCase()
	});

	const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body
	});
	const data = await stripeResponse.json();
	if (!stripeResponse.ok) {
		sendJson(res, stripeResponse.status, {
			error: 'stripe_checkout_failed',
			message: data.error?.message || 'Stripe Checkout Session creation failed.'
		});
		return;
	}

	sendJson(res, 200, {
		id: data.id,
		url: data.url,
		plan: plan.id,
		entitlements: entitlementsFor(plan.id),
		billingInterval: plan.billingInterval
	});
}

async function handleStripeWebhook(req, res) {
	const rawBody = await readRawBody(req);
	const secret = process.env.STRIPE_WEBHOOK_SECRET;
	if (!secret) {
		sendJson(res, 503, { error: 'webhook_secret_not_configured' });
		return;
	}
	if (!verifyStripeSignature(rawBody, req.headers['stripe-signature'], secret)) {
		sendJson(res, 400, { error: 'stripe_signature_verification_failed' });
		return;
	}

	const event = JSON.parse(rawBody.toString('utf8'));
	const store = readSubscriptionStore();
	if (store.processedEvents[event.id]) {
		sendJson(res, 200, { received: true, duplicate: true });
		return;
	}

	const result = applyStripeEvent(store, event);
	store.processedEvents[event.id] = {
		type: event.type,
		processedAt: new Date().toISOString(),
		result
	};
	writeSubscriptionStore(store);
	sendJson(res, 200, { received: true, result });
}

async function handleCustomerPortal(req, res, url) {
	const stripeCheck = stripeEnvironmentCheck({ stripePriceEnv: 'STRIPE_PRICE_DIY', displayName: 'Customer Portal', id: 'portal' }, true);
	if (stripeCheck) return sendJson(res, stripeCheck.status, stripeCheck.body);
	const payload = await readJsonBody(req);
	const status = subscriptionStatusFor(payload.userId || payload.user_id, payload.accountId || payload.account_id);
	const customer = payload.stripeCustomerId || status.stripeCustomerId;
	if (!customer) {
		sendJson(res, 404, { error: 'stripe_customer_missing', message: 'No Stripe customer is stored for this account yet.' });
		return;
	}
	const origin = publicOrigin(req, url);
	const body = new URLSearchParams({
		customer,
		return_url: `${origin}/pricing`
	});
	const stripeResponse = await fetch('https://api.stripe.com/v1/billing_portal/sessions', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body
	});
	const data = await stripeResponse.json();
	if (!stripeResponse.ok) {
		sendJson(res, stripeResponse.status, { error: 'stripe_portal_failed', message: data.error?.message || 'Customer portal could not be created.' });
		return;
	}
	sendJson(res, 200, { url: data.url });
}

async function handleEntitlementCheck(req, res) {
	const payload = await readJsonBody(req);
	const status = subscriptionStatusFor(payload.userId || payload.user_id, payload.accountId || payload.account_id);
	const planId = normalizePlanId(payload.planId || payload.plan_id || status.entitlementPlan || status.planId || 'free');
	const required = String(payload.entitlement || '');
	sendJson(res, 200, {
		allowed: !required || entitlementsFor(planId).includes(required),
		planId,
		billingStatus: status.billingStatus,
		entitlements: entitlementsFor(planId)
	});
}

async function handleEnterpriseInquiry(req, res) {
	const payload = await readJsonBody(req);
	const store = readSubscriptionStore();
	const inquiry = {
		id: `inq_${Date.now()}_${Math.random().toString(16).slice(2)}`,
		createdAt: new Date().toISOString(),
		userId: String(payload.userId || payload.user_id || 'local-user'),
		accountId: String(payload.accountId || payload.account_id || payload.userId || 'local-account'),
		website: String(payload.website || payload.businessWebsite || ''),
		email: String(payload.email || ''),
		message: String(payload.message || 'Enterprise request information')
	};
	store.enterpriseInquiries.push(inquiry);
	writeSubscriptionStore(store);
	sendJson(res, 200, {
		requested: true,
		plan: 'enterprise',
		message: 'Enterprise is request-information only. No checkout session was created.',
		inquiry
	});
}

async function handleExecutiveScan(req, res, url) {
	const website = normalizeWebsiteUrl(url.searchParams.get('website'));
	if (!website) {
		sendJson(res, 400, { error: 'invalid_website', message: 'A secure website URL beginning with https:// is required.' });
		return;
	}

	try {
		const result = await buildExecutiveScanResult(website);
		sendJson(res, 200, result);
	} catch (error) {
		sendJson(res, 200, fallbackExecutiveScanResult(website, error.message));
	}
}

function handleGoogleOAuthStart(req, res, url) {
	const clientId = process.env.APEXONEIQ_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
	if (!clientId) {
		sendJson(res, 503, { error: 'google_oauth_not_configured', message: 'Google OAuth client ID is required.' });
		return;
	}
	const origin = publicOrigin(req, url);
	const redirectUri = googleCallbackUrl(origin);
	const redirectTo = safeRedirectPath(url.searchParams.get('redirect_to') || '/sign-in.html');
	const state = crypto.randomBytes(24).toString('hex');
	const statePayload = Buffer.from(JSON.stringify({ state, redirectTo })).toString('base64url');
	const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
	authUrl.searchParams.set('client_id', clientId);
	authUrl.searchParams.set('redirect_uri', redirectUri);
	authUrl.searchParams.set('response_type', 'code');
	authUrl.searchParams.set('scope', 'openid email profile');
	authUrl.searchParams.set('state', statePayload);
	authUrl.searchParams.set('prompt', 'select_account');
	console.log('Google OAuth redirect debug');
	console.log(`client_id=${clientId}`);
	console.log(`redirect_uri=${redirectUri}`);
	console.log(`scope=${authUrl.searchParams.get('scope')}`);
	console.log(`response_type=${authUrl.searchParams.get('response_type')}`);
	console.log(`access_type=${authUrl.searchParams.get('access_type') || ''}`);
	console.log(`prompt=${authUrl.searchParams.get('prompt')}`);
	console.log(`authorization_url=${authUrl.toString()}`);
	console.log(`APP_URL=${maskEnvValue(process.env.APP_URL || '')}`);
	console.log(`APEXONEIQ_APP_URL=${maskEnvValue(process.env.APEXONEIQ_APP_URL || '')}`);
	console.log(`APEXONEIQ_GOOGLE_CALLBACK_URL=${maskEnvValue(process.env.APEXONEIQ_GOOGLE_CALLBACK_URL || '')}`);
	console.log(`GOOGLE_CALLBACK_URL=${maskEnvValue(process.env.GOOGLE_CALLBACK_URL || '')}`);
	res.writeHead(302, {
		Location: authUrl.toString(),
		'Set-Cookie': cookieHeader('apex_oauth_state', state, 600)
	});
	res.end();
}

function handleGoogleOAuthCallback(req, res, url) {
	const cookies = parseCookies(req.headers.cookie || '');
	let payload = {};
	try {
		payload = JSON.parse(Buffer.from(url.searchParams.get('state') || '', 'base64url').toString('utf8'));
	} catch (error) {
		payload = {};
	}
	if (!payload.state || payload.state !== cookies.apex_oauth_state) {
		sendJson(res, 400, { error: 'google_oauth_state_invalid' });
		return;
	}
	const redirectTo = safeRedirectPath(payload.redirectTo || '/sign-in.html');
	const target = new URL(redirectTo, publicOrigin(req, url));
	if (url.searchParams.get('error')) target.searchParams.set('oauth_error', url.searchParams.get('error'));
	else target.searchParams.set('oauth', 'google');
	res.writeHead(302, {
		Location: `${target.pathname}${target.search}`,
		'Set-Cookie': cookieHeader('apex_oauth_state', '', 0)
	});
	res.end();
}

function sendBillingConfig(res) {
	const publicPlans = Object.fromEntries(Object.entries(plans).filter(([, plan]) => !plan.internalOnly).map(([id, plan]) => [id, {
		id: plan.id,
		displayName: plan.displayName,
		price: plan.price,
		priceLabel: plan.priceLabel,
		entitlements: plan.entitlements,
		billingInterval: plan.billingInterval,
		purchaseAvailable: plan.purchaseAvailable,
		workspace: plan.workspace,
		restrictions: plan.restrictions,
		stripeConfigured: plan.stripePriceEnv ? Boolean(process.env[plan.stripePriceEnv]) : false
	}]));
	sendJson(res, 200, {
		publishableKeyConfigured: Boolean(process.env.STRIPE_PUBLISHABLE_KEY),
		webhookConfigured: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
		plans: publicPlans
	});
}

function sendBillingStatus(req, res, url) {
	sendJson(res, 200, subscriptionStatusFor(url.searchParams.get('user_id'), url.searchParams.get('account_id')));
}

function normalizeRoutePath(pathname) {
	return String(pathname || '').replace(/\/+$/, '') || '/';
}

function publicOrigin(req, url) {
	const configured = process.env.APP_URL || process.env.APEXONEIQ_APP_URL;
	if (configured) return configured.replace(/\/+$/, '');
	if (process.env.NODE_ENV === 'production') return productionOrigin;
	const proto = req.headers['x-forwarded-proto'] || url.protocol.replace(':', '') || 'https';
	return `${proto}://${req.headers.host || 'apexoneiq.com'}`;
}

function googleCallbackUrl(origin) {
	const configured = process.env.APEXONEIQ_GOOGLE_CALLBACK_URL || process.env.GOOGLE_CALLBACK_URL || '';
	const cleaned = configured.replace(/^(APEXONEIQ_GOOGLE_CALLBACK_URL|GOOGLE_CALLBACK_URL)=/i, '').trim();
	const callback = new URL(cleaned || `${origin}/oauth/google/callback/`, origin);
	callback.pathname = '/oauth/google/callback/';
	callback.search = '';
	callback.hash = '';
	return callback.toString();
}

function maskEnvValue(value) {
	const text = String(value || '');
	if (!text) return '';
	if (text.length <= 4) return text;
	return `${'*'.repeat(Math.max(0, text.length - 4))}${text.slice(-4)}`;
}

function safeRedirectPath(value) {
	const path = String(value || '/sign-in.html');
	if (!path.startsWith('/') || path.startsWith('//') || path.includes('\\')) return '/sign-in.html';
	return path;
}

function parseCookies(header) {
	return Object.fromEntries(String(header).split(';').map(part => {
		const [key, ...value] = part.trim().split('=');
		return [key, decodeURIComponent(value.join('=') || '')];
	}).filter(([key]) => key));
}

function cookieHeader(name, value, maxAge) {
	const encoded = encodeURIComponent(value);
	return `${name}=${encoded}; Max-Age=${maxAge}; Path=/; HttpOnly; Secure; SameSite=Lax`;
}

function normalizeWebsiteUrl(value) {
	try {
		const url = new URL(String(value || '').trim());
		if (url.protocol !== 'https:' || !url.hostname.includes('.')) return '';
		url.hash = '';
		return url.toString();
	} catch (error) {
		return '';
	}
}

async function buildExecutiveScanResult(website) {
	const startedAt = Date.now();
	const response = await fetchWithTimeout(website, 9000);
	const html = await response.text();
	const responseMs = Date.now() - startedAt;
	const url = new URL(website);
	const origin = `${url.protocol}//${url.host}`;
	const title = textBetween(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
	const description = metaContent(html, 'description');
	const h1 = textBetween(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i);
	const bodyText = stripHtml(html);
	const robots = await fetchOptionalText(`${origin}/robots.txt`);
	const sitemap = await fetchOptionalText(`${origin}/sitemap.xml`);
	if (isRestrictedScanResponse(response, title, bodyText, html)) {
		return restrictedExecutiveScanResult(website, url, response.status, responseMs, title, robots, sitemap);
	}
	const wordCount = bodyText.split(/\s+/).filter(Boolean).length;
	const links = extractLinks(html, origin);
	const schemaAnalysis = schemaAnalysisFromHtml(html);
	const schemaTypes = schemaAnalysis.types;
	const trustCoverage = trustCoverageFromHtml(html, links.external, schemaTypes);
	const brokenLinks = await brokenLinkSummary(links.internal);
	const headingAnalysis = headingHierarchyFromHtml(html);
	const imageAlt = imageAltCoverageFromHtml(html);
	const metadata = metadataSignalsFromHtml(html, website);
	const indexability = indexabilitySignals(html, robots, response.status, url);
	const contentQuality = aiReadableContentSignals(bodyText, headingAnalysis, schemaTypes);
	const findings = {
		website,
		statusCode: response.status,
		responseMs,
		title,
		description,
		h1,
		wordCount,
		internalLinks: links.internal.length,
		externalLinks: links.external.length,
		checkedInternalLinks: brokenLinks.checked,
		brokenInternalLinks: brokenLinks.broken,
		schemaDetected: schemaTypes.length > 0,
		schemaTypes,
		schemaValidation: schemaAnalysis.validation,
		schemaCoverage: schemaCoverageFromTypes(schemaTypes),
		faqDetected: schemaTypes.some(type => /faq/i.test(type)) || /FAQPage|Frequently Asked Questions/i.test(html),
		robotsFound: Boolean(robots),
		sitemapFound: Boolean(sitemap) || /sitemap\.xml/i.test(robots || ''),
		canonical: metadata.canonical,
		openGraph: metadata.openGraph,
		twitterCards: metadata.twitterCards,
		viewport: metadata.viewport,
		titleQuality: metadata.titleQuality,
		metaDescriptionQuality: metadata.metaDescriptionQuality,
		headingHierarchy: headingAnalysis,
		imageAltCoverage: imageAlt,
		https: url.protocol === 'https:',
		mobileFriendly: metadata.viewport.status === 'Found' ? 'Found' : 'Missing',
		indexability,
		crawlability: crawlabilitySignals(robots, sitemap, response.status),
		aiReadableContent: contentQuality,
		reviewSignals: reviewSignalsFromHtml(html),
		trustCoverage,
		coreWebVitals: { status: 'Pending', note: 'Core Web Vitals require field data or Lighthouse collection.' },
		indexing: { status: indexability.status, evidence: indexability.evidence }
	};
	const executionActions = executionActionsFromFindings(findings);
	const components = executiveScoreComponents(findings);
	const businessGrowthScore = weightedBusinessGrowthScore(components);
	return {
		source: 'live_scan',
		simulated: false,
		website,
		domain: url.hostname.replace(/^www\./, ''),
		scannedAt: new Date().toISOString(),
		businessGrowthScore,
		components,
		findings,
		executionActions,
		timeline: timelineFromFindings(findings, businessGrowthScore),
		competitors: { status: 'processing', message: 'Competitor discovery still processing...', items: [] },
		keywords: keywordOpportunitiesFromFindings(findings),
		forecast: { status: 'pending', message: 'Pending live data.' },
		trend: [Math.max(0, businessGrowthScore - 9), Math.max(0, businessGrowthScore - 6), Math.max(0, businessGrowthScore - 3), businessGrowthScore],
		scoreExplanation: scoreExplanation(components)
	};
}

function isRestrictedScanResponse(response, title, bodyText, html) {
	const status = Number(response?.status || 0);
	const haystack = `${title || ''} ${bodyText || ''} ${html || ''}`.toLowerCase();
	return [401, 403, 429].includes(status)
		|| /\bjust a moment\b|\battention required\b|cf-browser-verification|cf-chl-|checking your browser|enable javascript and cookies/i.test(haystack);
}

function restrictedExecutiveScanResult(website, url, statusCode, responseMs, title, robots, sitemap) {
	const components = {
		localSeo: 0,
		websiteHealth: 0,
		trustCoverage: 0,
		aiVisibility: 0,
		technicalHealth: 0,
		authority: 0,
		content: 0,
		reputation: 0
	};
	const trustCoverage = pendingTrustCoverage('Website access is awaiting verification because the live scan received a restricted response.');
	const findings = {
		website,
		statusCode,
		responseMs,
		title,
		description: '',
		h1: '',
		wordCount: 0,
		internalLinks: 0,
		externalLinks: 0,
		checkedInternalLinks: 0,
		brokenInternalLinks: 0,
		schemaDetected: false,
		schemaTypes: [],
		schemaValidation: { status: 'Awaiting Verification', scriptCount: 0, invalidCount: 0, evidence: 'Website HTML could not be verified because the scan was restricted.' },
		schemaCoverage: schemaCoverageFromTypes([]),
		faqDetected: false,
		robotsFound: Boolean(robots),
		sitemapFound: Boolean(sitemap) || /sitemap\.xml/i.test(robots || ''),
		canonical: { status: 'Awaiting Verification', evidence: 'Canonical verification pending website access.' },
		openGraph: { status: 'Awaiting Verification', evidence: 'OpenGraph verification pending website access.' },
		twitterCards: { status: 'Awaiting Verification', evidence: 'Twitter Card verification pending website access.' },
		viewport: { status: 'Awaiting Verification', evidence: 'Viewport verification pending website access.' },
		titleQuality: { status: 'Awaiting Verification', evidence: 'Title verification pending website access.' },
		metaDescriptionQuality: { status: 'Awaiting Verification', evidence: 'Meta description verification pending website access.' },
		headingHierarchy: { status: 'Awaiting Verification', h1Count: 0, count: 0, skippedLevels: false, evidence: 'Heading verification pending website access.' },
		imageAltCoverage: { status: 'Awaiting Verification', total: 0, withAlt: 0, percent: 0, evidence: 'Image alt verification pending website access.' },
		https: url.protocol === 'https:',
		mobileFriendly: 'Awaiting Verification',
		indexability: { status: 'Awaiting Verification', evidence: `HTTP ${statusCode} restricted full page verification.` },
		crawlability: crawlabilitySignals(robots, sitemap, statusCode),
		aiReadableContent: { status: 'Awaiting Verification', score: 0, evidence: 'AI readability verification pending website access.' },
		reviewSignals: { status: 'Awaiting Verification', aggregateRating: false, pageMentions: false },
		trustCoverage,
		coreWebVitals: { status: 'Pending', note: 'Core Web Vitals require field data or Lighthouse collection.' },
		indexing: { status: 'Awaiting Verification', evidence: `HTTP ${statusCode} restricted full page verification.` },
		restrictedAccess: true
	};
	const executionActions = [{
		title: 'Website Access Verification',
		state: 'WAITING FOR THIRD PARTY',
		category: 'Verification',
		evidence: `The scan received HTTP ${statusCode}${title ? ` (${title})` : ''}; Apex did not score the restricted page as the business website.`,
		nextStep: 'Allow Apex scan access or verify through the hosting/security provider, then rescan.',
		canAutoFix: false,
		requiresApproval: false,
		thirdPartyBlocked: true,
		informationRequired: false
	}];
	return {
		source: 'awaiting_verification',
		simulated: false,
		requiresVerification: true,
		website,
		domain: url.hostname.replace(/^www\./, ''),
		scannedAt: new Date().toISOString(),
		businessGrowthScore: 0,
		components,
		findings,
		executionActions,
		timeline: [
			['Now', 'Website scan restricted', `HTTP ${statusCode}; full evidence verification pending`, 'warning'],
			['Now', 'Robots and sitemap checked', `${findings.robotsFound ? 'Robots found' : 'Robots pending'} / ${findings.sitemapFound ? 'sitemap found' : 'sitemap pending'}`, findings.robotsFound || findings.sitemapFound ? 'stable' : 'warning']
		],
		competitors: { status: 'processing', message: 'Competitor discovery still processing...', items: [] },
		keywords: [],
		forecast: { status: 'pending', message: 'Pending live data.' },
		trend: [0],
		scoreExplanation: scoreExplanation(components)
	};
}

function pendingTrustCoverage(evidence) {
	return ['Google Business Profile', 'Apple Business Connect', 'BBB', 'Yelp', 'Facebook', 'Instagram', 'LinkedIn', 'Pinterest', 'Trustpilot', 'Industry directories', 'Merchant Center', 'Knowledge Graph', 'Organization Schema', 'Review Schema', 'Author Information', 'Contact Consistency', 'NAP Consistency'].map(name => ({
		name,
		status: 'Awaiting Verification',
		evidence,
		why: 'Apex needs verified page or third-party evidence before scoring this signal.',
		impact: 'Pending live data.',
		effort: 'Pending'
	}));
}

function fallbackExecutiveScanResult(website, reason) {
	const url = new URL(website);
	const components = {
		localSeo: 0,
		websiteHealth: 0,
		trustCoverage: 0,
		aiVisibility: 0,
		technicalHealth: 0,
		authority: 0,
		content: 0,
		reputation: 0
	};
	return {
		source: 'scan_unavailable',
		simulated: false,
		website,
		domain: url.hostname.replace(/^www\./, ''),
		scannedAt: new Date().toISOString(),
		businessGrowthScore: 0,
		components,
		findings: { website, error: reason, trustCoverage: trustCoverageFromHtml('', [], []) },
		executionActions: [],
		timeline: [['Now', 'Website scan unavailable', reason || 'The submitted website could not be scanned.', 'warning']],
		competitors: { status: 'processing', message: 'Competitor discovery still processing...', items: [] },
		keywords: [],
		forecast: { status: 'pending', message: 'Pending live data.' },
		trend: [0],
		scoreExplanation: scoreExplanation(components)
	};
}

async function fetchWithTimeout(url, timeoutMs) {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), timeoutMs);
	try {
		return await fetch(url, {
			headers: {
				'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36 ApexOneIQExecutiveScan/1.0',
				Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
			},
			redirect: 'follow',
			signal: controller.signal
		});
	} finally {
		clearTimeout(timer);
	}
}

async function fetchOptionalText(url) {
	try {
		const response = await fetchWithTimeout(url, 4500);
		if (!response.ok) return '';
		return await response.text();
	} catch (error) {
		return '';
	}
}

function textBetween(html, pattern) {
	const match = String(html || '').match(pattern);
	return cleanText(match?.[1] || '');
}

function metaContent(html, name) {
	const source = String(html || '');
	const patterns = [
		new RegExp(`<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']+)["'][^>]*>`, 'i'),
		new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${name}["'][^>]*>`, 'i'),
		new RegExp(`<meta[^>]+property=["']og:${name}["'][^>]+content=["']([^"']+)["'][^>]*>`, 'i')
	];
	for (const pattern of patterns) {
		const match = source.match(pattern);
		if (match?.[1]) return cleanText(match[1]);
	}
	return '';
}

function cleanText(value) {
	return String(value || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function stripHtml(html) {
	return cleanText(String(html || '').replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' '));
}

function extractLinks(html, origin) {
	const internal = [];
	const external = [];
	for (const match of String(html || '').matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>/gi)) {
		try {
			const link = new URL(match[1], origin);
			if (!/^https?:$/.test(link.protocol)) continue;
			(link.origin === origin ? internal : external).push(link.toString());
		} catch (error) {
			// Ignore malformed links.
		}
	}
	return { internal: Array.from(new Set(internal)), external: Array.from(new Set(external)) };
}

function schemaAnalysisFromHtml(html) {
	const types = new Set();
	let scripts = 0;
	let invalidJsonLd = 0;
	for (const match of String(html || '').matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
		scripts += 1;
		try {
			const json = JSON.parse(match[1].trim());
			collectSchemaTypes(json, types);
		} catch (error) {
			invalidJsonLd += 1;
		}
	}
	return {
		types: Array.from(types),
		validation: {
			status: invalidJsonLd ? 'Invalid' : scripts ? 'Valid' : 'Missing',
			scripts,
			invalidJsonLd,
			evidence: invalidJsonLd ? `${invalidJsonLd} JSON-LD script(s) failed parsing.` : scripts ? `${scripts} valid JSON-LD script(s) parsed.` : 'No JSON-LD scripts detected.'
		}
	};
}

function schemaTypesFromHtml(html) {
	return schemaAnalysisFromHtml(html).types;
}

function collectSchemaTypes(value, types) {
	if (Array.isArray(value)) return value.forEach(item => collectSchemaTypes(item, types));
	if (!value || typeof value !== 'object') return;
	const type = value['@type'];
	if (Array.isArray(type)) type.forEach(item => types.add(String(item)));
	else if (type) types.add(String(type));
	Object.values(value).forEach(item => {
		if (item && typeof item === 'object') collectSchemaTypes(item, types);
	});
}

function schemaCoverageFromTypes(types) {
	const has = name => types.some(type => String(type).toLowerCase() === name.toLowerCase());
	return {
		organization: has('Organization') ? 'Found' : 'Missing',
		website: has('WebSite') ? 'Found' : 'Missing',
		product: has('Product') ? 'Found' : 'Missing',
		faq: has('FAQPage') ? 'Found' : 'Missing',
		breadcrumb: has('BreadcrumbList') ? 'Found' : 'Missing'
	};
}

function metadataSignalsFromHtml(html, website) {
	const canonical = linkHref(html, 'canonical');
	const ogTitle = metaProperty(html, 'og:title');
	const ogDescription = metaProperty(html, 'og:description');
	const ogUrl = metaProperty(html, 'og:url');
	const twitterCard = metaContent(html, 'twitter:card');
	const viewport = metaContent(html, 'viewport');
	const title = textBetween(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
	const description = metaContent(html, 'description');
	return {
		canonical: {
			status: canonical ? 'Found' : 'Missing',
			url: canonical || '',
			evidence: canonical ? `Canonical detected: ${canonical}` : 'Canonical link not detected.'
		},
		openGraph: {
			status: ogTitle && ogDescription && ogUrl ? 'Found' : ogTitle || ogDescription || ogUrl ? 'Weak' : 'Missing',
			evidence: `${ogTitle ? 'og:title found' : 'og:title missing'} / ${ogDescription ? 'og:description found' : 'og:description missing'} / ${ogUrl ? 'og:url found' : 'og:url missing'}`
		},
		twitterCards: {
			status: twitterCard ? 'Found' : 'Missing',
			evidence: twitterCard ? `Twitter card detected: ${twitterCard}` : 'Twitter card metadata not detected.'
		},
		viewport: {
			status: viewport ? 'Found' : 'Missing',
			evidence: viewport ? `Viewport detected: ${viewport}` : 'Viewport meta tag not detected.'
		},
		titleQuality: textQualityStatus(title, 30, 65, 'title'),
		metaDescriptionQuality: textQualityStatus(description, 70, 165, 'meta description'),
		canonicalMatches: canonical ? canonical.replace(/\/+$/, '') === website.replace(/\/+$/, '') : false
	};
}

function textQualityStatus(value, min, max, label) {
	const length = cleanText(value).length;
	if (!length) return { status: 'Missing', length, evidence: `${label} missing.` };
	if (length < min) return { status: 'Weak', length, evidence: `${label} is short at ${length} characters.` };
	if (length > max) return { status: 'Weak', length, evidence: `${label} is long at ${length} characters.` };
	return { status: 'Found', length, evidence: `${label} length is ${length} characters.` };
}

function linkHref(html, rel) {
	const match = String(html || '').match(new RegExp(`<link[^>]+rel=["'][^"']*${rel}[^"']*["'][^>]+href=["']([^"']+)["'][^>]*>`, 'i'))
		|| String(html || '').match(new RegExp(`<link[^>]+href=["']([^"']+)["'][^>]+rel=["'][^"']*${rel}[^"']*["'][^>]*>`, 'i'));
	return match?.[1] || '';
}

function metaProperty(html, property) {
	const source = String(html || '');
	const patterns = [
		new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["'][^>]*>`, 'i'),
		new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["'][^>]*>`, 'i')
	];
	for (const pattern of patterns) {
		const match = source.match(pattern);
		if (match?.[1]) return cleanText(match[1]);
	}
	return '';
}

function headingHierarchyFromHtml(html) {
	const headings = [...String(html || '').matchAll(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi)].map(match => ({
		level: Number(match[1]),
		text: cleanText(match[2])
	}));
	const h1Count = headings.filter(item => item.level === 1).length;
	let skipped = false;
	for (let index = 1; index < headings.length; index += 1) {
		if (headings[index].level - headings[index - 1].level > 1) skipped = true;
	}
	return {
		status: h1Count === 1 && !skipped ? 'Found' : h1Count ? 'Weak' : 'Missing',
		h1Count,
		count: headings.length,
		skippedLevels: skipped,
		evidence: h1Count === 1 && !skipped ? `${headings.length} headings with one H1.` : h1Count ? `${h1Count} H1 tag(s); skipped hierarchy: ${skipped ? 'yes' : 'no'}.` : 'No H1 detected.'
	};
}

function imageAltCoverageFromHtml(html) {
	const images = [...String(html || '').matchAll(/<img\b[^>]*>/gi)];
	const withAlt = images.filter(match => /\balt=["'][^"']+["']/i.test(match[0])).length;
	const percent = images.length ? Math.round((withAlt / images.length) * 100) : 100;
	return {
		status: images.length === 0 ? 'Not Available' : percent >= 90 ? 'Found' : percent >= 60 ? 'Weak' : 'Missing',
		total: images.length,
		withAlt,
		percent,
		evidence: images.length ? `${withAlt}/${images.length} images include alt text.` : 'No standard img tags detected in initial HTML.'
	};
}

async function brokenLinkSummary(internalLinks) {
	const sample = internalLinks.filter(Boolean).slice(0, 20);
	const results = await Promise.all(sample.map(async link => {
		try {
			const response = await fetchWithTimeout(link, 3500);
			return { link, status: response.status, broken: response.status >= 400 };
		} catch (error) {
			return { link, status: 0, broken: true };
		}
	}));
	return {
		checked: results.length,
		broken: results.filter(item => item.broken).length,
		items: results.filter(item => item.broken).slice(0, 5)
	};
}

function indexabilitySignals(html, robots, statusCode, url) {
	const noindex = /<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(String(html || ''));
	const robotsBlocksAll = new RegExp(`disallow:\\s*/\\s*(\\n|$)`, 'i').test(String(robots || ''));
	if (statusCode >= 400) return { status: 'Missing', evidence: `HTTP ${statusCode} prevents normal indexing.` };
	if (noindex) return { status: 'Missing', evidence: 'Robots noindex meta tag detected.' };
	if (robotsBlocksAll) return { status: 'Weak', evidence: 'robots.txt may disallow the root path.' };
	return { status: url.protocol === 'https:' ? 'Found' : 'Weak', evidence: url.protocol === 'https:' ? 'HTTPS page is indexable in scan context.' : 'HTTP page should use HTTPS.' };
}

function crawlabilitySignals(robots, sitemap, statusCode) {
	if (statusCode >= 400) return { status: 'Missing', evidence: `HTTP ${statusCode} response.` };
	if (robots && sitemap) return { status: 'Found', evidence: 'robots.txt and sitemap.xml detected.' };
	if (robots || sitemap) return { status: 'Weak', evidence: robots ? 'robots.txt detected; sitemap missing.' : 'sitemap.xml detected; robots missing.' };
	return { status: 'Missing', evidence: 'robots.txt and sitemap.xml not detected.' };
}

function aiReadableContentSignals(bodyText, headings, schemaTypes) {
	const words = bodyText.split(/\s+/).filter(Boolean).length;
	const hasQuestionContent = /\?|\b(can|how|what|why|where|when)\b/i.test(bodyText);
	const hasStructure = headings.count >= 3;
	const hasSchema = schemaTypes.length > 0;
	const score = clampNumber((words >= 450 ? 34 : words >= 220 ? 22 : 10) + (hasStructure ? 24 : 8) + (hasSchema ? 28 : 0) + (hasQuestionContent ? 14 : 4));
	return {
		status: score >= 75 ? 'Found' : score >= 45 ? 'Weak' : 'Missing',
		score,
		evidence: `${words} words, ${headings.count} headings, ${schemaTypes.length} schema types.`
	};
}

function executionActionsFromFindings(findings) {
	const actions = [];
	const add = (title, state, evidence, nextStep, category = 'Optimization') => actions.push({
		title,
		state,
		category,
		evidence,
		nextStep,
		canAutoFix: state === 'AUTO EXECUTED' || state === 'READY FOR APPROVAL',
		requiresApproval: state === 'READY FOR APPROVAL',
		thirdPartyBlocked: state === 'WAITING FOR THIRD PARTY',
		informationRequired: state === 'INFORMATION REQUIRED'
	});
	if (findings.schemaCoverage?.faq === 'Missing' && findings.faqDetected) {
		add('FAQ JSON-LD', 'READY FOR APPROVAL', 'FAQ opportunity detected, but FAQPage schema is missing from the live scan.', 'Prepare FAQ JSON-LD from visible FAQ content, preview, deploy after approval.', 'Schema');
	}
	if (findings.schemaCoverage?.breadcrumb === 'Missing') {
		add('Breadcrumb Schema', 'READY FOR APPROVAL', 'BreadcrumbList schema is missing from the live scan.', 'Generate BreadcrumbList schema from the current URL hierarchy and deploy after approval.', 'Schema');
	}
	if (findings.titleQuality?.status === 'Weak' || findings.metaDescriptionQuality?.status === 'Weak') {
		add('Title and Meta Description Optimization', 'READY FOR APPROVAL', `${findings.titleQuality.evidence} ${findings.metaDescriptionQuality.evidence}`, 'Prepare improved metadata and deploy after approval.', 'Metadata');
	}
	if (findings.brokenInternalLinks > 0) {
		add('Broken Internal Link Repair', 'READY FOR APPROVAL', `${findings.brokenInternalLinks}/${findings.checkedInternalLinks} checked internal links returned errors.`, 'Repair or redirect broken internal links, then rescan.', 'Crawlability');
	}
	if (findings.imageAltCoverage?.status === 'Weak' || findings.imageAltCoverage?.status === 'Missing') {
		add('Image Alt Text Coverage', 'READY FOR APPROVAL', findings.imageAltCoverage.evidence, 'Prepare descriptive alt text for missing images and deploy after approval.', 'Accessibility');
	}
	for (const source of findings.trustCoverage || []) {
		if (['Google Business Profile', 'Apple Business Connect', 'BBB', 'Merchant Center'].includes(source.name) && source.status !== 'Found') {
			add(source.name, 'WAITING FOR THIRD PARTY', source.evidence, `Prepare ${source.name} verification checklist; completion depends on external provider verification.`, 'Trust');
		}
	}
	for (const source of findings.trustCoverage || []) {
		if (['Contact Consistency', 'NAP Consistency', 'Review Schema'].includes(source.name) && source.status !== 'Found') {
			add(source.name, 'INFORMATION REQUIRED', source.evidence, 'Collect verified business/contact/review data before Apex can publish structured proof.', 'Trust');
		}
	}
	if (!actions.length) {
		add('Scan Evidence Recording', 'AUTO EXECUTED', 'No low-risk automatic issue was detected in the scanned evidence set.', 'Apex recorded the scan baseline and will compare the next scan for movement.', 'Evidence');
	}
	return actions;
}

function trustCoverageFromHtml(html, externalLinks, schemaTypes = []) {
	const haystack = `${String(html || '')} ${externalLinks.join(' ')}`.toLowerCase();
	const hasSchema = type => schemaTypes.some(item => String(item).toLowerCase() === type.toLowerCase());
	const hasAnySchema = pattern => schemaTypes.some(item => pattern.test(String(item)));
	const hasEmail = /mailto:|[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(String(html || ''));
	const hasPhone = /tel:|\+?\d[\d\s().-]{7,}\d/.test(String(html || ''));
	const hasAddress = /streetaddress|postalcode|addresslocality|addressregion|\b(address|suite|floor)\b/i.test(String(html || ''));
	const sources = [
		{ name: 'Google Business Profile', pattern: /(google\.com\/maps|g\.page|business\.google|goo\.gl\/maps)/, why: 'Validates the business entity for local discovery and AI confidence.', impact: '+6% estimated local trust impact', effort: 'Low' },
		{ name: 'Apple Business Connect', pattern: /(maps\.apple\.com|apple business connect)/, why: 'Adds third-party entity proof in Apple Maps and iOS search surfaces.', impact: '+3% estimated trust impact', effort: 'Low' },
		{ name: 'BBB', pattern: /(bbb\.org|better business bureau)/, why: 'Provides external trust proof for cautious buyers.', impact: '+2% estimated trust impact', effort: 'Medium' },
		{ name: 'Yelp', pattern: /(yelp\.com|yelp)/, why: 'Strengthens third-party review and local citation coverage.', impact: '+2% estimated trust impact', effort: 'Low' },
		{ name: 'Facebook', pattern: /(facebook\.com|fb\.com)/, why: 'Confirms social proof and customer-facing brand presence.', impact: '+2% estimated trust impact', effort: 'Low' },
		{ name: 'Instagram', pattern: /(instagram\.com|instagr\.am)/, why: 'Confirms visual brand presence and social proof for creative businesses.', impact: '+2% estimated trust impact', effort: 'Low' },
		{ name: 'LinkedIn', pattern: /(linkedin\.com)/, why: 'Adds business legitimacy proof and founder/company entity confidence.', impact: '+2% estimated authority impact', effort: 'Low' },
		{ name: 'Pinterest', pattern: /(pinterest\.com)/, why: 'Adds visual discovery proof for design and creative asset searches.', impact: '+2% estimated visibility impact', effort: 'Low' },
		{ name: 'Trustpilot', pattern: /(trustpilot\.com|trustpilot)/, why: 'Adds independent review proof for buyer confidence.', impact: '+2% estimated reputation impact', effort: 'Medium' },
		{ name: 'Industry directories', pattern: /(clutch\.co|upcity\.com|thumbtack\.com|angi\.com|houzz\.com|avvo\.com|findlaw\.com|justia\.com|directory)/, why: 'Builds third-party citation consistency beyond owned channels.', impact: '+3% estimated authority impact', effort: 'Medium' },
		{ name: 'Merchant Center', pattern: /(merchantcenter|google shopping|shopping\.google\.com)/, why: 'Improves commerce entity readiness for product discovery surfaces.', impact: '+3% estimated commerce visibility impact', effort: 'Medium' }
	];
	const externalSources = sources.map(({ name, pattern, why, impact, effort }) => {
		const found = pattern.test(haystack);
		return { name, status: found ? 'Found' : 'Missing', evidence: found ? 'Detected in page/link signals' : 'Not detected during website scan', why, impact, effort };
	});
	const schemaSources = [
		{
			name: 'Knowledge Graph',
			status: /(wikidata\.org|wikipedia\.org|kgmid|sameas)/i.test(haystack) && hasSchema('Organization') ? 'Weak' : 'Missing',
			evidence: /(sameas)/i.test(haystack) ? 'Organization sameAs signals detected; no independent knowledge-base entity confirmed.' : 'No knowledge-base entity signal detected.',
			why: 'Helps AI systems connect the brand to a stable entity.',
			impact: '+4% estimated entity confidence impact',
			effort: 'Medium'
		},
		{
			name: 'Organization Schema',
			status: hasSchema('Organization') ? 'Found' : 'Missing',
			evidence: hasSchema('Organization') ? 'Organization JSON-LD detected' : 'Organization JSON-LD not detected',
			why: 'Defines the business entity for search and answer engines.',
			impact: '+4% estimated AI visibility impact',
			effort: 'Low'
		},
		{
			name: 'Review Schema',
			status: hasAnySchema(/^(Review|AggregateRating)$/i) ? 'Found' : /\breviews?\b|\btestimonials?\b/i.test(stripHtml(html)) ? 'Weak' : 'Missing',
			evidence: hasAnySchema(/^(Review|AggregateRating)$/i) ? 'Review/AggregateRating schema detected' : 'No Review/AggregateRating schema detected',
			why: 'Turns reputation proof into machine-readable evidence.',
			impact: '+3% estimated reputation impact',
			effort: 'Medium'
		},
		{
			name: 'Author Information',
			status: hasAnySchema(/^(Person|ProfilePage|BlogPosting)$/i) || /\bauthor\b/i.test(haystack) ? 'Found' : 'Missing',
			evidence: hasAnySchema(/^(Person|ProfilePage|BlogPosting)$/i) ? 'Author/person schema detected' : 'No author entity detected during scan',
			why: 'Adds expertise and accountability signals to content.',
			impact: '+2% estimated content trust impact',
			effort: 'Low'
		},
		{
			name: 'Contact Consistency',
			status: hasEmail && hasPhone ? 'Found' : hasEmail || hasPhone ? 'Weak' : 'Missing',
			evidence: `${hasEmail ? 'Email detected' : 'Email missing'} / ${hasPhone ? 'phone detected' : 'phone missing'}`,
			why: 'Confirms customers and crawlers can verify how to reach the business.',
			impact: '+3% estimated trust impact',
			effort: 'Low'
		},
		{
			name: 'NAP Consistency',
			status: hasPhone && hasAddress ? 'Found' : hasPhone || hasAddress ? 'Weak' : 'Missing',
			evidence: `${hasPhone ? 'Phone detected' : 'Phone missing'} / ${hasAddress ? 'address detected' : 'address missing'}`,
			why: 'Name, address, and phone consistency supports local trust and citations.',
			impact: '+4% estimated local SEO impact',
			effort: 'Medium'
		}
	];
	return [...externalSources, ...schemaSources];
}

function reviewSignalsFromHtml(html) {
	const source = String(html || '');
	const hasAggregate = /aggregateRating|reviewCount|ratingValue/i.test(source);
	const hasReviewText = /\breviews?\b|\btestimonials?\b/i.test(stripHtml(source));
	return {
		status: hasAggregate ? 'Strong' : hasReviewText ? 'Weak' : 'Missing',
		aggregateRating: hasAggregate,
		pageMentions: hasReviewText
	};
}

function executiveScoreComponents(findings) {
	const title = findings.title ? 12 : 0;
	const description = findings.description ? 12 : 0;
	const h1 = findings.h1 ? 10 : 0;
	const contentDepth = findings.wordCount >= 900 ? 18 : findings.wordCount >= 450 ? 13 : findings.wordCount >= 200 ? 8 : 3;
	const linkDepth = Math.min(12, findings.internalLinks * 2);
	const trustFound = findings.trustCoverage.filter(item => item.status === 'Found').length;
	const trustWeak = findings.trustCoverage.filter(item => item.status === 'Weak').length;
	const trustCoverageMax = Math.max(1, findings.trustCoverage.length);
	const trustDensity = ((trustFound + trustWeak * .55) / trustCoverageMax) * 100;
	const schemaScore = findings.schemaDetected ? 18 : 0;
	const faqScore = findings.faqDetected ? 8 : 0;
	const speedScore = findings.responseMs < 900 ? 20 : findings.responseMs < 1800 ? 15 : findings.responseMs < 3200 ? 9 : 4;
	const statusScore = findings.statusCode >= 200 && findings.statusCode < 300 ? 20 : findings.statusCode < 400 ? 12 : 0;
	const metadataScore = statusPoints(findings.titleQuality) + statusPoints(findings.metaDescriptionQuality) + statusPoints(findings.canonical) + statusPoints(findings.openGraph) + statusPoints(findings.twitterCards);
	const technicalEvidence = statusPoints(findings.schemaValidation) + statusPoints(findings.indexability) + statusPoints(findings.crawlability) + statusPoints(findings.viewport);
	const contentEvidence = statusPoints(findings.headingHierarchy) + statusPoints(findings.imageAltCoverage) + statusPoints(findings.aiReadableContent);
	const brokenLinkPenalty = Math.min(12, findings.brokenInternalLinks * 4);
	return {
		localSeo: clampNumber((findings.sitemapFound ? 28 : 8) + (findings.robotsFound ? 18 : 6) + Math.min(28, trustDensity * .28) + Math.min(20, findings.internalLinks)),
		websiteHealth: clampNumber(statusScore + speedScore + title + description + h1 + Math.min(18, findings.internalLinks) + metadataScore * .16 - brokenLinkPenalty),
		trustCoverage: clampNumber(trustDensity * .78 + (findings.reviewSignals.status === 'Strong' ? 18 : findings.reviewSignals.status === 'Weak' ? 9 : 0)),
		aiVisibility: clampNumber(schemaScore + faqScore + title + description + Math.min(24, contentDepth + linkDepth) + statusPoints(findings.aiReadableContent) * .12),
		technicalHealth: clampNumber(statusScore + speedScore + (findings.schemaDetected ? 14 : 0) + (findings.sitemapFound ? 14 : 0) + (findings.robotsFound ? 10 : 0) + technicalEvidence * .12 - brokenLinkPenalty),
		authority: clampNumber(trustDensity * .45 + Math.min(28, findings.externalLinks * 2) + (findings.reviewSignals.status === 'Strong' ? 18 : findings.reviewSignals.status === 'Weak' ? 8 : 0)),
		content: clampNumber(title + description + h1 + contentDepth + (findings.faqDetected ? 10 : 0) + Math.min(22, findings.internalLinks) + contentEvidence * .1),
		reputation: clampNumber((findings.reviewSignals.status === 'Strong' ? 44 : findings.reviewSignals.status === 'Weak' ? 24 : 6) + trustDensity * .32)
	};
}

function statusPoints(signal = {}) {
	const status = String(signal.status || '').toLowerCase();
	if (status === 'found' || status === 'valid') return 10;
	if (status === 'weak') return 5;
	return 0;
}

function weightedBusinessGrowthScore(components) {
	const weights = {
		localSeo: .14,
		websiteHealth: .16,
		trustCoverage: .18,
		aiVisibility: .14,
		technicalHealth: .12,
		authority: .1,
		content: .1,
		reputation: .06
	};
	return clampNumber(Object.entries(weights).reduce((sum, [key, weight]) => sum + (components[key] || 0) * weight, 0));
}

function clampNumber(value) {
	return Math.max(0, Math.min(100, Math.round(Number(value) || 0)));
}

function timelineFromFindings(findings, score) {
	const events = [
		['Now', 'Website scan completed', `HTTP ${findings.statusCode} / ${findings.responseMs}ms response`, findings.statusCode < 400 ? 'complete' : 'warning'],
		['Now', 'Technical audit completed', `${findings.robotsFound ? 'Robots found' : 'Robots missing'} / ${findings.sitemapFound ? 'sitemap found' : 'sitemap not found'}`, findings.sitemapFound && findings.robotsFound ? 'complete' : 'warning'],
		['Now', 'Schema analysis completed', findings.schemaDetected ? `${findings.schemaTypes.join(', ')} detected` : 'No JSON-LD schema detected', findings.schemaDetected ? 'complete' : 'warning'],
		['Now', 'Metadata reviewed', `${findings.canonical.status} canonical / ${findings.openGraph.status} OpenGraph / ${findings.twitterCards.status} Twitter Cards`, findings.canonical.status === 'Found' && findings.openGraph.status === 'Found' ? 'complete' : 'warning'],
		['Now', 'Link integrity checked', `${findings.brokenInternalLinks}/${findings.checkedInternalLinks} checked internal links broken`, findings.brokenInternalLinks ? 'warning' : 'complete'],
		['Now', 'Content evaluated', `${findings.wordCount} words / ${findings.h1 ? 'H1 found' : 'H1 not detected'}`, findings.wordCount >= 450 && findings.h1 ? 'complete' : 'warning'],
		['Now', 'Accessibility signals checked', `${findings.imageAltCoverage.evidence} / ${findings.headingHierarchy.evidence}`, findings.imageAltCoverage.status === 'Found' && findings.headingHierarchy.status === 'Found' ? 'complete' : 'warning'],
		['Now', 'Trust coverage reviewed', `${findings.trustCoverage.filter(item => item.status === 'Found').length} trust sources found`, findings.trustCoverage.some(item => item.status === 'Found') ? 'stable' : 'warning'],
		['Now', 'Business Growth Score calculated', `${score}/100 from weighted scan components`, 'growth']
	];
	if (findings.reviewSignals.status !== 'Missing') events.splice(4, 0, ['Now', 'Review signals detected', `${findings.reviewSignals.status} reputation signal`, findings.reviewSignals.status === 'Strong' ? 'complete' : 'stable']);
	return events;
}

function keywordOpportunitiesFromFindings(findings) {
	const source = `${findings.title} ${findings.description} ${findings.h1}`.toLowerCase();
	const stop = new Set(['the', 'and', 'for', 'with', 'from', 'your', 'our', 'you', 'are', 'that', 'this', 'near', 'best', 'home', 'page']);
	const words = source.match(/[a-z][a-z0-9-]{3,}/g) || [];
	const counts = words.reduce((map, word) => {
		if (!stop.has(word)) map[word] = (map[word] || 0) + 1;
		return map;
	}, {});
	return Object.entries(counts)
		.sort((a, b) => b[1] - a[1])
		.slice(0, 5)
		.map(([keyword, count]) => ({
			keyword,
			currentRanking: 'Ranking data pending.',
			opportunityLevel: count > 1 ? 'Medium' : 'Low',
			projectedBusinessImpact: 'Visibility opportunity; ranking data not connected.',
			estimatedVisibilityGain: findings.schemaDetected ? 'Pending ranking data' : 'Pending schema/content validation'
		}));
}

function scoreExplanation(components) {
	return Object.entries(components).map(([key, value]) => ({
		component: key.replace(/([A-Z])/g, ' $1').replace(/^./, char => char.toUpperCase()),
		value,
		source: 'Executive Scan'
	}));
}

function applyStripeEvent(store, event) {
	const object = event.data?.object || {};
	if (event.type === 'checkout.session.completed') {
		return upsertSubscription(store, {
			userId: object.metadata?.user_id || object.client_reference_id || object.customer || 'stripe-user',
			accountId: object.metadata?.account_id || object.client_reference_id || object.customer || 'stripe-account',
			planId: object.metadata?.internal_plan_id || 'free',
			billingStatus: object.payment_status === 'paid' ? 'active' : 'incomplete',
			stripeCustomerId: object.customer,
			stripeSubscriptionId: object.subscription,
			checkoutSessionId: object.id,
			businessWebsite: object.metadata?.business_website || '',
			businessId: object.metadata?.business_id || '',
			lastStripeEventType: event.type
		});
	}
	if (event.type.startsWith('customer.subscription.')) {
		const planId = object.metadata?.internal_plan_id || planFromSubscriptionObject(object);
		const status = event.type === 'customer.subscription.deleted' ? 'canceled' : normalizeStripeStatus(object.status);
		return upsertSubscription(store, {
			userId: object.metadata?.user_id || userIdForStripeObject(store, object),
			accountId: object.metadata?.account_id || accountIdForStripeObject(store, object),
			planId,
			billingStatus: status,
			stripeCustomerId: object.customer,
			stripeSubscriptionId: object.id,
			currentPeriodEnd: object.current_period_end ? new Date(object.current_period_end * 1000).toISOString() : null,
			lastStripeEventType: event.type
		});
	}
	if (event.type === 'invoice.payment_succeeded' || event.type === 'invoice.payment_failed') {
		const existing = findSubscription(store, null, null, object.customer, object.subscription);
		return upsertSubscription(store, {
			...(existing || {}),
			userId: existing?.userId || object.customer || 'stripe-user',
			accountId: existing?.accountId || object.customer || 'stripe-account',
			planId: existing?.planId || planFromSubscriptionObject(object),
			billingStatus: event.type === 'invoice.payment_succeeded' ? 'active' : 'past_due',
			stripeCustomerId: object.customer,
			stripeSubscriptionId: object.subscription,
			lastStripeEventType: event.type
		});
	}
	return { ignored: true, type: event.type };
}

function upsertSubscription(store, update) {
	const planId = normalizePlanId(update.planId);
	const billingStatus = normalizeStripeStatus(update.billingStatus);
	const activePaid = ['active', 'trialing'].includes(billingStatus);
	const entitlementPlan = activePaid ? planId : 'free';
	const existing = findSubscription(store, update.userId, update.accountId, update.stripeCustomerId, update.stripeSubscriptionId);
	const record = {
		id: existing?.id || `sub_${Date.now()}_${Math.random().toString(16).slice(2)}`,
		userId: String(update.userId || existing?.userId || 'local-user'),
		accountId: String(update.accountId || existing?.accountId || update.userId || 'local-account'),
		planId,
		entitlementPlan,
		entitlements: entitlementsFor(entitlementPlan),
		billingStatus,
		stripeCustomerId: update.stripeCustomerId || existing?.stripeCustomerId || null,
		stripeSubscriptionId: update.stripeSubscriptionId || existing?.stripeSubscriptionId || null,
		checkoutSessionId: update.checkoutSessionId || existing?.checkoutSessionId || null,
		businessWebsite: update.businessWebsite || existing?.businessWebsite || '',
		businessId: update.businessId || existing?.businessId || '',
		currentPeriodEnd: update.currentPeriodEnd || existing?.currentPeriodEnd || null,
		lastStripeEventType: update.lastStripeEventType || existing?.lastStripeEventType || null,
		updatedAt: new Date().toISOString(),
		createdAt: existing?.createdAt || new Date().toISOString()
	};
	store.subscriptions = store.subscriptions.filter(item => item.id !== record.id);
	store.subscriptions.push(record);
	return { subscriptionId: record.id, planId: record.planId, entitlementPlan: record.entitlementPlan, billingStatus: record.billingStatus };
}

function subscriptionStatusFor(userId, accountId) {
	const store = readSubscriptionStore();
	const record = findSubscription(store, userId || 'local-user', accountId || userId || 'local-account') || null;
	if (!record) {
		return {
			planId: 'free',
			entitlementPlan: 'free',
			billingStatus: 'free',
			entitlements: entitlementsFor('free'),
			stripeCustomerId: null,
			stripeSubscriptionId: null
		};
	}
	return record;
}

function findSubscription(store, userId, accountId, stripeCustomerId, stripeSubscriptionId) {
	return store.subscriptions.find(item =>
		(stripeSubscriptionId && item.stripeSubscriptionId === stripeSubscriptionId)
		|| (stripeCustomerId && item.stripeCustomerId === stripeCustomerId)
		|| (accountId && item.accountId === String(accountId))
		|| (userId && item.userId === String(userId))
	);
}

function userIdForStripeObject(store, object) {
	return findSubscription(store, null, null, object.customer, object.id)?.userId || object.customer || 'stripe-user';
}

function accountIdForStripeObject(store, object) {
	return findSubscription(store, null, null, object.customer, object.id)?.accountId || object.customer || 'stripe-account';
}

function planFromSubscriptionObject(object) {
	const price = object.items?.data?.[0]?.price?.id || object.lines?.data?.[0]?.price?.id || '';
	return planFromPriceId(price);
}

function planFromPriceId(priceId) {
	const match = Object.values(plans).find(plan => plan.stripePriceEnv && process.env[plan.stripePriceEnv] === priceId);
	return match?.id || 'free';
}

function normalizeStripeStatus(status) {
	const value = String(status || '').toLowerCase();
	if (['active', 'trialing', 'past_due', 'canceled', 'incomplete', 'unpaid'].includes(value)) return value;
	if (value === 'paid') return 'active';
	return value || 'incomplete';
}

function stripeEnvironmentCheck(plan, allowPortalWithoutPrice = false) {
	const secret = process.env.STRIPE_SECRET_KEY;
	if (!secret) {
		return { status: 503, body: { error: 'stripe_not_configured', message: 'STRIPE_SECRET_KEY is required.' } };
	}
	const stripeMode = String(process.env.STRIPE_MODE || 'test').toLowerCase();
	const expectedPrefix = stripeMode === 'live' ? 'sk_live_' : 'sk_test_';
	if (!secret.startsWith(expectedPrefix)) {
		return { status: 400, body: { error: 'stripe_key_mode_mismatch', message: `STRIPE_SECRET_KEY must start with ${expectedPrefix} when STRIPE_MODE=${stripeMode}.` } };
	}
	if (!allowPortalWithoutPrice && plan.stripePriceEnv && !process.env[plan.stripePriceEnv]) {
		return { status: 503, body: { error: 'price_not_configured', message: `${plan.stripePriceEnv} is required for ${plan.displayName}.` } };
	}
	return null;
}

function verifyStripeSignature(rawBody, signatureHeader, secret) {
	if (!signatureHeader || !secret) return false;
	const parts = Object.fromEntries(signatureHeader.split(',').map(item => {
		const [key, value] = item.split('=');
		return [key, value];
	}));
	const timestamp = parts.t;
	const signature = parts.v1;
	if (!timestamp || !signature) return false;
	const expected = crypto.createHmac('sha256', secret).update(`${timestamp}.${rawBody.toString('utf8')}`).digest('hex');
	const expectedBuffer = Buffer.from(expected, 'hex');
	const signatureBuffer = Buffer.from(signature, 'hex');
	if (expectedBuffer.length !== signatureBuffer.length) return false;
	const ageSeconds = Math.abs(Date.now() / 1000 - Number(timestamp));
	return ageSeconds <= 300 && crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
}

function readSubscriptionStore() {
	if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
	if (!fs.existsSync(subscriptionStorePath)) {
		return { subscriptions: [], processedEvents: {}, enterpriseInquiries: [] };
	}
	try {
		const parsed = JSON.parse(fs.readFileSync(subscriptionStorePath, 'utf8'));
		return {
			subscriptions: Array.isArray(parsed.subscriptions) ? parsed.subscriptions : [],
			processedEvents: parsed.processedEvents && typeof parsed.processedEvents === 'object' ? parsed.processedEvents : {},
			enterpriseInquiries: Array.isArray(parsed.enterpriseInquiries) ? parsed.enterpriseInquiries : []
		};
	} catch (error) {
		return { subscriptions: [], processedEvents: {}, enterpriseInquiries: [] };
	}
}

function writeSubscriptionStore(store) {
	if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
	fs.writeFileSync(subscriptionStorePath, JSON.stringify(store, null, 2));
}

function serveStatic(req, res, url) {
	let pathname = decodeURIComponent(url.pathname);
	if (pathname === '/') pathname = '/index.html';
	serveStaticPath(req, res, pathname);
}

function serveStaticPath(req, res, pathname) {
	let filePath = path.normalize(path.join(root, pathname));
	if (!filePath.startsWith(root)) {
		res.writeHead(403);
		res.end('Forbidden');
		return;
	}
	if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
		filePath = path.join(filePath, 'index.html');
	}
	if (!fs.existsSync(filePath)) {
		res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
		res.end('Not found');
		return;
	}
	const type = contentTypes[path.extname(filePath)] || 'application/octet-stream';
	const ext = path.extname(filePath);
	const isHtml = ext === '.html';
	const headers = productionHeaders({
		'Content-Type': type,
		'Cache-Control': cacheControlForExtension(ext)
	});
	if (req.method === 'HEAD') {
		res.writeHead(200, headers);
		res.end();
		return;
	}
	if (isHtml) {
		res.writeHead(200, headers);
		res.end(injectProductionHead(fs.readFileSync(filePath, 'utf8')));
		return;
	}
	const acceptsGzip = /\bgzip\b/.test(String(req.headers['accept-encoding'] || ''));
	if (acceptsGzip && /\.(css|js|json|svg|txt|xml|webmanifest)$/i.test(filePath)) {
		res.writeHead(200, { ...headers, 'Content-Encoding': 'gzip' });
		fs.createReadStream(filePath).pipe(zlib.createGzip({ level: 9 })).pipe(res);
		return;
	}
	res.writeHead(200, headers);
	fs.createReadStream(filePath).pipe(res);
}

function sendJson(res, status, payload) {
	res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
	res.end(JSON.stringify(payload));
}

function readRawBody(req) {
	return new Promise((resolve, reject) => {
		const chunks = [];
		req.on('data', chunk => chunks.push(chunk));
		req.on('end', () => resolve(Buffer.concat(chunks)));
		req.on('error', reject);
	});
}

async function readJsonBody(req) {
	const raw = await readRawBody(req);
	if (!raw.length) return {};
	try {
		return JSON.parse(raw.toString('utf8'));
	} catch (error) {
		return {};
	}
}

function loadEnvFile(filePath) {
	if (!fs.existsSync(filePath)) return;
	const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
	for (const line of lines) {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith('#')) continue;
		const equals = trimmed.indexOf('=');
		if (equals === -1) continue;
		const key = trimmed.slice(0, equals).trim();
		const value = trimmed.slice(equals + 1).trim().replace(/^['"]|['"]$/g, '');
		if (!process.env[key]) process.env[key] = value;
	}
}
