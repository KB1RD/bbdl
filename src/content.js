import { setupDownloadButtons } from './ui.jsx';

/*if (
  // Test for the negation; If any are INVALID, then don't run
  !([
    ...document.head.getElementsByTagName('meta')
  ].some(({ name, content }) => {
    switch (name) {
      case 'author':
        // Author meta must be present
        return content !== 'Blackboard';
      case 'copyright':
        // Copyright meta must contain company name and patent numbers
        return !(content.includes('Blackboard Inc') && content.includes('7,493,396') && content.includes('7,558,853'));
      default:
        return false;
    }
  }))
) {*/

// Without access to window variables, this is the most solid way to identify Blackboard
// I don't like the idea of injecting directly into the page
const base = document.head.getElementsByTagName('base')[0];
if (
  base &&
  base.href &&
  (
    base.href.startsWith('//ultra.content.blackboardcdn.com/ultra/') ||
    base.href.startsWith('https://ultra.content.blackboardcdn.com/ultra/')
  )
) {
  function checkPaths() {
    if (window.location.pathname.endsWith('/ultra/course')) {
      setupDownloadButtons({
        log(...args) {
          console.log('Blackboard Course Downloader:', ...args);
        },
        warn(...args) {
          console.warn('Blackboard Course Downloader:', ...args);
        },
        error(...args) {
          console.error('Blackboard Course Downloader:', ...args);
        },
        trace(...args) {
          console.trace('Blackboard Course Downloader:', ...args);
        }
      });
    }
  }
  
  // Run on page load
  checkPaths();
  
  // Now, I also want to run when the window location changes via pushState. However, for some
  // completely unknown reason, there are no history change events. So I'm checking the window
  // location on a fixed interval. *sigh*
  let lastloc = window.location.href;
  setInterval(
    () => {
      if (window.location.href !== lastloc) {
        checkPaths();
      }
      lastloc = window.location.href;
    },
    500
  )
}
    
