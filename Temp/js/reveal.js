(function () {
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var items = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));

    function show(el, delay) {
        if (delay > 0) {
            setTimeout(function () { el.classList.add('is-visible'); }, delay);
        } else {
            el.classList.add('is-visible');
        }
    }

    if (reduceMotion || !('IntersectionObserver' in window)) {
        items.forEach(function (el) { el.classList.add('is-visible'); });
        return;
    }

    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            observer.unobserve(entry.target);
            var delay = parseInt(entry.target.getAttribute('data-reveal-delay'), 10) || 0;
            show(entry.target, delay);
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

    items.forEach(function (el) { observer.observe(el); });
})();
