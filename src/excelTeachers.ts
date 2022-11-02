import { User, UserType } from './models/user';
import Excel, { Worksheet } from 'exceljs';
import path from 'path';
import { takeRight } from 'lodash';

function areEqual(columnName: string, actualColumnName: string): boolean {
	return columnName.toLowerCase().replace(/\s/g, '') === actualColumnName.toLowerCase().replace(/\s/g, '');
}

type ColumnType =
	| 'Name'
	| 'Last Name'
	| 'Email'
	| 'Phone Number'
	| 'Address'
	| 'Address 2'
	| 'Password'
	| 'Username'
	| 'License'
	| 'Inss'
	| 'Activity'
	| 'Last Time Activity';

	

export async function readExcelFile(buffer: Buffer, type: UserType): Promise<User[]> {
	const workbook = new Excel.Workbook();
	//For testing purposes 
	//const filepath = path.join(__dirname, 'Libro3.xlsx');
	//await workbook.xlsx.readFile(filepath);

	await workbook.xlsx.load(buffer);
	const worksheet = workbook.worksheets[0];
	const columns = getColumns(worksheet);

	const readValues = await Promise.all([
		readColumnValues(getColumnByType(columns, 'Name')),
		readColumnValues(getColumnByType(columns, 'Last Name')),
		readColumnValues(getColumnByType(columns, 'Email')),
		readColumnValues(getColumnByType(columns, 'Phone Number')),
		readColumnValues(getColumnByType(columns, 'Address')),
		readColumnValues(getColumnByType(columns, 'Address 2')),
		readColumnValues(getColumnByType(columns, 'Password')),
		readColumnValues(getColumnByType(columns, 'Username')),
		readColumnValues(getColumnByType(columns, 'License')),
		readColumnValues(getColumnByType(columns, 'Inss')),
		readColumnValues(getColumnByType(columns, 'Activity')),
		readColumnValues(getColumnByType(columns, 'Last Time Activity')),
	]);

	const nameValues = readValues[0];
	const lastNameValues = readValues[1];
	const emailValues = readValues[2];
	const phoneNumberValues = readValues[3];
	const addressValues = readValues[4];
	const address2Values = readValues[5];
	const passwordValues = readValues[6];
	const usernameValues = readValues[7];
	const isActiveValues = readValues[8].map(value => value.toLowerCase() === 'true');
	const inssValues = readValues[9];
	const activityFlag = readValues[10].map(value => value.toLowerCase() === 'true');
	const lastTimeActivity = readValues[11];


	const rowsLength = nameValues.length;

	let users: User[] = [];

	for (let index = 0; index < rowsLength; index++) {
		users[index] = {
			id: '-',
			type: type,
			email: emailValues[index],
			username: usernameValues[index],
			password: passwordValues[index],
			firstName: nameValues[index],
			lastName: lastNameValues[index],
			isActive: isActiveValues[index],
			phoneNumber: phoneNumberValues[index],
			address: addressValues[index],
			address2: address2Values[index],
			inss: inssValues[index],
			activityFlag: activityFlag[index],
			lastTimeActivity: lastTimeActivity[index],
		};
	}

	users = takeRight(users, users.length - 2);

	return users;
}

function getColumns(worksheet: Worksheet): Partial<Excel.Column>[] {
	return worksheet.columns.filter(column => {
		if (column.values) {
			return column.values.length > 0;
		}
		return false;
	});
}

function getColumnByType(columns: Partial<Excel.Column>[], type: ColumnType): Partial<Excel.Column> {
	const foundColumns = columns.filter(column => areEqual(getColumnName(column), type));

	if (foundColumns) {
		return foundColumns[0];
	}

	throw new Error('Something went wrong!');
}

function getColumnName(column: Partial<Excel.Column>): string {
	if (column.values) {
		const columnName: string = column.values[1]!!.toString();
		return columnName;
	}

	throw new Error('Something went wrong');
}

async function readColumnValues(column: Partial<Excel.Column>): Promise<string[]> {
	return new Promise((resolve, reject) => {
		if (column.values) {
			const values = column.values;
			const extractedValues = values.map(value => {
				if (!value) reject(`Something went wrong!`);
				if (typeof value === 'object') {
					const obj: any = value;
					if ('text' in obj) return obj.text;
					return '' + obj;
				}
				return '' + value!!.toString();
			});
			resolve(extractedValues);
		}
	});
}
