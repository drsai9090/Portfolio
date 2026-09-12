const MAX_BYTES = 20000;
const MAX_ROWS = 100;
const columns = ['reference', 'label', 'priority'];
export const examples = {
  valid: { label: 'Valid records', description: 'All records pass these checks. Compare the views to see whitespace and case normalization.', csv: 'reference,label,priority\n atlas-01 ,"Interface, navigation", normal \natlas-02,Document search,HIGH\natlas-03,Write release notes,low' },
  review: { label: 'Needs review', description: 'Two references match after normalization, and one priority is outside the allowed values.', csv: 'reference,label,priority\n atlas-01,"Interface, navigation", normal\natlas-02,Document search,HIGH\n ATLAS-01 ,Test the retry path,urgent\natlas-04,"Write ""clear"" notes",low' },
  malformed: { label: 'Broken CSV', description: 'The second field is missing a closing quote. Add one before the final comma, then inspect again.', csv: 'reference,label,priority\natlas-01,"Missing closing quote,normal' }
};

export function parseCSV(text) {
  if (typeof text !== 'string') throw new Error('Enter CSV text to inspect.');
  if (new TextEncoder().encode(text).length > MAX_BYTES) throw new Error('Keep this experiment under 20 KB.');
  text = text.replace(/^\uFEFF/, '');
  const records = [];
  let record = [], field = '', quoted = false, closed = false;
  function finishField() { record.push(field); field = ''; closed = false; }
  function finishRecord() {
    finishField(); records.push(record); record = [];
    if (records.length > MAX_ROWS + 1) throw new Error('Use no more than 100 data rows.');
  }
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (char === '"') { quoted = false; closed = true; }
      else field += char;
    } else {
      if (closed && char !== ',' && char !== '\n' && char !== '\r') throw new Error('Unexpected text after a closing quote.');
      if (char === ',') finishField();
      else if (char === '\n' || char === '\r') {
        finishRecord();
        if (char === '\r' && text[i + 1] === '\n') i++;
      } else if (char === '"') {
        if (field.length) throw new Error('A quoted value must start at the beginning of its field.');
        quoted = true;
      } else field += char;
    }
  }
  if (quoted) throw new Error('A quoted value is missing its closing quote.');
  if (field.length || closed || record.length) finishRecord();
  if (!records.length) throw new Error('Add a header row and at least one data row.');
  const [headers, ...rows] = records;
  const names = headers.map(value => value.trim().toLowerCase());
  if (names.some(value => !value)) throw new Error('Every column needs a header.');
  if (new Set(names).size !== names.length) throw new Error('Column headers must be unique.');
  const uneven = rows.findIndex(row => row.length !== headers.length);
  if (uneven !== -1) throw new Error(`Record ${uneven + 1} has ${rows[uneven].length} fields; the header requires ${headers.length}.`);
  return { headers, rows };
}

export function inspectCSV(text) {
  const parsed = parseCSV(text);
  const headers = parsed.headers.map(value => value.trim().toLowerCase());
  if (headers.length !== columns.length || columns.some(key => !headers.includes(key))) {
    throw new Error('Use exactly these headers: reference, label, priority.');
  }
  if (!parsed.rows.length) throw new Error('Add at least one data row below the headers.');
  const rows = parsed.rows.map((values, index) => {
    const original = Object.fromEntries(headers.map((key, i) => [key, values[i]]));
    const normalized = {
      reference: original.reference.trim().toUpperCase(),
      label: original.label.trim(),
      priority: original.priority.trim().toLowerCase()
    };
    const issues = [];
    if (!normalized.reference) issues.push('Reference is missing.');
    if (!['low', 'normal', 'high'].includes(normalized.priority)) issues.push('Priority must be low, normal or high.');
    return { row: index + 1, original, normalized, issues };
  });
  const references = new Map();
  for (const row of rows) {
    const key = row.normalized.reference;
    if (key) references.set(key, (references.get(key) || 0) + 1);
  }
  for (const row of rows) {
    if (references.get(row.normalized.reference) > 1) row.issues.push('Duplicate reference.');
  }
  const issueCount = rows.reduce((count, row) => count + row.issues.length, 0);
  const needsReview = rows.filter(row => row.issues.length).length;
  const changedRecords = rows.filter(row => columns.some(key => row.original[key] !== row.normalized[key])).length;
  return { source: text, sourceHeaders: parsed.headers, headers: columns.slice(), rows, issueCount,
    summary: { records: rows.length, clear: rows.length - needsReview, needsReview, issues: issueCount, changedRecords } };
}

