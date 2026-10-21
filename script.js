document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 1. DARK MODE TOGGLE (Com LocalStorage)
    // ==========================================
    const themeToggle = document.getElementById('theme-toggle');
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);

    themeToggle.addEventListener('click', () => {
        const newTheme = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        trackEvent('theme_toggled', { theme: newTheme });
    });

    // ==========================================
    // 2. HEADER GLASSMORPHISM ON SCROLL
    // ==========================================
    const header = document.getElementById('main-header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // ==========================================
    // 3. MOBILE MENU TOGGLE
    // ==========================================
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileNav = document.getElementById('mobile-nav');
    
    mobileMenuBtn.addEventListener('click', () => {
        mobileNav.classList.toggle('active');
        const isExpanded = mobileNav.classList.contains('active');
        mobileMenuBtn.setAttribute('aria-expanded', isExpanded);
    });

    // Fechar menu ao clicar em um link
    mobileNav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            mobileNav.classList.remove('active');
        });
    });

    // ==========================================
    // 4. INTERSECTION OBSERVER (Animações Reveal)
    // ==========================================
    const revealElements = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    revealElements.forEach(el => revealObserver.observe(el));

    // ==========================================
    // 5. FAQ ACCORDION
    // ==========================================
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const item = header.parentElement;
            const isActive = item.classList.contains('active');
            
            // Fechar todos
            document.querySelectorAll('.accordion-item').forEach(i => {
                i.classList.remove('active');
                i.querySelector('.accordion-header').setAttribute('aria-expanded', 'false');
            });

            // Abrir o clicado se não estava ativo
            if (!isActive) {
                item.classList.add('active');
                header.setAttribute('aria-expanded', 'true');
                trackEvent('faq_opened', { question: header.innerText.trim() });
            }
        });
    });

    // ==========================================
    // 6. UTM TRACKING & WHATSAPP INJECTION
    // ==========================================
    const urlParams = new URLSearchParams(window.location.search);
    const utmData = {};
    
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(param => {
        if (urlParams.has(param)) {
            utmData[param] = urlParams.get(param);
            localStorage.setItem(param, urlParams.get(param));
        } else {
            utmData[param] = localStorage.getItem(param) || 'organico';
        }
    });

    // Atualizar todos os links do WhatsApp com a mensagem personalizada
    const whatsappNumber = '5511999998888'; // [Sugestão - VALIDAR]
    const baseMessage = `Olá! Vim através do ${utmData.utm_source} e gostaria de saber mais sobre agendamento.`;
    const encodedMessage = encodeURIComponent(baseMessage);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

    document.querySelectorAll('#floating-whatsapp, #sticky-whatsapp-btn').forEach(btn => {
        btn.href = whatsappUrl;
    });

    // ==========================================
    // 7. FORMULÁRIO: RASCUNHO (LocalStorage) & VALIDAÇÃO
    // ==========================================
    const form = document.getElementById('contact-form');
    const formInputs = form.querySelectorAll('input, select');

    // Restaurar rascunho
    formInputs.forEach(input => {
        const savedValue = localStorage.getItem(`form_draft_${input.name}`);
        if (savedValue) input.value = savedValue;

        // Salvar rascunho ao digitar
        input.addEventListener('input', () => {
            localStorage.setItem(`form_draft_${input.name}`, input.value);
        });
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (form.checkValidity()) {
            trackEvent('form_submitted', { 
                servico: document.getElementById('servico-interesse').value,
                utm_source: utmData.utm_source
            });
            
            // Limpar rascunho
            formInputs.forEach(input => localStorage.removeItem(`form_draft_${input.name}`));
            
            alert('Obrigado! Sua solicitação foi enviada. Entraremos em contato em breve.');
            form.reset();
        } else {
            form.reportValidity();
        }
    });

    // ==========================================
    // 8. COOKIE CONSENT & TRACK EVENT
    // ==========================================
    const cookieBanner = document.getElementById('cookie-banner');
    const acceptBtn = document.getElementById('cookie-accept');
    const rejectBtn = document.getElementById('cookie-reject');

    if (!localStorage.getItem('cookie_consent')) {
        cookieBanner.classList.remove('hidden');
    }

    acceptBtn.addEventListener('click', () => {
        localStorage.setItem('cookie_consent', 'accepted');
        cookieBanner.classList.add('hidden');
        trackEvent('cookie_consent_given', { status: 'accepted' });
    });

    rejectBtn.addEventListener('click', () => {
        localStorage.setItem('cookie_consent', 'rejected');
        cookieBanner.classList.add('hidden');
    });

    // Função global de rastreamento segura
    window.trackEvent = function(eventName, data = {}) {
        const consent = localStorage.getItem('cookie_consent');
        if (consent === 'accepted') {
            console.log(`[TRACK EVENT] ${eventName}`, data);
            // Aqui você injetaria: gtag('event', eventName, data); ou fbq('trackCustom', eventName, data);
        } else {
            console.log(`[TRACK BLOCKED] ${eventName} (Consent rejected)`);
        }
    };

    // Rastrear cliques em CTAs
    document.querySelectorAll('.track-cta').forEach(btn => {
        btn.addEventListener('click', () => {
            trackEvent(btn.dataset.event, { 
                url: window.location.href,
                utm_source: utmData.utm_source
            });
        });
    });
});