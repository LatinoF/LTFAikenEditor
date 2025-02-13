fetch('modular/info_modal.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('InfoModalContainer').innerHTML = data;

        const openModalButton = document.getElementById('openModal');
        const modal = document.getElementById('modal');
        const closeModalButton = document.getElementById('closeModal');

        const openModal = () => {
            modal.classList.remove('hidden');
            modal.setAttribute('aria-hidden', 'false');
        };

        const closeModal = () => {
            modal.classList.add('hidden');
            modal.setAttribute('aria-hidden', 'true');
        };

        // Apri il modal al caricamento della pagina
        openModal();

        openModalButton.addEventListener('click', openModal);
        closeModalButton.addEventListener('click', closeModal);

        window.addEventListener('click', (event) => {
            if (event.target === modal) closeModal();
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && !modal.classList.contains('hidden')) {
                closeModal();
            }
        });
    })
    .catch(error => console.error('Error loading modal:', error));
