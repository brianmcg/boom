import { DEFAULT_LANGUAGE } from '@constants/config';
import en from './en';
import fr from './fr';

const translations = { en, fr };
const browserLanguage = navigator.language.split('-')[0];
const language =
  translations[browserLanguage] || translations[DEFAULT_LANGUAGE];

const camelToConstantCase = str =>
  str.replace(/[A-Z]/g, letter => `_${letter}`).toUpperCase();

const translate = (key, options = {}) => {
  const { text = key, keys = [] } = language[key] || {};

  return keys.reduce(
    (memo, item) => text.replace(camelToConstantCase(item), options[item]),
    text
  );
};

export default translate;
