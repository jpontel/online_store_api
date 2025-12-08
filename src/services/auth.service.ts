// Authentication service - handles business logic for auth operations

import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { supabase } from '../config/database';
import {
  UsuarioCriarDto,
  UsuarioLoginDto,
  UsuarioAutenticadoDto,
  UsuarioRemovidoDto,
  UsuarioDto,
  UsuarioRemoverDto
} from '../controllers/dto/auth.dto';
import {
  TipoUsuario,
  StatusUsuario,
  UsuarioRow,
  usuarioRowToModel,
  usuarioModelToInsert
} from '../models/usuario.model';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '10');

const gerarToken = (userId: string, tipo: TipoUsuario): string => {
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in the environment variables');
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


const usuarioToDto = (usuario: UsuarioRow): UsuarioDto => {
  return {
    id: usuario.id,
    email: usuario.email,
    tipo: usuario.tipo as 'COMPRADOR' | 'VENDEDOR',
    status: usuario.status as 'ATIVO' | 'INATIVO' | 'EXCLUIDO',
    dataCriacao: new Date(usuario.data_criacao)
  };
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

  if (!senhaValida) 
    throw { status: 401, message: 'Email ou senha inválidos' };

  // Gerar JWT token
  const token = gerarToken(usuarioRow.id, usuarioRow.tipo);

  return {
    usuario: usuarioToDto(usuarioRow),
    token
  };
};

export const deletarConta = async ({usuarioId}: UsuarioRemoverDto): Promise<UsuarioRemovidoDto> => {
    // Get user from database
    const { data: usuarioData, error: findError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', usuarioId)
      .single();

    if (findError || !usuarioData) 
        throw { status: 404, message: 'Usuário não encontrado' };

    const usuario = usuarioData as UsuarioRow;

    let usuarioRemovidoDto: UsuarioRemovidoDto;
    // Tratamentos específicos de acordo com o tipo do usuário
    if (usuario.tipo === TipoUsuario.COMPRADOR) {

        const { error: updateError } = await supabase
          .from('usuarios')
          .update({ status: StatusUsuario.EXCLUIDO })
          .eq('id', usuarioId);

        if (updateError) 
          throw { status: 500, message: 'Erro ao excluir conta' };

        usuarioRemovidoDto = {
            mensagem: 'Conta desativada com sucesso',
            dataExclusao: new Date()
        };
    } else if (usuario.tipo === TipoUsuario.VENDEDOR) {

        // Desativa o vendedor e os seus produtos
        const { error: updateUserError } = await supabase
            .from('usuarios')
            .update({ status: StatusUsuario.INATIVO })
            .eq('id', usuarioId);

        if (updateUserError) {
            console.error('Error deactivating seller:', updateUserError);
            throw { status: 500, message: 'Erro ao desativar conta' };
        }

        // Deactivate all seller's products
        const { error: updateProductsError } = await supabase
            .from('produtos')
            .update({ ativo: false })
            .eq('vendedor_id', usuarioId);

        if (updateProductsError) {
            console.error('Error deactivating seller products:', updateProductsError);
            
        }

        usuarioRemovidoDto = {
            mensagem: 'Conta desativada com sucesso',
            dataExclusao: new Date()
        };

    } else {
        throw { status: 400, message: 'Tipo de usuário inválido' };
    }

    return usuarioRemovidoDto;

};
