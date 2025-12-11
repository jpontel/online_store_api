// Authentication service - handles business logic for auth operations

import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { supabase } from '../config/database';
import {
  UsuarioCriarDto,
  UsuarioAutenticarDto,
  UsuarioAutenticadoDto,
  Usuario,
  UsuarioRecuperadoDto,
  UsuarioAlterarDto,
} from '../controllers/dto/auth.dto';

import {
  TipoUsuario,
  UsuarioModel,
  usuarioToModel,
  usuarioToDto
} from '../models/usuarios.model';
import { StatusEnum } from '../utils/dto/common.dto';

const gerarToken = (userId: string, tipo: TipoUsuario): string => {
   const secret = process.env.JWT_SECRET ?? "";

   const options: SignOptions = {
      expiresIn: '1h'
   };

   return jwt.sign(
      { userId, tipo },
      secret,
      options
   );
};

export const registrarUsuario = async (usuarioCriarDto: UsuarioCriarDto): Promise<UsuarioAutenticadoDto> => {

   const { data: usuario } = await supabase
      .from('usuarios')
      .select('id')
      .eq('email', usuarioCriarDto.email)
      .single();

   if(usuario)
      throw { status: 400, message: 'Email já cadastrado!' };

   const senhaHash = await bcrypt.hash(usuarioCriarDto.senha, parseInt(process.env.BCRYPT_ROUNDS || '10'));

   usuarioCriarDto.senha = senhaHash;

   const usuarioCriar = usuarioToModel(usuarioCriarDto);

   const { data: novoUsuario, error: error } = await supabase
      .from('usuarios')
      .insert(usuarioCriar)
      .select()
      .single();

   if (error || !novoUsuario) 
      throw { status: 500, message: 'Ocorreu um erro ao criar usuário! :(' };

   const token = gerarToken(novoUsuario.id, novoUsuario.tipo);

   const UsuarioAutenticadoDto: UsuarioAutenticadoDto = {token};

   return UsuarioAutenticadoDto;
};

export const login = async (usuarioAutenticarDto: UsuarioAutenticarDto): Promise<UsuarioAutenticadoDto> => {
   const { data: usuario, error: usuarioErro } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', usuarioAutenticarDto.email)
      .single();

   if (usuarioErro || !usuario) {
      throw { status: 401, message: 'Email ou senha inválidos' };
   }

   const usuarioRecuperadoDto = usuario as UsuarioRecuperadoDto;

   // Verificar se o usuário está excluído ou inativo
   if(usuarioRecuperadoDto.status === 'EXCLUIDO' || usuarioRecuperadoDto.status === 'INATIVO')
      throw { status: 403, message: 'Conta inativa ou excluída' };

   // Verificar a senha
   const senhaValida = await bcrypt.compare(usuarioAutenticarDto.senha, usuarioRecuperadoDto.senha);

   if(!senhaValida) 
      throw { status: 401, message: 'Email ou senha inválidos' };

   // Gerar JWT token
   const token = gerarToken(usuarioRecuperadoDto.id, usuarioRecuperadoDto.tipo_usuario);
 
   const usuarioAutenticadoDto: UsuarioAutenticadoDto = {token};

   return usuarioAutenticadoDto;
};

export const deletarUsuario = async (UsuarioAlterarDto: UsuarioAlterarDto): Promise<void> => {
   // O correto seria ter um UUID do usuário para não expor o identificador da base
   const { data: usuario, error: usuarioError } = await supabase
     .from('usuarios')
     .select('*')
     .eq('id', UsuarioAlterarDto.usuarioId)
     .single();

   if (usuarioError || !usuario) 
      throw { status: 404, message: 'Usuário não encontrado' };

   const usuarioRecuperadoDto = usuario as UsuarioRecuperadoDto;

   if (usuarioRecuperadoDto.tipo_usuario === 'CLIENTE') {

      const { error: compradorError } = await supabase
         .from('usuarios')
         .update({ status: StatusEnum.EXCLUIDO })
         .eq('id', usuarioRecuperadoDto.id);

      if(compradorError) 
         throw { status: 500, message: 'Erro ao desativar conta' };
   }

   if (usuario.tipo === 'VENDEDOR') {
      // Desativa o vendedor e os seus produtos
      const { error: vendedorError } = await supabase
         .from('usuarios')
         .update({ status: StatusEnum.INATIVO })
         .eq('id', usuarioRecuperadoDto.id);

      if (vendedorError)
         throw { status: 500, message: 'Erro ao desativar conta' };

   } 

   throw { status: 400, message: 'Tipo de usuário inválido' };
};
