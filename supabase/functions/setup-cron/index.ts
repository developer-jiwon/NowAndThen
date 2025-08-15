import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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

    // 각 cron job 실행
    let results = []
    let hasErrors = false

    for (const query of cronQueries) {
      try {
        const { data, error } = await supabaseClient.rpc('exec_sql', { sql: query })
        if (error) {
          console.error('Cron setup error:', error)
          hasErrors = true
        }
        results.push({ query: query.split('(')[1].split(',')[0].replace(/'/g, ''), success: !error, error })
      } catch (e) {
        console.error('Cron execution error:', e)
        hasErrors = true
        results.push({ error: e.message })
      }
    }

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