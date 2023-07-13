import React from 'react';
import Header from 'components/Header';
import NoticeArea from 'components/NoticeArea';
import BetArea from 'components/BetArea';
import Card from 'components/Card';
import { handleCardClick, disableCards } from 'utils/cardUtils';
import { AppState, BetPositions, GameStatus, GameResult } from 'types';

const cards = [
	{
		title: 'Rock',
		color: '#211f4f',
		betAmount: 0,
		value: BetPositions.Rock,
		winsAgainst: [BetPositions.Scissors],
	},
	{
		title: 'Paper',
		color: '#1a381d',
		betAmount: 0,
		value: BetPositions.Paper,
		winsAgainst: [BetPositions.Rock],
	},
	{
		title: 'Scissors',
		color: '#50091e',
		betAmount: 0,
		value: BetPositions.Scissors,
		winsAgainst: [BetPositions.Paper],
	},
];

export default class App extends React.Component<object, AppState> {
	private endGameTimeout: NodeJS.Timeout | null = null;
	constructor(props: object) {
		super(props);
		this.state = {
			balance: 500,
			bet: 0,
			win: 0,
			step: 500,
			winRate: 14,
			winnerCard: null,
			status: GameStatus.Start,
			result: null,
			playerBet: [],
			pcBet: null,
			cards,
		};
	}

	getRandomCard = () => {
		const randomIndex = Math.floor(Math.random() * cards.length);
		return cards[randomIndex];
	};

	addPcBet = () => {
		const randomCard = this.getRandomCard();
		const newPcbet = {
			value: randomCard.value,
			winsAgainst: randomCard.winsAgainst,
		};
		this.setState({ pcBet: newPcbet }, this.checkWinner);
	};

	handleStartGame = () => {
		const { playerBet } = this.state;
		if (playerBet.length !== 0) {
			this.addPcBet();
			this.setState({ status: GameStatus.Pending });
		}
	};

	checkWinner = () => {
		const { playerBet, pcBet, cards } = this.state;
		const pcBetValue = pcBet?.value as BetPositions;
		const isPlayerWinner = playerBet.some(card => card.winsAgainst.includes(pcBetValue));

		if (isPlayerWinner) {
			const winnerCard = cards.find(card => card.winsAgainst.includes(pcBetValue));
			if (!winnerCard) return;
			const updatedCards = cards.map(card => (card.value === winnerCard.value ? { ...card, winner: true } : card));
			this.setState({ cards: updatedCards });
			this.handlePlayerWin();
			return;
		}
		if (!isPlayerWinner) {
			const isTie = playerBet.some(card => card.value === pcBetValue);
			if (isTie) {
				this.handleDraw();
			} else {
				this.handlePcWin();
			}
		}
	};

	getWinnerBet = () => {
		const { pcBet, cards } = this.state;
		const pcBetValue = pcBet?.value as BetPositions;
		const winnerCard = cards.find(card => card.winsAgainst.includes(pcBetValue));
		return winnerCard;
	};

	handlePlayerWin = () => {
		this.endGameTimeout = setTimeout(() => {
			this.setState(prevState => {
				const { bet, winRate } = prevState;
				const winnerBet = bet * winRate;
				return {
					...prevState,
					win: winnerBet,
					result: GameResult.Win,
					status: GameStatus.End,
				};
			});
		}, 5000);
	};

	handleDraw = () => {
		this.endGameTimeout = setTimeout(() => {
			this.setState({
				result: GameResult.Draw,
				status: GameStatus.End,
			});
		}, 5000);
	};

	handlePcWin = () => {
		this.endGameTimeout = setTimeout(() => {
			this.setState({
				result: GameResult.Lose,
				status: GameStatus.End,
			});
		}, 5000);
	};

	handleResetGame = (): void => {
		this.setState(prevState => {
			const { balance, win, result, bet } = prevState;
			const updateBalance =
				result === GameResult.Win ? balance + win : result === GameResult.Draw ? balance + bet : balance;
			const updatedCards = cards.map(card => ({ ...card, betAmount: 0 }));

			return {
				balance: updateBalance,
				bet: 0,
				win: 0,
				playerBet: [],
				status: GameStatus.Start,
				pcBet: null,
				cards: updatedCards,
			};
		}, this.handleResetGameCallback);
	};

	handleResetGameCallback = (): void => {
		if (this.endGameTimeout) {
			clearTimeout(this.endGameTimeout);
		}
		if (this.state.balance === 0) {
			this.setState(prevState => ({
				cards: disableCards(prevState),
			}));
		}
	};

	render() {
		const { balance, bet, win, cards, status, result, playerBet, pcBet } = this.state;
		const winnerCard = this.getWinnerBet();
		return (
			<>
				<Header balance={balance} bet={bet} win={win} />
				<main className="app">
					<NoticeArea
						result={result}
						playerBet={playerBet}
						winnerCard={winnerCard}
						pcBet={pcBet}
						win={win}
						status={status}
						bet={bet}
					/>
					<BetArea status={status}>
						{cards.map(card => (
							<Card
								key={card.value}
								title={card.title}
								color={card.color}
								betAmount={card.betAmount}
								winner={card?.winner}
								disabled={card?.disabled}
								onClick={() => handleCardClick(card, this.state, this.setState.bind(this))}
							/>
						))}
					</BetArea>
					{status === GameStatus.End && (
						<button className="button" onClick={() => this.handleResetGame()}>
							clear
						</button>
					)}
					{(status === GameStatus.Start || status === GameStatus.Pending) && (
						<button className="button" disabled={status === GameStatus.Pending} onClick={() => this.handleStartGame()}>
							start
						</button>
					)}
				</main>
			</>
		);
	}
}
