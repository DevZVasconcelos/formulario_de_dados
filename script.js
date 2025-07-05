// PDF Generation function with improved single-page A4 rendering
async function generatePDF() {
    const { jsPDF } = window.jspdf;
    
    try {
        // Show loading state
        const pdfBtn = document.querySelector('.btn-pdf');
        const originalText = pdfBtn.innerHTML;
        pdfBtn.innerHTML = '<span>⏳</span> Gerando PDF...';
        pdfBtn.disabled = true;
        
        // Get the form content
        const element = document.getElementById('form-content');
        
        // Create a temporary container optimized for single-page A4 PDF
        const tempContainer = document.createElement('div');
        tempContainer.style.cssText = `
            position: absolute;
            top: -9999px;
            left: -9999px;
            width: 210mm;
            min-height: 297mm;
            background: white;
            font-family: Arial, sans-serif;
            padding: 15mm;
            box-sizing: border-box;
            font-size: 10px;
            line-height: 1.2;
            color: #333;
            overflow: hidden;
        `;
        
        // Clone the content
        const clonedElement = element.cloneNode(true);
        
        // Add PDF optimization class
        clonedElement.classList.add('pdf-optimized');
        
        // Apply compact styles for single-page layout
        const compactStyles = `
            <style>
                .pdf-optimized * {
                    box-sizing: border-box;
                }
                .pdf-optimized {
                    width: 180mm !important;
                    padding: 0 !important;
                    margin: 0 !important;
                    font-size: 9px !important;
                    line-height: 1.1 !important;
                }
                .pdf-optimized .header-container {
                    margin-bottom: 8px !important;
                    border: 1.5px solid #333 !important;
                }
                .pdf-optimized .header-content {
                    padding: 8px !important;
                    gap: 8px !important;
                }
                .pdf-optimized .logo {
                    width: 40px !important;
                    height: 40px !important;
                    font-size: 14px !important;
                }
                .pdf-optimized .company-text h1 {
                    font-size: 16px !important;
                    margin-bottom: 1px !important;
                }
                .pdf-optimized .company-text p {
                    font-size: 9px !important;
                }
                .pdf-optimized .title-section,
                .pdf-optimized .instruction-section {
                    padding: 5px !important;
                    font-size: 8px !important;
                }
                .pdf-optimized .info-grid {
                    font-size: 8px !important;
                    gap: 6px !important;
                }
                .pdf-optimized .content {
                    font-size: 8px !important;
                    line-height: 1.1 !important;
                }
                .pdf-optimized .text-section {
                    margin-bottom: 6px !important;
                }
                .pdf-optimized .justified-text {
                    margin-bottom: 4px !important;
                    line-height: 1.1 !important;
                }
                .pdf-optimized .section-title {
                    font-size: 10px !important;
                    margin: 8px 0 6px 0 !important;
                }
                .pdf-optimized .authorization-section {
                    margin: 8px 0 !important;
                }
                .pdf-optimized .radio-option {
                    margin-bottom: 6px !important;
                    gap: 4px !important;
                }
                .pdf-optimized .radio-option label {
                    font-size: 8px !important;
                    line-height: 1.1 !important;
                }
                .pdf-optimized .form-fields {
                    margin: 10px 0 !important;
                }
                .pdf-optimized .field-row {
                    margin-bottom: 6px !important;
                    gap: 8px !important;
                }
                .pdf-optimized .field-group label {
                    font-size: 7px !important;
                    margin-bottom: 1px !important;
                }
                .pdf-optimized .form-input {
                    padding: 1px 0 !important;
                    font-size: 8px !important;
                    min-height: 10px !important;
                }
                .pdf-optimized .minors-section,
                .pdf-optimized .emergency-section,
                .pdf-optimized .question-section {
                    margin-bottom: 8px !important;
                }
                .pdf-optimized .question-header {
                    gap: 4px !important;
                    margin-bottom: 4px !important;
                    font-size: 7px !important;
                }
                .pdf-optimized .yes-no-options {
                    gap: 10px !important;
                    margin-top: 2px !important;
                }
                .pdf-optimized .radio-text {
                    font-size: 7px !important;
                }
                .pdf-optimized .question-input-lines {
                    gap: 4px !important;
                }
                .pdf-optimized .signature-section {
                    margin-top: 10px !important;
                }
                .pdf-optimized .date-location {
                    font-size: 8px !important;
                    margin-bottom: 12px !important;
                    gap: 4px !important;
                }
                .pdf-optimized .signature-underline {
                    width: 150px !important;
                    height: 10px !important;
                    margin-bottom: 4px !important;
                }
                .pdf-optimized .legal-notice {
                    font-size: 6px !important;
                    line-height: 1.0 !important;
                    margin-top: 8px !important;
                }
                .pdf-optimized .underline-short {
                    width: 20px !important;
                }
                .pdf-optimized .underline-medium {
                    width: 60px !important;
                }
                .pdf-optimized .underline-field {
                    min-width: 50px !important;
                    padding: 0 6px !important;
                }
            </style>
        `;
        
        // Insert styles
        clonedElement.insertAdjacentHTML('beforeend', compactStyles);
        
        // Fix input values in the cloned element
        const originalInputs = element.querySelectorAll('input');
        const clonedInputs = clonedElement.querySelectorAll('input');
        
        originalInputs.forEach((input, index) => {
            if (clonedInputs[index]) {
                if (input.type === 'radio') {
                    clonedInputs[index].checked = input.checked;
                    if (input.checked) {
                        // Add visual indicator for checked radio buttons
                        const label = clonedInputs[index].nextElementSibling;
                        if (label && label.classList.contains('radio-text')) {
                            label.innerHTML = label.innerHTML.replace('( )', '(X)');
                        }
                    }
                } else {
                    // Convert input to styled text for PDF
                    const span = document.createElement('span');
                    span.textContent = input.value || '';
                    span.style.cssText = `
                        border-bottom: 1px solid #333;
                        display: inline-block;
                        min-width: 80px;
                        padding: 1px 3px;
                        font-size: 8px;
                        min-height: 10px;
                        vertical-align: bottom;
                        font-family: Arial, sans-serif;
                    `;
                    clonedInputs[index].parentNode.replaceChild(span, clonedInputs[index]);
                }
            }
        });
        
        // Remove radio inputs
        const radioInputs = clonedElement.querySelectorAll('input[type="radio"]');
        radioInputs.forEach(radio => {
            radio.style.display = 'none';
        });
        
        tempContainer.appendChild(clonedElement);
        document.body.appendChild(tempContainer);
        
        // Wait for rendering
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Configure html2canvas for single-page A4
        const canvas = await html2canvas(tempContainer, {
            scale: 1.5, // Reduced scale for better single-page fit
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            width: Math.round(210 * 3.78), // 210mm in pixels at 96dpi
            height: Math.round(297 * 3.78), // 297mm in pixels at 96dpi
            scrollX: 0,
            scrollY: 0,
            logging: false,
            letterRendering: true,
            foreignObjectRendering: false,
            imageTimeout: 0,
            removeContainer: true,
            windowWidth: Math.round(210 * 3.78),
            windowHeight: Math.round(297 * 3.78)
        });
        
        // Remove temporary container
        document.body.removeChild(tempContainer);
        
        // Create PDF with exact A4 dimensions
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        // A4 dimensions in mm
        const pdfWidth = 210;
        const pdfHeight = 297;
        
        // Convert canvas to image
        const imgData = canvas.toDataURL('image/png', 0.95);
        
        // Add image to PDF - fit exactly to A4 page
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, '', 'FAST');
        
        // Generate filename
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
        const filename = `termo-responsabilidade-ecoacao-${dateStr}-${timeStr}.pdf`;
        
        // Get the PDF as blob for email functionality
        const pdfBlob = pdf.output('blob');
        
        // Save PDF locally
        pdf.save(filename);
        
        // Show success notification with email option
        showSuccessWithEmailOption(filename, pdfBlob);
        
    } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        showNotification('Erro ao gerar PDF. Tente novamente.', 'error');
    } finally {
        // Restore button state
        const pdfBtn = document.querySelector('.btn-pdf');
        if (pdfBtn) {
            pdfBtn.innerHTML = '<span>📄</span> Salvar PDF';
            pdfBtn.disabled = false;
        }
    }
}

