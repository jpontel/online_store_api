import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn('Credenciais não encontradas!');
}

console.log("url:", supabaseUrl, "key", supabaseKey);

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);

export const conectarDatabase = async () => {
   try {
      const { error } = await supabase.from('usuarios').select('count', { count: 'exact', head: true });

      if (error) {
         console.warn('Online Store API [Database] - Ocorreu um Erro: ', error.message);
      } else {
         console.log('Online Store API [Database]: Conexão estabelecida');
      }

   } catch (error) {
      if(error instanceof Error) {
         throw new Error("Ocorreu um erro interno");
      } else {
         throw error;
      }
  }
};