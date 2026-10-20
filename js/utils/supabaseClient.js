// ==========================================================================
// Supabase Client Integration & Database Service
// Conforms to .agents/skills/supabase-security-architect/SKILL.md
// Handles table queries, RLS anon auth, and public storage photo uploads
// ==========================================================================
window.LNF = window.LNF || {};

(function () {
  // Read client environment variables securely
  // Only public URL and Anon Key are accepted; never embed service keys
  const getEnvVar = (name) => {
    if (window.LNF_CONFIG) {
      if (window.LNF_CONFIG[name]) return window.LNF_CONFIG[name];
      const stripped = name.replace(/^VITE_/, '');
      if (window.LNF_CONFIG[stripped]) return window.LNF_CONFIG[stripped];
    }
    if (typeof process !== 'undefined' && process.env?.[name]) return process.env[name];
    if (typeof window !== 'undefined' && window[name]) return window[name];
    if (typeof window !== 'undefined' && window[`LNF_${name}`]) return window[`LNF_${name}`];
    return localStorage.getItem(`tivoli_${name.toLowerCase()}`) || '';
  };

  const getSupabaseUrl = () => getEnvVar('VITE_SUPABASE_URL') || getEnvVar('SUPABASE_URL');
  const getSupabaseAnonKey = () => getEnvVar('VITE_SUPABASE_ANON_KEY') || getEnvVar('SUPABASE_ANON_KEY');

  let cachedClient = null;

  function getClient() {
    if (cachedClient) return cachedClient;
    const url = getSupabaseUrl();
    const key = getSupabaseAnonKey();

    if (window.supabase && url && key) {
      try {
        cachedClient = window.supabase.createClient(url, key, {
          auth: {
            persistSession: false,
            autoRefreshToken: false
          }
        });
        return cachedClient;
      } catch (err) {
        console.warn('Failed to initialize Supabase client:', err);
        return null;
      }
    }
    return null;
  }

  function isConfigured() {
    return Boolean(getClient());
  }

  function saveConfig(url, key) {
    if (url) localStorage.setItem('tivoli_vite_supabase_url', url.trim());
    if (key) localStorage.setItem('tivoli_vite_supabase_anon_key', key.trim());
    cachedClient = null; // Invalidate cached instance
    return getClient();
  }

  let envInitPromise = null;

  /**
   * Automatically resolves Supabase environment variables from:
   * 1. Existing memory/localStorage
   * 2. Vercel Serverless Function (/api/config)
   * 3. Local development .env file (/.env)
   */
  async function loadEnvFromSources() {
    if (getSupabaseUrl() && getSupabaseAnonKey()) {
      return true;
    }

    // Attempt 1: Fetch from Vercel Serverless API (/api/config)
    try {
      const apiRes = await fetch('/api/config');
      if (apiRes.ok) {
        const data = await apiRes.json();
        if (data && data.supabaseUrl && data.supabaseAnonKey) {
          window.VITE_SUPABASE_URL = data.supabaseUrl;
          window.VITE_SUPABASE_ANON_KEY = data.supabaseAnonKey;
          window.LNF_CONFIG = window.LNF_CONFIG || {};
          window.LNF_CONFIG.SUPABASE_URL = data.supabaseUrl;
          window.LNF_CONFIG.SUPABASE_ANON_KEY = data.supabaseAnonKey;
          cachedClient = null;
          return true;
        }
      }
    } catch (e) {
      // Not deployed on Vercel API or offline
    }

    // Attempt 2: Fetch local .env file (for localhost development)
    try {
      const envRes = await fetch('/.env');
      if (envRes.ok) {
        const text = await envRes.text();
        const lines = text.split('\n');
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#')) continue;
          const eqIdx = trimmed.indexOf('=');
          if (eqIdx > 0) {
            const k = trimmed.slice(0, eqIdx).trim();
            const v = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
            if (k === 'VITE_SUPABASE_URL' || k === 'SUPABASE_URL') {
              window.VITE_SUPABASE_URL = v;
              window.LNF_CONFIG = window.LNF_CONFIG || {};
              window.LNF_CONFIG.SUPABASE_URL = v;
            } else if (k === 'VITE_SUPABASE_ANON_KEY' || k === 'SUPABASE_ANON_KEY') {
              window.VITE_SUPABASE_ANON_KEY = v;
              window.LNF_CONFIG = window.LNF_CONFIG || {};
              window.LNF_CONFIG.SUPABASE_ANON_KEY = v;
            }
          }
        }
        cachedClient = null;
        if (getSupabaseUrl() && getSupabaseAnonKey()) {
          return true;
        }
      }
    } catch (e) {
      // Local .env not accessible over HTTP
    }

    return isConfigured();
  }

  function init() {
    if (!envInitPromise) {
      envInitPromise = loadEnvFromSources();
    }
    return envInitPromise;
  }

  function clearConfig() {
    localStorage.removeItem('tivoli_vite_supabase_url');
    localStorage.removeItem('tivoli_vite_supabase_anon_key');
    cachedClient = null;
  }

  // Row Mapper: PostgreSQL snake_case <-> Application camelCase
  function mapRowToItem(row) {
    return {
      id: row.id,
      title: row.title,
      category: row.category,
      studentId: row.identifier || '',
      location: row.location,
      staffInitials: row.staff_initials,
      image: row.image_url,
      status: row.status,
      dateLogged: row.created_at,
      claimedAt: row.claimed_at,
      claimedBy: row.claimant_name,
      claimedPhone: row.claimant_contact,
      releasingStaff: row.released_by
    };
  }

  /**
   * Uploads compressed JPEG photo to the 'item-photos' public storage bucket
   * @param {string|File|Blob} imageData - Base64 DataURL or File/Blob
   * @returns {Promise<string>} Public CDN URL of the uploaded photo
   */
  async function uploadImage(imageData) {
    const client = getClient();
    if (!client) {
      // Offline fallback: keep base64 image data URL
      return imageData;
    }

    try {
      let blob;
      if (typeof imageData === 'string' && imageData.startsWith('data:')) {
        const response = await fetch(imageData);
        blob = await response.blob();
      } else if (imageData instanceof Blob || imageData instanceof File) {
        blob = imageData;
      } else {
        return imageData;
      }

      const fileExt = 'jpg';
      const fileName = `photos/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${fileExt}`;

      const { data, error } = await client.storage
        .from('item-photos')
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Supabase storage upload error:', error);
        throw error;
      }

      const { data: publicUrlData } = client.storage
        .from('item-photos')
        .getPublicUrl(fileName);

      return publicUrlData.publicUrl;
    } catch (err) {
      console.warn('Storage upload failed, falling back to embedded photo:', err);
      return imageData;
    }
  }

  /**
   * Fetches active and claimed items from Supabase ordered by created_at descending
   * @returns {Promise<Array>} Array of mapped item objects
   */
  async function fetchItems() {
    const client = getClient();
    if (!client) return null;

    const { data, error } = await client
      .from('lost_items')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase fetchItems error:', error);
      throw error;
    }

    return (data || []).map(mapRowToItem);
  }

  /**
   * Inserts a new lost item into Supabase, uploading the photo first
   * @param {Object} itemData - Item form payload
   * @returns {Promise<Object>} Created item in UI format
   */
  async function addItem(itemData) {
    const client = getClient();
    if (!client) return null;

    let imageUrl = null;
    if (itemData.image) {
      imageUrl = await uploadImage(itemData.image);
    }

    const payload = {
      title: itemData.title.trim(),
      category: itemData.category,
      identifier: itemData.studentId?.trim() || null,
      location: itemData.location.trim(),
      staff_initials: (itemData.staffInitials || 'ST').toUpperCase().trim(),
      image_url: imageUrl,
      status: 'active'
    };

    const { data, error } = await client
      .from('lost_items')
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error('Supabase addItem error:', error);
      throw error;
    }

    return mapRowToItem(data);
  }

  /**
   * Updates an item's status to 'claimed' with release verification details
   * @param {string} itemId - UUID of the item
   * @param {Object} claimData - Claimant name, contact info, releasing staff
   * @returns {Promise<Object>} Updated item in UI format
   */
  async function claimItem(itemId, claimData) {
    const client = getClient();
    if (!client) return null;

    const payload = {
      status: 'claimed',
      claimed_at: new Date().toISOString(),
      claimant_name: claimData.claimantName.trim(),
      claimant_contact: claimData.claimantIdOrPhone?.trim() || null,
      released_by: (claimData.releasingStaff || 'ST').toUpperCase().trim()
    };

    const { data, error } = await client
      .from('lost_items')
      .update(payload)
      .eq('id', itemId)
      .select()
      .single();

    if (error) {
      console.error('Supabase claimItem error:', error);
      throw error;
    }

    return mapRowToItem(data);
  }

  /**
   * Updates existing item details (storage location, markings, title, photo)
   */
  async function updateItem(itemId, updatedData) {
    const client = getClient();
    if (!client) return null;

    let imageUrl = updatedData.image;
    if (imageUrl && imageUrl.startsWith('data:')) {
      imageUrl = await uploadImage(imageUrl);
    }

    const payload = {
      title: updatedData.title.trim(),
      category: updatedData.category,
      identifier: updatedData.studentId?.trim() || null,
      location: updatedData.location.trim(),
      staff_initials: (updatedData.staffInitials || 'ST').toUpperCase().trim(),
      image_url: imageUrl
    };

    const { data, error } = await client
      .from('lost_items')
      .update(payload)
      .eq('id', itemId)
      .select()
      .single();

    if (error) {
      console.error('Supabase updateItem error:', error);
      throw error;
    }

    return mapRowToItem(data);
  }

  /**
   * Deletes an item from Supabase
   */
  async function deleteItem(itemId) {
    const client = getClient();
    if (!client) return null;

    const { error } = await client
      .from('lost_items')
      .delete()
      .eq('id', itemId);

    if (error) {
      console.error('Supabase deleteItem error:', error);
      throw error;
    }

    return true;
  }

  // Export to namespace
  window.LNF.supabaseService = {
    init,
    isConfigured,
    getClient,
    saveConfig,
    clearConfig,
    getSupabaseUrl,
    getSupabaseAnonKey,
    fetchItems,
    uploadImage,
    addItem,
    claimItem,
    updateItem,
    deleteItem
  };
})();
