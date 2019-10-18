import { DEFAULT_LANGUAGE } from '~/constants/config';
import en from './en';

const translations = { en };
const browserLanguage = navigator.language.split('-')[0];
const translation = translations[browserLanguage] || translations[DEFAULT_LANGUAGE];
const translate = key => translation[key];

export default translate;
