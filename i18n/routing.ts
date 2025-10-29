import { defineRouting } from 'next-intl/routing';
import { locales as configLocales, defaultLocale } from './config';

export const routing = defineRouting({
  locales: configLocales,
  defaultLocale,
  localePrefix: 'as-needed'
});

export const locales = configLocales;
export const { localePrefix } = routing;

