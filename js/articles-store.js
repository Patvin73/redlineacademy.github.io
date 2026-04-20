/**
 * articles-store.js  —  Supabase edition
 * ─────────────────────────────────────────────────────────────
 * Semua method ASYNC (return Promise).
 * Tergantung pada: window.__lmsSupabaseReady__ (dari supabase-client.js)
 * Client tersedia sebagai: window.lmsSupabase
 * ─────────────────────────────────────────────────────────────
 */
(function (global) {
  'use strict';

  // ── Mapping JS camelCase → Supabase snake_case ─────────────
  function toRow(a) {
    return {
      id:           a.id,
      title:        a.title,
      slug:         a.slug,
      excerpt:      a.excerpt      || '',
      content:      a.content      || '',
      badge:        a.badge        || 'Artikel',
      type:         a.type         || 'article',
      difficulty:   a.difficulty   || 'beginner',
      read_time:    a.readTime     || 5,
      category:     a.category     || '',
      image_url:    a.imageUrl     || '',
      meta_desc:    a.metaDesc     || '',
      status:       a.status       || 'draft',
      author:       a.author       || '',
      published_at: a.publishedAt  || null,
    };
  }

  function fromRow(r) {
    if (!r) return null;
    return {
      id:          r.id,
      title:       r.title,
      slug:        r.slug,
      excerpt:     r.excerpt      || '',
      content:     r.content      || '',
      badge:       r.badge        || 'Artikel',
      type:        r.type         || 'article',
      difficulty:  r.difficulty   || 'beginner',
      readTime:    r.read_time    || 5,
      category:    r.category     || '',
      imageUrl:    r.image_url    || '',
      metaDesc:    r.meta_desc    || '',
      status:      r.status       || 'draft',
      author:      r.author       || '',
      createdAt:   r.created_at,
      updatedAt:   r.updated_at,
      publishedAt: r.published_at || null,
    };
  }

  // ── Ambil client, tunggu ready ──────────────────────────────
  async function getClient() {
    if (global.lmsSupabase) return global.lmsSupabase;
    if (global.__lmsSupabaseReady__) {
      await global.__lmsSupabaseReady__;
      return global.lmsSupabase;
    }
    throw new Error('[ArticlesStore] lmsSupabase belum tersedia.');
  }

  // ── Public API (semua async) ────────────────────────────────
  var ArticlesStore = {

    async getAll() {
      try {
        var db = await getClient();
        var { data, error } = await db
          .from('articles').select('*')
          .order('created_at', { ascending: false });
        if (error) { console.error('[ArticlesStore] getAll:', error.message); return []; }
        return (data || []).map(fromRow);
      } catch (e) { console.error('[ArticlesStore] getAll:', e); return []; }
    },

    async getPublished() {
      try {
        var db = await getClient();
        var { data, error } = await db
          .from('articles').select('*')
          .eq('status', 'published')
          .order('published_at', { ascending: false });
        if (error) { console.error('[ArticlesStore] getPublished:', error.message); return []; }
        return (data || []).map(fromRow);
      } catch (e) { console.error('[ArticlesStore] getPublished:', e); return []; }
    },

    async getById(id) {
      try {
        var db = await getClient();
        var { data, error } = await db
          .from('articles').select('*').eq('id', id).maybeSingle();
        if (error) { console.error('[ArticlesStore] getById:', error.message); return null; }
        return fromRow(data);
      } catch (e) { console.error('[ArticlesStore] getById:', e); return null; }
    },

    async getBySlug(slug) {
      try {
        var db = await getClient();
        var { data, error } = await db
          .from('articles').select('*').eq('slug', slug).maybeSingle();
        if (error) { console.error('[ArticlesStore] getBySlug:', error.message); return null; }
        return fromRow(data);
      } catch (e) { console.error('[ArticlesStore] getBySlug:', e); return null; }
    },

    async save(article) {
      try {
        var db = await getClient();
        var { data, error } = await db
          .from('articles')
          .upsert(toRow(article), { onConflict: 'id' })
          .select().single();
        if (error) { console.error('[ArticlesStore] save:', error.message); return null; }
        return fromRow(data);
      } catch (e) { console.error('[ArticlesStore] save:', e); return null; }
    },

    async delete(id) {
      try {
        var db = await getClient();
        var { error } = await db.from('articles').delete().eq('id', id);
        if (error) { console.error('[ArticlesStore] delete:', error.message); return false; }
        return true;
      } catch (e) { console.error('[ArticlesStore] delete:', e); return false; }
    },

    async slugExists(slug, excludeId) {
      try {
        var db = await getClient();
        var { data, error } = await db
          .from('articles').select('id').eq('slug', slug);
        if (error || !data || !data.length) return false;
        if (excludeId) return data.some(function (r) { return r.id !== excludeId; });
        return true;
      } catch (e) { return false; }
    },

    // ── Sync helpers ─────────────────────────────────────────
    generateSlug(title) {
      return String(title || '').toLowerCase().trim()
        .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-')
        .replace(/-+/g, '-').replace(/^-+|-+$/g, '');
    },
    generateId() {
      return 'art_' + Date.now() + '_' + Math.floor(Math.random() * 9999);
    },
    formatDate(isoString) {
      if (!isoString) return '';
      try {
        return new Date(isoString).toLocaleDateString('id-ID', {
          day: 'numeric', month: 'long', year: 'numeric'
        });
      } catch (e) { return isoString; }
    },
  };

  global.ArticlesStore = ArticlesStore;

})(window);
