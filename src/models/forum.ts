import { Timestamp } from '@google-cloud/firestore'

export type Message = {
  id: string;
  comment: string;
  main_tittle: string;
  senderId: string; 
  timestamp: Date;
  userImage: string;
  sender_firstName: string;
  sender_lastName:string;
}

export type Post = {
  id: string;
  comment: string;
  main_tittle: string;
  senderId: string;
  timestamp: Date;
  userImage: string;
  messages: Message[];
  sender_firstName: string;
  sender_lastName:string;
};

  export function createPost(id: string, info: any): Post{
    return {
      id,
      comment: info.comment,
      main_tittle: info.main_tittle,
      senderId: info.senderId,
      timestamp: info.timestamp,
      userImage: info.userImage,
      messages: [],
      sender_firstName: info.sender_firstName,
      sender_lastName:info.sender_lastName,
    };
}