export function mountLab(container) {
  container.innerHTML = `<div class="signal-lab">
    <p class="signal-note">CSV VALIDATOR <span>Sample data · runs in your browser</span></p>
    <fieldset class="signal-examples"><legend>Load an example</legend><div>${Object.entries(examples).map(([id, example]) => `<button type="button" data-signal-example="${id}">${example.label}</button>`).join('')}</div><p class="signal-example-help"></p></fieldset>
    <form class="signal-grid">
      <section class="signal-editor" aria-label="CSV source">
        <label for="signal-source">01 / Source</label>
        <p id="signal-help">Edit the source, then inspect it. Maximum 20 KB and 100 records.</p>
        <textarea id="signal-source" aria-describedby="signal-help signal-status" spellcheck="false" autocapitalize="off" autocomplete="off" rows="12"></textarea>
        <div class="signal-actions"><button type="submit">Inspect source <span aria-hidden="true">↗</span></button><button class="signal-reset" type="button">Reset example</button></div>
        <p class="signal-footnote">Original values are preserved.</p>
      </section>
      <section class="signal-preview" aria-label="Inspection results">
        <div class="signal-preview-top"><h2>02 / Results</h2><fieldset><legend class="signal-sr">Show values</legend><label><input type="radio" name="signal-view" value="original"> Original</label><label><input type="radio" name="signal-view" value="normalized" checked> Normalized</label></fieldset></div>
        <output class="signal-status" id="signal-status" aria-live="polite" aria-atomic="true"></output>
        <dl class="signal-counts" hidden>${[['records','Records'],['clear','Clear'],['needsReview','Need review'],['issues','Issues']].map(([key,label]) => `<div><dt>${label}</dt><dd data-signal-count="${key}"></dd></div>`).join('')}</dl>
        <p class="signal-view-note" hidden></p>
        <div class="signal-table-wrap" tabindex="0" role="region" aria-label="CSV preview table"><table><caption class="signal-sr">Source records and review issues</caption><thead><tr><th scope="col">#</th><th scope="col">Reference</th><th scope="col">Label</th><th scope="col">Priority</th><th scope="col">Review</th></tr></thead><tbody></tbody></table></div>
        <div class="signal-download-row"><button class="signal-download" type="button" disabled>Download JSON report</button><p>Includes the source, normalized values and validation issues.</p></div>
        <p class="signal-footnote">References: trim + uppercase. Labels: trim. Priority: trim + lowercase. Duplicate references are flagged on every matching row.</p>
      </section>
    </form>
  </div>`;
  const form = container.querySelector('form');
  const source = container.querySelector('textarea');
  const status = container.querySelector('output');
  const body = container.querySelector('tbody');
  const counts = container.querySelector('.signal-counts');
  const table = container.querySelector('.signal-table-wrap');
  const viewNote = container.querySelector('.signal-view-note');
  const download = container.querySelector('.signal-download');
  let report, exampleId = 'review', downloadURL, downloadTimer;
  function clearDownload() {
    clearTimeout(downloadTimer);
    if (downloadURL) URL.revokeObjectURL(downloadURL);
    downloadURL = null;
  }
  function render() {
    body.replaceChildren();
    counts.hidden = table.hidden = viewNote.hidden = !report;
    download.disabled = !report;
    if (!report) return;
    const view = form.elements['signal-view'].value;
    for (const row of report.rows) {
      const tr = document.createElement('tr');
      tr.dataset.issues = String(row.issues.length > 0);
      const values = [String(row.row), ...columns.map(key => row[view][key]), row.issues.join(' ') || 'Clear'];
      values.forEach(value => { const td = document.createElement('td'); td.textContent = value; tr.append(td); });
      body.append(tr);
    }
    container.querySelectorAll('[data-signal-count]').forEach(node => { node.textContent = String(report.summary[node.dataset.signalCount]); });
    viewNote.textContent = view === 'original' ? 'Original values, with whitespace retained.' : `${report.summary.changedRecords} of ${report.summary.records} records differ from the original after normalization.`;
    status.dataset.kind = report.summary.needsReview ? 'review' : 'clear';
    status.textContent = report.summary.needsReview
      ? `${report.summary.needsReview} of ${report.summary.records} records need review. ${report.issueCount} issues found.`
      : `${report.summary.records} records clear under these reference and priority checks.`;
  }
  function inspect(event) {
    event?.preventDefault();
    try { report = inspectCSV(source.value); source.removeAttribute('aria-invalid'); render(); }
    catch (error) { report = null; render(); source.setAttribute('aria-invalid', 'true'); status.dataset.kind = 'error'; status.textContent = `CSV could not be inspected. ${error.message}`; }
  }
  function loadExample(id) {
    if (!Object.hasOwn(examples, id)) return;
    exampleId = id; source.value = examples[id].csv;
    container.querySelector('.signal-example-help').textContent = examples[id].description;
    inspect();
  }
  form.addEventListener('submit', inspect);
  form.addEventListener('change', event => { if (event.target.name === 'signal-view') render(); });
  source.addEventListener('input', () => {
    report = null; render(); source.removeAttribute('aria-invalid'); status.dataset.kind = 'pending';
    status.textContent = 'Source changed. Inspect again to generate a new preview.';
  });
  container.querySelectorAll('[data-signal-example]').forEach(button => button.addEventListener('click', () => loadExample(button.dataset.signalExample)));
  container.querySelector('.signal-reset').addEventListener('click', () => loadExample(exampleId));
  download.addEventListener('click', () => {
    if (!report || source.value !== report.source) return;
    clearDownload();
    const contents = { format: 'source-and-signal/v1', scope: 'Browser-local demonstration; normalized values are a preview.', ...report };
    downloadURL = URL.createObjectURL(new Blob([JSON.stringify(contents, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = downloadURL; link.download = 'source-and-signal-report.json'; link.hidden = true;
    container.append(link); link.click(); link.remove();
    downloadTimer = setTimeout(clearDownload, 1000);
  });
  loadExample(exampleId);
  return () => { clearDownload(); container.replaceChildren(); };
}
