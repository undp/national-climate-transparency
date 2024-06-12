import { LanguageFullName, LanguageShortName } from '../Enums/language.enum';

export const AvailableLanguages: { value: LanguageShortName; label: LanguageFullName }[] =
  Object.keys(LanguageShortName).map((key) => ({
    value: LanguageShortName[key as keyof typeof LanguageShortName],
    label: LanguageFullName[key as keyof typeof LanguageFullName],
  }));
