export type UserType = 'teacher' | 'student';

export type User = {
  id: string;
  email: string;
  type: UserType;
  firstName: string;
  lastName: string;
  address: string;
  password: string;
  isActive: boolean;
  level: number;
  birthDate: Date;
  city: string; 
  username?: string;
  phoneNumber?: string;
  address2?: string;
  inss?: string;
};

export function createUser(id: string, type: UserType, info: any): User {
  return {
    id,
    type,
    email: info.email,
    username: info.username,
    password: info.password,
    firstName: info.firstName,
    lastName: info.lastName,
    isActive: info.isActive == 'true',
    birthDate: info.birthDate,
    phoneNumber: info.phoneNumber,
    address: info.address,
    address2: info.address2,
    city: info.city,
    level: +info.level,
    inss: info.inss,
  };
}
