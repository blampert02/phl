import fetch from 'cross-fetch';
import { getOAuth2Credentials } from '../passport.config';

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
  const credentials = getOAuth2Credentials();
  const response = await fetch(`https://forms.googleapis.com/v1/forms/${formId}`, {
    headers: {
      Authorization: `Bearer ${credentials.token}`,
    },
  });

  const formResponses = await fetch(`https://forms.googleapis.com/v1/forms/${formId}/responses`, {
    headers: {
      Authorization: `Bearer ${credentials.token}`,
    },
  });

  if (response.status !== 200) return undefined;
  if (formResponses.status !== 200) return undefined;

  const form = await response.json();
  const questions = new Map<string, Question>();

  return await response.json();
}

export async function getSurveys(formId: string): Promise<Survey[]> {

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
  ]);
}
