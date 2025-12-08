// Common DTOs - Shared Data Transfer Objects

export interface PaginationDto {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginationQueryDto {
  page?: number;
  limit?: number;
}

export interface ApiResponseDto<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface ErrorResponseDto {
  success: false;
  message: string;
  errors?: string[];
  stack?: string;
}

export interface SuccessResponseDto<T = any> {
  success: true;
  data: T;
  message?: string;
}
