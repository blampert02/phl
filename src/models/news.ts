import { nanoid } from "nanoid";

export type News = {
    id: string;
    title: string;
    postContent: string; 
    media: string; //either videos or pictures
    postedTime: Date;
    sender_firstName: string;
    sender_lastName:string;
  };
  
    export function createNews(info: any): News{
      return {
        id: nanoid(),
        title: info.title,
        postContent: info.postContent,
        media: info.media, 
        postedTime: new Date(),
        sender_firstName: info.sender_firstName,
        sender_lastName:info.sender_lastName,
      };
};

 