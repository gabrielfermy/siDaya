/**
 * @file legal.controller.js
 * @description Controller for Public Legal, FAQ, and Merchant Compliance Portal
 * @module Controller:Legal
 */

const LegalController = {
  /**
   * Toggles active accordion item in FAQ list
   * @param {number} idx - Index of FAQ item
   */
  toggleFaq(idx) {
    const item = document.getElementById(`faq-item-${idx}`);
    if (!item) return;
    const isCurrentlyActive = item.classList.contains('active');

    // Close all FAQs first
    document.querySelectorAll('.faq-item').forEach(el => el.classList.remove('active'));

    // If it was not active, open it
    if (!isCurrentlyActive) {
      item.classList.add('active');
    }
  },

  /**
   * Filters FAQ accordion items dynamically based on search query
   * @param {string} query
   */
  filterFaq(query) {
    const q = (query || '').toLowerCase().trim();
    const items = document.querySelectorAll('.faq-item');
    let visibleCount = 0;

    items.forEach(item => {
      const text = item.innerText.toLowerCase();
      if (!q || text.includes(q)) {
        item.style.display = 'block';
        visibleCount++;
      } else {
        item.style.display = 'none';
      }
    });

    const noResultEl = document.getElementById('faq-no-results');
    if (visibleCount === 0) {
      if (!noResultEl) {
        const list = document.getElementById('faq-accordion-list');
        if (list) {
          const div = document.createElement('div');
          div.id = 'faq-no-results';
          div.style.padding = '24px';
          div.style.textAlign = 'center';
          div.style.color = 'var(--text-muted)';
          div.innerHTML = `Tidak ditemukan pertanyaan yang cocok dengan pencarian "<em>${query}</em>".`;
          list.appendChild(div);
        }
      }
    } else if (noResultEl) {
      noResultEl.remove();
    }
  },

  /**
   * Copies contact information (email, phone, address) to clipboard
   * @param {string} label
   * @param {string} text
   */
  copyContactInfo(label, text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showToast(`${label} berhasil disalin ke clipboard! 📋`);
      }).catch(() => {
        showToast(`${label}: ${text}`);
      });
    } else {
      showToast(`${label}: ${text}`);
    }
  },

  /**
   * Handles contact message form submission
   * @param {Event} e
   */
  handleContactSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();
    const name = document.getElementById('contact-name')?.value || 'Pengunjung';
    const email = document.getElementById('contact-email')?.value || '';
    const subject = document.getElementById('contact-subject')?.value || 'Umum';

    showToast(`Terima kasih Bapak/Ibu ${name}! Pesan Anda mengenai [${subject}] telah terkirim ke support@sidaya.id. Tim kami akan merespons dalam 1x24 jam. 📨`);

    // Reset form fields
    const form = e.target;
    if (form && form.reset) {
      form.reset();
    }
  }
};
