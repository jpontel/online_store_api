import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Credenciais não encontradas!');
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export const conectarDatabase = async () => {
   try {
      const { error } = await supabase.from('usuarios').select('count', { count: 'exact', head: true });

      if (error && error.message.includes('relation') && error.message.includes('does not exist')) {
         console.log('Online Store API [Database]: Conexão inicializada - Sem tabelas criadas');
      } else if (error) {
         console.warn('Online Store API [Database]:', error.message);
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