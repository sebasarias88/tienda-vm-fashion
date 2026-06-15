import { DEFAULT_THEME, THEME_STORAGE_KEY } from '@/lib/theme'

/** Evita flash de tema incorrecto antes de hidratar React */
export default function ThemeScript() {
  const script = `
(function () {
  var key = ${JSON.stringify(THEME_STORAGE_KEY)};
  var fallback = ${JSON.stringify(DEFAULT_THEME)};
  try {
    var stored = localStorage.getItem(key);
    var theme = stored === 'dark' || stored === 'light' ? stored : fallback;
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {
    document.documentElement.setAttribute('data-theme', fallback);
  }
})();
`

  return <script dangerouslySetInnerHTML={{ __html: script }} />
}
