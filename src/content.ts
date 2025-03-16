console.log('Content script loaded.');
type Question = {
  id: string;
  question: string;
};
const questions: Question[] = [];

const waitForContent = setInterval(() => {
  const questionElements: NodeListOf<HTMLDivElement> =
    document.querySelectorAll('[data-message-id]');

  if (questionElements.length) {
    questionElements.forEach((element) => {
      questions.push({
        id: element.dataset?.messageId ?? '',
        question: element.textContent ?? '',
      });
    });
    console.log(questions);
    clearInterval(waitForContent); // Stop checking
  }
}, 500); // Check every 500ms

const view = {
  createElement(
    type: string,
    atts: { [name: string]: string },
    content?: string
  ): HTMLElement {
    const element = document.createElement(type);

    for (const att in atts) {
      if (Object.prototype.hasOwnProperty.call(atts, att)) {
        element.setAttribute(att, atts[att]);
      }
    }

    if (content) {
      element.textContent = content;
    }

    return element;
  },
};
