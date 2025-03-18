import { Question } from './utils/definitions';
import { getQuestions, saveQuestions } from './utils/storage';

console.log('Content script loaded.');

const waitForContent = setInterval(() => {
  const questionElements: NodeListOf<HTMLDivElement> =
    document.querySelectorAll('[data-message-id]');

  if (questionElements.length) {
    let questions: Question[] = [];

    questionElements.forEach((element) => {
      const question = element.querySelector('.whitespace-pre-wrap');
      const isValidTitle = question?.textContent?.trim();

      if (isValidTitle) {
        questions.push({
          id: element.dataset?.messageId ?? '',
          question: question?.textContent ?? '',
        });
      }
    });

    saveQuestions(questions);
    getQuestions().then((questions) => console.log('questions:', questions));

    clearInterval(waitForContent); // Stop checking
  }
}, 500); // Check every 500ms

const sendButton = document.querySelector(
  '[data-testid="send-button"]'
) as HTMLButtonElement;

if (sendButton instanceof HTMLButtonElement) {
  console.log({ sendButton });
  sendButton.addEventListener('click', function () {
    console.log('Send Button clicked');
  });
} else {
  console.log('sendButton not found!');
}
