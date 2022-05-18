import 'regenerator-runtime/runtime';

import { tryDownloadCourse } from './downloader.js';

// Used by JSX elements: See webpack.config.js
function createElement(tagName, attrs = {}, ...children) {
  const elem = Object.assign(document.createElement(tagName), attrs);
  for (const child of children) {
    if (Array.isArray(child)) {
      elem.append(...child);
    } else {
      elem.append(child);
    }
  }
  return elem;
}

function setupDownloadButtons(log = console) {
  log.log('Setting up download buttons');
  // We have to wait for the course cards to be added
  new MutationObserver(() => {
    for (const course_el of document.getElementsByClassName('course-element-card')) {
      try {
        if (!course_el.getAttribute('data-download-btn-added')) {
          const details = course_el.getElementsByClassName('element-details')[0];
          if (!details) {
            log.warn('Unable to add download button: Details section missing');
            continue;
          }
          
          const dl_section_el = (
            <div class="_bbdl-btn-section">
              <a href="#" onclick={() => onclick()}>Download</a>
            </div>
          );
          const onclick = async () => {
            // Get the course ID after click so that we ensure it has been populated
            const cid = course_el.getAttribute('data-course-id');
            log.log(`Downloading content for course "${cid}"`);
            
            dl_section_el.innerHTML = '';
            dl_section_el.appendChild(<span>Downloading...</span>);
            
            try {
              const blob = await tryDownloadCourse(cid, log);
              const dlname = `blackboard_course_${cid}.zip`;
            
              dl_section_el.innerHTML = '';
              dl_section_el.appendChild(
                <a
                  href={URL.createObjectURL(blob)}
                  download={dlname}
                >Open {dlname}</a>
              );
            } catch (e) {
              log.error(`Failed to download course "${cid}":`, e);
              dl_section_el.innerHTML = '';
              dl_section_el.appendChild(
                <span style="color: red;">Download failed. See console for more info.</span>
              );
            }
          };
          details.appendChild(dl_section_el);
          
          course_el.setAttribute('data-download-btn-added', 'true');
        }
      } catch(e) {
        log.error('Failed to add download button', e)
      }
    }
  }).observe(document, {
    attributeFilter: ['data-course-id'], // All of the course cards have this attribute
    subtree: true
  });
}

export { setupDownloadButtons };

