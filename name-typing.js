(() => {
  const name = document.querySelector('.hero-title .name');
  if (!name || name.dataset.typingInitialized) return;
  const text = Array.from(name.childNodes).find(node => node.nodeType === 3);
  if (!text || !text.textContent.trim()) return;
  const fullText = text.textContent;
  const characters = Array.from(fullText);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  name.dataset.typingInitialized = 'true';
  // Keep the accessible heading complete while only its visual text animates.
  const heading = name.closest('h1');
  heading.setAttribute('aria-label', heading.textContent.trim());
  if (reducedMotion.matches) return;

  let timer;
  let position = 0;
  const finish = () => {
    window.clearTimeout(timer);
    text.textContent = fullText;
    reducedMotion.removeEventListener('change', finish);
  };
  const type = () => {
    text.textContent = characters.slice(0, ++position).join('');
    if (position < characters.length) timer = window.setTimeout(type, 85);
    else finish();
  };
  // Preserve the existing cursor element, font, and name layout.
  text.textContent = '';
  reducedMotion.addEventListener('change', finish);
  timer = window.setTimeout(type, 180);
})();
