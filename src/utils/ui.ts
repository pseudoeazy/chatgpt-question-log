import { Question } from './definitions';
import { getQuestions, Message } from './storage';

export const view = {
  createElement<T extends HTMLElement>(
    type: keyof HTMLElementTagNameMap,
    atts?: { [name: string]: string },
    content?: string,
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
    maxQuestionLength = 24,
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
      const row = this.createElement('tr', { 'data-cql-id': id });
      const thId = this.createElement(
        'td',
        { 'data-cql-id': id },
        `${idx + 1}`,
      );
      const query =
        question.length > maxQuestionLength
          ? question.slice(0, maxQuestionLength - 4) + ' ...'
          : question;
      const thQuestion = this.createElement('td', { 'data-cql-id': id }, query);

      row.appendChild(thId);
      row.appendChild(thQuestion);
      table.appendChild(row);
    });

    table.addEventListener('click', function (e: Event) {
      const target = e.target as HTMLElement;

      if (target.nodeName === 'TD' || target.nodeName === 'TR') {
        const targetId = target.dataset.cqlId;

        if (targetId) {
          const isContentScript = !chrome?.tabs;

          if (isContentScript) {
            view.handleScroll(`[data-message-id="${targetId}"]`);
          } else {
            view.handlePopUpScroll(targetId);
          }
        }
      }
    });

    return table;
  },

  renderQuestionLog(htmlEl: HTMLElement | null) {
    getQuestions().then((questions) => {
      if (questions?.length) {
        const tableContainer = htmlEl;

        if (tableContainer) {
          tableContainer.innerHTML = '';
          const tableLog = this.generateQuestionLog(questions);
          tableContainer.appendChild(tableLog);
        }
      }
    });
  },

  handlePopUpScroll(targetId: string): void {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];

      if (!tab || tab.id === undefined) return;

      const tabId: number = tab.id;

      const message = {
        type: Message.TARGET_ID,
        targetId,
      };

      chrome.tabs.sendMessage(tabId, message, async (response?: unknown) => {
        if (chrome.runtime.lastError) {
          try {
            await chrome.scripting.executeScript({
              target: { tabId },
              files: ['content.js'],
            });

            chrome.tabs.sendMessage(tabId, message);
          } catch (err) {
            console.error('Failed to inject script:', err);
          }

          return;
        }

        console.log('response:', response);
      });
    });
  },

  handleScroll(selector: string) {
    const element = document.querySelector(selector) as HTMLElement;

    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  },
};
