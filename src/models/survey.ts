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

export async function getFormById(formId: string): Promise<any> {
  const response = await fetch(`https://forms.googleapis.com/v1/forms/${formId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const formResponses = await fetch(`https://forms.googleapis.com/v1/forms/${formId}/responses`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status !== 200) return undefined;
  if (formResponses.status !== 200) return undefined;

  const form = await response.json();
  const questions = new Map<string, Question>();

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
