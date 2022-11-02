export type UserType = 'teacher' | 'student' | 'moderator' | 'admin';

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
  branch?: string;//all
  shift?: string;//all
  city?: string; //Students
  birthDate?: string; //Students
  level?: string; //Students
  address2?: string;//All
  inss?: string; //Teachers
  lastTimeActivity: string;
  activityFlag: boolean;
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
    branch: info.branch,
    shift: info.shift,
    address: info.address,
    address2: info.address2,
    city: info.city,
    level: info.level,
    inss: info.inss,
    lastTimeActivity: info.lastTimeActivity,
    activityFlag: info.activityFlag == 'true',
  };
}
