
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const formData = await req.formData()
    const videoFile = formData.get('video')
    const lidarFile = formData.get('lidar')
    const title = formData.get('title')
    const description = formData.get('description')

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get user ID from auth header
    const authHeader = req.headers.get('Authorization')?.split('Bearer ')[1]
    const { data: { user }, error: userError } = await supabase.auth.getUser(authHeader)
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    let videoPath, lidarPath

    // Upload video if present
    if (videoFile) {
      const videoExt = videoFile.name.split('.').pop()
      videoPath = `${crypto.randomUUID()}.${videoExt}`
      const { error: videoUploadError } = await supabase.storage
        .from('asset_videos')
        .upload(videoPath, videoFile)

      if (videoUploadError) {
        throw videoUploadError
      }
    }

    // Upload LiDAR if present
    if (lidarFile) {
      const lidarExt = lidarFile.name.split('.').pop()
      lidarPath = `${crypto.randomUUID()}.${lidarExt}`
      const { error: lidarUploadError } = await supabase.storage
        .from('asset_lidar')
        .upload(lidarPath, lidarFile)

      if (lidarUploadError) {
        throw lidarUploadError
      }
    }

    // Create asset record
    const { data: asset, error: assetError } = await supabase
      .from('assets')
      .insert({
        user_id: user.id,
        title: title?.toString() || 'Untitled Asset',
        description: description?.toString(),
        video_path: videoPath,
        lidar_path: lidarPath,
        status: 'pending',
        validation_status: 'pending'
      })
      .select()
      .single()

    if (assetError) {
      throw assetError
    }

    return new Response(
      JSON.stringify({ 
        message: 'Asset uploaded successfully', 
        asset 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 200 
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to upload asset', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
