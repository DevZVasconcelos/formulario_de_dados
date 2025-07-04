// PDF Generation function with improved rendering
async function generatePDF() {
    const { jsPDF } = window.jspdf;
    
    try {
        // Show loading state
        const pdfBtn = document.querySelector('.btn-pdf');
        const originalText = pdfBtn.innerHTML;
        pdfBtn.innerHTML = '<span>⏳</span> Gerando PDF...';
        pdfBtn.disabled = true;
        
        // Hide the PDF button temporarily
        const pdfContainer = document.querySelector('.pdf-button-container');
        pdfContainer.style.display = 'none';
        
        // Get the form content
        const element = document.getElementById('form-content');
        
        // Create a temporary container for PDF generation
        const tempContainer = document.createElement('div');
        tempContainer.style.cssText = `
            position: absolute;
            top: -9999px;
            left: -9999px;
            width: 794px;
            background: white;
            font-family: Arial, sans-serif;
            padding: 40px;
            box-sizing: border-box;
        `;
        
        // Clone the content
        const clonedElement = element.cloneNode(true);
        
        // Apply specific styles to the cloned element for PDF
        clonedElement.style.cssText = `
            width: 714px;
            margin: 0;
            padding: 0;
            background: white;
            font-size: 11px;
            line-height: 1.3;
            color: #333;
        `;
        
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
                    clonedInputs[index].value = input.value;
                    // Convert input to text for PDF
                    const span = document.createElement('span');
                    span.textContent = input.value || '____________________';
                    span.style.cssText = `
                        border-bottom: 1px solid #333;
                        display: inline-block;
                        min-width: 100px;
                        padding: 2px 4px;
                        font-size: 11px;
                    `;
                    clonedInputs[index].parentNode.replaceChild(span, clonedInputs[index]);
                }
            }
        });
        
        // Remove radio inputs and replace with text
        const radioInputs = clonedElement.querySelectorAll('input[type="radio"]');
        radioInputs.forEach(radio => {
            radio.style.display = 'none';
        });
        
        tempContainer.appendChild(clonedElement);
        document.body.appendChild(tempContainer);
        
        // Wait for rendering
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Configure html2canvas with optimized settings
        const canvas = await html2canvas(tempContainer, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            width: 794,
            height: tempContainer.scrollHeight,
            scrollX: 0,
            scrollY: 0,
            logging: false,
            letterRendering: true,
            foreignObjectRendering: false,
            imageTimeout: 0,
            removeContainer: true
        });
        
        // Remove temporary container
        document.body.removeChild(tempContainer);
        
        // Show the PDF button again
        pdfContainer.style.display = 'block';
        
        // Create PDF
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        // A4 dimensions
        const pdfWidth = 210;
        const pdfHeight = 297;
        const margin = 10;
        const contentWidth = pdfWidth - (margin * 2);
        const contentHeight = pdfHeight - (margin * 2);
        
        // Convert canvas to image
        const imgData = canvas.toDataURL('image/png', 1.0);
        
        // Calculate scaling
        const canvasRatio = canvas.height / canvas.width;
        const pdfRatio = contentHeight / contentWidth;
        
        let finalWidth, finalHeight;
        
        if (canvasRatio > pdfRatio) {
            // Canvas is taller, fit to height
            finalHeight = contentHeight;
            finalWidth = finalHeight / canvasRatio;
        } else {
            // Canvas is wider, fit to width
            finalWidth = contentWidth;
            finalHeight = finalWidth * canvasRatio;
        }
        
        // Center the content
        const xOffset = margin + (contentWidth - finalWidth) / 2;
        const yOffset = margin;
        
        // Check if we need multiple pages
        if (finalHeight <= contentHeight) {
            // Single page
            pdf.addImage(imgData, 'PNG', xOffset, yOffset, finalWidth, finalHeight, '', 'FAST');
        } else {
            // Multiple pages
            const pageContentHeight = contentHeight;
            const totalPages = Math.ceil(finalHeight / pageContentHeight);
            
            for (let page = 0; page < totalPages; page++) {
                if (page > 0) {
                    pdf.addPage();
                }
                
                // Calculate the portion of the image for this page
                const sourceY = (page * pageContentHeight / finalHeight) * canvas.height;
                const sourceHeight = Math.min(
                    (pageContentHeight / finalHeight) * canvas.height,
                    canvas.height - sourceY
                );
                
                // Create a canvas for this page
                const pageCanvas = document.createElement('canvas');
                const pageCtx = pageCanvas.getContext('2d');
                pageCanvas.width = canvas.width;
                pageCanvas.height = sourceHeight;
                
                // Create image from original canvas
                const img = new Image();
                await new Promise((resolve) => {
                    img.onload = () => {
                        pageCtx.drawImage(img, 0, sourceY, canvas.width, sourceHeight, 0, 0, canvas.width, sourceHeight);
                        
                        const pageImgData = pageCanvas.toDataURL('image/png', 1.0);
                        const pageHeight = (sourceHeight / canvas.height) * finalHeight;
                        
                        pdf.addImage(pageImgData, 'PNG', xOffset, yOffset, finalWidth, pageHeight, '', 'FAST');
                        resolve();
                    };
                    img.src = imgData;
                });
            }
        }
        
        // Generate filename
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        const filename = `termo-responsabilidade-ecoacao-${dateStr}.pdf`;
        
        // Save PDF
        pdf.save(filename);
        
        showNotification('PDF gerado com sucesso!', 'success');
        
    } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        showNotification('Erro ao gerar PDF. Tente novamente.', 'error');
    } finally {
        // Restore button state
        const pdfBtn = document.querySelector('.btn-pdf');
        const pdfContainer = document.querySelector('.pdf-button-container');
        if (pdfContainer) pdfContainer.style.display = 'block';
        if (pdfBtn) {
            pdfBtn.innerHTML = originalText;
            pdfBtn.disabled = false;
        }
    }
}

// Notification system
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
    
    // Add animation styles if not already present
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
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
            .notification-close {
                background: none;
                border: none;
                font-size: 18px;
                cursor: pointer;
                padding: 0;
                margin-left: 8px;
                opacity: 0.7;
            }
            .notification-close:hover {
                opacity: 1;
            }
        `;
        document.head.appendChild(style);
    }
    
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
    console.log('💡 Dicas:');
    console.log('   • clearFormData(): Limpar dados salvos');
});