export function createHelpModal() {
    const helpBtn = document.createElement('button');
    helpBtn.className = 'fixed top-4 right-4'; helpBtn.textContent = '?';
    const modal = document.createElement('div'); modal.className = 'fixed inset-0 hidden';
    const slide = document.createElement('div'); slide.className = 'fixed right-0 top-0 translate-x-full';
    modal.appendChild(slide);
    helpBtn.onclick = () => { modal.classList.toggle('hidden'); slide.classList.toggle('translate-x-full'); };
    modal.onclick = e => { if (e.target === modal) { modal.classList.add('hidden'); slide.classList.add('translate-x-full'); } };
    return { helpBtn, modal };
}