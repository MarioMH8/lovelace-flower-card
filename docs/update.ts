import * as fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

import { globSync } from 'glob';

export interface Basic {
	blooming: string;
	category: string;
	color: string;
	floral_language: string;
	origin: string;
	production: string;
}

export interface Maintenance {
	fertilization: string;
	pruning: string;
	size: string;
	soil: string;
	sunlight: string;
	watering: string;
}

export interface Parameter {
	max_env_humid: number;
	max_light_lux: number;
	max_light_mmol: number;
	max_soil_ec: number;
	max_soil_moist: number;
	max_temp: number;
	min_env_humid: number;
	min_light_lux: number;
	min_light_mmol: number;
	min_soil_ec: number;
	min_soil_moist: number;
	min_temp: number;
}

export interface Plant {
	basic: Basic;
	display_pid: string;
	image: string;
	maintenance: Maintenance;
	parameter: Parameter;
	pid: string;
}

function sanitize(str: string): string {
	return str
		.replaceAll('(', '')
		.replaceAll(')', '')
		.replaceAll('.', '')
		.replaceAll(`'`, '')
		.replaceAll(`&`, '');
}

const docsFolder = path.resolve(process.cwd(), 'docs');
const imagesFolder = path.resolve(process.cwd(), 'docs', 'images');
const databaseFolder = path.resolve(process.cwd(), 'plant-database', 'json');
const files = globSync(`${databaseFolder}/*.json`).sort();
let README = `
<p align="center">
    <img src="https://user-images.githubusercontent.com/5860071/61709095-10600900-ad57-11e9-92a4-026a8fe40132.png" width="200px" border="0" />
    <br/>
    Plant database with information regarding classification, features and maintenance.
</p>

`;

for (const filePath of files) {
	const data = fs.readFileSync(filePath).toString('utf8');
	if (!data || data === 'null') {
		continue;
	}
	const obj = JSON.parse(data) as Plant;
	const key = sanitize(obj.pid);
	const name = sanitize(obj.display_pid);
	const image = obj.image.split(';base64,').pop() ?? '';
	README = `${README}
- [${name}](plants/${key}.md)`;
	fs.writeFileSync(path.resolve(imagesFolder, `${key}.png`), image, { encoding: 'base64' });
}

fs.writeFileSync(path.resolve(docsFolder, 'README.md'), README, { encoding: 'utf-8' });
