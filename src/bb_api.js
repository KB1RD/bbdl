import 'regenerator-runtime/runtime';

export class LmsAPI {
  constructor(base, _f = (u, o) => fetch(u, { credentials: 'include', ...o })) {
    base = `${base}`;
    if (!base.endsWith('/')) {
      base += '/';
    }
    this.base = base;
    this.fetch = async (p, o) => {
      const resp = await _f(`${base}${p}`, o);
      if (!resp.ok) {
        const err = new Error(`Got HTTP error: ${resp.status} ${resp.statusText}`);
        err.http_code = resp.status;
        throw err;
      }
      return resp.json();
    };
  }
  
  getCourse(cid) {
    return this.fetch(`learn/api/public/v3/courses/${cid}`);
  }
  
  async *recurseGetAll(path, params = {}, limit = 64, offset = 0) {
    const results = (await this.fetch(path))?.results;
    if (!results) {
      return false;
    }
    yield* results;
    if (results.length == limit) {
      yield* recurseGetAll(path, params, limit, offset + limit);
    }
    return true;
  }
  
  getContents(id, params = {}) {
    return this.recurseGetAll(`learn/api/public/v1/courses/${id}/contents`, params);
  }
  getContentChildren(course, id, params = {}) {
    return this.recurseGetAll(
      `learn/api/public/v1/courses/${course}/contents/${id}/children`,
      params
    );
  }
  async *getContentAttachments(course, id, params = {}) {
    const gen = this.recurseGetAll(
      `learn/api/public/v1/courses/${course}/contents/${id}/attachments`,
      params
    );
    
    for await (const a of gen) {
      yield {
        ...a,
        _url: new URL(
          `${this.base}learn/api/public/v1/courses/${course}/contents/${id}/attachments/${a.id}/download`
        )
      };
    }
  }
  
  async *getCourseContentTree(course, params = {}, subc = null) {
    const gen = subc ? this.getContentChildren(course, subc, params) : this.getContents(course, params);
    
    for await (const ct of gen) {
      if (!ct) {
        continue;
      }
      if (ct.hasChildren) {
        // Users can await the generator if they want to generate children
        ct.childGenerator = this.getCourseContentTree(course, params, ct.id);
      }
      switch (ct.contentHandler?.id) {
        case 'resource/x-bb-file':
        case 'resource/x-bb-document':
        case 'resource/x-bb-assignment':
          // Same await pattern with attachments
          ct.attachmentGenerator = this.getContentAttachments(course, ct.id);
      }
      yield ct;
    }
  }
}

