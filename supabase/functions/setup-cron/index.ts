import { serve } from "https://deno.land/std@0.208.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Set up cron jobs
    const cronQueries = [
      // 타이머 알림: 5분마다
      `SELECT cron.schedule(
        'send-timer-notifications',
        '*/5 * * * *',
        $$ 
        SELECT net.http_post(
          url := '${Deno.env.get('SUPABASE_URL')}/functions/v1/send-notifications',
          headers := '{"Authorization": "Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}", "Content-Type": "application/json"}'::jsonb
        );
        $$
      );`,
      
      // 매일 요약: 매 분마다 체크 (타임존별로 다른 시간에 실행되어야 하므로)
      `SELECT cron.schedule(
        'send-daily-summary',
        '* * * * *',
        $$ 
        SELECT net.http_post(
          url := '${Deno.env.get('SUPABASE_URL')}/functions/v1/send-daily-summary',
          headers := '{"Authorization": "Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}", "Content-Type": "application/json"}'::jsonb
        );
        $$
      );`
    ]

    // pg_cron 확장이 활성화되어 있는지 확인
    const { data: extensions, error: extError } = await supabaseClient
      .from('pg_extension')
      .select('extname')
      .eq('extname', 'pg_cron')

    if (extError) {
      console.log('pg_cron extension check failed, assuming it exists:', extError)
    }

    // 현재 cron 작업 확인
    const { data: existingJobs, error: jobsError } = await supabaseClient
      .rpc('select_cron_jobs')

    if (jobsError) {
      console.log('Could not check existing cron jobs:', jobsError)
    }

    console.log('Existing cron jobs:', existingJobs)

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Cron jobs checked (manual setup may be required)',
      existingJobs: existingJobs || [],
      note: 'You may need to set up cron jobs manually in Supabase dashboard'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

    if (hasErrors) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Some cron jobs failed to set up',
        results 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'All cron jobs set up successfully',
      results 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error in setup-cron function:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})