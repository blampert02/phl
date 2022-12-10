import { take, } from 'lodash';
import { Request } from 'express';

type PaginationOptions<T> = {
	page: number;
	limit: number;
	datasource: T[];
}

type PaginationResult<T> = {
	initial: number;
	pages: number;
	currentPage: number;
	startingPoint: number;
	datasource: T[]
};

export function createPagination<T>({ page, limit, datasource }: PaginationOptions<T>): PaginationResult<T> {
	const pages = Math.ceil(datasource.length / limit);
	const initial = (page * limit) - limit;
	const maxLinks=  10;

	const startIndex = (page - 1) * limit;
	const endIndex = page * limit;
	const result = datasource.slice(startIndex, endIndex);
	let startingPoint = 0;
	
	if(page < maxLinks) {
		startingPoint = 1;
	} else if(page >= pages - Math.floor(maxLinks / 2)) {
		startingPoint = pages - maxLinks + 1;
	} else if(page >= maxLinks) {
		startingPoint = page - Math.floor(maxLinks / 2);
	}

	return  {
		initial,
		pages,
		currentPage: page,
		datasource: result,
		startingPoint
	};
}

type Query = string | undefined;

export function getQuery(key: string, req: Request): Query {
	return <Query>req.query[key];
}