// Enhanced success notification with email option
function showSuccessWithEmailOption(filename, pdfBlob) {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create enhanced notification element
    const notification = document.createElement('div');
    notification.className = 'notification notification-success';
    notification.innerHTML = `
        <div class="notification-content">
            <div class="notification-header">
                <span class="notification-icon">✅</span>
                <span class="notification-message">PDF gerado com sucesso!</span>
                <button class="notification-close" onclick="this.closest('.notification').remove()">×</button>
            </div>
            <div class="notification-actions">
                <button class="btn-email" onclick="sendPDFByEmail('${filename}', event)">
                    <span>📧</span> Enviar por Email
                </button>
                <button class="btn-whatsapp" onclick="shareToWhatsApp('${filename}')">
                    <span>📱</span> Compartilhar
                </button>
            </div>
        </div>
    `;
    
    // Store blob reference
    notification.querySelector('.btn-email').pdfBlob = pdfBlob;
    
    // Add enhanced styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #d4edda;
        color: #155724;
        border: 1px solid #c3e6cb;
        border-radius: 12px;
        padding: 0;
        display: block;
        z-index: 1001;
        box-shadow: 0 6px 20px rgba(0,0,0,0.15);
        animation: slideIn 0.4s ease-out;
        max-width: 350px;
        font-size: 14px;
        overflow: hidden;
    `;
    
    // Add enhanced styles if not already present
    if (!document.querySelector('#enhanced-notification-styles')) {
        const style = document.createElement('style');
        style.id = 'enhanced-notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            .notification-content {
                padding: 0;
            }
            .notification-header {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 12px 16px;
                border-bottom: 1px solid #c3e6cb;
            }
            .notification-message {
                flex: 1;
                font-weight: 500;
            }
            .notification-close {
                background: none;
                border: none;
                font-size: 18px;
                cursor: pointer;
                padding: 0;
                opacity: 0.7;
                color: #155724;
            }
            .notification-close:hover {
                opacity: 1;
            }
            .notification-actions {
                display: flex;
                gap: 0;
            }
            .btn-email, .btn-whatsapp {
                flex: 1;
                padding: 12px 16px;
                border: none;
                background: transparent;
                color: #155724;
                cursor: pointer;
                font-size: 13px;
                font-weight: 500;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
                transition: background-color 0.2s ease;
            }
            .btn-email:hover {
                background: rgba(21, 87, 36, 0.1);
            }
            .btn-whatsapp:hover {
                background: rgba(21, 87, 36, 0.1);
            }
            .btn-email {
                border-right: 1px solid #c3e6cb;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 10 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(() => notification.remove(), 300);
        }
    }, 10000);
}

// Send PDF by email function
function sendPDFByEmail(filename, event) {
    const button = event.target.closest('.btn-email');
    const pdfBlob = button.pdfBlob;
    
    if (!pdfBlob) {
        showNotification('Erro: PDF não encontrado. Gere o PDF novamente.', 'error');
        return;
    }
    
    // Get form data for email subject and body
    const nomeInput = document.querySelector('input[name="nome"]');
    const emailInput = document.querySelector('input[name="email"]');
    
    const participantName = nomeInput ? nomeInput.value : 'Participante';
    const participantEmail = emailInput ? emailInput.value : '';
    
    // Create email content
    const subject = `Termo de Responsabilidade - EcoAção - ${participantName}`;
    const body = `Olá,

Segue em anexo o Termo de Responsabilidade preenchido para as atividades da EcoAção Turismo de Aventura.

Participante: ${participantName}
Data de geração: ${new Date().toLocaleDateString('pt-BR')}

Atenciosamente,
EcoAção Turismo de Aventura`;

    // Try to use Web Share API if available (mobile devices)
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([pdfBlob], filename, { type: 'application/pdf' })] })) {
        const file = new File([pdfBlob], filename, { type: 'application/pdf' });
        navigator.share({
            title: subject,
            text: body,
            files: [file]
        }).then(() => {
            showNotification('PDF compartilhado com sucesso!', 'success');
        }).catch((error) => {
            console.log('Erro ao compartilhar:', error);
            fallbackEmailMethod(subject, body, pdfBlob, filename, participantEmail);
        });
    } else {
        // Fallback for desktop browsers
        fallbackEmailMethod(subject, body, pdfBlob, filename, participantEmail);
    }
}

// Fallback email method for desktop
function fallbackEmailMethod(subject, body, pdfBlob, filename, participantEmail) {
    // Create a download link for the PDF
    const url = URL.createObjectURL(pdfBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = filename;
    
    // Create mailto link
    const mailtoLink = `mailto:${participantEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body + '\n\nNota: O arquivo PDF foi baixado automaticamente. Anexe-o ao email antes de enviar.')}`;
    
    // Download PDF and open email client
    downloadLink.click();
    window.location.href = mailtoLink;
    
    // Clean up
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    
    showNotification('PDF baixado! Cliente de email aberto.', 'success');
}

// Share to WhatsApp function
function shareToWhatsApp(filename) {
    const nomeInput = document.querySelector('input[name="nome"]');
    const participantName = nomeInput ? nomeInput.value : 'Participante';
    
    const message = `📋 *Termo de Responsabilidade - EcoAção*

