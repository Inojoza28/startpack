document.addEventListener('DOMContentLoaded', function() {
    // Verificar se a dica deve ser mostrada
    if (localStorage.getItem('startpack_popup_tip_dismissed') === 'true') {
        document.getElementById('popupTip').classList.add('hidden');
    }
    
    // Habilitar ou desabilitar o botão "Não mostrar mais" com base no checkbox
    const checkbox = document.getElementById('dontShowAgain');
    const hideForeverBtn = document.getElementById('hideForeverBtn');
    
    checkbox.addEventListener('change', function() {
        if (this.checked) {
            hideForeverBtn.disabled = false;
            hideForeverBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        } else {
            hideForeverBtn.disabled = true;
            hideForeverBtn.classList.add('opacity-50', 'cursor-not-allowed');
        }
    });
});

// Alternar a visibilidade do painel de ajuda
function togglePopupHelp() {
    const helpPanel = document.getElementById('popupHelpPanel');
    const arrow = document.getElementById('tipArrow');
    
    helpPanel.classList.toggle('hidden');
    
    // Rotacionar a seta
    if (helpPanel.classList.contains('hidden')) {
        arrow.classList.remove('rotate-180');
    } else {
        arrow.classList.add('rotate-180');
    }
}

// Função para dispensar a dica
function dismissTip(permanently) {
    // Se o usuário optou por esconder permanentemente
    if (permanently) {
        // Mostrar confirmação antes de esconder permanentemente
        if (confirm('Tem certeza que deseja não ver mais esta dica sobre pop-ups? Isso pode afetar sua experiência com o StartPack.')) {
            localStorage.setItem('startpack_popup_tip_dismissed', 'true');
            document.getElementById('popupTip').classList.add('hidden');
        }
    } else {
        // Apenas esconder temporariamente (até a próxima visita)
        document.getElementById('popupHelpPanel').classList.add('hidden');
        document.getElementById('tipArrow').classList.remove('rotate-180');
    }
}