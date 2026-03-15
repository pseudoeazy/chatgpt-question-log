import { Question } from './utils/definitions';
import { Message, saveQuestions } from './utils/storage';
import { view } from './utils/ui';

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
  interval = 500,
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
  waitForElements(
    '[data-message-id]',
    () => {
      const questions = collectQuestions();
      saveQuestions(questions);
      handleToggleSwitch(); // Render toggle switch
      handleSidebar(); // Render sidebar
    },
    1000,
  );
}

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

function getNavElement() {
  const composer = document.querySelector('.composer-parent');
  const navElement = composer?.firstElementChild;
  return navElement;
}

function handleToggleSwitch() {
  if (!document.getElementById('cqlSwitchContainer')) {
    const navElement = getNavElement();
    const headerLastElementChild = document.querySelector(
      '#page-header > div:last-of-type',
    ) as HTMLDivElement;

    if (navElement && headerLastElementChild) {
      const containerElement = view.createElement('div', {
        class: 'cql-switch-container',
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
      headerLastElementChild.insertAdjacentElement(
        'beforebegin',
        containerElement,
      );

      checkboxEl.addEventListener('change', toggleSidebar);
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
  }
}

function toggleSidebar(e: Event): void {
  const cqlSiderBar = document.getElementById('cqlSiderBar');
  if (!cqlSiderBar) return;

  const target = e.target as HTMLInputElement;
  const isChecked = target.checked;

  cqlSiderBar.classList.toggle('cql-sidebar-hide', !isChecked);
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

window.addEventListener(
  'load',
  function () {
    console.log('ChatGPT Question Log: Content script loaded.');
    setup();
    handleNewQuestion();
    detectUrlChange();
  },
  false,
);

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === Message.TARGET_ID) {
    view.handleScroll(`[data-message-id="${message.targetId}"]`);
    sendResponse('handleScroll completed!');
  }
  return true;
});
