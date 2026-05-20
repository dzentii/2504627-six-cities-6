import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { toast } from 'react-toastify';

import { ApiRoute } from './const';
import { Token } from './utils';

export const BACKEND_URL = process.env.REACT_APP_API_URL ?? 'http://localhost:3000';
const REQUEST_TIMEOUT = 5000;
const AUTHORIZATION_HEADER_NAME = 'Authorization';
const AUTHORIZATION_HEADER_PREFIX = 'Bearer';
const NO_AUTH_STATUS_CODE = 401;

type ErrorResponsePayload = {
  error?: string;
  details?: string[];
};

export const createAPI = (): AxiosInstance => {
  const api = axios.create({
    baseURL: BACKEND_URL,
    timeout: REQUEST_TIMEOUT,
  });

  api.interceptors.request.use(
    (config: AxiosRequestConfig) => {
      const token = Token.get();

      if (token) {
        config.headers[AUTHORIZATION_HEADER_NAME] = `${AUTHORIZATION_HEADER_PREFIX} ${token}`;
      }

      return config;
    }
  );

  api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      const requestUrl = error.config?.url ?? '';
      const shouldSuppressToast =
        error.response?.status === NO_AUTH_STATUS_CODE &&
        (requestUrl.includes(ApiRoute.CheckAuth) || requestUrl.includes(ApiRoute.Favorites));

      if (!shouldSuppressToast) {
        const responseData = error.response?.data as ErrorResponsePayload | undefined;
        const detailsMessage = responseData?.details?.length
          ? responseData.details.join('; ')
          : '';
        const baseMessage = responseData?.error ?? error.message;

        toast.dismiss();
        toast.warn(detailsMessage ? `${baseMessage} ${detailsMessage}` : baseMessage);
      }

      return Promise.reject(error);
    }
  );

  return api;
};
