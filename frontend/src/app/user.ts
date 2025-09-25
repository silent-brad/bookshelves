export interface User {
  id?: number;
  username: string;
  password?: string;
  email?: string;
  name?: string;
  description?: string;
  avatarSet?: boolean;
  createdAt?: string;
}
