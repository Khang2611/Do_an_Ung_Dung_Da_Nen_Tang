// Highlight method card khi chọn
document.querySelectorAll('.method-card input[type="radio"]').forEach(radio => {
    radio.addEventListener('change', () => {
        document.querySelectorAll('.method-inner').forEach(el => el.classList.remove('selected'));
        if (radio.checked) {
            radio.nextElementSibling.classList.add('selected');
        }
    });
});

// Validate trước khi submit
document.querySelector('form').addEventListener('submit', function(e) {
    const selected = document.querySelector('.method-card input:checked');
    if (!selected) {
        e.preventDefault();
        alert('Vui lòng chọn phương thức thanh toán!');
    }
});
