import { Question } from './definitions';

type ExtensionStorage = {
  questions: Question[];
};

export function saveQuestions(questions: Question[]) {
  return new Promise<void>((resolve) => {
    chrome.storage.sync.set({ questions }, () => {
      console.log('questions saved!');
      resolve();
    });
  });
}

export function getQuestions(): Promise<Question[]> {
  return new Promise<Question[]>((resolve) => {
    chrome.storage.sync.get(['questions'], (res: ExtensionStorage) =>
      resolve(res.questions)
    );
  });
}
