import { Question } from './utils/definitions';
import { getQuestions, Message, saveQuestions } from './utils/storage';
import { view } from './utils/ui';

console.log('ChatGPT Question Log: Content script loaded.');

const waitForContent = setInterval(() => {
  const questionElements: NodeListOf<HTMLDivElement> =
    document.querySelectorAll('[data-message-id]');

  if (questionElements.length) {
    const questions: Question[] = [];

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
    handleToggleSwitch();

    clearInterval(waitForContent); // Stop checking
  }
}, 500); // Check every 500ms

function getNavElement() {
  const composer = document.querySelector('.composer-parent');
  const navElement = composer?.firstElementChild;
  return navElement;
}

function handleToggleSwitch() {
  if (!document.getElementById('cqlSwitchContainer')) {
    const navElement = getNavElement();

    if (navElement) {
      const rightNavElement = navElement.lastElementChild as HTMLDivElement;

      const containerElement = view.createElement('div', {
        class: 'cql-switch-container"',
        id: 'cqlSwitchContainer',
      }) as HTMLDivElement;

      const labelEl = view.createElement('label', {
        class: 'cql-switch',
        id: 'cqlSwitchLabel',
        for: 'cqlSwitch',
      });
      const checkboxEl = view.createElement('input', {
        type: 'checkbox',
        class: 'cql-switch__checkbox',
        id: 'cqlSwitch',
      });
      const spanEl = view.createElement('span', {
        class: 'cql-switch__slider',
        id: 'cqlSwitchSlider',
      });

      labelEl.appendChild(checkboxEl);
      labelEl.appendChild(spanEl);
      containerElement.appendChild(labelEl);
      rightNavElement.appendChild(containerElement);
    }
  }
  handleSidebar();
}

function handleSidebar() {
  if (!document.getElementById('cqlSiderBar')) {
    const navElement = getNavElement();
    const switchEl = document.getElementById('cqlSwitch');

    const cqlSiderBar = view.createElement('aside', {
      class: 'cql-sidebar cql-sidebar-hide',
      id: 'cqlSiderBar',
    });

    if (navElement && switchEl) {
      navElement.appendChild(cqlSiderBar);
      view.renderQuestionLog(cqlSiderBar);

      switchEl.addEventListener('change', () => {
        cqlSiderBar.classList.toggle('cql-sidebar-hide');
      });
    }
  }
}

function handleSubmitQuery() {
  const sendButton = document.querySelector(
    '[data-testid="send-button"]'
  ) as HTMLButtonElement;

  if (sendButton instanceof HTMLButtonElement) {
    sendButton.addEventListener('click', function () {});
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === Message.TARGET_ID) {
    view.handleScroll(`[data-message-id="${message.targetId}"]`);
    sendResponse('handleScroll completed!');
  }
  return true;
});
