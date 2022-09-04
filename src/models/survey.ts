import fetch from 'cross-fetch';
import { token } from '../passport.config';

export type Question = {
  answer: string;
  selectedCount: number;
};

export type Survey = {
  id: string;
  title: string;
  options: Question[];
};

export async function getAnswers(): Promise<any> {
  const response = await fetch('https://forms.googleapis.com/v1/forms/1IPzUL0kl5R35zfAIIlWSYNyBKZo4Kadsmt6EaShD4y8', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return await response.json();
}

export function getSurveys(): Promise<Survey[]> {
  return Promise.resolve([
    {
      id: '1',
      title: 'What is your favorite color?',
      options: [
        {
          answer: 'red',
          selectedCount: 10,
        },
        {
          answer: 'gree',
          selectedCount: 3,
        },
        {
          answer: 'blue',
          selectedCount: 5,
        },
      ],
    },
    {
      id: '2',
      title: 'What is your favorite food?',
      options: [
        {
          answer: 'Ramen',
          selectedCount: 2,
        },
        {
          answer: 'Soup',
          selectedCount: 7,
        },
        {
          answer: 'Cookies',
          selectedCount: 6,
        },
      ],
    },
  ]);
}
