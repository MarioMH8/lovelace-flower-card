import { default as en } from './languages/en.json';
import { default as es } from './languages/es.json';

const languages = {
	en,
	es,
};

type LanguageCode = keyof typeof languages;

function getObjectPath(string: string, object: object): string | undefined {
	return (
		string
			.split('.')
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			// eslint-disable-next-line @typescript-eslint/no-unsafe-return
			.reduce((o, i) => o[i], object)
			.toString()
	);
}

export default function localize(string: string, search = '', replace = ''): string {
	const lang = (localStorage.getItem('selectedLanguage') ?? 'en')
		.replace(/['"]+/g, '')
		.replace('-', '_') as LanguageCode;

	let translated: string | undefined;

	try {
		translated = getObjectPath(string, languages[lang]);
	} catch (e) {
		translated = getObjectPath(string, languages['en']);
	}

	if (translated === undefined) {
		translated = getObjectPath(string, languages['en']);
	}

	if (search !== '' && replace !== '' && translated) {
		translated = translated.replace(search, replace);
	}

	return translated ?? string;
}
