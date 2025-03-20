import { Question } from './definitions';
import { getQuestions } from './storage';

export const view = {
  createElement<T extends HTMLElement>(
    type: keyof HTMLElementTagNameMap,
    atts?: { [name: string]: string },
    content?: string
  ): T {
    const element = document.createElement(type) as T;

    if (atts) {
      for (const att in atts) {
        if (Object.prototype.hasOwnProperty.call(atts, att)) {
          element.setAttribute(att, atts[att]);
        }
      }
    }

    if (content) {
      element.textContent = content;
    }

    return element;
  },

  generateQuestionLog(
    questions: Question[],
    maxQuestionLength = 24
  ): HTMLTableElement {
    const table = this.createElement<HTMLTableElement>('table', {
      class: 'cql-table',
    });
    const headerRow = this.createElement('tr');
    const thId = this.createElement('th', {}, 'S/N');
    const thQuestion = this.createElement('th', {}, 'Questions');

    headerRow.appendChild(thId);
    headerRow.appendChild(thQuestion);
    table.appendChild(headerRow);

    questions.forEach(({ question, id }, idx) => {
      const row = this.createElement('tr');
      const thId = this.createElement('td', { 'data-id': id }, `${idx + 1}`);
      const query =
        question.length > maxQuestionLength
          ? question.slice(0, maxQuestionLength - 4) + ' ...'
          : question;
      const thQuestion = this.createElement('td', {}, query);

      row.appendChild(thId);
      row.appendChild(thQuestion);
      table.appendChild(row);
    });

    return table;
  },

  renderQuestionLog(htmlEl: HTMLElement | null) {
    getQuestions().then((questions) => {
      console.log({ questions });
      if (questions?.length) {
        const tableContainer = htmlEl;

        if (tableContainer) {
          tableContainer.innerHTML = '';
          const tableLog = this.generateQuestionLog(questions);
          tableContainer.appendChild(tableLog);
        }
      } else {
        console.log('No question exist!');
      }
    });
  },
};
