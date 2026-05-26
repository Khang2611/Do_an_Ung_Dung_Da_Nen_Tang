// Highlight method card khi chọn
document.querySelectorAll('.method-card input[type="radio"]').forEach(radio => {
    radio.addEventListener('change', () => {
        document.querySelectorAll('.method-inner').forEach(el => el.classList.remove('selected'));
        if (radio.checked) {
            radio.nextElementSibling.classList.add('selected');
        }
    });
});

// Validate trước khi submit (dùng ID cụ thể, tránh bắt nhầm form cancel)
var paymentForm = document.getElementById('payment-form');
if (paymentForm) {
    paymentForm.addEventListener('submit', function(e) {
        var selected = document.querySelector('.method-card input:checked');
        if (!selected) {
            e.preventDefault();
            alert('Vui lòng chọn phương thức thanh toán!');
        }
    });
}
