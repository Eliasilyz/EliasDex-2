export async function initJQueryEffects() {
  if (typeof window === 'undefined') return;

  try {
    const { default: $ } = await import('jquery');

    $(document).ready(() => {
      // 1. Add Ripple Effect to buttons with class 'jq-ripple'
      $(document).off('click.jqRipple').on('click.jqRipple', '.jq-ripple', function (e) {
        const $btn = $(this);
        const offset = $btn.offset();
        if (!offset) return;

        const x = e.pageX - offset.left;
        const y = e.pageY - offset.top;

        const $ripple = $('<span class="jq-ripple-span"></span>').css({
          position: 'absolute',
          top: y + 'px',
          left: x + 'px',
          width: '0px',
          height: '0px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 255, 255, 0.35)',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
          transition: 'width 0.5s ease-out, height 0.5s ease-out, opacity 0.5s ease-out',
        });

        $btn.css('position', 'relative').css('overflow', 'hidden').append($ripple);

        setTimeout(() => {
          $ripple.css({
            width: '300px',
            height: '300px',
            opacity: '0',
          });
        }, 10);

        setTimeout(() => {
          $ripple.remove();
        }, 550);
      });

      // 2. Smooth Scroll To Top Button Handler
      $(document).off('click.jqScrollTop').on('click.jqScrollTop', '[data-jq-scrolltop]', function () {
        $('html, body').animate({ scrollTop: 0 }, 400);
      });

      // 3. Highlight active items on hover using jQuery fade effects
      $(document).off('mouseenter.jqHighlight').on('mouseenter.jqHighlight', '[data-jq-hover]', function () {
        $(this).stop(true, true).animate({ opacity: 0.85 }, 150);
      });
      $(document).off('mouseleave.jqHighlight').on('mouseleave.jqHighlight', '[data-jq-hover]', function () {
        $(this).stop(true, true).animate({ opacity: 1 }, 150);
      });

      console.log('[jQuery] Micro-animations and DOM interactions initialized.');
    });
  } catch (err) {
    console.error('[jQuery] Failed to initialize jQuery effects:', err);
  }
}

export async function jqNotify(message: string, type: 'info' | 'success' | 'error' = 'info') {
  if (typeof window === 'undefined') return;

  try {
    const { default: $ } = await import('jquery');

    const bgColors = {
      info: 'bg-zinc-900 border-zinc-700 text-zinc-100',
      success: 'bg-emerald-950 border-emerald-500/50 text-emerald-200',
      error: 'bg-red-950 border-red-500/50 text-red-200',
    };

    const $toast = $(`
      <div class="fixed top-5 right-5 z-[9999] px-4 py-3 rounded-xl border shadow-2xl ${bgColors[type]} text-xs font-semibold backdrop-blur-md transition-all transform translate-y-[-20px] opacity-0 font-sans flex items-center gap-2">
        <span>${message}</span>
      </div>
    `);

    $('body').append($toast);

    $toast.animate({ opacity: 1, top: '+=10px' }, 200);

    setTimeout(() => {
      $toast.animate({ opacity: 0, top: '-=10px' }, 200, function () {
        $toast.remove();
      });
    }, 3000);
  } catch (err) {
    console.error('[jQuery] Notification error:', err);
  }
}
