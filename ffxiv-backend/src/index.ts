import { dbService } from './services/database.service';

async function main() {
  console.log('🚀 FF14 Tracker Backend Starting...');
  
  // Test database connection
  try {
    const testCharacter = await dbService.getCharacterByNameAndServer('Test Character', 'Gilgamesh');
    console.log('✅ Database connected successfully');
    console.log('📊 Test Character:', testCharacter?.name);
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  }
}

main();