export enum UserType {
  Regular = 'обычный',
  Pro = 'pro',
}

export type User = {
  name: string;
  email: string;
  avatarPath?: string;
  password?: string;
  type: UserType;
};
