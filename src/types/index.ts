interface User {
  id: string;
  email: string;
  password: string;

}

interface AuthResponse {
  token: string;
  user: User;
}

export { User, AuthResponse };