import { Question } from './utils/definitions';
import { getQuestions } from './utils/storage';
const MAX_QUESTION_LENGTH = 174;

const view = {
  createElement(
    type: string,
    atts?: { [name: string]: string },
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

function generateQuestionLog(questions: Question[]) {
  const table = view.createElement('table', { class: 'table' });
  const headerRow = view.createElement('tr');
  const thId = view.createElement('th', {}, 'S/N');
  const thQuestion = view.createElement('th', {}, 'Questions');

  headerRow.appendChild(thId);
  headerRow.appendChild(thQuestion);
  table.appendChild(headerRow);

  questions.forEach(({ question, id }, idx) => {
    const row = view.createElement('tr');
    const thId = view.createElement('td', { 'data-id': id }, `${idx + 1}`);
    const query =
      question.length > MAX_QUESTION_LENGTH
        ? question.slice(0, MAX_QUESTION_LENGTH - 4) + ' ...'
        : question;
    const thQuestion = view.createElement('td', {}, query);

    row.appendChild(thId);
    row.appendChild(thQuestion);
    table.appendChild(row);
  });

  return table;
}

function renderQuestionLog() {
  getQuestions().then((questions) => {
    if (questions?.length) {
      const tableContainer = document.querySelector('.table-container');

      if (tableContainer) {
        tableContainer.innerHTML = '';
        tableContainer.appendChild(generateQuestionLog(questions));
      }
    }
  });
}
renderQuestionLog();
