import 'regenerator-runtime/runtime';

import { downloadZip } from 'client-zip';
import * as yaml from 'js-yaml';
// import * as zip from '@zip.js/zip.js';

import { LmsAPI } from './bb_api.js';

// zip.configure({ useWebWorkers: false });

function makeSafeName(name) {
  return name.replace(/[^A-Za-z0-9_\-]/g, ' ');
}

export async function* streamDownloadTree(nodegen, path, log = console) {
  log.log(`Entering course path "${path}"`);
  try {
    for await (const node of nodegen) {
      const subpath = path + makeSafeName(node.title || node.id) + '/';
      
      if (node.childGenerator) {
        yield* streamDownloadTree(node.childGenerator, subpath, log);
      }
      
      if (node.attachmentGenerator) {
        log.log(`Saving attachments in "${subpath}"...`);
        for await (const attachment of node.attachmentGenerator) {
          yield {
            name: subpath + makeSafeName(attachment.fileName || attachment.id),
            input: await fetch(attachment._url)
          };
        }
      }
      
      // Let's not try to serialize generators :P
      log.log(`Saving course directory index in "${subpath}"...`);
      delete node.childGenerator;
      delete node.attachmentGenerator;
      yield { name: `${subpath}index.yaml`, input: yaml.dump({ bbContent: node }) };
    }
  } catch (e) {
    if (e.http_code == 403) {
      log.warn(`Got HTTP 403 at path "${path}"`);
      yield {
        name: `${path}UNAUTHORIZED.txt`,
        input: 'Got HTTP status 403 while downloading.\n' +
          'This means that your teacher disallowed access to this folder.'
      };
    } else {
      log.error(`Error reading path "${path}":`, e);
      throw e;
    }
  }
  log.log(`Exiting course path "${path}"`);
}

export async function* generateZipFiles(lms, cid, log = console) {
  log.log('Downloading course description info...');
  const course = await lms.getCourse(cid);
  const basepath = makeSafeName(course.courseId || course.id);
  yield { name: `${basepath}/course.yaml`, input: yaml.dump({ bbCourse: course }) };
  log.log('Downloaded course description info');
  
  log.log('Downloading course directory tree...');
  yield* streamDownloadTree(lms.getCourseContentTree(cid), basepath + '/', log);
  log.log('Download complete');
}

export async function tryDownloadCourse(cid, log = console) {
  const lms = new LmsAPI('https://lms.rpi.edu/');
  
  return await downloadZip(generateZipFiles(lms, cid, log)).blob();
  
  //const blobwriter = new zip.BlobWriter("application/zip");
  //const writer = new zip.ZipWriter(blobwriter);
  
  /* for await (const { name, input } of generateZipFiles(lms, cid, log)) {
    await writer.add(name, new zip.TextReader(input));
  } */
  
  /* await writer.add("test.txt", new zip.TextReader("Hello"));
  
  await writer.close();

  return blobwriter.getData(); */
}

