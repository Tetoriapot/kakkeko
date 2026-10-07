export function SkipLink({ children = '本文へ移動' }: { children?: string }) {
  return (
    <a
      className="skip-link"
      href="#main"
      onClick={(e) => {
        e.preventDefault();
        const target = document.getElementById('main');
        if (target) {
          target.tabIndex = -1;
          target.focus();
          target.scrollIntoView({ block: 'start' });
        }
      }}
    >
      {children}
    </a>
  );
}
