import { defineMessages } from 'react-intl';

// Redirect block: sidebar fields and what editors, logged-in users and
// visitors see on the page.
export default defineMessages({
  sendTo: { id: 'juizi-redirect-send-to', defaultMessage: 'Send visitors to' },
  sendToHelp: {
    id: 'juizi-redirect-send-to-help',
    defaultMessage:
      "Choose a page on this site, or type a web address. Visitors see this page for a few seconds, then move on. You and other editors aren't redirected.",
  },
  pageName: { id: 'juizi-redirect-page-name', defaultMessage: 'Page name' },
  pageNameHelp: {
    id: 'juizi-redirect-page-name-help',
    defaultMessage:
      "Shown instead of the web address, e.g. 'Our new events page'. Leave empty to show the address.",
  },
  choosePrompt: {
    id: 'juizi-redirect-choose-prompt',
    defaultMessage:
      "Choose where to send visitors in the sidebar, under 'Send visitors to'.",
  },
  noDestination: {
    id: 'juizi-redirect-no-destination',
    defaultMessage:
      'This redirect has no destination yet, so visitors stay on this page. Edit the page to choose one.',
  },
  samePageEdit: {
    id: 'juizi-redirect-same-page-edit',
    defaultMessage:
      "This points to the page you're editing, so visitors would go round in circles. Choose a different page in the sidebar.",
  },
  samePageView: {
    id: 'juizi-redirect-same-page-view',
    defaultMessage:
      "This redirect points to this same page, so visitors aren't sent anywhere. Edit the page to choose a different one.",
  },
  willBeSent: {
    id: 'juizi-redirect-will-be-sent',
    defaultMessage: 'Visitors will be sent to {destination}',
  },
  permanentHint: {
    id: 'juizi-redirect-permanent-hint',
    defaultMessage:
      'Search engines keep listing this page. To move a page for good, ask your site administrator to set up a permanent redirect.',
  },
  goTo: { id: 'juizi-redirect-go-to', defaultMessage: 'Go to {name} now' },
  goToPage: {
    id: 'juizi-redirect-go-to-page',
    defaultMessage: 'Go to the page now',
  },
  taking: {
    id: 'juizi-redirect-taking',
    defaultMessage: 'Taking you to {name} in {seconds}…',
  },
  takingNow: {
    id: 'juizi-redirect-taking-now',
    defaultMessage: 'Taking you to {name}…',
  },
  redirecting: {
    id: 'juizi-redirect-redirecting',
    defaultMessage: 'Redirecting in {seconds}…',
  },
  redirectingNow: {
    id: 'juizi-redirect-redirecting-now',
    defaultMessage: 'Redirecting…',
  },
  goNow: { id: 'juizi-redirect-go-now', defaultMessage: 'Go now' },
});
