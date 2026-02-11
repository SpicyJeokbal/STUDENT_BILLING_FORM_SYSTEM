// frontend/static/js/student.js

// Set current date on page load
function setCurrentDate() {
    const today = new Date();
    const formatted = today.toLocaleDateString('en-US', { 
        month: '2-digit', 
        day: '2-digit', 
        year: 'numeric' 
    });
    document.getElementById('chargeDate').textContent = formatted;
}

// Initialize date
setCurrentDate();

// =================== DYNAMIC DESCRIPTION ITEMS ===================
function attachDescriptionItemEvents() {
    // Quantity buttons
    document.querySelectorAll('.qty-minus').forEach(btn => {
        btn.addEventListener('click', function() {
            const input = this.parentElement.querySelector('.qty-input');
            if (input.value > 1) {
                input.value = parseInt(input.value) - 1;
                updateSummary();
            }
        });
    });

    document.querySelectorAll('.qty-plus').forEach(btn => {
        btn.addEventListener('click', function() {
            const input = this.parentElement.querySelector('.qty-input');
            input.value = parseInt(input.value) + 1;
            updateSummary();
        });
    });

    // Quantity input change
    document.querySelectorAll('.qty-input').forEach(input => {
        input.addEventListener('input', updateSummary);
    });

    // Amount input change
    document.querySelectorAll('.amount-input').forEach(input => {
        input.addEventListener('input', updateSummary);
    });

    // Description input change
    document.querySelectorAll('.description-input').forEach(input => {
        input.addEventListener('input', updateSummary);
    });

    // Remove item buttons
    document.querySelectorAll('.btn-remove-item').forEach(btn => {
        btn.addEventListener('click', function() {
            const items = document.querySelectorAll('.description-item');
            if (items.length > 1) {
                this.closest('.description-item').remove();
                updateSummary();
                updateRemoveButtons();
            } else {
                alert('You must have at least one item');
            }
        });
    });
}

// Add new description item
document.getElementById('addDescriptionItem').addEventListener('click', function() {
    const descriptionItems = document.getElementById('descriptionItems');
    const newItem = document.createElement('div');
    newItem.className = 'description-item';
    newItem.innerHTML = `
        <input type="text" class="form-input description-input" placeholder="Item description">
        <div class="quantity-controls">
            <button type="button" class="qty-btn qty-minus">−</button>
            <input type="number" class="qty-input" value="1" min="1">
            <button type="button" class="qty-btn qty-plus">+</button>
        </div>
        <input type="number" class="form-input amount-input" placeholder="₱0" value="0" step="0.01">
        <button type="button" class="btn-remove-item">×</button>
    `;
    descriptionItems.appendChild(newItem);
    attachDescriptionItemEvents();
    updateSummary();
    updateRemoveButtons();
});

// Update remove button visibility
function updateRemoveButtons() {
    const items = document.querySelectorAll('.description-item');
    items.forEach(item => {
        const btn = item.querySelector('.btn-remove-item');
        btn.style.display = items.length > 1 ? 'flex' : 'none';
    });
}

// Initial event attachment
attachDescriptionItemEvents();

// =================== SUMMARY CALCULATION ===================
function updateSummary() {
    const items = document.querySelectorAll('.description-item');
    const breakdownDiv = document.getElementById('amountBreakdown');
    const totalDiv = document.getElementById('totalAmount');
    
    let total = 0;
    let breakdownHTML = '';
    
    items.forEach(item => {
        const description = item.querySelector('.description-input').value || 'Item';
        const quantity = parseInt(item.querySelector('.qty-input').value) || 0;
        const amount = parseFloat(item.querySelector('.amount-input').value) || 0;
        const itemTotal = quantity * amount;
        
        total += itemTotal;
        
        if (description && quantity > 0 && amount >= 0) {
            breakdownHTML += `
                <div class="amount-item">
                    <span>${description}(${quantity})</span>
                    <span>₱${itemTotal.toFixed(2)}</span>
                </div>
            `;
        }
    });
    
    breakdownDiv.innerHTML = breakdownHTML || '<div class="amount-item"><span>No items</span><span>₱0.00</span></div>';
    totalDiv.textContent = `₱${total.toFixed(2)}`;
}

// =================== FORM SUBMISSION ===================
document.getElementById('billingForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'SUBMITTING...';
    
    // Collect all description items
    const items = [];
    document.querySelectorAll('.description-item').forEach(item => {
        const description = item.querySelector('.description-input').value;
        const quantity = parseInt(item.querySelector('.qty-input').value);
        const amount = parseFloat(item.querySelector('.amount-input').value);
        
        if (description && quantity > 0 && amount >= 0) {
            items.push({
                description: description,
                quantity: quantity,
                amount: amount
            });
        }
    });
    
    if (items.length === 0) {
        alert('Please add at least one item with description, quantity, and amount');
        submitBtn.disabled = false;
        submitBtn.textContent = 'SUBMIT';
        return;
    }
    
    // Calculate total
    const total = items.reduce((sum, item) => sum + (item.quantity * item.amount), 0);
    
    // Get current date in YYYY-MM-DD format
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    
    const formData = {
        name: document.getElementById('student_name').value,
        student_no: document.getElementById('student_no').value,
        program: document.getElementById('program').value,
        term: document.getElementById('term').value,
        academic_year: document.getElementById('academic_year').value || '2025-2026',
        items: items,
        total: total,
        date: dateStr
    };
    
    console.log('Submitting form data:', formData);
    
    // Send to backend
    fetch('/submit/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            window.location.href = '/success/';
        } else {
            alert(data.message || 'Error submitting form. Please try again.');
            submitBtn.disabled = false;
            submitBtn.textContent = 'SUBMIT';
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'SUBMIT';
    });
});

// Initialize summary on page load
updateSummary();
updateRemoveButtons();

//student signature 
function initSignaturePad(canvasId, inputId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let drawing = false;

    canvas.addEventListener("mousedown", () => {
        drawing = true;
        ctx.beginPath();
    });

    canvas.addEventListener("mouseup", () => {
        drawing = false;

        const input = document.getElementById(inputId);
        if (input) {
            input.value = canvas.toDataURL("image/png");
        }
    });

    canvas.addEventListener("mousemove", (e) => {
        if (!drawing) return;

        const rect = canvas.getBoundingClientRect();
        ctx.lineWidth = 2;
        ctx.lineCap = "round";

        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        ctx.stroke();
    });
}

function clearPad(type) {
    const canvas = document.getElementById(type + "Pad");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const input = document.getElementById(type + "_signature");
    if (input) input.value = "";
}

document.addEventListener("DOMContentLoaded", () => {
    initSignaturePad("studentPad", "student_signature");
    initSignaturePad("librarianPad", "librarian_signature");
});