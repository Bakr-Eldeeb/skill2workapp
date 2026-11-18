// Runs inside the browser against the rendered Find Jobs route.
export async function checkJobsFooterLayout(doc = document) {
  const pane = doc.querySelector('.workspace.jobs-directory');
  const footer = pane?.querySelector('.workspace-footer');
  const boost = pane?.querySelector('.career-boost');
  if (!footer || !boost) throw new Error('Missing jobs scroll area, career section or footer.');
  await doc.fonts.ready;
  const frame = () => new Promise((resolve) => requestAnimationFrame(resolve));
  await frame();
  const listHeight = pane.scrollHeight;

  // Simulate a late insert after Angular boot, including content in a separate frame.
  const widget = doc.createElement('section');
  widget.style.minHeight = '120vh';
  widget.textContent = 'iAmYourCareerCopilot';
  const embedded = doc.createElement('iframe');
  embedded.srcdoc = '<p>Premium</p><img alt="hello">';
  widget.append(embedded);
  doc.body.append(widget);
  try {
    await frame();
    pane.scrollTop = pane.scrollHeight;
    await frame();
    const box = pane.getBoundingClientRect();
    const bottom = footer.getBoundingClientRect().bottom;
    const link = footer.querySelector('a');
    const rect = link.getBoundingClientRect();
    const hit = doc.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
    const chevron = doc.defaultView.getComputedStyle(boost.querySelector('a'), '::after');
    const checks = {
      listScrollable: pane.scrollTop > 0,
      listHeightUnaffected: listHeight === pane.scrollHeight,
      footerAtBottom: Math.abs(bottom - box.bottom) <= 2,
      footerLinkExposed: hit === link || link.contains(hit),
      noHorizontalOverflow: pane.scrollWidth <= pane.clientWidth + 1,
      illustrationLoaded: boost.querySelector('img').naturalWidth > 0,
      chevronDrawn: parseFloat(chevron.width) > 0 && chevron.borderTopStyle === 'solid',
      directoryKeyboardReachable: pane.tabIndex === 0,
    };
    for (const [name, passed] of Object.entries(checks)) {
      if (!passed) throw new Error('Find Jobs layout check failed: ' + name);
    }
    return checks;
  } finally {
    widget.remove();
  }
}
