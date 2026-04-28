const gwOrderId  = document.getElementById('gwOrderId').dataset.id;
const returnUrl  = document.getElementById('returnUrl').dataset.url;
const simDelay   = parseInt(document.getElementById('simDelay').dataset.delay || '3', 10) * 1000;

function startPayment(success) {
    // Ẩn nút, hiện spinner
    document.getElementById('confirm-buttons').style.display = 'none';
    const box = document.getElementById('processing-box');
    box.style.display = 'block';

    // Animate progress bar
    const fill = document.getElementById('progress-fill');
    let pct = 0;
    const interval = setInterval(() => {
        pct += (100 / (simDelay / 100));
        if (pct >= 95) pct = 95;
        fill.style.width = pct + '%';
    }, 100);

    // Sau simDelay → gọi finalize
    setTimeout(() => {
        clearInterval(interval);
        fill.style.width = '100%';

        fetch('/pay/finalize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `gwOrderId=${gwOrderId}&success=${success}`
        })
        .then(res => res.text())
        .then(status => {
            // Redirect sang trang kết quả
            window.location.href = `/pay/result?gwOrderId=${gwOrderId}&returnUrl=${encodeURIComponent(returnUrl)}`;
        })
        .catch(err => {
            console.error('Lỗi finalize:', err);
            alert('Lỗi kết nối. Vui lòng thử lại.');
            document.getElementById('confirm-buttons').style.display = 'flex';
            box.style.display = 'none';
        });
    }, simDelay);
}
