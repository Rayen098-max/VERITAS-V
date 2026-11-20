import { createClient } from '@supabase/supabase-js';
import type { VideoAnalysis } from '../types';

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://lxkrjthnokyojadpymoy.supabase.co';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface UploadResult {
  publicUrl: string;
  storagePath: string;
  fileName: string;
}

/**
 * Uploads a video file directly to Supabase Storage 'videos' bucket.
 * Uses standard chunked upload suitable for large files (100MB+).
 */
export async function uploadVideoToSupabase(
  file: File,
  onProgress?: (progressPct: number) => void
): Promise<UploadResult> {
  const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storagePath = `${Date.now()}_${cleanName}`;

  if (onProgress) onProgress(15);

  const { data, error } = await supabase.storage
    .from('videos')
    .upload(storagePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) {
    throw new Error(`Supabase video upload failed: ${error.message}`);
  }

  if (onProgress) onProgress(90);

  const { data: publicUrlData } = supabase.storage
    .from('videos')
    .getPublicUrl(data.path);

  if (onProgress) onProgress(100);

  return {
    publicUrl: publicUrlData.publicUrl,
    storagePath: data.path,
    fileName: file.name,
  };
}

/**
 * Retrieves the public URL for an extracted frame stored in the 'frames' bucket.
 */
export function getFramePublicUrl(framePath: string): string {
  if (!framePath) return '';
  if (framePath.startsWith('http://') || framePath.startsWith('https://')) {
    return framePath;
  }
  const cleanPath = framePath.replace(/^[\\/]*(frames[\\/]|public[\\/])*/, '');
  const { data } = supabase.storage.from('frames').getPublicUrl(cleanPath);
  return data.publicUrl;
}

/**
 * Fetch all persistent analyses from the Supabase database.
 */
export async function fetchAnalysesFromSupabase(): Promise<VideoAnalysis[]> {
  try {
    const { data, error } = await supabase
      .from('analyses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) {
      console.warn('Supabase fetchAnalyses warning:', error?.message);
      return [];
    }

    return data.map((row: any) => ({
      id: row.id,
      videoName: row.video_name,
      videoUrl: row.video_url,
      fileSize: row.file_size || 'N/A',
      duration: row.duration || 0,
      dateAnalyzed: new Date(row.created_at).toISOString().replace('T', ' ').substring(0, 16),
      status: row.status || 'completed',
      trustScore: row.verification_report?.trust_score ?? 85,
      scenesCount: (row.stages?.find((s: any) => s.id === 'captioning')?.output_data?.scenes || []).length || 0,
      statementsCount: (row.causal_graph?.claims || []).length || 0,
      verifiedCount: (row.verification_report?.verifications || []).filter((v: any) => v.status === 'supported').length || 0,
      hallucinationsCount: (row.verification_report?.verifications || []).filter((v: any) => v.status === 'unsupported').length || 0,
      scenes: row.stages?.find((s: any) => s.id === 'captioning')?.output_data?.scenes || [],
      causalRelations: row.causal_graph?.claims || [],
      verifications: row.verification_report?.verifications || [],
      explainability: row.verification_report?.explainability || [],
      speakers: row.stages?.find((s: any) => s.id === 'diarization')?.output_data?.speakers || [],
    }));
  } catch (err) {
    console.error('Supabase fetchAnalyses error:', err);
    return [];
  }
}

/**
 * Fetch a single analysis record from Supabase by ID.
 */
export async function fetchAnalysisByIdFromSupabase(id: string): Promise<VideoAnalysis | null> {
  try {
    const { data, error } = await supabase
      .from('analyses')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      videoName: data.video_name,
      videoUrl: data.video_url,
      fileSize: data.file_size || 'N/A',
      duration: data.duration || 0,
      dateAnalyzed: new Date(data.created_at).toISOString().replace('T', ' ').substring(0, 16),
      status: data.status || 'completed',
      trustScore: data.verification_report?.trust_score ?? 85,
      scenesCount: (data.stages?.find((s: any) => s.id === 'captioning')?.output_data?.scenes || []).length || 0,
      statementsCount: (data.causal_graph?.claims || []).length || 0,
      verifiedCount: (data.verification_report?.verifications || []).filter((v: any) => v.status === 'supported').length || 0,
      hallucinationsCount: (data.verification_report?.verifications || []).filter((v: any) => v.status === 'unsupported').length || 0,
      scenes: data.stages?.find((s: any) => s.id === 'captioning')?.output_data?.scenes || [],
      causalRelations: data.causal_graph?.claims || [],
      verifications: data.verification_report?.verifications || [],
      explainability: data.verification_report?.explainability || [],
      speakers: data.stages?.find((s: any) => s.id === 'diarization')?.output_data?.speakers || [],
    };
  } catch (err) {
    console.error('Supabase fetchAnalysisById error:', err);
    return null;
  }
}
