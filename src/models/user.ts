export type UserType = 'teacher' | 'student';

export type User = {
  id: string;//All
  email: string;//All
  type: UserType;//All
  firstName: string;//All
  lastName: string;//All
  address: string;//All
  password: string;//All
  isActive: boolean;//All
  username: string; //All
  phoneNumber: string;//All
  city?: string; //Students
  birthDate?: Date; //Students
  level?: number; //Students
  address2?: string;//All
  inss?: string; //Teachers
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
