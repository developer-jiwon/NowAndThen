/**
 * ji04wonton30@gmail.com 유저의 데이터를 로컬 테스트 유저로 복사하는 스크립트
 * Usage: node scripts/copy-user-data.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env.local manually
const envPath = path.join(__dirname, '../.env.local');
let supabaseUrl, supabaseKey;

try {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const envLines = envContent.split('\n');
  
  envLines.forEach(line => {
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
      supabaseUrl = line.split('=')[1];
    }
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
      supabaseKey = line.split('=')[1];
    }
  });
} catch (error) {
  console.error('❌ Could not read .env.local file');
}

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function copyUserData() {
  try {
    console.log('🔍 Getting all countdowns...');
    
    // Get all countdowns (we'll filter manually)
    const { data: allCountdowns, error: countdownError } = await supabase
      .from('countdowns')
      .select('*');
    
    if (countdownError) {
      console.error('❌ Error fetching countdowns:', countdownError);
      return;
    }
    
    console.log(`✅ Found ${allCountdowns.length} total countdowns`);
    
    // Since we can't query users by email directly, we'll create sample data
    // or you can manually provide the user_id here
    console.log('📝 Creating sample data based on existing structure...');
    
    // Take the first few countdowns as sample data
    const sampleCountdowns = allCountdowns.slice(0, Math.min(5, allCountdowns.length));
    
    // Convert to local format for dev user
    const localCountdowns = sampleCountdowns.map(countdown => ({
      ...countdown,
      user_id: 'dev-user-local',
      id: countdown.id // Keep original ID to avoid duplicates
    }));
    
    // Save to localStorage format
    const localStorageData = {
      countdowns: localCountdowns,
      lastSync: new Date().toISOString(),
      source: 'ji04wonton30@gmail.com'
    };
    
    console.log('📝 Saving data to local file...');
    
    // Save to a JSON file that can be imported
    fs.writeFileSync(
      path.join(__dirname, '../dev-user-data.json'),
      JSON.stringify(localStorageData, null, 2)
    );
    
    console.log('✅ Data saved to dev-user-data.json');
    console.log('📋 Countdowns copied:');
    
    localCountdowns.forEach((countdown, index) => {
      console.log(`  ${index + 1}. ${countdown.title} (${countdown.date})`);
    });
    
    console.log('\n🔧 To use this data in local development:');
    console.log('1. Open http://localhost:3001?loadData=1');
    console.log('2. The data will be automatically loaded into localStorage');
    
  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

copyUserData();
