import { DEFAULT_LANGUAGE } from 'game/constants/config';
import en from './en';
import fr from './fr';

const translations = { en, fr };
const browserLanguage = navigator.language.split('-')[0];
const translation = translations[browserLanguage] || translations[DEFAULT_LANGUAGE];
const translate = key => translation[key];

export default translate;
