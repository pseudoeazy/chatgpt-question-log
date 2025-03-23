import { Question } from './utils/definitions';
import { Message, saveQuestions } from './utils/storage';
import { view } from './utils/ui';

console.log('ChatGPT Question Log: Content script loaded.');

function collectQuestions(): Question[] {
  const questionElements: NodeListOf<HTMLDivElement> =
    document.querySelectorAll('[data-message-id]');

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

  return questions;
}

function waitForElements(
  selector: string,
  callback: () => void,
  interval = 500
) {
  const waitForContent = setInterval(() => {
    const elements = document.querySelectorAll(selector);
    if (elements.length) {
      callback();
      clearInterval(waitForContent);
    }
  }, interval);
}

function setup() {
  waitForElements('[data-message-id]', () => {
    const questions = collectQuestions();
    saveQuestions(questions);
    handleToggleSwitch(); // Render toggle switch
    handleSidebar(); // Render sidebar
  });
}
setup();

function handleNewQuestion() {
  waitForElements('[data-message-id]', () => {
    const composer = document.querySelector('.composer-parent');

    if (!composer) return;

    const chatSession = composer.children[1];
    const targetNode = chatSession.querySelector('article')?.parentElement;

    if (!targetNode) return;

    const observer = new MutationObserver((mutations) => {
      for (let mutation of mutations) {
        if (mutation.type === 'childList') {
          setup();
        }
      }
    });

    observer.observe(targetNode, { childList: true });
  });
}
handleNewQuestion();

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
}

function handleSidebar() {
  let cqlSiderBar = document.getElementById('cqlSiderBar');

  if (cqlSiderBar) {
    cqlSiderBar.innerHTML = '';
  } else {
    cqlSiderBar = view.createElement('aside', {
      class: 'cql-sidebar cql-sidebar-hide',
      id: 'cqlSiderBar',
    });
  }

  const navElement = getNavElement();
  const switchEl = document.getElementById('cqlSwitch');

  if (navElement && switchEl) {
    navElement.appendChild(cqlSiderBar);
    view.renderQuestionLog(cqlSiderBar);

    switchEl.addEventListener('change', () => {
      cqlSiderBar.classList.toggle('cql-sidebar-hide');
    });
  }
}

function detectUrlChange() {
  let currentUrl = location.href;

  const observer = new MutationObserver(() => {
    if (location.href !== currentUrl) {
      // console.log('detectUrlChange URL:', location.href);
      currentUrl = location.href;
      setup();
    }
  });

  observer.observe(document, { subtree: true, childList: true });
}
detectUrlChange();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === Message.TARGET_ID) {
    view.handleScroll(`[data-message-id="${message.targetId}"]`);
    sendResponse('handleScroll completed!');
  }
  return true;
});
