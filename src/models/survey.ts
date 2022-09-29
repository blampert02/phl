import fetch from 'cross-fetch';
import NodeCache from 'node-cache';

const cache = new NodeCache();

export type Question = {
  answer: string;
  selectedCount: number;
};

export type Survey = {
  id: string;
  title: string;
  options: Question[];
};

export async function fetchFormById(token: string, formId: string): Promise<any> {
  const url = new URL(`https://forms.googleapis.com/v1/forms/${formId}`);

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const body = await response.json();
  return body;
}

export async function fetchFormResponsesById(token: string, formId: string): Promise<any> {
  const url = new URL(`https://forms.googleapis.com/v1/forms/${formId}/responses`);

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const body = await response.json();
  return body;
}

export async function getSurveys(token: string, formId: string): Promise<Survey[]> {
  const cachedSurveys = cache.get<Survey[]>('surveys');
  if(cachedSurveys) return cachedSurveys;
  const surveys = await getInternalSurveys(token, formId);
  cache.set('surveys', surveys, 3600)
  return surveys; 
}

async function getInternalSurveys(token: string, formId: string): Promise<Survey[]> {
  const surveys: Survey[] = [];
  const response: any = await fetchFormById(token, formId);
  const mappedQuestions = new Map<any, any>();

  response.items.forEach((item: any) => {
    const questionItem = item.questionItem;
    if (questionItem === undefined) return;

    const keyExists = 'choiceQuestion' in questionItem.question;
    if (!keyExists) return;

    const title = item.title;
    const questionId = questionItem.question.questionId;
    const choiceQuestion = questionItem.question.choiceQuestion;

    const options = choiceQuestion.options
      .filter((item: any) => {
        return item.value !== undefined;
      })
      .map((item: any) => {
        return {
          answer: item.value,
          score: 0,
        };
      });

    mappedQuestions.set({ title, questionId }, options);
  });

  const formResponses = await fetchFormResponsesById(token, formId);

  formResponses.responses.forEach((item: any) => {
    mappedQuestions.forEach((value: any, key: any) => {
      const questionId = key.questionId;
      const currentQuestion = mappedQuestions.get(key);
      const answer = item.answers[questionId];

      const textAnswers = answer.textAnswers.answers.map((item: any) => {
        return item.value;
      });

      const updatedQuestion = currentQuestion.map((item: any) => {
        let valueToReturn = undefined;
        textAnswers.forEach((rawAnswer: any) => {
          if (rawAnswer === item.answer) {
            valueToReturn = {
              ...item,
              score: item.score + 1,
            };
            return;
          }
          valueToReturn = item;
        });
        return valueToReturn;
      });
      mappedQuestions.set(key, updatedQuestion);
    });
  });

  mappedQuestions.forEach((value: any, key: any) => {
    const questions: Question[] = value.map((item: any) => {
      return {
        answer: item.answer,
        selectedCount: item.score,
      };
    });
		
    surveys.push({
      id: key.questionId,
      title: key.title.replace(/\n|\r/g, ''),
      options: questions,
    });
  });

  return surveys;
}
