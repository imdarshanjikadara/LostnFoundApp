# Supabase Database & Storage Setup Guide

This directory contains the production-ready PostgreSQL initialization script for the **Tivoli ID Station — Lost & Found** web application.

## 🚀 How to Run in Supabase

1. Log into your [Supabase Dashboard](https://supabase.com/dashboard) and open your project.
2. Navigate to the **SQL Editor** in the left sidebar.
3. Click **"New Query"**.
4. Paste the entire contents of [`schema.sql`](file:///d:/Antigravity/LostnFoundApp/supabase/schema.sql).
5. Click **"Run"** (or press `Ctrl+Enter` / `Cmd+Enter`).

---

## 🛡️ Security & Architecture Checklist (Adhering to `supabase-security-architect`)

| Feature | Implementation | Description |
|---|---|---|
| **Table** | `public.lost_items` | `id UUID` generated via `gen_random_uuid()` with timestamps |
| **Integrity Constraints** | `CHECK (status IN ('active', 'claimed'))` | Prevents invalid statuses at the database level |
| **Row Level Security (RLS)** | `ALTER TABLE lost_items ENABLE ROW LEVEL SECURITY;` | All operations require explicit policies |
| **Anon Key Access** | Explicit policies for `SELECT`, `INSERT`, `UPDATE`, `DELETE` | Safe browser access using only the public `anon` key |
| **Public Storage Bucket** | `item-photos` (Public = true) | Dedicated media CDN for item thumbnail photos |
| **File Size Limit** | 2MB (`2,097,152` bytes) | Enforces storage safety alongside client-side canvas compressor |
| **MIME Type Guard** | `image/jpeg`, `image/png`, `image/webp` | Prevents non-image or executable file uploads |
| **Realtime Sync** | Added to `supabase_realtime` publication | Enables instantaneous multi-tablet desk synchronization |

---

## 🔑 Client Environment Setup

In accordance with security guidelines:
- **Use Only Public Keys**: Only provide the `SUPABASE_URL` and `SUPABASE_ANON_KEY` to the front-end application.
- **Never Expose Service Role Key**: Keep the `SUPABASE_SERVICE_ROLE_KEY` secret.
