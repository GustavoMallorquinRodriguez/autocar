function updateProgress() {
    const checkboxes = document.querySelectorAll('.service-checkbox input[type="checkbox"]');
    const total = checkboxes.length;
    const checked = Array.from(checkboxes).filter(cb => cb.checked).length;
    const percentage = Math.round((checked / total) * 100);
    
    const progressFill = document.querySelector('.progress-fill');
    progressFill.style.width = percentage + '%';
    progressFill.textContent = percentage + '% Concluído';
}