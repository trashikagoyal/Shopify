document.getElementById('shareWishlistBtn').addEventListener('click', async function() {
    try {
        const response = await axios.get('/user/wishlist/share');
        const data = response.data;
        window.open(data.whatsappLink, '_blank');
    } catch (err) {
        console.error('Error generating WhatsApp link:', err);
        alert('Unable to generate share link');
    }
});
