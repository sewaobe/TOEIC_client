import { RegisterFormInputs } from './../models/schemas/registerSchema';
import { LoginFormInputs } from './../models/schemas/loginSchema';
import axiosClient from './axiosClient';

const authService = {
  login: (data: LoginFormInputs) => axiosClient.post('/auth/login', data),
  register: (data: RegisterFormInputs) =>
    axiosClient.post('/auth/register', data),
};

export default authService;
