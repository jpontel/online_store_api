// Authentication service - handles business logic for auth operations

import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { supabase } from '../config/database';
import {
  UsuarioCriarDto,
  UsuarioLoginDto,
  UsuarioAutenticadoDto,
  UsuarioRemovidoDto,
  UsuarioRemoverDto
} from '../controllers/dto/auth.dto';

import {
  TipoUsuario,
  StatusUsuario,
  UsuarioRow,
  usuarioModelToInsert,
  usuarioToDto
} from '../models/usuario.model';

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '10');

const gerarToken = (userId: string, tipo: TipoUsuario): string => {
   const secret = process.env.JWT_SECRET;

   if (!secret) {
      throw new Error('Variável JWT_SECRET ');
   }

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

   const { data: usuario, error: checkError } = await supabase
      .from('usuarios')
      .select('id')
      .eq('email', usuarioCriarDto.email)
      .single();

   if (usuario)
      throw { status: 400, message: 'Email já cadastrado' };

   const senhaHash = await bcrypt.hash(usuarioCriarDto.senha, BCRYPT_ROUNDS);

   usuarioCriarDto.senha = senhaHash;

   const registrarUsuario = usuarioModelToInsert(usuarioCriarDto);

   const { data: novoUsuario, error: insertError } = await supabase
      .from('usuarios')
      .insert(registrarUsuario)
      .select()
      .single();

   if (insertError || !novoUsuario) 
      throw { status: 500, message: 'Erro ao criar usuário' };

   const token = gerarToken(novoUsuario.id, novoUsuario.tipo);

   const UsuarioAutenticadoDto: UsuarioAutenticadoDto = {
      usuario: usuarioToDto(novoUsuario as UsuarioRow),
      token
   };

   return UsuarioAutenticadoDto;
};

export const login = async (data: UsuarioLoginDto): Promise<UsuarioAutenticadoDto> => {
   const { email, senha } = data;

   const { data: usuario, error: usuarioErro } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', email)
      .single();

   if (usuarioErro || !usuario) {
      throw { status: 401, message: 'Email ou senha inválidos' };
   }

   const usuarioRow = usuario as UsuarioRow;

   // Verificar se o usuário está excluído ou inativo
   if (usuarioRow.status === StatusUsuario.EXCLUIDO || usuarioRow.status === StatusUsuario.INATIVO)
      throw { status: 403, message: 'Conta inativa ou excluída' };

   // Verificar a senha
   const senhaValida = await bcrypt.compare(senha, usuarioRow.senha_hash);

   if(!senhaValida) 
      throw { status: 401, message: 'Email ou senha inválidos' };

   // Gerar JWT token
   const token = gerarToken(usuarioRow.id, usuarioRow.tipo);

   const usuarioAutenticadoDto: UsuarioAutenticadoDto = {
      usuario: usuarioToDto(usuarioRow),
      token
   };

   return usuarioAutenticadoDto;
};

export const deletarConta = async ({usuarioId}: UsuarioRemoverDto): Promise<UsuarioRemovidoDto> => {
   const { data: usuarioData, error: findError } = await supabase
     .from('usuarios')
     .select('*')
     .eq('id', usuarioId)
     .single();

   if (findError || !usuarioData) 
        throw { status: 404, message: 'Usuário não encontrado' };

   const usuario = usuarioData as UsuarioRow;

   if (usuario.tipo === TipoUsuario.COMPRADOR) {

      const { error: compradorError } = await supabase
         .from('usuarios')
         .update({ status: StatusUsuario.EXCLUIDO })
         .eq('id', usuarioId);

      if(compradorError) 
         throw { status: 500, message: 'Erro ao desativar conta' };

   } else if (usuario.tipo === TipoUsuario.VENDEDOR) {
      // Desativa o vendedor e os seus produtos
      const { error: vendedorError } = await supabase
         .from('usuarios')
         .update({ status: StatusUsuario.INATIVO })
         .eq('id', usuarioId);

      if (vendedorError)
         throw { status: 500, message: 'Erro ao desativar conta' };

   } else {
      throw { status: 400, message: 'Tipo de usuário inválido' };
   }

   const usuarioRemovidoDto: UsuarioRemovidoDto = {
      mensagem: 'Conta desativada com sucesso',
      dataExclusao: new Date()
   };

   return usuarioRemovidoDto;

};
