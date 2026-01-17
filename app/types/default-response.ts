export type DefaultResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  details?: any;
};
