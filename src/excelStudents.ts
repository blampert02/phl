import { User, UserType } from './models/user';
import Excel, { Worksheet } from 'exceljs';
import { takeRight } from 'lodash';

function areEqual(columnName: string, actualColumnName: string): boolean {
	return columnName.toLowerCase().replace(/\s/g, '') === actualColumnName.toLowerCase().replace(/\s/g, '');
}

type ColumnType =
	| 'Name'
	| 'Last Name'
	| 'Email'
	| 'Phone Number'
	| 'Branch'
	| 'Shift'
	| 'Address'
	| 'Address 2'
	| 'City'
	| 'Password'
	| 'Username'
	| 'Birthdate'
	| 'License'
	| 'Level'
	| 'Activity'
	| 'Last Time Activity';

export async function readExcelFile(buffer: Buffer, type: UserType): Promise<User[]> {
	const workbook = new Excel.Workbook();
	//For testing purposes - Do not delete
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
		readColumnValues(getColumnByType(columns, 'Branch')),
		readColumnValues(getColumnByType(columns, 'Shift')),
		readColumnValues(getColumnByType(columns, 'Address')),
		readColumnValues(getColumnByType(columns, 'Address 2')),
		readColumnValues(getColumnByType(columns, 'City')),
		readColumnValues(getColumnByType(columns, 'Password')),
		readColumnValues(getColumnByType(columns, 'Username')),
		readColumnValues(getColumnByType(columns, 'Birthdate')),
		readColumnValues(getColumnByType(columns, 'License')),
		readColumnValues(getColumnByType(columns, 'Level')),
		readColumnValues(getColumnByType(columns, 'Activity')),
		readColumnValues(getColumnByType(columns, 'Last Time Activity')),
	]);

	const nameValues = readValues[0];
	const lastNameValues = readValues[1];
	const emailValues = readValues[2];
	const phoneNumberValues = readValues[3];
	const branchValues = readValues[4];
	const shiftValues = readValues[5];
	const addressValues = readValues[6];
	const address2Values = readValues[7];
	const cityValues = readValues[8];
	const passwordValues = readValues[9];
	const usernameValues = readValues[10];
	const birthdateValues = readValues[11];
	const isActiveValues = readValues[12].map(value => value.toLowerCase() === 'true');
	const levelValues = readValues[13];
	const activityFlag = readValues[14].map(value => value.toLowerCase() === 'true');
	const lastTimeActivity = readValues[15];
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
			birthDate: birthdateValues[index],
			phoneNumber: phoneNumberValues[index],
			branch: branchValues[index],
			shift: shiftValues[index],
			address: addressValues[index],
			address2: address2Values[index],
			city: cityValues[index],
			level: levelValues[index],
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
