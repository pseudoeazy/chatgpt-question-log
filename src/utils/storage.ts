import { Question } from './definitions';

export enum Message {
  TARGET_ID = 'TARGET_ID',
}

type ExtensionStorage = {
  questions: Question[];
};

export function saveQuestions(questions: Question[]) {
  return new Promise<string>((resolve) => {
    chrome.storage.local.set({ questions }, () => {
      resolve('questions saved!');
    });
  });
}

export function getQuestions(): Promise<Question[]> {
  return new Promise<Question[]>((resolve) => {
    chrome.storage.local.get(['questions'], (res: ExtensionStorage) =>
      resolve(res.questions)
    );
  });
}