Participante: ${participantName}
Data: ${new Date().toLocaleDateString('pt-BR')}

Termo de responsabilidade preenchido para as atividades de turismo de aventura da EcoAção.

🏞️ *EcoAção Turismo de Aventura*`;
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    showNotification('WhatsApp aberto! Anexe o PDF manualmente.', 'success');
}

// Standard notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span class="notification-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
        <span class="notification-message">${message}</span>
        <button class="notification-close" onclick="this.parentElement.remove()">×</button>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#d4edda' : type === 'error' ? '#f8d7da' : '#d1ecf1'};
        color: ${type === 'success' ? '#155724' : type === 'error' ? '#721c24' : '#0c5460'};
        border: 1px solid ${type === 'success' ? '#c3e6cb' : type === 'error' ? '#f5c6cb' : '#bee5eb'};
        border-radius: 8px;
        padding: 12px 16px;
        display: flex;
        align-items: center;
        gap: 8px;
        z-index: 1001;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease-out;
        max-width: 300px;
        font-size: 14px;
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Form validation and enhancement
document.addEventListener('DOMContentLoaded', function() {
    // Add input masks for specific fields
    const cpfInput = document.querySelector('input[name="cpf"]');
    const cepInput = document.querySelector('input[name="cep"]');
    const celularInput = document.querySelector('input[name="celular"]');
    const fixoInput = document.querySelector('input[name="fixo"]');
    const telefoneInput = document.querySelector('input[name="telefone"]');
    
    // CPF mask
    if (cpfInput) {
        cpfInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
            e.target.value = value;
        });
    }
    
    // CEP mask
    if (cepInput) {
        cepInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            value = value.replace(/(\d{5})(\d)/, '$1-$2');
            e.target.value = value;
        });
    }
    
    // Phone masks
    [celularInput, fixoInput, telefoneInput].forEach(input => {
        if (input) {
            input.addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length <= 10) {
                    value = value.replace(/(\d{2})(\d)/, '($1) $2');
                    value = value.replace(/(\d{4})(\d)/, '$1-$2');
                } else {
                    value = value.replace(/(\d{2})(\d)/, '($1) $2');
                    value = value.replace(/(\d{5})(\d)/, '$1-$2');
                }
                e.target.value = value;
            });
        }
    });
    
    // Auto-save form data to localStorage
    const form = document.getElementById('adventureForm');
    const formInputs = form.querySelectorAll('input, select, textarea');
    const radioInputs = document.querySelectorAll('input[type="radio"]');
    
    // Load saved data
    formInputs.forEach(input => {
        const savedValue = localStorage.getItem(`form_${input.name}`);
        if (savedValue && input.type !== 'radio') {
            input.value = savedValue;
        }
    });
    
    // Load saved radio data
    radioInputs.forEach(input => {
        const savedValue = localStorage.getItem(`form_${input.name}`);
        if (savedValue && input.value === savedValue) {
            input.checked = true;
        }
    });
    
    // Save data on input
    formInputs.forEach(input => {
        input.addEventListener('input', function() {
            if (this.type !== 'radio') {
                localStorage.setItem(`form_${this.name}`, this.value);
            }
        });
    });
    
    // Save radio data
    radioInputs.forEach(input => {
        input.addEventListener('change', function() {
            if (this.checked) {
                localStorage.setItem(`form_${this.name}`, this.value);
            }
        });
    });
    
    // Clear saved data function (can be called from console)
    window.clearFormData = function() {
        formInputs.forEach(input => {
            localStorage.removeItem(`form_${input.name}`);
        });
        radioInputs.forEach(input => {
            localStorage.removeItem(`form_${input.name}`);
        });
        location.reload();
    };
    
    console.log('📋 Formulário EcoAção carregado com sucesso!');
    console.log('💡 Funcionalidades disponíveis:');
    console.log('   • Geração de PDF otimizada para A4 (página única)');
    console.log('   • Layout responsivo para mobile e desktop');
    console.log('   • Envio por email automático');
    console.log('   • Compartilhamento via WhatsApp');
    console.log('   • clearFormData(): Limpar dados salvos');
});