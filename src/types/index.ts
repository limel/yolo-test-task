export enum BetPositions {
	Rock = 'rock',
	Paper = 'paper',
	Scissors = 'scissors',
}

export enum GameStatus {
	Pending = 'pending',
	Start = 'start',
	End = 'end',
}

export enum GameResult {
	Win = 'win',
	Lose = 'lose',
	Draw = 'draw',
}

export interface HeaderState {
	balance: number;
	bet: number;
	win: number;
}

export interface Bet {
	value: BetPositions;
	winsAgainst: BetPositions[];
}

export interface AppState extends HeaderState {
	step: number;
	winRate: number;
	status: GameStatus;
	result: GameResult | null;
	winnerCard: BetPositions | null;
	playerBet: Bet[] | [];
	pcBet: Bet | null;
	cards: ICard[];
}

export interface ICard {
	title: string;
	color: string;
	betAmount: number;
	value: BetPositions;
	winsAgainst: BetPositions[];
	winner?: boolean;
	disabled?: boolean;
}
