export type Question = {
  answer: string;
  selectedCount: number;
};

export type Survey = {
  id: string;
  title: string;
  options: Question[];
};

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
          answer: 'Rammen',
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
