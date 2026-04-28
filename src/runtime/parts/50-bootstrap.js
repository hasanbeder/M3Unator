    const generator = new PlaylistGenerator();
    generator.init();

    const container = generator.domElements.container;
    const { infoLink, infoClose, infoModal } = generator.domElements;

    // Event listeners for info modal
    infoLink.addEventListener('click', () => {
        generator.openInfoModal();
    });

    infoClose.addEventListener('click', () => {
        generator.closeInfoModal({ restoreFocus: true });
    });

    window.addEventListener('click', (event) => {
        if (event.target === infoModal) {
            generator.closeInfoModal({ restoreFocus: true });
        }
    });
})();
